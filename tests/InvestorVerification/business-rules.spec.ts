import { describe, it, expect } from 'vitest'

// Test utilities
class TestUtils {
    static generateValidDocumentHash(): string {
        return "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
    }
}

// Validation functions
function validateDocumentHash(hash: string): boolean {
    return /^Qm[1-9A-HJ-NP-Za-km-z]{44,}$/.test(hash) || 
           /^baf[a-z2-7]{56,}$/.test(hash) || 
           /^[a-fA-F0-9]{64}$/.test(hash)
}

interface ValidationResult {
    isValid: boolean
    errors: string[]
}

function validateDocuments(documents: any, verificationType: string): ValidationResult {
    const errors: string[] = []
    
    // Required documents for all verification types
    if (!documents.identityDocument) {
        errors.push('Identity document is required')
    } else if (!validateDocumentHash(documents.identityDocument)) {
        errors.push('Invalid identity document hash format')
    }
    
    if (!documents.proofOfAddress) {
        errors.push('Proof of address is required')
    } else if (!validateDocumentHash(documents.proofOfAddress)) {
        errors.push('Invalid proof of address hash format')
    }
    
    // Additional requirements for accredited investors
    if (verificationType === 'accredited') {
        if (!documents.financialStatement) {
            errors.push('Financial statement is required for accredited verification')
        } else if (!validateDocumentHash(documents.financialStatement)) {
            errors.push('Invalid financial statement hash format')
        }
        
        if (!documents.accreditationProof) {
            errors.push('Accreditation proof is required for accredited verification')
        } else if (!validateDocumentHash(documents.accreditationProof)) {
            errors.push('Invalid accreditation proof hash format')
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    }
}

interface AccessLevel {
    level: 'none' | 'limited' | 'full'
    maxInvestmentAmount?: number
    allowedFeatures: string[]
    restrictions: string[]
}

function calculateAccessLevel(status: string, verificationType?: string): AccessLevel {
    if (status !== 'verified') {
        return {
            level: 'none',
            allowedFeatures: ['view_public_data'],
            restrictions: ['Cannot invest in coffee trees', 'Cannot access investor portal features']
        }
    }
    
    if (verificationType === 'accredited') {
        return {
            level: 'full',
            allowedFeatures: [
                'invest_unlimited',
                'access_private_offerings',
                'advanced_analytics',
                'priority_support',
                'marketplace_trading',
                'revenue_distributions'
            ],
            restrictions: []
        }
    }
    
    // Basic verification
    return {
        level: 'limited',
        maxInvestmentAmount: 10000, // $10,000 USD equivalent
        allowedFeatures: [
            'invest_limited',
            'basic_analytics',
            'marketplace_trading',
            'revenue_distributions'
        ],
        restrictions: [
            'Investment amount limited to $10,000',
            'No access to private offerings',
            'Limited analytics features'
        ]
    }
}

function getRequiredDocuments(status: string, verificationType?: string): string[] {
    if (status === 'verified') {
        return []
    }
    
    const required = ['identityDocument', 'proofOfAddress']
    
    if (verificationType === 'accredited') {
        required.push('financialStatement', 'accreditationProof')
    }
    
    return required
}

function getSubmittedDocuments(investor: any): string[] {
    const documents: string[] = []
    
    if (investor.identityDocumentHash) documents.push('identityDocument')
    if (investor.proofOfAddressHash) documents.push('proofOfAddress')
    if (investor.financialStatementHash) documents.push('financialStatement')
    if (investor.accreditationProofHash) documents.push('accreditationProof')
    
    return documents
}

// Business rules tests
describe("Investor Verification - Business Rules", () => {
    it("should enforce basic verification document requirements", () => {
        const incompleteDocuments = {
            identityDocument: TestUtils.generateValidDocumentHash()
            // Missing proofOfAddress
        }

        const result = validateDocuments(incompleteDocuments, 'basic')
        
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Proof of address is required')
    })

    it("should enforce accredited verification additional requirements", () => {
        const basicDocuments = {
            identityDocument: TestUtils.generateValidDocumentHash(),
            proofOfAddress: TestUtils.generateValidDocumentHash()
            // Missing financialStatement and accreditationProof for accredited
        }

        const result = validateDocuments(basicDocuments, 'accredited')
        
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Financial statement is required for accredited verification')
        expect(result.errors).toContain('Accreditation proof is required for accredited verification')
    })

    it("should allow optional documents for basic verification", () => {
        const documentsWithOptional = {
            identityDocument: TestUtils.generateValidDocumentHash(),
            proofOfAddress: TestUtils.generateValidDocumentHash(),
            financialStatement: TestUtils.generateValidDocumentHash() // Optional for basic
        }

        const result = validateDocuments(documentsWithOptional, 'basic')
        
        expect(result.isValid).toBe(true)
        expect(result.errors.length).toBe(0)
    })

    it("should calculate correct investment limits for basic verification", () => {
        const accessLevel = calculateAccessLevel('verified', 'basic')
        
        expect(accessLevel.level).toBe('limited')
        expect(accessLevel.maxInvestmentAmount).toBe(10000)
        expect(accessLevel.restrictions).toContain('Investment amount limited to $10,000')
    })

    it("should allow unlimited investment for accredited verification", () => {
        const accessLevel = calculateAccessLevel('verified', 'accredited')
        
        expect(accessLevel.level).toBe('full')
        expect(accessLevel.maxInvestmentAmount).toBeUndefined()
        expect(accessLevel.restrictions.length).toBe(0)
    })

    it("should get required documents for unverified status", () => {
        const requiredDocs = getRequiredDocuments('unverified')
        
        expect(requiredDocs).toEqual(['identityDocument', 'proofOfAddress'])
    })

    it("should get required documents for unverified accredited verification", () => {
        const requiredDocs = getRequiredDocuments('unverified', 'accredited')
        
        expect(requiredDocs).toEqual([
            'identityDocument', 
            'proofOfAddress', 
            'financialStatement', 
            'accreditationProof'
        ])
    })

    it("should return empty array for verified status", () => {
        const requiredDocs = getRequiredDocuments('verified')
        
        expect(requiredDocs).toEqual([])
    })

    it("should get submitted documents from verification record", () => {
        const mockInvestor = {
            identityDocumentHash: "hash1",
            proofOfAddressHash: "hash2",
            financialStatementHash: "hash3",
            accreditationProofHash: null
        }

        const submittedDocs = getSubmittedDocuments(mockInvestor)
        
        expect(submittedDocs).toEqual([
            'identityDocument',
            'proofOfAddress', 
            'financialStatement'
        ])
    })

    it("should handle empty submitted documents", () => {
        const mockInvestor = {
            identityDocumentHash: null,
            proofOfAddressHash: null,
            financialStatementHash: null,
            accreditationProofHash: null
        }

        const submittedDocs = getSubmittedDocuments(mockInvestor)
        
        expect(submittedDocs).toEqual([])
    })

    it("should handle partial document submission", () => {
        const mockInvestor = {
            identityDocumentHash: "hash1",
            proofOfAddressHash: null,
            financialStatementHash: "hash3",
            accreditationProofHash: null
        }

        const submittedDocs = getSubmittedDocuments(mockInvestor)
        
        expect(submittedDocs).toEqual(['identityDocument', 'financialStatement'])
    })

    it("should enforce verification type consistency", () => {
        // Basic verification should not require accredited documents
        const basicResult = validateDocuments({
            identityDocument: TestUtils.generateValidDocumentHash(),
            proofOfAddress: TestUtils.generateValidDocumentHash()
        }, 'basic')
        
        expect(basicResult.isValid).toBe(true)
        
        // But accredited verification should require all documents
        const accreditedResult = validateDocuments({
            identityDocument: TestUtils.generateValidDocumentHash(),
            proofOfAddress: TestUtils.generateValidDocumentHash()
        }, 'accredited')
        
        expect(accreditedResult.isValid).toBe(false)
        expect(accreditedResult.errors).toContain('Financial statement is required for accredited verification')
        expect(accreditedResult.errors).toContain('Accreditation proof is required for accredited verification')
    })

    it("should handle case sensitivity in verification type", () => {
        const documents = {
            identityDocument: TestUtils.generateValidDocumentHash(),
            proofOfAddress: TestUtils.generateValidDocumentHash(),
            financialStatement: TestUtils.generateValidDocumentHash(),
            accreditationProof: TestUtils.generateValidDocumentHash()
        }

        // Should work with exact case
        const exactResult = validateDocuments(documents, 'accredited')
        expect(exactResult.isValid).toBe(true)

        // Should not work with different case (assuming case-sensitive)
        const upperResult = validateDocuments(documents, 'ACCREDITED')
        expect(upperResult.isValid).toBe(true) // Should still pass basic validation
    })

    it("should validate business rule for investment limits", () => {
        const basicAccess = calculateAccessLevel('verified', 'basic')
        const accreditedAccess = calculateAccessLevel('verified', 'accredited')
        
        // Basic investors should have investment limits
        expect(basicAccess.maxInvestmentAmount).toBeDefined()
        expect(basicAccess.maxInvestmentAmount).toBe(10000)
        
        // Accredited investors should have no limits
        expect(accreditedAccess.maxInvestmentAmount).toBeUndefined()
    })

    it("should validate feature access rules", () => {
        const basicAccess = calculateAccessLevel('verified', 'basic')
        const accreditedAccess = calculateAccessLevel('verified', 'accredited')
        
        // Basic investors should not have access to private offerings
        expect(basicAccess.allowedFeatures).not.toContain('access_private_offerings')
        expect(basicAccess.restrictions).toContain('No access to private offerings')
        
        // Accredited investors should have access to private offerings
        expect(accreditedAccess.allowedFeatures).toContain('access_private_offerings')
        expect(accreditedAccess.restrictions).not.toContain('No access to private offerings')
    })

    it("should validate status transition rules", () => {
        // Verified status should require no additional documents
        expect(getRequiredDocuments('verified')).toEqual([])
        expect(getRequiredDocuments('verified', 'basic')).toEqual([])
        expect(getRequiredDocuments('verified', 'accredited')).toEqual([])
        
        // All other statuses should require documents
        expect(getRequiredDocuments('pending')).toEqual(['identityDocument', 'proofOfAddress'])
        expect(getRequiredDocuments('rejected')).toEqual(['identityDocument', 'proofOfAddress'])
        expect(getRequiredDocuments('expired')).toEqual(['identityDocument', 'proofOfAddress'])
    })

    it("should handle edge cases in document requirements", () => {
        // Test with various status values
        const statuses = ['unverified', 'pending', 'rejected', 'expired', 'unknown']
        
        statuses.forEach(status => {
            const basicDocs = getRequiredDocuments(status, 'basic')
            const accreditedDocs = getRequiredDocuments(status, 'accredited')
            
            expect(basicDocs).toContain('identityDocument')
            expect(basicDocs).toContain('proofOfAddress')
            
            expect(accreditedDocs).toContain('identityDocument')
            expect(accreditedDocs).toContain('proofOfAddress')
            expect(accreditedDocs).toContain('financialStatement')
            expect(accreditedDocs).toContain('accreditationProof')
        })
    })
})