# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Any, Dict, Optional, Tuple, Type

import IPython
import ipywidgets as W
import pandas as P
import traitlets as T

from .dataframe import DataFrameSource

TAnyDict = Dict[str, Any]


class WidgetSource(DataFrameSource):
    """A source that displays the widgets, traits, links, and other features of one or
    more :class:`~ipywidgets.widgets.widget.Widget` (or, technically,
    :class:`~traitlets.HasTraits`) instances.
    """

    _shell: Optional[IPython.InteractiveShell]

    observed_has_traits: Tuple[T.HasTraits, ...] = W.TypedTuple(
        T.Instance(T.HasTraits), help="the traitleted from which to discover data"
    )

    graph_data: TAnyDict = T.Dict(help="an internal collection of observed Data").tag(
        sync=False
    )

    ignore_classes: Tuple[Type, ...] = W.TypedTuple(
        T.Instance(type), help="widget classes that should never be collected"
    ).tag(sync=False)

    ignore_modules: Tuple[str, ...] = W.TypedTuple(
        T.Instance(str), help="modules from which instances should never be collected"
    ).tag(sync=False)

    ignore_traits: Tuple[str, ...] = W.TypedTuple(
        T.Instance(str), help="names of traits that should never be collected"
    ).tag(sync=False)

    def __init__(self, widgets: Tuple[T.HasTraits, ...], **kwargs: Any):
        """Detect IPython, then continue with normal widget initialization."""
        self._shell = IPython.get_ipython()
        kwargs["observed_has_traits"] = widgets
        super().__init__(**kwargs)

    @T.default("nodes")
    def _default_nodes(self) -> P.DataFrame:
        return P.DataFrame(self.graph_data["nodes"].values())

    @T.default("links")
    def _default_links(self) -> P.DataFrame:
        return P.DataFrame(self.graph_data["links"].values())

    @T.default("ignore_classes")
    def _default_ignore_classes(self) -> Tuple[Type, ...]:
        """Some core widgets that are generally not interesting to observe."""
        return (
            W.Layout,
            W.ButtonStyle,
            W.SliderStyle,
            W.ToggleButtonsStyle,
        )

    @T.default("ignore_modules")
    def _default_ignore_modules(self) -> Tuple[str, ...]:
        return ("IPython", "ipykernel", "comm")

    @T.default("graph_data")
    def _default_graph_data(self) -> TAnyDict:
        return self.find_graph_data()

    @T.default("ignore_traits")
    def _default_ignore_trats(self) -> Tuple[str, ...]:
        return tuple(W.Widget._traits.keys())

    def find_graph_data(self) -> TAnyDict:
        graph_data: TAnyDict = {"nodes": {}, "links": {}, "widgets": set()}
        for widget in self.observed_has_traits:
            self.find_widget_graph_data(widget, graph_data)
        for widget in graph_data["widgets"]:
            self.find_trait_notifier_graph_data(widget, graph_data)
        return graph_data

    def should_discover(self, candidate: Any, graph_data: TAnyDict) -> bool:
        """Whether the candidate is a :class:`~traitlets.HasTraits`, and has not been otherwise ignored."""
        if not isinstance(candidate, T.HasTraits):
            return False
        if candidate in graph_data["widgets"]:
            return False
        klass = candidate.__class__
        if any(klass.__module__.startswith(mod) for mod in self.ignore_modules):
            return False
        if klass in self.ignore_classes:
            return False
        return True

    def find_widget_graph_data(self, widget: T.HasTraits, graph_data: TAnyDict) -> None:
        """Discover a widget and its traits."""
        node = self.add_widget_node(widget, graph_data)

        for trait_name in node["traits"]:
            self.find_trait_graph_data(trait_name, widget, graph_data)

    def add_widget_node(self, widget: T.HasTraits, graph_data: TAnyDict) -> TAnyDict:
        """Add a single widget node."""
        trait_names = sorted(set(widget._traits.keys()) - set(self.ignore_traits))
        name = None
        widget_id = id(widget)
        if self._shell is not None:
            for var_name, value in self._shell.user_ns.items():
                if var_name.startswith("_"):
                    continue
                if id(value) == widget_id:
                    name = var_name
                    break
        node = {
            "id": f"{widget_id}",
            "name": name,
            "type": "has_traits",
            "py_class": widget.__class__.__name__,
            "py_module": widget.__class__.__module__,
            "traits": trait_names,
        }

        if isinstance(widget, W.Widget):
            node.update(
                {
                    "type": "widget",
                    "model_name": widget._model_name,
                    "model_module": widget._model_module,
                    "view_name": widget._view_name,
                    "view_module": widget._view_module,
                }
            )

        graph_data["widgets"] |= {widget}
        graph_data["nodes"][widget_id] = node
        return node

    def find_trait_graph_data(
        self, trait_name: str, widget: T.HasTraits, graph_data: TAnyDict
    ) -> None:
        widget_id = f"{id(widget)}"
        trait_value = getattr(widget, trait_name)
        trait_id = f"{widget_id}-{trait_name}"
        klass = widget._traits[trait_name].__class__
        graph_data["nodes"][trait_id] = {
            "id": trait_id,
            "type": "trait",
            "name": trait_name,
            "py_module": klass.__module__,
            "py_class": klass.__name__,
        }
        graph_data["links"][trait_id] = {
            "id": trait_id,
            "type": "has_trait",
            "source": widget_id,
            "target": trait_id,
        }
        if (
            isinstance(
                trait_value,
                (
                    str,
                    int,
                    float,
                    P.DataFrame,
                ),
            )
            or trait_value is None
        ):
            return
        elif isinstance(trait_value, T.HasTraits):
            if not self.should_discover(trait_value, graph_data):
                return
            link_id = f"{trait_id}-value"
            graph_data["links"][link_id] = {
                "id": link_id,
                "type": "has_trait_value",
                "source": trait_id,
                "target": f"{id(trait_value)}",
            }
            self.find_widget_graph_data(trait_value, graph_data)
        elif isinstance(trait_value, dict):
            for key, trait_child in trait_value.items():
                if not self.should_discover(trait_value, graph_data):
                    continue
                link_id = f"{trait_id}-value-{key}"
                graph_data["links"][link_id] = {
                    "id": link_id,
                    "type": "has_trait_value",
                    "source": trait_id,
                    "target": f"{id(trait_child)}",
                    "key": f"{key}",
                }
                self.find_widget_graph_data(trait_child, graph_data)
        elif isinstance(trait_value, (list, tuple, set)):
            for i, trait_child in enumerate(trait_value):
                if not self.should_discover(trait_child, graph_data):
                    continue
                link_id = f"{trait_id}-value-{i}"
                graph_data["links"][link_id] = {
                    "id": link_id,
                    "type": "has_trait_value",
                    "source": trait_id,
                    "target": f"{id(trait_child)}",
                    "index": i,
                }
                self.find_widget_graph_data(trait_child, graph_data)

    def find_trait_notifier_graph_data(
        self, widget: T.HasTraits, graph_data: TAnyDict
    ) -> None:
        """Discover trait notifiers from the observed has_traits."""
        for trait_name, event_notifiers in widget._trait_notifiers.items():
            if trait_name == "comm":
                continue
            for event, notifiers in event_notifiers.items():
                for i, notifier in enumerate(notifiers):
                    try:
                        notifier_self = notifier.__self__
                        source_widget, source_trait = notifier_self.source
                        target_widget, target_trait = notifier_self.target
                    except Exception:  # pragma: no cover
                        # these are un-characterized ObserveHandler or functions
                        continue
                    if (
                        source_trait in self.ignore_traits
                        or target_trait in self.ignore_traits
                    ):
                        continue
                    source_id = f"{id(source_widget)}-{source_trait}"
                    target_id = f"{id(target_widget)}-{target_trait}"
                    link_id = f"{event}-{source_id}-{target_id}-{i}"
                    if (
                        source_id in graph_data["nodes"]
                        and target_id in graph_data["nodes"]
                    ):
                        graph_data["links"][link_id] = {
                            "id": link_id,
                            "type": "trait_notifier",
                            "source": source_id,
                            "target": target_id,
                        }
