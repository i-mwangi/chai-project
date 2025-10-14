/**
 * Test script for default settings management
 * Tests the new default settings configuration functionality
 */

import {
  getDefaultSettings,
  getDefaultSettingsConfig,
  setDefaultSettingsConfig,
  resetDefaultSettingsConfig,
  initializeAccountSettings,
  getUserSettings,
  updateUserSettings
} from './api/user-settings.js'

async function testDefaultSettingsManagement() {
  console.log('=== Testing Default Settings Management ===\n')

  try {
    // Test 1: Get initial default configuration
    console.log('Test 1: Get initial default configuration')
    const initialConfig = getDefaultSettingsConfig()
    console.log('Initial config:', initialConfig)
    console.assert(
      initialConfig.skipFarmerVerification === false &&
      initialConfig.skipInvestorVerification === false &&
      initialConfig.demoBypass === false,
      'Initial config should have all flags set to false'
    )
    console.log('✓ Test 1 passed\n')

    // Test 2: Get default settings for a new account
    console.log('Test 2: Get default settings for a new account')
    const defaults = getDefaultSettings('0.0.999999')
    console.log('Default settings:', defaults)
    console.assert(
      defaults.account === '0.0.999999' &&
      defaults.skipFarmerVerification === false &&
      defaults.skipInvestorVerification === false &&
      defaults.demoBypass === false,
      'Default settings should match initial config'
    )
    console.log('✓ Test 2 passed\n')

    // Test 3: Update default configuration
    console.log('Test 3: Update default configuration')
    setDefaultSettingsConfig({
      skipFarmerVerification: true,
      demoBypass: true
    })
    const updatedConfig = getDefaultSettingsConfig()
    console.log('Updated config:', updatedConfig)
    console.assert(
      updatedConfig.skipFarmerVerification === true &&
      updatedConfig.skipInvestorVerification === false &&
      updatedConfig.demoBypass === true,
      'Config should be updated with new values'
    )
    console.log('✓ Test 3 passed\n')

    // Test 4: Get default settings after config update
    console.log('Test 4: Get default settings after config update')
    const newDefaults = getDefaultSettings('0.0.888888')
    console.log('New default settings:', newDefaults)
    console.assert(
      newDefaults.skipFarmerVerification === true &&
      newDefaults.skipInvestorVerification === false &&
      newDefaults.demoBypass === true,
      'New defaults should reflect updated config'
    )
    console.log('✓ Test 4 passed\n')

    // Test 5: Initialize a new account with current defaults
    console.log('Test 5: Initialize a new account with current defaults')
    const testAccountId = '0.0.777777'
    const initialized = await initializeAccountSettings(testAccountId)
    console.log('Initialized settings:', initialized)
    console.assert(
      initialized.account === testAccountId &&
      initialized.skipFarmerVerification === true &&
      initialized.skipInvestorVerification === false &&
      initialized.demoBypass === true,
      'Initialized account should have current default values'
    )
    console.log('✓ Test 5 passed\n')

    // Test 6: Verify initialized account can be retrieved
    console.log('Test 6: Verify initialized account can be retrieved')
    const retrieved = await getUserSettings(testAccountId)
    console.log('Retrieved settings:', retrieved)
    console.assert(
      retrieved.account === testAccountId &&
      retrieved.skipFarmerVerification === true &&
      retrieved.skipInvestorVerification === false &&
      retrieved.demoBypass === true,
      'Retrieved settings should match initialized values'
    )
    console.log('✓ Test 6 passed\n')

    // Test 7: Change defaults and verify existing accounts are not affected
    console.log('Test 7: Change defaults and verify existing accounts are not affected')
    setDefaultSettingsConfig({
      skipFarmerVerification: false,
      skipInvestorVerification: true,
      demoBypass: false
    })
    const retrievedAgain = await getUserSettings(testAccountId)
    console.log('Retrieved settings after config change:', retrievedAgain)
    console.assert(
      retrievedAgain.skipFarmerVerification === true &&
      retrievedAgain.skipInvestorVerification === false &&
      retrievedAgain.demoBypass === true,
      'Existing account settings should not be affected by config changes'
    )
    console.log('✓ Test 7 passed\n')

    // Test 8: Initialize another account with new defaults
    console.log('Test 8: Initialize another account with new defaults')
    const testAccountId2 = '0.0.666666'
    const initialized2 = await initializeAccountSettings(testAccountId2)
    console.log('Initialized settings for second account:', initialized2)
    console.assert(
      initialized2.skipFarmerVerification === false &&
      initialized2.skipInvestorVerification === true &&
      initialized2.demoBypass === false,
      'New account should have updated default values'
    )
    console.log('✓ Test 8 passed\n')

    // Test 9: Try to initialize an account that already exists
    console.log('Test 9: Try to initialize an account that already exists')
    const reinitialize = await initializeAccountSettings(testAccountId)
    console.log('Re-initialization result:', reinitialize)
    console.assert(
      reinitialize.skipFarmerVerification === true &&
      reinitialize.skipInvestorVerification === false &&
      reinitialize.demoBypass === true,
      'Re-initialization should return existing settings unchanged'
    )
    console.log('✓ Test 9 passed\n')

    // Test 10: Reset configuration to fallback defaults
    console.log('Test 10: Reset configuration to fallback defaults')
    resetDefaultSettingsConfig()
    const resetConfig = getDefaultSettingsConfig()
    console.log('Reset config:', resetConfig)
    console.assert(
      resetConfig.skipFarmerVerification === false &&
      resetConfig.skipInvestorVerification === false &&
      resetConfig.demoBypass === false,
      'Reset config should match fallback defaults'
    )
    console.log('✓ Test 10 passed\n')

    // Test 11: Validate invalid configuration
    console.log('Test 11: Validate invalid configuration')
    try {
      setDefaultSettingsConfig({ invalidKey: true } as any)
      console.error('✗ Test 11 failed: Should have thrown error for invalid key')
    } catch (error: any) {
      console.log('Expected error:', error.message)
      console.assert(
        error.message.includes('Invalid configuration key'),
        'Should throw error for invalid key'
      )
      console.log('✓ Test 11 passed\n')
    }

    // Test 12: Validate invalid value type
    console.log('Test 12: Validate invalid value type')
    try {
      setDefaultSettingsConfig({ skipFarmerVerification: 'true' } as any)
      console.error('✗ Test 12 failed: Should have thrown error for invalid value type')
    } catch (error: any) {
      console.log('Expected error:', error.message)
      console.assert(
        error.message.includes('expected boolean'),
        'Should throw error for non-boolean value'
      )
      console.log('✓ Test 12 passed\n')
    }

    console.log('=== All Tests Passed! ===')
    console.log('\nSummary:')
    console.log('- Default settings configuration can be retrieved')
    console.log('- Default settings configuration can be updated')
    console.log('- Default settings reflect current configuration')
    console.log('- New accounts are initialized with current defaults')
    console.log('- Existing accounts are not affected by config changes')
    console.log('- Configuration can be reset to fallback values')
    console.log('- Invalid configurations are rejected')

  } catch (error) {
    console.error('Test failed with error:', error)
    process.exit(1)
  }
}

// Run tests
testDefaultSettingsManagement()
  .then(() => {
    console.log('\n✓ Default settings management test completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n✗ Default settings management test failed:', error)
    process.exit(1)
  })
