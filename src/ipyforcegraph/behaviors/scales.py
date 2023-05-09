"""Column-wise scales for ``ipyforcegraph``."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import enum
from typing import Any

import traitlets as T

from ._base import Column


class Chromatic(enum.Enum):
    """Color schemes exported by ``d3-scale-chromatic``"""

    blues = "Blues"
    brbg = "BrBG"
    bugn = "BuGn"
    bupu = "BuPu"
    cividis = "Cividis"
    cool = "Cool"
    cubehelixdefault = "CubehelixDefault"
    gnbu = "GnBu"
    greens = "Greens"
    greys = "Greys"
    inferno = "Inferno"
    magma = "Magma"
    oranges = "Oranges"
    orrd = "OrRd"
    piyg = "PiYG"
    plasma = "Plasma"
    prgn = "PRGn"
    pubu = "PuBu"
    pubugn = "PuBuGn"
    puor = "PuOr"
    purd = "PuRd"
    purples = "Purples"
    rainbow = "Rainbow"
    rdbu = "RdBu"
    rdgy = "RdGy"
    rdpu = "RdPu"
    rdylbu = "RdYlBu"
    rdylgn = "RdYlGn"
    reds = "Reds"
    sinebow = "Sinebow"
    spectral = "Spectral"
    turbo = "Turbo"
    viridis = "Viridis"
    warm = "Warm"
    ylgn = "YlGn"
    ylgnbu = "YlGnBu"
    ylorbr = "YlOrBr"
    ylorrd = "YlOrRd"


class ColorScaleColumn(Column):
    """A column which will encode a numeric column as a color scale.

    Powered by https://github.com/d3/d3-scale-chromatic
    """

    _model_name: str = T.Unicode("ColorScaleColumnModel").tag(sync=True)

    scheme: str = T.Enum(
        values=[*[m.value for m in Chromatic], *Chromatic],
        help="name of a ``d3-scale-chromatic`` scheme",
    ).tag(sync=True)

    min: float = T.Float(0.0, help="the minimum value of the domain of a scale").tag(
        sync=True
    )

    max: float = T.Float(1.0, help="the maximum value of the domain of a scale").tag(
        sync=True
    )

    @T.validate("scheme")
    def _validate_scheme(self, proposal: T.Bunch) -> Any:
        scheme = proposal.value
        if isinstance(scheme, Chromatic):
            return scheme.value

        if any(scheme == m.value for m in Chromatic):
            return scheme

        raise T.TraitError(f"""{scheme} is not one of {", ".join([*Chromatic])}""")
