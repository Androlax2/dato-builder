# Integration Tests Guidelines

## Overview

This document outlines the comprehensive integration testing strategy for dato-builder, including completed modifications, test structure, and implementation roadmap.

## ✅ Completed Foundation Work

### 1. ConfigParser Enhancement
- **Modified**: `src/config/ConfigParser.ts` to accept optional `configPath` parameter
- **Backward Compatible**: Default behavior unchanged for normal use
- **Security**: Custom config paths still validated for security
- **Unit Tests**: Added 4 comprehensive unit tests for custom config functionality

### 2. Test Configuration Setup
- **Created**: `tests/fixtures/dato-builder.test.config.js`
- **Features**: 
  - Points to fixture directories (`./tests/fixtures/blocks`, `./tests/fixtures/models`)
  - Includes `dotenv/config` for environment variable support
  - Uses `DATOCMS_API_TOKEN` from environment
  - Sets `overwriteExistingFields: true` for clean testing

### 3. Clean Slate Preparation
- **Removed**: All existing broken integration tests
- **Ready**: Clean `tests/integration/` directory for new tests

### 4. CLI Infrastructure Enhancement ⭐ **NEW**
- **Modified**: `src/cli.ts` - Added optional `customConfigPath` constructor parameter
- **Enhanced**: `src/cli/CommandBuilder.ts` - Support custom config paths for all commands (build, generate, clear-cache)
- **Updated**: `src/cli/CLIInitializer.ts` - Pass custom config path to ConfigParser
- **Verified**: All changes pass `npm run typecheck` with no breaking changes
- **Backward Compatible**: Normal CLI usage unchanged
- **Ready for Testing**: Can now create CLI instances with custom configs for isolated integration tests

## 📁 Fixture Structure Analysis

### Available Test Fixtures

#### Blocks
1. **IntegrationTestBaseBlock** (`integration_test_base_block`)
   - Simple text field (required) + boolean field
   - Basic validation testing

2. **IntegrationTestComplexBlock** (`integration_test_complex_block`)
   - Uses async `getBlock()` dependencies
   - Tests modular content with multiple block references
   - Integer field with number_range validation

3. **IntegrationTestReferenceBlock** (`integration_test_reference_block`)
   - Uses async `getBlock()` to reference another block
   - Tests modular content with single block reference
   - Demonstrates block-to-block dependency resolution

#### Models
1. **IntegrationTestBaseModel** (`integration_test_base_model`)
   - Basic model structure
   - Simple fields for reference testing

2. **IntegrationTestRelatedModel** (`integration_test_related_model`)
   - Uses async `getModel()` for model references
   - Tests Link and Links fields with model relationships

3. **IntegrationTestMixedModel** (`integration_test_mixed_model`)
   - Complex model with both block and model references
   - Uses `getBlock()` and `getModel()` in same file
   - Tests modular content, links, and datetime fields

## 🎯 Integration Test Areas

### Core Integration Workflows

#### 1. Configuration & CLI Integration
- **Purpose**: Validate custom config loading and CLI initialization
- **Tests**:
  - ConfigParser loads test config correctly
  - CLI initializes with custom config
  - Environment variables work (DATOCMS_API_TOKEN)
  - Error handling for invalid configs

#### 2. Basic Building Workflow
- **Purpose**: Test simple block/model creation end-to-end
- **Tests**:
  - Build simple block (`IntegrationTestBaseBlock`)
  - Verify creation in DatoCMS
  - Field types and validators work correctly
  - API key generation is correct

#### 3. CLI Options & Flags
- **Purpose**: Validate CLI option functionality
- **Tests**:
  - `--skip-deletion` prevents deletion
  - `--auto-concurrency` works correctly
  - `--debug` provides detailed output
  - `--no-cache` bypasses caching
  - Global options (`-v`, `-q`, `-d`) function properly

