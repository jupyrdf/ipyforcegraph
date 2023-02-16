from ipyforcegraph.graphs import WIDGET_CLASS
from ipyforcegraph import behaviors as B
import asyncio
g = B.GraphData(column_name="id")
fg = WIDGET_CLASS(behaviors=[g])
display(fg)
g.capturing = True
await asyncio.sleep(1)
fg.source.nodes = [{"id": "hello"}, {"id": "world"}]
fg.source.links = [{"source": "hello", "target": "world"}]
await asyncio.sleep(1)
display(g.sources[0].links, g.sources[0].nodes)
assert 0 not in g.sources[0].links.shape
assert 0 not in g.sources[0].nodes.shape
node_cols = g.sources[0].nodes.columns
assert not (set(["x", "y", "vx", "vy"]) - set(node_cols))
