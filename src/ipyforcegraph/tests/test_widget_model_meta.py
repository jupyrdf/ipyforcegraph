# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from pprint import pprint
from typing import Dict, Set, Type

import ipywidgets as W
import pytest

from ipyforcegraph import behaviors, forcegraph, forces
from ipyforcegraph._base import ForceBase
from ipyforcegraph.sources.widget import WidgetSource

TSubclassSet = Set[Type[W.Widget]]
TSubclassData = Dict[Type[W.Widget], str]


@pytest.fixture
def widget_subclasses() -> TSubclassSet:
    assert behaviors
    assert forcegraph
    assert forces

    subclasses = set([ForceBase])
    subclass_count = -1

    while len(subclasses) != subclass_count:
        subclass_count = len(subclasses)
        subclasses = set(
            sum([s.__subclasses__() for s in subclasses], list(subclasses))
        )

    assert subclasses
    return subclasses - set([WidgetSource])


@pytest.fixture
def widget_subclass_model_names(widget_subclasses: TSubclassSet) -> TSubclassData:
    return {
        s: s._model_name.default_value
        for s in sorted(widget_subclasses, key=lambda s: s.__name__)
    }


def test_unique_model_names(
    widget_subclasses: TSubclassSet, widget_subclass_model_names: TSubclassData
) -> None:
    pprint(widget_subclass_model_names)
    unique_names = sorted(set(widget_subclass_model_names.values()))
    assert len(widget_subclasses) == len(unique_names), widget_subclass_model_names
