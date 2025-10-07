/**
 * Test script for validation utilities
 * Tests both client-side and server-side validation
 */

import { readFileSync } from 'fs';

// Test client-side validation
console.log('=== Testing Client-Side Validation ===\n');

// Load the validation module (simulating browser environment)
const validationCode = readFileSync('./frontend/js/validation.js', 'utf8');
eval(validationCode);

// Test 1: Amount validation
console.log('Test 1: Amount Validation');
console.log('Valid amount (100):', Validator.validateAmount(100, 'Test Amount'));
console.log('Invalid amount (-50):', Validator.validateAmount(-50, 'Test Amount'));
console.log('Invalid amount (0):', Validator.validateAmount(0, 'Test Amount'));
console.log('Valid amount with zero allowed:', Validator.validateAmount(0, 'Test Amount', { allowZero: true }));
console.log('Amount exceeds max:', Validator.validateAmount(150, 'Test Amount', { max: 100 }));
console.log('');

// Test 2: Hedera Account ID validation
console.log('Test 2: Hedera Account ID Validation');
console.log('Valid account ID (0.0.12345):', Validator.validateHederaAccountId('0.0.12345'));
console.log('Invalid format (12345):', Validator.validateHederaAccountId('12345'));
console.log('Invalid format (0.0):', Validator.validateHederaAccountId('0.0'));
console.log('Empty string:', Validator.validateHederaAccountId(''));
console.log('');

// Test 3: Token amount validation
console.log('Test 3: Token Amount Validation');
console.log('Valid token amount (50, balance 100):', Validator.validateTokenAmount(50, 100, 'Tokens'));
console.log('Exceeds balance (150, balance 100):', Validator.validateTokenAmount(150, 100, 'Tokens'));
console.log('Negative amount (-10, balance 100):', Validator.validateTokenAmount(-10, 100, 'Tokens'));
console.log('');

// Test 4: Quality grade validation
console.log('Test 4: Quality Grade Validation');
console.log('Valid grade (5):', Validator.validateQualityGrade(5));
console.log('Invalid grade (0):', Validator.validateQualityGrade(0));
console.log('Invalid grade (11):', Validator.validateQualityGrade(11));
console.log('');

// Test 5: Price range validation
console.log('Test 5: Price Range Validation');
console.log('Valid price (100, market 100):', Validator.validatePriceRange(100, 100));
console.log('Price too low (40, market 100):', Validator.validatePriceRange(40, 100));
console.log('Price too high (250, market 100):', Validator.validatePriceRange(250, 100));
console.log('');

// Test 6: Health score validation
console.log('Test 6: Health Score Validation');
console.log('Valid score (85):', Validator.validateHealthScore(85));
console.log('Invalid score (101):', Validator.validateHealthScore(101));
console.log('Valid score (0):', Validator.validateHealthScore(0));
console.log('');

// Test 7: String validation
console.log('Test 7: String Validation');
console.log('Valid string ("Hello"):', Validator.validateString('Hello', 'Name'));
console.log('Empty string:', Validator.validateString('', 'Name'));
console.log('Too long (minLength: 5, maxLength: 10):', Validator.validateString('This is too long', 'Name', { minLength: 5, maxLength: 10 }));
console.log('');

// Test 8: Collateralization validation
console.log('Test 8: Collateralization Validation');
console.log('Valid collateral (125, loan 100):', Validator.validateCollateralization(125, 100, 1.25));
console.log('Insufficient collateral (100, loan 100):', Validator.validateCollateralization(100, 100, 1.25));
console.log('');

// Test 9: Batch size validation
console.log('Test 9: Batch Size Validation');
console.log('Valid batch size (25):', Validator.validateBatchSize(25, 50));
console.log('Exceeds max (60):', Validator.validateBatchSize(60, 50));
console.log('Zero batch size:', Validator.validateBatchSize(0, 50));
console.log('');

// Test 10: Multiple field validation
console.log('Test 10: Multiple Field Validation');
const multiValidation = Validator.validateMultiple({
    amount: Validator.validateAmount(100, 'Amount'),
    accountId: Validator.validateHederaAccountId('0.0.12345', 'Account'),
    grade: Validator.validateQualityGrade(5, 'Grade')
});
console.log('All valid:', multiValidation);

const multiValidationWithErrors = Validator.validateMultiple({
    amount: Validator.validateAmount(-50, 'Amount'),
    accountId: Validator.validateHederaAccountId('invalid', 'Account'),
    grade: Validator.validateQualityGrade(15, 'Grade')
});
console.log('With errors:', multiValidationWithErrors);
console.log('');

// Test server-side validation
console.log('\n=== Testing Server-Side Validation ===\n');

// Import server-side validation (requires TypeScript compilation)
console.log('Note: Server-side validation requires TypeScript compilation.');
console.log('Run: npx tsc api/validation.ts --outDir api --esModuleInterop --resolveJsonModule');
console.log('Then test with: node test-validation-server.js');
console.log('');

console.log('=== Validation Tests Complete ===');
