"""Behaviors for controlling particles traveling over ``ipyforcegraph`` links."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Any, Optional

import ipywidgets as W
import traitlets as T

from ..trait_utils import JSON_TYPES, coerce
from ._base import Behavior, TFeature, TNumFeature, _make_trait


@W.register
class LinkParticles(Behavior):
    """Customize the animated particles on links.

    .. note::
       The ``speed`` should be between ``0.0``, stationary, and ``~0.1``,
       or they will exceed the frame rate of the animation.
    """

    DEFAULT_SPEED = 0.1

    _model_name: str = T.Unicode("LinkParticleModel").tag(sync=True)

    color: TFeature = _make_trait("the color of the particles")
    density: TNumFeature = _make_trait(
        "the number of particles, ideally 0.0 < ``value``", numeric=True
    )
    speed: Optional[TNumFeature] = _make_trait(
        "the speed of the particles, ideally 0.0 < ``value`` < ~0.1",
        numeric=True,
        default_value=DEFAULT_SPEED,
    )
    width: TNumFeature = _make_trait(
        "the size of the particles, ideally 0.0 < ``value`` < ~5", numeric=True
    )

    def __init__(self, *args: Any, **kwargs: Any):
        super().__init__(*args, **kwargs)
        self._original_speed: TNumFeature = None

    def emit(self, *links: int) -> None:
        """Emit particles over a series of links"""
        for link in links:
            self.send({"action": "emitParticles", "link": link})

    def stop(self) -> None:
        """Stop emitting particles."""
        self._original_speed = self.speed or self._original_speed or self.DEFAULT_SPEED
        self.speed = 0

    def start(self) -> None:
        """Start emitting particles."""
        self.speed = self.speed or self._original_speed
        self.density = self.density or 1
        self._original_speed = None

    @T.validate("density", "speed", "width")
    def _validate_particle_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)
