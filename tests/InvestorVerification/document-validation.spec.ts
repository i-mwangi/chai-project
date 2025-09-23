import { describe, it, expect } from 'vitest'

// Test utilities
class TestUtils {
    static generateValidDocumentHash(): string {
        return "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
    }

    static generateValidSHA256Hash(): string {
        return "a".repeat(64)
    }

    static generateValidIPFSv1Hash(): string {
        return "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
    }

    static generateInvalidHash(): string {
        return "invalid-hash-format"
    }

    static generateShortHash(): string {
        return "Qm123"
    }

    static generateWrongPrefixHash(): string {
        return "XmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
    }
}

// Validation functions (extracted from API for testing)
function validateDocumentHash(hash: string): boolean {
    // IPFS v0 hash (Qm...) or v1 hash (baf...) or SHA256 hex hash
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

// Document validation tests
describe("Investor Verification - Document Validation", () => {
    it("should validate required documents for basic verification", () => {
        const documents = {
            identityDocument: TestUtils.generateValidDocumentHash(),
            proofOfAddress: TestUtils.generateValidDocumentHash()
        }

        const result = validateDocuments(documents, 'basic')
        
        expect(result.isValid).toBe(true)
        expect(result.errors.length).toBe(0)
    })

    it("should validate required documents for accredited verification", () => {
        const documents = {
            identityDocument: TestUtils.generateValidDocumentHash(),
            proofOfAddress: TestUtils.generateValidDocumentHash(),
            financialStatement: TestUtils.generateValidDocumentHash(),
            accreditationProof: TestUtils.generateValidDocumentHash()
        }

        const result = validateDocuments(documents, 'accredited')
        
        expect(result.isValid).toBe(true)
        expect(result.errors.length).toBe(0)
    })

    it("should reject basic verification with missing identity document", () => {
        const documents = {
            proofOfAddress: TestUtils.generateValidDocumentHash()
        }

        const result = validateDocuments(documents, 'basic')
        
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Identity document is required')
    })

    it("should reject basic verification with missing proof of address", () => {
        const documents = {
            identityDocument: TestUtils.generateValidDocumentHash()
        }

        const result = validateDocuments(documents, 'basic')
        
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Proof of address is required')
    })

    it("should reject accredited verification with missing financial statement", () => {
        const documents = {
            identityDocument: TestUtils.generateValidDocumentHash(),
            proofOfAddress: TestUtils.generateValidDocumentHash(),
            accreditationProof: TestUtils.generateValidDocumentHash()
        }

        const result = validateDocuments(documents, 'accredited')
        
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Financial statement is required for accredited verification')
    })

    it("should reject accredited verification with missing accreditation proof", () => {
        const documents = {
            identityDocument: TestUtils.generateValidDocumentHash(),
            proofOfAddress: TestUtils.generateValidDocumentHash(),
            financialStatement: TestUtils.generateValidDocumentHash()
        }

        const result = validateDocuments(documents, 'accredited')
        
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Accreditation proof is required for accredited verification')
    })

    it("should validate IPFS hash format", () => {
        const validIPFSHash = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
        const documents = {
            identityDocument: validIPFSHash,
            proofOfAddress: validIPFSHash
        }

        const result = validateDocuments(documents, 'basic')
        
        expect(result.isValid).toBe(true)
    })

    it("should validate SHA256 hash format", () => {
        const validSHA256Hash = TestUtils.generateValidSHA256Hash()
        const documents = {
            identityDocument: validSHA256Hash,
            proofOfAddress: validSHA256Hash
        }

        const result = validateDocuments(documents, 'basic')
        
        expect(result.isValid).toBe(true)
    })

    it("should reject invalid document hash formats", () => {
        const documents = {
            identityDocument: "invalid-hash",
            proofOfAddress: TestUtils.generateValidDocumentHash()
        }

        const result = validateDocuments(documents, 'basic')
        
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Invalid identity document hash format')
    })

    it("should validate IPFS v1 hash format", () => {
        const validIPFSv1Hash = TestUtils.generateValidIPFSv1Hash()
        const documents = {
            identityDocument: validIPFSv1Hash,
            proofOfAddress: validIPFSv1Hash
        }

        const result = validateDocuments(documents, 'basic')
        
        expect(result.isValid).toBe(true)
    })

    it("should reject short IPFS hashes", () => {
        const documents = {
            identityDocument: TestUtils.generateShortHash(),
            proofOfAddress: TestUtils.generateValidDocumentHash()
        }

        const result = validateDocuments(documents, 'basic')
        
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Invalid identity document hash format')
    })

    it("should reject IPFS hashes with wrong prefix", () => {
        const documents = {
            identityDocument: TestUtils.generateWrongPrefixHash(),
            proofOfAddress: TestUtils.generateValidDocumentHash()
        }

        const result = validateDocuments(documents, 'basic')
        
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Invalid identity document hash format')
    })

    it("should handle multiple validation errors", () => {
        const documents = {
            identityDocument: "invalid-hash",
            proofOfAddress: "another-invalid-hash"
        }

        const result = validateDocuments(documents, 'basic')
        
        expect(result.isValid).toBe(false)
        expect(result.errors.length).toBe(2)
        expect(result.errors).toContain('Invalid identity document hash format')
        expect(result.errors).toContain('Invalid proof of address hash format')
    })

    it("should handle accredited verification with all invalid documents", () => {
        const documents = {
            identityDocument: "invalid1",
            proofOfAddress: "invalid2",
            financialStatement: "invalid3",
            accreditationProof: "invalid4"
        }

        const result = validateDocuments(documents, 'accredited')
        
        expect(result.isValid).toBe(false)
        expect(result.errors.length).toBe(4)
        expect(result.errors).toContain('Invalid identity document hash format')
        expect(result.errors).toContain('Invalid proof of address hash format')
        expect(result.errors).toContain('Invalid financial statement hash format')
        expect(result.errors).toContain('Invalid accreditation proof hash format')
    })

    it("should handle mixed valid and invalid documents", () => {
        const documents = {
            identityDocument: TestUtils.generateValidDocumentHash(),
            proofOfAddress: "invalid-hash",
            financialStatement: TestUtils.generateValidDocumentHash(),
            accreditationProof: "another-invalid"
        }

        const result = validateDocuments(documents, 'accredited')
        
        expect(result.isValid).toBe(false)
        expect(result.errors.length).toBe(2)
        expect(result.errors).toContain('Invalid proof of address hash format')
        expect(result.errors).toContain('Invalid accreditation proof hash format')
    })

    it("should validate empty documents object", () => {
        const documents = {}

        const result = validateDocuments(documents, 'basic')
        
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Identity document is required')
        expect(result.errors).toContain('Proof of address is required')
    })

    it("should validate null documents", () => {
        const documents = {
            identityDocument: null,
            proofOfAddress: null
        }

        const result = validateDocuments(documents, 'basic')
        
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Identity document is required')
        expect(result.errors).toContain('Proof of address is required')
    })

    it("should validate undefined documents", () => {
        const documents = {
            identityDocument: undefined,
            proofOfAddress: undefined
        }

        const result = validateDocuments(documents, 'basic')
        
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Identity document is required')
        expect(result.errors).toContain('Proof of address is required')
    })

    it("should allow optional documents for basic verification", () => {
        const documentsWithOptional = {
            identityDocument: TestUtils.generateValidDocumentHash(),
            proofOfAddress: TestUtils.generateValidDocumentHash(),
            financialStatement: TestUtils.generateValidDocumentHash(), // Optional for basic
            accreditationProof: TestUtils.generateValidDocumentHash()  // Optional for basic
        }

        const result = validateDocuments(documentsWithOptional, 'basic')
        
        expect(result.isValid).toBe(true)
        expect(result.errors.length).toBe(0)
    })
})