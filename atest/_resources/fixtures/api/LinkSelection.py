import traitlets as T, ipywidgets as W, pandas as pd
from ipyforcegraph.forcegraph import WIDGET_CLASS
from ipyforcegraph import behaviors as B

b = B.LinkSelection()
fg = WIDGET_CLASS(behaviors=[b], default_link_width=10)
fg.source.nodes = pd.DataFrame([{"id": "hello"}, {"id": "world"}])
fg.source.links = pd.DataFrame([{"source": "hello", "target": "world"}])
t = W.IntsInput(allowed_tags=[0])
T.link((b, "selected"), (t, "value"))
W.VBox([t, fg])
