/**
 * Test Hedera Testnet Connection
 * Verifies your credentials and checks account balance
 */

import { Client, AccountBalanceQuery, AccountId, PrivateKey } from "@hashgraph/sdk";
import * as dotenv from "dotenv";

dotenv.config();

async function testConnection() {
    console.log("========================================");
    console.log("Testing Hedera Testnet Connection");
    console.log("========================================\n");

    try {
        // Get credentials from environment
        const operatorId = process.env.HEDERA_OPERATOR_ID || process.env.TACCOUNT_ID;
        const operatorKey = process.env.HEDERA_OPERATOR_KEY || process.env.TPRIVATE_KEY;

        if (!operatorId || !operatorKey) {
            console.error("❌ Error: Missing credentials in .env file");
            console.error("\nPlease ensure you have:");
            console.error("  HEDERA_OPERATOR_ID=0.0.6967933");
            console.error("  HEDERA_OPERATOR_KEY=your-private-key");
            process.exit(1);
        }

        console.log("📋 Configuration:");
        console.log(`   Account ID: ${operatorId}`);
        console.log(`   Private Key: ${operatorKey.substring(0, 10)}...${operatorKey.substring(operatorKey.length - 10)}`);
        console.log(`   Network: testnet\n`);

        // Initialize Hedera client
        console.log("🔌 Connecting to Hedera testnet...");
        const client = Client.forTestnet();
        
        // Set operator
        const accountId = AccountId.fromString(operatorId);
        const privateKey = PrivateKey.fromStringECDSA(operatorKey);
        
        client.setOperator(accountId, privateKey);
        
        console.log("✅ Client initialized successfully\n");

        // Query account balance
        console.log("💰 Querying account balance...");
        const balance = await new AccountBalanceQuery()
            .setAccountId(accountId)
            .execute(client);

        console.log("✅ Balance query successful!\n");
        console.log("========================================");
        console.log("Account Balance");
        console.log("========================================");
        console.log(`HBAR: ${balance.hbars.toString()}`);
        
        // Log token balances
        console.log('\n=== Token Balances ===');
        if (balance.tokens) {
            // Iterate over the TokenBalanceMap properly
            for (const [tokenId, amount] of balance.tokens) {
                console.log(`  ${tokenId.toString()}: ${amount.toString()}`);
            }
        }

        console.log("\n========================================");
        console.log("Connection Test Results");
        console.log("========================================");
        console.log("✅ Connection: SUCCESS");
        console.log("✅ Authentication: SUCCESS");
        console.log("✅ Balance Query: SUCCESS");
        
        const hbarBalance = balance.hbars.toBigNumber().toNumber();
        if (hbarBalance < 1) {
            console.log("\n⚠️  WARNING: Low HBAR balance!");
            console.log("   You need HBAR for transaction fees.");
            console.log("   Get free testnet HBAR at:");
            console.log("   https://portal.hedera.com/faucet");
        } else {
            console.log(`\n✅ HBAR Balance: ${hbarBalance} HBAR (sufficient for testing)`);
        }

        console.log("\n========================================");
        console.log("Next Steps");
        console.log("========================================");
        console.log("1. ✅ Your Hedera connection is working!");
        console.log("2. 📝 You can now start the application:");
        console.log("      start-demo.bat (mock API)");
        console.log("      OR");
        console.log("      start-hedera-testnet.bat (real Hedera API)");
        console.log("3. 🌐 Open http://localhost:3000");
        console.log("4. 🔗 Connect HashPack wallet (testnet mode)");
        console.log("5. 🎉 Start testing features!");
        console.log("\n📖 See HEDERA_TESTNET_SETUP_GUIDE.md for details");
        console.log("========================================\n");

        client.close();

    } catch (error: any) {
        console.error("\n❌ Connection test failed!");
        console.error("\nError details:");
        console.error(error.message || error);
        
        console.error("\n========================================");
        console.error("Troubleshooting");
        console.error("========================================");
        
        if (error.message?.includes("INVALID_SIGNATURE")) {
            console.error("❌ Invalid private key or account ID");
            console.error("\nSolutions:");
            console.error("1. Verify your private key in .env file");
            console.error("2. Ensure the key matches your account ID");
            console.error("3. Check that you're using ECDSA key format");
        } else if (error.message?.includes("INVALID_ACCOUNT_ID")) {
            console.error("❌ Invalid account ID format");
            console.error("\nSolutions:");
            console.error("1. Check format: 0.0.xxxxx");
            console.error("2. Ensure it's a testnet account ID");
            console.error("3. Verify the account exists on testnet");
        } else if (error.message?.includes("timeout") || error.message?.includes("ETIMEDOUT")) {
            console.error("❌ Connection timeout");
            console.error("\nSolutions:");
            console.error("1. Check your internet connection");
            console.error("2. Check Hedera status: https://status.hedera.com/");
            console.error("3. Try again in a few minutes");
        } else {
            console.error("❌ Unexpected error");
            console.error("\nSolutions:");
            console.error("1. Check your .env file configuration");
            console.error("2. Ensure you have @hashgraph/sdk installed");
            console.error("3. Check Hedera status: https://status.hedera.com/");
        }
        
        console.error("\n📖 See HEDERA_TESTNET_SETUP_GUIDE.md for help");
        console.error("========================================\n");
        
        process.exit(1);
    }
}

// Run the test
testConnection();
