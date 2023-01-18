"""Force-directed graph widgets."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

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
    behaviors: tuple[Behavior] = W.TypedTuple(
        T.Instance(Behavior),
        kw={},
        help="the behaviors that modify the appearance of nodes, links and the graph itself",
    ).tag(sync=True, **W.widget_serialization)

    default_node_color: str = T.Unicode(
        "#1f78b3", help="a default node color, which can be overriden by `NodeColors`"
    ).tag(sync=True)
    default_link_color: str = T.Unicode(
        "#666666", help="a default link color, which can be overriden by `LinkColors`"
    ).tag(sync=True)


@W.register
class ForceGraph3D(ForceGraph):
    """3D force-directed graph widget."""

    _model_name: str = T.Unicode("ForceGraph3DModel").tag(sync=True)
    _view_name: str = T.Unicode("ForceGraph3DView").tag(sync=True)
