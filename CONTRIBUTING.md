# Contributing to `ipyforcegraph`

## Install

- Get [Mambaforge](https://github.com/conda-forge/miniforge)
- Get [doit](https://pydoit.org)

```bash
mamba install doit
```

## Get Started

```bash
git clone https://github.com/jupyrdf/ipyforcegraph
cd ipyforcegraph
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
- After making changes, wait for `webpack` terminal output, then reload the browser
- If you add a new file, probably will have to restart the whole thing

### Logging

In the browser, `jupyter-forcegraph` should only emit `console.warn` (or higher)
messages if there's actually a problem.

For more verbose output, add `FORCEGRAPH_DEBUG` anywhere in a new browser URL, e.g.

```
http://localhost:8888/lab#FORCEGRAPH_DEBUG
```

> Note: if a message will be helpful for debugging, make sure to `import` and guard
> `console.*` or higher with `FORCEGRAPH_DEBUG &&`

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
  - `nbconvert --execute`
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

Then run:

```bash
ATEST_ARGS="--exclude NOTsome:tag" doit test:atest
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

## Releasing

- After merging to `main`, download the ipyforcegraph dist artifacts
- Inspect the files in `./dist`.
- Check out `main`
- Tag appropriately

```bash
git push upstream --tags
```

- Ensure you have credentials for `pypi` and `npmjs`
  - `npmjs` requires you have set up two-factor authentication (2FA)... this is
    _strongly recommended_ for `pypi`
  - do _not_ use `jlpm publish` or `yarn publish`, as this appears to drop files from
    the distribution

```bash
npm login
npm publish
npm logout
twine upload where-you-expanded-the-archive/ipyforcegraph-*
```

## Updating Dependencies

### Python Dependencies

- Edit the `dependencies` section of
  [environment specs](https://github.com/jupyrdf/ipyforcegraph/tree/main/.github/env_specs/)
  or the
  [binder environment](https://github.com/jupyrdf/ipyforcegraph/tree/main/.binder/environment.yml).
- Run:

```bash
doit lock
```

- Commit the changes to the env specs and the
  [lock files](https://github.com/jupyrdf/ipyforcegraph/tree/main/.github/locks).

> if you delete _all_ the lockfiles, you'll need to `conda-lock` on path with e.g.
>
> ```bash
> mamba install -c conda-forge conda-lock
> ```

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
