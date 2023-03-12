"""Behaviors for recording the state of the ``ipyforcegraph`` graphs."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Tuple

import ipywidgets as W
import traitlets as T

from ..sources.dataframe import DataFrameSource
from ._base import Behavior


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
        help="a tuple of :class:`~ipywidgets.widgets.widget_media.Image` to populate with frames of the graph.",
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
        help="a tuple of :class:`~ipyforcegraph.sources.dataframe.DataFrameSource` to be populated with data of the graph.",
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
