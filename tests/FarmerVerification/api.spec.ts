import { describe, test, beforeEach, afterEach } from "node:test"
import { strict as assert } from "node:assert"
import { createFarmerVerificationServer } from "../../api/farmer-verification"
import { db } from "../../db"
import { farmerVerifications, coffeeGroves } from "../../db/schema"
import { eq } from "drizzle-orm"

// Test configuration
const TEST_PORT = 3002
const BASE_URL = `http://localhost:${TEST_PORT}`

// Test data
const TEST_FARMER_ADDRESS = "0x1234567890123456789012345678901234567890"
const TEST_VERIFIER_ADDRESS = "0x0987654321098765432109876543210987654321"
const TEST_DOCUMENTS_HASH = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
const TEST_GROVE_NAME = "Test Coffee Grove"
const TEST_OWNERSHIP_PROOF = "QmTestOwnershipProofHashForGroveOwnership123456"

// Helper function to make HTTP requests
async function makeRequest(
    method: string, 
    path: string, 
    body?: any
): Promise<{ status: number; data: any }> {
    const url = `${BASE_URL}${path}`
    
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    }
    
    if (body) {
        options.body = JSON.stringify(body)
    }
    
    const response = await fetch(url, options)
    const data = await response.json()
    
    return {
        status: response.status,
        data
    }
}

// Clean up database before each test
async function cleanupDatabase() {
    await db.delete(farmerVerifications)
    await db.delete(coffeeGroves)
}

