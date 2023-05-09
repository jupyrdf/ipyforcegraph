"""Tests of basic scales."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Any

import pytest
import traitlets as T

import ipyforcegraph.behaviors.scales as S


@pytest.mark.parametrize("name", [e.name for e in S.Chromatic])
def test_good_scale(name: str) -> None:
    """Verify the known scales are accepted."""
    scheme = S.Chromatic[name]
    scale = S.ColorScaleColumn("value", scheme=scheme)
    scale.scheme = scheme.value


@pytest.mark.parametrize("scheme", [0, "false", None])
def test_bad_scale(scheme: Any) -> None:
    """Verify rando scales are caught."""
    scale = S.ColorScaleColumn("value", scheme=S.Chromatic.blues)
    with pytest.raises(T.TraitError, match="expected any of"):
        scale.scheme = scheme
