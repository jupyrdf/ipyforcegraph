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

    source: DataFrameSource = T.Instance(DataFrameSource, kw={}).tag(
        sync=True, **W.widget_serialization
    )
    behaviors: tuple[Behavior] = W.TypedTuple(T.Instance(Behavior), kw={}).tag(
        sync=True, **W.widget_serialization
    )


@W.register
class ForceGraph3D(W.DOMWidget, ForceBase):
    """3D force-directed graph widget."""

    _model_name: str = T.Unicode("ForceGraph3DModel").tag(sync=True)
    _view_name: str = T.Unicode("ForceGraph3DView").tag(sync=True)

    source: DataFrameSource = T.Instance(DataFrameSource, kw={}).tag(
        sync=True, **W.widget_serialization
    )
    behaviors: tuple[Behavior] = W.TypedTuple(T.Instance(Behavior), kw={}).tag(
        sync=True, **W.widget_serialization
    )
