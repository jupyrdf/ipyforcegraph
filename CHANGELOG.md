# Changelog

## `0.2.0`

### `ipyforcegraph 0.2.0`

- raise minimum python from `3.7` to `3.8`
- improve types and add `py.typed` file
- adds `background_color` (defaults to transparent, encoded as `rgba(0, 0, 0, 0.0)`)
- adds `GraphData` which can capture the as-simulated data from the browser
- adds `LinkSelection` which mirrors `NodeSelection`, but returns link indices in
  `.source.links`, as they are not guaranteed to have a an `id` column

### `@jupyrdf/jupyter-forcegraph 0.2.0`

- implements bidirectional serialization of `zstd`-compressed dataframes
- updates TypeScript `target` to `es2018`
- update to `3d-force-graph 1.70.20`
- update to `force-graph 1.43.0`

## `0.1.0`

### `ipyforcegraph 0.1.0`

- initial release

### `@jupyrdf/jupyter-forcegraph 0.1.0`

- initial release
