"""Node behaviors for ``ipyforcegraph``."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Any, Optional, Sequence, Tuple, Union

import ipywidgets as W
import traitlets as T

from ._base import Behavior, ShapeBase


@W.register
class NodeSelection(Behavior):
    """Enable node selection with synced ids of selected nodes."""

    _model_name: str = T.Unicode("NodeSelectionModel").tag(sync=True)

    selected: Tuple[Union[int, str], ...] = W.TypedTuple(
        T.Union((T.Int(), T.Unicode())),
        allow_none=True,
        help="the ids of any selected nodes",
    ).tag(sync=True)

    multiple: bool = T.Bool(True).tag(sync=True)

    selected_color: str = T.Unicode(
        "rgba(179, 163, 105, 1.0)",
        help="the color of selected nodes",
    ).tag(sync=True)


@W.register
class NodeLabels(Behavior):
    """Display node labels on hover.

    These may be strings or full HTML.
    """

    _model_name: str = T.Unicode("NodeLabelModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help=(
            "name of the source column to use for node labels. If `None`, use "
            "the source's `node_id_column`."
        ),
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate node labels",
    ).tag(sync=True)


@W.register
class NodeSizes(Behavior):
    """Change the size of nodes by template or column."""

    _model_name: str = T.Unicode("NodeSizeModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help="name of the source column to use for node sizes.",
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate node sizes",
    ).tag(sync=True)


@W.register
class NodeColors(Behavior):
    """Change the colors of nodes by template or column."""

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
class NodeShapes(Behavior):
    """Change the shape of nodes using declarative statements."""

    _model_name: str = T.Unicode("NodeShapeModel").tag(sync=True)

    shapes: Tuple[ShapeBase] = W.TypedTuple(
        T.Instance(ShapeBase),
        help="the shapes to draw for each ``node``",
    ).tag(sync=True, **W.widget_serialization)

    def __init__(self, *shapes: Union[Sequence[ShapeBase], ShapeBase], **kwargs: Any):
        if len(shapes) == 1 and isinstance(shapes, list):
            shapes = shapes[0]
        kwargs["shapes"] = shapes
        super().__init__(**kwargs)
