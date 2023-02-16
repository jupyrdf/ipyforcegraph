"""Graph behaviors for ``ipyforcegraph``."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Dict, Optional, Tuple

import ipywidgets as W
import traitlets as T

from ..sources.dataframe import DataFrameSource
from ._base import BaseD3Force, Behavior


@W.register
class GraphImage(Behavior):
    """Captures multiple subsequent frames of a canvas, each as an :class:`~ipywidgets.widgets.widget_media.Image`."""

    _model_name: str = T.Unicode("GraphImageModel").tag(sync=True)

    capturing = T.Bool(False, help="Whether the frame capture is currently active").tag(
        sync=True
    )

    frame_count = T.Int(1, help="The number of frames to capture").tag(sync=True)

    frames: Tuple[W.Image, ...] = W.TypedTuple(
        T.Instance(W.Image),
        help="A tuple of :class:`~ipywidgets.widgets.widget_media.Image` to populate with frames of the graph.",
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
class GraphForces(Behavior):
    """Customize :class:`~ipyforcegraph.graphs.ForceGraph` force simulation.

    These also apply to :class:`~ipyforcegraph.graphs.ForceGraph3D`

    For more, see the frontend documentation on https://github.com/vasturiano/force-graph#force-engine-d3-force-configuration
    """

    _model_name: str = T.Unicode("GraphForcesModel").tag(sync=True)

    forces: Dict[str, BaseD3Force] = T.Dict(
        value_trait=T.Instance(BaseD3Force, allow_none=True),
        help="named forces. Set a name `None` to remove a force: By default, ForceGraph has `link`, `charge`, and `center`.",
    ).tag(sync=True, **W.widget_serialization)

    warmup_ticks: Optional[int] = T.Int(
        0,
        min=0,
        help="layout engine cycles to dry-run at ignition before starting to render.",
    ).tag(sync=True)

    cooldown_ticks: Optional[int] = T.Int(
        -1,
        help="frames to render before stopping and freezing the layout engine. Values less than zero will be translated to `Infinity`.",
    ).tag(sync=True)

    alpha_min: Optional[float] = T.Float(
        0.0, min=0.0, max=1.0, help="simulation alpha min parameter"
    ).tag(sync=True)

    alpha_decay: Optional[float] = T.Float(
        0.0228,
        min=0.0,
        max=1.0,
        help="simulation intensity decay parameter",
    ).tag(sync=True)

    velocity_decay: Optional[float] = T.Float(
        0.4,
        min=0.0,
        max=1.0,
        help="nodes' velocity decay that simulates the medium resistance",
    ).tag(sync=True)


@W.register
class GraphData(Behavior):
    """Captures multiple subsequent ticks of a graph simulation, each as a :class:`~pandas.DataFrame`."""

    _model_name: str = T.Unicode("GraphDataModel").tag(sync=True)

    capturing: bool = T.Bool(
        False, help="Whether the dataframe capture is currently active"
    ).tag(sync=True)

    source_count = T.Int(1, help="The number of sources to capture").tag(sync=True)

    sources: Tuple[DataFrameSource, ...] = W.TypedTuple(
        T.Instance(DataFrameSource),
        help="A tuple of :class:`~ipyforcegraph.sources.dataframe.DataFrameSource` to be populated with data of the graph.",
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
