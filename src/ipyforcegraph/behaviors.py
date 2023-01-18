"""Behaviors for ``ipyforcegraph``."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Optional, Tuple

import ipywidgets as W
import traitlets as T

from ._base import Behavior


@W.register
class GraphImage(Behavior):
    _model_name: str = T.Unicode("GraphImageModel").tag(sync=True)

    capturing = T.Bool(False, help="Whether the frame capture is currently active").tag(
        sync=True
    )

    frame_count = T.Int(1, help="The number of frames to capture").tag(sync=True)

    frames: Tuple[W.Image] = W.TypedTuple(
        T.Instance(W.Image),
        help="A tuple of `ipywidgets.Image`s to be populated with frames of the graph.",
    ).tag(sync=True, **W.widget_serialization)

    def _get_frames(self):
        return [W.Image(description=f"frame {i}") for i in range(self.frame_count)]

    @T.default("frames")
    def _default_frames(self):
        return self._get_frames()

    @T.observe("frame_count")
    def _on_frame_count(self, change: T.Bunch):
        frames = self.frames

        self.frames = []

        for frame in frames:
            frame.close()

        self.frames = self._get_frames()


@W.register
class NodeSelection(Behavior):
    """Enable node selection with synced ids of selected nodes."""

    _model_name: str = T.Unicode("NodeSelectionModel").tag(sync=True)

    selected: Tuple[int] = W.TypedTuple(
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


@W.register
class LinkDirectionalArrowColor(Behavior):
    _model_name: str = T.Unicode("LinkDirectionalArrowColorModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help="name of the source column to use for link directional arrow color.",
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate link directional arrow color",
    ).tag(sync=True)


@W.register
class LinkDirectionalArrowLength(Behavior):
    _model_name: str = T.Unicode("LinkDirectionalArrowLengthModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help="name of the source column to use for link directional arrow length.",
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate link directional arrow length",
    ).tag(sync=True)


@W.register
class LinkDirectionalArrowRelPos(Behavior):
    _model_name: str = T.Unicode("LinkDirectionalArrowRelPosModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help="name of the source column to use for link directional arrow relative position.",
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate link directional arrow relative position",
    ).tag(sync=True)


@W.register
class LinkDirectionalParticleColor(Behavior):
    _model_name: str = T.Unicode("LinkDirectionalParticleColorModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help="name of the source column to use for link directional particle color.",
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate link directional particle color",
    ).tag(sync=True)


@W.register
class LinkDirectionalParticleSpeed(Behavior):
    _model_name: str = T.Unicode("LinkDirectionalParticleSpeedModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help="name of the source column to use for link directional particle speed.",
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate link directional particle speed",
    ).tag(sync=True)


@W.register
class LinkDirectionalParticleWidth(Behavior):
    _model_name: str = T.Unicode("LinkDirectionalParticleWidthModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help="name of the source column to use for link directional particle width.",
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate link directional particle width",
    ).tag(sync=True)


@W.register
class LinkDirectionalParticles(Behavior):
    _model_name: str = T.Unicode("LinkDirectionalParticlesModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help="name of the source column to use for link directional particles.",
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate link directional particles",
    ).tag(sync=True)
