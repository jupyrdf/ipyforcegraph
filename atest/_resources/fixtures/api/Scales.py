from ipyforcegraph.graphs import WIDGET_CLASS
from ipyforcegraph.behaviors.scales import SCALE_CLASS
from ipyforcegraph.behaviors import NodeShapes

ns = NodeShapes()
fg = WIDGET_CLASS(behaviors=[ns])
scale = SCALE_CLASS("id", scheme=SCALE_CLASS.SCALE.SCHEME)
display(fg)
fg.source.nodes = [{"id": 0}, {"id": 1}]
fg.source.links = [{"source": 0, "target": 1}]
transparent = "rgba(0,0,0,0.0)"
fg.default_link_width = fg.default_node_size = 10
fg.default_node_color = fg.default_link_color = fg.background_color = transparent
