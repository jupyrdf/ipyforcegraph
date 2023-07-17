"""Test fixtures and configuration for ``ipyforcegraph``."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

# side-effectful import of ipykernel for a working comm manager
# maybe remove after https://github.com/ipython/comm/pull/13
import ipykernel.ipkernel  # noqa

import platform
import sys

from typing import Dict, Set, Type

import ipywidgets as W
import pytest

from ipyforcegraph import behaviors, graphs
from ipyforcegraph._base import ForceBase
from ipyforcegraph.behaviors import forces, scales, shapes
from ipyforcegraph.sources.dodo import DodoSource
from ipyforcegraph.sources.widget import WidgetSource


from typing import TYPE_CHECKING, Generic, TypeVar

if TYPE_CHECKING:
    from pytest import FixtureRequest as _FixtureRequest

    T = TypeVar("T")

    class FixtureRequest(_FixtureRequest, Generic[T]):
        param: T

else:
    from pytest import FixtureRequest

WIN = platform.system() == "Windows"
THREE_EIGHT = sys.version_info < (3, 9)


TSubclassSet = Set[Type[W.Widget]]
TSubclassData = Dict[Type[W.Widget], str]

#: the bases we'll walk to find subclasses
SUBCLASS_BASES = {ForceBase}

#: these reuse the upstream data model
PURE_PY_SUBCLASSES = {WidgetSource, DodoSource}


def get_widget_subclasses() -> TSubclassSet:
    assert behaviors
    assert forces
    assert graphs
    assert shapes
    assert scales

    subclasses: Set[Type] = SUBCLASS_BASES
    subclass_count = -1

    while len(subclasses) != subclass_count:
        subclass_count = len(subclasses)
        subclasses = set(
            sum([s.__subclasses__() for s in subclasses], list(subclasses))
        )

    assert subclasses
    return subclasses - PURE_PY_SUBCLASSES


@pytest.fixture(scope="module")
def widget_subclasses() -> TSubclassSet:
    return get_widget_subclasses()


@pytest.fixture(params=get_widget_subclasses())
def a_widget_subclass(request: "FixtureRequest[Type[W.Widget]]") -> Type[W.Widget]:
    return request.param


@pytest.fixture
def widget_subclass_model_names(widget_subclasses: TSubclassSet) -> TSubclassData:
    return {
        s: s._model_name.default_value
        for s in sorted(widget_subclasses, key=lambda s: s.__name__)
    }
