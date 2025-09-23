import { describe, test, beforeEach, afterEach } from "node:test"
import { strict as assert } from "node:assert"
import { createServer, IncomingMessage, ServerResponse } from 'http'
import { parse } from 'url'
import { InvestorVerificationAPI } from "../../api/investor-verification"
import { db } from "../../db"
import { investorVerifications, investorVerificationHistory } from "../../db/schema"
import { eq } from "drizzle-orm"

// Test configuration
const TEST_PORT = 3003
const BASE_URL = `http://localhost:${TEST_PORT}`
const ADMIN_TOKEN = 'admin-secret-token'

// Test data
const TEST_INVESTOR_ADDRESS = "0x1234567890123456789012345678901234567890"
const TEST_VERIFIER_ADDRESS = "0x0987654321098765432109876543210987654321"
const TEST_DOCUMENTS = {
    identityDocument: "QmIdentityDoc123456789012345678901234567890",
    proofOfAddress: "QmProofOfAddress123456789012345678901234567",
    financialStatement: "QmFinancialStatement123456789012345678901",
    accreditationProof: "QmAccreditationProof123456789012345678901"
}

// Enhanced request interface
interface EnhancedRequest extends IncomingMessage {
    body?: any
    params?: { [key: string]: string }
    query?: { [key: string]: string | string[] | undefined }
}

// Helper function to parse request body
function parseRequestBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
        let body = ''
        req.on('data', chunk => {
            body += chunk.toString()
        })
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {})
            } catch (error) {
                reject(error)
            }
        })
        req.on('error', reject)
    })
}

// Create test server
function createTestServer(port: number) {
    const investorVerificationAPI = new InvestorVerificationAPI()
    
    const server = createServer(async (req: EnhancedRequest, res: ServerResponse) => {
        // Handle CORS preflight requests
        if (req.method === 'OPTIONS') {
            res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            })
            res.end()
            return
        }
        
        const parsedUrl = parse(req.url || '', true)
        const pathname = parsedUrl.pathname || ''
        const method = req.method || 'GET'
        
        // Parse request body for POST/PUT requests
        if (method === 'POST' || method === 'PUT') {
            try {
                req.body = await parseRequestBody(req)
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON in request body' }))
                return
            }
        }
        
        // Add query parameters
        req.query = parsedUrl.query
        
        try {
            if (pathname === '/api/investor-verification/pending' && method === 'GET') {
                await investorVerificationAPI.getPendingVerifications(req, res)
            } else if (pathname === '/api/investor-verification/process' && method === 'POST') {
                await investorVerificationAPI.processVerification(req, res)
            } else if (pathname === '/api/investor-verification/metrics' && method === 'GET') {
                await investorVerificationAPI.getVerificationMetrics(req, res)
            } else if (pathname === '/api/investor-verification/submit-documents' && method === 'POST') {
                await investorVerificationAPI.submitDocuments(req, res)
            } else if (pathname.startsWith('/api/investor-verification/status/') && method === 'GET') {
                const investorAddress = pathname.split('/').pop() || ''
                await investorVerificationAPI.getVerificationStatus(req, res, investorAddress)
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }))
            }
        } catch (error) {
            console.error('Server error:', error)
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, error: 'Internal server error' }))
        }
    })
    
    server.listen(port)
    return server
}

// Helper function to make HTTP requests
async function makeRequest(
    method: string, 
    path: string, 
    body?: any,
    headers?: Record<string, string>
): Promise<{ status: number; data: any }> {
    const url = `${BASE_URL}${path}`
    
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
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
    await db.delete(investorVerificationHistory)
    await db.delete(investorVerifications)
}

