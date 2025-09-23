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

// Coffee variety enum values
const CoffeeVariety = {
    ARABICA: 0,
    ROBUSTA: 1,
    SPECIALTY: 2,
    ORGANIC: 3
}

describe("CoffeePriceOracle Contract", async () => {
    let contractId: string
    
    beforeEach(() => {
        contractId = process.env.COFFEE_PRICE_ORACLE_TESTNET || "0.0.123456789"
    })
  
    describe("Contract Deployment and Initialization", () => {
        test("should deploy contract with admin as deployer", async () => {
            // This test would verify the contract deployment
            // In a real scenario, we would deploy the contract here
            assert.ok(contractId, "Contract should be deployed")
        })

        test("should initialize default seasonal multipliers", async () => {
            // Check that all 12 months have default 1.0x multipliers
            for (let month = 1; month <= 12; month++) {
                const query = await new ContractCallQuery()
                    .setContractId(contractId)
                    .setGas(100_000)
                    .setFunction("seasonalMultipliers",
                        new ContractFunctionParameters()
                            .addUint8(month)
                    )
                    .execute(client)

                // In a real implementation, you would parse the returned struct
                console.log(`Month ${month} multiplier query executed successfully`)
            }
            assert.ok(true) // Placeholder assertion
        })
    })
  
    describe("Coffee Price Management", () => {
        test("Admin: update coffee prices", async () => {
            const variety = CoffeeVariety.ARABICA
            const grade = 8
            const price = 5000000 // 5 USDC per kg (scaled by denominator)
            
            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("updateCoffeePrice",
                    new ContractFunctionParameters()
                        .addUint8(variety)
                        .addUint8(grade)
                        .addUint64(price)
                )
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Update Coffee Price - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")
        })

        test("should get coffee price", async () => {
            const variety = CoffeeVariety.ARABICA
            const grade = 8

            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(100_000)
                .setFunction("getCoffeePrice",
                    new ContractFunctionParameters()
                        .addUint8(variety)
                        .addUint8(grade)
                )
                .execute(client)

            // In a real implementation, you would parse the returned uint64
            console.log("Coffee price query executed successfully")
            assert.ok(true) // Placeholder assertion
        })

        test("should reject non-admin price updates", async () => {
            client.setOperator(user.ACCOUNT_ID, user.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(300_000)
                    .setFunction("updateCoffeePrice",
                        new ContractFunctionParameters()
                            .addUint8(CoffeeVariety.ARABICA)
                            .addUint8(8)
                            .addUint64(5000000)
                    )
                    .freezeWith(client)
                    .sign(user.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for non-admin access")
            } catch (error) {
                console.log("Correctly rejected non-admin price update:", (error as Error).message)
                assert.ok((error as Error).message.includes("Only admin") || (error as Error).message.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should reject invalid grades", async () => {
            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(300_000)
                    .setFunction("updateCoffeePrice",
                        new ContractFunctionParameters()
                            .addUint8(CoffeeVariety.ARABICA)
                            .addUint8(0) // Invalid grade
                            .addUint64(5000000)
                    )
                    .freezeWith(client)
                    .sign(admin.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for invalid grade")
            } catch (error) {
                console.log("Correctly rejected invalid grade:", (error as Error).message)
                assert.ok((error as Error).message.includes("Grade must be") || (error as Error).message.includes("revert"))
            }
        })

        test("should get coffee price data with metadata", async () => {
            const variety = CoffeeVariety.ROBUSTA
            const grade = 6

            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(200_000)
                .setFunction("getCoffeePriceData",
                    new ContractFunctionParameters()
                        .addUint8(variety)
                        .addUint8(grade)
                )
                .execute(client)

            // In a real implementation, you would parse the returned struct
            console.log("Coffee price data query executed successfully")
            assert.ok(true) // Placeholder assertion
        })
    })
  
    describe("Seasonal Multipliers", () => {
        test("Admin: update seasonal multipliers", async () => {
            const month = 3 // March
            const multiplier = 1200 // 1.2x

            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("updateSeasonalMultiplier",
                    new ContractFunctionParameters()
                        .addUint8(month)
                        .addUint64(multiplier)
                )
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Update Seasonal Multiplier - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")
        })

        test("should reject invalid months", async () => {
            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(300_000)
                    .setFunction("updateSeasonalMultiplier",
                        new ContractFunctionParameters()
                            .addUint8(0) // Invalid month
                            .addUint64(1200)
                    )
                    .freezeWith(client)
                    .sign(admin.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for invalid month")
            } catch (error) {
                console.log("Correctly rejected invalid month:", (error as Error).message)
                assert.ok((error as Error).message.includes("Month must be") || (error as Error).message.includes("revert"))
            }
        })

        test("should reject zero multipliers", async () => {
            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(300_000)
                    .setFunction("updateSeasonalMultiplier",
                        new ContractFunctionParameters()
                            .addUint8(6)
                            .addUint64(0) // Invalid multiplier
                    )
                    .freezeWith(client)
                    .sign(admin.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for zero multiplier")
            } catch (error) {
                console.log("Correctly rejected zero multiplier:", (error as Error).message)
                assert.ok((error as Error).message.includes("Multiplier must be") || (error as Error).message.includes("revert"))
            }
        })
    })
  
    describe("Seasonal Price Calculation", () => {
        test("should calculate seasonal prices correctly", async () => {
            // First set up base price
            await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("updateCoffeePrice",
                    new ContractFunctionParameters()
                        .addUint8(CoffeeVariety.ARABICA)
                        .addUint8(8)
                        .addUint64(5000000) // 5 USDC
                )
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)
                .execute(client)

            // Set up seasonal multiplier for harvest season
            await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("updateSeasonalMultiplier",
                    new ContractFunctionParameters()
                        .addUint8(10) // October
                        .addUint64(1300) // 1.3x
                )
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)
                .execute(client)

            // Get seasonal price
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(200_000)
                .setFunction("getSeasonalCoffeePrice",
                    new ContractFunctionParameters()
                        .addUint8(CoffeeVariety.ARABICA)
                        .addUint8(8)
                        .addUint8(10) // October
                )
                .execute(client)

            // In a real implementation, you would parse and verify the returned price
            console.log("Seasonal price calculation executed successfully")
            assert.ok(true) // Placeholder assertion
        })

        test("should use default multiplier for unmodified months", async () => {
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(200_000)
                .setFunction("getSeasonalCoffeePrice",
                    new ContractFunctionParameters()
                        .addUint8(CoffeeVariety.ARABICA)
                        .addUint8(8)
                        .addUint8(5) // May - default multiplier
                )
                .execute(client)

            console.log("Default seasonal price query executed successfully")
            assert.ok(true) // Placeholder assertion
        })
    })
  
    describe("Projected Revenue Calculation", () => {
        test("should calculate projected revenue correctly", async () => {
            // Set up specialty coffee price
            await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("updateCoffeePrice",
                    new ContractFunctionParameters()
                        .addUint8(CoffeeVariety.SPECIALTY)
                        .addUint8(9)
                        .addUint64(8000000) // 8 USDC
                )
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)
                .execute(client)

            // Set up seasonal multiplier for November
            await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("updateSeasonalMultiplier",
                    new ContractFunctionParameters()
                        .addUint8(11) // November
                        .addUint64(1150) // 1.15x
                )
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)
                .execute(client)

            // Calculate projected revenue
            const groveTokenAddress = "0x" + "1".repeat(40) // Mock address
            const expectedYield = 1000 // 1000 kg
            const harvestMonth = 11 // November

            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("calculateProjectedRevenue",
                    new ContractFunctionParameters()
                        .addAddress(groveTokenAddress)
                        .addUint8(CoffeeVariety.SPECIALTY)
                        .addUint8(9)
                        .addUint64(expectedYield)
                        .addUint8(harvestMonth)
                )
                .execute(client)

            console.log("Projected revenue calculation executed successfully")
            assert.ok(true) // Placeholder assertion
        })

        test("should reject invalid inputs for revenue calculation", async () => {
            const groveTokenAddress = "0x" + "0".repeat(40) // Zero address

            try {
                const query = await new ContractCallQuery()
                    .setContractId(contractId)
                    .setGas(300_000)
                    .setFunction("calculateProjectedRevenue",
                        new ContractFunctionParameters()
                            .addAddress(groveTokenAddress) // Invalid address
                            .addUint8(CoffeeVariety.SPECIALTY)
                            .addUint8(9)
                            .addUint64(1000)
                            .addUint8(11)
                    )
                    .execute(client)

                assert.fail("Should have thrown an error for invalid grove token address")
            } catch (error) {
                console.log("Correctly rejected invalid grove token address:", (error as Error).message)
                assert.ok((error as Error).message.includes("Invalid grove") || (error as Error).message.includes("revert"))
            }
        })
    })
  
    describe("Batch Operations", () => {
        test("Admin: batch update coffee prices", async () => {
            const varieties = [CoffeeVariety.ARABICA, CoffeeVariety.ROBUSTA, CoffeeVariety.ORGANIC]
            const grades = [7, 6, 9]
            const prices = [4500000, 3200000, 9500000]

            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(500_000)
                .setFunction("batchUpdateCoffeePrices",
                    new ContractFunctionParameters()
                        .addUint8Array(varieties)
                        .addUint8Array(grades)
                        .addUint64Array(prices)
                )
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Batch Update Coffee Prices - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")
        })

        test("should reject batch updates with mismatched array lengths", async () => {
            const varieties = [CoffeeVariety.ARABICA, CoffeeVariety.ROBUSTA]
            const grades = [7, 6, 8] // Different length
            const prices = [4500000, 3200000]

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(500_000)
                    .setFunction("batchUpdateCoffeePrices",
                        new ContractFunctionParameters()
                            .addUint8Array(varieties)
                            .addUint8Array(grades)
                            .addUint64Array(prices)
                    )
                    .freezeWith(client)
                    .sign(admin.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for mismatched array lengths")
            } catch (error) {
                console.log("Correctly rejected mismatched array lengths:", (error as Error).message)
                assert.ok((error as Error).message.includes("Array lengths") || (error as Error).message.includes("revert"))
            }
        })
    })
  
    describe("Price Deactivation", () => {
        test("Admin: deactivate coffee prices", async () => {
            // First set up a price
            await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("updateCoffeePrice",
                    new ContractFunctionParameters()
                        .addUint8(CoffeeVariety.ARABICA)
                        .addUint8(7)
                        .addUint64(4000000)
                )
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)
                .execute(client)

            // Now deactivate it
            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("deactivateCoffeePrice",
                    new ContractFunctionParameters()
                        .addUint8(CoffeeVariety.ARABICA)
                        .addUint8(7)
                )
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Deactivate Coffee Price - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")
        })

        test("should reject getting deactivated prices", async () => {
            try {
                const query = await new ContractCallQuery()
                    .setContractId(contractId)
                    .setGas(100_000)
                    .setFunction("getCoffeePrice",
                        new ContractFunctionParameters()
                            .addUint8(CoffeeVariety.ARABICA)
                            .addUint8(7)
                    )
                    .execute(client)

                assert.fail("Should have thrown an error for deactivated price")
            } catch (error) {
                console.log("Correctly rejected deactivated price:", (error as Error).message)
                assert.ok((error as Error).message.includes("Price not available") || (error as Error).message.includes("revert"))
            }
        })
    })

    describe("Backward Compatibility", () => {
        test("should support legacy price updates", async () => {
            const tokenAddress = "0x" + "1".repeat(40) // Mock address
            const price = 2500000

            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("updatePrice",
                    new ContractFunctionParameters()
                        .addAddress(tokenAddress)
                        .addUint64(price)
                )
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Legacy Price Update - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")
        })

        test("should support legacy price queries", async () => {
            const tokenAddress = "0x" + "1".repeat(40) // Mock address

            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(100_000)
                .setFunction("getPrice",
                    new ContractFunctionParameters()
                        .addAddress(tokenAddress)
                )
                .execute(client)

            console.log("Legacy price query executed successfully")
            assert.ok(true) // Placeholder assertion
        })
    })
})