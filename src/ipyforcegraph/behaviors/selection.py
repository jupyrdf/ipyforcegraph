"""Selection behaviors for ``ipyforcegraph`` nodes and links."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Optional, Tuple, Union

import ipywidgets as W
import traitlets as T

from ._base import Behavior


@W.register
class NodeSelection(Behavior):
    """Enable node selection with synced row `indices` (not ``id``) of selected
    ``nodes``."""

    _model_name: str = T.Unicode("NodeSelectionModel").tag(sync=True)

    selected: Tuple[Union[int, str], ...] = W.TypedTuple(
        T.Union((T.Int(), T.Unicode())),
        allow_none=True,
        help="the row indices of any selected nodes",
    ).tag(sync=True)

    column_name: Optional[str] = T.Unicode(
        None,
        help="an optional name of a ``node``'s column to update when selected",
        allow_none=True,
    ).tag(sync=True)

    multiple: bool = T.Bool(
        True, help="if ``False``, only one ``node`` can be selected at a time"
    ).tag(sync=True)

    selected_color: str = T.Unicode(
        "rgba(179, 163, 105, 1.0)",
        help="the color of selected nodes",
    ).tag(sync=True)


@W.register
class LinkSelection(Behavior):
    """Enable link selection with synced ids of selected links."""

    _model_name: str = T.Unicode("LinkSelectionModel").tag(sync=True)

    selected: Tuple[Union[int, str], ...] = W.TypedTuple(
        T.Union((T.Int(), T.Unicode())),
        allow_none=True,
        help="the 0-based indices of any selected links",
    ).tag(sync=True)

    column_name: Optional[str] = T.Unicode(
        None,
        help="an optional name of ``node``'s column to update when selected",
        allow_none=True,
    ).tag(sync=True)

    multiple: bool = T.Bool(
        True, help="if ``False``, only one ``link`` can be selected at a time"
    ).tag(sync=True)

    selected_color: str = T.Unicode(
        "rgba(31, 120, 179, 1.0)", help="the color of selected links"
    ).tag(sync=True)

    selected_curvature: float = T.Float(
        None,
        allow_none=True,
        help="the curvature of selected links, default: None which keeps it same as unselected.",
    ).tag(sync=True)

    selected_line_dash: Tuple[float] = W.TypedTuple(
        T.Float(),
        help="the line-dash of selected links, default: no dashes",
    ).tag(sync=True)

    selected_width: float = T.Float(2, help="the width of selected links").tag(
        sync=True
    )
