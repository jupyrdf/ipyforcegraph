"""Behaviors for ipyforcegraph."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import typing
from typing import Optional

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

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate node labels",
    ).tag(sync=True)


@W.register
class NodeColors(Behavior):
    _model_name: str = T.Unicode("NodeColorModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help="name of the source column to use for node colors.",
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate colors",
    ).tag(sync=True)


@W.register
class LinkColors(Behavior):
    _model_name: str = T.Unicode("LinkColorModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help="name of the source column to use for link colors.",
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate link colors",
    ).tag(sync=True)


@W.register
class LinkLabels(Behavior):
    _model_name: str = T.Unicode("LinkLabelModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help="name of the source column to use for link labels.",
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate link labels",
    ).tag(sync=True)
