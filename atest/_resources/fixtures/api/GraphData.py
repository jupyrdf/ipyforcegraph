from ipyforcegraph.forcegraph import WIDGET_CLASS
from ipyforcegraph import behaviors as B
import pandas as pd
import asyncio
g = B.GraphData(column_name="id")
fg = WIDGET_CLASS(behaviors=[g])
fg.source.nodes = pd.DataFrame([{"id": "hello"}, {"id": "world"}])
fg.source.links = pd.DataFrame([{"source": "hello", "target": "world"}])
display(fg)
g.capturing = True
await asyncio.sleep(1)
assert g.sources[0].links
assert g.sources[0].nodes
