import ipywidgets as W
import numpy as np
import traitlets as T
from ipydatawidgets import NDArrayWidget

from ._base import Behavior


@W.register
class NodeSelection(Behavior):
    _model_name: str = T.Unicode("NodeSelectionModel").tag(sync=True)

    value: NDArrayWidget = T.Instance(NDArrayWidget).tag(
        sync=True, **W.widget_serialization
    )
    multiple: bool = T.Bool(True).tag(sync=True)

    @T.default("value")
    def _default_value(self):
        return NDArrayWidget(np.zeros(0), dtype="int")
