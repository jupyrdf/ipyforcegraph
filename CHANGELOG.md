# Changelog

## `0.3.0` (unreleased)

### `ipyforcegraph 0.3.0`

- Adds a configurable `NodeShape`, compatible with both `ForceGraph` and `ForceGraph3D`

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

> TBD

## `0.2.1` (unreleased)

### `ipyforcegraph 0.2.1`

- adds `DAGForce` to `GraphForces`
- adds manual `ForceGraph.reheat` to restart simulation

### `@jupyrdf/jupyter-forcegraph 0.2.1`

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
