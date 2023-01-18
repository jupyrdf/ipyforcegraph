import traitlets as T, ipywidgets as W, pandas as pd
from ipyforcegraph.forcegraph import WIDGET_CLASS
from ipyforcegraph import behaviors as B

b = B.NodeSelection()
fg = WIDGET_CLASS(behaviors=[b])
fg.source.nodes = pd.DataFrame([{"id": "hello world"}])
t = W.TagsInput(allowed_tags=sorted(fg.source.nodes.id))
T.link((b, "selected"), (t, "value"))
W.VBox([t, fg])
