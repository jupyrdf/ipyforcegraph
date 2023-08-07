---
name: Release
about: Prepare for a release
labels: maintenance
---

- [ ] on `dev`
  - [ ] merge all outstanding PRs
    - [ ] _blocking #PR here_
  - [ ] ensure `CHANGELOG.md` is up-to-date
  - [ ] ensure the versions have been bumped
    - [ ] run `doit preflight:release`
  - [ ] ensure a last-minute
    - [ ] run `doit audit`
  - [ ] validate on ReadTheDocs
    - [ ] _URL of build_
- [ ] wait for a successful build of `dev`
  - [ ] _URL of build_
- [ ] download the `dist` archive and unpack somewhere
- [ ] create a new release through the GitHub UI
  - [ ] pick a new [release] name to go with the version of real (or imaginary) [force]
    - [ ] _name here_
  - [ ] paste in the relevant `CHANGELOG.md` entries
  - [ ] upload the artifacts
  - [ ] upload distribution to package repositories
    ```bash
    cd dist
    twine upload *.tar.gz *.whl
    npm login
    npm publish jupyrdf-jupyter-forcegraph-$VERSION.tgz
    npm logout
    ```
    - [ ] _URL on npmjs.org here_
    - [ ] _URL on pypi here_
- [ ] postmortem
  - [ ] handle `conda-forge` [feedstock] tasks
    - [ ] _URL on `conda-forge/ipyforcegraph-feedstock` here_
    - [ ] _URL on `anaconda.org`_
  - [ ] merge `dev` into `main`
  - [ ] create postmortem PR from `main` targeting `dev`
    - [ ] _PR# here_
    - [ ] bump to next development version
    - [ ] bump the `CACHE_EPOCH`
    - [ ] rebuild `yarn.lock`
    - [ ] rebuild `.github/locks`
      - [ ] run `doit env:lock`
      - [ ] run `rm -rf .github/locks`
      - [ ] from a clean command prompt
        - [ ] 🐧`source envs/lock/bin/activate`
        - [ ] 🪟 `call envs/lock/Scripts/activate.bat`
      - [ ] commit the new locks
    - [ ] update release procedures with lessons learned in
          `.github/ISSUE_TEMPLATE/release.md`

[feedstock]: https://github.com/conda-forge/ipyforcegraph-feedstock
[force]: https://en.wikipedia.org/wiki/Category:Force
[release]: https://github.com/jupyrdf/ipyforcegraph/releases
