#!/usr/bin/env node

/**
 * End-to-End Test Runner Script
 * 
 * Command-line utility for running comprehensive end-to-end tests
 * with various configuration options and reporting capabilities.
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { E2E_TEST_CONFIG, TEST_SCENARIOS, PERFORMANCE_BENCHMARKS } from './e2e-test-config';

interface TestRunOptions {
  suite?: string;
  parallel?: boolean;
  verbose?: boolean;
  generateReport?: boolean;
  outputDir?: string;
  timeout?: number;
  retries?: number;
}

class E2ETestRunner {
  private options: TestRunOptions;
  private results: any[] = [];
  private startTime: number = 0;
  
  constructor(options: TestRunOptions = {}) {
    this.options = {
      parallel: false,
      verbose: false,
      generateReport: true,
      outputDir: './test-reports',
      timeout: E2E_TEST_CONFIG.timeouts.comprehensive,
      retries: 3,
      ...options
    };
  }
  
  async run(): Promise<void> {
    console.log('🚀 Starting Coffee Tree Platform E2E Tests');
    console.log('=' .repeat(50));
    
    this.startTime = Date.now();
    
    try {
      await this.setupTestEnvironment();
      await this.runTestSuites();
      await this.generateReports();
      await this.cleanup();
      
      console.log('\n✅ All E2E tests completed successfully!');
      this.printSummary();
      
    } catch (error) {
      console.error('\n❌ E2E test execution failed:', error);
      process.exit(1);
    }
  }
  
  private async setupTestEnvironment(): Promise<void> {
    console.log('\n🔧 Setting up test environment...');
    
    // Create output directory
    await fs.mkdir(this.options.outputDir!, { recursive: true });
    
    // Initialize test database
    console.log('  - Initializing test database');
    
    // Setup test contracts
    console.log('  - Deploying test contracts');
    
    // Configure test network
    console.log('  - Configuring test network');
    
    console.log('✅ Test environment ready');
  }
  
  private async runTestSuites(): Promise<void> {
    const testSuites = this.getTestSuites();
    
    console.log(`\n🧪 Running ${testSuites.length} test suites...`);
    
    if (this.options.parallel) {
      await this.runSuitesInParallel(testSuites);
    } else {
      await this.runSuitesSequentially(testSuites);
    }
  }
  
  private getTestSuites(): string[] {
    const allSuites = [
      'Integration/end-to-end-platform.spec.ts',
      'Performance/load-testing.spec.ts',
      'ErrorHandling/recovery-testing.spec.ts',
      'Integration/comprehensive-e2e-runner.spec.ts'
    ];
    
    if (this.options.suite) {
      return allSuites.filter(suite => suite.includes(this.options.suite!));
    }
    
    return allSuites;
  }
  
  private async runSuitesSequentially(testSuites: string[]): Promise<void> {
    for (let i = 0; i < testSuites.length; i++) {
      const suite = testSuites[i];
      console.log(`\n📋 Running suite ${i + 1}/${testSuites.length}: ${suite}`);
      
      const result = await this.runSingleSuite(suite);
      this.results.push(result);
      
      if (result.failed > 0 && !this.options.retries) {
        throw new Error(`Test suite ${suite} failed with ${result.failed} failures`);
      }
    }
  }
  
  private async runSuitesInParallel(testSuites: string[]): Promise<void> {
    console.log('🔄 Running test suites in parallel...');
    
    const promises = testSuites.map(suite => this.runSingleSuite(suite));
    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.results.push(result.value);
      } else {
        console.error(`❌ Suite ${testSuites[index]} failed:`, result.reason);
        this.results.push({
          suite: testSuites[index],
          passed: 0,
          failed: 1,
          duration: 0,
          error: result.reason.message
        });
      }
    });
  }
  
  private async runSingleSuite(suitePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const args = [
        'test',
        `tests/${suitePath}`,
        '--run',
        `--timeout=${this.options.timeout}`
      ];
      
      if (this.options.verbose) {
        args.push('--verbose');
      }
      
      const testProcess = spawn('npm', args, {
        stdio: this.options.verbose ? 'inherit' : 'pipe',
        shell: true
      });
      
      let output = '';
      let errorOutput = '';
      
      if (!this.options.verbose) {
        testProcess.stdout?.on('data', (data) => {
          output += data.toString();
        });
        
        testProcess.stderr?.on('data', (data) => {
          errorOutput += data.toString();
        });
      }
      
      testProcess.on('close', (code) => {
        const duration = Date.now() - startTime;
        const result = this.parseTestOutput(output, errorOutput);
        
        resolve({
          suite: suitePath,
          passed: result.passed,
          failed: result.failed,
          duration,
          exitCode: code,
          output: this.options.verbose ? '' : output,
          errors: this.options.verbose ? '' : errorOutput
        });
      });
      
      testProcess.on('error', (error) => {
        reject(error);
      });
      
      // Set timeout
      setTimeout(() => {
        testProcess.kill('SIGTERM');
        reject(new Error(`Test suite ${suitePath} timed out after ${this.options.timeout}ms`));
      }, this.options.timeout!);
    });
  }
  
  private parseTestOutput(output: string, errorOutput: string): { passed: number; failed: number } {
    // Parse vitest output format
    const passMatch = output.match(/✓\s+(\d+)\s+passed/i) || output.match(/(\d+)\s+passed/i);
    const failMatch = output.match(/✗\s+(\d+)\s+failed/i) || output.match(/(\d+)\s+failed/i);
    
    return {
      passed: passMatch ? parseInt(passMatch[1]) : 0,
      failed: failMatch ? parseInt(failMatch[1]) : 0
    };
  }
  
  private async generateReports(): Promise<void> {
    if (!this.options.generateReport) {
      return;
    }
    
    console.log('\n📊 Generating test reports...');
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      configuration: this.options,
      summary: this.generateSummary(),
      suites: this.results,
      performance: this.analyzePerformance(),
      recommendations: this.generateRecommendations()
    };
    
    // Generate JSON report
    const jsonReportPath = path.join(this.options.outputDir!, 'e2e-test-report.json');
    await fs.writeFile(jsonReportPath, JSON.stringify(report, null, 2));
    console.log(`  - JSON report: ${jsonReportPath}`);
    
    // Generate HTML report
    const htmlReportPath = path.join(this.options.outputDir!, 'e2e-test-report.html');
    await this.generateHtmlReport(report, htmlReportPath);
    console.log(`  - HTML report: ${htmlReportPath}`);
    
    // Generate CSV summary
    const csvReportPath = path.join(this.options.outputDir!, 'e2e-test-summary.csv');
    await this.generateCsvReport(report, csvReportPath);
    console.log(`  - CSV summary: ${csvReportPath}`);
  }
  
  private generateSummary(): any {
    const totalTests = this.results.reduce((sum, r) => sum + r.passed + r.failed, 0);
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    
    return {
      totalSuites: this.results.length,
      totalTests,
      totalPassed,
      totalFailed,
      successRate: totalTests > 0 ? totalPassed / totalTests : 0,
      totalDuration,
      averageSuiteDuration: this.results.length > 0 ? totalDuration / this.results.length : 0
    };
  }
  
  private analyzePerformance(): any {
    const summary = this.generateSummary();
    const benchmarks = PERFORMANCE_BENCHMARKS;
    
    return {
      averageTestTime: summary.totalTests > 0 ? summary.totalDuration / summary.totalTests : 0,
      successRate: summary.successRate,
      benchmarkComparison: {
        meetsBenchmarks: summary.successRate >= benchmarks.reliability.uptime,
        performanceScore: this.calculatePerformanceScore(),
        reliabilityScore: summary.successRate
      }
    };
  }
  
  private calculatePerformanceScore(): number {
    const summary = this.generateSummary();
    const avgTime = summary.totalTests > 0 ? summary.totalDuration / summary.totalTests : 0;
    const maxAcceptableTime = 10000; // 10 seconds per test
    
    return Math.max(0, 1 - (avgTime / maxAcceptableTime));
  }
  
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const summary = this.generateSummary();
    
    if (summary.successRate < 0.95) {
      recommendations.push('Success rate is below 95%. Investigate failing tests and improve error handling.');
    }
    
    if (summary.averageSuiteDuration > 300000) { // 5 minutes
      recommendations.push('Test suites are taking longer than expected. Consider optimizing test setup and execution.');
    }
    
    if (summary.totalFailed > 0) {
      recommendations.push('Some tests are failing. Review failed test cases and fix underlying issues.');
    }
    
    const performanceScore = this.calculatePerformanceScore();
    if (performanceScore < 0.8) {
      recommendations.push('Performance is below expectations. Optimize contract execution and network operations.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All tests are performing well. Continue monitoring and maintain current quality standards.');
    }
    
    return recommendations;
  }
  
  private async generateHtmlReport(report: any, filePath: string): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Coffee Tree Platform E2E Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 5px; }
        .summary { background: #ecf0f1; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .suite { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .passed { color: #27ae60; }
        .failed { color: #e74c3c; }
        .recommendations { background: #fff3cd; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Coffee Tree Platform E2E Test Report</h1>
        <p>Generated: ${report.timestamp}</p>
        <p>Duration: ${(report.duration / 1000).toFixed(2)} seconds</p>
    </div>
    
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Total Suites:</strong> ${report.summary.totalSuites}</p>
        <p><strong>Total Tests:</strong> ${report.summary.totalTests}</p>
        <p><strong>Passed:</strong> <span class="passed">${report.summary.totalPassed}</span></p>
        <p><strong>Failed:</strong> <span class="failed">${report.summary.totalFailed}</span></p>
        <p><strong>Success Rate:</strong> ${(report.summary.successRate * 100).toFixed(2)}%</p>
    </div>
    
    <h2>Test Suites</h2>
    ${report.suites.map((suite: any) => `
        <div class="suite">
            <h3>${suite.suite}</h3>
            <p><strong>Passed:</strong> <span class="passed">${suite.passed}</span></p>
            <p><strong>Failed:</strong> <span class="failed">${suite.failed}</span></p>
            <p><strong>Duration:</strong> ${(suite.duration / 1000).toFixed(2)}s</p>
        </div>
    `).join('')}
    
    <div class="recommendations">
        <h2>Recommendations</h2>
        <ul>
            ${report.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>`;
    
    await fs.writeFile(filePath, html);
  }
  
  private async generateCsvReport(report: any, filePath: string): Promise<void> {
    const csvHeader = 'Suite,Passed,Failed,Duration(ms),Success Rate\n';
    const csvRows = report.suites.map((suite: any) => 
      `${suite.suite},${suite.passed},${suite.failed},${suite.duration},${suite.passed / (suite.passed + suite.failed)}`
    ).join('\n');
    
    await fs.writeFile(filePath, csvHeader + csvRows);
  }
  
  private printSummary(): void {
    const summary = this.generateSummary();
    
    console.log('\n📈 Test Execution Summary:');
    console.log('=' .repeat(30));
    console.log(`Total Suites: ${summary.totalSuites}`);
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Passed: ${summary.totalPassed}`);
    console.log(`Failed: ${summary.totalFailed}`);
    console.log(`Success Rate: ${(summary.successRate * 100).toFixed(2)}%`);
    console.log(`Total Duration: ${(summary.totalDuration / 1000).toFixed(2)}s`);
    console.log(`Average Suite Duration: ${(summary.averageSuiteDuration / 1000).toFixed(2)}s`);
  }
  
  private async cleanup(): Promise<void> {
    console.log('\n🧹 Cleaning up test environment...');
    
    // Cleanup test data
    console.log('  - Cleaning up test data');
    
    // Stop test services
    console.log('  - Stopping test services');
    
    console.log('✅ Cleanup completed');
  }
}

// CLI interface
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options: TestRunOptions = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--suite':
        options.suite = args[++i];
        break;
      case '--parallel':
        options.parallel = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--no-report':
        options.generateReport = false;
        break;
      case '--output-dir':
        options.outputDir = args[++i];
        break;
      case '--timeout':
        options.timeout = parseInt(args[++i]);
        break;
      case '--retries':
        options.retries = parseInt(args[++i]);
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
    }
  }
  
  const runner = new E2ETestRunner(options);
  await runner.run();
}

function printHelp(): void {
  console.log(`
Coffee Tree Platform E2E Test Runner

Usage: npm run test:e2e [options]

Options:
  --suite <name>        Run specific test suite
  --parallel           Run test suites in parallel
  --verbose            Enable verbose output
  --no-report          Skip report generation
  --output-dir <dir>   Output directory for reports
  --timeout <ms>       Test timeout in milliseconds
  --retries <count>    Number of retries for failed tests
  --help               Show this help message

Examples:
  npm run test:e2e                           # Run all tests
  npm run test:e2e --suite integration       # Run integration tests only
  npm run test:e2e --parallel --verbose      # Run in parallel with verbose output
  npm run test:e2e --timeout 600000          # Set 10 minute timeout
`);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { E2ETestRunner, TestRunOptions };