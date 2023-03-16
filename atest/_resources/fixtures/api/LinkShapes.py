from ipyforcegraph.graphs import WIDGET_CLASS
from ipyforcegraph.behaviors import Column, Nunjucks, LinkShapes, GraphData
from ipyforcegraph import sources as S
import asyncio


lsb = LinkShapes(
    color="rgba(40,40,250,1.0)",
    curvature=0.1,
    line_dash=Nunjucks("[2,1]"),
    width=2.2,
)

lsb.FEATURE = INPUT_TYPE("INITIAL_VALUE"),
gd = GraphData()
fg = WIDGET_CLASS(    source=S.DataFrameSource(
        nodes=[{"id": "hello"}, {"id": "world"}],
        links=[{
            "source": "hello",
            "target": "world",
            "value_small": 0.1,
            "value_large": 0.5,
            "a_color": "red",
            "another_color": "rgba(120,255,120,0.9)",
        }],
    ),
    behaviors=[lsb, gd],
)
display(fg)
