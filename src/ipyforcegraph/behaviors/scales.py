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

from ._base import Column


class Chromatic(enum.Enum):
    """
    Named color schemes exported by `d3-scale-chromatic`

    .. _d3-scale-chromatic: https://github.com/d3/d3-scale-chromatic
    """

    accent = "Accent"
    blues = "Blues"
    brbg = "BrBG"
    bugn = "BuGn"
    bupu = "BuPu"
    category10 = "Category10"
    cividis = "Cividis"
    cool = "Cool"
    cubehelixdefault = "CubehelixDefault"
    dark2 = "Dark2"
    gnbu = "GnBu"
    greens = "Greens"
    greys = "Greys"
    inferno = "Inferno"
    magma = "Magma"
    oranges = "Oranges"
    orrd = "OrRd"
    paired = "Paired"
    pastel1 = "Pastel1"
    pastel2 = "Pastel2"
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
    set1 = "Set1"
    set2 = "Set2"
    set3 = "Set3"
    sinebow = "Sinebow"
    spectral = "Spectral"
    tableau10 = "Tableau10"
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
        allow_none=True,
    ).tag(sync=True)

    interpolate: bool = T.Bool(
        True,
        help=(
            "whether ``domain`` should be interpreted as ``[min, max]``, or as "
            "ordinal values"
        ),
    ).tag(sync=True)

    domain: Tuple[Any] = T.Tuple(
        (0.0, 1.0),
        help=(
            "the ``[min, max]`` for ``interpolate``d scales, or the values mapped "
            "to ordinal colors in the range"
        ),
    ).tag(sync=True)

    range: Tuple[str] = W.TypedTuple(
        T.Unicode(), help=("the colors available in a scheme")
    ).tag(sync=True)

    sub_scheme: int = T.Int(
        None, help="the subscheme for non-interpolated colors", allow_none=True
    ).tag(sync=True)

    @T.validate("scheme")
    def _validate_scheme(self, proposal: T.Bunch) -> Any:
        scheme = proposal.value
        if isinstance(scheme, Chromatic):
            return scheme.value

        if any(scheme == m.value for m in Chromatic):
            return scheme

        raise T.TraitError(f"""{scheme} is not one of {", ".join([*Chromatic])}""")
