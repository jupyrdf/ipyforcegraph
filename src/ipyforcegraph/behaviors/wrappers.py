"""Base classes for all behaviors and forces."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import enum
from typing import Any, Tuple, Union

import ipywidgets as W
import traitlets as T

from .._base import ForceBase
from ..constants import RESERVED_COLUMNS
from ..trait_utils import validate_enum
from ._base import DynamicValue

#: a type for what might be found in a wrapper
TAnyWrapped = Union[DynamicValue, "WrapperBase", str, bool, int, float]

#: a wrapper trait
TAWrapper = T.Instance("ipyforcegraph.behaviors.wrappers.WrapperBase")

#: traits which could be the wrapped content
TWrappable = [
    T.Instance(DynamicValue),
    TAWrapper,
    T.Unicode(),
    T.Float(),
    T.Int(),
    T.Bool(),
]


def _make_color_channel(name: str) -> Any:
    """Create a color channel"""
    return T.Float(
        help=f"an amount to add to each color's {name} channel", allow_none=True
    ).tag(sync=True)


class WrapperBase(ForceBase):
    """A wrapper for other dynamic values"""

    _model_name: str = T.Unicode("WrapperBaseModel").tag(sync=True)

    wrapped: TAnyWrapped = T.Union(
        TWrappable,
        help="the ``DynamicValue``, ``WrapperBase``, or static value wrapped by this wrapper",
    ).tag(sync=True, **W.widget_serialization)

    root: TAnyWrapped = T.Union(
        TWrappable,
        help=(
            "the final, effectively read-only value wrapped by this wrapper "
            "(and any successive wrappers)"
        ),
        allow_none=True,
    ).tag(sync=False)

    _all_wrapped: Tuple["WrapperBase", ...] = W.TypedTuple(
        TAWrapper,
        help="the read-only list of wrappers wrapped by this wrapper",
    ).tag(sync=False)

    def __init__(self, wrapped: TAnyWrapped, **kwargs: Any):
        kwargs["wrapped"] = wrapped
        super().__init__(**kwargs)

    @T.validate("wrapped", "root")
    def _validate_wrapped(self, proposal: T.Bunch) -> TAnyWrapped:
        candidate: TAnyWrapped = proposal.value

        if candidate == self:
            msg = (
                f"A {self.__class__.__name__} cannot be its own "
                f"{proposal.trait.name}"
            )
            raise T.TraitError(msg)

        return candidate

    def _on_other_wrapped_change(self, change: T.Bunch) -> None:
        """Handle a change to ``root`` by a wrapped wrapper."""
        candidate = self.wrapped
        if isinstance(candidate, WrapperBase):
            if self in candidate._all_wrapped:
                raise T.TraitError(f"A {self.__class__.__name__} cannot wrap itself")
            candidate = candidate.root
        if candidate == self or self.root == candidate:
            msg = (
                f"{change.owner.__class__.__name__} cannot have this "
                f"{self.__class__.__name__} as its root"
            )
            raise T.TraitError(msg)
        self.root = candidate

    @T.observe("wrapped")
    def _on_my_wrapped_change(self, change: T.Bunch) -> None:
        """Update the ``root`` based on a change to ``wrapped``."""
        if isinstance(change.old, WrapperBase):
            try:
                change.old.unobserve(self._on_other_wrapped_change, "_all_wrapped")
            except ValueError:
                pass

        candidate = change.new
        candidate_wrappers: Tuple[WrapperBase, ...] = tuple()

        if isinstance(candidate, WrapperBase):
            candidate.observe(self._on_other_wrapped_change, "_all_wrapped")
            candidate_wrappers = (candidate, *candidate._all_wrapped)
            candidate = candidate.root

        if self in candidate_wrappers:
            raise T.TraitError(f"A {self.__class__.__name__} cannot wrap itself")

        self.root = candidate
        self._all_wrapped = candidate_wrappers

    def __repr__(self) -> str:
        wrapped_id = (
            self.wrapped.comm.comm_id if hasattr(self.wrapped, "comm") else self.wrapped
        )
        root_id = self.root.comm.comm_id if hasattr(self.root, "comm") else self.root
        return (
            f"{self.__class__.__name__}("
            f"id={self.comm.comm_id[:5]}, "
            f"wrapped={wrapped_id[:5]}, "
            f"root={root_id[:5]}"
            ")"
        )


class CaptureAs(WrapperBase):
    """A wrapper that stores dynamically-computed values in the underlying ``node`` or ``link`."""

    _model_name: str = T.Unicode("CaptureAsModel").tag(sync=True)

    column_name: str = T.Unicode(
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

    _model_name: str = T.Unicode("ReplaceCssVariablesModel").tag(sync=True)


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

    _model_name: str = T.Unicode("ColorizeModel").tag(sync=True)

    space: str = T.Enum(
        default_value=Space.hsl.value,
        values=[*[m.value for m in Space], *Space],
        help="name of a ``d3-color`` color space",
    ).tag(sync=True)

    a: float = _make_color_channel("a*")
    b: float = _make_color_channel("blue (or ``b*``)")
    c: float = _make_color_channel("chroma")
    g: float = _make_color_channel("green")
    h: float = _make_color_channel("hue")
    l: float = _make_color_channel("luminance (or lightness)")  # noqa: E741
    r: float = _make_color_channel("red")
    s: float = _make_color_channel("saturation")
    opacity: float = _make_color_channel("opacity")

    @T.validate("space")
    def _validate_enum(self, proposal: T.Bunch) -> Any:
        return validate_enum(proposal, Colorize.Space)


class Tint(WrapperBase):
    """Apply a uniform lighten/darken amount to a color."""

    _model_name: str = T.Unicode("TintModel").tag(sync=True)

    value: float = _make_color_channel("tint")
