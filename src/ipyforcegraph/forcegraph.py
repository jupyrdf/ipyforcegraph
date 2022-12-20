import ipywidgets as W
import traitlets as T

import numpy as np
from ipydatawidgets import NDArrayWidget

from .constants import EXTENSION_NAME, EXTENSION_SPEC_VERSION


class BaseWidget(W.Widget):
    _model_module = T.Unicode(EXTENSION_NAME).tag(sync=True)
    _model_module_version = T.Unicode(EXTENSION_SPEC_VERSION).tag(sync=True)
    _view_module = T.Unicode(EXTENSION_NAME).tag(sync=True)
    _view_module_version = T.Unicode(EXTENSION_SPEC_VERSION).tag(sync=True)

@W.register
class Source(BaseWidget):
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
class ForceGraph(W.DOMWidget, BaseWidget):
    """Forcegraph widget.

    Attributes
    ----------
    source: TODO
    """

    _model_name = T.Unicode("ForceGraphModel").tag(sync=True)
    _view_name = T.Unicode("ForceGraphView").tag(sync=True)

    source: Source = T.Instance(Source, kw={}).tag(sync=True, **W.widget_serialization)