describe("Investor Verification Admin Endpoints", async () => {
    let server: any
    
    beforeEach(async () => {
        // Start server
        server = createTestServer(TEST_PORT)
        
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
    
    describe("Admin Authorization", () => {
        test("Should reject access to pending verifications without authorization", async () => {
            const response = await makeRequest('GET', '/api/investor-verification/pending')
            
            assert.equal(response.status, 401)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('Missing Authorization header'))
        })
        
        test("Should reject access with invalid admin token", async () => {
            const response = await makeRequest('GET', '/api/investor-verification/pending', null, {
                'Authorization': 'Bearer invalid-token'
            })
            
            assert.equal(response.status, 401)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('Invalid admin token'))
        })
        
        test("Should allow access with valid admin token", async () => {
            const response = await makeRequest('GET', '/api/investor-verification/pending', null, {
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            })
            
            assert.equal(response.status, 200)
            assert.equal(response.data.success, true)
        })
        
        test("Should reject access to metrics without authorization", async () => {
            const response = await makeRequest('GET', '/api/investor-verification/metrics')
            
            assert.equal(response.status, 401)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('Missing Authorization header'))
        })
        
        test("Should reject access to process verification without authorization", async () => {
            const response = await makeRequest('POST', '/api/investor-verification/process', {
                verificationId: '1',
                action: 'approve',
                verifierAddress: TEST_VERIFIER_ADDRESS
            })
            
            assert.equal(response.status, 401)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('Missing Authorization header'))
        })
    })
    
    describe("Get Pending Verifications", () => {
        beforeEach(async () => {
            // Create test data with different verification statuses
            const testInvestors = [
                {
                    investorAddress: "0x1111111111111111111111111111111111111111",
                    verificationStatus: 'pending' as const,
                    verificationType: 'basic' as const,
                    identityDocumentHash: TEST_DOCUMENTS.identityDocument,
                    proofOfAddressHash: TEST_DOCUMENTS.proofOfAddress,
                    createdAt: Date.now() - 1000
                },
                {
                    investorAddress: "0x2222222222222222222222222222222222222222",
                    verificationStatus: 'pending' as const,
                    verificationType: 'accredited' as const,
                    identityDocumentHash: TEST_DOCUMENTS.identityDocument,
                    proofOfAddressHash: TEST_DOCUMENTS.proofOfAddress,
                    financialStatementHash: TEST_DOCUMENTS.financialStatement,
                    accreditationProofHash: TEST_DOCUMENTS.accreditationProof,
                    createdAt: Date.now() - 2000
                },
                {
                    investorAddress: "0x3333333333333333333333333333333333333333",
                    verificationStatus: 'verified' as const,
                    verificationType: 'basic' as const,
                    identityDocumentHash: TEST_DOCUMENTS.identityDocument,
                    proofOfAddressHash: TEST_DOCUMENTS.proofOfAddress,
                    createdAt: Date.now() - 3000
                }
            ]
            
            for (const investor of testInvestors) {
                await db.insert(investorVerifications).values(investor)
            }
        })
        
        test("Should return only pending verifications", async () => {
            const response = await makeRequest('GET', '/api/investor-verification/pending', null, {
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            })
            
            assert.equal(response.status, 200)
            assert.equal(response.data.success, true)
            assert.equal(response.data.data.length, 2) // Only pending investors
            
            // Verify the pending investors are returned
            const pendingAddresses = response.data.data.map((inv: any) => inv.investorAddress)
            assert(pendingAddresses.includes("0x1111111111111111111111111111111111111111"))
            assert(pendingAddresses.includes("0x2222222222222222222222222222222222222222"))
            assert(!pendingAddresses.includes("0x3333333333333333333333333333333333333333"))
            
            // Verify accredited investors have high priority
            const accreditedInvestor = response.data.data.find((inv: any) => 
                inv.investorAddress === "0x2222222222222222222222222222222222222222"
            )
            assert.equal(accreditedInvestor.priority, 'high')
            
            // Verify basic investors have normal priority
            const basicInvestor = response.data.data.find((inv: any) => 
                inv.investorAddress === "0x1111111111111111111111111111111111111111"
            )
            assert.equal(basicInvestor.priority, 'normal')
        })
        
        test("Should return empty array when no pending verifications", async () => {
            // Clean database to remove test data
            await cleanupDatabase()
            
            const response = await makeRequest('GET', '/api/investor-verification/pending', null, {
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            })
            
            assert.equal(response.status, 200)
            assert.equal(response.data.success, true)
            assert.equal(response.data.data.length, 0)
        })
    })
    
    describe("Process Verification", () => {
        let testVerificationId: number
        
        beforeEach(async () => {
            // Create a pending verification for testing
            const result = await db.insert(investorVerifications).values({
                investorAddress: TEST_INVESTOR_ADDRESS,
                verificationStatus: 'pending',
                verificationType: 'basic',
                identityDocumentHash: TEST_DOCUMENTS.identityDocument,
                proofOfAddressHash: TEST_DOCUMENTS.proofOfAddress,
                createdAt: Date.now()
            }).returning({ id: investorVerifications.id })
            
            testVerificationId = result[0].id
        })
        
        test("Should successfully approve a verification", async () => {
            const requestBody = {
                verificationId: testVerificationId.toString(),
                action: 'approve',
                verifierAddress: TEST_VERIFIER_ADDRESS
            }
            
            const response = await makeRequest('POST', '/api/investor-verification/process', requestBody, {
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            })
            
            assert.equal(response.status, 200)
            assert.equal(response.data.success, true)
            assert(response.data.message.includes('verified successfully'))
            assert.equal(response.data.data.status, 'verified')
            assert.equal(response.data.data.verifierAddress, TEST_VERIFIER_ADDRESS)
            assert(response.data.data.verificationDate)
            assert(response.data.data.expiryDate)
            
            // Verify database was updated
            const dbRecord = await db.query.investorVerifications.findFirst({
                where: eq(investorVerifications.id, testVerificationId)
            })
            
            assert(dbRecord)
            assert.equal(dbRecord.verificationStatus, 'verified')
            assert.equal(dbRecord.verifierAddress, TEST_VERIFIER_ADDRESS)
            assert.equal(dbRecord.accessLevel, 'limited') // Basic verification gets limited access
            assert(dbRecord.verificationDate)
            assert(dbRecord.expiryDate)
        })
        
        test("Should successfully reject a verification with reason", async () => {
            const rejectionReason = "Insufficient documentation provided"
            const requestBody = {
                verificationId: testVerificationId.toString(),
                action: 'reject',
                rejectionReason,
                verifierAddress: TEST_VERIFIER_ADDRESS
            }
            
            const response = await makeRequest('POST', '/api/investor-verification/process', requestBody, {
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            })
            
            assert.equal(response.status, 200)
            assert.equal(response.data.success, true)
            assert(response.data.message.includes('rejected successfully'))
            assert.equal(response.data.data.status, 'rejected')
            assert.equal(response.data.data.rejectionReason, rejectionReason)
            
            // Verify database was updated
            const dbRecord = await db.query.investorVerifications.findFirst({
                where: eq(investorVerifications.id, testVerificationId)
            })
            
            assert(dbRecord)
            assert.equal(dbRecord.verificationStatus, 'rejected')
            assert.equal(dbRecord.rejectionReason, rejectionReason)
            assert.equal(dbRecord.accessLevel, 'none')
        })
        
        test("Should log verification history for admin actions", async () => {
            const requestBody = {
                verificationId: testVerificationId.toString(),
                action: 'approve',
                verifierAddress: TEST_VERIFIER_ADDRESS
            }
            
            await makeRequest('POST', '/api/investor-verification/process', requestBody, {
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            })
            
            // Verify history was logged
            const historyRecord = await db.query.investorVerificationHistory.findFirst({
                where: eq(investorVerificationHistory.verificationId, testVerificationId)
            })
            
            assert(historyRecord)
            assert.equal(historyRecord.previousStatus, 'pending')
            assert.equal(historyRecord.newStatus, 'verified')
            assert.equal(historyRecord.actionType, 'approve')
            assert.equal(historyRecord.verifierAddress, TEST_VERIFIER_ADDRESS)
            assert(historyRecord.timestamp)
        })
        
        test("Should require rejection reason when rejecting", async () => {
            const requestBody = {
                verificationId: testVerificationId.toString(),
                action: 'reject',
                verifierAddress: TEST_VERIFIER_ADDRESS
                // Missing rejectionReason
            }
            
            const response = await makeRequest('POST', '/api/investor-verification/process', requestBody, {
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            })
            
            assert.equal(response.status, 400)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('Rejection reason is required'))
        })
        
        test("Should reject processing non-existent verification", async () => {
            const requestBody = {
                verificationId: '99999',
                action: 'approve',
                verifierAddress: TEST_VERIFIER_ADDRESS
            }
            
            const response = await makeRequest('POST', '/api/investor-verification/process', requestBody, {
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            })
            
            assert.equal(response.status, 404)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('not found'))
        })
        
        test("Should reject processing already verified investor", async () => {
            // First, approve the verification
            await db.update(investorVerifications)
                .set({ verificationStatus: 'verified' })
                .where(eq(investorVerifications.id, testVerificationId))
            
            const requestBody = {
                verificationId: testVerificationId.toString(),
                action: 'approve',
                verifierAddress: TEST_VERIFIER_ADDRESS
            }
            
            const response = await makeRequest('POST', '/api/investor-verification/process', requestBody, {
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            })
            
            assert.equal(response.status, 409)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('already verified'))
        })
        
        test("Should validate required fields", async () => {
            const requestBody = {
                // Missing required fields
            }
            
            const response = await makeRequest('POST', '/api/investor-verification/process', requestBody, {
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            })
            
            assert.equal(response.status, 400)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('Missing required fields'))
        })
        
        test("Should validate verifier address format", async () => {
            const requestBody = {
                verificationId: testVerificationId.toString(),
                action: 'approve',
                verifierAddress: 'invalid-address'
            }
            
            const response = await makeRequest('POST', '/api/investor-verification/process', requestBody, {
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            })
            
            assert.equal(response.status, 400)
            assert.equal(response.data.success, false)
            assert(response.data.error.includes('Invalid verifier address format'))
        })
    })
    
    describe("Get Verification Metrics", () => {
        beforeEach(async () => {
            // Create test data with various verification statuses and types
            const testInvestors = [
                {
                    investorAddress: "0x1111111111111111111111111111111111111111",
                    verificationStatus: 'verified' as const,
                    verificationType: 'basic' as const,
                    verificationDate: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago
                    expiryDate: Date.now() + (2 * 365 * 24 * 60 * 60 * 1000), // 2 years from now
                    createdAt: Date.now() - (7 * 24 * 60 * 60 * 1000) // 7 days ago
                },
                {
                    investorAddress: "0x2222222222222222222222222222222222222222",
                    verificationStatus: 'verified' as const,
                    verificationType: 'accredited' as const,
                    verificationDate: Date.now() - (3 * 24 * 60 * 60 * 1000), // 3 days ago
                    expiryDate: Date.now() + (2 * 365 * 24 * 60 * 60 * 1000), // 2 years from now
                    createdAt: Date.now() - (4 * 24 * 60 * 60 * 1000) // 4 days ago
                },
                {
                    investorAddress: "0x3333333333333333333333333333333333333333",
                    verificationStatus: 'pending' as const,
                    verificationType: 'basic' as const,
                    createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000) // 2 days ago
                },
                {
                    investorAddress: "0x4444444444444444444444444444444444444444",
                    verificationStatus: 'rejected' as const,
                    verificationType: 'basic' as const,
                    rejectionReason: 'Insufficient documentation',
                    createdAt: Date.now() - (10 * 24 * 60 * 60 * 1000) // 10 days ago
                }
            ]
            
            for (const investor of testInvestors) {
                await db.insert(investorVerifications).values(investor)
            }
        })
        
        test("Should return comprehensive verification metrics", async () => {
            const response = await makeRequest('GET', '/api/investor-verification/metrics', null, {
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            })
            
            assert.equal(response.status, 200)
            assert.equal(response.data.success, true)
            
            const { statistics, processingMetrics, recentActivity } = response.data.data
            
            // Verify statistics
            assert.equal(statistics.total, 4)
            assert.equal(statistics.verified, 2)
            assert.equal(statistics.pending, 1)
            assert.equal(statistics.rejected, 1)
            assert.equal(statistics.basic, 3)
            assert.equal(statistics.accredited, 1)
            
            // Verify processing metrics
            assert(processingMetrics.averageProcessingTimeMs > 0)
            assert(processingMetrics.averageProcessingTimeDays > 0)
            assert.equal(processingMetrics.approvalRate, 66.7) // 2 approved out of 3 processed (2 approved + 1 rejected)
            assert.equal(processingMetrics.totalProcessed, 2)
            
            // Verify recent activity
            assert.equal(recentActivity.last30Days, 4) // All created within 30 days
            assert.equal(recentActivity.pendingReview, 1)
            assert.equal(recentActivity.expiringVerifications, 0) // None expiring in next 30 days
        })
        
        test("Should handle empty metrics correctly", async () => {
            // Clean database to remove test data
            await cleanupDatabase()
            
            const response = await makeRequest('GET', '/api/investor-verification/metrics', null, {
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            })
            
            assert.equal(response.status, 200)
            assert.equal(response.data.success, true)
            
            const { statistics, processingMetrics, recentActivity } = response.data.data
            
            // Verify empty statistics
            assert.equal(statistics.total, 0)
            assert.equal(statistics.verified, 0)
            assert.equal(statistics.pending, 0)
            assert.equal(statistics.rejected, 0)
            
            // Verify empty processing metrics
            assert.equal(processingMetrics.averageProcessingTimeMs, 0)
            assert.equal(processingMetrics.approvalRate, 0)
            assert.equal(processingMetrics.totalProcessed, 0)
            
            // Verify empty recent activity
            assert.equal(recentActivity.last30Days, 0)
            assert.equal(recentActivity.pendingReview, 0)
        })
    })
})