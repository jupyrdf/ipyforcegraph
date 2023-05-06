"""Behaviors for controlling particles traveling over ``ipyforcegraph`` links."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from time import sleep
from typing import Any, Optional

import ipywidgets as W
import traitlets as T

from ..trait_utils import JSON_TYPES, coerce
from ._base import Behavior, Nunjucks, TFeature, TNumFeature, _make_trait


@W.register
class LinkParticles(Behavior):
    """Customize the animated particles on links.

    .. note::
       The ``speed`` should be between ``0.0``, stationary, and ``~0.1``,
       or they will exceed the frame rate of the animation.
    """

    DEFAULT_SPEED = 0.02

    _model_name: str = T.Unicode("LinkParticleModel").tag(sync=True)

    color: TFeature = _make_trait("the color of the particles", default_value="black")
    density: TNumFeature = _make_trait(
        "the number of particles, ideally 0.0 < ``value``",
        numeric=True,
        default_value=1,
    )
    speed: Optional[TNumFeature] = _make_trait(
        "the speed of the particles, ideally 0.0 < ``value`` < ~0.1",
        numeric=True,
        default_value=DEFAULT_SPEED,
    )
    width: TNumFeature = _make_trait(
        "the size of the particles, ideally 0.0 < ``value`` < ~5",
        numeric=True,
        default_value=3,
    )

    def __init__(self, *args: Any, **kwargs: Any):
        super().__init__(*args, **kwargs)
        self._original_speed: TNumFeature = None

    def emit(
        self, *link_indeces: int, speed: Optional[float] = None, duration: float = 1
    ) -> None:
        """Emit particles over a series of links."""
        stopped = False

        if speed is None:
            if isinstance(self.speed, (float, int)):
                speed = self.speed
            else:
                speed = self.DEFAULT_SPEED

        if self.speed:
            stopped = True
            self.stop()

        self.speed = Nunjucks(
            "{% if link.index in "
            + str([int(idx) for idx in link_indeces])
            + "%}"
            + str(speed)
            + "{% endif %}"
        )

        if stopped:
            sleep(duration)
            self.speed = 0
            self.start()

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
