"""Tests of basic scales."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Any, Type

import pytest
import traitlets as T

import ipyforcegraph.behaviors.scales as S


@pytest.mark.parametrize("name", [e.name for e in S.ContinuousColor.Scheme])
def test_good_continuous_scale(name: str) -> None:
    """Verify the known continuous scales are accepted."""
    scheme = S.ContinuousColor.Scheme[name]
    scale = S.ContinuousColor("value", scheme=scheme)
    scale.scheme = scheme.value


@pytest.mark.parametrize("scheme", [0, "false"])
def test_bad_continuous_scale(scheme: Any) -> None:
    """Verify rando continuous scales are caught."""
    scale = S.ContinuousColor("value")
    with pytest.raises(T.TraitError, match="expected any of"):
        scale.scheme = scheme


@pytest.mark.parametrize("name", [e.name for e in S.OrdinalColor.Scheme])
def test_good_ordinal_scale(name: str) -> None:
    """Verify the known ordinal scales are accepted."""
    scheme = S.OrdinalColor.Scheme[name]
    scale = S.OrdinalColor("value", scheme=scheme)
    scale.scheme = scheme.value


@pytest.mark.parametrize("scheme", [0, "false"])
def test_bad_ordinal_scale(scheme: Any) -> None:
    """Verify rando ordinal scales are caught."""
    scale = S.OrdinalColor("value")
    with pytest.raises(T.TraitError, match="expected any of"):
        scale.scheme = scheme


@pytest.mark.parametrize("color_scale_class", [S.ContinuousColor, S.OrdinalColor])
def test_column_name_color(color_scale_class: Type[S.ColorByColumn]) -> None:
    """Verify that the color column name feature is respected."""
    scale = color_scale_class("value", column_name="_color")
    with pytest.raises(T.TraitError, match="column_name cannot be"):
        scale.column_name = "__indexColor"