#### 4. Dependency Resolution
- **Purpose**: Test async `getBlock()`/`getModel()` functionality
- **Tests**:
  - Simple block dependencies
  - Model-to-model references
  - Complex multi-level dependencies
  - Circular dependency handling
  - BuilderContext functionality

#### 5. Complex Workflows
- **Purpose**: Test real-world complex scenarios
- **Tests**:
  - Mixed block/model projects
  - Multiple async dependencies
  - Complex field validation chains
  - Large project builds

#### 6. Error Handling & Edge Cases
- **Purpose**: Validate robust error handling
- **Tests**:
  - Invalid API tokens
  - Network failures
  - Missing dependencies
  - Malformed fixture files
  - DatoCMS API errors

#### 7. Performance & Concurrency
- **Purpose**: Test performance optimizations
- **Tests**:
  - Concurrent building performance
  - Cache effectiveness
  - Large project handling
  - Memory usage validation

#### 8. State Management
- **Purpose**: Test build state and updates
- **Tests**:
  - Subsequent builds (no duplication)
  - Field updates and modifications
  - Deletion detection and cleanup
  - Cache invalidation

## 📋 Test Structure & Organization

### Recommended Test File Organization

```
tests/integration/
├── 01-config/
│   ├── ConfigLoading.integration.test.ts
│   ├── CLIInitialization.integration.test.ts
│   └── EnvironmentVariables.integration.test.ts
├── 02-basic-building/
│   ├── SimpleBlocks.integration.test.ts
│   ├── SimpleModels.integration.test.ts
│   └── FieldValidation.integration.test.ts
├── 03-cli-options/
│   ├── BuildFlags.integration.test.ts
│   ├── GlobalOptions.integration.test.ts
│   └── ConcurrencyOptions.integration.test.ts
├── 04-dependencies/
│   ├── BlockDependencies.integration.test.ts
│   ├── ModelDependencies.integration.test.ts
│   └── ComplexDependencies.integration.test.ts
├── 05-complex-workflows/
│   ├── MixedProjects.integration.test.ts
│   ├── LargeProjects.integration.test.ts
│   └── RealWorldScenarios.integration.test.ts
├── 06-error-handling/
│   ├── APIErrors.integration.test.ts
│   ├── NetworkErrors.integration.test.ts
│   └── ConfigurationErrors.integration.test.ts
├── 07-performance/
│   ├── ConcurrentBuilding.integration.test.ts
│   ├── CachePerformance.integration.test.ts
│   └── MemoryUsage.integration.test.ts
└── 08-state-management/
    ├── SubsequentBuilds.integration.test.ts
    ├── UpdateDetection.integration.test.ts
    └── DeletionHandling.integration.test.ts
```

### Test Isolation Strategy

#### Per-Test Isolation
- Each test uses isolated DatoCMS resources
- Unique API keys per test run
- Proper cleanup after each test
- No test interdependencies

#### Resource Management
- BeforeAll: Setup test environment, clean existing resources
- AfterAll: Comprehensive cleanup of all created resources
- BeforeEach: Prepare test-specific resources
- AfterEach: Clean test-specific resources

#### Configuration Strategy
- Use custom ConfigParser with test config
- Environment-based API token management
- Fixture-based test data
- Predictable API key generation

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Completed ✅)
- [x] ConfigParser modification
- [x] Test configuration file
- [x] Unit tests for ConfigParser
- [x] Clean integration test directory

### Phase 2: Core Integration Tests (Completed ✅)
- [x] Config loading integration test
- [x] CLI initialization test
- [x] Simple block building test
- [x] Basic DatoCMS verification

### Phase 3: CLI Options Testing (Completed ✅)
- [x] Build flags testing
- [x] Global options testing (skipped per user feedback)
- [x] Error handling for CLI options

### Phase 4: Dependency Testing (Completed ✅)
- [x] Block dependency resolution
- [x] Model dependency resolution
- [x] Complex dependency chains

### Phase 5: Advanced Workflows (Completed ✅)
- [x] Mixed project testing
- [x] Complex dependency chains
- [x] Cross-reference validation

