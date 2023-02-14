# Changelog

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
