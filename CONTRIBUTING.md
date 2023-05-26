# Contributing

## Prerequisites

- Get [Mambaforge](https://github.com/conda-forge/miniforge)
- Get [doit](https://pydoit.org) and `git`

  ```bash
  mamba install -c conda-forge doit git
  ```

- Start a command prompt with the base environment activated

## Get Started

Most work occurs on the `dev` branch of the
[GitHub repo](https://github.com/jupyrdf/ipyforcegraph): see
[below](#making-pull-requests) for more.

- Clone the repo

  ```bash
  git clone https://github.com/jupyrdf/ipyforcegraph
  cd ipyforcegraph
  git checkout dev
  doit env:dev
  ```

- Activate the environment

  | Linux/MacOS                            | Windows                         |
  | -------------------------------------- | ------------------------------- |
  | `source activate ./envs/py3.11_lab3.6` | `activate ./envs/py3.11_lab3.6` |

- Get up to a running JupyterLab

  ```bash
  doit list --all # see what you can do
  doit            # this is _basically_ what happens on binder
  doit lab        # start lab
  ```

## Important Paths

| Path             | Purpose                                                     |
| ---------------- | ----------------------------------------------------------- |
| `atest/`         | Robot Framework source for acceptance tests                 |
| `dodo.py`        | task automation tool                                        |
| `js/`            | TypeScript source for `@jupyrdf/jupyter-forcegraph`         |
| `package.json/`  | `npm` package description for `@jupyrdf/jupyter-forcegraph` |
| `pyproject.toml` | package description for `ipyforcegraph`                     |
| `src/`           | Python source for `ipyforcegraph`                           |
| `yarn.lock`      | frozen `npm` dependencies                                   |

- Run `doit` to get ready to develop
- Most commands are run with `doit all` (this is what CI does)

## Live Development

You can watch the source directory and run JupyterLab in watch mode to watch for changes
in the extension's source and automatically rebuild the extension and application.

- Run:

  ```bash
  doit watch
  ```

- Open a tab with the provided URL in a standards-compliant browser of choice
  - e.g., Firefox
- After making changes, wait for `webpack` terminal output, then reload the browser
  - output should read something like:
    ```bash
    webpack 5.75.0 compiled with 7 warnings in 1528 ms
    ```
- If you add a new file, probably will have to restart the whole thing

### Environment Variables

With `python-dotenv` (installed by default), the presence of a `.env` file will overload
any values not set in `dodo.py`. This is an `.ini`-like file, with specific examples
below.

### Logging

In the browser, `jupyter-forcegraph` should only emit `console.warn` (or higher)
messages if there's actually a problem.

For more verbose output, add `FORCEGRAPH_DEBUG` anywhere in a new browser URL, e.g.

```
http://localhost:8888/lab#FORCEGRAPH_DEBUG
```

> Note: if a message will be helpful for debugging, make sure to `import` and guard
> `console.*` or higher with `DEBUG &&`

On the python side, each `Widget` has `.log.debug` which is preferable to `print`
statements. The log level can be increased for a running kernel through the JupyterLab's
_Log Console_, opened with the _Show Log Console_ command.

## Quality Assurance

- Run:

  ```bash
  doit lint
  ```

- Ensure the [examples](https://github.com/jupyrdf/ipyforcegraph/tree/main/examples)
  work. These will be tested in CI with:
  ```bash
  nbconvert --execute
  ```
  - in JupyterLab by Robot Framework with _Restart Kernel and Run All Cells_
- If you add new features:
  - Add a new, minimal demonstration notebook to the examples.
    - Treat each feature as a function which can be reused for other examples, with:
      - the example in a humane name, e.g. `a_basic_example`
      - some suitable defaults and knobs to twiddle
  - Add appropriate links to your new example.
  - Add appropriate Robot Framework tests

### Limiting Testing

To run just _some_ acceptance tests, add something like:

```robotframework
*** Test Cases ***
Some Test
  [Tags]  some:tag
  ...
```

Create an `.env` file:

```ini
# .env
ATEST_ARGS="--exclude NOTsome:tag"
```

Then run:

```bash
doit test
```

### Full Coverage

To collect coverage from the browser and kernel, create a `.env` file like:

```ini
# .env
TOTAL_COVERAGE=1
```

Then run:

```bash
doit test
```

## Building Documentation

To build (and check the spelling and link health) of what _would_ go to
`ipyforcegraph.rtfd.io`, we:

- build with `sphinx` and `myst-nb`
- check spelling with `hunspell`
- check links with `pytest-check-links`

```bash
doit -n8 checkdocs
```

### Watch the Docs

`sphinx-autobuild` will try to watch docs sources for changes, re-build, and serve a
live-reloading website. A number of files (e.g. `_static`) won't often update correctly,
but will usually work when restarted.

```bash
doit watch_docs
```

## Making Pull Requests

There are two valid targets for pull request:

- `main`
  - [releases](#releasing)
  - fixes to the documentation
  - post-release "hot" fixes
- `dev`
  - any new features
  - anything else

## Releasing

- Make a [release] issue
- Follow the checklist

[release]:
  https://github.com/jupyrdf/ipyforcegraph/blob/main/.github/ISSUE_TEMPLATE/release.md

## Updating Dependencies

### Python Dependencies

- Edit the `dependencies` section of the [specs]

  > If this will impact multiple running contexts (e.g. testing in CI and Binder),
  > consider adding a new environment and adding it in the `_inherit_from` section.

- Run:

  ```bash
  doit lock
  ```

- Commit the changes to the env specs, [locks], and generated environments for
  [ReadTheDocs][env-rtd] and [Binder][env-binder].

  > If _all_ the lockfiles are deleted, the outer env needs `conda-lock` on `$PATH` with
  > e.g.
  >
  > ```bash
  > mamba install -c conda-forge conda-lock
  > ```

[specs]: https://github.com/jupyrdf/ipyforcegraph/tree/main/.github/specs
[locks]: https://github.com/jupyrdf/ipyforcegraph/tree/main/.github/locks
[env-rtd]: https://github.com/jupyrdf/ipyforcegraph/blob/main/docs/environment.yml
[env-binder]: https://github.com/jupyrdf/ipyforcegraph/blob/main/.binder/environment.yml

### Browser Dependencies

- Edit the appropriate section of the
  [package file](https://github.com/jupyrdf/ipyforcegraph/tree/main/package.json).
- Run:

  ```bash
  doit setup:js || doit setup:js || doit setup:js
  doit lint
  ```

- Commit the changes to the package file and the
  [yarn lock file](https://github.com/jupyrdf/ipyforcegraph/tree/main/yarn.lock).
