"""Configurable shapes for ``ipyforcegraph`` nodes."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.
from __future__ import annotations

from typing import TYPE_CHECKING, Any, Optional, Sequence, Tuple, Union

import ipywidgets as W
import traitlets as T

from ..trait_utils import JSON_TYPES, coerce
from ._base import (
    DEFAULT_RANK,
    Behavior,
    HasDimensions,
    HasFillAndStroke,
    HasOffsets,
    ShapeBase,
    _make_trait,
)

if TYPE_CHECKING:
    from .. import _types as _t

    # imports needed for docs
    from ._base import Column, Nunjucks, TFeature, TNumFeature  # noqa


@W.register
class Text(HasFillAndStroke, HasOffsets):
    """Draw a text shape, with an optional background.

    If the ``text`` trait is (or evaluates to) ``0`` or ``None``, no shape will be drawn.
    """

    _model_name: "_t.Tstr" = T.Unicode("TextShapeModel").tag(sync=True)

    text: "TFeature" = _make_trait("the text of a shape")
    font: "TFeature" = _make_trait("the font face of a shape")
    size: "TNumFeature" = _make_trait(
        "the visible font size of text in ``px``", numeric=True
    )
    size_pixels: "TNumFeature" = _make_trait(
        "the rendered size of text in ``px``. 3D only.", numeric=True
    )
    background: "TFeature" = _make_trait("the background fill color of a shape")
    padding: "TNumFeature" = _make_trait(
        "the padding around the shape in ``px``", numeric=True
    )

    def __init__(self, text: "Optional[TFeature]" = None, **kwargs: Any):
        if text is not None:
            kwargs["text"] = text
        super().__init__(**kwargs)

    @T.validate("size", "padding", "size_pixels")
    def _validate_text_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)


@W.register
class Ellipse(HasDimensions):
    """Draw an ellipse shape.

    If the ``width`` trait is (or evaluates to) ``0`` or ``None``, no shape will be drawn.
    """

    _model_name: "_t.Tstr" = T.Unicode("EllipseShapeModel").tag(sync=True)


@W.register
class Rectangle(HasDimensions):
    """Draw a rectangle shape.

    If the ``width`` trait is (or evaluates to) ``0`` or ``None``, no shape will be drawn.
    """

    _model_name: "_t.Tstr" = T.Unicode("RectangleShapeModel").tag(sync=True)


@W.register
class NodeShapes(Behavior):
    """Change the shape of nodes using declarative statements.

    The ``color`` and ``size`` traits affect the default circle, and compose
    with :class:`~ipyforcegraph.behaviors.selection.NodeSelection`.

    If non-empty, custom ``shapes`` will override the simple ``size`` and
    ``color``, and will require custom handling with ``column_name`` to reflect
    user selection.
    """

    _model_name: "_t.Tstr" = T.Unicode("NodeShapeModel").tag(sync=True)

    size: "TFeature" = _make_trait("the size of the default circle shape", numeric=True)
    color: "TFeature" = _make_trait("the color of the default circle shape")
    shapes: Tuple[ShapeBase] = W.TypedTuple(
        T.Instance(ShapeBase),
        help="the shapes to draw for each ``node``",
    ).tag(sync=True, **W.widget_serialization)

    def __init__(self, *shapes: Union[Sequence[ShapeBase], ShapeBase], **kwargs: Any):
        if len(shapes) == 1 and isinstance(shapes, list):
            shapes = shapes[0]
        kwargs["shapes"] = shapes
        super().__init__(**kwargs)

    @T.default("rank")
    def _default_rank(self) -> Optional[int]:
        return DEFAULT_RANK.shapes

    @T.validate("size")
    def _validate_node_shape_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)


@W.register
class LinkShapes(Behavior):
    """
    Customize the shape of the ``links``.

    Custom ``shapes`` will be drawn on top of default lines, and may not
    interact predictably with ``curvature``.

    .. note::
        ``line_dash`` is not displayed in :class:`~ipyforcegraph.graphs.ForceGraph3D`.
    """

    _model_name: "_t.Tstr" = T.Unicode("LinkShapeModel").tag(sync=True)

    color: "TFeature" = _make_trait("the color of the link")
    curvature: "TNumFeature" = _make_trait(
        "the curvature of the link, 0: straight, 1: circular", numeric=True
    )
    line_dash: "TFeature" = _make_trait(
        "the dash line pattern of the link, e.g., [2, 1] for ``-- -- --``",
        stringy=False,
        by_column=False,
    )
    width: "TNumFeature" = _make_trait("the width of the link", numeric=True)

    shapes: Tuple[ShapeBase] = W.TypedTuple(
        T.Instance(ShapeBase),
        help="the shapes to draw for each ``link``",
    ).tag(sync=True, **W.widget_serialization)

    def __init__(self, *shapes: Union[Sequence[ShapeBase], ShapeBase], **kwargs: Any):
        if len(shapes) == 1 and isinstance(shapes, list):
            shapes = shapes[0]
        kwargs["shapes"] = shapes
        super().__init__(**kwargs)

    @T.default("rank")
    def _default_rank(self) -> Optional[int]:
        return DEFAULT_RANK.shapes

    @T.validate("curvature", "width")
    def _validate_link_shape_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)

    @T.validate("line_dash")
    def _validate_link_shape_arrays(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.array)


@W.register
class LinkArrows(Behavior):
    """Customize the size, position, and color of arrows on ``links``."""

    _model_name: "_t.Tstr" = T.Unicode("LinkArrowModel").tag(sync=True)

    color: "TFeature" = _make_trait("the color of the arrow")
    length: "TNumFeature" = _make_trait("the length of the arrow", numeric=True)
    relative_position: "TNumFeature" = _make_trait(
        "the relative position of the arrow along the link, 0.0: ``source`` end, 1.0: ``target`` end",
        numeric=True,
    )

    @T.validate("length", "relative_position")
    def _validate_arrow_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)
