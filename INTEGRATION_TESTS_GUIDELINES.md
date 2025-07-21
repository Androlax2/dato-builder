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

### Phase 2: Core Integration Tests
- [ ] Config loading integration test
- [ ] CLI initialization test
- [ ] Simple block building test
- [ ] Basic DatoCMS verification

### Phase 3: CLI Options Testing
- [ ] Build flags testing
- [ ] Global options testing
- [ ] Error handling for CLI options

### Phase 4: Dependency Testing
- [ ] Block dependency resolution
- [ ] Model dependency resolution
- [ ] Complex dependency chains

### Phase 5: Advanced Workflows
- [ ] Mixed project testing
- [ ] Performance testing
- [ ] State management testing

### Phase 6: Comprehensive Coverage
- [ ] Error scenario testing
- [ ] Edge case handling
- [ ] Real-world scenario validation

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

### In Progress 🔄
- [x] **Phase 2: Core Integration Tests - FieldValidation** (CREATED, NOT TESTED)
  - [x] Created FieldValidation integration test structure
  - [x] Implemented TestFieldValidationBlock.ts with 5 field types (text, boolean, integer, date, datetime)
  - [x] Added comprehensive validator testing (required, number_range)
  - [ ] **PENDING: Run test to verify functionality**

### Next Steps 📋
- [ ] **IMMEDIATE: Test FieldValidation integration test**
- [ ] **READY: Continue Phase 2 with established patterns**
- [ ] Create additional integration tests: Dependencies, CLI Options, Error Handling
- [ ] Move to Phase 3: CLI Options Testing
- [ ] Build out comprehensive integration test suite