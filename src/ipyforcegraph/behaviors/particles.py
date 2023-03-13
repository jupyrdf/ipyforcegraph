"""Behaviors for controlling particles traveling over ``ipyforcegraph`` links."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Any

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

    _model_name: str = T.Unicode("LinkParticleModel").tag(sync=True)
    color: TFeature = _make_trait("the color of the particles")
    density: TNumFeature = _make_trait(
        "the number of particles, ideally 0.0 < ``value``", numeric=True
    )
    speed: TNumFeature = _make_trait(
        "the speed of the particles, ideally 0.0 < ``value`` < ~0.1", numeric=True
    )
    width: TNumFeature = _make_trait(
        "the size of the particles, ideally 0.0 < ``value`` < ~5", numeric=True
    )

    @T.validate("density", "speed", "width")
    def _validate_particle_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)
    

@W.register
class EmitParticles(Behavior):
    """Emit particles over a set of links.

    .. note::
       The ``speed`` should be between ``0.0``, stationary, and ``~0.1``,
       or they will exceed the frame rate of the animation.
    """

    _model_name: str = T.Unicode("LinkEmitParticleModel").tag(sync=True)
    links: tuple = W.TypedTuple(T.Int, help="the indices over which to emit a particle")

    @T.validate("density", "speed", "width")
    def _validate_particle_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)


