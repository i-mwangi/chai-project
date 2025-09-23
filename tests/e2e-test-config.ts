/**
 * End-to-End Test Configuration
 * 
 * Configuration settings for comprehensive end-to-end testing
 * including timeouts, retry policies, and performance thresholds.
 */

export const E2E_TEST_CONFIG = {
  // Test timeouts (in milliseconds)
  timeouts: {
    default: 30000,           // 30 seconds
    integration: 60000,       // 1 minute
    loadTesting: 300000,      // 5 minutes
    stressTesting: 600000,    // 10 minutes
    comprehensive: 900000     // 15 minutes
  },
  
  // Performance thresholds
  performance: {
    maxTransactionTime: 5000,        // 5 seconds
    maxBatchOperationTime: 30000,    // 30 seconds
    maxRevenueDistributionTime: 60000, // 1 minute for 100 holders
    minSuccessRate: 0.95,            // 95%
    maxConcurrentUsers: 100,         // 100 concurrent users
    maxMemoryUsage: 512 * 1024 * 1024 // 512MB
  },
  
  // Load testing parameters
  loadTesting: {
    concurrentUsers: [10, 25, 50, 100],
    transactionVolumes: [100, 500, 1000, 2000],
    testDuration: 300000,  // 5 minutes
    rampUpTime: 30000,     // 30 seconds
    coolDownTime: 10000    // 10 seconds
  },
  
  // Error simulation
  errorSimulation: {
    networkFailureRate: 0.1,     // 10%
    transactionFailureRate: 0.05, // 5%
    timeoutRate: 0.02,           // 2%
    retryAttempts: 3,
    retryDelay: 1000             // 1 second
  },
  
  // Test data generation
  testData: {
    farmerCount: 50,
    investorCount: 200,
    groveCount: 100,
    maxTokensPerGrove: 10000,
    maxInvestorsPerGrove: 100,
    harvestSeasons: 4
  },
  
  // Monitoring and reporting
  monitoring: {
    enableMetrics: true,
    metricsInterval: 5000,    // 5 seconds
    enableProfiling: true,
    enableMemoryTracking: true,
    reportDirectory: './test-reports',
    detailedLogging: true
  },
  
  // Contract deployment settings
  contracts: {
    gasLimit: 1000000,
    deploymentTimeout: 60000,  // 1 minute
    initializationTimeout: 30000, // 30 seconds
    maxRetries: 3
  },
  
  // Network settings
  network: {
    requestTimeout: 30000,     // 30 seconds
    maxRetries: 3,
    retryDelay: 2000,         // 2 seconds
    connectionPoolSize: 10
  }
};

