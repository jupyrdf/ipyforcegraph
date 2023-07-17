# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from pprint import pprint

from .conftest import TSubclassData, TSubclassSet


def test_unique_model_names(
    widget_subclasses: TSubclassSet, widget_subclass_model_names: TSubclassData
) -> None:
    pprint(widget_subclass_model_names)
    unique_names = sorted(set(widget_subclass_model_names.values()))
    assert len(widget_subclasses) == len(unique_names), widget_subclass_model_names
