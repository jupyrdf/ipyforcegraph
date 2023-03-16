from ipyforcegraph.graphs import WIDGET_CLASS
from ipyforcegraph import behaviors as B
from ipyforcegraph import sources as S


lb = B.LinkShapes(FEATURE=INPUT_TYPE("VALUE"))
gd = B.GraphData()
fg = WIDGET_CLASS(    source=S.DataFrameSource(
        nodes=[{"id": "hello"}, {"id": "world"}],
        links=[{"source": "hello", "target": "world", "value": 0.1, "link_color": "red"}],
    ),
    behaviors=[lb, gd],
)
display(fg)
