"""Column-wise scales for ``ipyforcegraph``.

Some documentation provided by:
- `d3-scale-chromatic <https://github.com/d3/d3-scale-chromatic>`_
"""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import enum
from typing import Any, Tuple

import ipywidgets as W
import traitlets as T

from .. import _types as _t
from ..trait_utils import validate_enum
from ._base import Column


class ContinuousColor(Column):
    """A column which will interpolate a numeric column on a color scale."""

    class Scheme(enum.Enum):
        """Continuous color schemes exported by ``d3-scale-chromatic``"""

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

    _model_name: _t.Tstr = T.Unicode("ContinuousColorModel").tag(sync=True)

    scheme: T.Enum[str, str] = T.Enum(
        values=[*[m.value for m in Scheme], *Scheme],
        help="name of a continuous ``d3-scale-chromatic`` scheme",
        allow_none=True,
    ).tag(sync=True)

    domain: Tuple[float, float] = W.TypedTuple(
        (0.0, 1.0),
        help=("the ``[min, max]`` to map to the scale's colors"),
    ).tag(sync=True)

    @T.validate("scheme")
    def _validate_scheme(self, proposal: T.Bunch) -> Any:
        return validate_enum(proposal, ContinuousColor.Scheme)


class OrdinalColor(Column):
    """A column which will encode a column on an discrete color scale."""

    class Scheme(enum.Enum):
        """Ordinal color schemes exported by ``d3-scale-chromatic``"""

        accent = "Accent"
        category10 = "Category10"
        dark2 = "Dark2"
        paired = "Paired"
        pastel1 = "Pastel1"
        pastel2 = "Pastel2"
        set1 = "Set1"
        set2 = "Set2"
        set3 = "Set3"
        tableau10 = "Tableau10"

    _model_name: _t.Tstr = T.Unicode("OrdinalColorModel").tag(sync=True)

    scheme: T.Enum[str, str] = T.Enum(
        values=[*[m.value for m in Scheme], *Scheme],
        help="name of an ordinal ``d3-scale-chromatic`` scheme",
        allow_none=True,
    ).tag(sync=True)

    domain: T.Container[Tuple[Any, ...]] = T.Tuple(
        (0.0, 1.0),
        help=("values mapped to ordinal colors in the range"),
    ).tag(sync=True)

    range: Tuple[str, ...] = W.TypedTuple(
        T.Unicode(), help="the colors available in a scheme (overloaded by ``scheme``)"
    ).tag(sync=True)

    @T.validate("scheme")
    def _validate_scheme(self, proposal: T.Bunch) -> Any:
        return validate_enum(proposal, OrdinalColor.Scheme)
