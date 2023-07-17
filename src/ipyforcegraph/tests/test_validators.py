import inspect
from typing import Type

import ipywidgets as W
import pytest
import traitlets as T

from ipyforcegraph.behaviors import Column, DynamicValue, GraphImage, Nunjucks
from ipyforcegraph.sources import DataFrameSource

SKIP_SUPERCLASSES = [DataFrameSource, Column, Nunjucks, GraphImage]

SKIP_WIDGETS = [DynamicValue]


def test_coerce(a_widget_subclass: Type[W.Widget]) -> None:
    for skip_cls in SKIP_WIDGETS:
        if a_widget_subclass is skip_cls:
            pytest.skip(f"{a_widget_subclass} doesn't coerce")

    for skip_cls in SKIP_SUPERCLASSES:
        if skip_cls in a_widget_subclass.__mro__:
            pytest.skip(f"{a_widget_subclass} doesn't coerce")

    inst = a_widget_subclass()

    for handler in inst.trait_events().values():
        if not isinstance(handler, T.ValidateHandler):
            continue
        for trait_name in handler.trait_names:
            print("...", trait_name)
            src = inspect.getsource(handler.func)
            if "validate_enum" in src:
                continue
            if trait_name == "line_dash":
                trait_inst = a_widget_subclass(line_dash=Nunjucks("[]"))
                print("", "...", trait_inst)
                continue
            trait_inst = a_widget_subclass(**{trait_name: "0"})
            print("", "...", trait_inst)
