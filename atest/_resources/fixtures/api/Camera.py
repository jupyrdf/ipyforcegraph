import ipyforcegraph.graphs as G, ipyforcegraph.behaviors as B
c = B.GraphCamera(capturing=True)
d = B.GraphDirector()
n = B.Nunjucks("{{ node.id == 'hello' }}")
fg = G.WIDGET_CLASS(behaviors=[c, d])
display(fg)
fg.source.nodes = [{"id": "hello"}, {"id": "world"}]
fg.source.links = [{"source": "hello", "target": "world"}]