### Phase 6: Error Handling & Edge Cases
- [ ] API error scenarios
- [ ] Configuration errors
- [ ] Dependency resolution failures
- [ ] Field validation errors

### Phase 7: State Management & Updates
- [ ] Subsequent build testing
- [ ] Cache management
- [ ] Update detection
- [ ] Deletion handling

### Phase 8: Performance & Scalability (Completed ✅)
- [x] Large project testing
- [x] Concurrency validation
- [x] Cache performance
- [x] Rate limiting handling

### Phase 9: Real-World Scenarios
- [ ] E-commerce schema testing
- [ ] Blog/CMS scenarios
- [ ] Portfolio schemas
- [ ] Multi-language setups

### Phase 10: CLI Command Coverage
- [ ] Generate command testing
- [ ] Clear-cache functionality
- [ ] Help/version commands
- [ ] Configuration validation

### Phase 11: Field Type Comprehensive Testing
- [ ] All basic field types
- [ ] Media field validation
- [ ] Relationship field testing
- [ ] Advanced field scenarios

### Phase 12: Security & Validation
- [ ] Input validation testing
- [ ] API security scenarios
- [ ] File security validation
- [ ] Configuration security

### Phase 13: Environment Compatibility
- [ ] Node version testing
- [ ] Package manager compatibility
- [ ] OS compatibility
- [ ] CI/CD integration

### Phase 14: Documentation & Examples
- [ ] Generated code quality
- [ ] Example project validation
- [ ] Integration guide testing
- [ ] Migration scenarios

## 🛠️ Implementation Guidelines

### Test Writing Principles
1. **Single Responsibility**: Each test file focuses on one specific area
2. **Isolation**: Tests don't depend on each other
3. **Real API**: Use actual DatoCMS API for true integration testing
4. **Cleanup**: Always clean up created resources
5. **Predictable**: Use consistent naming and setup patterns
6. **Type Safety**: Always run `npm run typecheck` before considering code complete

### Naming Conventions
- **Test Files**: `*.integration.test.ts`
- **Test Suites**: Descriptive suite names matching file purpose
- **API Keys**: Predictable test prefixes (`test_integration_*`)
- **Resources**: Clear naming for easy identification and cleanup

### Error Handling Strategy
- **Graceful Failures**: Tests should handle API failures gracefully
- **Detailed Logging**: Provide clear error messages for debugging
- **Retry Logic**: Implement retry for transient failures
- **Cleanup on Failure**: Ensure cleanup even when tests fail

### Performance Considerations
- **Parallel Execution**: Design tests for parallel execution when possible
- **Resource Limits**: Respect DatoCMS API rate limits
- **Timeout Management**: Appropriate timeouts for different operations
- **Efficient Cleanup**: Batch cleanup operations when possible

## 📊 Success Criteria

### Coverage Goals
- **CLI Commands**: 100% of build command options tested
- **Field Types**: All major field types validated
- **Dependencies**: All dependency resolution patterns tested
- **Error Scenarios**: Major error paths covered
- **Performance**: Concurrency and caching validated

### Quality Metrics
- **Reliability**: Tests pass consistently (>95% success rate)
- **Speed**: Integration tests complete in reasonable time (<10 minutes)
- **Maintainability**: Tests are easy to understand and modify
- **Documentation**: Clear test documentation and examples

## 🔧 Development Workflow

### Adding New Integration Tests
1. **Identify Test Area**: Determine which category the test belongs to
2. **Create Test File**: Follow naming convention and directory structure
3. **Checkpoint**: Present plan and approach for validation before implementation
4. **Setup Resources**: Use ConfigParser with test config
5. **Write Test Logic**: Focus on single responsibility
6. **Add Cleanup**: Ensure proper resource cleanup
7. **Run TypeCheck**: Execute `npm run typecheck` to ensure type safety
8. **Verify Isolation**: Test runs independently
9. **Checkpoint**: Validate completed implementation before moving to next test
10. **Update Documentation**: Add test to this guide and mark progress

