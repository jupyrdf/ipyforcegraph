# Changelog

## `0.3.9`

### `ipyforcegraph 0.3.9`

> TBD

### `@jupyrdf/jupyter-forcegraph 0.3.9`

> TBD

## `0.3.8`

### `ipyforcegraph 0.3.8`

> TBD

### `@jupyrdf/jupyter-forcegraph 0.3.8`

- adds support for CSS `var()` values in relevant behaviors and values (e.g. colors,
  fonts)
  - this does _not_ support `calc`

## `0.3.7`

### `ipyforcegraph 0.3.7`

- adds `LinkShapes.shapes` with support for the `Text` shape
- adds `offset_x`, `offset_y`, and `offset_z` to all shapes
- adds `Text.size_pixels` for fine-tuning performance/quality when rendering in 3D

### `@jupyrdf/jupyter-forcegraph 0.3.7`

- adds `LinkShapesModel.shapes` with support for the `TextModel` shape

## `0.3.6`

### `ipyforcegraph 0.3.6`

- rename `GraphDirector.padding` to `.fit_padding`

### `@jupyrdf/jupyter-forcegraph 0.3.6`

- normalize `GraphDirectorModel.padding` to `fit_padding`

## `0.3.5`

### `ipyforcegraph 0.3.5`

### `@jupyrdf/jupyter-forcegraph 0.3.5`

- 2D node text can now be provided by non-text values (by constant or `Column`)

## `0.3.4`

### `ipyforcegraph 0.3.4`

- adds `GraphCamera` behavior which can observe the contents of a graph viewport
- adds `GraphDirector` behavior which can update the graph viewport

### `@jupyrdf/jupyter-forcegraph 0.3.4`

> TBD

## `0.3.3`

### `ipyforcegraph 0.3.3`

### `@jupyrdf/jupyter-forcegraph 0.3.3`

- improves handling of `node_` and `link_preserve_columns`, respecting ordering

## `0.3.2`

### `ipyforcegraph 0.3.2`

- improves default selection behavior for `LinkShapes.curvature` and
  `LinkShapes.line_dash`
- adds `line_dash` to all 2D shapes
- removes the significance of order in `ForceGraph.behaviors`
  - all node, link, and graph behaviors now have a (sensible default) `.rank` trait
    which determines the order in which they are applied.
  - lower `rank` are applied before higher `rank`
- adds `DodoSource` for interpreting `doit` tasks graphs
- adds `node_preserve_columns`, `link_id_column`, and `link_preserve_columns`
  - these allow for keeping values when updating data, such as those created by the
    simulation engine (e.g. `x` and `y`) and custom columns, such as created by
    `Selection` behaviors
  - `link_id_column` is required if the number and or order of links change
- adds `ContinuousColor` and `OrdinalColor` color schemes, supported by
  `d3-scale-chromatic`

### `@jupyrdf/jupyter-forcegraph 0.3.2`

- adds more `jsMath` functions (`cosh`, `sinh`, `tanh`, and `hypot`) and provided more
  comprehensive documentation for them in `Behaviors.ipynb`

### Documentation

- adds `NodeShape` UI controls in `Shapes.ipynb` and `Behaviors.ipynb`
- fixes labels for UI controls in `Behaviors.ipynb`
- updates to latest JupyterLite packages
- adds non-JupyterLite-compatible examples
  - `DodoSource.ipynb` for viewing and running `doit` tasks
  - `DodoApp.ipynb` for demonstrating a full app, featuring
    - `ipylab`
    - `ipydatagrid`

## `0.3.1`

### `ipyforcegraph 0.3.1`

- fixes compatibility with `jupyterlab_widgets 3.0.6`
- adds `curvature`, `line_dash` to `LinkShapes`

### `@jupyrdf/jupyter-forcegraph 0.3.1`

## `0.3.0`

### `ipyforcegraph 0.3.0`

- adds a configurable `NodeShapes`, compatible with both `ForceGraph` and `ForceGraph3D`
  - adds initial `Text`, `Circle` and `Rectangle` which can be stacked in `.shapes`
- adds `DAG` to `GraphForces`
- adds manual `ForceGraph.reheat` to restart simulation

#### Breaking Changes

- the `column_name` and `template` features of `Behaviors` are consolidated into the
  `Nunjucks` and `Column` classes
  - each has a single `value`,
  - and may be `coerce`d into a specific JS-compatible type (e.g. `boolean` or `number`)
- most dynamic behaviors have been merged to use this pattern, diverging from the
  upstream JS API in favor of more idiomatic, compact descriptions. For example, for
  link arrows:

  - `0.2.x`
    ```py
    graph.behaviors = [
        LinkDirectionalArrowColor(column="color"),
        LinkDirectionalArrowLength(template="10"),
        LinkDirectionalArrowRelPos(template="{{ link.value / 10 }}"),
    ]
    ```
  - `0.3.x`
    ```py
    graph.behaviors = [
        LinkArrows(
            color=Column("color"),
            length=1.0,
            relative_position=Nunjucks("{{ link.value / 10 }}")
        ),
    ]
    ```

### `@jupyrdf/jupyter-forcegraph 0.3.0`

- adds connection to `force-graph` DAG configuration

## `0.2.0`

### `ipyforcegraph 0.2.0`

- raise minimum python from `3.7` to `3.8`
- improve types and add `py.typed` file
- adds `background_color` (defaults to transparent, encoded as `rgba(0, 0, 0, 0.0)`)
- adds `GraphData` which can capture the as-simulated data from the browser
- adds `LinkSelection` which mirrors `NodeSelection`, but returns link indices in
  `.source.links`, as they are not guaranteed to have a an `id` column
- adds `LinkWidths`
- adds `NodeSizes`
- adds most of the browser's `Math` functions and constants to the environment made
  available to `.template` values
- adds `GraphForces`, which exposes a large number of the forces from [`d3-force-3d`]
- renames the top-level graph imports `ipyforcegraph.graphs` (was
  `ipyforcegraph.forcegraph`)
- the `DataFrameSource`, and its new subclass `WidgetSource`, can be imported from
  `ipyforcegraph.sources`

[d3-force-3d]: https://github.com/vasturiano/d3-force-3d

### `@jupyrdf/jupyter-forcegraph 0.2.0`

- implements bidirectional serialization of `zstd`-compressed dataframes
- updates TypeScript `target` to `es2018`
- update to `3d-force-graph 1.71.1`
- update to `force-graph 1.43.0`

## `0.1.0`

### `ipyforcegraph 0.1.0`

- initial release

### `@jupyrdf/jupyter-forcegraph 0.1.0`

- initial release
