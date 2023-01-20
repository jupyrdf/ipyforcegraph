# `ipyforcegraph`

[Jupyter Widgets][widgets] for interactive 2D and 3D graphs powered by the
[force-graph][force-graph] and [3d-force-graph][3d-force-graph] libraries.

|                                       Install                                       |           Demo            |       Build       |                                     Docs                                     |
| :---------------------------------------------------------------------------------: | :-----------------------: | :---------------: | :--------------------------------------------------------------------------: |
| [![npm-badge]][npm] <br/> [![pypi-badge]][pypi] <br/> [![conda-badge]][conda-forge] | [![binder-badge]][binder] | [![ci-badge]][ci] | [![docs-badge]][docs] <br/> [Examples] <br/>[CHANGELOG] <br/> [CONTRIBUTING] |

## Screenshots

| 2D graphs                                                                                   | 3D graphs                                                                                   |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [![a screenshot of capturing animated 2D graphs][screenshot-2d-image]][screenshot-2d-image] | [![a screenshot of capturing animated 3D graphs][screenshot-3d-image]][screenshot-3d-image] |

[screenshot-2d-image]:
  https://user-images.githubusercontent.com/7581399/212385447-1eb47e5d-a8a4-4ffd-bc7d-b8d280935d35.png
[screenshot-3d-image]:
  https://user-images.githubusercontent.com/7581399/213015998-73867583-3914-4add-9199-202bf5ce663e.png

## Prerequisites

- `python >=3.8`
- `jupyterlab >=3`

## Install

`ipyforcegraph` is distributed on [conda-forge] and [PyPI].

### `ipyforcegraph` with `mamba` (recommended)

```bash
mamba install -c conda-forge ipyforcegraph jupyterlab
```

> ... or `conda`, if you _must_

### `ipyforcegraph` with `pip`

install `nodejs` with a [package manager][package-manager]

```bash
pip install ipyforcegraph jupyterlab=3
```

### Developing

See [CONTRIBUTING] for a development install.

## How it works

- Provide _Sources_ of _nodes_ and _links_ as e.g. `pandas.DataFrame`s
- Annotate with _Behaviors_ such as _NodeSelection_ and _LinkColor_
- Visualize and interact with the graph in JupyterLab (or JupyterLite)

## Uninstall

```bash
mamba uninstall ipyforcegraph
```

> ... or `conda`, if you _must_

```bash
pip uninstall ipyforcegraph
```

## Open Source

This work is licensed under the [BSD-3-Clause License][license].

[license]: https://github.com/jupyrdf/ipyforcegraph/tree/main/LICENSE.txt
[docs]: https://ipyforcegraph.rtfd.io
[docs-badge]: https://readthedocs.org/projects/ipyforcegraph/badge/?version=latest
[examples]: https://github.com/jupyrdf/ipyforcegraph/tree/main/examples/_index.ipynb
[contributing]: https://github.com/jupyrdf/ipyforcegraph/tree/main/CONTRIBUTING.md
[changelog]: https://github.com/jupyrdf/ipyforcegraph/tree/main/CHANGELOG.md
[ci-badge]: https://github.com/jupyrdf/ipyforcegraph/workflows/CI/badge.svg
[ci]: https://github.com/jupyrdf/ipyforcegraph/actions?query=workflow%3ACI+branch%3Amain
[binder-badge]: https://mybinder.org/badge_logo.svg
[binder]:
  https://mybinder.org/v2/gh/jupyrdf/ipyforcegraph/main?urlpath=lab%2Ftree%2Fexamples%2F_index.ipynb
[force-graph]: https://github.com/vasturiano/force-graph
[3d-force-graph]: https://github.com/vasturiano/3d-force-graph
[jupyterlab]: https://github.com/jupyterlab/jupyterlab
[networkx]: https://networkx.github.io
[widgets]: https://jupyter.org/widgets
[npm-badge]: https://img.shields.io/npm/v/@jupyrdf/jupyter-forcegraph
[npm]: https://www.npmjs.com/package/@jupyrdf/jupyter-forcegraph
[pypi]: https://pypi.org/project/ipyforcegraph
[pypi-badge]: https://img.shields.io/pypi/v/ipyforcegraph
[conda-badge]: https://img.shields.io/conda/vn/conda-forge/ipyforcegraph
[conda-forge]: https://anaconda.org/conda-forge/ipyforcegraph/
[package-manager]: https://nodejs.org/en/download/package-manager
