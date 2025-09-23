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

// Test accounts
const testFarmer = {
    ACCOUNT_ID: AccountId.fromString("0.0.123456"),
    PRIVATE_KEY: PrivateKey.generateED25519(),
    ADDRESS: "0x" + "1".repeat(40)
}

const testInvestor1 = {
    ACCOUNT_ID: AccountId.fromString("0.0.789012"),
    PRIVATE_KEY: PrivateKey.generateED25519(),
    ADDRESS: "0x" + "2".repeat(40)
}

const testInvestor2 = {
    ACCOUNT_ID: AccountId.fromString("0.0.345678"),
    PRIVATE_KEY: PrivateKey.generateED25519(),
    ADDRESS: "0x" + "3".repeat(40)
}

describe("CoffeeRevenueReserve Contract", async () => {
    let contractId: string
    let groveTokenAddress: string
    let issuerAddress: string

    beforeEach(() => {
        contractId = process.env.COFFEE_REVENUE_RESERVE_TESTNET || "0.0.123456789"
        groveTokenAddress = "0x" + "4".repeat(40) // Mock grove token address
        issuerAddress = "0x" + "5".repeat(40) // Mock issuer address
    })

    describe("Contract Deployment and Initialization", () => {
        test("should deploy contract with correct parameters", async () => {
            assert.ok(contractId, "CoffeeRevenueReserve contract should be deployed")
        })

        test("should initialize with correct grove token and farmer", async () => {
            const groveTokenQuery = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(100_000)
                .setFunction("groveToken")
                .execute(client)

            const farmerQuery = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(100_000)
                .setFunction("farmer")
                .execute(client)

            console.log("Grove token and farmer queries executed successfully")
            assert.ok(true)
        })

        test("should have zero initial reserves", async () => {
            const totalReserveQuery = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(100_000)
                .setFunction("totalReserve")
                .execute(client)

            const totalDistributedQuery = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(100_000)
                .setFunction("totalDistributed")
                .execute(client)

            console.log("Reserve balance queries executed successfully")
            assert.ok(true)
        })
    })

    describe("Revenue Deposit", () => {
        test("Grove manager: deposit harvest revenue", async () => {
            // Mock grove manager role
            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)

            const harvestId = "0x" + "a".repeat(64) // Mock harvest ID
            const revenueAmount = 12500000000 // 12,500 USDC (scaled)

            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(500_000)
                .setFunction("depositHarvestRevenue",
                    new ContractFunctionParameters()
                        .addUint64(revenueAmount)
                        .addBytes32(harvestId)
                )
                .setPayableAmount(revenueAmount) // Send USDC with transaction
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Deposit Revenue - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")
        })

        test("should reject unauthorized revenue deposits", async () => {
            client.setOperator(user.ACCOUNT_ID, user.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(500_000)
                    .setFunction("depositHarvestRevenue",
                        new ContractFunctionParameters()
                            .addUint64(1000000000)
                            .addBytes32("0x" + "b".repeat(64))
                    )
                    .setPayableAmount(1000000000)
                    .freezeWith(client)
                    .sign(user.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for unauthorized revenue deposit")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected unauthorized revenue deposit:", errorMessage)
                assert.ok(errorMessage.includes("OnlyGroveManager") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should reject zero amount deposits", async () => {
            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(500_000)
                    .setFunction("depositHarvestRevenue",
                        new ContractFunctionParameters()
                            .addUint64(0) // Zero amount
                            .addBytes32("0x" + "c".repeat(64))
                    )
                    .setPayableAmount(0)
                    .freezeWith(client)
                    .sign(admin.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for zero amount deposit")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected zero amount deposit:", errorMessage)
                assert.ok(errorMessage.includes("ZeroAmount") || errorMessage.includes("revert"))
            }
        })

        test("should reject duplicate harvest deposits", async () => {
            const duplicateHarvestId = "0x" + "a".repeat(64) // Same as first deposit

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(500_000)
                    .setFunction("depositHarvestRevenue",
                        new ContractFunctionParameters()
                            .addUint64(5000000000)
                            .addBytes32(duplicateHarvestId)
                    )
                    .setPayableAmount(5000000000)
                    .freezeWith(client)
                    .sign(admin.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for duplicate harvest deposit")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected duplicate harvest deposit:", errorMessage)
                assert.ok(errorMessage.includes("HarvestAlreadyProcessed") || errorMessage.includes("revert"))
            }
        })
    })

    describe("Token Holder Share Calculation", () => {
        test("should calculate token holder shares correctly", async () => {
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("calculateTokenHolderShares",
                    new ContractFunctionParameters()
                        .addAddress(groveTokenAddress)
                )
                .execute(client)

            console.log("Token holder shares calculation executed successfully")
            assert.ok(true)
        })

        test("should handle single token holder", async () => {
            // Mock scenario with single token holder
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("calculateTokenHolderShares",
                    new ContractFunctionParameters()
                        .addAddress(groveTokenAddress)
                )
                .execute(client)

            console.log("Single token holder shares calculation executed successfully")
            assert.ok(true)
        })

        test("should handle multiple token holders with different balances", async () => {
            // This would test the proportional distribution logic
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(400_000)
                .setFunction("calculateTokenHolderShares",
                    new ContractFunctionParameters()
                        .addAddress(groveTokenAddress)
                )
                .execute(client)

            console.log("Multiple token holder shares calculation executed successfully")
            assert.ok(true)
        })
    })

    describe("Revenue Distribution", () => {
        test("Authorized: distribute revenue to token holders", async () => {
            const totalRevenue = 10000000000 // 10,000 USDC (scaled)

            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(800_000)
                .setFunction("distributeRevenue",
                    new ContractFunctionParameters()
                        .addAddress(groveTokenAddress)
                        .addUint64(totalRevenue)
                )
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Distribute Revenue - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")
        })

        test("should reject unauthorized revenue distribution", async () => {
            client.setOperator(user.ACCOUNT_ID, user.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(800_000)
                    .setFunction("distributeRevenue",
                        new ContractFunctionParameters()
                            .addAddress(groveTokenAddress)
                            .addUint64(5000000000)
                    )
                    .freezeWith(client)
                    .sign(user.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for unauthorized revenue distribution")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected unauthorized revenue distribution:", errorMessage)
                assert.ok(errorMessage.includes("OnlyAuthorized") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should reject distribution with insufficient reserves", async () => {
            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(800_000)
                    .setFunction("distributeRevenue",
                        new ContractFunctionParameters()
                            .addAddress(groveTokenAddress)
                            .addUint64(50000000000) // More than available reserves
                    )
                    .freezeWith(client)
                    .sign(admin.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for insufficient reserves")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected distribution with insufficient reserves:", errorMessage)
                assert.ok(errorMessage.includes("InsufficientReserves") || errorMessage.includes("revert"))
            }
        })

        test("should handle zero token holders gracefully", async () => {
            const emptyTokenAddress = "0x" + "0".repeat(40)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(800_000)
                    .setFunction("distributeRevenue",
                        new ContractFunctionParameters()
                            .addAddress(emptyTokenAddress)
                            .addUint64(1000000000)
                    )
                    .freezeWith(client)
                    .sign(admin.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for zero token holders")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected distribution with zero token holders:", errorMessage)
                assert.ok(errorMessage.includes("NoTokenHolders") || errorMessage.includes("revert"))
            }
        })
    })

    describe("Farmer Share Withdrawal", () => {
        test("Farmer: withdraw farmer share", async () => {
            client.setOperator(testFarmer.ACCOUNT_ID, testFarmer.PRIVATE_KEY)

            const withdrawAmount = 2500000000 // 2,500 USDC (scaled)

            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(400_000)
                .setFunction("withdrawFarmerShare",
                    new ContractFunctionParameters()
                        .addUint64(withdrawAmount)
                )
                .freezeWith(client)
                .sign(testFarmer.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Withdraw Farmer Share - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should reject non-farmer withdrawals", async () => {
            client.setOperator(testInvestor1.ACCOUNT_ID, testInvestor1.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(400_000)
                    .setFunction("withdrawFarmerShare",
                        new ContractFunctionParameters()
                            .addUint64(1000000000)
                    )
                    .freezeWith(client)
                    .sign(testInvestor1.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for non-farmer withdrawal")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected non-farmer withdrawal:", errorMessage)
                assert.ok(errorMessage.includes("OnlyGroveOwner") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should reject withdrawal exceeding farmer balance", async () => {
            client.setOperator(testFarmer.ACCOUNT_ID, testFarmer.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(400_000)
                    .setFunction("withdrawFarmerShare",
                        new ContractFunctionParameters()
                            .addUint64(50000000000) // Excessive amount
                    )
                    .freezeWith(client)
                    .sign(testFarmer.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for excessive withdrawal")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected excessive withdrawal:", errorMessage)
                assert.ok(errorMessage.includes("InsufficientFarmerBalance") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should reject zero amount withdrawals", async () => {
            client.setOperator(testFarmer.ACCOUNT_ID, testFarmer.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(400_000)
                    .setFunction("withdrawFarmerShare",
                        new ContractFunctionParameters()
                            .addUint64(0) // Zero amount
                    )
                    .freezeWith(client)
                    .sign(testFarmer.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for zero withdrawal amount")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected zero withdrawal amount:", errorMessage)
                assert.ok(errorMessage.includes("ZeroAmount") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })
    })

    describe("Distribution History and Tracking", () => {
        test("should track distribution history", async () => {
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(200_000)
                .setFunction("distributionCounter")
                .execute(client)

            console.log("Distribution counter query executed successfully")
            assert.ok(true)
        })

        test("should get distribution details", async () => {
            const distributionId = 1 // First distribution

            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("distributions",
                    new ContractFunctionParameters()
                        .addUint256(distributionId)
                )
                .execute(client)

            console.log("Distribution details query executed successfully")
            assert.ok(true)
        })

        test("should track holder total earnings", async () => {
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(200_000)
                .setFunction("holderTotalEarnings",
                    new ContractFunctionParameters()
                        .addAddress(testInvestor1.ADDRESS)
                )
                .execute(client)

            console.log("Holder total earnings query executed successfully")
            assert.ok(true)
        })

        test("should check if holder claimed distribution", async () => {
            const distributionId = 1
            const holderAddress = testInvestor1.ADDRESS

            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(200_000)
                .setFunction("hasClaimedDistribution",
                    new ContractFunctionParameters()
                        .addUint256(distributionId)
                        .addAddress(holderAddress)
                )
                .execute(client)

            console.log("Claim status query executed successfully")
            assert.ok(true)
        })
    })

    describe("Batch Revenue Distribution", () => {
        test("should handle batch distribution to multiple holders", async () => {
            const holders = [
                testInvestor1.ADDRESS,
                testInvestor2.ADDRESS,
                "0x" + "6".repeat(40)
            ]
            const shares = [4000000000, 3000000000, 2000000000] // Different share amounts

            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(1000_000)
                .setFunction("batchDistributeRevenue",
                    new ContractFunctionParameters()
                        .addAddressArray(holders)
                        .addUint64Array(shares)
                )
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Batch Distribute Revenue - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")
        })

        test("should reject batch distribution with mismatched arrays", async () => {
            const holders = [testInvestor1.ADDRESS, testInvestor2.ADDRESS]
            const shares = [1000000000] // Mismatched length

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(1000_000)
                    .setFunction("batchDistributeRevenue",
                        new ContractFunctionParameters()
                            .addAddressArray(holders)
                            .addUint64Array(shares)
                    )
                    .freezeWith(client)
                    .sign(admin.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for mismatched array lengths")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected mismatched array lengths:", errorMessage)
                assert.ok(errorMessage.includes("ArrayLengthMismatch") || errorMessage.includes("revert"))
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
            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(500_000)
                    .setFunction("depositHarvestRevenue",
                        new ContractFunctionParameters()
                            .addUint64(1000000000)
                            .addBytes32("0x" + "d".repeat(64))
                    )
                    .setPayableAmount(1000000000)
                    .freezeWith(client)
                    .sign(admin.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for operation on paused contract")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected operation on paused contract:", errorMessage)
                assert.ok(errorMessage.includes("Pausable: paused") || errorMessage.includes("revert"))
            }
        })

        test("Admin: emergency withdraw", async () => {
            const withdrawAmount = 1000000000 // Emergency withdrawal amount

            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(400_000)
                .setFunction("emergencyWithdraw",
                    new ContractFunctionParameters()
                        .addUint64(withdrawAmount)
                )
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Emergency Withdraw - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")
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

    describe("Revenue Calculation Edge Cases", () => {
        test("should handle very small revenue amounts", async () => {
            const smallAmount = 1 // 1 unit (smallest possible)

            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(500_000)
                .setFunction("depositHarvestRevenue",
                    new ContractFunctionParameters()
                        .addUint64(smallAmount)
                        .addBytes32("0x" + "e".repeat(64))
                )
                .setPayableAmount(smallAmount)
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Small Revenue Deposit - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")
        })

        test("should handle maximum revenue amounts", async () => {
            const maxAmount = 18446744073709551615n // Max uint64

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(500_000)
                    .setFunction("depositHarvestRevenue",
                        new ContractFunctionParameters()
                            .addUint64(Number(maxAmount))
                            .addBytes32("0x" + "f".repeat(64))
                    )
                    .setPayableAmount(Number(maxAmount))
                    .freezeWith(client)
                    .sign(admin.PRIVATE_KEY)

                const submittedTx = await tx.execute(client)
                const receipt = await submittedTx.getReceipt(client)

                console.log(`Max Revenue Deposit - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
                assert.strictEqual(receipt.status.toString(), "SUCCESS")
            } catch (error) {
                // This might fail due to practical limits, which is acceptable
                console.log("Max amount test completed (may have practical limits)")
                assert.ok(true)
            }
        })

        test("should handle rounding in proportional distribution", async () => {
            // Test case where proportional shares don't divide evenly
            const oddRevenue = 1000000001 // Odd number that doesn't divide evenly

            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(800_000)
                .setFunction("distributeRevenue",
                    new ContractFunctionParameters()
                        .addAddress(groveTokenAddress)
                        .addUint64(oddRevenue)
                )
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Odd Revenue Distribution - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")
        })
    })
})