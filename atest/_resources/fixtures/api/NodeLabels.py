from ipyforcegraph.graphs import WIDGET_CLASS
from ipyforcegraph import behaviors as B
fg = WIDGET_CLASS(behaviors=[B.NodeLabels(column_name="id")])
fg.source.nodes = [{"id": "hello world"}]
fg
