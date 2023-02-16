"""Link behaviors for ``ipyforcegraph``."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Optional, Tuple, Union

import ipywidgets as W
import traitlets as T

from ._base import Behavior


@W.register
class LinkSelection(Behavior):
    """Enable link selection with synced ids of selected links."""

    _model_name: str = T.Unicode("LinkSelectionModel").tag(sync=True)

    selected: Tuple[Union[int, str], ...] = W.TypedTuple(
        T.Union((T.Int(), T.Unicode())),
        allow_none=True,
        help="the 0-based indices of any selected links",
    ).tag(sync=True)

    multiple: bool = T.Bool(True).tag(sync=True)

    selected_color: str = T.Unicode(
        "rgba(31, 120, 179, 1.0)", help="the color of selected links"
    ).tag(sync=True)

    selected_width: float = T.Float(2, help="the width of selected links").tag(
        sync=True
    )


@W.register
class LinkColors(Behavior):
    """Customize link colors based on a column or template."""

    _model_name: str = T.Unicode("LinkColorModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help="name of the source column to use for link colors.",
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate link colors",
    ).tag(sync=True)


@W.register
class LinkWidths(Behavior):
    """Customize link widths based on a column or template."""

    _model_name: str = T.Unicode("LinkWidthModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help="name of the source column to use for link widths.",
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate link widths",
    ).tag(sync=True)


@W.register
class LinkLabels(Behavior):
    """Customize link labels, displayed on hover, based on a column or template."""

    _model_name: str = T.Unicode("LinkLabelModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help="name of the source column to use for link labels.",
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate link labels",
    ).tag(sync=True)


@W.register
class LinkDirectionalArrowColor(Behavior):
    """Customize arrow color on links, based on a column or template."""

    _model_name: str = T.Unicode("LinkDirectionalArrowColorModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help="name of the source column to use for link directional arrow color.",
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate link directional arrow color",
    ).tag(sync=True)


@W.register
class LinkDirectionalArrowLength(Behavior):
    """Customize arrow direction on links, based on a column or template."""

    _model_name: str = T.Unicode("LinkDirectionalArrowLengthModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help="name of the source column to use for link directional arrow length.",
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate link directional arrow length",
    ).tag(sync=True)


@W.register
class LinkDirectionalArrowRelPos(Behavior):
    """Customize arrow positioning on links, based on a column or template.

    This generated value must be between ``0.0``, at the source, or ``1.0``, at the target
    """

    _model_name: str = T.Unicode("LinkDirectionalArrowRelPosModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help="name of the source column to use for link directional arrow relative position.",
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate link directional arrow relative position",
    ).tag(sync=True)


@W.register
class LinkDirectionalParticleColor(Behavior):
    """Customize the color of animated particles on links, based on a column or template."""

    _model_name: str = T.Unicode("LinkDirectionalParticleColorModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help="name of the source column to use for link directional particle color.",
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate link directional particle color",
    ).tag(sync=True)


@W.register
class LinkDirectionalParticleSpeed(Behavior):
    """Customize the speed of animated particles on links, based on a column or template.

    The value should be between ``0.0``, stationary, and ``~0.1``, or they will
    exceed the frame rate of the animation.
    """

    _model_name: str = T.Unicode("LinkDirectionalParticleSpeedModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help="name of the source column to use for link directional particle speed.",
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate link directional particle speed",
    ).tag(sync=True)


@W.register
class LinkDirectionalParticleWidth(Behavior):
    """Customize the size of animated particles on links, based on a column or template.

    The value should be between ``0.0``, invisible (not recommended) and ``~5.0``,
    which is rather large, depending on the size of nodes.
    """

    _model_name: str = T.Unicode("LinkDirectionalParticleWidthModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help="name of the source column to use for link directional particle width.",
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate link directional particle width",
    ).tag(sync=True)


@W.register
class LinkDirectionalParticles(Behavior):
    """Customize the density of animated particles on links, based on a column or template.

    The value should be between ``0.0``, invisible (not recommended) and an upper
    bound, dependant on the visual length of links.
    """

    _model_name: str = T.Unicode("LinkDirectionalParticlesModel").tag(sync=True)

    column_name: str = T.Unicode(
        None,
        allow_none=True,
        help="name of the source column to use for link directional particles.",
    ).tag(sync=True)

    template: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate link directional particles",
    ).tag(sync=True)