### Running Integration Tests
```bash
# Run all integration tests
npm run test:integration

# Run specific category
npm run test:integration -- --testPathPatterns="01-config"

# Run with debugging
npm run test:integration -- --verbose

# Run single test file
npm run test:integration -- --testPathPatterns="ConfigLoading"
```

### Debugging Integration Tests
1. **Use --debug flag**: Add CLI debug output
2. **Check DatoCMS**: Verify resources in DatoCMS dashboard
3. **Environment Variables**: Ensure DATOCMS_API_TOKEN is set
4. **Network Issues**: Check API connectivity
5. **Resource Conflicts**: Verify unique API keys

## 📝 Notes & Considerations

### Current Limitations
- Need to modify CLI to accept custom config paths for testing
- Some CLI commands may not have direct integration test interfaces
- Rate limiting considerations for parallel test execution

### Future Enhancements
- Add visual regression testing for generated code
- Implement test data factories for complex scenarios
- Add performance benchmarking and regression detection
- Consider Docker environment for consistent testing

### Best Practices
- Always use test-specific API tokens when possible
- Implement circuit breakers for API rate limiting
- Use descriptive test names that explain the scenario
- Include setup and teardown timing in test output
- Document any test-specific DatoCMS configuration requirements
- **Always run `npm run typecheck`** before marking any code as complete
- **Checkpoint frequently** with stakeholders to validate approach and implementation
- Update this guidelines file as tests are implemented to track progress

## 📈 Implementation Progress Tracker

### Completed ✅
- [x] ConfigParser modification with optional configPath parameter
- [x] Test configuration file with dotenv integration
- [x] Unit tests for ConfigParser custom path functionality
- [x] Integration test guidelines documentation
- [x] Clean integration test directory preparation
- [x] **CLI Infrastructure Enhancement**
  - [x] Modified CLI.ts to accept optional customConfigPath constructor parameter
  - [x] Enhanced CommandBuilder.ts to support custom config paths for all commands
  - [x] Updated CLIInitializer.ts to pass custom config to ConfigParser
  - [x] All changes verified with `npm run typecheck` - no breaking changes
  - [x] Backward compatibility maintained for normal CLI usage
- [x] **Unit Tests for CLI Custom Config**
  - [x] Added comprehensive unit tests for CLI.ts constructor with custom config paths
  - [x] Added unit tests for CommandBuilder.ts custom config propagation through all commands
  - [x] Added unit tests for CLIInitializer.ts custom config integration with ConfigParser
  - [x] Added end-to-end unit tests validating complete CLI → CommandBuilder → initializeCLI chain
  - [x] All tests pass with no regressions (265 tests passing)
- [x] **First Integration Test - SimpleBlocks** (NEW)
  - [x] Created per-test fixture isolation structure: `tests/integration/simple-blocks/`
  - [x] Implemented TestSimpleBlock.ts fixture with basic text and boolean fields
  - [x] Created test-specific config: `simple-blocks.config.js` pointing only to test fixtures
  - [x] Built working integration test using CLI custom config infrastructure
  - [x] Verified actual DatoCMS API integration - block successfully built to DatoCMS
  - [x] All 4 integration tests pass: config validation, fixture validation, CLI integration, actual build
- [x] **Phase 2: Core Integration Tests - SimpleModels** (NEW)
  - [x] Created SimpleModels integration test following SimpleBlocks pattern
  - [x] Implemented TestSimpleModel.ts fixture with heading and text fields
  - [x] Created test-specific config: `simple-models.config.js` with per-test isolation
  - [x] Verified model building to DatoCMS API with field validation
  - [x] Test passes: real API integration, field verification, automatic cleanup
  - [x] Established proven pattern for model testing

