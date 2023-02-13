"""Force-directed graph widgets."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Tuple

import ipywidgets as W
import traitlets as T

from ._base import Behavior, ForceBase
from .sources.dataframe import DataFrameSource


@W.register
class ForceGraph(W.DOMWidget, ForceBase):
    """Base force-directed graph widget."""

    _model_name: str = T.Unicode("ForceGraphModel").tag(sync=True)
    _view_name: str = T.Unicode("ForceGraphView").tag(sync=True)

    source: DataFrameSource = T.Instance(
        DataFrameSource, kw={}, help="the source of `nodes` and `link` data"
    ).tag(sync=True, **W.widget_serialization)

    behaviors: Tuple[Behavior, ...] = W.TypedTuple(
        T.Instance(Behavior),
        kw={},
        help="the behaviors that modify the appearance of nodes, links and the graph itself",
    ).tag(sync=True, **W.widget_serialization)

    default_node_color: str = T.Unicode(
        "rgba(31, 120, 179, 1.0)",
        help="a default node color, which can be overridden by :class:`~ipyforcegraph.behaviors.NodeColors`.",
    ).tag(sync=True)

    default_link_color: str = T.Unicode(
        "rgba(66, 66, 66, 0.5)",
        help="a default link color, which can be overridden by :class:`~ipyforcegraph.behaviors.LinkColors`",
    ).tag(sync=True)

    default_link_width: str = T.Float(
        1.0,
        help="a default link width, which can be overridden by :class:`~ipyforcegraph.behaviors.LinkWidths`",
    ).tag(sync=True)

    background_color: str = T.Unicode(
        "rgba(0, 0, 0, 0.0)", help="the graph background color"
    ).tag(sync=True)


@W.register
class ForceGraph3D(ForceGraph):
    """3D force-directed graph widget."""

    _model_name: str = T.Unicode("ForceGraph3DModel").tag(sync=True)
    _view_name: str = T.Unicode("ForceGraph3DView").tag(sync=True)
