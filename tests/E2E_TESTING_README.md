# Coffee Tree Platform - End-to-End Testing Suite

This comprehensive end-to-end testing suite validates the complete Coffee Tree Platform functionality from grove registration through revenue distribution, including load testing, error handling, and performance validation.

## Overview

The E2E testing suite consists of four main categories:

1. **Integration Tests** - Complete user journeys and workflows
2. **Load Testing** - Performance under concurrent user scenarios
3. **Error Handling** - Recovery from various failure conditions
4. **Comprehensive Testing** - Full platform validation and reporting

## Test Structure

```
tests/
├── Integration/
│   ├── end-to-end-platform.spec.ts          # Complete user journeys
│   └── comprehensive-e2e-runner.spec.ts     # Test orchestration
├── Performance/
│   └── load-testing.spec.ts                 # Load and stress testing
├── ErrorHandling/
│   └── recovery-testing.spec.ts             # Error recovery scenarios
├── helpers/
│   └── platform-helper.ts                   # Test utilities
├── e2e-test-config.ts                        # Configuration settings
├── run-e2e-tests.ts                         # CLI test runner
└── E2E_TESTING_README.md                    # This file
```

## Running Tests

### Quick Start

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test suites
npm run test:e2e:integration    # Integration tests only
npm run test:e2e:load          # Load testing only
npm run test:e2e:recovery      # Error handling only
npm run test:e2e:comprehensive # Full comprehensive suite
```

### Advanced Usage

```bash
# Run with custom options
npm run test:e2e -- --suite integration --verbose --parallel

# Run with custom timeout
npm run test:e2e -- --timeout 600000

# Skip report generation
npm run test:e2e -- --no-report

# Custom output directory
npm run test:e2e -- --output-dir ./custom-reports
```

### CLI Options

- `--suite <name>` - Run specific test suite (integration, load, recovery)
- `--parallel` - Run test suites in parallel
- `--verbose` - Enable detailed output
- `--no-report` - Skip HTML/JSON report generation
- `--output-dir <dir>` - Custom output directory for reports
- `--timeout <ms>` - Test timeout in milliseconds
- `--retries <count>` - Number of retries for failed tests
- `--help` - Show help message

## Test Scenarios

### Integration Tests

#### Complete Farmer-to-Investor Journey
- Farmer verification and grove registration
- Tree tokenization and investor purchases
- Harvest reporting and revenue distribution
- Secondary market trading

#### Multi-User Scenarios
- Concurrent grove registrations
- Simultaneous token purchases
- Batch revenue distributions

### Load Testing

#### Concurrent Operations
- 50+ concurrent farmer registrations
- 100+ concurrent token purchases
- 500+ token holder revenue distributions

#### High-Frequency Trading
- Rapid successive transactions
- Burst trading activity
- Market maker scenarios

#### Scalability Testing
- Large dataset operations
- Memory pressure testing
- Network congestion simulation

### Error Handling

#### Transaction Failures
- Insufficient funds handling
- Double-spending prevention
- Failed transaction recovery

#### Data Corruption
- Invalid input validation
- State consistency maintenance
- Graceful error degradation

#### Network Issues
- Timeout handling with retries
- Partial failure recovery
- Network interruption resilience

#### Security Testing
- Unauthorized access prevention
- Verification bypass attempts
- Attack vector mitigation

## Performance Benchmarks

### Transaction Performance
- Grove Registration: < 10 seconds
- Token Purchase: < 8 seconds
- Harvest Reporting: < 12 seconds
- Revenue Distribution: < 30 seconds (100 holders)

### Throughput Targets
- 50+ transactions per second
- 100+ concurrent users
- 99.5%+ success rate
- < 5 second average response time

### Reliability Standards
- 99.9% uptime
- 0.1% error rate
- 30 second recovery time
- 100% data consistency

## Test Reports

The testing suite generates comprehensive reports in multiple formats:

### JSON Report (`e2e-test-report.json`)
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "duration": 300000,
  "summary": {
    "totalSuites": 4,
    "totalTests": 45,
    "totalPassed": 44,
    "totalFailed": 1,
    "successRate": 0.978
  },
  "performance": {
    "averageTestTime": 6667,
    "successRate": 0.978,
    "benchmarkComparison": {
      "meetsBenchmarks": true,
      "performanceScore": 0.85,
      "reliabilityScore": 0.978
    }
  },
  "recommendations": [
    "All tests are performing well. Continue monitoring."
  ]
}
```

