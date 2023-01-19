from ipyforcegraph.forcegraph import WIDGET_CLASS
from ipyforcegraph import behaviors as B
import pandas as pd
fg = WIDGET_CLASS(behaviors=[B.NodeLabels(column_name="id")])
fg.source.nodes = pd.DataFrame([{"id": "hello world"}])
fg
