from ipyforcegraph.graphs import WIDGET_CLASS
from ipyforcegraph import behaviors as B
from ipyforcegraph.behaviors import shapes as S

transparent = """rgba(255,255,255,0.0)"""
shape = S.SHAPE_CLASS(fill=transparent)

if isinstance(shape, S.Text):
    shape.text = B.Column("id")
elif isinstance(shape, S.Rectangle):
    shape.opacity = 0

shape.FEATURE = B.Nunjucks(transparent)

ns = B.NodeShapes(shape)
fg = WIDGET_CLASS(behaviors=[ns])
fg.source.nodes = [{"id": "hello world"}]
fg
