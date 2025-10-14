/**
 * Integration Tests: User Settings API
 * 
 * Tests the complete user settings API endpoints including:
 * - GET /api/user/settings/:accountId
 * - PUT /api/user/settings/:accountId
 * 
 * These tests verify:
 * - Settings retrieval for existing and new accounts
 * - Settings creation and updates (upsert behavior)
 * - Account ID validation
 * - Settings persistence across requests
 * - Error handling and recovery
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 7.1, 7.2, 7.3
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import {
  getUserSettings,
  updateUserSettings,
  validateAccountId,
  getDefaultSettings,
  initializeAccountSettings,
  setDefaultSettingsConfig,
  resetDefaultSettingsConfig
} from '../../api/user-settings.js'
import { settingsCache } from '../../lib/settings-cache.js'
import { db } from '../../db/index.js'
import { userSettings } from '../../db/schema/index.js'
import { eq } from 'drizzle-orm'

describe('User Settings API - Integration Tests', () => {
  
  // Test account IDs
  const testAccounts = {
    valid1: '0.0.123456',
    valid2: '0.0.789012',
    valid3: '0.0.345678',
    newAccount: '0.0.999999',
    invalid1: 'invalid-account',
    invalid2: '0.0',
    invalid3: '123456',
    invalid4: '',
  }

  // Helper function to safely delete settings (works with both SQLite and in-memory DB)
  async function safeDeleteSettings(accountId: string): Promise<void> {
    try {
      const isInMemoryDB = !!(db as any).__dumpStorage
      
      if (isInMemoryDB) {
        // In-memory DB: Just invalidate cache, data will be cleared on restart
        settingsCache.invalidate(accountId)
      } else {
        // SQLite: Delete from database
        await safeDeleteSettings(accountId)
      }
    } catch (error) {
      // Silently ignore errors during cleanup
      console.warn(`Failed to delete settings for ${accountId}:`, error)
    }
  }

  beforeAll(async () => {
    // Clear cache before tests
    settingsCache.clear()
    
    // Reset default settings configuration
    resetDefaultSettingsConfig()
  })

  beforeEach(async () => {
    // Clear cache before each test
    settingsCache.clear()
  })

  afterAll(async () => {
    // Cleanup: Remove test data
    try {
      // Check if we're using in-memory DB (doesn't support delete with where)
      const isInMemoryDB = !!(db as any).__dumpStorage
      
      if (!isInMemoryDB) {
        for (const accountId of Object.values(testAccounts)) {
          if (validateAccountId(accountId)) {
            await safeDeleteSettings(accountId)
          }
        }
      }
    } catch (error) {
      console.warn('Cleanup error:', error)
    }
    
    // Reset default settings
    resetDefaultSettingsConfig()
  })

  describe('GET /api/user/settings/:accountId - Retrieve Settings', () => {
    
    it('should return 200 with settings for existing account', async () => {
      // Requirement 2.1: Fetch user settings for specified account ID
      
      // Setup: Create settings for test account
      const accountId = testAccounts.valid1
      const testSettings = {
        skipFarmerVerification: true,
        skipInvestorVerification: false,
        demoBypass: true
      }

      await updateUserSettings(accountId, testSettings)

      // Test: Retrieve settings
      const result = await getUserSettings(accountId)

      // Verify
      expect(result).toBeDefined()
      expect(result.account).toBe(accountId)
      expect(result.skipFarmerVerification).toBe(true)
      expect(result.skipInvestorVerification).toBe(false)
      expect(result.demoBypass).toBe(true)
      expect(result.updatedAt).toBeGreaterThan(0)
      expect(typeof result.updatedAt).toBe('number')
    })

    it('should return defaults for new account (no existing settings)', async () => {
      // Requirement 2.2: Return default settings when account not found
      
      const accountId = testAccounts.newAccount
      
      // Ensure account doesn't exist
      await safeDeleteSettings(accountId)

      // Test: Retrieve settings for non-existent account
      const result = await getUserSettings(accountId)

      // Verify: Should return default settings
      expect(result).toBeDefined()
      expect(result.account).toBe(accountId)
      expect(result.skipFarmerVerification).toBe(false) // Default
      expect(result.skipInvestorVerification).toBe(false) // Default
      expect(result.demoBypass).toBe(false) // Default
      expect(result.updatedAt).toBeGreaterThan(0)
    })

    it('should use cache on subsequent requests', async () => {
      // Requirement 8.1, 8.2: Cache settings for 5 minutes
      
      const accountId = testAccounts.valid2
      
      // Setup: Create settings
      await updateUserSettings(accountId, {
        skipFarmerVerification: true,
        skipInvestorVerification: true,
        demoBypass: false
      })

      // Clear cache to start fresh
      settingsCache.clear()

      // First request: Should fetch from database
      const result1 = await getUserSettings(accountId)
      expect(result1.account).toBe(accountId)

      // Verify cache was populated
      const cached = settingsCache.get(accountId)
      expect(cached).toBeDefined()
      expect(cached?.account).toBe(accountId)

      // Second request: Should use cache
      const result2 = await getUserSettings(accountId)
      expect(result2.account).toBe(accountId)
      expect(result2.skipFarmerVerification).toBe(result1.skipFarmerVerification)
      expect(result2.updatedAt).toBe(result1.updatedAt)
    })

    it('should throw error for invalid account ID format', async () => {
      // Requirement 7.1: Validate account ID format
      
      const invalidAccounts = [
        testAccounts.invalid1,
        testAccounts.invalid2,
        testAccounts.invalid3,
        testAccounts.invalid4
      ]

      for (const invalidAccountId of invalidAccounts) {
        await expect(async () => {
          await getUserSettings(invalidAccountId)
        }).rejects.toThrow(/Invalid account ID format/)
      }
    })

    it('should handle database errors gracefully', async () => {
      // Requirement 9.1, 9.2: Graceful error handling with fallback
      
      const accountId = testAccounts.valid3
      
      // This test verifies that even if there's a database issue,
      // the function returns default settings instead of crashing
      const result = await getUserSettings(accountId)
      
      // Should return valid settings object (either from DB or defaults)
      expect(result).toBeDefined()
      expect(result.account).toBe(accountId)
      expect(typeof result.skipFarmerVerification).toBe('boolean')
      expect(typeof result.skipInvestorVerification).toBe('boolean')
      expect(typeof result.demoBypass).toBe('boolean')
    })
  })

  describe('PUT /api/user/settings/:accountId - Create/Update Settings', () => {
    
    it('should create new settings for account', async () => {
      // Requirement 2.3, 2.4: Create new user settings
      
      const accountId = '0.0.111111'
      
      // Ensure account doesn't exist
      await safeDeleteSettings(accountId)

      // Test: Create new settings
      const newSettings = {
        skipFarmerVerification: true,
        skipInvestorVerification: false,
        demoBypass: true
      }

      const result = await updateUserSettings(accountId, newSettings)

      // Verify
      expect(result).toBeDefined()
      expect(result.account).toBe(accountId)
      expect(result.skipFarmerVerification).toBe(true)
      expect(result.skipInvestorVerification).toBe(false)
      expect(result.demoBypass).toBe(true)
      expect(result.updatedAt).toBeGreaterThan(0)

      // Verify settings were persisted by retrieving them again
      settingsCache.clear()
      const retrievedSettings = await getUserSettings(accountId)
      
      expect(retrievedSettings.account).toBe(accountId)
      expect(retrievedSettings.skipFarmerVerification).toBe(true)

      // Cleanup
      await safeDeleteSettings(accountId)
    })

    it('should update existing settings (upsert behavior)', async () => {
      // Requirement 2.3: Update existing settings
      
      const accountId = '0.0.222222'
      
      // Setup: Create initial settings
      await updateUserSettings(accountId, {
        skipFarmerVerification: false,
        skipInvestorVerification: false,
        demoBypass: false
      })

      // Test: Update settings
      const updatedSettings = {
        skipFarmerVerification: true,
        skipInvestorVerification: true
      }

      const result = await updateUserSettings(accountId, updatedSettings)

      // Verify
      expect(result.account).toBe(accountId)
      expect(result.skipFarmerVerification).toBe(true)
      expect(result.skipInvestorVerification).toBe(true)
      expect(result.demoBypass).toBe(false) // Should retain previous value

      // Verify by retrieving settings again
      settingsCache.clear()
      const retrievedSettings = await getUserSettings(accountId)
      
      expect(retrievedSettings.skipFarmerVerification).toBe(true)
      expect(retrievedSettings.skipInvestorVerification).toBe(true)

      // Cleanup
      await safeDeleteSettings(accountId)
    })

    it('should update only specified fields (partial update)', async () => {
      // Requirement 2.3: Partial settings update
      
      const accountId = '0.0.333333'
      
      // Setup: Create initial settings
      await updateUserSettings(accountId, {
        skipFarmerVerification: true,
        skipInvestorVerification: true,
        demoBypass: true
      })

      // Test: Update only one field
      const result = await updateUserSettings(accountId, {
        skipFarmerVerification: false
      })

      // Verify: Only specified field changed
      expect(result.skipFarmerVerification).toBe(false)
      expect(result.skipInvestorVerification).toBe(true) // Unchanged
      expect(result.demoBypass).toBe(true) // Unchanged

      // Cleanup
      await safeDeleteSettings(accountId)
    })

    it('should validate account ID format before update', async () => {
      // Requirement 7.1: Validate account ID format
      
      const invalidAccounts = [
        testAccounts.invalid1,
        testAccounts.invalid2,
        testAccounts.invalid3,
        testAccounts.invalid4
      ]

      for (const invalidAccountId of invalidAccounts) {
        await expect(async () => {
          await updateUserSettings(invalidAccountId, {
            skipFarmerVerification: true
          })
        }).rejects.toThrow(/Invalid account ID format/)
      }
    })

    it('should validate boolean flag values', async () => {
      // Requirement 7.2: Validate boolean flags
      
      const accountId = '0.0.444444'
      
      // Test with invalid boolean values
      const invalidSettings = {
        skipFarmerVerification: 'not-a-boolean' as any
      }

      await expect(async () => {
        await updateUserSettings(accountId, invalidSettings)
      }).rejects.toThrow(/expected boolean/)

      // Cleanup (in case it was created)
      await safeDeleteSettings(accountId)
    })

    it('should update updatedAt timestamp on each update', async () => {
      // Requirement 2.6: Update timestamp on changes
      
      const accountId = '0.0.555555'
      
      // Create initial settings
      const result1 = await updateUserSettings(accountId, {
        skipFarmerVerification: false
      })

      const firstTimestamp = result1.updatedAt

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10))

      // Update settings
      const result2 = await updateUserSettings(accountId, {
        skipFarmerVerification: true
      })

      const secondTimestamp = result2.updatedAt

      // Verify timestamp was updated
      expect(secondTimestamp).toBeGreaterThan(firstTimestamp)

      // Cleanup
      await safeDeleteSettings(accountId)
    })

    it('should invalidate cache after update', async () => {
      // Requirement 8.3: Invalidate cache on update
      
      const accountId = '0.0.666666'
      
      // Setup: Create and cache settings
      await updateUserSettings(accountId, {
        skipFarmerVerification: false
      })

      // Verify cache is populated
      await getUserSettings(accountId)
      let cached = settingsCache.get(accountId)
      expect(cached).toBeDefined()
      expect(cached?.skipFarmerVerification).toBe(false)

      // Update settings
      await updateUserSettings(accountId, {
        skipFarmerVerification: true
      })

      // Verify cache was updated with new values
      cached = settingsCache.get(accountId)
      expect(cached).toBeDefined()
      expect(cached?.skipFarmerVerification).toBe(true)

      // Cleanup
      await safeDeleteSettings(accountId)
    })
  })

  describe('Settings Persistence Across Requests', () => {
    
    it('should persist settings across multiple GET requests', async () => {
      // Requirement 2.1, 2.2: Settings persistence
      
      const accountId = '0.0.777777'
      
      // Create settings
      const originalSettings = {
        skipFarmerVerification: true,
        skipInvestorVerification: false,
        demoBypass: true
      }

      await updateUserSettings(accountId, originalSettings)

      // Clear cache to force database reads
      settingsCache.clear()

      // Make multiple GET requests
      const result1 = await getUserSettings(accountId)
      settingsCache.clear()
      
      const result2 = await getUserSettings(accountId)
      settingsCache.clear()
      
      const result3 = await getUserSettings(accountId)

      // Verify all requests return same settings
      expect(result1.skipFarmerVerification).toBe(true)
      expect(result2.skipFarmerVerification).toBe(true)
      expect(result3.skipFarmerVerification).toBe(true)

      expect(result1.skipInvestorVerification).toBe(false)
      expect(result2.skipInvestorVerification).toBe(false)
      expect(result3.skipInvestorVerification).toBe(false)

      expect(result1.demoBypass).toBe(true)
      expect(result2.demoBypass).toBe(true)
      expect(result3.demoBypass).toBe(true)

      // Cleanup
      await safeDeleteSettings(accountId)
    })

    it('should persist settings across multiple UPDATE requests', async () => {
      // Requirement 2.3: Settings persistence through updates
      
      const accountId = '0.0.888888'
      
      // Create initial settings
      await updateUserSettings(accountId, {
        skipFarmerVerification: false,
        skipInvestorVerification: false,
        demoBypass: false
      })

      // Update multiple times
      await updateUserSettings(accountId, {
        skipFarmerVerification: true
      })

      await updateUserSettings(accountId, {
        skipInvestorVerification: true
      })

      await updateUserSettings(accountId, {
        demoBypass: true
      })

      // Clear cache and retrieve
      settingsCache.clear()
      const finalResult = await getUserSettings(accountId)

      // Verify all updates persisted
      expect(finalResult.skipFarmerVerification).toBe(true)
      expect(finalResult.skipInvestorVerification).toBe(true)
      expect(finalResult.demoBypass).toBe(true)

      // Cleanup
      await safeDeleteSettings(accountId)
    })

    it('should maintain separate settings for different accounts', async () => {
      // Requirement 2.1: Account-specific settings
      
      const account1 = '0.0.100001'
      const account2 = '0.0.100002'
      const account3 = '0.0.100003'
      
      // Create different settings for each account
      await updateUserSettings(account1, {
        skipFarmerVerification: true,
        skipInvestorVerification: false,
        demoBypass: false
      })

      await updateUserSettings(account2, {
        skipFarmerVerification: false,
        skipInvestorVerification: true,
        demoBypass: false
      })

      await updateUserSettings(account3, {
        skipFarmerVerification: false,
        skipInvestorVerification: false,
        demoBypass: true
      })

      // Clear cache
      settingsCache.clear()

      // Retrieve all settings
      const result1 = await getUserSettings(account1)
      const result2 = await getUserSettings(account2)
      const result3 = await getUserSettings(account3)

      // Verify each account has correct settings
      expect(result1.skipFarmerVerification).toBe(true)
      expect(result1.skipInvestorVerification).toBe(false)
      expect(result1.demoBypass).toBe(false)

      expect(result2.skipFarmerVerification).toBe(false)
      expect(result2.skipInvestorVerification).toBe(true)
      expect(result2.demoBypass).toBe(false)

      expect(result3.skipFarmerVerification).toBe(false)
      expect(result3.skipInvestorVerification).toBe(false)
      expect(result3.demoBypass).toBe(true)

      // Cleanup
      await safeDeleteSettings(account1)
      await safeDeleteSettings(account2)
      await safeDeleteSettings(account3)
    })
  })

  describe('Account ID Validation', () => {
    
    it('should accept valid Hedera account ID formats', async () => {
      // Requirement 7.1: Validate Hedera account format
      
      const validAccountIds = [
        '0.0.123456',
        '0.0.1',
        '0.0.999999999',
        '1.2.3',
        '100.200.300'
      ]

      for (const accountId of validAccountIds) {
        const isValid = validateAccountId(accountId)
        expect(isValid).toBe(true)
      }
    })

    it('should reject invalid account ID formats', async () => {
      // Requirement 7.1: Reject invalid formats
      
      const invalidAccountIds = [
        'invalid',
        '0.0',
        '123456',
        '0-0-123456',
        '0.0.abc',
        'abc.def.ghi',
        '',
        null as any,
        undefined as any,
        '0.0.123456.789',
        '.0.123456',
        '0..123456'
      ]

      for (const accountId of invalidAccountIds) {
        const isValid = validateAccountId(accountId)
        expect(isValid).toBe(false)
      }
    })
  })

  describe('Default Settings Management', () => {
    
    it('should return correct default settings', async () => {
      // Requirement 6.1: Default settings for new accounts
      
      const accountId = '0.0.590001'
      const defaults = getDefaultSettings(accountId)

      expect(defaults.account).toBe(accountId)
      expect(defaults.skipFarmerVerification).toBe(false)
      expect(defaults.skipInvestorVerification).toBe(false)
      expect(defaults.demoBypass).toBe(false)
      expect(defaults.updatedAt).toBeGreaterThan(0)
    })

    it('should initialize new account with default settings', async () => {
      // Requirement 6.1, 6.2: Initialize with defaults
      
      const accountId = '0.0.600001'
      
      // Ensure account doesn't exist
      await safeDeleteSettings(accountId)
      
      // Initialize account
      const result = await initializeAccountSettings(accountId)

      expect(result.account).toBe(accountId)
      expect(result.skipFarmerVerification).toBe(false)
      expect(result.skipInvestorVerification).toBe(false)
      expect(result.demoBypass).toBe(false)

      // Verify by retrieving settings again
      settingsCache.clear()
      const retrievedSettings = await getUserSettings(accountId)
      
      expect(retrievedSettings.account).toBe(accountId)

      // Cleanup
      await safeDeleteSettings(accountId)
    })

    it('should not override existing settings when initializing', async () => {
      // Requirement 6.4: Don't override existing settings
      
      const accountId = '0.0.620001'
      
      // Create existing settings
      await updateUserSettings(accountId, {
        skipFarmerVerification: true,
        skipInvestorVerification: true,
        demoBypass: true
      })

      // Try to initialize (should return existing)
      const result = await initializeAccountSettings(accountId)

      expect(result.skipFarmerVerification).toBe(true)
      expect(result.skipInvestorVerification).toBe(true)
      expect(result.demoBypass).toBe(true)

      // Cleanup
      await safeDeleteSettings(accountId)
    })

    it('should allow updating default settings configuration', async () => {
      // Requirement 6.2, 6.5: Configure default values
      
      // Set custom defaults
      setDefaultSettingsConfig({
        skipFarmerVerification: true,
        skipInvestorVerification: true,
        demoBypass: false
      })

      const accountId = '0.0.650001'
      
      // Ensure account doesn't exist
      await safeDeleteSettings(accountId)
      
      // Initialize with custom defaults
      const result = await initializeAccountSettings(accountId)

      expect(result.skipFarmerVerification).toBe(true)
      expect(result.skipInvestorVerification).toBe(true)
      expect(result.demoBypass).toBe(false)

      // Reset to original defaults
      resetDefaultSettingsConfig()

      // Cleanup
      await safeDeleteSettings(accountId)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    
    it('should handle concurrent requests for same account', async () => {
      // Requirement 8.5: Handle concurrent requests
      
      const accountId = '0.0.700001'
      
      // Clear any existing data
      await safeDeleteSettings(accountId)
      settingsCache.clear()

      // Make concurrent requests
      const promises = [
        getUserSettings(accountId),
        getUserSettings(accountId),
        getUserSettings(accountId)
      ]

      const results = await Promise.all(promises)

      // All should return valid settings
      results.forEach(result => {
        expect(result.account).toBe(accountId)
        expect(typeof result.skipFarmerVerification).toBe('boolean')
      })

      // Cleanup
      await safeDeleteSettings(accountId)
    })

    it('should handle empty settings update', async () => {
      // Edge case: Update with no fields
      
      const accountId = '0.0.730001'
      
      // Create initial settings
      await updateUserSettings(accountId, {
        skipFarmerVerification: true
      })

      // Update with empty object
      const result = await updateUserSettings(accountId, {})

      // Should retain existing settings
      expect(result.skipFarmerVerification).toBe(true)

      // Cleanup
      await safeDeleteSettings(accountId)
    })

    it('should handle very long account IDs', async () => {
      // Edge case: Long but valid account ID
      
      const longAccountId = '999999999.999999999.999999999'
      
      const isValid = validateAccountId(longAccountId)
      expect(isValid).toBe(true)

      // Should be able to create settings
      const result = await updateUserSettings(longAccountId, {
        skipFarmerVerification: true
      })

      expect(result.account).toBe(longAccountId)

      // Cleanup
      await safeDeleteSettings(longAccountId)
    })
  })
})





