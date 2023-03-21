# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.
import sys
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
from typing import Any, Dict, List, Type
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
    project_root: Path = T.Union([T.Unicode(), T.Instance(Path)]).tag(sync=False)
    backend: str = T.Unicode("sqlite3").tag(sync=False)
    graph_data: TAnyDict = T.Dict(help="an internal collection of observed Data").tag(
        sync=False
    )
    _deps: Dependency = T.Instance(Dependency).tag(sync=False)
    BACKENDS: Dict[str, Type[object]] = {"sqlite3": SqliteDB, "json": JsonDB}

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
        return Dependency(
            self.BACKENDS[self.backend], str(self.project_root / ".doit.db")
        )

    @T.validate("project_root")
    def _validate_project_root(self, proposal: Any) -> Path:
        return Path(proposal.value).resolve()

    def refresh(self) -> None:
        graph_data = self.find_graph_data()

        with self.hold_sync():
            self.nodes = P.DataFrame(graph_data["nodes"].values())
            self.links = P.DataFrame(graph_data["links"].values())

    def _reload_tasks(self) -> Tasks:
        old_sys_path = [*sys.path]
        mod_name = f"""__dodo__{str(uuid4()).replace("-","_")}"""
        dodo_module = None
        try:
            sys.path += [str(self.project_root)]
            spec = spec_from_file_location(mod_name, self.project_root / "dodo.py")
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
        task_id = f"task:{task.name}"
        node = {
            "id": task_id,
            "type": "task",
            "name": f"{task.name}",
            "doc": task.doc or "",
            "status": self._deps.get_status(task, graph_data["tasks"].values()).status,
        }
        graph_data["nodes"][task.name] = node
        subtask_of = task.subtask_of
        if subtask_of:
            subtask_of_id = f"task:{subtask_of}"
            link_id = f"{task_id}--subtask--{subtask_of_id}"
            graph_data["links"][link_id] = {
                "source": task_id,
                "target": subtask_of_id,
                "type": "subtask",
                "id": link_id,
            }
        for field in ["file_dep", "targets"]:
            for path in getattr(task, field):
                self.discover_one_file(path, field, task_id, graph_data)

    def discover_one_file(
        self, path: Path, field: str, task_id: str, graph_data: TAnyDict
    ) -> None:
        path_id = f"file:{path}"
        if path_id not in graph_data["nodes"]:
            try:
                name = Path(path).relative_to(self.project_root).as_posix()
            except Exception:
                name = str(path)
            graph_data["nodes"][path_id] = {
                "id": path_id,
                "type": "file",
                "name": name,
                "exists": Path(path).exists(),
            }
        link_id = f"{task_id}--{field}--{path_id}"
        graph_data["links"][link_id] = {
            "source": task_id,
            "target": path_id,
            "type": field,
            "id": link_id,
        }