export const TEST_SCENARIOS = {
  // Basic functionality scenarios
  basic: [
    {
      name: 'Farmer Registration and Verification',
      description: 'Test complete farmer onboarding process',
      steps: ['create_account', 'submit_documents', 'verify_farmer', 'register_grove'],
      expectedDuration: 30000,
      criticalPath: true
    },
    {
      name: 'Grove Tokenization',
      description: 'Test coffee grove tokenization process',
      steps: ['register_grove', 'set_tokenization_params', 'mint_tokens', 'verify_tokens'],
      expectedDuration: 45000,
      criticalPath: true
    },
    {
      name: 'Token Purchase',
      description: 'Test investor token purchase flow',
      steps: ['browse_groves', 'select_grove', 'purchase_tokens', 'verify_ownership'],
      expectedDuration: 20000,
      criticalPath: true
    },
    {
      name: 'Revenue Distribution',
      description: 'Test harvest reporting and revenue distribution',
      steps: ['report_harvest', 'calculate_shares', 'distribute_revenue', 'verify_payments'],
      expectedDuration: 60000,
      criticalPath: true
    }
  ],
  
  // Load testing scenarios
  load: [
    {
      name: 'Concurrent Grove Registration',
      description: 'Multiple farmers registering groves simultaneously',
      concurrentOperations: 50,
      operationType: 'grove_registration',
      expectedDuration: 120000,
      successThreshold: 0.95
    },
    {
      name: 'High Volume Token Trading',
      description: 'Large number of token purchases and sales',
      concurrentOperations: 100,
      operationType: 'token_trading',
      expectedDuration: 180000,
      successThreshold: 0.90
    },
    {
      name: 'Mass Revenue Distribution',
      description: 'Revenue distribution to many token holders',
      tokenHolders: 500,
      operationType: 'revenue_distribution',
      expectedDuration: 300000,
      successThreshold: 0.98
    }
  ],
  
  // Stress testing scenarios
  stress: [
    {
      name: 'Platform Capacity Limit',
      description: 'Test platform behavior at maximum capacity',
      maxUsers: 1000,
      maxTransactions: 10000,
      duration: 600000,
      acceptableFailureRate: 0.1
    },
    {
      name: 'Memory Pressure Test',
      description: 'Test platform under memory constraints',
      dataVolume: 'large',
      duration: 300000,
      memoryLimit: '256MB'
    },
    {
      name: 'Network Congestion Simulation',
      description: 'Test platform resilience under network stress',
      networkDelay: 5000,
      packetLoss: 0.05,
      duration: 180000
    }
  ],
  
  // Error handling scenarios
  errorHandling: [
    {
      name: 'Transaction Failure Recovery',
      description: 'Test recovery from various transaction failures',
      failureTypes: ['insufficient_funds', 'network_timeout', 'contract_error'],
      recoveryMethods: ['retry', 'rollback', 'manual_intervention']
    },
    {
      name: 'Data Corruption Handling',
      description: 'Test platform response to corrupted data',
      corruptionTypes: ['invalid_grove_data', 'malformed_transactions', 'inconsistent_state'],
      expectedBehavior: 'graceful_degradation'
    },
    {
      name: 'Security Breach Simulation',
      description: 'Test platform security measures',
      attackTypes: ['unauthorized_access', 'double_spending', 'replay_attack'],
      expectedOutcome: 'attack_blocked'
    }
  ]
};

export const PERFORMANCE_BENCHMARKS = {
  // Transaction performance
  transactions: {
    groveRegistration: { maxTime: 10000, avgTime: 5000 },
    tokenPurchase: { maxTime: 8000, avgTime: 4000 },
    harvestReporting: { maxTime: 12000, avgTime: 6000 },
    revenueDistribution: { maxTime: 30000, avgTime: 15000 }
  },
  
  // Throughput benchmarks
  throughput: {
    transactionsPerSecond: 50,
    concurrentUsers: 100,
    dataProcessingRate: 1000, // records per second
    networkBandwidth: 10 * 1024 * 1024 // 10 MB/s
  },
  
  // Reliability benchmarks
  reliability: {
    uptime: 0.999,           // 99.9%
    errorRate: 0.001,        // 0.1%
    recoveryTime: 30000,     // 30 seconds
    dataConsistency: 1.0     // 100%
  },
  
  // Scalability benchmarks
  scalability: {
    maxGroves: 10000,
    maxInvestors: 100000,
    maxTokensPerGrove: 1000000,
    maxTransactionsPerDay: 1000000
  }
};

export const MONITORING_METRICS = [
  'transaction_count',
  'transaction_success_rate',
  'average_response_time',
  'peak_response_time',
  'concurrent_users',
  'memory_usage',
  'cpu_usage',
  'network_io',
  'error_count',
  'error_types',
  'recovery_time',
  'data_consistency_score'
];

export const REPORT_TEMPLATES = {
  summary: {
    sections: ['overview', 'performance', 'reliability', 'errors', 'recommendations'],
    format: 'json',
    includeCharts: true,
    includeRawData: false
  },
  
  detailed: {
    sections: ['overview', 'test_results', 'performance_analysis', 'error_analysis', 'recommendations', 'raw_data'],
    format: 'json',
    includeCharts: true,
    includeRawData: true
  },
  
  executive: {
    sections: ['overview', 'key_metrics', 'recommendations'],
    format: 'pdf',
    includeCharts: true,
    includeRawData: false
  }
};