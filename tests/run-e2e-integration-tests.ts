#!/usr/bin/env node

/**
 * End-to-End Integration Test Runner
 * 
 * Runs all end-to-end integration tests for the Coffee Platform
 * including complete user workflows and cross-module interactions.
 * 
 * Usage:
 *   npm run test:e2e
 *   or
 *   node tests/run-e2e-integration-tests.ts
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  testCount: number;
  error?: string;
}

const TEST_SUITES = [
  {
    name: 'Complete User Workflows',
    path: 'tests/Integration/complete-user-workflows.spec.ts',
    description: 'Tests investor, farmer, and admin journeys',
  },
  {
    name: 'Cross-Module Interactions',
    path: 'tests/Integration/cross-module-interactions.spec.ts',
    description: 'Tests interactions between pricing, distribution, and lending modules',
  },
  {
    name: 'Revenue Distribution Flow',
    path: 'tests/Integration/revenue-distribution-flow.spec.ts',
    description: 'Tests end-to-end revenue distribution',
  },
  {
    name: 'Lending and Loan Flow',
    path: 'tests/Integration/lending-loan-flow.spec.ts',
    description: 'Tests lending pool and loan lifecycle',
  },
];

async function runTestSuite(suite: typeof TEST_SUITES[0]): Promise<TestResult> {
  console.log(`\n🧪 Running: ${suite.name}`);
  console.log(`   ${suite.description}`);
  console.log(`   File: ${suite.path}`);
  
  const startTime = Date.now();
  
  try {
    const { stdout, stderr } = await execAsync(
      `npx vitest run ${suite.path} --reporter=json`,
      { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer
    );
    
    const duration = Date.now() - startTime;
    
    // Parse vitest JSON output
    let testCount = 0;
    let passed = true;
    
    try {
      const result = JSON.parse(stdout);
      testCount = result.numTotalTests || 0;
      passed = result.numFailedTests === 0;
    } catch {
      // Fallback: parse from text output
      const match = stdout.match(/(\d+) passed/);
      testCount = match ? parseInt(match[1]) : 0;
      passed = !stdout.includes('failed');
    }
    
    console.log(`   ✅ Passed: ${testCount} tests in ${duration}ms`);
    
    return {
      name: suite.name,
      passed,
      duration,
      testCount,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.log(`   ❌ Failed after ${duration}ms`);
    
    return {
      name: suite.name,
      passed: false,
      duration,
      testCount: 0,
      error: error.message,
    };
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Coffee Platform - End-to-End Integration Test Suite');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`\nRunning ${TEST_SUITES.length} test suites...\n`);
  
  const results: TestResult[] = [];
  
  for (const suite of TEST_SUITES) {
    const result = await runTestSuite(suite);
    results.push(result);
  }
  
  // Print summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Test Summary');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const totalTests = results.reduce((sum, r) => sum + r.testCount, 0);
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const passedSuites = results.filter(r => r.passed).length;
  const failedSuites = results.filter(r => !r.passed).length;
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    console.log(`   Tests: ${result.testCount} | Duration: ${result.duration}ms`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n───────────────────────────────────────────────────────────');
  console.log(`Total Test Suites: ${TEST_SUITES.length}`);
  console.log(`Passed: ${passedSuites} | Failed: ${failedSuites}`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Total Duration: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`);
  console.log('───────────────────────────────────────────────────────────\n');
  
  if (failedSuites > 0) {
    console.log('❌ Some test suites failed. Please review the errors above.\n');
    process.exit(1);
  } else {
    console.log('✅ All test suites passed successfully!\n');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
