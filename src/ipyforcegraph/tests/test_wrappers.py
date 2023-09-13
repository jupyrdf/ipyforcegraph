# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import pprint
from typing import Any, List, Tuple

from .conftest import MAX_HYPOTHESIS_EXAMPLES

import hypothesis as H
import hypothesis.strategies as S
import pytest
import traitlets as T

import ipyforcegraph.behaviors as B
import ipyforcegraph.behaviors.scales as SC
from ipyforcegraph.behaviors import CaptureAs, Nunjucks, ReplaceCssVariables
from ipyforcegraph.behaviors.wrappers import WrapperBase
from ipyforcegraph.constants import RESERVED_COLUMNS


@pytest.mark.parametrize("column_name", sorted(RESERVED_COLUMNS))
def test_capture_bad_column(column_name: str) -> None:
    """Check that we don't allow setting column names that would break the graph."""
    CaptureAs(f"__foo_{column_name}", Nunjucks("foo"))

    with pytest.raises(T.TraitError, match="column_name"):
        CaptureAs(column_name, Nunjucks("foo"))


def test_replace() -> None:
    """Not sure what to test here."""
    ReplaceCssVariables(Nunjucks("foo"))


a_wrapper = S.sampled_from(WrapperBase.__subclasses__())

a_root = S.sampled_from(
    [
        "red",
        SC.ContinuousColor("value", scheme=SC.ContinuousColor.Scheme.viridis),
        "var(--jp-ui-color0)",
        "rgba(255,0,0,1.0)",
    ]
)

TWrapperChain = Tuple[WrapperBase, Tuple[WrapperBase, ...]]


@S.composite
def a_chain(
    draw: Any,
    root: Any = a_root,
    wrapper: Any = a_wrapper,
    length: Any = S.integers(min_value=1, max_value=10),
    floats: Any = S.floats(allow_nan=False, allow_infinity=False),
    strings: Any = S.text(),
) -> TWrapperChain:
    """Provide a wrapper and its chain"""
    all_wrappers: List[WrapperBase] = []
    chain_length = draw(length)
    prev_wrapped = draw(root)
    for i in range(chain_length):
        kwargs = {"wrapped": prev_wrapped}
        w = draw(wrapper)
        if w is B.CaptureAs:
            name = draw(strings)
            H.assume(name not in RESERVED_COLUMNS)
            kwargs["column_name"] = name
        elif w is B.Tint:
            kwargs["value"] = draw(floats)
        elif w is B.Colorize:
            kwargs["opacity"] = draw(floats)
        prev_wrapped = w(**kwargs)
        all_wrappers = [prev_wrapped, *all_wrappers]
    return prev_wrapped, all_wrappers


@H.settings(max_examples=MAX_HYPOTHESIS_EXAMPLES)
@H.given(wrapper_and_all_wrappers=a_chain())
def test_good_chain(wrapper_and_all_wrappers: TWrapperChain) -> None:
    """Test some properties of wrapper chains."""
    wrapper, all_wrappers = wrapper_and_all_wrappers

    assert wrapper.root is not None
    assert wrapper.root != wrapper

    all_roots = {w.root for w in all_wrappers}
    assert len(all_roots) == 1

    if len(all_wrappers) >= 2:
        wrapper.wrapped = all_wrappers[-1]
        assert len(wrapper._all_wrapped) == 1


@H.settings(max_examples=MAX_HYPOTHESIS_EXAMPLES)
@H.given(wrapper_and_all_wrappers=a_chain(length=S.integers(min_value=3, max_value=10)))
def test_good_root(wrapper_and_all_wrappers: TWrapperChain) -> None:
    """Test some properties of wrapper chains."""
    wrapper, all_wrappers = wrapper_and_all_wrappers

    print("---")
    pprint.pprint({"0": all_wrappers})
    all_wrappers[-1].wrapped = "blue"
    pprint.pprint({"1": all_wrappers})

    assert wrapper.root == "blue"


@H.settings(max_examples=MAX_HYPOTHESIS_EXAMPLES)
@H.given(wrapper_and_all_wrappers=a_chain())
def test_bad_self(wrapper_and_all_wrappers: TWrapperChain) -> None:
    """Test some properties of wrapper chains."""
    wrapper = wrapper_and_all_wrappers[0]

    with pytest.raises(T.TraitError, match="cannot be its own wrapped"):
        wrapper.wrapped = wrapper


@H.settings(max_examples=MAX_HYPOTHESIS_EXAMPLES)
@H.given(wrapper_and_all_wrappers=a_chain(length=S.integers(min_value=2, max_value=10)))
def test_bad_cycle(wrapper_and_all_wrappers: TWrapperChain) -> None:
    """Test some properties of wrapper chains."""
    wrapper, all_wrappers = wrapper_and_all_wrappers

    print("before", all_wrappers[-1].wrapped)
    with pytest.raises(T.TraitError, match="wrap itself"):
        all_wrappers[-1].wrapped = wrapper
    print("after", all_wrappers[-1].wrapped)


@H.settings(max_examples=MAX_HYPOTHESIS_EXAMPLES)
@H.given(wrapper_and_all_wrappers=a_chain(length=S.integers(min_value=3, max_value=10)))
def test_bad_long_cycle(wrapper_and_all_wrappers: TWrapperChain) -> None:
    """Test some properties of wrapper chains."""
    wrapper, all_wrappers = wrapper_and_all_wrappers

    pprint.pprint([(w, w.wrapped) for w in all_wrappers])
    print("----")
    all_wrappers[-2].wrapped = all_wrappers[-1].wrapped
    assert wrapper.root == all_wrappers[-2].root
