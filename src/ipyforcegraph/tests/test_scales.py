"""Tests of basic scales."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Any

import pytest
import traitlets as T

import ipyforcegraph.behaviors.scales as S


@pytest.mark.parametrize("name", [e.name for e in S.ContinuousColor.SCALE])
def test_good_continuous_scale(name: str) -> None:
    """Verify the known continuous scales are accepted."""
    scheme = S.ContinuousColor.SCALE[name]
    scale = S.ContinuousColor("value", scheme=scheme)
    scale.scheme = scheme.value


@pytest.mark.parametrize("scheme", [0, "false"])
def test_bad_continuous_scale(scheme: Any) -> None:
    """Verify rando continuous scales are caught."""
    scale = S.ContinuousColor("value")
    with pytest.raises(T.TraitError, match="expected any of"):
        scale.scheme = scheme


@pytest.mark.parametrize("name", [e.name for e in S.OrdinalColor.SCALE])
def test_good_ordinal_scale(name: str) -> None:
    """Verify the known ordinal scales are accepted."""
    scheme = S.OrdinalColor.SCALE[name]
    scale = S.OrdinalColor("value", scheme=scheme)
    scale.scheme = scheme.value


@pytest.mark.parametrize("scheme", [0, "false"])
def test_bad_ordinal_scale(scheme: Any) -> None:
    """Verify rando ordinal scales are caught."""
    scale = S.OrdinalColor("value")
    with pytest.raises(T.TraitError, match="expected any of"):
        scale.scheme = scheme
