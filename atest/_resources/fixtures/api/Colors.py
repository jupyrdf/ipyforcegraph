from ipyforcegraph.graphs import WIDGET_CLASS
import ipyforcegraph.behaviors as B

fg = WIDGET_CLASS()
display(fg)
fg.source.nodes = [{"id": "hello"}, {"id": "world"}]
fg.source.links = [{"source": "hello", "target": "world"}]
transparent = "rgba(0,0,0,0.0)"
fg.default_link_width = fg.default_node_size = 10
fg.default_node_color = fg.default_link_color = fg.background_color = transparent
