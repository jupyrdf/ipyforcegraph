# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from pprint import pprint

import pytest

from ipyforcegraph import behaviors, forcegraph
from ipyforcegraph._base import ForceBase


@pytest.fixture
def widget_subclasses():
    assert behaviors
    assert forcegraph

    subclasses = set([ForceBase])
    subclass_count = -1

    while len(subclasses) != subclass_count:
        subclass_count = len(subclasses)
        subclasses = set(
            sum([s.__subclasses__() for s in subclasses], list(subclasses))
        )

    assert subclasses
    return subclasses


@pytest.fixture
def widget_subclass_model_names(widget_subclasses):
    return {
        s: s._model_name.default_value
        for s in sorted(widget_subclasses, key=lambda s: s.__name__)
    }


def test_unique_model_names(widget_subclasses, widget_subclass_model_names):
    pprint(widget_subclass_model_names)
    unique_names = sorted(set(widget_subclass_model_names.values()))
    assert len(widget_subclasses) == len(unique_names), widget_subclass_model_names
