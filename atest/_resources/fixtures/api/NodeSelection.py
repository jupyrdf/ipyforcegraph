import traitlets as T, ipywidgets as W
from ipyforcegraph.graphs import WIDGET_CLASS
from ipyforcegraph import behaviors as B

b = B.NodeSelection()
fg = WIDGET_CLASS(behaviors=[b])
fg.source.nodes = [{"id": "hello world"}]
t = W.IntsInput(
    placeholder="select some node indices",
    allowed_tags=[*range(len(fg.source.nodes))],
)
T.link((b, "selected"), (t, "value"))
W.VBox([t, fg])
