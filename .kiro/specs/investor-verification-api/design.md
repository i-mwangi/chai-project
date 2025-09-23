# Design Document

## Overview

The investor verification API will provide endpoints for investors to submit verification documents, check their verification status, and for administrators to manage the verification process. This system will follow the same architectural patterns as the existing farmer verification system while providing investor-specific functionality.

The API will integrate with the existing Coffee Tree Platform API server and use the same database infrastructure, adding new tables for investor verification data.

## Architecture

### API Layer
- RESTful endpoints following existing platform conventions
- Integration with the main API server (`api/server.ts`)
- Consistent error handling and response formatting
- CORS support for frontend integration

### Data Layer
- New database tables for investor verification data
- Integration with existing database schema and migration system
- Proper foreign key relationships and indexing

### Business Logic
- Document validation and storage
- Verification status management
- Access control based on verification levels
- Audit logging for compliance

## Components and Interfaces

### API Endpoints

#### 1. Submit Verification Documents
- **Endpoint:** `POST /api/investor-verification/submit-documents`
- **Purpose:** Allow investors to submit verification documents
- **Request Body:**
```typescript
{
  investorAddress: string
  documents: {
    identityDocument: string // Document hash or file reference
    proofOfAddress: string
    financialStatement?: string
    accreditationProof?: string
  }
  verificationType: 'basic' | 'accredited'
}
```
- **Response:**
```typescript
{
  success: boolean
  data?: {
    verificationId: string
    status: 'pending'
    submittedAt: number
    estimatedProcessingTime: string
  }
  error?: string
}
```

#### 2. Get Verification Status
- **Endpoint:** `GET /api/investor-verification/status/:investorAddress`
- **Purpose:** Retrieve current verification status for an investor
- **Response:**
```typescript
{
  success: boolean
  data?: {
    investorAddress: string
    status: 'unverified' | 'pending' | 'verified' | 'rejected' | 'expired'
    verificationType?: 'basic' | 'accredited'
    verificationDate?: number
    expiryDate?: number
    rejectionReason?: string
    documentsRequired?: string[]
    accessLevel: 'none' | 'limited' | 'full'
  }
  error?: string
}
```

#### 3. Get Pending Verifications (Admin)
- **Endpoint:** `GET /api/investor-verification/pending`
- **Purpose:** Retrieve all pending verification requests for admin review
- **Response:**
```typescript
{
  success: boolean
  data?: Array<{
    verificationId: string
    investorAddress: string
    verificationType: 'basic' | 'accredited'
    submittedAt: number
    documents: string[]
    priority: 'normal' | 'high'
  }>
  error?: string
}
```

#### 4. Process Verification (Admin)
- **Endpoint:** `POST /api/investor-verification/process`
- **Purpose:** Approve or reject verification requests
- **Request Body:**
```typescript
{
  verificationId: string
  action: 'approve' | 'reject'
  rejectionReason?: string
  verifierAddress: string
  verificationType?: 'basic' | 'accredited'
}
```

#### 5. Get Verification Metrics (Admin)
- **Endpoint:** `GET /api/investor-verification/metrics`
- **Purpose:** Retrieve verification statistics and metrics

### API Service Class

```typescript
export class InvestorVerificationAPI {
  async submitDocuments(req: EnhancedRequest, res: ServerResponse): Promise<void>
  async getVerificationStatus(req: EnhancedRequest, res: ServerResponse, investorAddress: string): Promise<void>
  async getPendingVerifications(req: EnhancedRequest, res: ServerResponse): Promise<void>
  async processVerification(req: EnhancedRequest, res: ServerResponse): Promise<void>
  async getVerificationMetrics(req: EnhancedRequest, res: ServerResponse): Promise<void>
  
  private validateDocuments(documents: any): ValidationResult
  private calculateAccessLevel(status: string, verificationType: string): AccessLevel
  private logVerificationEvent(event: VerificationEvent): Promise<void>
}
```

## Data Models

### Database Tables

