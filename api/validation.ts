/**
 * Server-side Validation Module
 * Validates all inputs before contract calls and checks authorization
 */

import { Request, Response } from 'express';

// Define NextFunction type if not available from express
type NextFunction = (err?: any) => void;

export class ServerValidationError extends Error {
    public field: string;
    public code: string;
    public statusCode: number;

    constructor(message: string, field: string, code: string, statusCode: number = 400) {
        super(message);
        this.name = 'ServerValidationError';
        this.field = field;
        this.code = code;
        this.statusCode = statusCode;
    }
}

export class ServerValidator {
    /**
     * Validate amount is positive and within range
     */
    static validateAmount(
        amount: any,
        fieldName: string = 'Amount',
        options: { min?: number; max?: number; allowZero?: boolean } = {}
    ): { valid: boolean; error?: string; code?: string } {
        const { min = 0, max = null, allowZero = false } = options;

        // Check if amount exists
        if (amount === undefined || amount === null) {
            return {
                valid: false,
                error: `${fieldName} is required`,
                code: 'REQUIRED_FIELD'
            };
        }

        // Convert to number if string
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

        // Check if amount is a number
        if (typeof numAmount !== 'number' || isNaN(numAmount)) {
            return {
                valid: false,
                error: `${fieldName} must be a valid number`,
                code: 'INVALID_NUMBER'
            };
        }

        // Check if amount is finite
        if (!isFinite(numAmount)) {
            return {
                valid: false,
                error: `${fieldName} must be a finite number`,
                code: 'INFINITE_NUMBER'
            };
        }

        // Check for zero
        if (!allowZero && numAmount === 0) {
            return {
                valid: false,
                error: `${fieldName} must be greater than zero`,
                code: 'ZERO_NOT_ALLOWED'
            };
        }

        // Check minimum
        if (numAmount < min) {
            return {
                valid: false,
                error: `${fieldName} must be at least ${min}`,
                code: 'BELOW_MINIMUM'
            };
        }

        // Check maximum
        if (max !== null && numAmount > max) {
            return {
                valid: false,
                error: `${fieldName} must not exceed ${max}`,
                code: 'ABOVE_MAXIMUM'
            };
        }

        // Check for negative
        if (numAmount < 0) {
            return {
                valid: false,
                error: `${fieldName} must be positive`,
                code: 'NEGATIVE_VALUE'
            };
        }

        return { valid: true };
    }

    /**
     * Validate Hedera account ID format
     */
    static validateHederaAccountId(
        accountId: any,
        fieldName: string = 'Account ID'
    ): { valid: boolean; error?: string; code?: string } {
        // Check if accountId exists
        if (!accountId) {
            return {
                valid: false,
                error: `${fieldName} is required`,
                code: 'REQUIRED_FIELD'
            };
        }

        // Check if accountId is a string
        if (typeof accountId !== 'string') {
            return {
                valid: false,
                error: `${fieldName} must be a string`,
                code: 'INVALID_TYPE'
            };
        }

        // Trim whitespace
        const trimmedId = accountId.trim();

        // Check if empty
        if (trimmedId.length === 0) {
            return {
                valid: false,
                error: `${fieldName} cannot be empty`,
                code: 'EMPTY_ACCOUNT_ID'
            };
        }

        // Hedera account ID format: shard.realm.num (e.g., 0.0.12345)
        const hederaAccountPattern = /^(\d+)\.(\d+)\.(\d+)$/;

        if (!hederaAccountPattern.test(trimmedId)) {
            return {
                valid: false,
                error: `${fieldName} must be in format: shard.realm.num (e.g., 0.0.12345)`,
                code: 'INVALID_FORMAT'
            };
        }

        // Extract parts
        const parts = trimmedId.split('.');
        const shard = parseInt(parts[0]);
        const realm = parseInt(parts[1]);
        const num = parseInt(parts[2]);

        // Validate ranges (Hedera specific)
        if (shard < 0 || shard > 32767) {
            return {
                valid: false,
                error: `${fieldName} shard must be between 0 and 32767`,
                code: 'INVALID_SHARD'
            };
        }

        if (realm < 0 || realm > 65535) {
            return {
                valid: false,
                error: `${fieldName} realm must be between 0 and 65535`,
                code: 'INVALID_REALM'
            };
        }

        if (num < 0) {
            return {
                valid: false,
                error: `${fieldName} account number must be positive`,
                code: 'INVALID_ACCOUNT_NUMBER'
            };
        }

        return { valid: true };
    }

