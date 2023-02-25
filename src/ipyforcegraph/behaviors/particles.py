"""Particle over links behaviors for ``ipyforcegraph``."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import ipywidgets as W
import traitlets as T

from ._base import Behavior, TFeature, TNumFeature, _make_trait


@W.register
class Particles(Behavior):
    """Customize the animated particles on links.

    ..note::
        The ``speed`` should be between ``0.0``, stationary, and ``~0.1``,
        or they will exceed the frame rate of the animation.
    """

    _model_name: str = T.Unicode("LinkDirectionalParticleColorModel").tag(sync=True)
    color: TFeature = _make_trait("the color of the particles")
    density: TNumFeature = _make_trait(
        "the number particles, ideally 0.0 < ``value``", numeric=True
    )
    speed: TNumFeature = _make_trait(
        "the speed of the particles, ideally 0.0 < ``value`` < ~0.1", numeric=True
    )
    width: TNumFeature = _make_trait(
        "the size of the particles, ideally 0.0 < ``value`` < ~5", numeric=True
    )
