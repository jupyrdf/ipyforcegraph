# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import pytest
import traitlets as T

import ipyforcegraph.behaviors as B
from ipyforcegraph.constants import RESERVED_COLUMNS


@pytest.mark.parametrize("column_name", sorted(RESERVED_COLUMNS))
def test_capture_bad_column(column_name: str) -> None:
    """Check that we don't allow setting column names that would break the graph."""
    B.CaptureAs(f"__foo_{column_name}", B.Nunjucks("foo"))

    with pytest.raises(T.TraitError, match="column_name"):
        B.CaptureAs(column_name, B.Nunjucks("foo"))


def test_replace() -> None:
    """Not sure what to test here."""
    B.ReplaceCssVariables(B.Nunjucks("foo"))


@pytest.mark.parametrize("name", [e.name for e in B.Colorize.Space])
def test_good_color_space(name: str) -> None:
    """Verify the known color spaces are accepted."""
    space = B.Colorize.Space[name]
    colorize = B.Colorize("value", space=space)
    assert colorize.space == space.name
    colorize.space = space.value


def test_bad_color_space() -> None:
    """Verify the unknown color spaces are rejected."""
    with pytest.raises(T.TraitError, match="expected any of"):
        B.Colorize("value", space="not-a-space")


def test_simplest_wrap() -> None:
    """Verify the simplest case."""
    tint = B.Tint("red")
    tint.root == "red"


def test_bad_wrap() -> None:
    """Verify a trivial cycle is caught."""
    tint = B.Tint("red")
    with pytest.raises(T.TraitError, match="cannot wrap itself"):
        tint.wrapped = tint


def test_bad_wrapper_cycle() -> None:
    """Verify a cycle can be found in `root`."""
    tint = B.Tint("red")
    colorize = B.Colorize(tint)
    capture = B.CaptureAs("foo", colorize)
    tint.wrapped = capture
    with pytest.raises(ValueError, match="Cycle"):
        print(capture.root)