    /**
     * Validate string field
     */
    static validateString(
        value: any,
        fieldName: string = 'Field',
        options: { minLength?: number; maxLength?: number; required?: boolean } = {}
    ): { valid: boolean; error?: string; code?: string } {
        const { minLength = 1, maxLength = null, required = true } = options;

        // Check if required
        if (required && (value === undefined || value === null)) {
            return {
                valid: false,
                error: `${fieldName} is required`,
                code: 'REQUIRED_FIELD'
            };
        }

        // Allow optional fields
        if (!required && (value === undefined || value === null)) {
            return { valid: true };
        }

        if (typeof value !== 'string') {
            return {
                valid: false,
                error: `${fieldName} must be a string`,
                code: 'INVALID_TYPE'
            };
        }

        const trimmedValue = value.trim();

        if (trimmedValue.length < minLength) {
            return {
                valid: false,
                error: `${fieldName} must be at least ${minLength} character${minLength > 1 ? 's' : ''}`,
                code: 'TOO_SHORT'
            };
        }

        if (maxLength !== null && trimmedValue.length > maxLength) {
            return {
                valid: false,
                error: `${fieldName} must not exceed ${maxLength} characters`,
                code: 'TOO_LONG'
            };
        }

        return { valid: true };
    }

    /**
     * Validate token amount against balance
     */
    static validateTokenAmount(
        amount: any,
        balance: number,
        fieldName: string = 'Token amount'
    ): { valid: boolean; error?: string; code?: string } {
        // First validate the amount is valid
        const amountValidation = this.validateAmount(amount, fieldName, { min: 0, allowZero: false });
        if (!amountValidation.valid) {
            return amountValidation;
        }

        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

        // Validate balance is a number
        if (typeof balance !== 'number' || isNaN(balance) || balance < 0) {
            return {
                valid: false,
                error: 'Invalid balance provided for validation',
                code: 'INVALID_BALANCE'
            };
        }

        // Check if amount exceeds balance
        if (numAmount > balance) {
            return {
                valid: false,
                error: `${fieldName} (${numAmount}) exceeds available balance (${balance})`,
                code: 'INSUFFICIENT_BALANCE'
            };
        }

        return { valid: true };
    }

    /**
     * Validate quality grade (1-10)
     */
    static validateQualityGrade(
        grade: any,
        fieldName: string = 'Quality grade'
    ): { valid: boolean; error?: string; code?: string } {
        return this.validateAmount(grade, fieldName, { min: 1, max: 10, allowZero: false });
    }

    /**
     * Validate health score (0-100)
     */
    static validateHealthScore(
        score: any,
        fieldName: string = 'Health score'
    ): { valid: boolean; error?: string; code?: string } {
        return this.validateAmount(score, fieldName, { min: 0, max: 100, allowZero: true });
    }

    /**
     * Validate price range
     */
    static validatePriceRange(
        proposedPrice: any,
        marketPrice: number,
        fieldName: string = 'Price',
        options: { minPercent?: number; maxPercent?: number } = {}
    ): { valid: boolean; error?: string; code?: string } {
        const { minPercent = 50, maxPercent = 200 } = options;

        // Validate proposed price is positive
        const priceValidation = this.validateAmount(proposedPrice, fieldName, { min: 0, allowZero: false });
        if (!priceValidation.valid) {
            return priceValidation;
        }

        const numPrice = typeof proposedPrice === 'string' ? parseFloat(proposedPrice) : proposedPrice;

        // Validate market price
        if (typeof marketPrice !== 'number' || marketPrice <= 0) {
            return {
                valid: false,
                error: 'Invalid market price provided for validation',
                code: 'INVALID_MARKET_PRICE'
            };
        }

        // Calculate acceptable range
        const minPrice = (marketPrice * minPercent) / 100;
        const maxPrice = (marketPrice * maxPercent) / 100;

        if (numPrice < minPrice) {
            return {
                valid: false,
                error: `${fieldName} (${numPrice}) is too low. Must be at least ${minPercent}% of market price (${minPrice.toFixed(2)})`,
                code: 'PRICE_TOO_LOW'
            };
        }

        if (numPrice > maxPrice) {
            return {
                valid: false,
                error: `${fieldName} (${numPrice}) is too high. Must not exceed ${maxPercent}% of market price (${maxPrice.toFixed(2)})`,
                code: 'PRICE_TOO_HIGH'
            };
        }

        return { valid: true };
    }

