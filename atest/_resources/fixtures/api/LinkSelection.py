import traitlets as T, ipywidgets as W
from ipyforcegraph.forcegraph import WIDGET_CLASS
from ipyforcegraph import behaviors as B

b = B.LinkSelection()
fg = WIDGET_CLASS(behaviors=[b], default_link_width=10)
fg.source.nodes = [{"id": "hello"}, {"id": "world"}]
fg.source.links = [{"source": "hello", "target": "world"}]
t = W.IntsInput(allowed_tags=[0])
T.link((b, "selected"), (t, "value"))
W.VBox([t, fg])
