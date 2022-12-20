import ipywidgets as W
import numpy as np
import traitlets as T
from ipydatawidgets import NDArrayWidget

from ._base import Behavior, ForceBase


@W.register
class Source(ForceBase):
    _model_name = T.Unicode("SourceModel").tag(sync=True)

    nodes: NDArrayWidget = T.Instance(NDArrayWidget).tag(
        sync=True, **W.widget_serialization
    )
    links: NDArrayWidget = T.Instance(NDArrayWidget).tag(
        sync=True, **W.widget_serialization
    )
    metadata: NDArrayWidget = T.Instance(NDArrayWidget).tag(
        sync=True, **W.widget_serialization
    )

    @T.default("nodes")
    def _default_nodes(self):
        return NDArrayWidget(np.zeros(0), dtype="int")

    @T.default("links")
    def _default_links(self):
        return NDArrayWidget(np.zeros(0), dtype="int")

    @T.default("metadata")
    def _default_metadata(self):
        return NDArrayWidget(np.zeros(0), dtype="int")


@W.register
class ForceGraph(W.DOMWidget, ForceBase):
    """Base force-directed graph widget."""

    _model_name: str = T.Unicode("ForceGraphModel").tag(sync=True)
    _view_name: str = T.Unicode("ForceGraphView").tag(sync=True)

    source: Source = T.Instance(Source, kw={}).tag(sync=True, **W.widget_serialization)
    behaviors: list[Behavior] = W.TypedTuple(T.Instance(Behavior), kw={}).tag(
        sync=True, **W.widget_serialization
    )