#### investor_verifications
```sql
CREATE TABLE investor_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    investor_address TEXT UNIQUE NOT NULL,
    verification_status TEXT DEFAULT 'unverified',
    verification_type TEXT, -- 'basic' | 'accredited'
    documents_hash TEXT,
    identity_document_hash TEXT,
    proof_of_address_hash TEXT,
    financial_statement_hash TEXT,
    accreditation_proof_hash TEXT,
    verifier_address TEXT,
    verification_date INTEGER,
    expiry_date INTEGER,
    rejection_reason TEXT,
    access_level TEXT DEFAULT 'none',
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

#### investor_verification_history
```sql
CREATE TABLE investor_verification_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    verification_id INTEGER REFERENCES investor_verifications(id),
    previous_status TEXT,
    new_status TEXT,
    action_type TEXT, -- 'submit', 'approve', 'reject', 'expire', 'renew'
    verifier_address TEXT,
    reason TEXT,
    timestamp INTEGER DEFAULT (strftime('%s', 'now'))
);
```

#### investor_profiles
```sql
CREATE TABLE investor_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    investor_address TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT,
    phone TEXT,
    country TEXT,
    investor_type TEXT, -- 'individual', 'institutional', 'accredited'
    risk_tolerance TEXT, -- 'low', 'medium', 'high'
    investment_preferences TEXT, -- JSON
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

### TypeScript Interfaces

```typescript
interface InvestorVerification {
  id: number
  investorAddress: string
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected' | 'expired'
  verificationType?: 'basic' | 'accredited'
  documentsHash?: string
  identityDocumentHash?: string
  proofOfAddressHash?: string
  financialStatementHash?: string
  accreditationProofHash?: string
  verifierAddress?: string
  verificationDate?: number
  expiryDate?: number
  rejectionReason?: string
  accessLevel: 'none' | 'limited' | 'full'
  createdAt: number
  updatedAt: number
}

interface VerificationDocuments {
  identityDocument: string
  proofOfAddress: string
  financialStatement?: string
  accreditationProof?: string
}

interface AccessLevel {
  level: 'none' | 'limited' | 'full'
  maxInvestmentAmount?: number
  allowedFeatures: string[]
  restrictions: string[]
}
```

## Error Handling

### Validation Errors
- Missing required documents
- Invalid document formats
- Expired documents
- Invalid investor address format

### Business Logic Errors
- Duplicate verification submissions
- Invalid verification status transitions
- Unauthorized access attempts
- Expired verification attempts

### System Errors
- Database connection failures
- File storage errors
- External service failures

### Error Response Format
```typescript
{
  success: false,
  error: string,
  code?: string,
  details?: any
}
```

## Testing Strategy

### Unit Tests
- Document validation logic
- Status transition logic
- Access level calculation
- Database operations

### Integration Tests
- API endpoint functionality
- Database integration
- Error handling scenarios
- Authentication and authorization

### End-to-End Tests
- Complete verification workflow
- Frontend integration
- Admin approval process
- Status checking functionality

### Test Data
- Mock investor addresses
- Sample verification documents
- Various verification scenarios
- Edge cases and error conditions

## Security Considerations

### Document Security
- Secure document storage with encryption
- Document hash verification
- Access logging and audit trails
- Secure deletion of rejected documents

### Access Control
- Role-based access for admin functions
- Rate limiting for API endpoints
- Input validation and sanitization
- SQL injection prevention

### Privacy Protection
- Personal data encryption
- GDPR compliance considerations
- Data retention policies
- Secure data transmission

## Performance Considerations

### Database Optimization
- Proper indexing on frequently queried fields
- Efficient query patterns
- Connection pooling
- Query result caching

### API Performance
- Response time optimization
- Pagination for large result sets
- Efficient document handling
- Background processing for heavy operations

## Integration Points

### Frontend Integration
- Consistent with existing API patterns
- Error handling alignment
- Loading state management
- User feedback mechanisms

### Existing Systems
- Integration with farmer verification patterns
- Shared database infrastructure
- Common utility functions
- Consistent logging and monitoring