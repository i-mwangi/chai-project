# 💰 Investor Verification Document Requirements

## Overview
To ensure compliance with financial regulations and protect all platform participants, investors must complete a verification process by submitting required documents. This guide explains what documents are needed and how to prepare them.

## Required Documents

### 1. 🆔 Government-Issued Identity Document
**Purpose**: Verify your identity and legal status

**Accepted Documents**:
- National identity card
- Passport (any nationality)
- Driver's license
- State-issued ID card
- Military ID (if applicable)

**Requirements**:
- Must be current and not expired
- Photo must be clear and recognizable
- All text must be legible
- Must match the name on other documents

### 2. 🏠 Proof of Address
**Purpose**: Verify your current residential address

**Accepted Documents**:
- Utility bill (electricity, gas, water, internet)
- Bank statement
- Credit card statement
- Lease agreement or rental contract
- Government correspondence
- Insurance statement
- Property tax bill

**Requirements**:
- Must be dated within the last 3 months
- Must show your full name and address
- Must be from a recognized institution
- Address must match your identity document

### 3. 💼 Financial Information
**Purpose**: Verify your financial capacity and source of funds

**Accepted Documents**:
- Bank statement (last 3 months)
- Investment account statement
- Income verification letter
- Tax return or tax assessment
- Employment verification letter
- Business registration (if self-employed)
- Pension statement

**Requirements**:
- Must be recent (last 3-6 months)
- Must show sufficient funds for investment
- Must demonstrate legitimate source of income
- Must show your name as account holder

## Document Preparation Guidelines

### File Format Requirements
- **Accepted formats**: PDF, JPG, PNG only
- **Maximum file size**: 10MB per document
- **Resolution**: Minimum 300 DPI for scanned documents
- **Color**: Color or high-quality black & white acceptable

### Quality Standards
- **Clarity**: All text must be clearly readable
- **Completeness**: Entire document must be visible
- **Orientation**: Documents should be right-side up
- **Lighting**: Avoid shadows, glare, or dark areas
- **Focus**: Images must be sharp and in focus

### Privacy Protection
- **Sensitive information**: You may redact account numbers (leave last 4 digits visible)
- **Social security numbers**: Can be partially redacted
- **Signatures**: Should remain visible
- **Balances**: Should remain visible for financial verification

## Verification Process

### Timeline
- **Submission**: Instant upload
- **Initial review**: 1-2 business days
- **Verification decision**: 2-5 business days
- **Notification**: Email and platform notification

### Possible Outcomes
- **✅ Approved**: Full investment access granted
- **⏳ Pending**: Additional review or documents required
- **❌ Rejected**: Resubmission needed with corrections

### Common Rejection Reasons
- Documents are blurry or unreadable
- Files are too large or wrong format
- Documents are expired or too old
- Address doesn't match between documents
- Financial information is insufficient
- Documents appear altered or fraudulent

## Investment Limits

### Verification Tiers
- **Basic Verification**: Up to $10,000 investment limit
- **Enhanced Verification**: Up to $100,000 investment limit
- **Accredited Investor**: Unlimited investment (additional requirements)

### Enhanced Verification Requirements
- All basic documents plus:
- Proof of income (tax returns, pay stubs)
- Investment experience questionnaire
- Net worth verification
- Professional references (if applicable)

## After Verification

### Approved Investors Can:
- Browse and invest in coffee groves
- Purchase tree tokens with various payment methods
- Receive revenue distributions from harvests
- Trade tokens on the secondary marketplace
- Access detailed grove analytics and reports
- Track investment performance and ROI

### Maintaining Verification
- Keep documents current and valid
- Update information if circumstances change
- Renew expired documents promptly
- Report any changes in financial status

## Compliance & Security

### Regulatory Compliance
- KYC (Know Your Customer) requirements
- AML (Anti-Money Laundering) compliance
- GDPR and data protection standards
- Financial services regulations

### Data Security
- Documents encrypted during transmission
- Secure storage with limited access
- Regular security audits
- Data retention policies
- Right to data deletion upon request

## Support

### Need Help?
- **Email**: investor-support@chaiplatform.com
- **Platform**: Use the help section in investor portal
- **Documentation**: Check platform guides and FAQs
- **Live Chat**: Available during business hours

### Common Questions
**Q: What if I don't have all required documents?**
A: Contact support to discuss alternative documentation options.

**Q: Can I invest while verification is pending?**
A: No, verification must be completed before making investments.

**Q: How often do I need to update my documents?**
A: Update when documents expire or your circumstances change significantly.

**Q: Is my personal information secure?**
A: Yes, we use bank-level security and comply with all data protection regulations.

**Q: Can I invest from any country?**
A: Investment availability depends on local regulations. Check our supported countries list.

---

*This guide ensures all investors understand the verification requirements and can successfully complete the onboarding process while maintaining compliance with financial regulations.*

## Disabling KYC (Developer / Demo Mode)

If you need to disable the investor KYC flow (for demos, local testing, or environments where KYC is handled externally), the server supports an environment toggle that bypasses verification.

- **Environment variable**: `DISABLE_INVESTOR_KYC`
- **Values**: `true` or `false` (default `false`)

Behavior when enabled (`DISABLE_INVESTOR_KYC=true`):
- Document submission is optional and not required.
- Any investor `status` queries will return `verified` with `full` access.
- Submissions through the API will be auto-approved and logged as system-approved.

How to run with KYC disabled (example):

```powershell
$env:DISABLE_INVESTOR_KYC='true'; npm run start
```

Important notes:
- This mode should only be used for development, testing, or controlled demo environments.
- Disabling KYC removes AML/KYC protections and must never be used in production where regulatory compliance is required.
- Remember to set `DISABLE_INVESTOR_KYC=false` (or remove the variable) when returning to production.