- [x] **Phase 2: Core Integration Tests - FieldValidation** (COMPLETED ✅)
  - [x] Created FieldValidation integration test structure
  - [x] Implemented TestFieldValidationBlock.ts with 5 field types (text, boolean, integer, date, datetime)
  - [x] Added comprehensive validator testing (required, number_range)
  - [x] Test passes: real API integration, field type verification, validator checking
  - [x] Fixed TypeScript type assertions for validator properties
  - [x] All Phase 2 tests verified working together (3/3 pass)

### Completed Phase 2 Summary ✅
**Phase 2: Core Integration Tests** - All tests working with proven patterns:
- ✅ **SimpleBlocks**: Block building with text + boolean fields
- ✅ **SimpleModels**: Model building with heading + text fields  
- ✅ **FieldValidation**: Comprehensive field types (text, boolean, integer, date, datetime) + validators
- ✅ **Type Safety**: All tests pass `npm run typecheck` 
- ✅ **Real API**: All tests use actual DatoCMS API with automatic cleanup
- ✅ **Isolation**: Per-test fixture isolation prevents test pollution

- [x] **Phase 3: CLI Options Testing - BuildFlags** (COMPLETED ✅)
  - [x] Created BuildFlags integration test structure
  - [x] Implemented TestBuildFlagsBlock.ts with basic text and boolean fields
  - [x] Created comprehensive CLI flag testing for:
    - [x] `--skip-deletion` flag (prevents accidental deletions)
    - [x] `--no-cache` flag (forces rebuild without cache)
    - [x] `--auto-concurrency` flag (enables automatic concurrency - "Auto-determined concurrency level: 7")
    - [x] Combined flags (all three together)
  - [x] All 4 flag tests pass: real API integration, proper flag behavior verification
  - [x] Verified caching behavior: "SUCCESS: block (from cache)" vs "SUCCESS: block (built)"
  - [x] Automatic cleanup functioning properly

### Completed Phase 3 Summary ✅
**Phase 3: CLI Options Testing** - Essential CLI flags tested and working:
- ✅ **BuildFlags**: CLI flag functionality verified with real DatoCMS integration
- ✅ **Flag Combinations**: Multiple flags work together correctly
- ✅ **Cache Behavior**: `--no-cache` forces rebuild, default behavior uses cache
- ✅ **Concurrency**: `--auto-concurrency` enables auto-determination ("Auto-determined concurrency level: 7")
- ✅ **Type Safety**: All tests pass `npm run typecheck`
- ✅ **Real API**: All flag tests use actual DatoCMS API with proper verification

- [x] **Phase 4: Dependency Testing - BlockDependencies** (COMPLETED ✅)
  - [x] Created BlockDependencies integration test structure
  - [x] Implemented IntegrationTestBaseBlock.ts and IntegrationTestReferenceBlock.ts with async getBlock() dependency
  - [x] Fixed module resolution issues in test environment by enhancing DependencyAnalyzer and ItemBuilder
  - [x] Added intelligent test environment detection and temp file resolution for @/ imports
  - [x] Test passes: real API integration, dependency order verification, async getBlock() functionality
  - [x] Verified reference block correctly references base block via modular content field

- [x] **Phase 4: Dependency Testing - ModelDependencies** (COMPLETED ✅)
  - [x] Created ModelDependencies integration test structure
  - [x] Implemented IntegrationTestBaseModel.ts and IntegrationTestReferenceModel.ts with async getModel() dependency
  - [x] Used addLink() method for model-to-model references via item_item_type validators
  - [x] Test passes: real API integration, dependency order verification, async getModel() functionality
  - [x] Verified reference model correctly references base model via link field

### Completed Phase 4 Summary ✅
**Phase 4: Dependency Testing** - Async dependency resolution tested and working:
- ✅ **BlockDependencies**: async getBlock() functionality with modular content fields
- ✅ **ModelDependencies**: async getModel() functionality with link fields
- ✅ **Module Resolution**: Fixed Jest test environment module resolution for @/ imports
- ✅ **Dependency Order**: Both tests verify correct dependency build order
- ✅ **Type Safety**: All tests pass `npm run typecheck` 
- ✅ **Real API**: Both tests use actual DatoCMS API with field verification and automatic cleanup
- ✅ **Infrastructure Enhancement**: DependencyAnalyzer and ItemBuilder enhanced for test environment compatibility

