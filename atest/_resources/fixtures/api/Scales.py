from ipyforcegraph.graphs import WIDGET_CLASS
from ipyforcegraph.behaviors.scales import SCALE_CLASS
from ipyforcegraph.behaviors import GraphData, NodeShapes

COLOR_SCALE_COLUMN_NAME = "_color"

ns = NodeShapes()
gd = GraphData()
fg = WIDGET_CLASS(behaviors=[ns])
scale = SCALE_CLASS("id", scheme=SCALE_CLASS.Scheme.SCHEME, column_name=COLOR_SCALE_COLUMN_NAME)
display(fg)
fg.source.nodes = [{"id": 0}, {"id": 1}]
fg.source.links = [{"source": 0, "target": 1}]
transparent = "rgba(0,0,0,0.0)"
fg.default_link_width = fg.default_node_size = 10
fg.default_node_color = fg.default_link_color = fg.background_color = transparent

gd.capturing = True
await asyncio.sleep(1)
source, *_ = gd.sources
display(source.links, source.nodes)

assert COLOR_SCALE_COLUMN_NAME in source.nodes.columns
assert COLOR_SCALE_COLUMN_NAME in source.links.columns
