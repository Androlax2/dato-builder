# [2.0.0](https://github.com/Androlax2/dato-builder/compare/v1.7.0...v2.0.0) (2025-05-04)


### Features

* **caching:** Implement caching created/updated models/blocks ([#3](https://github.com/Androlax2/dato-builder/issues/3)) ([dbc2eba](https://github.com/Androlax2/dato-builder/commit/dbc2ebaaa7c7da21ada97142f8cb9ec6d118f709))


### BREAKING CHANGES

* **caching:** Modified cache behavior and introduced locking mechanism affecting cache-dependent operations.

* refactor(ItemTypeBuilder): simplify item creation logic and improve configuration handling in tests

- Removed redundant logic for checking and updating existing items, streamlining item creation flow.
- Enhanced test cases to include global and builder-specific configuration validation.
- Added clearing of cache in `beforeEach` for consistent test setup.
- Adjusted import formatting for consistency.

* refactor(ItemTypeBuilder): remove unused code and simplify error handling

The following changes were made:
- Removed unused `itemExists` method.
- Simplified error handling by eliminating redundancy related to handling uniqueness and not-found errors during item creation and updates.

This refactor improves code maintainability and reduces complexity without altering functionality.

# [1.7.0](https://github.com/Androlax2/dato-builder/compare/v1.6.2...v1.7.0) (2025-05-04)


### Features

* **cli:** add directory support for `run` command ([113a828](https://github.com/Androlax2/dato-builder/commit/113a82848b2d2e5af73c92969304653403419b30))

## [1.6.2](https://github.com/Androlax2/dato-builder/compare/v1.6.1...v1.6.2) (2025-05-04)


### Bug Fixes

* **cli:** remove redundant newline in file type check ([73491af](https://github.com/Androlax2/dato-builder/commit/73491afb0f901bedd974f93b8cfcf09ad252ab16))

# [1.6.0](https://github.com/Androlax2/dato-builder/compare/v1.5.0...v1.6.0) (2025-05-04)


### Features

* **cli:** add `dato-builder` CLI for running JS/TS files ([4ff1996](https://github.com/Androlax2/dato-builder/commit/4ff1996dfef50d52ddda63581d020a12a1080a79))
* **cli:** add CLI entry point and update documentation ([65fd760](https://github.com/Androlax2/dato-builder/commit/65fd760faf6a3e85b9e9a3cddb4e0404088dd6c5))

# [1.5.0](https://github.com/Androlax2/dato-builder/compare/v1.4.0...v1.5.0) (2025-05-04)


### Features

* **ItemTypeBuilder:** add support for single image field ([8c5260d](https://github.com/Androlax2/dato-builder/commit/8c5260d93f38539b88784f215afb2c9a284597b4))

# [1.4.0](https://github.com/Androlax2/dato-builder/compare/v1.3.0...v1.4.0) (2025-05-04)


### Features

* **api:** add ModelBuilder export and enhance README documentation ([c481a63](https://github.com/Androlax2/dato-builder/commit/c481a63d49e2717117f41cb4b6e9ad6c93293aa4))

# [1.3.0](https://github.com/Androlax2/dato-builder/compare/v1.2.0...v1.3.0) (2025-05-04)


### Features

* **package,config:** enhance module exports and tweak defaults ([62791c3](https://github.com/Androlax2/dato-builder/commit/62791c364f18fc132126c8f8715bbd12139b0673))

# [1.2.0](https://github.com/Androlax2/dato-builder/compare/v1.1.0...v1.2.0) (2025-05-04)


### Features

* **build:** add declaration files and README documentation ([8915739](https://github.com/Androlax2/dato-builder/commit/8915739826d55a45a5183c86ad47b7b321f6a11d))

# [1.1.0](https://github.com/Androlax2/dato-builder/compare/v1.0.0...v1.1.0) (2025-05-04)


### Features

* **release:** add npm plugin to semantic-release config ([1551e37](https://github.com/Androlax2/dato-builder/commit/1551e37efa672284a2421958ba761e1be049b0c2))

# 1.0.0 (2025-05-04)


### Features

* **fields:** add ColorPicker field support ([636fce3](https://github.com/Androlax2/dato-builder/commit/636fce326c581541e7e8119c1b00e0cdac5d8f92))
* **fields:** add Link field with validation support ([e065e24](https://github.com/Androlax2/dato-builder/commit/e065e242aeeed75ef680a0a00cf08e33a8c9a19b))
* **fields:** add Location field support ([bf2dd77](https://github.com/Androlax2/dato-builder/commit/bf2dd774c94ffb36e67dafda7769ab91414732e7))
* **fields:** add ModularContent field type ([5e4b5ed](https://github.com/Androlax2/dato-builder/commit/5e4b5ed75974d81d106e4d8b084d313f348dc797))
* **fields:** add Seo field with configuration options ([3d14b9e](https://github.com/Androlax2/dato-builder/commit/3d14b9e0f50cb1d07cb60555075fed9f0be5db64))
* **fields:** add SingleAsset field support ([c6410a7](https://github.com/Androlax2/dato-builder/commit/c6410a710cb93e45d4db9ef145df74cb51fcbfff))
* **fields:** add SingleBlock field type ([93e625b](https://github.com/Androlax2/dato-builder/commit/93e625b200df4d5e51ff5ddad5b52e49b60c867c))
* **fields:** add Slug field with support for URL prefix and format validation ([94af3e2](https://github.com/Androlax2/dato-builder/commit/94af3e2ca9064201ff03972be5ef0dc24966ef25))
* **fields:** add support for date field ([372aa11](https://github.com/Androlax2/dato-builder/commit/372aa1176b78e8d3eaae6a3e4a09a8f29fd24b06))
* **fields:** add support for external video field ([4d87f36](https://github.com/Androlax2/dato-builder/commit/4d87f36225157af94fa067e4b353dc4a3473f602))
* **fields:** add support for float field type ([03f0588](https://github.com/Androlax2/dato-builder/commit/03f0588e4bf25292423080cc456e82005832b73d))
* **fields:** add support for Links field type ([aa938ad](https://github.com/Androlax2/dato-builder/commit/aa938ad1b86eda1e8d4db25884690830944136a7))
* **item-type-builder:** add support for boolean and boolean radio group fields ([050730c](https://github.com/Androlax2/dato-builder/commit/050730c44f1dba4f3a9f0e5e698d4648be6b4f84))
* **ItemTypeBuilder:** add support for asset gallery field ([161d842](https://github.com/Androlax2/dato-builder/commit/161d8423bb3195727803924963de12ac988f56f3))
* **ItemTypeBuilder:** add support for new field types ([05ef75a](https://github.com/Androlax2/dato-builder/commit/05ef75a2f3549a55490d05b8335c3350a2213c58))
* **link:** add appearance option to link field ([6149b39](https://github.com/Androlax2/dato-builder/commit/6149b398163f2ff90c528a994206d86db56f4bbe))
* **structured-text:** add structured text field and associated validators ([0e7a10b](https://github.com/Androlax2/dato-builder/commit/0e7a10beaa0f6d921e99b19e4bbba0a30d4070eb))
* **validators, fields:** add DateTime field with validation support ([94505f9](https://github.com/Androlax2/dato-builder/commit/94505f968d9640f58300bd4e1448b2eaa805ab9e))
* **validators:** add new validator classes for data validation ([4ef38e2](https://github.com/Androlax2/dato-builder/commit/4ef38e20b98078971823b5dd1ddc784f1bbb710a))
* **validators:** enhance validator configuration and handling ([b917759](https://github.com/Androlax2/dato-builder/commit/b9177593d0be3391af15febeea0b898595769406))
* **workflows:** add CI, release, and PR title validation ([ea900d3](https://github.com/Androlax2/dato-builder/commit/ea900d31f9ce5224e51290292ecfb03a176e3b35))
* **workflows:** add CI, release, and PR title validation ([79b869f](https://github.com/Androlax2/dato-builder/commit/79b869f29ec564e6e310a6de396676edaaad5301))
* **workflows:** add CI, release, and PR title validation ([928fedf](https://github.com/Androlax2/dato-builder/commit/928fedfce973a09700620a9d0a275a22eff7e11d))
