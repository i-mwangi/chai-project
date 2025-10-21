// Check if .env is properly configured for deployment
require('dotenv').config();

console.log('========================================');
console.log('Hedera Environment Configuration Check');
console.log('========================================\n');

const network = process.env.HEDERA_NETWORK || process.env.NETWORK;
const operatorId = process.env.HEDERA_OPERATOR_ID || process.env.TACCOUNT_ID || process.env.ACCOUNT_ID;
const operatorKey = process.env.HEDERA_OPERATOR_KEY || process.env.TPRIVATE_KEY || process.env.PRIVATE_KEY;

let hasErrors = false;

// Check Network
console.log('1. Network Configuration:');
if (network) {
    console.log(`   ✅ HEDERA_NETWORK: ${network}`);
} else {
    console.log('   ❌ HEDERA_NETWORK: Not set');
    hasErrors = true;
}
console.log();

// Check Operator ID
console.log('2. Operator Account ID:');
if (operatorId && operatorId !== '0.0.12345') {
    console.log(`   ✅ HEDERA_OPERATOR_ID: ${operatorId}`);
} else if (operatorId === '0.0.12345') {
    console.log('   ❌ HEDERA_OPERATOR_ID: Still using placeholder value (0.0.12345)');
    console.log('   → Replace with your actual testnet account ID');
    hasErrors = true;
} else {
    console.log('   ❌ HEDERA_OPERATOR_ID: Not set');
    hasErrors = true;
}
console.log();

// Check Private Key
console.log('3. Operator Private Key:');
if (operatorKey && operatorKey !== 'your-private-key-here') {
    // Check if it looks like a valid Hedera private key
    if (operatorKey.length === 64 || operatorKey.length === 96) {
        console.log('   ✅ HEDERA_OPERATOR_KEY: Set (appears valid)');
    } else {
        console.log(`   ⚠️  HEDERA_OPERATOR_KEY: Set but may be invalid (length: ${operatorKey.length})`);
        console.log('   → Hedera private keys are typically 64 or 96 characters');
        hasErrors = true;
    }
} else if (operatorKey === 'your-private-key-here') {
    console.log('   ❌ HEDERA_OPERATOR_KEY: Still using placeholder value');
    console.log('   → Replace with your actual private key');
    hasErrors = true;
} else {
    console.log('   ❌ HEDERA_OPERATOR_KEY: Not set');
    hasErrors = true;
}
console.log();

// Summary
console.log('========================================');
if (hasErrors) {
    console.log('❌ Configuration Issues Found\n');
    console.log('To fix:');
    console.log('1. Get testnet credentials from https://portal.hedera.com/');
    console.log('2. Update your .env file with:');
    console.log('   HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID');
    console.log('   HEDERA_OPERATOR_KEY=your_actual_private_key');
    console.log('\nSee TESTNET_SETUP_GUIDE.md for detailed instructions.');
    process.exit(1);
} else {
    console.log('✅ Configuration looks good!\n');
    console.log('You can now deploy contracts with:');
    console.log('   pnpm run deploy PriceOracle');
    console.log('   or');
    console.log('   deploy-all-contracts.bat');
    process.exit(0);
}
