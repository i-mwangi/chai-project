#!/usr/bin/env node

/**
 * Simple test API server for investor verification endpoint testing
 */

import { createServer } from 'http';
import { parse } from 'url';

const PORT = 3001;

// Mock database operations for testing
const mockDatabase = {
    investorVerifications: new Map(),
    investorVerificationHistory: new Map(),
    nextId: 1
};

// Utility functions
function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
}

function sendError(res, statusCode, message) {
    sendResponse(res, statusCode, { success: false, error: message });
}

// Parse request body
function parseRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

// Validation functions
function validateAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function validateDocumentHash(hash) {
    return /^Qm[1-9A-HJ-NP-Za-km-z]{44,}$/.test(hash) || 
           /^baf[a-z2-7]{56,}$/.test(hash) || 
           /^[a-fA-F0-9]{64}$/.test(hash);
}

// Document validation
function validateDocuments(documents, verificationType) {
    const errors = [];
    
    if (!documents.identityDocument) {
        errors.push('Identity document is required');
    } else if (!validateDocumentHash(documents.identityDocument)) {
        errors.push('Invalid identity document hash format');
    }
    
    if (!documents.proofOfAddress) {
        errors.push('Proof of address is required');
    } else if (!validateDocumentHash(documents.proofOfAddress)) {
        errors.push('Invalid proof of address hash format');
    }
    
    if (verificationType === 'accredited') {
        if (!documents.financialStatement) {
            errors.push('Financial statement is required for accredited verification');
        } else if (!validateDocumentHash(documents.financialStatement)) {
            errors.push('Invalid financial statement hash format');
        }
        
        if (!documents.accreditationProof) {
            errors.push('Accreditation proof is required for accredited verification');
        } else if (!validateDocumentHash(documents.accreditationProof)) {
            errors.push('Invalid accreditation proof hash format');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Submit documents endpoint
async function submitDocuments(req, res) {
    try {
        const body = req.body;
        
        // Validate required fields
        if (!body.investorAddress || !body.documents || !body.verificationType) {
            return sendError(res, 400, 'Missing required fields: investorAddress, documents, verificationType');
        }
        
        // Validate investor address format
        if (!validateAddress(body.investorAddress)) {
            return sendError(res, 400, 'Invalid investor address format');
        }
        
        // Validate verification type
        if (!['basic', 'accredited'].includes(body.verificationType)) {
            return sendError(res, 400, 'Invalid verification type. Must be "basic" or "accredited"');
        }
        
        // Validate documents
        const validationResult = validateDocuments(body.documents, body.verificationType);
        if (!validationResult.isValid) {
            return sendError(res, 400, `Document validation failed: ${validationResult.errors.join(', ')}`);
        }
        
        // Check if investor already has a verified submission
        const existingInvestor = mockDatabase.investorVerifications.get(body.investorAddress);
        
        if (existingInvestor && existingInvestor.verificationStatus === 'verified') {
            return sendError(res, 409, 'Investor is already verified');
        }
        
        const currentTime = Date.now();
        const verificationId = mockDatabase.nextId++;
        
        // Store investor data
        const investorData = {
            id: verificationId,
            investorAddress: body.investorAddress,
            verificationStatus: 'pending',
            verificationType: body.verificationType,
            documentsHash: JSON.stringify(body.documents),
            identityDocumentHash: body.documents.identityDocument,
            proofOfAddressHash: body.documents.proofOfAddress,
            financialStatementHash: body.documents.financialStatement || null,
            accreditationProofHash: body.documents.accreditationProof || null,
            accessLevel: 'none',
            createdAt: currentTime,
            updatedAt: currentTime
        };
        
        mockDatabase.investorVerifications.set(body.investorAddress, investorData);
        
        // Log verification event
        const historyEntry = {
            id: mockDatabase.nextId++,
            verificationId,
            previousStatus: existingInvestor?.verificationStatus || null,
            newStatus: 'pending',
            actionType: 'submit',
            verifierAddress: body.investorAddress,
            timestamp: currentTime
        };
        
        mockDatabase.investorVerificationHistory.set(historyEntry.id, historyEntry);
        
        sendResponse(res, 200, {
            success: true,
            message: 'Documents submitted successfully',
            data: {
                verificationId: verificationId.toString(),
                investorAddress: body.investorAddress,
                status: 'pending',
                submittedAt: currentTime,
                estimatedProcessingTime: '3-5 business days'
            }
        });
        
    } catch (error) {
        console.error('Error submitting documents:', error);
        sendError(res, 500, 'Internal server error');
    }
}

// Create server
const server = createServer(async (req, res) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end();
        return;
    }
    
    const parsedUrl = parse(req.url || '', true);
    const pathname = parsedUrl.pathname || '';
    const method = req.method || 'GET';
    
    // Parse request body for POST/PUT requests
    if (method === 'POST' || method === 'PUT') {
        try {
            req.body = await parseRequestBody(req);
        } catch (error) {
            sendError(res, 400, 'Invalid JSON in request body');
            return;
        }
    }
    
    try {
        if (pathname === '/health' && method === 'GET') {
            sendResponse(res, 200, { 
                success: true, 
                message: 'Test API server is running',
                timestamp: new Date().toISOString()
            });
        } else if (pathname === '/api/investor-verification/submit-documents' && method === 'POST') {
            await submitDocuments(req, res);
        } else {
            sendError(res, 404, 'Endpoint not found');
        }
    } catch (error) {
        console.error('Server error:', error);
        sendError(res, 500, 'Internal server error');
    }
});

server.listen(PORT, () => {
    console.log(`Test API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Submit documents: POST http://localhost:${PORT}/api/investor-verification/submit-documents`);
});