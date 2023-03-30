# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import os
from pathlib import Path
from pprint import pprint
from typing import Any, Dict, Generator, Tuple

import pytest

from ..sources.dodo import DodoSource

DODO = """
def task_hello():
    yield dict(
        name="hello",
        actions=[
            "mdkir -p build || md build || exit 0",
            "echo hello > build/foo.txt"
        ],
        file_dep=["dodo.py"],
        targets=["./build/foo.txt"],
    )
    yield dict(
        name="world",
        actions=["cat build/foo.txt || type build/foo.txt"],
        file_dep=["./build/foo.txt"],
    )
    return dict(actions=["echo hello > ../bar.txt"], targets=["../bar.txt"])
"""

TDShape = Tuple[int, int]
TDShapes = Tuple[TDShape, TDShape]


@pytest.fixture
def a_dodo_project(tmp_path: Path) -> Generator[Path, None, None]:
    old_pwd = str(Path.cwd())
    project = tmp_path / "tmp-project"
    project.mkdir()
    dodo = project / "dodo.py"

    dodo.write_text(DODO, encoding="utf-8")
    os.chdir(str(project))
    yield project
    os.chdir(old_pwd)


@pytest.mark.parametrize(
    ["shapes", "kwargs"],
    [
        (((5, 6), (5, 4)), {}),
        (((6, 7), (6, 4)), {"show_files": False}),
        (((6, 6), (6, 4)), {"show_directories": True}),
    ],
)
def test_widget_source(
    a_dodo_project: Path, shapes: TDShapes, kwargs: Dict[str, Any]
) -> None:
    src = DodoSource(project_root=a_dodo_project, **kwargs)
    assert shapes == (src.nodes.shape, src.links.shape)
    src.refresh()
    assert shapes == (src.nodes.shape, src.links.shape)
    pprint(src.nodes.to_dict(orient="records"))
    pprint(src.links.to_dict(orient="records"))