- [x] **Phase 5: Advanced Workflows - MixedDependencies** (COMPLETED ✅)
  - [x] Created MixedDependencies integration test structure
  - [x] Implemented ContentBlock and MediaBlock with block-to-block dependencies (MediaBlock refs ContentBlock)
  - [x] Implemented Author and Article models with model-to-model dependencies (Article refs Author)  
  - [x] Implemented cross-references: Article model uses both ContentBlock and MediaBlock via modular content
  - [x] Test passes: real API integration, complex dependency order verification, cross-reference validation
  - [x] Verified advanced field types: addSingleAsset, addSlug, wysiwyg editor with proper appearance configuration
  - [x] Demonstrated real-world blog/CMS scenario with proper content relationships

### Completed Phase 5 Summary ✅
**Phase 5: Advanced Workflows** - Complex mixed dependencies tested and working:
- ✅ **MixedDependencies**: Complex real-world scenario with blocks, models, and cross-references
- ✅ **Multi-Level Dependencies**: 4-way dependency chain (ContentBlock → MediaBlock → Article, Author → Article)
- ✅ **Cross-Reference Validation**: Models using blocks and blocks using other blocks
- ✅ **Advanced Field Types**: Single assets, slug fields, wysiwyg editors, modular content
- ✅ **Type Safety**: All tests pass `npm run typecheck` with complex field configurations
- ✅ **Real API**: Complete project built to DatoCMS with field relationship verification
- ✅ **Complete Suite**: All 3 dependency tests pass together (42.643s total runtime)

- [x] **Phase 6: Error Handling & Edge Cases** (COMPLETED ✅)
  - [x] **APIErrors**: Invalid tokens, missing tokens, configuration errors with proper error handling
  - [x] **ConfigErrors**: Missing config files, malformed configs, invalid directory paths, environment variable issues
  - [x] **DependencyErrors**: Circular dependencies (CircularA ↔ CircularB), missing dependencies (NonexistentBlock)
  - [x] **FieldErrors**: Invalid field configurations, invalid API key formats, validator constraint checking
  - [x] **Type Safety**: All tests pass `npm run typecheck` with proper ES module syntax and DatoBuilderConfig types
  - [x] **Error Gracfulness**: All error scenarios handled gracefully with meaningful error messages
  - [x] **Test Structure**: Per-test isolation with proper fixtures and config files

### Completed Phase 6 Summary ✅
**Phase 6: Error Handling & Edge Cases** - Comprehensive error scenario testing:
- ✅ **API Error Handling**: Invalid/missing tokens, configuration validation, network error resilience
- ✅ **Configuration Error Handling**: Missing configs, malformed configs, invalid paths, environment variables
- ✅ **Dependency Error Handling**: Circular references, missing dependencies, broken async imports
- ✅ **Field Error Handling**: Invalid configurations, invalid API keys, validator constraints
- ✅ **Type Safety**: All tests pass `npm run typecheck` with proper TypeScript validation
- ✅ **ES Module Support**: All configs use proper ES module syntax with DatoBuilderConfig types
- ✅ **Graceful Degradation**: System handles all error scenarios without crashes

