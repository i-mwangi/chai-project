import { describe, it, expect } from 'vitest'

// Validation functions (extracted from the API for testing)
function validateAddress(address: string): boolean {
    // Accept either Ethereum-style 0x... addresses or Hedera account IDs like 0.0.123456
    const eth = /^0x[a-fA-F0-9]{40}$/.test(address)
    const hedera = /^\d+\.\d+\.\d+$/.test(address)
    return eth || hedera
}

function validateDocumentHash(hash: string): boolean {
    return /^Qm[1-9A-HJ-NP-Za-km-z]{44,}$/.test(hash) || 
           /^baf[a-z2-7]{56,}$/.test(hash) || 
           /^[a-fA-F0-9]{64}$/.test(hash)
}

describe("Address Validation", () => {
    it("should validate correct Ethereum addresses", () => {
        expect(validateAddress("0x1234567890123456789012345678901234567890")).toBe(true)
        expect(validateAddress("0xabcdefABCDEF1234567890123456789012345678")).toBe(true)
    })

    it("should reject invalid addresses", () => {
        expect(validateAddress("invalid-address")).toBe(false)
        expect(validateAddress("0x123")).toBe(false)
        expect(validateAddress("1234567890123456789012345678901234567890")).toBe(false)
    })
})

describe("Document Hash Validation", () => {
    it("should validate IPFS hashes", () => {
        expect(validateDocumentHash("QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG")).toBe(true)
    })

    it("should validate SHA256 hashes", () => {
        expect(validateDocumentHash("a".repeat(64))).toBe(true)
    })

    it("should reject invalid hashes", () => {
        expect(validateDocumentHash("invalid-hash")).toBe(false)
        expect(validateDocumentHash("Qm123")).toBe(false)
    })
})