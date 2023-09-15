"""Force-directed graph widgets."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import TYPE_CHECKING, Any, Tuple

import ipywidgets as W
import traitlets as T

from ._base import ForceBase
from .behaviors import Behavior
from .behaviors._base import _make_trait
from .sources.dataframe import DataFrameSource

if TYPE_CHECKING:
    from . import _types as _t


@W.register
class ForceGraph(W.DOMWidget, ForceBase):
    """Base force-directed graph widget."""

    _model_name: "_t.Tstr" = T.Unicode("ForceGraphModel").tag(sync=True)
    _view_name: "_t.Tstr" = T.Unicode("ForceGraphView").tag(sync=True)

    source: "T.Instance[DataFrameSource]" = T.Instance(
        DataFrameSource, kw={}, help="the source of ``node`` and ``link`` data"
    ).tag(sync=True, **W.widget_serialization)

    behaviors: "Tuple[Behavior, ...]" = W.TypedTuple(
        T.Instance(Behavior),
        kw={},
        help=(
            "the behaviors that provide functionality for "
            ":mod:`~ipyforcegraph.behaviors.selection`, "
            "changing the node and link :mod:`~ipyforcegraph.behaviors.shapes`, "
            "changing the on-hover :mod:`~ipyforcegraph.behaviors.tooltip` for nodes and links, "
            "the :mod:`~ipyforcegraph.behaviors.forces` graph layout, "
            ":mod:`~ipyforcegraph.behaviors.recording` of the graph state, and the "
            ":mod:`~ipyforcegraph.behaviors.particles` on the links."
        ),
    ).tag(sync=True, **W.widget_serialization)

    default_node_color: "_t.Tstr" = T.Unicode(
        "rgba(31, 120, 179, 1.0)",
        help="a default ``node`` color, which can be overridden by :class:`~ipyforcegraph.behaviors.shapes.NodeShapes`",
    ).tag(sync=True)

    default_node_size: "_t.Tfloat" = T.Float(
        1,
        help="a default ``node`` size, which can be overridden by :class:`~ipyforcegraph.behaviors.shapes.NodeShapes`",
    ).tag(sync=True)

    default_link_color: "_t.Tstr" = T.Unicode(
        "rgba(66, 66, 66, 0.5)",
        help="a default ``link`` color, which can be overridden by :class:`~ipyforcegraph.behaviors.shapes.LinkShapes`",
    ).tag(sync=True)

    default_link_width: "_t.Tfloat" = T.Float(
        1.0,
        help="a default ``link`` width, which can be overridden by :class:`~ipyforcegraph.behaviors.shapes.LinkShapes`",
    ).tag(sync=True)

    background_color: Any = _make_trait(
        "the graph background color",
        default_value="rgba(0, 0, 0, 0.0)",
        boolish=False,
        by_wrapper=True,
        numeric=False,
    )

    def reheat(self) -> None:
        """Send the reheat command to restart the force simulation"""
        self.send({"action": "reheat"})


@W.register
class ForceGraph3D(ForceGraph):
    """3D force-directed graph widget."""

    _model_name: "_t.Tstr" = T.Unicode("ForceGraph3DModel").tag(sync=True)
    _view_name: "_t.Tstr" = T.Unicode("ForceGraph3DView").tag(sync=True)