    /**
     * Validate collateralization ratio
     */
    static validateCollateralization(
        collateralValue: number,
        loanAmount: any,
        requiredRatio: number = 1.25
    ): { valid: boolean; error?: string; code?: string; ratio?: number } {
        // Validate inputs
        const collateralValidation = this.validateAmount(collateralValue, 'Collateral value', {
            min: 0,
            allowZero: false
        });
        if (!collateralValidation.valid) {
            return collateralValidation;
        }

        const loanValidation = this.validateAmount(loanAmount, 'Loan amount', { min: 0, allowZero: false });
        if (!loanValidation.valid) {
            return loanValidation;
        }

        const numLoanAmount = typeof loanAmount === 'string' ? parseFloat(loanAmount) : loanAmount;

        // Calculate actual ratio
        const actualRatio = collateralValue / numLoanAmount;

        if (actualRatio < requiredRatio) {
            return {
                valid: false,
                error: `Insufficient collateral. Required ratio: ${(requiredRatio * 100).toFixed(0)}%, actual: ${(actualRatio * 100).toFixed(0)}%`,
                code: 'INSUFFICIENT_COLLATERAL',
                ratio: actualRatio
            };
        }

        return { valid: true, ratio: actualRatio };
    }

    /**
     * Validate batch size
     */
    static validateBatchSize(
        batchSize: any,
        maxBatchSize: number = 50
    ): { valid: boolean; error?: string; code?: string } {
        return this.validateAmount(batchSize, 'Batch size', { min: 1, max: maxBatchSize, allowZero: false });
    }

    /**
     * Throw error if validation fails
     */
    static throwIfInvalid(
        validation: { valid: boolean; error?: string; code?: string },
        field: string
    ): void {
        if (!validation.valid) {
            throw new ServerValidationError(validation.error || 'Validation failed', field, validation.code || 'VALIDATION_ERROR');
        }
    }

    /**
     * Validate multiple fields and return all errors
     */
    static validateMultiple(
        validations: Record<string, { valid: boolean; error?: string; code?: string }>
    ): { valid: boolean; errors?: Record<string, string> } {
        const errors: Record<string, string> = {};
        let allValid = true;

        for (const [field, validation] of Object.entries(validations)) {
            if (!validation.valid) {
                errors[field] = validation.error || 'Validation failed';
                allValid = false;
            }
        }

        return {
            valid: allValid,
            errors: allValid ? undefined : errors
        };
    }
}

/**
 * Express middleware for validating admin authorization
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
    const adminAddress = req.body.adminAddress || req.query.adminAddress;

    if (!adminAddress) {
        res.status(401).json({
            success: false,
            error: 'Admin address is required',
            code: 'MISSING_ADMIN_ADDRESS'
        });
        return;
    }

    // Validate admin address format
    const validation = ServerValidator.validateHederaAccountId(adminAddress, 'Admin address');
    if (!validation.valid) {
        res.status(400).json({
            success: false,
            error: validation.error,
            code: validation.code
        });
        return;
    }

    // TODO: Check if address is actually an admin (would need to query contract or database)
    // For now, we'll pass through and let the contract handle authorization
    
    next();
}

/**
 * Express middleware for handling validation errors
 */
export function validationErrorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (err instanceof ServerValidationError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
            field: err.field,
            code: err.code
        });
        return;
    }

    // Pass to next error handler
    next(err);
}

/**
 * Helper function to validate request body fields
 */
export function validateRequestBody(
    body: any,
    requiredFields: string[]
): { valid: boolean; errors?: Record<string, string> } {
    const errors: Record<string, string> = {};
    let allValid = true;

    for (const field of requiredFields) {
        if (body[field] === undefined || body[field] === null) {
            errors[field] = `${field} is required`;
            allValid = false;
        }
    }

    return {
        valid: allValid,
        errors: allValid ? undefined : errors
    };
}
