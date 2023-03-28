# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.
"""
A :class:`~ipyforcegraph.sources.dataframe.DataFrameSource` which inspects
a ``dodo.py`` and its `tasks <https://pydoit.org/tasks.html>`_.

.. note:

    Using this source requires installing `doit <pypi.org/project/doit>`_.
"""
import sys
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
from typing import Any, Dict, List
from uuid import uuid4

import pandas as P
import traitlets as T
from doit.cmd_base import ModuleTaskLoader, get_loader
from doit.cmd_list import List as ListCmd
from doit.dependency import Dependency, JsonDB, SqliteDB
from doit.task import Task

from .dataframe import DataFrameSource

TAnyDict = Dict[str, Any]
Tasks = List[Task]


class DodoSource(DataFrameSource):
    """A source that displays the files, tasks, and dependencies of a ``dodo.py``."""

    graph_data: TAnyDict = T.Dict(help="an internal collection of observed Data").tag(
        sync=False
    )

    project_root: Path = T.Union(
        [T.Unicode(), T.Instance(Path)],
        help="a path to a folder that contains a ``dodo.py``",
    ).tag(sync=False)

    backend: str = T.Unicode(
        "sqlite3", help="the backend for ``doit``'s dependency state"
    ).tag(sync=False)

    dep_file: str = T.Unicode(
        ".doit.db",
        help="the path to ``doit``'s ``dep_file``, relative to the ``project_root``",
    ).tag(sync=False)

    dodo_file: str = T.Unicode(
        "dodo.py",
        help="the path to a ``dodo.py``, relative to the ``project_root``",
    ).tag(sync=True)

    show_directories: bool = T.Bool(
        False, help="and nodes for directories, and links for containment"
    ).tag(sync=False)

    _deps: Dependency = T.Instance(Dependency, help="A doit dependency tracker").tag(
        sync=False
    )

    @T.default("nodes")
    def _default_nodes(self) -> P.DataFrame:
        return P.DataFrame(self.graph_data["nodes"].values())

    @T.default("links")
    def _default_links(self) -> P.DataFrame:
        return P.DataFrame(self.graph_data["links"].values())

    @T.default("graph_data")
    def _default_graph_data(self) -> TAnyDict:
        return self.find_graph_data()

    @T.default("_deps")
    def _default_deps(self) -> Dependency:
        backends = {"sqlite3": SqliteDB, "json": JsonDB}
        return Dependency(
            backends[self.backend], str(self.project_root / self.dep_file)
        )

    @T.validate("project_root")
    def _validate_project_root(self, proposal: Any) -> Path:
        project_root = Path(proposal.value).resolve()
        assert project_root.exists()
        return project_root

    @T.observe("show_directories")
    def _on_features_change(self, *args: Any) -> None:
        self.refresh()

    def refresh(self) -> None:
        """Refresh the nodes and links."""
        graph_data = self.find_graph_data()

        with self.hold_sync():
            self.nodes = P.DataFrame(graph_data["nodes"].values()).fillna("")
            self.links = P.DataFrame(graph_data["links"].values()).fillna("")

    def _reload_tasks(self) -> Tasks:
        old_sys_path = [*sys.path]
        mod_name = f"""__dodo__{str(uuid4()).replace("-", "_")}"""
        dodo_module = None
        try:
            sys.path += [str(self.project_root)]
            spec = spec_from_file_location(mod_name, self.project_root / self.dodo_file)
            if spec:
                dodo_module = module_from_spec(spec)

                if dodo_module is None or spec.loader is None:  # pragma: no cover
                    return []
                sys.modules[mod_name] = dodo_module
                spec.loader.exec_module(dodo_module)
        finally:
            sys.path = old_sys_path

        loader = get_loader({}, task_loader=ModuleTaskLoader(dodo_module.__dict__))
        cmd = ListCmd(loader)
        tasks: Tasks = loader.load_tasks(cmd, [])
        return tasks

    def find_graph_data(self) -> TAnyDict:
        """Find all of the nodes and links."""
        tasks = self._reload_tasks()
        graph_data: TAnyDict = {
            "nodes": {},
            "links": {},
            "tasks": {t.name: t for t in tasks},
        }
        for task in tasks:
            self.discover_one_task(task, graph_data)
        return graph_data

    def discover_one_task(self, task: Task, graph_data: TAnyDict) -> None:
        """Update nodes and links from a single ``Task``."""
        task_id = f"task:{task.name}"
        node = {
            "id": task_id,
            "type": "task",
            "name": f"{task.name}",
            "doc": task.doc or "",
            "status": self._deps.get_status(task, graph_data["tasks"].values()).status,
        }
        graph_data["nodes"][task.name] = node

        for task_dep in task.task_dep:
            task_dep_id = f"task:{task_dep}"
            link_id = f"{task_id}--has_task_dep--{task_dep_id}"
            graph_data["links"][link_id] = {
                "source": task_id,
                "target": task_dep_id,
                "type": "has_task_dep",
                "id": link_id,
            }

        for field in ["file_dep", "targets"]:
            for path in getattr(task, field):
                self.discover_one_file(path, field, task_id, graph_data)

    def discover_one_file(
        self, path_name: str, field: str, task_id: str, graph_data: TAnyDict
    ) -> None:
        """Update nodes and links for a single file referenced by a ``Task``."""
        path = Path(path_name).resolve()
        path_id = f"file:{path_name}"
        if path_id not in graph_data["nodes"]:
            is_in_project = False
            try:
                name = path.relative_to(self.project_root).as_posix()
                is_in_project = True
            except Exception:
                name = path_name
            graph_data["nodes"][path_id] = {
                "id": path_id,
                "type": "file",
                "name": name,
                "exists": path.exists(),
            }

            if is_in_project:
                self.discover_file_parents(path, path_id, graph_data)

        link_id = f"{task_id}--{field}--{path_id}"

        if field == "file_dep":
            source = path_id
            target = task_id
        elif field == "targets":
            source = task_id
            target = path_id

        graph_data["links"][link_id] = {
            "source": source,
            "target": target,
            "type": field,
            "id": link_id,
        }

    def discover_file_parents(
        self, path: Path, path_id: str, graph_data: TAnyDict
    ) -> None:
        """Discover parent paths."""
        if not self.show_directories:
            return

        parent = path.parent

        while parent != self.project_root:
            parent_id = f"folder:{parent}"

            if parent_id not in graph_data["nodes"]:
                name = Path(parent).relative_to(self.project_root).as_posix()
                graph_data["nodes"][parent_id] = {
                    "id": parent_id,
                    "type": "directory",
                    "name": name,
                    "exists": path.exists(),
                }

            link_id = f"{parent_id}--contains--{path_id}"
            graph_data["links"][link_id] = {
                "source": parent_id,
                "target": path_id,
                "type": "contains",
                "id": link_id,
            }
            parent = parent.parent
            path_id = parent_id
