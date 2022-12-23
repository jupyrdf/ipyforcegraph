# `ipyforcegraph`

[Jupyter Widgets][widgets] for interactive graphs powered by the
[force-graph][forcegraph] library.

|                                       Install                                       |           Demo            |       Build       |                                     Docs                                     |
| :---------------------------------------------------------------------------------: | :-----------------------: | :---------------: | :--------------------------------------------------------------------------: |
| [![npm-badge]][npm] <br/> [![pypi-badge]][pypi] <br/> [![conda-badge]][conda-forge] | [![binder-badge]][binder] | [![ci-badge]][ci] | [![docs-badge]][docs] <br/> [Examples] <br/>[CHANGELOG] <br/> [CONTRIBUTING] |

## Screenshots

_TODO_

## Prerequisites

- `python >=3.7`

### JupyterLab compatibility

| `jupyterlab` | `ipyforcegraph` | special concerns |
| ------------ | --------------- | ---------------- |
|              |                 |                  |

## Install

`ipyforcegraph` is distributed on [conda-forge] and [PyPI].

### `ipyforcegraph` with `conda` (recommended)

```bash
conda install -c conda-forge ipyforcegraph jupyterlab=3
```

### `ipyforcegraph` with `pip`

install `nodejs` with a [package manager][package-manager]

```bash
pip install ipyforcegraph jupyterlab=3
```

### Developing

See [CONTRIBUTING] for a development install.

## How it works

_TODO_

## Uninstall

```bash
pip uninstall ipyforcegraph
```

## Open Source

This work is licensed under the [BSD-3-Clause License][license].

[license]: https://github.com/jupyrdf/ipyforcegraph/tree/main/LICENSE.txt
[docs]: https://ipyforcegraph.readthedocs.org
[docs-badge]: https://readthedocs.org/projects/ipyforcegraph/badge/?version=latest
[examples]: https://github.com/jupyrdf/ipyforcegraph/tree/main/examples/_index.ipynb
[contributing]: https://github.com/jupyrdf/ipyforcegraph/tree/main/CONTRIBUTING.md
[changelog]: https://github.com/jupyrdf/ipyforcegraph/tree/main/CHANGELOG.md
[ci-badge]: https://github.com/jupyrdf/ipyforcegraph/workflows/CI/badge.svg
[ci]: https://github.com/jupyrdf/ipyforcegraph/actions?query=workflow%3ACI+branch%3Amain
[binder-badge]: https://mybinder.org/badge_logo.svg
[binder]:
  https://mybinder.org/v2/gh/jupyrdf/ipyforcegraph/main?urlpath=lab%2Ftree%2Fexamples%2F_index.ipynb
[forcegraph]: https://github.com/vasturiano/force-graph
[jupyterlab]: https://github.com/jupyterlab/jupyterlab
[networkx]: https://networkx.github.io
[widgets]: https://jupyter.org/widgets
[npm-badge]: https://img.shields.io/npm/v/@jupyrdf/jupyter-forcegraph
[npm]: https://www.npmjs.com/package/@jupyrdf/jupyter-ipyforcegraph
[pypi]: https://pypi.org/project/ipyforcegraph
[pypi-badge]: https://img.shields.io/pypi/v/ipyforcegraph
[conda-badge]: https://img.shields.io/conda/vn/conda-forge/ipyforcegraph
[conda-forge]: https://anaconda.org/conda-forge/ipyforcegraph/
[package-manager]: https://nodejs.org/en/download/package-manager
