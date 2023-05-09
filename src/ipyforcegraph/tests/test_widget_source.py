# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.
from typing import Any, Dict, Tuple

import ipywidgets as W
import pytest
import traitlets as T

from ipyforcegraph.behaviors import GraphForces
from ipyforcegraph.behaviors import forces as F

from ..sources.widget import WidgetSource

TDShape = Tuple[int, int]


@pytest.mark.parametrize(
    ["nodes_shape", "links_shape", "kwargs"],
    [
        ((43, 10), (43, 5), {}),
        ((7, 10), (6, 4), {"ignore_modules": ("ipywidgets", "traitlets")}),
        ((91, 10), (91, 5), {"ignore_traits": tuple()}),
    ],
)
def test_widget_source(
    kwargs: Dict[str, Any], nodes_shape: TDShape, links_shape: TDShape
) -> None:
    x = W.FloatSlider()
    y = W.FloatSlider()
    b = W.HBox([x, y])
    T.link((x, "value"), (y, "value"))
    src = WidgetSource((b,), **kwargs)
    assert (nodes_shape, links_shape) == (src.nodes.shape, src.links.shape)


def test_widget_source_user_ns() -> None:
    x = W.FloatSlider()
    _y = W.FloatSlider()
    fake_shell: Any = T.Bunch(user_ns={"x": x, "_y": _y})
    src = WidgetSource((x, _y))
    src._shell = fake_shell
    src.find_graph_data()
    assert ((36, 10), (34, 4)) == (src.nodes.shape, src.links.shape)


def test_widget_source_dict() -> None:
    gf = GraphForces(forces={"cluster": F.Cluster()})
    src = WidgetSource((gf,))
    assert ((8, 10), (7, 4)) == (src.nodes.shape, src.links.shape)
