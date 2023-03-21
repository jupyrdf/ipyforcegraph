# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from pathlib import Path

from ..sources.dodo import DodoSource

DODO = """
def task_hello():
    yield dict(name="world", actions=["echo hello"], targets=["dodo.py"])
    return dict(actions=["echo hello"], file_dep=["dodo.py"])
"""


def test_widget_source(tmp_path: Path) -> None:
    dodo = tmp_path / "dodo.py"

    dodo.write_text(DODO, encoding="utf-8")

    src = DodoSource(project_root=tmp_path)
    assert src.nodes.shape == (3, 6)
    assert src.links.shape == (2, 4)
