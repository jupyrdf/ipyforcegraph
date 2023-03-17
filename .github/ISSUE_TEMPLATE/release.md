---
name: Release
about: Prepare for a release
labels: maintenance
---

- [ ] on `dev`
  - [ ] merge all outstanding PRs
    - [ ] _blocking #PR here_
  - [ ] ensure the versions have been bumped
    - [ ] run `doit preflight:release`
      - [ ] `pyproject.toml`
      - [ ] `package.json`
    - [ ] `README.md` binder badges (`stable` will be broken until tagged)
  - [ ] ensure `CHANGELOG.md` is up-to-date
  - [ ] validate on binder
    - [ ] _URL of binder_
  - [ ] validate on ReadTheDocs
    - [ ] _URL of build_
- [ ] make a PR from `dev` to `main`
- [ ] wait for a successful build of `main`
  - [ ] _URL of build_
- [ ] download the `dist` archive and unpack somewhere
- [ ] create a new release through the GitHub UI
  - [ ] pick a release name from real (or imaginary) [forces]
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
  - [ ] validate on binder via simplest-possible gists
    - [ ] pip `requirements.txt`
      - [ ] _URL of pip binder here_
    - [ ] conda `environment.yml`
      - [ ] _URL of conda binder here_
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
        - [ ] 🪟 `call envs/lock/Scripts/activate.bat`)
      - [ ] run `doit lock`
      - [ ] commit the new locks
    - [ ] update release procedures with lessons learned in
          `.github/ISSUE_TEMPLATE/release.md`

[forces]: https://en.wikipedia.org/wiki/Category:Force
[feedstock]: https://github.com/conda-forge/ipyforcegraph-feedstock
