# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import warnings

import pytest

from ..behaviors import GraphData, LinkSelection, LinkShapes, Nunjucks
from ..graphs import ForceGraph
from ..sources import DataFrameSource

lsel = LinkSelection()
lsb = LinkShapes(
    color="rgba(40,40,250,1.0)",
    curvature=0.1,
    line_dash=Nunjucks("[2,1]"),
    width=2.2,
)
gd = GraphData()

with warnings.catch_warnings():
    warnings.simplefilter("error")
    fg = ForceGraph(
        source=DataFrameSource(
            nodes=[{"id": "hello"}, {"id": "world"}],
            links=[
                {
                    "source": "hello",
                    "target": "world",
                    "link_color": "red",
                    "value": 0.1,
                }
            ],
        ),
        behaviors=[lsel, lsb, gd],
    )

with pytest.warns() as record:
    fg.behaviors = (lsb, gd, lsel)

assert len(record) == 1
assert (
    str(record[0].message)
    == "Selected behaviors are not first, may lead to unintended effects!"
)
