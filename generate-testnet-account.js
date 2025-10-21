// Generate a new Hedera testnet account
const { Client, PrivateKey, AccountCreateTransaction, Hbar } = require('@hashgraph/sdk');

async function generateTestnetAccount() {
    console.log('========================================');
    console.log('Hedera Testnet Account Generator');
    console.log('========================================\n');

    try {
        // Generate new key pair
        console.log('Generating new key pair...');
        const newPrivateKey = PrivateKey.generateECDSA();
        const newPublicKey = newPrivateKey.publicKey;

        console.log('\n✅ Key Pair Generated:');
        console.log(`Private Key: ${newPrivateKey.toStringRaw()}`);
        console.log(`Public Key: ${newPublicKey.toStringRaw()}`);
        console.log('\n⚠️  SAVE YOUR PRIVATE KEY SECURELY!\n');

        console.log('========================================');
        console.log('Next Steps:');
        console.log('========================================\n');
        
        console.log('1. Go to Hedera Portal: https://portal.hedera.com/faucet');
        console.log('2. Request test HBAR for your public key:');
        console.log(`   ${newPublicKey.toStringRaw()}`);
        console.log('\n3. Once you receive your Account ID, update your .env file:');
        console.log(`   HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID`);
        console.log(`   HEDERA_OPERATOR_KEY=${newPrivateKey.toStringRaw()}`);
        console.log('\n4. Verify with: node check-env.js');
        console.log('\n========================================\n');

        // Save to a file for reference
        const fs = require('fs');
        const credentials = {
            privateKey: newPrivateKey.toStringRaw(),
            publicKey: newPublicKey.toStringRaw(),
            note: 'Get your Account ID from https://portal.hedera.com/faucet',
            timestamp: new Date().toISOString()
        };
        
        fs.writeFileSync('testnet-credentials.json', JSON.stringify(credentials, null, 2));
        console.log('✅ Credentials saved to: testnet-credentials.json');
        console.log('⚠️  Keep this file secure and do not commit to git!\n');

    } catch (error) {
        console.error('❌ Error generating account:', error.message);
        process.exit(1);
    }
}

generateTestnetAccount();
