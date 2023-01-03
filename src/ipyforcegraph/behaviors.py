"""Behaviors for ipyforcegraph."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import ipywidgets as W
import numpy as np
import traitlets as T
from ipydatawidgets import NDArrayWidget

from ._base import Behavior


@W.register
class NodeSelection(Behavior):
    """Enable node selection with synced indices of selected nodes."""
    _model_name: str = T.Unicode("NodeSelectionModel").tag(sync=True)

    value: NDArrayWidget = T.Instance(NDArrayWidget).tag(
        sync=True, **W.widget_serialization
    )
    multiple: bool = T.Bool(True).tag(sync=True)

    @T.default("value")
    def _default_value(self):
        return NDArrayWidget(np.zeros(0), dtype="int")


@W.register
class NodeLabels(Behavior):
    """Display node """
    _model_name: str = T.Unicode("NodeSelectionModel").tag(sync=True)
    value: NDArrayWidget = T.Instance(NDArrayWidget).tag(
        sync=True, **W.widget_serialization
    )

    @T.default("value")
    def _default_value(self):
        return NDArrayWidget(np.zeros(0), dtype="object")
