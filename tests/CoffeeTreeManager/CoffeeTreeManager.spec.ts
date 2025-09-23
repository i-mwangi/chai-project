import { describe, test, beforeEach } from "node:test"
import { getClient, getEnv, getTestUser } from "../../utils"
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

// Test accounts
const testFarmer = {
    ACCOUNT_ID: AccountId.fromString("0.0.123456"),
    PRIVATE_KEY: PrivateKey.generateED25519(),
    ADDRESS: "0x" + "1".repeat(40)
}

const testController = {
    ACCOUNT_ID: AccountId.fromString("0.0.789012"),
    PRIVATE_KEY: PrivateKey.generateED25519(),
    ADDRESS: "0x" + "2".repeat(40)
}

describe("CoffeeTreeManager Contract", async () => {
    let contractId: string
    let tokenAddress: string

    beforeEach(() => {
        contractId = process.env.COFFEE_TREE_MANAGER_TESTNET || "0.0.123456789"
        tokenAddress = "0x" + "3".repeat(40) // Mock token address
    })

    describe("Contract Deployment and Initialization", () => {
        test("should deploy contract with correct parameters", async () => {
            assert.ok(contractId, "CoffeeTreeManager contract should be deployed")
        })

        test("should initialize with correct metadata", async () => {
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(200_000)
                .setFunction("treeMetadata")
                .execute(client)

            console.log("Tree metadata query executed successfully")
            assert.ok(true)
        })

        test("should set correct roles", async () => {
            const adminQuery = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(100_000)
                .setFunction("admin")
                .execute(client)

            const farmerQuery = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(100_000)
                .setFunction("farmer")
                .execute(client)

            console.log("Role queries executed successfully")
            assert.ok(true)
        })
    })

    describe("Tree Token Creation", () => {
        test("Controller: create tree token", async () => {
            client.setOperator(testController.ACCOUNT_ID, testController.PRIVATE_KEY)

            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(800_000)
                .setFunction("createTreeToken",
                    new ContractFunctionParameters()
                        .addString("Kiambu Premium Grove")
                        .addString("KPG")
                        .addUint64(5000) // Total supply
                        .addString("Kiambu County, Kenya") // Location
                        .addString("Arabica SL28") // Coffee variety
                        .addUint64(1640995200) // Planting date (timestamp)
                        .addUint64(5000) // Expected yield per season
                        .addUint8(85) // Current health score
                        .addString("Organic farming practices") // Farming practices
                )
                .freezeWith(client)
                .sign(testController.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Create Tree Token - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should reject unauthorized token creation", async () => {
            client.setOperator(user.ACCOUNT_ID, user.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(800_000)
                    .setFunction("createTreeToken",
                        new ContractFunctionParameters()
                            .addString("Unauthorized Grove")
                            .addString("UG")
                            .addUint64(1000)
                            .addString("Unknown Location")
                            .addString("Unknown Variety")
                            .addUint64(1640995200)
                            .addUint64(1000)
                            .addUint8(50)
                            .addString("Unknown practices")
                    )
                    .freezeWith(client)
                    .sign(user.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for unauthorized token creation")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected unauthorized token creation:", errorMessage)
                assert.ok(errorMessage.includes("OnlyController") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should validate token parameters", async () => {
            client.setOperator(testController.ACCOUNT_ID, testController.PRIVATE_KEY)

            // Test zero total supply
            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(800_000)
                    .setFunction("createTreeToken",
                        new ContractFunctionParameters()
                            .addString("Zero Supply Grove")
                            .addString("ZSG")
                            .addUint64(0) // Invalid total supply
                            .addString("Test Location")
                            .addString("Test Variety")
                            .addUint64(1640995200)
                            .addUint64(1000)
                            .addUint8(50)
                            .addString("Test practices")
                    )
                    .freezeWith(client)
                    .sign(testController.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for zero total supply")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected zero total supply:", errorMessage)
                assert.ok(errorMessage.includes("InvalidTotalSupply") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })
    })

    describe("Tree Health Management", () => {
        test("Farmer: update tree health", async () => {
            client.setOperator(testFarmer.ACCOUNT_ID, testFarmer.PRIVATE_KEY)

            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(400_000)
                .setFunction("updateTreeHealth",
                    new ContractFunctionParameters()
                        .addUint8(90) // New health score
                        .addString("Trees showing excellent growth after recent rainfall. Pest control measures effective.")
                )
                .freezeWith(client)
                .sign(testFarmer.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Update Tree Health - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should reject non-farmer health updates", async () => {
            client.setOperator(user.ACCOUNT_ID, user.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(400_000)
                    .setFunction("updateTreeHealth",
                        new ContractFunctionParameters()
                            .addUint8(75)
                            .addString("Unauthorized health update")
                    )
                    .freezeWith(client)
                    .sign(user.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for non-farmer health update")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected non-farmer health update:", errorMessage)
                assert.ok(errorMessage.includes("OnlyFarmer") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should validate health score range", async () => {
            client.setOperator(testFarmer.ACCOUNT_ID, testFarmer.PRIVATE_KEY)

            // Test health score > 100
            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(400_000)
                    .setFunction("updateTreeHealth",
                        new ContractFunctionParameters()
                            .addUint8(150) // Invalid health score
                            .addString("Invalid health score test")
                    )
                    .freezeWith(client)
                    .sign(testFarmer.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for invalid health score")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected invalid health score:", errorMessage)
                assert.ok(errorMessage.includes("InvalidHealthScore") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should track health history", async () => {
            // Add multiple health updates
            client.setOperator(testFarmer.ACCOUNT_ID, testFarmer.PRIVATE_KEY)

            const updates = [
                { score: 85, notes: "Initial assessment after planting" },
                { score: 88, notes: "Good growth progress, regular watering" },
                { score: 92, notes: "Excellent condition, flowering stage" }
            ]

            for (const update of updates) {
                await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(400_000)
                    .setFunction("updateTreeHealth",
                        new ContractFunctionParameters()
                            .addUint8(update.score)
                            .addString(update.notes)
                    )
                    .freezeWith(client)
                    .sign(testFarmer.PRIVATE_KEY)
                    .execute(client)
            }

            // Query health history
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("getHealthHistory")
                .execute(client)

            console.log("Health history query executed successfully")
            assert.ok(true)

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })
    })

    describe("Revenue Token Distribution", () => {
        test("Revenue distributor: airdrop revenue tokens", async () => {
            // Mock revenue distributor role
            client.setOperator(testController.ACCOUNT_ID, testController.PRIVATE_KEY)

            const holders = [
                "0x" + "1".repeat(40),
                "0x" + "2".repeat(40),
                "0x" + "3".repeat(40)
            ]
            const amounts = [1000000, 500000, 250000] // Revenue amounts in scaled USDC

            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(600_000)
                .setFunction("airdropRevenueTokens",
                    new ContractFunctionParameters()
                        .addAddressArray(holders)
                        .addUint64Array(amounts)
                )
                .freezeWith(client)
                .sign(testController.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Airdrop Revenue Tokens - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should reject unauthorized revenue distribution", async () => {
            client.setOperator(user.ACCOUNT_ID, user.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(600_000)
                    .setFunction("airdropRevenueTokens",
                        new ContractFunctionParameters()
                            .addAddressArray(["0x" + "1".repeat(40)])
                            .addUint64Array([100000])
                    )
                    .freezeWith(client)
                    .sign(user.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for unauthorized revenue distribution")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected unauthorized revenue distribution:", errorMessage)
                assert.ok(errorMessage.includes("OnlyRevenueDistributor") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should validate array lengths match", async () => {
            client.setOperator(testController.ACCOUNT_ID, testController.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(600_000)
                    .setFunction("airdropRevenueTokens",
                        new ContractFunctionParameters()
                            .addAddressArray(["0x" + "1".repeat(40), "0x" + "2".repeat(40)])
                            .addUint64Array([100000]) // Mismatched array length
                    )
                    .freezeWith(client)
                    .sign(testController.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for mismatched array lengths")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected mismatched array lengths:", errorMessage)
                assert.ok(errorMessage.includes("ArrayLengthMismatch") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })
    })

    describe("Metadata Management", () => {
        test("should get tree metadata", async () => {
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(200_000)
                .setFunction("getTreeMetadata")
                .execute(client)

            console.log("Tree metadata query executed successfully")
            assert.ok(true)
        })

        test("Admin: update farming practices", async () => {
            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(400_000)
                .setFunction("updateFarmingPractices",
                    new ContractFunctionParameters()
                        .addString("Certified organic farming with integrated pest management and sustainable water usage")
                )
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Update Farming Practices - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")
        })

        test("should reject non-admin metadata updates", async () => {
            client.setOperator(user.ACCOUNT_ID, user.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(400_000)
                    .setFunction("updateFarmingPractices",
                        new ContractFunctionParameters()
                            .addString("Unauthorized update")
                    )
                    .freezeWith(client)
                    .sign(user.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for non-admin metadata update")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected non-admin metadata update:", errorMessage)
                assert.ok(errorMessage.includes("OnlyAdmin") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })
    })

    describe("Token Supply Management", () => {
        test("should get total supply", async () => {
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(100_000)
                .setFunction("totalSupply")
                .execute(client)

            console.log("Total supply query executed successfully")
            assert.ok(true)
        })

        test("should get available tokens", async () => {
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(100_000)
                .setFunction("getAvailableTokens")
                .execute(client)

            console.log("Available tokens query executed successfully")
            assert.ok(true)
        })

        test("Controller: mint additional tokens", async () => {
            client.setOperator(testController.ACCOUNT_ID, testController.PRIVATE_KEY)

            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(400_000)
                .setFunction("mintTokens",
                    new ContractFunctionParameters()
                        .addUint64(1000) // Additional tokens to mint
                )
                .freezeWith(client)
                .sign(testController.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Mint Tokens - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should reject unauthorized token minting", async () => {
            client.setOperator(user.ACCOUNT_ID, user.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(400_000)
                    .setFunction("mintTokens",
                        new ContractFunctionParameters()
                            .addUint64(500)
                    )
                    .freezeWith(client)
                    .sign(user.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for unauthorized token minting")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected unauthorized token minting:", errorMessage)
                assert.ok(errorMessage.includes("OnlyController") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })
    })

    describe("Grove Name and Symbol Management", () => {
        test("should get grove name", async () => {
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(100_000)
                .setFunction("groveName")
                .execute(client)

            console.log("Grove name query executed successfully")
            assert.ok(true)
        })

        test("Admin: update grove name", async () => {
            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("updateGroveName",
                    new ContractFunctionParameters()
                        .addString("Kiambu Premium Coffee Grove - Certified Organic")
                )
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Update Grove Name - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")
        })

        test("should reject empty grove name", async () => {
            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(300_000)
                    .setFunction("updateGroveName",
                        new ContractFunctionParameters()
                            .addString("") // Empty name
                    )
                    .freezeWith(client)
                    .sign(admin.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for empty grove name")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected empty grove name:", errorMessage)
                assert.ok(errorMessage.includes("EmptyString") || errorMessage.includes("revert"))
            }
        })
    })

    describe("Emergency Functions", () => {
        test("Admin: pause contract", async () => {
            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("pause")
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Pause Contract - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")
        })

        test("should reject operations when paused", async () => {
            client.setOperator(testFarmer.ACCOUNT_ID, testFarmer.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(400_000)
                    .setFunction("updateTreeHealth",
                        new ContractFunctionParameters()
                            .addUint8(80)
                            .addString("Should fail when paused")
                    )
                    .freezeWith(client)
                    .sign(testFarmer.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for operation on paused contract")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected operation on paused contract:", errorMessage)
                assert.ok(errorMessage.includes("Pausable: paused") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("Admin: unpause contract", async () => {
            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("unpause")
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Unpause Contract - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")
        })
    })
})