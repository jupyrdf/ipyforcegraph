"""Base classes for all behaviors and forces."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import enum
from typing import Any, Union

import ipywidgets as W
import traitlets as T

from .. import _types as _t
from .._base import ForceBase
from ..constants import RESERVED_COLUMNS
from ..trait_utils import validate_enum
from ._base import DynamicValue

TAnyWrapped = Union[DynamicValue, "WrapperBase", str, bool, int, float]


def _make_color_channel(name: str) -> Any:
    """Create a color channel"""
    return T.Float(
        help=f"an amount to add to each color's {name} channel", allow_none=True
    ).tag(sync=True)


class WrapperBase(ForceBase):
    """A wrapper for other dynamic values"""

    _model_name: _t.Tstr = T.Unicode("WrapperBaseModel").tag(sync=True)

    wrapped: T.TraitType[TAnyWrapped, TAnyWrapped] = T.Union(
        [
            T.Instance(DynamicValue),
            T.Instance("ipyforcegraph.behaviors.wrappers.WrapperBase"),
            T.Unicode(),
            T.Float(),
            T.Int(),
            T.Bool(),
        ],
        help="the ``DynamicValue``, ``WrapperBase``, or static value wrapped by this wrapper",
    ).tag(sync=True, **W.widget_serialization)

    def __init__(self, wrapped: TAnyWrapped, **kwargs: Any):
        kwargs["wrapped"] = wrapped
        super().__init__(**kwargs)

    @T.validate("wrapped")
    def _validate_wrapped(self, proposal: T.Bunch) -> TAnyWrapped:
        """Ensure a wrapper does not contain a trivial cycle."""
        candidate: TAnyWrapped = proposal.value
        if candidate == self:
            raise T.TraitError(f"{self.__class__.__name__} cannot wrap itself")
        return candidate

    @property
    def root(self) -> TAnyWrapped:
        """Get the final value wrapped by this wrapper and all its wrapped values."""
        root = self.wrapped
        seen = [root]
        while isinstance(root, WrapperBase):
            if root.wrapped in seen:
                msg = f"Cycle in wrappers {root.wrapped} in {seen}"
                raise ValueError(msg)
            root = root.wrapped
            seen += [root]
        return root

    def __repr__(self) -> str:
        wrapped_id = (
            self.wrapped.comm.comm_id if hasattr(self.wrapped, "comm") else self.wrapped
        )
        return f"{self.__class__.__name__}({self.comm.comm_id[5:]}, wrapped={wrapped_id[5:]})"


class CaptureAs(WrapperBase):
    """A wrapper that stores dynamically-computed values in the underlying ``node`` or ``link`."""

    _model_name: _t.Tstr = T.Unicode("CaptureAsModel").tag(sync=True)

    column_name: _t.Tstr = T.Unicode(
        allow_none=False, help="name of a column to update with a derived value"
    ).tag(sync=True)

    def __init__(self, column_name: str, wrapped: TAnyWrapped, **kwargs: Any):
        super().__init__(wrapped, column_name=column_name, **kwargs)

    @T.validate("column_name")
    def _validate_column_name(self, proposal: T.Bunch) -> str:
        column_name: str = proposal.value
        if column_name in RESERVED_COLUMNS:
            msg = f"``column_name`` must not be one of {RESERVED_COLUMNS}"
            raise T.TraitError(msg)
        return column_name


class ReplaceCssVariables(WrapperBase):
    """A wrapper that replaces all CSS ``var(--)`` values in the wrapped value."""

    _model_name: _t.Tstr = T.Unicode("ReplaceCssVariablesModel").tag(sync=True)


class Colorize(WrapperBase):
    """Transforms color values by channel in different color spaces.

    See `d3-color <https://github.com/d3/d3-color>`_ for more about color spaces,
    and the channels they use.
    """

    class Space(enum.Enum):
        rgb = "rgb"
        hsl = "hsl"
        lab = "lab"
        hcl = "hcl"
        cubehelix = "cubehelix"

    _model_name: _t.Tstr = T.Unicode("ColorizeModel").tag(sync=True)

    space: T.Enum[str, str] = T.Enum(
        default_value=Space.hsl.value,
        values=[*[m.value for m in Space], *Space],
        help="name of a ``d3-color`` color space",
    ).tag(sync=True)

    a: _t.Tfloat_maybe = _make_color_channel("a*")
    b: _t.Tfloat_maybe = _make_color_channel("blue (or ``b*``)")
    c: _t.Tfloat_maybe = _make_color_channel("chroma")
    g: _t.Tfloat_maybe = _make_color_channel("green")
    h: _t.Tfloat_maybe = _make_color_channel("hue")
    l: _t.Tfloat_maybe = _make_color_channel("luminance (or lightness)")  # noqa: E741
    r: _t.Tfloat_maybe = _make_color_channel("red")
    s: _t.Tfloat_maybe = _make_color_channel("saturation")
    opacity: float = _make_color_channel("opacity")

    @T.validate("space")
    def _validate_enum(self, proposal: T.Bunch) -> Any:
        return validate_enum(proposal, Colorize.Space)


class Tint(WrapperBase):
    """Apply a uniform lighten/darken amount to a color."""

    _model_name: _t.Tstr = T.Unicode("TintModel").tag(sync=True)

    value: float = _make_color_channel("tint")
