from ipyforcegraph.forcegraph import ForceGraph
from ipyforcegraph import behaviors as B
import pandas as pd

fg = ForceGraph(behaviors=[B.NodeSelection()])
fg.source.nodes = pd.DataFrame([{"id": "hello world"}])
fg
