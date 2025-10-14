-- Rollback: Drop token_holdings performance index
DROP INDEX IF EXISTS idx_token_holdings_account_token;