describe("Farmer Verification API Integration Tests", async () => {
    let server: any
    
    beforeEach(async () => {
        // Start server
        server = createFarmerVerificationServer(TEST_PORT)
        
        // Wait for server to start
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Clean database
        await cleanupDatabase()
    })
    
    afterEach(async () => {
        // Close server
        if (server) {
            server.close()
        }
        
        // Clean database
        await cleanupDatabase()
    })
    
    test("Health check endpoint should return success", async () => {
        const response = await makeRequest('GET', '/health')
        
        assert.equal(response.status, 200)
        assert.equal(response.data.success, true)
        assert.equal(response.data.message, 'Farmer Verification API is running')
    })
    
    describe("Document Submission", () => {
        test("Should successfully submit farmer verification documents", async () => {
            const requestBody = {
                farmerAddress: TEST_FARMER_ADDRESS,
                documentsHash: TEST_DOCUMENTS_HASH,
                location: "Costa Rica, Central Valley",
                coordinates: {
                    lat: 9.7489,
                    lng: -83.7534
                }
            }
            
            const response = await makeRequest('POST', '/api/farmer-verification/submit-documents', requestBody)
            
            assert.equal(response.status, 200)
            assert.equal(response.data.success, true)
            assert.equal(response.data.message, 'Documents submitted successfully')
            assert.equal(response.data.data.farmerAddress, TEST_FARMER_ADDRESS)
            assert.equal(response.data.data.status, 'pending')
            
            // Verify database record was created
            const dbRecord = await db.query.farmerVerifications.findFirst({
                where: eq(farmerVerifications.farmerAddress, TEST_FARMER_ADDRESS)
            })
            
            assert(dbRecord)
            assert.equal(dbRecord.farmerAddress, TEST_FARMER_ADDRESS)
            assert.equal(dbRecord.documentsHash, TEST_DOCUMENTS_HASH)
            assert.equal(dbRecord.verificationStatus, 'pending')
        })
        
        test("Should reject submission with invalid farmer address", async () => {
            const requestBody = {
                farmerAddress: "invalid-address",
                documentsHash: TEST_DOCUMENTS_HASH,
                location: "Costa Rica",
                coordinates: { lat: 9.7489, lng: -83.7534 }
            }
            
            const response = await makeRequest('POST', '/api/farmer-verification/submit-documents', requestBody)
            
            assert.equal(response.status, 400)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('Invalid farmer address format'))
        })
        
        test("Should reject submission with invalid coordinates", async () => {
            const requestBody = {
                farmerAddress: TEST_FARMER_ADDRESS,
                documentsHash: TEST_DOCUMENTS_HASH,
                location: "Costa Rica",
                coordinates: { lat: 200, lng: -83.7534 } // Invalid latitude
            }
            
            const response = await makeRequest('POST', '/api/farmer-verification/submit-documents', requestBody)
            
            assert.equal(response.status, 400)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('Invalid coordinates'))
        })
        
        test("Should reject submission with invalid IPFS hash", async () => {
            const requestBody = {
                farmerAddress: TEST_FARMER_ADDRESS,
                documentsHash: "invalid-hash",
                location: "Costa Rica",
                coordinates: { lat: 9.7489, lng: -83.7534 }
            }
            
            const response = await makeRequest('POST', '/api/farmer-verification/submit-documents', requestBody)
            
            assert.equal(response.status, 400)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('Invalid documents hash format'))
        })
        
        test("Should reject submission if farmer is already verified", async () => {
            // First, create a verified farmer record
            await db.insert(farmerVerifications).values({
                farmerAddress: TEST_FARMER_ADDRESS,
                documentsHash: TEST_DOCUMENTS_HASH,
                verificationStatus: 'verified',
                createdAt: Date.now()
            })
            
            const requestBody = {
                farmerAddress: TEST_FARMER_ADDRESS,
                documentsHash: "QmNewDocumentHash123456789012345678901234",
                location: "Costa Rica",
                coordinates: { lat: 9.7489, lng: -83.7534 }
            }
            
            const response = await makeRequest('POST', '/api/farmer-verification/submit-documents', requestBody)
            
            assert.equal(response.status, 409)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('already verified'))
        })
        
        test("Should update existing pending submission", async () => {
            // First submission
            const firstRequestBody = {
                farmerAddress: TEST_FARMER_ADDRESS,
                documentsHash: TEST_DOCUMENTS_HASH,
                location: "Costa Rica",
                coordinates: { lat: 9.7489, lng: -83.7534 }
            }
            
            await makeRequest('POST', '/api/farmer-verification/submit-documents', firstRequestBody)
            
            // Second submission with updated documents
            const newDocumentsHash = "QmUpdatedDocumentHash123456789012345678901"
            const secondRequestBody = {
                farmerAddress: TEST_FARMER_ADDRESS,
                documentsHash: newDocumentsHash,
                location: "Costa Rica, Updated Location",
                coordinates: { lat: 10.0, lng: -84.0 }
            }
            
            const response = await makeRequest('POST', '/api/farmer-verification/submit-documents', secondRequestBody)
            
            assert.equal(response.status, 200)
            assert.equal(response.data.success, true)
            
            // Verify database was updated
            const dbRecord = await db.query.farmerVerifications.findFirst({
                where: eq(farmerVerifications.farmerAddress, TEST_FARMER_ADDRESS)
            })
            
            assert(dbRecord)
            assert.equal(dbRecord.documentsHash, newDocumentsHash)
            assert.equal(dbRecord.verificationStatus, 'pending')
        })
    })
    
    describe("Farmer Verification", () => {
        beforeEach(async () => {
            // Create a pending farmer verification for testing
            await db.insert(farmerVerifications).values({
                farmerAddress: TEST_FARMER_ADDRESS,
                documentsHash: TEST_DOCUMENTS_HASH,
                verificationStatus: 'pending',
                createdAt: Date.now()
            })
        })
        
        test("Should successfully verify a farmer", async () => {
            const requestBody = {
                farmerAddress: TEST_FARMER_ADDRESS,
                approved: true,
                verifierAddress: TEST_VERIFIER_ADDRESS
            }
            
            const response = await makeRequest('POST', '/api/farmer-verification/verify', requestBody)
            
            assert.equal(response.status, 200)
            assert.equal(response.data.success, true)
            assert(response.data.message.includes('verified successfully'))
            assert.equal(response.data.data.status, 'verified')
            assert.equal(response.data.data.verifierAddress, TEST_VERIFIER_ADDRESS)
            
            // Verify database was updated
            const dbRecord = await db.query.farmerVerifications.findFirst({
                where: eq(farmerVerifications.farmerAddress, TEST_FARMER_ADDRESS)
            })
            
            assert(dbRecord)
            assert.equal(dbRecord.verificationStatus, 'verified')
            assert.equal(dbRecord.verifierAddress, TEST_VERIFIER_ADDRESS)
            assert(dbRecord.verificationDate)
        })
        
        test("Should successfully reject a farmer with reason", async () => {
            const rejectionReason = "Insufficient documentation provided"
            const requestBody = {
                farmerAddress: TEST_FARMER_ADDRESS,
                approved: false,
                rejectionReason,
                verifierAddress: TEST_VERIFIER_ADDRESS
            }
            
            const response = await makeRequest('POST', '/api/farmer-verification/verify', requestBody)
            
            assert.equal(response.status, 200)
            assert.equal(response.data.success, true)
            assert(response.data.message.includes('rejected successfully'))
            assert.equal(response.data.data.status, 'rejected')
            assert.equal(response.data.data.rejectionReason, rejectionReason)
            
            // Verify database was updated
            const dbRecord = await db.query.farmerVerifications.findFirst({
                where: eq(farmerVerifications.farmerAddress, TEST_FARMER_ADDRESS)
            })
            
            assert(dbRecord)
            assert.equal(dbRecord.verificationStatus, 'rejected')
            assert.equal(dbRecord.rejectionReason, rejectionReason)
        })
        
        test("Should reject verification without rejection reason when rejecting", async () => {
            const requestBody = {
                farmerAddress: TEST_FARMER_ADDRESS,
                approved: false,
                verifierAddress: TEST_VERIFIER_ADDRESS
                // Missing rejectionReason
            }
            
            const response = await makeRequest('POST', '/api/farmer-verification/verify', requestBody)
            
            assert.equal(response.status, 400)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('Rejection reason is required'))
        })
        
        test("Should reject verification of non-existent farmer", async () => {
            const nonExistentFarmer = "0x9999999999999999999999999999999999999999"
            const requestBody = {
                farmerAddress: nonExistentFarmer,
                approved: true,
                verifierAddress: TEST_VERIFIER_ADDRESS
            }
            
            const response = await makeRequest('POST', '/api/farmer-verification/verify', requestBody)
            
            assert.equal(response.status, 404)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('not found'))
        })
        
        test("Should reject verification of already verified farmer", async () => {
            // First, verify the farmer
            await db.update(farmerVerifications)
                .set({ verificationStatus: 'verified' })
                .where(eq(farmerVerifications.farmerAddress, TEST_FARMER_ADDRESS))
            
            const requestBody = {
                farmerAddress: TEST_FARMER_ADDRESS,
                approved: true,
                verifierAddress: TEST_VERIFIER_ADDRESS
            }
            
            const response = await makeRequest('POST', '/api/farmer-verification/verify', requestBody)
            
            assert.equal(response.status, 409)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('already verified'))
        })
    })
    
    describe("Verification Status Retrieval", () => {
        test("Should retrieve farmer verification status", async () => {
            // Create a verified farmer
            await db.insert(farmerVerifications).values({
                farmerAddress: TEST_FARMER_ADDRESS,
                documentsHash: TEST_DOCUMENTS_HASH,
                verificationStatus: 'verified',
                verifierAddress: TEST_VERIFIER_ADDRESS,
                verificationDate: Date.now(),
                createdAt: Date.now()
            })
            
            const response = await makeRequest('GET', `/api/farmer-verification/status/${TEST_FARMER_ADDRESS}`)
            
            assert.equal(response.status, 200)
            assert.equal(response.data.success, true)
            assert.equal(response.data.data.farmerAddress, TEST_FARMER_ADDRESS)
            assert.equal(response.data.data.status, 'verified')
            assert.equal(response.data.data.documentsHash, TEST_DOCUMENTS_HASH)
            assert.equal(response.data.data.verifierAddress, TEST_VERIFIER_ADDRESS)
            assert(response.data.data.verificationDate)
            assert(response.data.data.submissionDate)
        })
        
        test("Should return 404 for non-existent farmer", async () => {
            const nonExistentFarmer = "0x9999999999999999999999999999999999999999"
            const response = await makeRequest('GET', `/api/farmer-verification/status/${nonExistentFarmer}`)
            
            assert.equal(response.status, 404)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('not found'))
        })
        
        test("Should reject invalid farmer address format", async () => {
            const response = await makeRequest('GET', '/api/farmer-verification/status/invalid-address')
            
            assert.equal(response.status, 400)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('Invalid farmer address format'))
        })
    })
    
    describe("Grove Ownership Registration", () => {
        beforeEach(async () => {
            // Create a verified farmer for testing
            await db.insert(farmerVerifications).values({
                farmerAddress: TEST_FARMER_ADDRESS,
                documentsHash: TEST_DOCUMENTS_HASH,
                verificationStatus: 'verified',
                verifierAddress: TEST_VERIFIER_ADDRESS,
                verificationDate: Date.now(),
                createdAt: Date.now()
            })
        })
        
        test("Should successfully register grove ownership for verified farmer", async () => {
            const requestBody = {
                farmerAddress: TEST_FARMER_ADDRESS,
                groveName: TEST_GROVE_NAME,
                ownershipProofHash: TEST_OWNERSHIP_PROOF,
                verifierAddress: TEST_VERIFIER_ADDRESS
            }
            
            const response = await makeRequest('POST', '/api/farmer-verification/register-grove', requestBody)
            
            assert.equal(response.status, 201)
            assert.equal(response.data.success, true)
            assert(response.data.message.includes('registered successfully'))
            assert.equal(response.data.data.groveName, TEST_GROVE_NAME)
            assert.equal(response.data.data.farmerAddress, TEST_FARMER_ADDRESS)
            
            // Verify database record was created
            const dbRecord = await db.query.coffeeGroves.findFirst({
                where: eq(coffeeGroves.groveName, TEST_GROVE_NAME)
            })
            
            assert(dbRecord)
            assert.equal(dbRecord.groveName, TEST_GROVE_NAME)
            assert.equal(dbRecord.farmerAddress, TEST_FARMER_ADDRESS)
            assert.equal(dbRecord.verificationStatus, 'verified')
        })
        
        test("Should reject grove registration for unverified farmer", async () => {
            const unverifiedFarmer = "0x1111111111111111111111111111111111111111"
            
            // Create unverified farmer
            await db.insert(farmerVerifications).values({
                farmerAddress: unverifiedFarmer,
                documentsHash: TEST_DOCUMENTS_HASH,
                verificationStatus: 'pending',
                createdAt: Date.now()
            })
            
            const requestBody = {
                farmerAddress: unverifiedFarmer,
                groveName: TEST_GROVE_NAME,
                ownershipProofHash: TEST_OWNERSHIP_PROOF,
                verifierAddress: TEST_VERIFIER_ADDRESS
            }
            
            const response = await makeRequest('POST', '/api/farmer-verification/register-grove', requestBody)
            
            assert.equal(response.status, 403)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('must be verified'))
        })
        
        test("Should reject duplicate grove name registration", async () => {
            // First registration
            const requestBody = {
                farmerAddress: TEST_FARMER_ADDRESS,
                groveName: TEST_GROVE_NAME,
                ownershipProofHash: TEST_OWNERSHIP_PROOF,
                verifierAddress: TEST_VERIFIER_ADDRESS
            }
            
            await makeRequest('POST', '/api/farmer-verification/register-grove', requestBody)
            
            // Second registration with same grove name
            const response = await makeRequest('POST', '/api/farmer-verification/register-grove', requestBody)
            
            assert.equal(response.status, 409)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('already registered'))
        })
        
        test("Should reject registration for non-existent farmer", async () => {
            const nonExistentFarmer = "0x9999999999999999999999999999999999999999"
            const requestBody = {
                farmerAddress: nonExistentFarmer,
                groveName: TEST_GROVE_NAME,
                ownershipProofHash: TEST_OWNERSHIP_PROOF,
                verifierAddress: TEST_VERIFIER_ADDRESS
            }
            
            const response = await makeRequest('POST', '/api/farmer-verification/register-grove', requestBody)
            
            assert.equal(response.status, 403)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('must be verified'))
        })
    })
    
    describe("Pending Verifications Retrieval", () => {
        test("Should retrieve all pending verifications", async () => {
            // Create multiple farmers with different statuses
            const farmers = [
                {
                    farmerAddress: "0x1111111111111111111111111111111111111111",
                    documentsHash: "QmPending1Hash123456789012345678901234567",
                    verificationStatus: 'pending' as const,
                    createdAt: Date.now() - 1000
                },
                {
                    farmerAddress: "0x2222222222222222222222222222222222222222",
                    documentsHash: "QmPending2Hash123456789012345678901234567",
                    verificationStatus: 'pending' as const,
                    createdAt: Date.now() - 2000
                },
                {
                    farmerAddress: "0x3333333333333333333333333333333333333333",
                    documentsHash: "QmVerifiedHash123456789012345678901234567",
                    verificationStatus: 'verified' as const,
                    createdAt: Date.now() - 3000
                }
            ]
            
            for (const farmer of farmers) {
                await db.insert(farmerVerifications).values(farmer)
            }
            
            const response = await makeRequest('GET', '/api/farmer-verification/pending')
            
            assert.equal(response.status, 200)
            assert.equal(response.data.success, true)
            assert.equal(response.data.data.length, 2) // Only pending farmers
            
            // Verify the pending farmers are returned
            const pendingAddresses = response.data.data.map((f: any) => f.farmerAddress)
            assert(pendingAddresses.includes("0x1111111111111111111111111111111111111111"))
            assert(pendingAddresses.includes("0x2222222222222222222222222222222222222222"))
            assert(!pendingAddresses.includes("0x3333333333333333333333333333333333333333"))
        })
        
        test("Should return empty array when no pending verifications", async () => {
            const response = await makeRequest('GET', '/api/farmer-verification/pending')
            
            assert.equal(response.status, 200)
            assert.equal(response.data.success, true)
            assert.equal(response.data.data.length, 0)
        })
    })
    
    describe("File Upload Endpoint", () => {
        test("Should return not implemented for file upload", async () => {
            const response = await makeRequest('POST', '/api/farmer-verification/upload')
            
            assert.equal(response.status, 501)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('not implemented'))
        })
    })
    
    describe("Error Handling", () => {
        test("Should return 404 for unknown endpoints", async () => {
            const response = await makeRequest('GET', '/api/unknown-endpoint')
            
            assert.equal(response.status, 404)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('not found'))
        })
        
        test("Should handle CORS preflight requests", async () => {
            const response = await fetch(`${BASE_URL}/api/farmer-verification/submit-documents`, {
                method: 'OPTIONS'
            })
            
            assert.equal(response.status, 200)
            assert(response.headers.get('Access-Control-Allow-Origin'))
            assert(response.headers.get('Access-Control-Allow-Methods'))
            assert(response.headers.get('Access-Control-Allow-Headers'))
        })
        
        test("Should handle malformed JSON in request body", async () => {
            const response = await fetch(`${BASE_URL}/api/farmer-verification/submit-documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: 'invalid-json'
            })
            
            const data = await response.json()
            assert.equal(response.status, 500)
            assert.equal(data.success, false)
        })
    })
})