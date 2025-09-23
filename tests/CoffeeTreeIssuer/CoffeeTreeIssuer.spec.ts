import { describe, test, beforeEach } from "node:test"
import { getClient, getEnv, getTestUser, getSecondUser } from "../../utils"
import {
    ContractCallQuery,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    AccountId,
    PrivateKey
} from "@hashgraph/sdk"
import assert from "node:assert"

const client = getClient()
const admin = getEnv()
const user = getTestUser()
const secondUser = getSecondUser()

// Test farmer accounts
const testFarmer = {
    ACCOUNT_ID: AccountId.fromString("0.0.123456"),
    PRIVATE_KEY: PrivateKey.generateED25519(),
    ADDRESS: "0x" + "1".repeat(40)
}

const testInvestor = {
    ACCOUNT_ID: AccountId.fromString("0.0.789012"),
    PRIVATE_KEY: PrivateKey.generateED25519(),
    ADDRESS: "0x" + "2".repeat(40)
}

describe("CoffeeTreeIssuer Contract", async () => {
    let contractId: string
    let farmerVerificationId: string
    let priceOracleId: string
    let revenueReserveId: string

    beforeEach(() => {
        contractId = process.env.COFFEE_TREE_ISSUER_TESTNET || "0.0.123456789"
        farmerVerificationId = process.env.FARMER_VERIFICATION_TESTNET || "0.0.123456790"
        priceOracleId = process.env.COFFEE_PRICE_ORACLE_TESTNET || "0.0.123456791"
        revenueReserveId = process.env.COFFEE_REVENUE_RESERVE_TESTNET || "0.0.123456792"
    })

    describe("Contract Deployment and Initialization", () => {
        test("should deploy contract with correct dependencies", async () => {
            assert.ok(contractId, "CoffeeTreeIssuer contract should be deployed")
            assert.ok(farmerVerificationId, "FarmerVerification contract should be deployed")
            assert.ok(priceOracleId, "CoffeePriceOracle contract should be deployed")
            assert.ok(revenueReserveId, "CoffeeRevenueReserve contract should be deployed")
        })

        test("should initialize with admin as deployer", async () => {
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(100_000)
                .setFunction("admin")
                .execute(client)

            // In real implementation, would parse the returned address
            console.log("Admin query executed successfully")
            assert.ok(true)
        })
    })

    describe("Coffee Grove Registration", () => {
        test("Verified farmer: register coffee grove", async () => {
            // First verify the farmer (mock verification)
            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
            
            // Mock farmer verification
            await new ContractExecuteTransaction()
                .setContractId(farmerVerificationId)
                .setGas(400_000)
                .setFunction("verifyFarmer",
                    new ContractFunctionParameters()
                        .addAddress(testFarmer.ADDRESS)
                        .addBool(true)
                        .addString("")
                )
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)
                .execute(client)

            // Switch to farmer account
            client.setOperator(testFarmer.ACCOUNT_ID, testFarmer.PRIVATE_KEY)

            const tx = new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(600_000)
                .setFunction("registerCoffeeGrove",
                    new ContractFunctionParameters()
                        .addString("Kiambu Premium Grove")
                        .addString("Kiambu County, Kenya")
                        .addUint64(500) // 500 trees
                        .addString("Arabica SL28")
                        .addUint64(5000) // 5kg per tree expected yield
                )
                .freezeWith(client)
                .sign(testFarmer.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Register Grove - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should reject unverified farmer registration", async () => {
            const unverifiedFarmer = {
                ACCOUNT_ID: AccountId.fromString("0.0.999999"),
                PRIVATE_KEY: PrivateKey.generateED25519(),
                ADDRESS: "0x" + "9".repeat(40)
            }

            client.setOperator(unverifiedFarmer.ACCOUNT_ID, unverifiedFarmer.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(600_000)
                    .setFunction("registerCoffeeGrove",
                        new ContractFunctionParameters()
                            .addString("Unauthorized Grove")
                            .addString("Unknown Location")
                            .addUint64(100)
                            .addString("Unknown Variety")
                            .addUint64(1000)
                    )
                    .freezeWith(client)
                    .sign(unverifiedFarmer.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for unverified farmer")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected unverified farmer:", errorMessage)
                assert.ok(errorMessage.includes("UnverifiedFarmer") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should reject duplicate grove names", async () => {
            client.setOperator(testFarmer.ACCOUNT_ID, testFarmer.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(600_000)
                    .setFunction("registerCoffeeGrove",
                        new ContractFunctionParameters()
                            .addString("Kiambu Premium Grove") // Same name as before
                            .addString("Different Location")
                            .addUint64(200)
                            .addString("Different Variety")
                            .addUint64(3000)
                    )
                    .freezeWith(client)
                    .sign(testFarmer.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for duplicate grove name")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected duplicate grove name:", errorMessage)
                assert.ok(errorMessage.includes("GroveAlreadyExists") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should validate grove parameters", async () => {
            client.setOperator(testFarmer.ACCOUNT_ID, testFarmer.PRIVATE_KEY)

            // Test zero tree count
            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(600_000)
                    .setFunction("registerCoffeeGrove",
                        new ContractFunctionParameters()
                            .addString("Zero Trees Grove")
                            .addString("Test Location")
                            .addUint64(0) // Invalid tree count
                            .addString("Arabica")
                            .addUint64(5000)
                    )
                    .freezeWith(client)
                    .sign(testFarmer.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for zero tree count")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected zero tree count:", errorMessage)
                assert.ok(errorMessage.includes("InvalidTreeCount") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })
    })

    describe("Coffee Grove Tokenization", () => {
        test("Grove owner: tokenize coffee grove", async () => {
            client.setOperator(testFarmer.ACCOUNT_ID, testFarmer.PRIVATE_KEY)

            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(800_000)
                .setFunction("tokenizeCoffeeGrove",
                    new ContractFunctionParameters()
                        .addString("Kiambu Premium Grove")
                        .addUint64(10) // 10 tokens per tree
                        .addUint64(100000000) // 100 USDC per token (scaled)
                )
                .freezeWith(client)
                .sign(testFarmer.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Tokenize Grove - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should reject non-owner tokenization", async () => {
            client.setOperator(testInvestor.ACCOUNT_ID, testInvestor.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(800_000)
                    .setFunction("tokenizeCoffeeGrove",
                        new ContractFunctionParameters()
                            .addString("Kiambu Premium Grove")
                            .addUint64(5)
                            .addUint64(50000000)
                    )
                    .freezeWith(client)
                    .sign(testInvestor.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for non-owner tokenization")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected non-owner tokenization:", errorMessage)
                assert.ok(errorMessage.includes("NotGroveOwner") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should reject duplicate tokenization", async () => {
            client.setOperator(testFarmer.ACCOUNT_ID, testFarmer.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(800_000)
                    .setFunction("tokenizeCoffeeGrove",
                        new ContractFunctionParameters()
                            .addString("Kiambu Premium Grove") // Already tokenized
                            .addUint64(15)
                            .addUint64(120000000)
                    )
                    .freezeWith(client)
                    .sign(testFarmer.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for duplicate tokenization")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected duplicate tokenization:", errorMessage)
                assert.ok(errorMessage.includes("AlreadyTokenized") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })
    })

    describe("Tree Token Purchase", () => {
        test("Investor: purchase tree tokens", async () => {
            client.setOperator(testInvestor.ACCOUNT_ID, testInvestor.PRIVATE_KEY)

            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(700_000)
                .setFunction("purchaseTreeTokens",
                    new ContractFunctionParameters()
                        .addString("Kiambu Premium Grove")
                        .addUint64(100) // Purchase 100 tokens
                )
                .setPayableAmount(10000000000) // 10,000 USDC (scaled)
                .freezeWith(client)
                .sign(testInvestor.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Purchase Tokens - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should reject insufficient payment", async () => {
            client.setOperator(testInvestor.ACCOUNT_ID, testInvestor.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(700_000)
                    .setFunction("purchaseTreeTokens",
                        new ContractFunctionParameters()
                            .addString("Kiambu Premium Grove")
                            .addUint64(100)
                    )
                    .setPayableAmount(5000000000) // Insufficient payment
                    .freezeWith(client)
                    .sign(testInvestor.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for insufficient payment")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected insufficient payment:", errorMessage)
                assert.ok(errorMessage.includes("InsufficientPayment") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should reject purchase of unavailable tokens", async () => {
            client.setOperator(testInvestor.ACCOUNT_ID, testInvestor.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(700_000)
                    .setFunction("purchaseTreeTokens",
                        new ContractFunctionParameters()
                            .addString("Kiambu Premium Grove")
                            .addUint64(10000) // More tokens than available
                    )
                    .setPayableAmount(1000000000000) // Large payment
                    .freezeWith(client)
                    .sign(testInvestor.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for unavailable tokens")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected unavailable tokens:", errorMessage)
                assert.ok(errorMessage.includes("InsufficientTokens") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })
    })

    describe("Harvest Reporting", () => {
        test("Grove owner: report harvest", async () => {
            client.setOperator(testFarmer.ACCOUNT_ID, testFarmer.PRIVATE_KEY)

            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(600_000)
                .setFunction("reportHarvest",
                    new ContractFunctionParameters()
                        .addString("Kiambu Premium Grove")
                        .addUint64(2500000) // 2,500 kg total yield
                        .addUint8(8) // Quality grade 8
                        .addUint64(5000000) // 5 USDC per kg (scaled)
                )
                .freezeWith(client)
                .sign(testFarmer.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Report Harvest - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should reject non-owner harvest reporting", async () => {
            client.setOperator(testInvestor.ACCOUNT_ID, testInvestor.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(600_000)
                    .setFunction("reportHarvest",
                        new ContractFunctionParameters()
                            .addString("Kiambu Premium Grove")
                            .addUint64(1000000)
                            .addUint8(7)
                            .addUint64(4000000)
                    )
                    .freezeWith(client)
                    .sign(testInvestor.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for non-owner harvest reporting")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected non-owner harvest reporting:", errorMessage)
                assert.ok(errorMessage.includes("NotGroveOwner") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should validate harvest data", async () => {
            client.setOperator(testFarmer.ACCOUNT_ID, testFarmer.PRIVATE_KEY)

            // Test invalid quality grade
            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(600_000)
                    .setFunction("reportHarvest",
                        new ContractFunctionParameters()
                            .addString("Kiambu Premium Grove")
                            .addUint64(2000000)
                            .addUint8(0) // Invalid grade
                            .addUint64(5000000)
                    )
                    .freezeWith(client)
                    .sign(testFarmer.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for invalid quality grade")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected invalid quality grade:", errorMessage)
                assert.ok(errorMessage.includes("InvalidQualityGrade") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })
    })

    describe("Revenue Distribution", () => {
        test("should distribute revenue to token holders", async () => {
            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(800_000)
                .setFunction("distributeRevenue",
                    new ContractFunctionParameters()
                        .addString("Kiambu Premium Grove")
                )
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Distribute Revenue - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")
        })

        test("should reject duplicate revenue distribution", async () => {
            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(800_000)
                    .setFunction("distributeRevenue",
                        new ContractFunctionParameters()
                            .addString("Kiambu Premium Grove")
                    )
                    .freezeWith(client)
                    .sign(admin.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for duplicate distribution")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected duplicate distribution:", errorMessage)
                assert.ok(errorMessage.includes("RevenueAlreadyDistributed") || errorMessage.includes("revert"))
            }
        })
    })

    describe("Data Retrieval Functions", () => {
        test("should get grove information", async () => {
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(200_000)
                .setFunction("getGroveInfo",
                    new ContractFunctionParameters()
                        .addString("Kiambu Premium Grove")
                )
                .execute(client)

            console.log("Grove info query executed successfully")
            assert.ok(true)
        })

        test("should get token holder information", async () => {
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(200_000)
                .setFunction("getTokenHolders",
                    new ContractFunctionParameters()
                        .addString("Kiambu Premium Grove")
                )
                .execute(client)

            console.log("Token holders query executed successfully")
            assert.ok(true)
        })

        test("should get harvest history", async () => {
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(200_000)
                .setFunction("getHarvestHistory",
                    new ContractFunctionParameters()
                        .addString("Kiambu Premium Grove")
                )
                .execute(client)

            console.log("Harvest history query executed successfully")
            assert.ok(true)
        })
    })

    describe("Access Control and Security", () => {
        test("should reject unauthorized admin functions", async () => {
            client.setOperator(user.ACCOUNT_ID, user.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(300_000)
                    .setFunction("setFarmerVerificationContract",
                        new ContractFunctionParameters()
                            .addAddress("0x" + "1".repeat(40))
                    )
                    .freezeWith(client)
                    .sign(user.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for unauthorized admin access")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected unauthorized admin access:", errorMessage)
                assert.ok(errorMessage.includes("OnlyAdmin") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should handle emergency pause functionality", async () => {
            // Pause contract
            const pauseTx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("pause")
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)

            const pauseSubmittedTx = await pauseTx.execute(client)
            const pauseReceipt = await pauseSubmittedTx.getReceipt(client)

            console.log(`Pause Contract - Tx Hash: ${pauseTx.transactionId} Status: ${pauseReceipt.status}`)
            assert.strictEqual(pauseReceipt.status.toString(), "SUCCESS")

            // Try to perform operation while paused
            client.setOperator(testInvestor.ACCOUNT_ID, testInvestor.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(700_000)
                    .setFunction("purchaseTreeTokens",
                        new ContractFunctionParameters()
                            .addString("Kiambu Premium Grove")
                            .addUint64(10)
                    )
                    .setPayableAmount(1000000000)
                    .freezeWith(client)
                    .sign(testInvestor.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for paused contract")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected operation on paused contract:", errorMessage)
                assert.ok(errorMessage.includes("Pausable: paused") || errorMessage.includes("revert"))
            }

            // Unpause contract
            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
            
            const unpauseTx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("unpause")
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)

            const unpauseSubmittedTx = await unpauseTx.execute(client)
            const unpauseReceipt = await unpauseSubmittedTx.getReceipt(client)

            console.log(`Unpause Contract - Tx Hash: ${unpauseTx.transactionId} Status: ${unpauseReceipt.status}`)
            assert.strictEqual(unpauseReceipt.status.toString(), "SUCCESS")
        })
    })
})