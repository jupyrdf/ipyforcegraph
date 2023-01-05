"""Behaviors for ipyforcegraph."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import typing

import ipywidgets as W
import traitlets as T

from ._base import Behavior


@W.register
class NodeSelection(Behavior):
    """Enable node selection with synced indices of selected nodes."""

    _model_name: str = T.Unicode("NodeSelectionModel").tag(sync=True)

    selected: typing.Tuple[int] = W.TypedTuple(T.Int).tag(sync=True)
    selected_color: str = T.Unicode("#B3A369").tag(sync=True)
    not_selected_color: str = T.Unicode("#003057").tag(sync=True)
    multiple: bool = T.Bool(True).tag(sync=True)


@W.register
class NodeLabels(Behavior):
    """Display node labels."""

    _model_name: str = T.Unicode("NodeLabelModel").tag(sync=True)

    column_name: str = T.Unicode(
        "label", help="name of the source column to use for labels"
    ).tag(sync=True)
