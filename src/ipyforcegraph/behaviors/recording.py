"""Behaviors for recording the state of the ``ipyforcegraph`` graphs."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Any, Optional, Tuple

import ipywidgets as W
import traitlets as T

from ..sources.dataframe import DataFrameSource
from ..trait_utils import JSON_TYPES, coerce
from ._base import Behavior, TFeature, _make_trait


@W.register
class GraphImage(Behavior):
    """Captures multiple subsequent frames of a canvas, each as an :class:`~ipywidgets.widgets.widget_media.Image`."""

    _model_name: str = T.Unicode("GraphImageModel").tag(sync=True)

    capturing = T.Bool(False, help="whether the frame capture is currently active").tag(
        sync=True
    )

    frame_count = T.Int(1, help="the number of frames to capture").tag(sync=True)

    frames: Tuple[W.Image, ...] = W.TypedTuple(
        T.Instance(W.Image),
        help="a tuple of :class:`~ipywidgets.widgets.widget_media.Image` to populate with frames of the graph",
    ).tag(sync=True, **W.widget_serialization)

    def _get_frames(self) -> Tuple[W.Image, ...]:
        return tuple(
            [W.Image(description=f"frame {i}") for i in range(self.frame_count)]
        )

    @T.default("frames")
    def _default_frames(self) -> Tuple[W.Image, ...]:
        return self._get_frames()

    @T.observe("frame_count")
    def _on_frame_count(self, change: T.Bunch) -> None:
        frames = self.frames

        self.frames = tuple()

        for frame in frames:
            frame.close()

        self.frames = self._get_frames()


@W.register
class GraphData(Behavior):
    """Captures multiple subsequent ticks of a graph simulation, each as a :class:`~pandas.DataFrame`."""

    _model_name: str = T.Unicode("GraphDataModel").tag(sync=True)

    capturing: bool = T.Bool(
        False, help="whether the dataframe capture is currently active"
    ).tag(sync=True)

    source_count = T.Int(1, help="the number of sources to capture").tag(sync=True)

    sources: Tuple[DataFrameSource, ...] = W.TypedTuple(
        T.Instance(DataFrameSource),
        help="a tuple of :class:`~ipyforcegraph.sources.dataframe.DataFrameSource` to be populated with data of the graph",
    ).tag(sync=True, **W.widget_serialization)

    def _get_sources(self) -> Tuple[DataFrameSource, ...]:
        return tuple([DataFrameSource() for i in range(self.source_count)])

    @T.default("sources")
    def _default_sources(self) -> Tuple[DataFrameSource, ...]:
        return self._get_sources()

    @T.observe("source_count")
    def _on_source_count(self, change: T.Bunch) -> None:
        sources = self.sources

        self.sources = tuple()

        for source in sources:
            source.close()

        self.sources = self._get_sources()


@W.register
class GraphCamera(Behavior):
    """Captures the current center and zoom of the graph viewport."""

    _model_name: str = T.Unicode("GraphCameraModel").tag(sync=True)

    zoom: float = T.Float(
        None, allow_none=True, help="the current zoom level of the viewport"
    ).tag(sync=True)

    center: Tuple[float, ...] = W.TypedTuple(
        T.Float(), allow_none=True, help="the center of the viewport as `[x, y, z?]`"
    ).tag(sync=True)


@W.register
class GraphDirector(Behavior):
    """Set a desired center and zoom of the graph viewport."""

    _model_name: str = T.Unicode("GraphDirectorModel").tag(sync=True)

    zoom: Optional[float] = T.Float(
        None, allow_none=True, help="the desired zoom level of the viewport"
    ).tag(sync=True)

    center: Optional[Tuple[float, ...]] = W.TypedTuple(
        T.Float(),
        allow_none=True,
        help="the desired center of the viewport as `[x, y, z?]`",
    ).tag(sync=True)

    zoom_first: bool = T.Bool(
        False, help="whether to apply zoom the viewport before panning"
    ).tag(sync=True)

    fit_nodes: TFeature = _make_trait(
        "fit nodes in viewport for which this column/template is truthy",
        by_template=True,
        by_column=True,
    )

    fit_padding: float = T.Float(
        10, help="pixels of padding between nodes and viewport"
    ).tag(sync=True)

    zoom_duration: float = T.Float(0.2, help="seconds to animate a zoom").tag(sync=True)

    pan_duration: float = T.Float(0.2, help="seconds to animate a pan").tag(sync=True)

    fit_duration: float = T.Float(0.2, help="seconds to animate a fit").tag(sync=True)

    @T.validate("fit_nodes")
    def _validate_scale_bools(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.boolean)
