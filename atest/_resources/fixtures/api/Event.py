from ipyforcegraph.graphs import WIDGET_CLASS
from ipyforcegraph.behaviors import GraphData, GraphForces
import random

gd = GraphData()
gf = GraphForces(cooldown_ticks=10)
fg = WIDGET_CLASS(behaviors=[gd, gf])
fg.source.nodes = [{"id": i} for i in range(10)]
fg.source.links = [
    {"source": random.randint(0, 9), "target": random.randint(0, 9)}
    for i in range(20)
]

display(fg)