- [x] **Phase 7: State Management & Updates** (COMPLETED ✅)
  - [x] **SubsequentBuilds**: First build creation, cached builds, forced rebuilds, no duplication verification
  - [x] **CacheManagement**: Cache behavior validation, cache performance testing, cache invalidation, cache consistency
  - [x] **DeletionHandling**: Cache-based deletion detection, skip-deletion flag protection, forced deletion of orphaned cached items
  - [x] **UpdateDetection**: Cache-based change detection, field addition, validator updates, label modifications
  - [x] **State Consistency**: Multiple builds maintain consistent state, proper cache/no-cache alternation
  - [x] **Build Optimization**: Cache performance verification, forced rebuild validation
  - [x] **Type Safety**: All tests pass `npm run typecheck` with proper state management patterns
  - [x] **Real API**: All state management tests use actual DatoCMS API with field verification
  - [x] **Comprehensive Coverage**: Full state lifecycle testing with file modifications and cleanup

### Completed Phase 7 Summary ✅
**Phase 7: State Management & Updates** - Build state and caching tested and working:
- ✅ **Subsequent Builds**: No duplication on rebuild, proper state maintenance, field consistency
- ✅ **Cache Management**: Cache performance, invalidation, consistency between cached/non-cached builds
- ✅ **Cache-Based Deletion**: Detection of missing files from cache, skip-deletion flag protection, forced deletion
- ✅ **Cache-Based Update Detection**: Change detection via cache comparison, field addition, validator updates, label modifications
- ✅ **State Consistency**: Multiple build verification, alternating cache modes, proper cleanup
- ✅ **Build Optimization**: Cache hit verification, forced rebuild validation, performance monitoring
- ✅ **Type Safety**: All tests pass `npm run typecheck` with proper state management
- ✅ **Real API**: All tests use actual DatoCMS API with comprehensive state verification
- ✅ **Production Ready**: State management suitable for production deployment workflows

### Next Steps 📋

#### Phase 8: Performance & Scalability
- [ ] **Large Projects**: 50+ blocks/models, complex dependency trees, memory usage
- [ ] **Concurrency Testing**: Parallel builds, race conditions, resource contention
- [ ] **Cache Performance**: Build time improvements, cache hit rates, memory efficiency
- [ ] **Rate Limiting**: DatoCMS API limits, backoff strategies, batch optimizations

#### Phase 9: Real-World Scenarios
- [ ] **E-commerce Schema**: Products, categories, inventory, complex relationships
- [ ] **Blog/CMS Schema**: Posts, authors, tags, SEO fields, modular content
- [ ] **Portfolio Schema**: Projects, skills, testimonials, media galleries
- [ ] **Multi-language Setup**: Localization fields, language-specific content

#### Phase 10: CLI Command Coverage
- [ ] **Generate Command**: Template generation, file output validation
- [ ] **Clear-Cache Command**: Cache clearing, selective cache removal
- [ ] **Help/Version Commands**: CLI help output, version reporting
- [ ] **Configuration Commands**: Config validation, environment setup

#### Phase 11: Field Type Comprehensive Testing
- [ ] **Basic Fields**: All text variants, number types, boolean fields
- [ ] **Media Fields**: Images, videos, files, galleries, asset validation
- [ ] **Relationship Fields**: Links, modular content, nested structures
- [ ] **Advanced Fields**: JSON, rich text, structured text, custom validators

#### Phase 12: Security & Validation
- [ ] **Input Validation**: Malicious input handling, XSS prevention, injection protection
- [ ] **API Security**: Token validation, permission testing, unauthorized access
- [ ] **File Security**: Path traversal prevention, file upload validation
- [ ] **Configuration Security**: Sensitive data handling, environment variable security

#### Phase 13: Browser & Environment Compatibility
- [ ] **Node Versions**: Multiple Node.js versions, compatibility testing
- [ ] **Package Manager**: npm, yarn, pnpm compatibility
- [ ] **Operating Systems**: Windows, macOS, Linux testing
- [ ] **CI/CD Integration**: GitHub Actions, Jenkins, automated testing

#### Phase 14: Documentation & Examples
- [ ] **Generated Code Quality**: TypeScript types, JSDoc comments, code formatting
- [ ] **Example Projects**: Complete working examples, starter templates
- [ ] **Integration Guides**: Framework integration, deployment guides
- [ ] **Migration Testing**: Version upgrades, breaking change handling