### HTML Report (`e2e-test-report.html`)
Interactive HTML report with:
- Executive summary
- Detailed test results
- Performance charts
- Error analysis
- Recommendations

### CSV Summary (`e2e-test-summary.csv`)
Tabular data for spreadsheet analysis:
```csv
Suite,Passed,Failed,Duration(ms),Success Rate
Integration/end-to-end-platform.spec.ts,12,0,45000,1.0
Performance/load-testing.spec.ts,8,1,120000,0.889
ErrorHandling/recovery-testing.spec.ts,15,0,60000,1.0
```

## Configuration

### Test Configuration (`e2e-test-config.ts`)

```typescript
export const E2E_TEST_CONFIG = {
  timeouts: {
    default: 30000,
    integration: 60000,
    loadTesting: 300000,
    comprehensive: 900000
  },
  performance: {
    maxTransactionTime: 5000,
    minSuccessRate: 0.95,
    maxConcurrentUsers: 100
  },
  loadTesting: {
    concurrentUsers: [10, 25, 50, 100],
    transactionVolumes: [100, 500, 1000, 2000]
  }
};
```

### Environment Variables

```bash
# Test environment configuration
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.123456
HEDERA_PRIVATE_KEY=302e...

# Database configuration
DATABASE_URL=file:./test-data/test.db

# Test-specific settings
E2E_TIMEOUT=300000
E2E_RETRIES=3
E2E_PARALLEL=false
E2E_VERBOSE=false
```

## Troubleshooting

### Common Issues

#### Test Timeouts
```bash
# Increase timeout for slow operations
npm run test:e2e -- --timeout 900000
```

#### Memory Issues
```bash
# Run tests sequentially to reduce memory usage
npm run test:e2e -- --no-parallel
```

#### Network Failures
```bash
# Enable retries for flaky network conditions
npm run test:e2e -- --retries 5
```

### Debug Mode

```bash
# Enable verbose logging
npm run test:e2e -- --verbose

# Run single test suite for debugging
npm run test:e2e:integration -- --verbose
```

### Log Analysis

Test logs are available in:
- Console output (with `--verbose`)
- Test reports (`./test-reports/`)
- Individual test files (`./tests/logs/`)

## Continuous Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        with:
          name: test-reports
          path: test-reports/
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any
    stages {
        stage('E2E Tests') {
            steps {
                sh 'npm install'
                sh 'npm run test:e2e'
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'test-reports',
                        reportFiles: 'e2e-test-report.html',
                        reportName: 'E2E Test Report'
                    ])
                }
            }
        }
    }
}
```

## Best Practices

### Test Development
1. **Isolation** - Each test should be independent
2. **Cleanup** - Always clean up test data
3. **Assertions** - Use meaningful assertions
4. **Documentation** - Document complex test scenarios

### Performance Testing
1. **Realistic Data** - Use production-like data volumes
2. **Gradual Load** - Ramp up load gradually
3. **Monitoring** - Monitor system resources
4. **Baselines** - Establish performance baselines

### Error Testing
1. **Edge Cases** - Test boundary conditions
2. **Recovery** - Verify system recovery
3. **Consistency** - Check data consistency
4. **Logging** - Ensure proper error logging

## Contributing

### Adding New Tests

1. Create test file in appropriate directory
2. Follow existing naming conventions
3. Add test to configuration
4. Update documentation
5. Verify CI integration

### Test Categories

- **Unit Tests** - Individual component testing
- **Integration Tests** - Component interaction testing
- **E2E Tests** - Complete workflow testing
- **Performance Tests** - Load and stress testing
- **Security Tests** - Vulnerability testing

### Code Standards

- Use TypeScript for type safety
- Follow existing code style
- Add comprehensive comments
- Include error handling
- Write meaningful test descriptions

## Support

For questions or issues with the E2E testing suite:

1. Check this documentation
2. Review test logs and reports
3. Check existing GitHub issues
4. Create new issue with details
5. Contact the development team

## Changelog

### v1.0.0
- Initial E2E testing suite
- Integration, load, and error handling tests
- Comprehensive reporting system
- CLI test runner
- Performance benchmarking

### Future Enhancements
- Visual regression testing
- API contract testing
- Mobile app testing
- Cross-browser testing
- Automated performance monitoring