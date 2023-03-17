# `ipyforcegraph`

[Jupyter Widgets][widgets] for interactive 2D and 3D graphs powered by the
[force-graph][force-graph] and [3d-force-graph][3d-force-graph] libraries.

|                                       Install                                       |                                      Demo                                       |       Build       |                                     Docs                                     |
| :---------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------: | :---------------: | :--------------------------------------------------------------------------: |
| [![npm-badge]][npm] <br/> [![pypi-badge]][pypi] <br/> [![conda-badge]][conda-forge] | [![binder-badge-stable]][binder-stable] <br/> [![binder-badge-dev]][binder-dev] | [![ci-badge]][ci] | [![docs-badge]][docs] <br/> [Examples] <br/>[CHANGELOG] <br/> [CONTRIBUTING] |

## Screenshots

|            | 2D graphs                                                                                   | 3D graphs                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| demos      | [![a screenshot of capturing animated 2D graphs][screenshot-2d-image]][screenshot-2d-image] | [![a screenshot of capturing animated 3D graphs][screenshot-3d-image]][screenshot-3d-image] |
| text nodes | [![a screenshot of text nodes in 2D][screenshot-2d-text]][screenshot-2d-text]               | [![a screenshot of text nodes in 2D][screenshot-3d-text]][screenshot-3d-text]               |

[screenshot-2d-image]:
  https://user-images.githubusercontent.com/7581399/212385447-1eb47e5d-a8a4-4ffd-bc7d-b8d280935d35.png
[screenshot-3d-image]:
  https://user-images.githubusercontent.com/7581399/213015998-73867583-3914-4add-9199-202bf5ce663e.png
[screenshot-2d-text]:
  https://user-images.githubusercontent.com/7581399/222569280-3a5141d0-c01d-4726-af7d-5e08d43fe429.png
[screenshot-3d-text]:
  https://user-images.githubusercontent.com/7581399/222568840-2a6679a0-4ce3-4ad3-9317-25504c2d2723.png

## Prerequisites

- `python >=3.8`
- `jupyterlab >=3`

## Install

`ipyforcegraph` is distributed on [conda-forge] and [PyPI].

### Installing `ipyforcegraph` with `mamba` (recommended)

```bash
mamba install -c conda-forge ipyforcegraph jupyterlab
```

> ... or `conda`, if you _must_

### Installing `ipyforcegraph` with `pip`

install `nodejs` with a [package manager][package-manager]

```bash
pip install ipyforcegraph jupyterlab=3
```

<details>

<summary>
  <b>Installing development <code>ipyforcegraph</code> with <code>pip</code></b>
</summary>

<blockquote>
  Relying on this distribution for <i>any</i> purpose outside of testing is
  <b>strongly discouraged</b>.
</blockquote>

The latest development release is also published along with the documentation. Replacing
`X.Y.Z` with the current version of
<a href="https://github.com/jupyrdf/ipyforcegraph/tree/dev"><code>dev</code></a>, the
following should give the latest snapshot.

<pre>
pip install -U https://ipyforcegraph.rtfd.io/en/latest/_static/ipyforcegraph-X.Y.Z-py3-none-any.whl
</pre>

... or

<pre>
pip install -U https://ipyforcegraph.rtfd.io/en/latest/_static/ipyforcegraph-X.Y.Z.tar.gz
</pre>

</details>

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
[binder-dev]:
  https://mybinder.org/v2/gh/jupyrdf/ipyforcegraph/dev?urlpath=lab%2Ftree%2Fexamples%2F_index.ipynb
[binder-stable]:
  https://mybinder.org/v2/gh/jupyrdf/ipyforcegraph/main?urlpath=lab%2Ftree%2Fexamples%2F_index.ipynb
[binder-badge-dev]:
  https://img.shields.io/badge/binder-dev-F5A252.svg?logo=data:image/png;base64,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
[binder-badge-stable]:
  https://img.shields.io/badge/binder-stable-579ACA.svg?logo=data:image/png;base64,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
