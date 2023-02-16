# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import ipywidgets as W

from ..sources.widget import WidgetSource


def test_widget_source() -> None:
    slider = W.FloatSlider()
    src = WidgetSource((slider,))
    assert src.nodes.shape == (18, 10)
    assert src.links.shape == (17, 3)
