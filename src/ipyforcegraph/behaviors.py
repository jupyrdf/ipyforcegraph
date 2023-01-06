"""Behaviors for ipyforcegraph."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import typing

import ipywidgets as W
import traitlets as T

from ._base import Behavior


@W.register
class NodeSelection(Behavior):
    """Enable node selection with synced ids of selected nodes."""

    _model_name: str = T.Unicode("NodeSelectionModel").tag(sync=True)

    selected: typing.Tuple[int] = W.TypedTuple(
        T.Union((T.Int(), T.Unicode())),
        allow_none=True,
        help="the ids of any selected nodes",
    ).tag(sync=True)

    multiple: bool = T.Bool(True).tag(sync=True)

    selected_color: str = T.Unicode("#B3A369", help="the color of selected nodes").tag(
        sync=True
    )

    not_selected_color: str = T.Unicode(
        "#003057", help="the color of unselected nodes"
    ).tag(sync=True)


@W.register
class NodeLabels(Behavior):
    """Display node labels."""

    _model_name: str = T.Unicode("NodeLabelModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help=(
            "name of the source column to use for node labels. If ``None``, use "
            "the source's ``node_id_column``."
        ),
    ).tag(sync=True)

    default_label: str = T.Unicode(
        allow_none=True,
        help=("a fallback label if ``column_name`` doesn't exist or is empty"),
    ).tag(sync=True)
