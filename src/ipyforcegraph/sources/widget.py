# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Any, Dict, Tuple, Type

import ipywidgets as W
import pandas as P
import traitlets as T

from .dataframe import DataFrameSource

TAnyDict = Dict[str, Any]


class WidgetSource(DataFrameSource):
    """A source that displays the widgets, traits, links, and/or other features of one or
    more :class:`~ipywidgets.widget.Widget` instances.
    """

    observed_widgets: Tuple[W.Widget, ...] = W.TypedTuple(
        T.Instance(W.Widget), help="the widgets from which to discover data"
    )

    widget_data: TAnyDict = T.Dict(help="an internal collection of observed Data").tag(
        sync=False
    )

    ignore_classes: Tuple[Type, ...] = W.TypedTuple(
        T.Instance(type), help="widget classes that should never be collected"
    ).tag(sync=False)

    ignore_traits: Tuple[str, ...] = W.TypedTuple(
        T.Instance(str), help="names of traits that should never be collected"
    ).tag(sync=False)

    def __init__(self, widgets: Tuple[W.Widget, ...], **kwargs: Any):
        kwargs["observed_widgets"] = widgets
        super().__init__(**kwargs)

    @T.default("nodes")
    def _default_nodes(self) -> P.DataFrame:
        return P.DataFrame(self.widget_data["nodes"].values())

    @T.default("links")
    def _default_links(self) -> P.DataFrame:
        return P.DataFrame(self.widget_data["links"].values())

    @T.default("ignore_classes")
    def _default_ignore_classes(self) -> Tuple[Type, ...]:
        """Some core widgets that are generally not interesting to observe."""
        return (W.Layout, W.ButtonStyle, W.SliderStyle, W.ToggleButtonsStyle)

    @T.default("widget_data")
    def _default_widget_data(self) -> TAnyDict:
        return self.find_graph_data()

    @T.default("ignore_traits")
    def _default_ignore_trats(self) -> Tuple[str, ...]:
        return tuple(W.Widget._traits.keys())

    def find_graph_data(self) -> TAnyDict:
        graph_data: TAnyDict = {"nodes": {}, "links": {}, "widgets": set()}
        for widget in self.observed_widgets:
            self.find_widget_graph_data(widget, graph_data)
        for widget in graph_data["widgets"]:
            self.find_trait_notifier_graph_data(widget, graph_data)
        return graph_data

    def find_widget_graph_data(self, widget: W.Widget, graph_data: TAnyDict) -> None:
        """Discover a widget and its traits."""
        comm_id = widget.comm.comm_id

        if widget.__class__ in self.ignore_classes or comm_id in graph_data["nodes"]:
            return

        node = self.add_widget_node(widget, graph_data)

        for trait_name in node["traits"]:
            self.find_trait_graph_data(trait_name, widget, graph_data)

    def add_widget_node(self, widget: W.Widget, graph_data: TAnyDict) -> TAnyDict:
        """Add a single widget node."""
        trait_names = sorted(set(widget._traits.keys()) - set(self.ignore_traits))
        node = {
            "id": widget.comm.comm_id,
            "type": "widget",
            "py_module": widget.__class__.__module__,
            "py_class": widget.__class__.__name__,
            "view_module": widget._view_module,
            "view_name": widget._view_name,
            "model_name": widget._model_name,
            "model_module": widget._model_module,
            "traits": trait_names,
        }
        graph_data["widgets"] |= {widget}
        graph_data["nodes"][widget.comm.comm_id] = node
        return node

    def find_trait_graph_data(
        self, trait_name: str, widget: W.Widget, graph_data: TAnyDict
    ) -> None:
        comm_id = widget.comm.comm_id
        trait_value = getattr(widget, trait_name)
        trait_id = f"{comm_id}-{trait_name}"
        graph_data["nodes"][trait_id] = {
            "id": trait_id,
            "type": "trait",
            "name": trait_name,
            "py_class": widget._traits[trait_name].__class__.__name__,
        }
        graph_data["links"][trait_id] = {
            "source": comm_id,
            "target": trait_id,
            "type": "has_trait",
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
            or trait_value == None
        ):
            return
        elif isinstance(trait_value, W.Widget):
            if trait_value.__class__ in self.ignore_classes:
                return
            graph_data["links"][f"{trait_id}-value"] = {
                "source": trait_id,
                "target": trait_value.comm.comm_id,
                "type": "has_trait_value",
            }
            self.find_widget_graph_data(trait_value, graph_data)
        elif isinstance(trait_value, dict):
            for key, val in trait_value.items():
                if isinstance(val, W.Widget):
                    if trait_value.__class__ in self.ignore_classes:
                        return
                    graph_data["links"][f"{trait_id}-value-{key}"] = {
                        "source": trait_id,
                        "target": val.comm.comm_id,
                        "type": "has_trait_value",
                        "key": key,
                    }
                    self.find_widget_graph_data(val, graph_data)
        elif isinstance(trait_value, (list, tuple, set)):
            for i, val in enumerate(trait_value):
                if isinstance(val, W.Widget):
                    if trait_value.__class__ in self.ignore_classes:
                        return
                    graph_data["links"][f"{trait_id}-value-{i}"] = {
                        "source": trait_id,
                        "target": val.comm.comm_id,
                        "type": "has_trait_value",
                        "index": i,
                    }
                    self.find_widget_graph_data(val, graph_data)

    def find_trait_notifier_graph_data(
        self, widget: W.Widget, graph_data: TAnyDict
    ) -> None:
        """Discover trait notifiers from the observed widgets."""
        for trait_name, event_notifiers in widget._trait_notifiers.items():
            if trait_name == "comm":
                continue
            for event, notifiers in event_notifiers.items():
                for i, notifier in enumerate(notifiers):
                    try:
                        notifier_self = notifier.__self__
                        source_widget, source_trait = notifier_self.source
                        target_widget, target_trait = notifier_self.target
                    except:
                        # these are un-characterized ObserveHandler or functions
                        continue
                    if (
                        source_trait in self.ignore_traits
                        or target_trait in self.ignore_traits
                    ):
                        continue
                    source_id = f"{source_widget.comm.comm_id}-{source_trait}"
                    target_id = f"{target_widget.comm.comm_id}-{target_trait}"
                    link_id = f"{event}-{source_id}-{target_id}-{i}"
                    if (
                        source_id in graph_data["nodes"]
                        and target_id in graph_data["nodes"]
                    ):
                        graph_data["links"][link_id] = {
                            "source": source_id,
                            "target": target_id,
                        }
