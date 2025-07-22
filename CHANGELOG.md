# [4.0.0-beta.9](https://github.com/Androlax2/dato-builder/compare/v4.0.0-beta.8...v4.0.0-beta.9) (2025-07-22)


### Bug Fixes

* ensure version replacement runs after package.json version update ([cdc59a8](https://github.com/Androlax2/dato-builder/commit/cdc59a84f9739ac5d21971e6b1e9e7635549844b))
* use namespace import for inflection to resolve ES module ([01a61a9](https://github.com/Androlax2/dato-builder/commit/01a61a9fa43fc844d6302c1c1f4557414be4a474))

# [4.0.0-beta.8](https://github.com/Androlax2/dato-builder/compare/v4.0.0-beta.7...v4.0.0-beta.8) (2025-07-22)


### Bug Fixes

* rebuild package with correct version during release ([6e84ba2](https://github.com/Androlax2/dato-builder/commit/6e84ba2cbcd8662732b009ba7f01f59ba99c5892))
* update dependencies to version 30.0.5 and remove npm cache from release workflow ([61986dc](https://github.com/Androlax2/dato-builder/commit/61986dcbd684896352356603e207303a7ac570ee))

# [4.0.0-beta.7](https://github.com/Androlax2/dato-builder/compare/v4.0.0-beta.6...v4.0.0-beta.7) (2025-07-22)


### Bug Fixes

* optimize npm install performance in release workflow ([48532e5](https://github.com/Androlax2/dato-builder/commit/48532e500acff25a0ae132e257a70f768c3216d5))

# [4.0.0-beta.6](https://github.com/Androlax2/dato-builder/compare/v4.0.0-beta.5...v4.0.0-beta.6) (2025-07-22)


### Bug Fixes

* remove problematic npm ci flags in release workflow ([3ff2a94](https://github.com/Androlax2/dato-builder/commit/3ff2a94dc9fa558fc9e7d74c90d3bac8f831c679))

# [4.0.0-beta.5](https://github.com/Androlax2/dato-builder/compare/v4.0.0-beta.4...v4.0.0-beta.5) (2025-07-22)


### Bug Fixes

* ensure inflection dependency is properly bundled ([4572c97](https://github.com/Androlax2/dato-builder/commit/4572c976e3f2c885b2bf7d303137d0178e802043))

# [4.0.0-beta.4](https://github.com/Androlax2/dato-builder/compare/v4.0.0-beta.3...v4.0.0-beta.4) (2025-07-22)


### Features

* add environment configuration options to README and update examples ([81e5eb1](https://github.com/Androlax2/dato-builder/commit/81e5eb1ede6eeb78225e6a7ead1b98a748fb5fcc))
* add environment handling in configuration and tests for DatoBuilderConfig ([bb01716](https://github.com/Androlax2/dato-builder/commit/bb0171627c7532e1c15320adb8a4b696ff179a42))
* add environment option to CommandBuilder for environment specification ([87f7cc9](https://github.com/Androlax2/dato-builder/commit/87f7cc9d548746e697d51719692e8e889da512e2))
* add environment property to DatoBuilderConfig for logging and behavior customization ([efb7663](https://github.com/Androlax2/dato-builder/commit/efb766320b3bbe2aa88feb87ef9e975a9d259e3f))
* add integration tests and configuration for environment-specific builds ([062cb64](https://github.com/Androlax2/dato-builder/commit/062cb6473c8945f7efd5e73c0afec713ea0afed4))
* enhance configuration loading with environment override and logging ([a701d39](https://github.com/Androlax2/dato-builder/commit/a701d3913eb7e0fce911dc983bd15510c5f154a1))
* include environment in DatoApi client initialization for ItemTypeBuilder and RunCommand ([1b2e3dd](https://github.com/Androlax2/dato-builder/commit/1b2e3dd7cc0ace19f1cdc0f6c95e645598cc8a42))
* replace DatoBuilderConfig with ResolvedDatoBuilderConfig across multiple files ([255f4b4](https://github.com/Androlax2/dato-builder/commit/255f4b466285d8132145e6b55b0cd08f7220cf4a))
* set default environment to 'main' in configuration loading ([fcfd22b](https://github.com/Androlax2/dato-builder/commit/fcfd22b366b92696be6ebf6203a716f23afc810d))

# [4.0.0-beta.3](https://github.com/Androlax2/dato-builder/compare/v4.0.0-beta.2...v4.0.0-beta.3) (2025-07-22)


### Bug Fixes

* enhance release workflow to check and run integration tests based on changes ([d88a8d8](https://github.com/Androlax2/dato-builder/commit/d88a8d8d5c40e93b4de814c186048fabf36400dd))
* remove detect-changes job from integration tests workflow and simplify triggers ([acf55db](https://github.com/Androlax2/dato-builder/commit/acf55db5f6351dc45f32ea6d849ef5e1865f2607))
* remove integration test requirement check from release workflow ([7d1b78e](https://github.com/Androlax2/dato-builder/commit/7d1b78e597c4cf09044b816899dbf22734bc192a))
* remove outdated troubleshooting section from README.md ([89ed42a](https://github.com/Androlax2/dato-builder/commit/89ed42ad2c49955fc4e81b7778b945abcb3d55d8))
* update .npmignore to include additional configuration and development files ([3f52d9e](https://github.com/Androlax2/dato-builder/commit/3f52d9e5b9d82f699afeea3d5af4c7a8e586c7f0))
* update package.json and package-lock.json to include @commander-js/extra-typings dependency ([1116d2e](https://github.com/Androlax2/dato-builder/commit/1116d2e09696a726abf3cd0a537e2b3fbbd1da4d))
* update tsconfig.build.json to retain comments and adjust internal stripping ([189cf47](https://github.com/Androlax2/dato-builder/commit/189cf472f8fb35e7f82ac7e16188543035b1fe98))


### Features

* add concurrency control to integration tests job in on-demand workflow ([683365d](https://github.com/Androlax2/dato-builder/commit/683365dc1f90942b1764ccbfff63c61627feab1f))
* add integration tests on demand workflow triggered by comments and manual dispatch ([9a063e8](https://github.com/Androlax2/dato-builder/commit/9a063e8757ecaecb5c53993b0d506aab1822f1e2))
* enhance CI workflow with manual dispatch and integration change detection ([89b718b](https://github.com/Androlax2/dato-builder/commit/89b718bf8687c25aac76636ac2aa121434694979))

# [4.0.0-beta.2](https://github.com/Androlax2/dato-builder/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2025-07-22)


### Bug Fixes

* update .gitignore to include src/datocms directory ([a0a6492](https://github.com/Androlax2/dato-builder/commit/a0a6492be265d7c59a97b06f40ae7af2cf8eb060))
* update spellcheck command to suppress progress and summary output ([f201708](https://github.com/Androlax2/dato-builder/commit/f201708f473cc623579cc1e30899199c2ddb9f2b))


### Features

* add new blocks for accessibility features, fare management, and event tracking ([d9f8090](https://github.com/Androlax2/dato-builder/commit/d9f8090a626df52ec9523d5a7cc6638f04166c75))

# [4.0.0-beta.1](https://github.com/Androlax2/dato-builder/compare/v3.8.0...v4.0.0-beta.1) (2025-07-22)


### Bug Fixes

* **release:** update NPM_TOKEN to NODE_AUTH_TOKEN in release workflow ([b73371f](https://github.com/Androlax2/dato-builder/commit/b73371f469bb40e0af349f727f33b393ac1811ae))


### Code Refactoring

* **core:** overhaul CLI, API, config & builder modules ([#26](https://github.com/Androlax2/dato-builder/issues/26)) ([#27](https://github.com/Androlax2/dato-builder/issues/27)) ([e9e4155](https://github.com/Androlax2/dato-builder/commit/e9e4155acce7614a1fe2362e7ddff04f76ec381f)), closes [#28](https://github.com/Androlax2/dato-builder/issues/28) [#29](https://github.com/Androlax2/dato-builder/issues/29)


### BREAKING CHANGES

* **core:** Removed `getDatoClient` and `loadDatoBuilderConfig`. Any code importing or calling those functions, or relying on their types/validation, will need to be updated or replaced.

* refactor(builder): simplify constructors and streamline configuration handling

- Unified constructor arguments into options objects (`BlockBuilderOptions`, `ModelBuilderOptions`, and `ItemTypeBuilderOptions`) for better readability and maintainability.
- Removed redundant `mergeConfig` method in favor of static default configuration merging.
- Replaced `client` usage with `api.client` in `ItemTypeBuilder` methods to improve clarity.
- Removed debug logging statements to reduce noise and emphasize essential information.
- Added `getContentHash` method as a replacement for `computeHash`.
* **core:** Constructor signatures for `BlockBuilder`, `ModelBuilder`, and `ItemTypeBuilder` have changed to use object-based options. This may require updates to instantiations of these classes. Additionally, the `mergeConfig` method has been removed, and any client initialization outside `api.client` is outdated.

* refactor(builder): replace ItemTypeBuilderConfig with DatoBuilderConfig

- Removed `ItemTypeBuilderConfig` and consolidated configurations into `DatoBuilderConfig` for consistency.
- Updated `BlockBuilder`, `ModelBuilder`, and `ItemTypeBuilder` to use `DatoBuilderConfig` with `Required` for stricter type enforcement.
- Simplified configuration merging by removing static defaults in `ItemTypeBuilder`.
* **core:** `ItemTypeBuilderConfig` has been removed and replaced with `DatoBuilderConfig`. Constructors for builders and methods using configuration now require updates to conform to the new type. Static defaults for configuration merging are no longer applied.

* refactor(config): streamline config loading with static defaults

- Moved static defaults to a `DEFAULTS` constant for improved clarity and maintainability.
- Consolidated `loadBaseConfig` and `loadConfig` into a single `loadConfig` method while integrating default values with user-provided configurations.
- Updated `DatoBuilderConfig` types to allow `null` values for `modelApiKeySuffix` and `blockApiKeySuffix`.
- Enhanced configuration validity checks to minimize redundant logic.

* refactor(cli,config): streamline config handling and CLI initialization

- Updated `CLI` class to accept a fully-loaded `Required<DatoBuilderConfig>` instead of relying on `ConfigParser` internally.
- Modified `ConfigParser` to return a `Required<DatoBuilderConfig>` type, enforcing stricter type safety.
- Consolidated CLI initialization logic with an async IIFE for more concise and maintainable setup.
- Improved error handling by adding a process exit on unhandled exceptions during CLI execution.
- Simplified `validateConfig` method by removing redundant async behavior and improving type usage for better clarity.

* refactor(cli): replace CLI class with RunCommand execution

- Removed the `CLI` class and replaced it with a more streamlined `RunCommand` implementation for better modularity and maintainability.
- Updated the CLI initialization to configure and execute `RunCommand` with necessary paths and logger.
- Adjusted the `WARN` log format in `ConsoleLogger` for cleaner output.
- Minor adjustments to `package-lock.json` due to dependency changes.

* refactor(commands): optimize discoverAllFiles with concurrent glob calls

- Replaced individual `glob` calls with `Promise.all` for concurrent file discovery, improving performance and clarity.
- Maintains existing functionality while enhancing the efficiency of file scanning.

* refactor(commands): remove unused code and improve type safety

- Removed unused `console.log` and commented-out code for better clarity and maintainability.
- Improved type safety by refining return type annotations and adding `ItemTypeBuilder` casts.
- Added `getBlockFiles` and `getModelFiles` utility methods to simplify file filtering.
- Optimized caching logic in `getOrCreateBlock` and `getOrCreateModel` to enhance readability and reduce redundancy.
- No functional changes; focuses strictly on code quality improvements.

* refactor(builder,commands): remove unused code and enhance clarity

- Removed unused `GenericDatoError`, redundant logging, and commented-out code to streamline `ItemTypeBuilder` methods.
- Refactored error handling in cache-related methods to replace log warnings with direct `Error` throwing for consistency.
- Simplified `acquireLock` and `releaseLock` by removing nested `try-catch` blocks.
- Replaced inline `DatoApiKey` type definitions with a new unified `DatoApiKeyOptions` interface for improved reusability.
- Migrated `DatoBuilderConfig` and `BuilderContext` to dedicated files under `src/types` for better organization.
- Updated `RunCommand` to use a centralized `getContext` method to construct the `BuilderContext` dynamically, reducing redundancy.
* **core:** Improved type usage and configuration structure may require updates:
- `GenericDatoError` is no longer available.
- `DatoBuilderConfig` type was moved to `src/types/DatoBuilderConfig.ts`.
- Any direct usage of `config` fields now requires access through the `BuilderContext`.

* refactor(logger,validators,config): add log level handling and async item type resolution

- Introduced `getLogLevel` utility to map configuration log levels to `LogLevel` constants for consistent logger initialization.
- Enhanced `ConsoleLogger` usage across builders and commands by dynamically setting log levels.
- Updated `ItemItemTypeValidator` and `RichTextBlocksValidator` to support async resolution of `item_types`, enabling both static strings and promises.
- Improved `syncFields` in `ItemTypeBuilder` with detailed debug logs for creating, updating, and deleting fields.
- Added `logLevel` option to `DatoBuilderConfig` with default `info` level for better configurability.
- Adjusted `ConfigParser` to include `logLevel` in its default configuration.

* refactor(logger,itemTypeBuilder): enhance context-aware logging and field sync debug messages

- Added `LogContext` to `ConsoleLogger` for richer, context-aware log messages, including support for dynamic context propagation through `child` loggers.
- Introduced detailed debug logs in `ItemTypeBuilder` to improve tracking of field creation, updates, and deletions during the `syncFields` process.
- Added `debugJson` and `debugJsonCompact` methods to `ConsoleLogger` for formatted JSON debugging.
- Updated `getLogLevel` utility to support optional and null log levels.

* refactor(validators): add support for async validator results

- Updated `build` method to handle both synchronous and asynchronous validator results.
- Ensure `Promise`-based results are resolved and properly set in the final object.
- Improved type checks to account for undefined and asynchronous values.

* refactor(commands, itemTypeBuilder): add dependency analysis and topological sort

- Implemented `analyzeDependencies` to determine dependencies between blocks and models during build.
- Added `topologicalSort` to resolve dependencies and ensure correct build order.
- Enhanced `RunCommand` to handle dependency-aware builds with detailed logging.
- Updated `ItemTypeBuilder` to include cache clearing functionality for improved consistency.

* refactor(validators): simplify item_types handling and remove async resolution

- Updated `ItemItemTypeValidator` and `RichTextBlocksValidator` to directly accept `string[]` for `item_types`, removing support for `Promise` resolution.
- Simplified `build` methods in both validators by removing asynchronous processing logic.
- Adjusted `Validator` interface to reflect changes, making `build` exclusively synchronous.
- Streamlined `Validators` aggregation logic by ensuring all `build` results are direct objects without Promises, enhancing predictability and reducing complexity.

* refactor(config): update TypeScript target to es2015 in tsconfig.json

- Changed `target` in `tsconfig.json` from `es5` to `es2015` to enable modern JavaScript features.
- This update improves compatibility with newer tools and runtime environments.
* **core:** The `ItemTypeBuilder` no longer supports caching or lockfile mechanisms. Any code relying on these features will need to be updated.

* refactor(itemTypeBuilder): remove pending operation logic

- Removed `pendingOperations` and associated methods (`cleanPendingOperations`, `waitForPendingOperation`, `handlePendingOperation`) due to redundancy and complexity.
- Simplified `create` and `update` methods by directly handling item type creation and updates without pending operation tracking.
- Eliminated `PendingOperation` interface and related constants for timeout handling.
* **core:** `ItemTypeBuilder` no longer supports pending operation tracking. Any dependent workflows must adapt to the updated logic where operations are executed directly without in-flight tracking.

* feat(commands,cache): integrate ItemTypeCacheManager for block and model caching

- Added `ItemTypeCacheManager` to enable caching for blocks and models during build processes.
- Updated `RunCommand` to utilize `ItemTypeCacheManager` for efficient cache handling of block and model IDs.
- Refactored `getHash` method to replace `getContentHash` in `ItemTypeBuilder`.
- Adjusted CLI to initialize and pass the cache manager to `RunCommand`.
- Introduced `.dato-builder-cache` folder to store cache data.
* **core:** Replaced in-memory caching logic in `RunCommand` with `ItemTypeCacheManager`. Any workflows or extensions relying on the previous cache implementation must adapt to the new cache model that utilizes persistent storage.

* feat(commands,cache): improve cache validation and logging in RunCommand

- Added logic to validate cache entries by comparing hashes during block and model builds.
- Ensured cached items with matching hashes are reused, reducing redundant builds.
- Introduced `builtFromCache` tracking to differentiate between cached and newly built items.
- Added detailed execution summary logs including success/failure counts, cache usage, and actual builds.
- Updated `ConfigParser` to use debug logging instead of info for configuration file loading.
- Enhanced logging for block/model cache usage to include hash comparison details, improving debugging clarity.

* refactor(cache): update import syntax to use `node:` prefix

- Replaced "fs" and "path" imports with "node:fs" and "node:path" for consistency with newer Node.js module resolution standards.
- Ensures clarity and modern compliance when referencing built-in Node.js modules.

* refactor(commands): split RunCommand into modular components

- Extracted `FileDiscoverer`, `DependencyAnalyzer`, `ItemBuilder`, and other logic into standalone classes to enhance separation of concerns.
- Improved code readability, reuse, and testability by modularizing functionality.
- Updated `RunCommand` to orchestrate these components for a more structured execution flow.
- Refactored dependency management and build execution to work with the new modular design.

* refactor(commands): enhance cache management and error handling in ItemBuilder

- Introduced `ItemBuildError` for consistent error reporting with additional context such as item type, name, and cause.
- Added caching mechanisms for loaded modules and computed hashes (`moduleCache` and `hashCache`) to reduce redundant computations and imports.
- Enhanced `tryUseCache` and `computeHash` methods to utilize the new caching logic and improve efficiency.
- Refactored `buildFromSource` to consolidate and validate builder loading, avoiding redundant hash calculations.
- Added new methods `loadModule`, `validateBuilderType`, and `clearCaches` for better modularity and maintainability.
- Improved logging around cache usage and cache invalidation, ensuring better debugging and clarity.

* feat(runCommand): add custom error type and suggestions for missing items

- Introduced `ItemNotFoundError` for more detailed error reporting, including item type, name, and available alternatives.
- Added `getAvailableItems` method to provide a list of valid items by type, combining cache and file map data.
- Implemented `findSimilarItems` and `buildItemNotFoundMessage` to suggest potential matches for misspelled item names and improve user feedback.
- Enhanced debugging with methods for cache clearing and retrieving debug info.
- Improves usability and diagnostics for missing block or model issues.

* feat(cli): add ListCommand to support listing blocks and models

- Introduced `ListCommand` to list blocks and models with format options (`table`, `json`, `simple`).
- Added filtering by type (`blocks`, `models`, `all`) and support for showing cached and stale items.
- Enhanced summary display with detailed counts of items, cached status, and stale items.
- Updated CLI to integrate `ListCommand` alongside build, debug, and clear cache functionalities.
- Improved code maintainability by modularizing CLI command logic.
* **core:** All debug-related methods and the `ExecutionSummary` logic have been removed. This may impact workflows relying on detailed execution summaries or debug gathering functionalities.

* feat(config): set defaults for API key suffixes in ConfigParser

- Added default values for `modelApiKeySuffix` ("model") and `blockApiKeySuffix` ("block") in `ConfigParser` for improved consistency.
- Updated `DatoBuilderConfig` type with `@default` annotations for clarity and documentation purposes.

* refactor(run): enhance error handling and logging in build process

- Updated `RunCommand` to clear progress bar upon encountering errors, improving feedback clarity.
- Added `hasErrors` flag to track and manage error state during builds.
- Refined logging by replacing `errorJson` with `traceJson` in `ItemBuilder` to align with improved traceability standards.
- Suppressed progress output after the first error to prevent misleading visuals.
- Improved separation of progress updates and error handling logic for better maintainability.

* feat(cache): add skipReads option for CacheManager and CLI support

- Introduced `skipReads` option to `CacheManager` to allow disabling cache reads.
- Updated `initialize`, `get`, `set`, and other cache methods to respect the `skipReads` flag, effectively bypassing cache operations when enabled.
- Enhanced CLI with `--no-cache` flag to control cache behavior during execution.
- Improved logging in `BuildExecutor` and `cli` to reflect cache usage-related options and behavior.

* refactor(cli,commands): remove ListCommand and related functionalities

- Removed `ListCommand` and its integration within the CLI.
- Deleted associated logging, file discovery, and item filtering logic.
- Simplified CLI by removing unused `list` command handlers and redundant code in `RunCommand`.
- Enhanced `buildExecutor` in `RunCommand` to replace progress logic with concise logging for better consistency.
- Updated related types and dependencies to reflect the removal of `ListCommand`.
- Streamlined `CLI` initialization by removing the `list` command setup.
* **core:** `ListCommand` has been fully removed, along with its options and summaries. Any workflows or CLI scripts relying on the `list` command need to be updated or replaced.

* refactor(run): remove outdated TODO comment in ItemBuilder

- Deleted a redundant and outdated TODO comment regarding cache persistence in `ItemBuilder`.
- Simplifies code readability with no functional changes.

* feat(build): replace tsconfig-paths with tsx and update dependencies

- Removed `tsconfig-paths` and replaced it with `tsx` for improved TypeScript execution and compatibility.
- Added `get-tsconfig`, `resolve-pkg-maps`, and `esbuild` dependencies to the project.
- Integrated platform-specific optional dependencies under `esbuild` for better build flexibility and compatibility.
- Updated `package-lock.json` to reflect the addition and removal of dependencies.

* feat(cli): add deletion detection

* feat(itemTypeBuilder): enhance update logic with name-based item type resolution

- Added support for resolving existing item types by name when no ID is provided.
- Enabled passing an optional `existingId` to the `update` method for direct item type updates.
- Improved error handling with detailed logs for missing item types by name.
- Introduced additional logging for update body preparation and API calls for enhanced traceability.
- Removed unused `NotFoundError` import for cleaner code.

* feat(cli,runCommand): add support for concurrent builds with customizable concurrency levels

- Introduced `--concurrent`, `--concurrency`, and `--auto-concurrency` CLI options to manage build concurrency.
- Added logic to determine concurrency levels automatically based on CPU cores (`--auto-concurrency`).
- Updated `RunCommand` to execute builds sequentially or concurrently based on the concurrency options.
- Implemented a new `buildConcurrently` method to handle concurrent builds with dependency resolution.
- Improved logging to reflect progress, concurrency levels, and potential deadlock detection.

* refactor(runCommand): enhance concurrent build handling and deadlock detection

- Updated `buildConcurrently` to process all completed builds instead of waiting on the first one.
- Improved handling of rejected promises with detailed error logging.
- Enhanced safety checks to detect and log circular or missing dependencies more effectively.
- Refactored deadlock detection to include missing dependency details for better debugging.
- Streamlined progress logging and cleared `inProgress` map after processing builds.

* refactor(ConfigParser): streamline configuration loading and enhance error handling

* refactor(tests): remove unnecessary afterEach and simplify test command

* refactor(ItemTypeBuilder): update constructor to accept a configuration object

* refactor(mockConfig): add mock configuration utility for DatoBuilder

* refactor(mockConfig): enhance createMockConfig to accept partial configuration

* refactor(tests): clean up test cases and improve mock configurations

* refactor(biome): change complexity and nursery rules from error to warn

* refactor(CacheManager): simplify cache handling by always initializing items

* refactor(FileDiscoverer): add tests for file discovery functionality and improve module imports

* refactor(ItemBuilder): add comprehensive tests for buildItem functionality and error handling

* refactor(builder): enhance error handling and add tests for field operations

* refactor(tests): add unit tests for Field, Integer, ItemTypeBuilder, and RequiredSeoFieldsValidator

* test: remove itemtypebuilder test for now

* refactor(DependencyResolver): add unit tests for topologicalSort functionality

* refactor(DeletionDetector): add unit tests for deletion detection and safety checks

* refactor(BuildExecutor): add unit tests for executeBuild and getOrBuildItem methods

* refactor(DeletionManager): add unit tests for deletion summary and confirmation logic

* refactor(ItemBuilder): add unit tests for buildItem method and error handling

* feat: add beta branch support to release workflow

* chore(release): 3.8.0 [skip ci]

# [3.8.0](https://github.com/Androlax2/dato-builder/compare/v3.7.0...v3.8.0) (2025-07-18)

### Features

* add beta branch support to release workflow ([69da33d](https://github.com/Androlax2/dato-builder/commit/69da33d0bb8af7ef2836bad3fc9b6a84f1ea2a99))

* ci: add beta branch support and enhance workflow with linting checks

* ci: add beta branch support and enhance workflow with linting checks

* chore: update version to 3.8.0 in package-lock.json

* feat(generate): add Plop generators for DatoCMS blocks and models

- Introduce new `generate`, `generate:block`, and `generate:model` scripts to package.json
- Add Plop configuration in `plopfile.ts` with generators for DatoCMS blocks and models
- Include block template (`block.hbs`) and model template (`model.hbs`) for structured code generation
- Add Plop helper for converting PascalCase to snake_case to assist with API key formatting

* chore(dependencies): update package-lock.json with new dependencies

- Add Plop and additional related libraries, such as `change-case`, `del`, and others for enhanced automation and file management.
- Remove `dev` and `peer` markers from several dependencies.
- Include updates to dependency versions to align with the project's requirements.

* refactor(plop-templates): relocate templates and update paths

- Move `block.hbs` and `model.hbs` from `plop-templates/` to `src/plop-templates/`
- Update `plopfile.ts` to reflect new template paths, ensuring proper generator functionality

* chore(package.json): remove Plop generator scripts

- Remove `generate`, `generate:block`, and `generate:model` scripts from package.json
- Streamline package.json scripts to remove unused or deprecated entries

* refactor(plop-templates): update block.hbs to use BlockBuilder

- Replace `ModelBuilder` with `BlockBuilder` for consistency with the updated DatoCMS structure
- Ensure alignment with recent refactoring and best practices

* chore(dependencies): bump @biomejs/biome to v2.1.2

- Update `@biomejs/biome` and related CLI optional dependencies to version 2.1.2 in `package-lock.json` and `package.json`
- Update `$schema` in `biome.jsonc` to correspond with the new version

* chore(ignore): update .gitignore and .npmignore rules

- Add `CLAUDE.md` to `.gitignore` to exclude from version control
- Expand `.npmignore` rules to cover source, configuration, and development files
- Ensure exclusion of unnecessary files for cleaner npm package distribution

* chore(style): update rule severity for noProcessEnv in biome.jsonc

- Change `noProcessEnv` rule from "error" to "warn" under the `style` section
- Reflect a less strict enforcement of environment variable usage

* chore(jest): update jest configuration for enhanced coverage and testing

- Set `testEnvironment` to "node" for proper environment setup
- Add `collectCoverageFrom` to specify coverage targets and exclusions
- Configure `coverageDirectory` and `coverageReporters` for detailed reports
- Expand `testMatch` patterns to improve test discovery
- Enable `clearMocks` and `restoreMocks` for better mock management
- Limit `maxWorkers` to "50%" for optimized resource usage

* chore(lefthook): update biome command to adjust diagnostic level

- Change `--diagnostic-level` to "error" in biome commands for both `staged_files` and `push_files`
- Ensure stricter reporting by enforcing error-level diagnostics during checks

* feat(cli): add version option displaying package version

- Introduce `.version` to CLI program to display `npm_package_version` or default to "0.0.0"
- Enhance user experience by providing version information directly in command-line usage

* chore(tsconfig, scripts): enhance TypeScript build and project configurations

- Update `tsconfig.json` to target `es2020` with stricter compiler options for improved type safety
- Introduce `tsconfig.build.json` for streamlined build configuration
- Revise npm scripts to support separate build and watch tasks, optimize testing, linting, and formatting commands
- Remove redundant `nodemon` and adjust related dependencies and build steps for clarity and performance enhancement

* refactor(tests, types): add null-safety and override enforcement

- Update test assertions to use optional chaining for better null-safety (e.g., `safe[0]?.name`)
- Add `override` keyword to class properties in `BlockBuilder` and `ModelBuilder` for stricter adherence to TS conventions
- Refactor `apiErrorHandler` to improve error handling with additional null checks for better code robustness

* chore(ignore, cli): update .gitignore and add shebang to cli

- Add `TASKS.md` to `.gitignore` for excluding new task file from version control
- Insert Unix shebang in `src/cli.ts` enabling script execution directly in terminal

* refactor(cli): extract DatoBuilderCLI to modularize CLI logic

- Move `DatoBuilderCLI` class to a separate file for improved modularity and organization
- Simplify `src/cli.ts` by removing inline class definition
- Ensure proper integration with clear cache and build commands

* refactor(cli): replace absolute imports with relative imports

- Update import paths in `DatoBuilderCLI.ts` and `cli.ts` replacing absolute imports (`@/`) with relative paths (`./`) for improved portability and module resolution consistency.

* refactor(config): replace absolute imports with relative imports

- Update import paths in `ConfigParser.ts` replacing absolute imports (`@/`) with relative paths (`../`) for improved portability and module resolution consistency.

* chore(scripts, deps): add plop setup and update dependencies

- Add `plop` script with support for TypeScript through `cross-env` and `tsx`
- Introduce `cross-env` as a new development dependency
- Update several dependencies in `package-lock.json` for improved compatibility and performance
- Remove redundant and unused entries from lockfile for cleanup and maintenance

* chore(scripts, deps): remove plop setup and redundant dependencies

- Remove `plop` script and related `cross-env` dependency from `package.json`
- Update `package-lock.json` to reflect the removal of `cross-env` and unused dependencies
- Add new dependencies, including `@octokit` and `@semantic-release` modules for development setup
- Clean up redundant and outdated entries in `package-lock.json` for maintenance and better consistency

* feat(cli): add generate command for dynamic file creation

- Introduce a `generate` command to the CLI enabling dynamic generation of blocks and models
- Implement `node-plop` for prompt-based file scaffolding with customizable templates
- Add error handling for generator prompts and actions to improve reliability and user feedback

* refactor(cli): add stronger typings for node-plop integration

- Update `generate` method to include precise typings for dynamic imports of `node-plop`, enhancing type safety and clarity.
- Remove redundant `any` type declaration for generator prompt answers to improve code maintainability and readability.

* feat(cli): enhance file generation with dynamic paths and templates

- Add `node:path` utilities to dynamically resolve paths for template files.
- Update `generate` method to include `dirname` for improved template resolution.
- Modify generated file and template paths to use configurable model paths.
- Update `build` script to include copying `plop-templates` to the build directory for runtime access.

* refactor(cli): integrate plop logic into DatoBuilderCLI

- Remove standalone `plopfile.ts` and migrate its logic into `DatoBuilderCLI` for better encapsulation and maintainability
- Enhance dynamic path resolution for templates using `plop-templates` within `DatoBuilderCLI`
- Adjust block and model generators to align with the updated path configuration
- Improve validation for PascalCase naming in prompts to ensure consistency

* feat(cli): add interactive generator selection for plop templates

- Introduce interactive generator prompts using `inquirer` for improved usability
- Integrate generator and action execution with advanced error handling and detailed user feedback
- Update logger to show success, failures, and changes from generation process
- Add `tsx` as a new dev dependency in `package.json` for enhanced compatibility with TypeScript utilities
- Optimize `model.hbs` with conditional logic for singleton, sortable, and tree configurations to improve template customization options

* feat(cli, build): add version replacement during build

- Introduce `build:version` script to replace `__PACKAGE_VERSION__` placeholder with actual package version in the build
- Add `@semantic-release/exec` plugin to automate running the `build:version` script during the release process
- Update `cli.ts` to use the replaced `VERSION` constant instead of `npm_package_version` for displaying version information
- Adjust dependencies in `package.json` and `package-lock.json` for the new functionality

* feat(cli, generation): modularize content generation with PlopGenerator

- Extract generation logic from `DatoBuilderCLI` into a new `PlopGenerator` class for improved modularity and reusability
- Add specific `generate:block` and `generate:model` CLI commands for direct block and model generation
- Refactor `generate` method in `DatoBuilderCLI` to delegate actions to `PlopGenerator`
- Enhance generation process with support for both specific and interactive generation flows
- Improve error handling and logging for better user feedback during generation process

* feat(cli): modularize CLI initialization and command definitions

- Extract CLI initialization logic into `CLIInitializer` for better modularity and readability
- Introduce `CommandBuilder` class to streamline command definitions and actions
- Refactor `cli.ts` to utilize modularized `initializeCLI` and `CommandBuilder`
- Enhance typing and structure for global and command-specific options
- Improve scalability and maintainability of the CLI setup process

* test(cli): add comprehensive tests for CLI commands and integration

- Implement end-to-end tests to validate CLI behavior and error handling
- Cover all command flows, including `build`, `generate`, `clear-cache`, and subcommands like `generate:block` and `generate:model`
- Mock dependencies (`CommandBuilder`, `initializeCLI`, and `DatoBuilderCLI`) for isolated testing
- Add tests for error propagation during initialization and command execution
- Ensure placeholder version `__PACKAGE_VERSION__` is used correctly during setup
- Simulate various CLI arguments to confirm appropriate handling and execution paths

* test(cli): add unit tests for CLIInitializer

- Include unit tests for `getLogLevelFromOptions` to validate log level determination based on `GlobalOptions`
- Add tests for `initializeCLI` covering default and edge case scenarios
- Ensure all combinations of debug, verbose, quiet, and cache options are tested
- Mock dependencies (`path`, `CacheManager`, `ConfigParser`, and `DatoBuilderCLI`) for isolated behavior
- Verify error handling for configuration and cache initialization failures
- Test integration for instance uniqueness and proper dependency injection during initialization

* test(cli): add tests for CommandBuilder and mock CLI utility

- Add comprehensive tests for `CommandBuilder` covering command configurations, method chaining, and edge cases
- Include tests for global options parsing, concurrency determination, and error handling during command execution
- Implement a mock utility `createMockDatoBuilderCLI` for consistent and reusable CLI mock generation
- Add integration tests for `addBuildCommand`, `addGenerateCommands`, and `addClearCacheCommand` methods
- Ensure accurate behavior and proper handling of failures across all CLI commands and their associated options

* test(generation): add PlopGenerator and mock utilities tests

- Add comprehensive unit tests for the `PlopGenerator` class, covering interactive and specific generation flows
- Include detailed scenarios for handling changes, failures, and validation errors
- Implement mock utilities (`createMockPlop`, `createMockPlopGenerator`) to facilitate isolated testing
- Enhance test coverage for `setupPlop`, `processResult`, and prompt validation methods
- Update `PlopGenerator` to avoid dynamic imports in test environments for improved testing stability

* test(generation): add tests for GeneratedFiles quality and validation

- Include unit tests for `GeneratedFiles` to verify quality and structure of generated files
- Add tests for valid TypeScript block and model file generation using `PlopGenerator`
- Ensure proper handling of changes and file validations during generation
- Simulate plop behavior to validate file content integrity and prevent template artifacts
- Verify mock setup for plop, inquirer, and related utilities for isolated testing

* docs(readme): enhance documentation with new features and commands

- Revamp project description for clarity and scope
- Add badges for npm version, license, and TypeScript readiness
- Improve command reference with global options and quick usage examples
- Include troubleshooting section with common issues and solutions
- Update CLI commands, adding details for build, generate, and utility commands
- Expand examples for blocks and models with optimizations and best practices
- Add license details at the end of the documentation

* docs(readme): expand configuration documentation

- Add quick setup and complete configuration reference
- Provide detailed description of required and optional configuration options
- Include behavior specifics for `overwriteExistingFields` with use case examples
- Introduce guides for logging configuration with supported log levels
- Add troubleshooting tips for common issues and debugging steps
- Provide examples for JavaScript and TypeScript configuration file formats

* refactor(cache, ItemTypeBuilder): improve immutability and logging clarity

- Mark `items` and `writeQueue` as readonly in `CacheManager` to enforce immutability and enhance code safety
- Replace coercion (`!!`) with `Boolean()` for improved readability and semantic clarity in logging within `ItemTypeBuilder`

* refactor(cache): remove readonly properties for mutability

- Remove `readonly` keyword from `items` and `writeQueue` in `CacheManager` to allow modifications
- Add inline comments justifying the change for readability and clarity

* build(dependencies): replace plop with node-plop

- Switch dependency from `plop` to `node-plop` for consistent versioning and enhanced functionality
- Update `package.json` and `package-lock.json` to reflect the change
- Remove unused dependencies and redundant modules for cleanup and optimization
- Adjust versions of related packages (`cli-cursor`, `is-interactive`, etc.) for compatibility and reliability
- Simplify dependency tree by removing unnecessary legacy packages

* test(cache): add tests for processWriteQueue behavior and race conditions

- Add comprehensive unit tests for `processWriteQueue` to ensure proper handling of race conditions and concurrent writes
- Verify batching mechanism to prevent multiple simultaneous `writeFile` calls
- Test queue consistency during errors and retry scenarios
- Add edge case tests for empty queue and `isWriting` flag handling
- Ensure all queued items are written to disk without data loss or corruption

* test(cache): update tests for race condition fixes and queue processing

- Modify test assertions to account for race condition fixes, allowing multiple writes while ensuring no data loss
- Add delays (setTimeout) to simulate asynchronous queue processing and verify consistency
- Adjust expectations for disk writes and memory state to reflect the new processing behavior
- Replace redundant `await` usage in `set` calls to improve clarity and test efficiency
- Ensure all cached items are properly written and accessible in memory regardless of disk write timing

* fix(cache): ensure consistent queue processing with new flag

- Introduce `processingNeeded` flag to handle concurrent write attempts
- Prevent redundant queue processing by monitoring write completion
- Modify `processWriteQueue` to clear the flag on an empty queue
- Use a while loop to ensure all queued items are processed properly

* test(config): add security tests for config path validation

- Verify that config files resolving outside the project directory are rejected
- Add test cases for directory traversal patterns to ensure they are blocked
- Include validation for both .js and .ts config file paths
- Ensure proper handling of symlinks pointing outside project boundaries

* feat(config): add validation for config path resolution

- Introduce `validateConfigPath` to ensure config files resolve within project directory
- Implement checks for symlink resolution to prevent security risks
- Update related test cases with `jest.resetModules` and default mock setup for realpath
- Enhance safety by rejecting config files resolving outside the project directory

* test(config): update tests to refine mock setup

- Remove unnecessary `jest.resetModules` from test cases
- Adjust config file mock to use simplified syntax for consistency with other tests
- Simplify setup steps for `mockFs` to ensure clarity and maintainability

* feat(logger): add timer management utilities to prevent memory leaks

- Introduce `clearTimers` to clear all timers and release memory
- Add `clearTimer` to remove specific timers by label
- Implement `getActiveTimers` to retrieve currently active timers
- Add `cleanupOldTimers` to remove timers exceeding a specified age
- Enhance `ConsoleLogger` test coverage to include memory leak prevention and timer management validation

* refactor(tests): update imports to use node-plop instead of plop

- Replace all `plop` imports with `node-plop` across test files
- Adjust type imports for `NodePlopAPI` and `PlopGenerator` accordingly
- Ensure consistency with recent dependency replacement in the build system

* refactor(generation): replace dynamic import with standard import for node-plop

- Simplify `setupPlop` method by directly using `import` for `node-plop`
- Improve readability and remove unnecessary use of `Function` constructor for dynamic imports
- Align with recent changes switching from `plop` to `node-plop` in the codebase

* refactor(*): migrate to ES modules and update imports

- Replace CommonJS syntax with ES module syntax across all files
- Update imports to use explicit `.js` extensions for module resolution
- Adjust test imports to ensure proper relative paths and remove aliases
- Modify `tsconfig.json` to align with ES module standards, including `ES2022` upgrades
- Introduce `type: module` to `package.json` for enabling ESM support
- Replace `setupCLI` with new `CLI` class for streamlined initialization

* refactor(utils): replace pluralize with inflection for singularization

- Swap `pluralize` dependency with `inflection` for improved singularization
- Update implementation in `utils.ts` to reflect new library usage
- Remove `pluralize` and its type definitions from dependencies
- Add `inflection` as a new dependency
* **core:** the utility function now uses `inflection` for singularization, which could result in slight differences in behavior compared to `pluralize` in certain edge cases.

* refactor(generation): simplify ES module usage in PlopGenerator

- Replace custom __dirname equivalent logic with direct `import.meta.url`
- Improve readability and align with ES module standards in file path resolution

* refactor(config): migrate jest config to TypeScript and ESM

- Replace `jest.config.js` with `jest.config.ts` using TypeScript and ES module syntax
- Implement `createDefaultEsmPreset` for ESM compatibility via `ts-jest`
- Update `.npmignore` to reflect renamed Jest config file
- Align Jest configuration with ESM conventions for consistency with project standards

* refactor(config): simplify and modernize config loader tests

- Replace `jest.doMock` with `jest.spyOn` for cleaner, more maintainable mocking of the `importConfig` method
- Streamline `fs` and `path` mocks, improving clarity and reducing redundant setup
- Remove unnecessary `jest.dontMock` calls, as cleanup is no longer required
- Consolidate `realpath` handling for robust and consistent test behavior
- Adjust test cases for better alignment with the refactored `importConfig` structure in `ConfigParser`

* refactor(tests): streamline inquirer mocking in DeletionManager

- Replace `require` calls for inquirer with direct import and properly typing mocks
- Add `jest.clearAllMocks` in `beforeEach` for consistent mock resets
- Consolidate and simplify `inquirer.prompt` mocking across test cases
- Ensure improved maintainability and consistency in mock setup

* refactor(tests): modernize mock setup in FileDiscoverer tests

- Replace `jest.mock` with `jest.unstable_mockModule` for ESM compatibility
- Introduce strongly typed mock functions for `glob` and `node:path` methods
- Adjust import order to align with mocking changes
- Simplify mock reset using `jest.clearAllMocks` in `beforeEach`
- Update assertions to reflect changes in file path resolutions for more accuracy

* refactor(tests): modernize PlopGenerator test setup for ESM

- Use `jest.unstable_mockModule` for dynamic mocking of `inquirer` to ensure ESM compatibility
- Introduce `jest.mock` for `node:url` to handle `fileURLToPath` mocking
- Add private method `setupPlop` mocking to bypass ESM issues with `node-plop` setup
- Extend Jest configuration with `setupFilesAfterEnv` for test initialization
- Create `tests/setup.ts` for global polyfills (`import.meta.url`, `__dirname`, `__filename`) to standardize ESM context

* docs(readme): remove outdated sections on development and migration

- Deleted "Development & Testing" and "Migration Guide" sections from the TOC
- Reflects the removal or deprecation of these sections in the document content.

* refactor(tests): enhance mock setup in PlopGenerator tests

- Use `jest.unstable_mockModule` for ESM-compatible inquirer mocking
- Add private `setupPlop` method mock to address ESM issues with `node-plop`
- Remove redundant comments and streamline test setup for clarity

* refactor(tests): update CLIInitializer tests for ESM compatibility

- Replace `jest.mock` with `jest.unstable_mockModule` to ensure compatibility with ES modules
- Convert mocks of `CacheManager`, `ConfigParser`, `DatoBuilderCLI`, and `ConsoleLogger` to use `jest.unstable_mockModule`
- Adjust import timing to accommodate module mocking requirements
- Simplify mock implementations and reset logic with `jest.clearAllMocks`
- Refactor path mocking to use standalone `mockJoin` function for better isolation and maintainability

* chore(gitignore): add temp-test-generated directory to ignore list

- Prevent test-generated temporary files from being tracked
- Maintain a cleaner git repository by ignoring unnecessary files

* refactor(tests): update ItemTypeBuilder tests for ESM compatibility

- Replace `jest.mock` with `jest.unstable_mockModule` for compatibility with ES modules
- Introduce strongly typed mock constructors for enhanced reliability
- Adjust imports and mock usage to align with module mocking requirements
- Simplify `Field` mock implementation to dynamically generate `api_key`
- Refactor type casting for mock fields to adopt `any` for clarity and consistency

* refactor(tests): update CommandBuilder tests for ESM compatibility

- Replace `jest.mock` with `jest.unstable_mockModule` for compatibility with ES modules
- Adjust imports to align with ESM-compatible mock requirements
- Refactor `os.cpus` and `Command` mocking using strongly typed mock functions
- Simplify mock reset logic with `mockReset` and `jest.clearAllMocks`
- Improve test assertions for concurrency determination to ensure clarity and robustness

* refactor(tests): update ItemBuilder tests for ESM compatibility

- Replace `jest.mock` with overridden `loadModule` method for ES module handling
- Introduce `TestItemBuilder` class for controlled dynamic import testing
- Adjust mock setup and remove outdated `jest.mock` calls
- Simplify typecasting and mock logic for builder instances
- Ensure consistent mock reset with `jest.clearAllMocks`

* refactor(tests): update CLI tests for ESM compatibility

- Replace `jest.mock` with `jest.unstable_mockModule` to ensure ESM compatibility
- Adjust imports to defer loading until after module mocking
- Refactor `CommandBuilder` and `DatoBuilderCLI` mock setups to use strongly typed mock functions
- Mock `process.exit` to prevent unexpected termination during tests
- Add improved assertions for command parsing and error handling scenarios
- Ensure consistent mock clean-up with `jest.clearAllMocks`

* refactor(tests): modernize CacheManager test and mock setup

- Replace inline `jest.mock` with strongly typed local mock objects for improved flexibility and readability
- Refactor `CacheManager` constructor to support dependency injection of mocked `fs` and `path` modules
- Simplify mock setup with default behaviors in `beforeEach`, ensuring consistent test initialization
- Enhance test coverage for error handling and concurrent operations with resilient mock logic
- Ensure better handling of file operations by aligning tests with dependency injection pattern

* refactor(tests): update Field tests and improve validator mock behavior

- Refactor `jest.mock` paths and types for ESM compatibility
- Update `MockValidators` class to handle boolean and object validators more robustly
- Replace `test_type` with strongly typed `FieldCreateSchema["field_type"]` for `TestField` initialization
- Adjust test assertions for `validators` to match the updated `build` logic with boolean conversion

* feat(cli): add wrapper script for improved CLI execution

- Introduce `bin/cli-wrapper.js` to wrap and spawn CLI using `tsx` for smoother execution
- Update `package.json` to replace direct CLI entry point with the wrapper script
- Ensure proper argument passing and error handling in the wrapper
- Rearrange `tsx` dependency to `dependencies` for runtime availability

* feat(plop): add human-readable name conversion with Handlebars helper

- Introduce `pascalToHumanReadable` utility function to convert PascalCase to human-readable format
- Register `humanize` Handlebars helper integrating the new utility in `PlopGenerator`
- Update block and model templates to utilize the `humanize` helper for name formatting
- Add minor delay in test cases to ensure file system operations complete
- Adjust test expectations to reflect updated naming conventions (e.g., "Test Block" instead of "TestBlock")

* chore(lefthook): enable experimental-vm-modules for jest tests

- Update lefthook configuration to include `--experimental-vm-modules` flag for Jest
- Ensure compatibility with ES module resolution during related file test execution

* chore(lefthook): update Jest command for improved ESM support

- Replace `npx jest` with direct path to Jest binary for compatibility
- Ensure `--experimental-vm-modules` flag is explicitly applied in lefthook test configuration

* chore(lefthook): remove npx from test command for Jest execution

- Replace `npx` with direct `node` call for executing Jest binary
- Maintain `--experimental-vm-modules` flag for ES module compatibility in related tests

* chore(utils,test): update singularize usage and adjust test delay

- Replace `singularize` import with `inflection.singularize` for consistency
- Increase file operation delay in tests from 10ms to 50ms for reliability
- Update `package-lock.json` to reflect dependency and ESBuild version changes

* feat(tests): add integration tests and fixtures for BuilderContext and CLI

- Introduce extensive integration tests for `BuilderContext` and `CLI` implementations.
- Add block and model fixtures to test performance and reference management.
- Cover scenarios such as block-to-model references, caching, async builder handling, and error cases.
- Validate API calls, dependency resolution, and caching behaviors with mock implementations.
- Include test cases for circular and complex references with improved concurrency handling.
- Add utilities for mock data and enhance test resilience in ESM environments.

* chore(gitignore): update ignore rules and add example env file

- Add `.env.example` with placeholder for `DATOCMS_API_TOKEN`
- Ignore `.env` while allowing `.env.example` to be tracked
- Keep `temp-test-generated/` in ignore for temporary files

* chore(tests): remove obsolete fixtures and integration tests

- Delete unused block fixtures (Block1 through Block10, CachedBlock) from `tests/fixtures/blocks`
- Remove outdated integration tests for `BuilderContext`, `BuildPipeline`, and `CLI`
- Clean up redundant test cases to streamline test suite and align with recent updates

* feat(tests): add integration tests and fixtures for async dependencies

- Introduce new integration tests verifying async patterns for `getBlock` and `getModel`, ensuring proper resolution of blocks and models with real DatoCMS API calls.
- Add various fixtures, including `IntegrationTestBaseBlock`, `IntegrationTestComplexBlock`, `IntegrationTestReferenceBlock`, `IntegrationTestBaseModel`, `IntegrationTestMixedModel`, and `IntegrationTestRelatedModel`, to test complex dependency hierarchies.
- Integrate real API validation setup with `.env` for managing `DATOCMS_API_TOKEN`.
- Ensure improved test resilience with extended timeouts and new Jest helpers.
- Remove the obsolete `mockDatoApi.ts` utility, replacing it with real API-focused tests and fixtures.

* chore(tests): replace obsolete integration tests with error handling and field types tests

- Remove outdated `AsyncDependencies.integration.test.ts` and `RealCLI.integration.test.ts` for better test coverage alignment.
- Add comprehensive `ErrorHandling.integration.test.ts` to validate robust handling of API errors, file system issues, validation conflicts, and concurrent operations.
- Introduce `FieldTypes.integration.test.ts` to verify block creation with diverse field types including text, numeric, and date/time fields.
- Ensure temporary directories are cleaned up after tests to maintain test isolation.

* chore(tests): replace DatoAPI tests with updated comprehensive workflows

- Remove outdated `DatoAPI.integration.test.ts` to streamline tests and align with current workflows.
- Add `ComprehensiveWorkflow.integration.test.ts` covering resource creation, updates, deletion workflows, caching, and dependency resolution.
- Ensure robust cleanup of temporary directories and DatoCMS resources after tests for isolation.

* chore(tests): remove outdated integration tests

- Delete `BuildWorkflow.integration.test.ts`, `ComprehensiveWorkflow.integration.test.ts`, and `ErrorHandling.integration.test.ts` to streamline the test suite.
- These tests are no longer needed following updates to the testing architecture and workflows.
- Ensure alignment with the current testing strategy focused on modern and comprehensive validations.

* feat(builder-context): enhance block and model configuration API

- Update `BlockBuilder` and `ModelBuilder` to accept configuration objects, improving flexibility and readability.
- Introduce support for `getBlock()` and `getModel()` helpers in `BuilderContext`, enabling dynamic ID resolution for blocks and models.
- Revise documentation examples to showcase the new API and dynamic helpers.
- Ensure backward compatibility by retaining support for previous usage patterns.

* feat(config, tests): add support for custom config paths

- Extend `ConfigParser` to accept a custom configuration path, providing greater flexibility for users to define their configuration files.
- Implement validation to ensure the custom path exists and resides within the project directory for security.
- Add comprehensive tests covering scenarios such as custom config path usage, non-existent paths, default behavior fallback, and security validation.
- Introduce a new test fixture (`dato-builder.test.config.js`) to streamline configuration-related tests.

* docs(tests): add integration tests guidelines and structure documentation

* doc(integration)

* docs(tests): add integration tests handoff summary

- Document completed infrastructure for CLI custom config support, including changes to `CLI.ts`, `CommandBuilder.ts`, and `CLIInitializer.ts`.
- Detail next steps for unit testing new CLI functionalities, including test patterns and required test cases.
- Outline integration test implementation strategy, focusing on isolated fixtures for each test suite.
- Provide success criteria, verification steps, and updated development workflow guidelines.

* test(cli): add tests for custom config path support

- Add unit and integration tests to validate custom configuration path handling in `CLI` and `CommandBuilder`.
- Cover scenarios with and without custom config paths, empty paths, and error handling during CLI execution.
- Introduce end-to-end flow tests ensuring successful integration of custom config paths through `CLI → CommandBuilder → initializeCLI`.
- Validate robust handling of custom paths across multiple command types and error scenarios.

* feat(cli): add support for custom config paths in CommandBuilder

- Update `CommandBuilder` and related methods to handle an optional `customConfigPath` parameter.
- Modify `initializeCLI` calls to incorporate the custom configuration path when provided.
- Add unit tests to validate proper handling of custom config paths across `build`, `generate`, and `clear-cache` commands.
- Ensure robust support for scenarios with and without provided config paths, maintaining backward compatibility.

* feat(cli): extend `initializeCLI` with custom config path support

- Add `customConfigPath` parameter to `initializeCLI` for greater configuration flexibility.
- Update `ConfigParser` instantiation to handle optional custom configuration paths.
- Add comprehensive test cases to cover scenarios including:
  - Initialization with and without custom config paths.
  - Error handling for invalid and empty config paths.
  - Debug options in combination with custom paths.
- Maintain backward compatibility with default behaviors.

* docs(tests): update integration tests guidelines

- Revise integration test progress summary to reflect completed tasks, including CLI custom config handling and new unit tests.
- Document additional unit tests added for CLI custom config functionality, ensuring comprehensive coverage.
- Update "Next Steps" priorities to focus on test-specific fixture structure for SimpleBlocks integration tests.

* test(integration): add integration tests for SimpleBlocks

- Introduce a new integration test suite `SimpleBlocks.integration.test.ts` to validate the creation and verification of SimpleBlocks in DatoCMS.
- Add fixtures including `simple-blocks.config.js` and `TestSimpleBlock.ts` to define test-specific configurations and block definitions.
- Verify block creation, field properties, and cleanup processes during the tests.
- Ensure robust API token handling and debug logging for better test diagnostics.

* docs(tests): update integration tests guidelines for SimpleBlocks

- Highlight completion of first integration test for SimpleBlocks, including fixture isolation and detailed verification steps.
- Document successful usage of CLI custom config infrastructure for integration testing.
- Update "Next Steps" to prioritize expanding the integration test suite with additional patterns and scenarios.

* test(integration): add tests for SimpleModels integration

- Introduce a new integration test suite `SimpleModels.integration.test.ts` to validate the creation and verification of SimpleModels in DatoCMS.
- Add fixtures, including `simple-models.config.js` and `TestSimpleModel.ts`, to define test-specific configurations and model definitions.
- Verify model creation, field properties, and cleanup processes during the tests.
- Ensure robust API token handling and enable debug logging for better test diagnostics.

* docs(tests): update guidelines with Phase 2 tests and progress

- Document completion of Phase 2 integration tests for SimpleModels, including test-specific configurations, model validation, and field verification.
- Introduce FieldValidation integration test structure, outlining test types and validator scenarios.
- Update "Next Steps" to reflect immediate tasks for Phase 2 completion and preparation for Phase 3.

* test(integration): add FieldValidation integration test suite

- Introduce `FieldValidation.integration.test.ts` to validate the creation of blocks with various field types and validators.
- Add fixtures including `field-validation.config.js` and `TestFieldValidationBlock.ts` for custom test setups.
- Verify field types (text, boolean, integer, date, datetime) and associated validators (required, number_range).
- Ensure test isolation with automatic cleanup of test blocks via DatoCMS API.
- Update integration test guidelines to reflect Phase 2 completion and next steps for future phases.

* test(integration): add BuildFlags integration test suite

- Introduce `BuildFlags.integration.test.ts` to validate CLI build flag functionality with real DatoCMS API.
- Add fixtures including `build-flags.config.js` and `TestBuildFlagsBlock.ts` for test-specific setups.
- Test individual flags (`--skip-deletion`, `--no-cache`, `--auto-concurrency`) and combined flag usage, ensuring proper behavior.
- Validate real API integration, caching behavior, concurrency level auto-detection, and proper field handling.
- Ensure test isolation with per-test cleanup of created blocks via DatoCMS API.
- Update integration test guidelines to reflect Phase 3 completion and document next steps.

* test(integration): add BlockDependencies integration test suite

- Introduce `BlockDependencies.integration.test.ts` to validate asynchronous block dependency resolution in DatoCMS.
- Add fixtures `block-dependencies.config.js`, `TestBaseBlock.ts`, and `TestReferenceBlock.ts` for test-specific configurations and blocks.
- Validate creation and dependency resolution of `TestBaseBlock` and `TestReferenceBlock`.
- Ensure modular content field references are correctly resolved to dependent blocks.
- Enforce test isolation with cleanup of created blocks in reverse dependency order.
- Extend test timeout to accommodate slower dependency resolution and API calls.

* fix(dependency-analyzer): prevent Jest ESM import failures in test env

Add a workaround for Jest's ESM module loader to mitigate "not yet fulfilled" errors during dynamic imports in test environments. Introduce a `setTimeout` delay to allow proper module linking caused by circular or transitive dependencies. This change only affects test environments and is unnecessary in production or Node CLI usage.

* fix(integration): improve BlockDependencies cleanup logic

- Update cleanup process to iterate over `createdBlockIds` directly instead of in reverse order.
- Enhance error handling to log failures more clearly with `console.error`.
- Simplify cleanup logic by removing unnecessary conditions.

* test(integration): add ModelDependencies integration test suite

- Introduce `ModelDependencies.integration.test.ts` to validate async model dependency resolution in DatoCMS.
- Add fixtures `TestBaseModel.ts` and `TestReferenceModel.ts` for testing model interdependencies.
- Verify model creation order and field linking for `TestBaseModel` and `TestReferenceModel`.
- Ensure test isolation via cleanup of created models after each test run.
- Simulate CLI commands to mimic real-world build processes and validate output.

* test(integration): add MixedDependencies integration test suite

- Introduce `MixedDependencies.integration.test.ts` to validate complex mixed dependency scenarios with blocks, models, and cross-references.
- Add `ContentBlock`, `MediaBlock`, `Author`, and `Article` fixtures for testing modular content and interdependencies.
- Validate model-to-model and block-to-block dependencies, including multi-level and cross-references.
- Ensure proper field configuration for advanced types (wysiwyg, modular content, slug, single asset).
- Demonstrate real-world CMS scenarios with integration to DatoCMS API.
- Enforce test isolation with cleanup of created blocks and models.

* test(fixtures): remove outdated test fixtures for integration tests

- Delete unused DatoBuilder test config and integration test fixtures for blocks and models.
- Remove obsolete files: `dato-builder.test.config.js`, `IntegrationTestBaseBlock.ts`, `IntegrationTestComplexBlock.ts`, `IntegrationTestReferenceBlock.ts`, `IntegrationTestBaseModel.ts`, `IntegrationTestMixedModel.ts`, `IntegrationTestRelatedModel.ts`.
- These fixtures are no longer required due to updated and comprehensive test suites for integration scenarios.

* docs(tests): expand integration test guidelines with detailed phases

- Add comprehensive test phases from 6 to 14, covering advanced workflows, error handling, state management, performance, real-world scenarios, CLI commands, field type testing, security, environment compatibility, and documentation validation.
- Provide granular test category breakdowns for each phase, specifying objectives like API error handling, large project testing, concurrency validation, CLI command coverage, and security scenarios.
- Update "Next Steps" to include actionable goals for upcoming integration test development.

* test(integration,fixtures): add SubsequentBuilds integration test suite

- Introduce `SubsequentBuilds.integration.test.ts` to validate state management and build caching behavior.
- Add fixtures `TestStateBlock.ts` and `subsequent-builds.config.js` for test-specific setups and configurations.
- Test first-time build creation, cached builds, forced rebuilds, and no duplication scenarios.
- Verify field configurations and API integration for created blocks in DatoCMS.
- Ensure test isolation with proper cleanup of created blocks after each test run.
- Update integration test guidelines to reflect Phase 7 completion with state management and caching tests.

* test(integration,fixtures): add DeletionHandling integration test suite

- Add `DeletionHandling.integration.test.ts` to validate multi-block deletion, selective removal, orphaned resource detection, and `--skip-deletion` flag behavior.
- Create fixtures `TestDeletionBlockA.ts`, `TestDeletionBlockB.ts`, and `deletion-handling.config.js` for test-specific configurations and block definitions.
- Simulate deletion scenarios with cache-based detection, forced deletion, prevention flags, and real-world use cases.
- Ensure comprehensive testing of block creation, deletion, and cleanup with integration to DatoCMS API.
- Update integration test guidelines to reflect Phase 7 completion with deletion handling tests.

* test(integration,fixtures): add UpdateDetection integration test suite

- Introduce `UpdateDetection.integration.test.ts` to validate cache-based change detection, including field addition, validator updates, label modifications, and overall configuration consistency.
- Add `TestUpdateBlock.ts` and `update-detection.config.js` as fixtures to test specific configurations and block definitions.
- Simulate update scenarios to ensure accurate detection and proper integration with DatoCMS API.
- Update integration test guidelines to reflect Phase 7 refinements for cache-based detection mechanisms.

* test(integration,fixtures): add UpdateDetection integration test suite

- Introduce `UpdateDetection.integration.test.ts` to validate cache-based change detection, including field addition, validator updates, label modifications, and configuration consistency.
- Add `TestUpdateBlock.ts` and `update-detection.config.js` as fixtures to test specific configurations and block definitions.
- Simulate update scenarios to ensure accurate detection and proper integration with DatoCMS API.
- Ensure comprehensive testing of block creation, updates, and cleanup processes.
- Reflect Phase 7 refinements in integration test routines.

* test(integration,fixtures): add performance test fixtures for blocks and models

- Introduce multiple performance test blocks (Alpha, Beta, Gamma, Delta, Epsilon, etc.) under `tests/integration/performance/fixtures/blocks/`.
- Add corresponding performance test models (Alpha, Eighth, Fifth, Fourth, etc.) under `tests/integration/performance/fixtures/models/`.
- Ensure blocks and models include various field types (text, boolean, integer, float, date) with validators for comprehensive testing.
- Include modular content and linked models to simulate real-world scenarios.
- Provide groundwork for upcoming performance integration test suites.

* test(fixtures): remove redundant test blocks and update references

- Delete obsolete blocks (Beta, Delta, Epsilon, Zeta, etc.) from `tests/integration/performance/fixtures/blocks`.
- Update model references to replace removed blocks with new or existing ones (e.g., Beta -> Second, Delta -> Fourth).
- Add new blocks Sixth and Eleventh to extend performance testing capabilities.
- Streamline fixture updates for better alignment with integration test requirements.

* chore(docs): remove outdated integration test guidelines

- Delete `INTEGRATION_TESTS_GUIDELINES.md` as the document is obsolete and no longer aligned with the current testing framework.
- Ensure removal aligns with recently updated test structures and documentation practices.

* test(integration): ensure clean DatoCMS state before tests

- Introduce `eraseAllItems` to remove all blocks and models from DatoCMS for a consistent test environment.
- Add invocation of `eraseAllItems` in `beforeAll` to guarantee tests start with a clean slate.
- Log detailed output for deleted items, including successes and failures.
- Handle errors gracefully to prevent disruptions to test execution.

* chore(dependencies): update package-lock with latest dependencies

- Bump versions for multiple dependencies, including `@cspell/dict-aws`, `@cspell/dict-docker`, `@inquirer/core`, and others.
- Reflect updated integrity hashes and resolved URLs.
- Ensure compatibility with the latest dependency updates for improved stability and new features.

* test(generation): increase delay in tests to improve stability

- Adjust setTimeout from 50ms to 500ms in `GeneratedFiles.test.ts` to ensure filesystem operations complete reliably.
- Mitigate potential flakiness caused by insufficient delay timing in asynchronous operations.

* test(run,generation): improve compatibility and streamline mocks

- Replace legacy `jest.mock` with `jest.unstable_mockModule` for improved ESM compatibility in `DeletionManager.test.ts` and `GeneratedFiles.test.ts`.
- Simplify mock imports and ensure proper separation of mocking and importing phases.
- Refactor `DeletionManager` setup to use strongly typed mocks for improved reliability and type safety.
- Update `GeneratedFiles` to rely on real Plop generator logic over hardcoded mocks for more accurate test scenarios.
- Adjust path resolution to use `resolve` for consistent filesystem operations.

* test(cli,generation): remove obsolete test files and improve stability

- Delete `GeneratedFiles.test.ts` as it is outdated and no longer aligned with the current test framework and practices.
- Update `CommandBuilder.test.ts` to use a dynamic CPU count for improved stability and generalization.
- Ensure `Math.max` safeguards concurrency settings to always maintain a minimum of 1.

This change streamlines the test suite by removing deprecated tests and modernizing concurrency logic.

* test(cli): remove auto-concurrency test in CommandBuilder.test.ts

- Delete the test case for the build command with auto-concurrency as it is no longer relevant or necessary.
- Simplify the test suite by eliminating redundant scenarios and maintaining focus on current build command behaviors.

* fix(cli): prevent process.exit during tests

In test environments, throw errors instead of calling process.exit(1)
to allow Jest to properly handle test failures. This fixes CI test
failures where process.exit was interfering with Jest's execution.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>

* refactor(cli): remove process.exit in integration tests for better error handling

* refactor(tests): update integration test command and remove exclusive test execution

* refactor(ci): update CI configuration and improve integration test command

* refactor(ci): enhance PR title validation workflow and update .gitignore

* refactor(release): enhance release workflow with improved triggers and dependency management

* refactor(ci): restructure CI configuration for improved code quality and testing

* refactor(tests): remove console log from integration test setup

* refactor(tests): update test configuration paths to use __dirname for better reliability

* refactor(tests): enhance integration test cleanup process and update .gitignore

* refactor(tests): enhance integration test cleanup process and update .gitignore

* refactor(config): change log level to ERROR for integration test configurations

* refactor(tests): streamline integration test configurations and add new config files

* refactor(tests): update test configuration path for mixed dependencies

* refactor(tests): update test configuration path for model dependencies

# [3.8.0](https://github.com/Androlax2/dato-builder/compare/v3.7.0...v3.8.0) (2025-07-18)


### Features

* add beta branch support to release workflow ([69da33d](https://github.com/Androlax2/dato-builder/commit/69da33d0bb8af7ef2836bad3fc9b6a84f1ea2a99))

# [3.7.0](https://github.com/Androlax2/dato-builder/compare/v3.6.2...v3.7.0) (2025-07-10)


### Features

* **cli:** add support for concurrency and timeout options ([#24](https://github.com/Androlax2/dato-builder/issues/24)) ([3b0c5fe](https://github.com/Androlax2/dato-builder/commit/3b0c5fedd3c06323bd32246ca4bb5d20bfb0adb6))

## [3.6.2](https://github.com/Androlax2/dato-builder/compare/v3.6.1...v3.6.2) (2025-07-10)


### Bug Fixes

* **cli:** refactor cli ([#23](https://github.com/Androlax2/dato-builder/issues/23)) ([17ed87f](https://github.com/Androlax2/dato-builder/commit/17ed87f6bf5beae6c83215a6548819bc2a7c2310))

## [3.6.1](https://github.com/Androlax2/dato-builder/compare/v3.6.0...v3.6.1) (2025-05-07)


### Bug Fixes

* **generateDatoApiKey:** improve API flexibility and update tests ([145b17c](https://github.com/Androlax2/dato-builder/commit/145b17ca623fa73ae1c4d1ae176c1bc4038adbd0))

# [3.6.0](https://github.com/Androlax2/dato-builder/compare/v3.5.0...v3.6.0) (2025-05-07)


### Features

* **builder:** add support for apiKeySuffix in config ([e82a401](https://github.com/Androlax2/dato-builder/commit/e82a401186f4f55d00102154b3beccc8d1522073))
* **config,builder:** add support for model and block API key suffixes ([7124790](https://github.com/Androlax2/dato-builder/commit/71247904072d69ba2ea7a56ee06628af3f4b239a))

# [3.5.0](https://github.com/Androlax2/dato-builder/compare/v3.4.0...v3.5.0) (2025-05-07)


### Features

* **item-type-builder:** handle uniqueness error during item type creation ([71b054b](https://github.com/Androlax2/dato-builder/commit/71b054b5e097c442cae20a44a21393fd53437cdb))

# [3.4.0](https://github.com/Androlax2/dato-builder/compare/v3.3.0...v3.4.0) (2025-05-06)


### Features

* **fields:** add Email field type ([5ffc073](https://github.com/Androlax2/dato-builder/commit/5ffc0730e7e52700fabb9e9969811d5ed2b55fda))
* **ItemTypeBuilder:** add addText method for single-line text fields ([0ccfed7](https://github.com/Androlax2/dato-builder/commit/0ccfed7e79bbb74e63e0f59bde07f88b0132ab67))
* **url:** add Url field type with validation support ([e723cc4](https://github.com/Androlax2/dato-builder/commit/e723cc49e8ee2188e4ccb08509ab349082f8374b))

# [3.3.0](https://github.com/Androlax2/dato-builder/compare/v3.2.6...v3.3.0) (2025-05-06)


### Features

* **logging:** enhance error handling for field operations ([88ec91e](https://github.com/Androlax2/dato-builder/commit/88ec91efece11c33529aaa7e5335b75052e17fef))

## [3.2.6](https://github.com/Androlax2/dato-builder/compare/v3.2.5...v3.2.6) (2025-05-06)


### Bug Fixes

* **validators:** required seo fields  ([#13](https://github.com/Androlax2/dato-builder/issues/13)) ([a65c820](https://github.com/Androlax2/dato-builder/commit/a65c820a88f822743d1fee0972e0548c37fa54be))

## [3.2.5](https://github.com/Androlax2/dato-builder/compare/v3.2.4...v3.2.5) (2025-05-06)


### Bug Fixes

* **sanitization:** remove sanitization from Validators ([af11889](https://github.com/Androlax2/dato-builder/commit/af1188979ee2580d1d4cb3ad943a7ff5874ff902))

## [3.2.4](https://github.com/Androlax2/dato-builder/compare/v3.2.3...v3.2.4) (2025-05-05)


### Bug Fixes

* **fields:** update body type to MultiLineTextBody ([02bc900](https://github.com/Androlax2/dato-builder/commit/02bc9006d20ec516cea22c77f0c193222576bd5f))

## [3.2.3](https://github.com/Androlax2/dato-builder/compare/v3.2.2...v3.2.3) (2025-05-05)


### Bug Fixes

* **validator:** add default values for title and alt in RequiredAltTitleValidator ([20a136f](https://github.com/Androlax2/dato-builder/commit/20a136fca6ebc379ecb23364287d522ee9c44044))

## [3.2.2](https://github.com/Androlax2/dato-builder/compare/v3.2.1...v3.2.2) (2025-05-05)


### Bug Fixes

* **validator:** add default values for title and alt in RequiredAltTitleValidator ([de55ff0](https://github.com/Androlax2/dato-builder/commit/de55ff0eeb4e68e82e4bd3ce75157f529cfef6fb))

## [3.2.1](https://github.com/Androlax2/dato-builder/compare/v3.2.0...v3.2.1) (2025-05-05)


### Bug Fixes

* **validator:** fix required alt title boolean ([19f5825](https://github.com/Androlax2/dato-builder/commit/19f582513a59bb9c44fe2b3a74998539f9a30d21))

# [3.2.0](https://github.com/Androlax2/dato-builder/compare/v3.1.0...v3.2.0) (2025-05-05)


### Features

* **debug:** field informations ([fcc2d32](https://github.com/Androlax2/dato-builder/commit/fcc2d3231cd31aaf4916229432981df29d4c5908))

# [3.1.0](https://github.com/Androlax2/dato-builder/compare/v3.0.0...v3.1.0) (2025-05-05)


### Features

* **debug:** builder informations ([31ddba0](https://github.com/Androlax2/dato-builder/commit/31ddba059c82490ea6a57551e84476e2e6902e26))

# [3.0.0](https://github.com/Androlax2/dato-builder/compare/v2.0.0...v3.0.0) (2025-05-05)


### Bug Fixes

* **alt validator:** fix required condition not working ([#6](https://github.com/Androlax2/dato-builder/issues/6)) ([0b759b4](https://github.com/Androlax2/dato-builder/commit/0b759b4cf8193e1a0a8cdb7a338fad78bf7d6bc9))


### BREAKING CHANGES

* **alt validator:** Modified cache behavior and introduced locking mechanism affecting cache-dependent operations.

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

* fix(RequiredAltTitleValidator): fix required boolean that doesn't work

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
