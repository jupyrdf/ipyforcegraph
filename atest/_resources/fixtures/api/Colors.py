from ipyforcegraph.forcegraph import WIDGET_CLASS
import pandas as pd
fg = WIDGET_CLASS()
fg.source.nodes = pd.DataFrame([{"id": "hello"}, {"id": "world"}])
fg.source.links = pd.DataFrame([{"source": "hello", "target": "world"}])
transparent = "rgba(0,0,0,0.0)"
fg.default_node_color = fg.default_link_color = fg.background_color = transparent
fg
