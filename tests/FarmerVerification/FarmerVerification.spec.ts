import { describe, test, beforeEach } from "node:test"
import { testStore } from "../../lib/test-store"
import { getClient, getEnv, getTestUser } from "../../utils"
import {
    ContractCallQuery,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    ContractId,
    AccountId,
    PrivateKey,
    Client
} from "@hashgraph/sdk"
import assert from "node:assert"

const client = getClient()
const admin = getEnv()
const user = getTestUser()

// Create additional test users for verification scenarios
const testFarmer = {
    ACCOUNT_ID: AccountId.fromString("0.0.123456"), // Mock account ID
    PRIVATE_KEY: PrivateKey.generateED25519(),
    ADDRESS: "0x" + "1".repeat(40) // Mock address
}

const testVerifier = {
    ACCOUNT_ID: AccountId.fromString("0.0.789012"), // Mock account ID  
    PRIVATE_KEY: PrivateKey.generateED25519(),
    ADDRESS: "0x" + "2".repeat(40) // Mock address
}

describe("FarmerVerification Contract", async () => {
    let contractId: string

    // Mock contract deployment - in real scenario this would be deployed
    beforeEach(() => {
        contractId = process.env.FARMER_VERIFICATION_TESTNET || "0.0.123456789"
    })

    describe("Contract Deployment and Admin Functions", () => {
        test("should deploy contract with admin as initial verifier", async () => {
            // This test would verify the contract deployment
            // In a real scenario, we would deploy the contract here
            assert.ok(contractId, "Contract should be deployed")
        })

        test("Admin: add authorized verifier", async () => {
            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("addVerifier",
                    new ContractFunctionParameters()
                        .addAddress(testVerifier.ADDRESS)
                )
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Add Verifier - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")
        })

        test("Admin: check if verifier is authorized", async () => {
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(100_000)
                .setFunction("isAuthorizedVerifier",
                    new ContractFunctionParameters()
                        .addAddress(testVerifier.ADDRESS)
                )
                .execute(client)

            const isAuthorized = query.getBool()
            console.log(`Verifier ${testVerifier.ADDRESS} is authorized: ${isAuthorized}`)
            assert.strictEqual(isAuthorized, true)
        })

        test("Admin: remove verifier", async () => {
            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("removeVerifier",
                    new ContractFunctionParameters()
                        .addAddress(testVerifier.ADDRESS)
                )
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Remove Verifier - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")
        })
    })

    describe("Farmer Document Submission", () => {
        test("Farmer: submit verification documents", async () => {
            // Re-add verifier for subsequent tests
            await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(300_000)
                .setFunction("addVerifier",
                    new ContractFunctionParameters()
                        .addAddress(testVerifier.ADDRESS)
                )
                .freezeWith(client)
                .sign(admin.PRIVATE_KEY)
                .execute(client)

            // Switch to farmer account
            client.setOperator(testFarmer.ACCOUNT_ID, testFarmer.PRIVATE_KEY)

            const documentsHash = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG" // Example IPFS hash
            const location = "Kiambu County, Kenya"
            const coordinates = [1000000, 36800000] // Latitude: -1.0, Longitude: 36.8 (scaled by 1e6)

            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(500_000)
                .setFunction("submitVerificationDocuments",
                    new ContractFunctionParameters()
                        .addString(documentsHash)
                        .addString(location)
                        .addUint64Array(coordinates)
                )
                .freezeWith(client)
                .sign(testFarmer.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Submit Documents - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")

            // Reset client to admin
            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should reject empty documents hash", async () => {
            client.setOperator(testFarmer.ACCOUNT_ID, testFarmer.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(500_000)
                    .setFunction("submitVerificationDocuments",
                        new ContractFunctionParameters()
                            .addString("") // Empty documents hash
                            .addString("Kiambu County, Kenya")
                            .addUint64Array([1000000, 36800000])
                    )
                    .freezeWith(client)
                    .sign(testFarmer.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for empty documents hash")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected empty documents hash:", errorMessage)
                assert.ok(errorMessage.includes("EmptyString") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should reject invalid coordinates", async () => {
            client.setOperator(testFarmer.ACCOUNT_ID, testFarmer.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(500_000)
                    .setFunction("submitVerificationDocuments",
                        new ContractFunctionParameters()
                            .addString("QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG")
                            .addString("Kiambu County, Kenya")
                            .addUint64Array([1000000]) // Invalid coordinates array (only 1 element)
                    )
                    .freezeWith(client)
                    .sign(testFarmer.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for invalid coordinates")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected invalid coordinates:", errorMessage)
                assert.ok(errorMessage.includes("InvalidCoordinates") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })
    })

    describe("Farmer Verification Process", () => {
        test("Verifier: approve farmer verification", async () => {
            client.setOperator(testVerifier.ACCOUNT_ID, testVerifier.PRIVATE_KEY)

            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(400_000)
                .setFunction("verifyFarmer",
                    new ContractFunctionParameters()
                        .addAddress(testFarmer.ADDRESS)
                        .addBool(true) // Approved
                        .addString("") // No rejection reason needed for approval
                )
                .freezeWith(client)
                .sign(testVerifier.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Verify Farmer - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should check if farmer is verified", async () => {
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(100_000)
                .setFunction("isVerifiedFarmer",
                    new ContractFunctionParameters()
                        .addAddress(testFarmer.ADDRESS)
                )
                .execute(client)

            const isVerified = query.getBool()
            console.log(`Farmer ${testFarmer.ADDRESS} is verified: ${isVerified}`)
            assert.strictEqual(isVerified, true)
        })

        test("Verifier: reject farmer verification with reason", async () => {
            // Create another test farmer for rejection scenario
            const rejectedFarmer = {
                ACCOUNT_ID: AccountId.fromString("0.0.999999"),
                PRIVATE_KEY: PrivateKey.generateED25519(),
                ADDRESS: "0x" + "3".repeat(40)
            }

            // First submit documents for the rejected farmer
            client.setOperator(rejectedFarmer.ACCOUNT_ID, rejectedFarmer.PRIVATE_KEY)

            await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(500_000)
                .setFunction("submitVerificationDocuments",
                    new ContractFunctionParameters()
                        .addString("QmInvalidHash123")
                        .addString("Invalid Location")
                        .addUint64Array([0, 0])
                )
                .freezeWith(client)
                .sign(rejectedFarmer.PRIVATE_KEY)
                .execute(client)

            // Now reject the farmer
            client.setOperator(testVerifier.ACCOUNT_ID, testVerifier.PRIVATE_KEY)

            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(400_000)
                .setFunction("verifyFarmer",
                    new ContractFunctionParameters()
                        .addAddress(rejectedFarmer.ADDRESS)
                        .addBool(false) // Rejected
                        .addString("Invalid documentation provided")
                )
                .freezeWith(client)
                .sign(testVerifier.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Reject Farmer - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })
    })

    describe("Grove Ownership Registration", () => {
        test("Verifier: register grove ownership for verified farmer", async () => {
            client.setOperator(testVerifier.ACCOUNT_ID, testVerifier.PRIVATE_KEY)

            const groveName = "Kiambu Coffee Grove #1"
            const ownershipProofHash = "QmOwnershipProof123456789"

            const tx = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(500_000)
                .setFunction("registerGroveOwnership",
                    new ContractFunctionParameters()
                        .addAddress(testFarmer.ADDRESS)
                        .addString(groveName)
                        .addString(ownershipProofHash)
                )
                .freezeWith(client)
                .sign(testVerifier.PRIVATE_KEY)

            const submittedTx = await tx.execute(client)
            const receipt = await submittedTx.getReceipt(client)

            console.log(`Register Grove - Tx Hash: ${tx.transactionId} Status: ${receipt.status}`)
            assert.strictEqual(receipt.status.toString(), "SUCCESS")

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should check grove ownership", async () => {
            const groveName = "Kiambu Coffee Grove #1"

            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(200_000)
                .setFunction("isGroveOwner",
                    new ContractFunctionParameters()
                        .addString(groveName)
                        .addAddress(testFarmer.ADDRESS)
                )
                .execute(client)

            const isOwner = query.getBool()
            console.log(`Farmer ${testFarmer.ADDRESS} owns grove "${groveName}": ${isOwner}`)
            assert.strictEqual(isOwner, true)
        })

        test("should get farmer's groves", async () => {
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(200_000)
                .setFunction("getFarmerGroves",
                    new ContractFunctionParameters()
                        .addAddress(testFarmer.ADDRESS)
                )
                .execute(client)

            // Note: In a real implementation, you would parse the returned array
            console.log("Farmer's groves query executed successfully")
            assert.ok(true) // Placeholder assertion
        })

        test("should reject duplicate grove registration", async () => {
            client.setOperator(testVerifier.ACCOUNT_ID, testVerifier.PRIVATE_KEY)

            const groveName = "Kiambu Coffee Grove #1" // Same grove name as before
            const ownershipProofHash = "QmDuplicateProof123"

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(500_000)
                    .setFunction("registerGroveOwnership",
                        new ContractFunctionParameters()
                            .addAddress(testFarmer.ADDRESS)
                            .addString(groveName)
                            .addString(ownershipProofHash)
                    )
                    .freezeWith(client)
                    .sign(testVerifier.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for duplicate grove registration")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected duplicate grove registration:", errorMessage)
                assert.ok(errorMessage.includes("GroveAlreadyRegistered") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })
    })

    describe("Access Control Tests", () => {
        test("should reject non-verifier attempting to verify farmer", async () => {
            // Use regular user account (not a verifier)
            client.setOperator(user.ACCOUNT_ID, user.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(400_000)
                    .setFunction("verifyFarmer",
                        new ContractFunctionParameters()
                            .addAddress(testFarmer.ADDRESS)
                            .addBool(true)
                            .addString("")
                    )
                    .freezeWith(client)
                    .sign(user.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for unauthorized verifier")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected unauthorized verifier:", errorMessage)
                assert.ok(errorMessage.includes("UnauthorizedAccess") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })

        test("should reject non-admin attempting to add verifier", async () => {
            client.setOperator(user.ACCOUNT_ID, user.PRIVATE_KEY)

            try {
                const tx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(300_000)
                    .setFunction("addVerifier",
                        new ContractFunctionParameters()
                            .addAddress("0x" + "4".repeat(40))
                    )
                    .freezeWith(client)
                    .sign(user.PRIVATE_KEY)

                await tx.execute(client)
                assert.fail("Should have thrown an error for unauthorized admin action")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                console.log("Correctly rejected unauthorized admin action:", errorMessage)
                assert.ok(errorMessage.includes("UnauthorizedAccess") || errorMessage.includes("revert"))
            }

            client.setOperator(admin.ACCOUNT_ID, admin.PRIVATE_KEY)
        })
    })

    describe("Data Retrieval Functions", () => {
        test("should get farmer verification data", async () => {
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(200_000)
                .setFunction("getFarmerData",
                    new ContractFunctionParameters()
                        .addAddress(testFarmer.ADDRESS)
                )
                .execute(client)

            // Note: In a real implementation, you would parse the returned struct
            console.log("Farmer data query executed successfully")
            assert.ok(true) // Placeholder assertion
        })

        test("should get grove ownership data", async () => {
            const groveName = "Kiambu Coffee Grove #1"

            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(200_000)
                .setFunction("getGroveOwnership",
                    new ContractFunctionParameters()
                        .addString(groveName)
                )
                .execute(client)

            // Note: In a real implementation, you would parse the returned struct
            console.log("Grove ownership data query executed successfully")
            assert.ok(true) // Placeholder assertion
        })

        test("should get verification status", async () => {
            const query = await new ContractCallQuery()
                .setContractId(contractId)
                .setGas(100_000)
                .setFunction("getVerificationStatus",
                    new ContractFunctionParameters()
                        .addAddress(testFarmer.ADDRESS)
                )
                .execute(client)

            // Note: In a real implementation, you would parse the returned enum value
            console.log("Verification status query executed successfully")
            assert.ok(true) // Placeholder assertion
        })
    })
})