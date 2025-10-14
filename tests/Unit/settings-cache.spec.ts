/**
 * Unit Tests for Settings Cache Manager
 * 
 * Tests cache hit/miss scenarios, TTL expiration, invalidation,
 * clearing, and statistics tracking.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SettingsCache } from '../../lib/settings-cache'

describe('SettingsCache', () => {
  let cache: SettingsCache
  
  const mockSettings = {
    account: '0.0.123456',
    skipFarmerVerification: false,
    skipInvestorVerification: false,
    demoBypass: false,
    updatedAt: Date.now()
  }

  beforeEach(() => {
    // Create a new cache instance for each test
    cache = new SettingsCache(5000) // 5 second TTL for testing
  })

  afterEach(() => {
    // Clean up cache after each test
    cache.destroy()
  })

  describe('Cache Hit and Miss Scenarios', () => {
    it('should return null for cache miss (non-existent key)', () => {
      const result = cache.get('0.0.999999')
      
      expect(result).toBeNull()
      
      const stats = cache.getStats()
      expect(stats.misses).toBe(1)
      expect(stats.hits).toBe(0)
    })

    it('should return cached settings for cache hit', () => {
      cache.set('0.0.123456', mockSettings)
      
      const result = cache.get('0.0.123456')
      
      expect(result).toEqual(mockSettings)
      expect(result?.account).toBe('0.0.123456')
      
      const stats = cache.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(0)
    })

    it('should handle multiple cache hits for same key', () => {
      cache.set('0.0.123456', mockSettings)
      
      cache.get('0.0.123456')
      cache.get('0.0.123456')
      cache.get('0.0.123456')
      
      const stats = cache.getStats()
      expect(stats.hits).toBe(3)
      expect(stats.misses).toBe(0)
    })

    it('should track hits and misses separately for different keys', () => {
      cache.set('0.0.111111', mockSettings)
      
      cache.get('0.0.111111') // hit
      cache.get('0.0.222222') // miss
      cache.get('0.0.111111') // hit
      cache.get('0.0.333333') // miss
      
      const stats = cache.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(2)
    })

    it('should update existing cache entry when set is called again', () => {
      cache.set('0.0.123456', mockSettings)
      
      const updatedSettings = {
        ...mockSettings,
        skipFarmerVerification: true,
        updatedAt: Date.now()
      }
      
      cache.set('0.0.123456', updatedSettings)
      
      const result = cache.get('0.0.123456')
      expect(result?.skipFarmerVerification).toBe(true)
    })
  })

  describe('Cache Expiration (TTL)', () => {
    it('should expire cache entry after TTL', async () => {
      // Create cache with 100ms TTL
      const shortCache = new SettingsCache(100)
      
      shortCache.set('0.0.123456', mockSettings)
      
      // Should be cached immediately
      let result = shortCache.get('0.0.123456')
      expect(result).toEqual(mockSettings)
      
      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Should be expired now
      result = shortCache.get('0.0.123456')
      expect(result).toBeNull()
      
      const stats = shortCache.getStats()
      expect(stats.misses).toBe(1) // The expired get counts as a miss
      
      shortCache.destroy()
    })

    it('should use custom TTL when provided', async () => {
      cache.set('0.0.123456', mockSettings, 100) // 100ms custom TTL
      
      // Should be cached immediately
      let result = cache.get('0.0.123456')
      expect(result).toEqual(mockSettings)
      
      // Wait for custom TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Should be expired now
      result = cache.get('0.0.123456')
      expect(result).toBeNull()
    })

    it('should use default TTL when custom TTL not provided', async () => {
      // Cache has 5000ms default TTL
      cache.set('0.0.123456', mockSettings)
      
      // Wait 100ms (well before expiration)
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Should still be cached
      const result = cache.get('0.0.123456')
      expect(result).toEqual(mockSettings)
    })

    it('should handle multiple entries with different TTLs', async () => {
      cache.set('0.0.111111', { ...mockSettings, account: '0.0.111111' }, 100)
      cache.set('0.0.222222', { ...mockSettings, account: '0.0.222222' }, 300)
      
      // Wait 150ms - first should expire, second should not
      await new Promise(resolve => setTimeout(resolve, 150))
      
      const result1 = cache.get('0.0.111111')
      const result2 = cache.get('0.0.222222')
      
      expect(result1).toBeNull()
      expect(result2).not.toBeNull()
      expect(result2?.account).toBe('0.0.222222')
    })
  })

  describe('Cache Invalidation', () => {
    it('should invalidate specific cache entry', () => {
      cache.set('0.0.123456', mockSettings)
      cache.set('0.0.789012', { ...mockSettings, account: '0.0.789012' })
      
      // Verify both are cached
      expect(cache.get('0.0.123456')).not.toBeNull()
      expect(cache.get('0.0.789012')).not.toBeNull()
      
      // Invalidate one
      cache.invalidate('0.0.123456')
      
      // First should be gone, second should remain
      expect(cache.get('0.0.123456')).toBeNull()
      expect(cache.get('0.0.789012')).not.toBeNull()
    })

    it('should handle invalidation of non-existent key gracefully', () => {
      expect(() => {
        cache.invalidate('0.0.999999')
      }).not.toThrow()
    })

    it('should allow re-setting after invalidation', () => {
      cache.set('0.0.123456', mockSettings)
      cache.invalidate('0.0.123456')
      
      const newSettings = {
        ...mockSettings,
        skipFarmerVerification: true
      }
      
      cache.set('0.0.123456', newSettings)
      
      const result = cache.get('0.0.123456')
      expect(result?.skipFarmerVerification).toBe(true)
    })
  })

  describe('Cache Clear', () => {
    it('should clear all cache entries', () => {
      cache.set('0.0.111111', { ...mockSettings, account: '0.0.111111' })
      cache.set('0.0.222222', { ...mockSettings, account: '0.0.222222' })
      cache.set('0.0.333333', { ...mockSettings, account: '0.0.333333' })
      
      // Verify all are cached
      expect(cache.getStats().size).toBe(3)
      
      cache.clear()
      
      // All should be gone
      expect(cache.get('0.0.111111')).toBeNull()
      expect(cache.get('0.0.222222')).toBeNull()
      expect(cache.get('0.0.333333')).toBeNull()
      expect(cache.getStats().size).toBe(0)
    })

    it('should reset statistics when clearing cache', () => {
      cache.set('0.0.123456', mockSettings)
      
      cache.get('0.0.123456') // hit
      cache.get('0.0.999999') // miss
      
      let stats = cache.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)
      
      cache.clear()
      
      stats = cache.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
    })

    it('should allow setting new entries after clear', () => {
      cache.set('0.0.123456', mockSettings)
      cache.clear()
      
      const newSettings = {
        ...mockSettings,
        skipFarmerVerification: true
      }
      
      cache.set('0.0.789012', newSettings)
      
      const result = cache.get('0.0.789012')
      expect(result).toEqual(newSettings)
    })
  })

  describe('Cache Statistics', () => {
    it('should track cache size', () => {
      expect(cache.getStats().size).toBe(0)
      
      cache.set('0.0.111111', { ...mockSettings, account: '0.0.111111' })
      expect(cache.getStats().size).toBe(1)
      
      cache.set('0.0.222222', { ...mockSettings, account: '0.0.222222' })
      expect(cache.getStats().size).toBe(2)
      
      cache.set('0.0.333333', { ...mockSettings, account: '0.0.333333' })
      expect(cache.getStats().size).toBe(3)
    })

    it('should calculate hit rate correctly', () => {
      cache.set('0.0.123456', mockSettings)
      
      cache.get('0.0.123456') // hit
      cache.get('0.0.123456') // hit
      cache.get('0.0.999999') // miss
      cache.get('0.0.123456') // hit
      
      const stats = cache.getStats()
      expect(stats.hits).toBe(3)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBe(0.75) // 3/4 = 0.75
    })

    it('should return 0 hit rate when no requests made', () => {
      const stats = cache.getStats()
      expect(stats.hitRate).toBe(0)
    })

    it('should return 1.0 hit rate when all requests are hits', () => {
      cache.set('0.0.123456', mockSettings)
      
      cache.get('0.0.123456')
      cache.get('0.0.123456')
      cache.get('0.0.123456')
      
      const stats = cache.getStats()
      expect(stats.hitRate).toBe(1.0)
    })

    it('should return 0 hit rate when all requests are misses', () => {
      cache.get('0.0.111111')
      cache.get('0.0.222222')
      cache.get('0.0.333333')
      
      const stats = cache.getStats()
      expect(stats.hitRate).toBe(0)
    })

    it('should round hit rate to 2 decimal places', () => {
      cache.set('0.0.123456', mockSettings)
      
      cache.get('0.0.123456') // hit
      cache.get('0.0.999999') // miss
      cache.get('0.0.999999') // miss
      
      const stats = cache.getStats()
      // 1 hit, 2 misses = 1/3 = 0.333...
      expect(stats.hitRate).toBe(0.33)
    })

    it('should provide complete statistics object', () => {
      cache.set('0.0.123456', mockSettings)
      cache.set('0.0.789012', { ...mockSettings, account: '0.0.789012' })
      
      cache.get('0.0.123456') // hit
      cache.get('0.0.999999') // miss
      
      const stats = cache.getStats()
      
      expect(stats).toHaveProperty('hits')
      expect(stats).toHaveProperty('misses')
      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('hitRate')
      
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)
      expect(stats.size).toBe(2)
      expect(stats.hitRate).toBe(0.5)
    })
  })

  describe('Automatic Cleanup', () => {
    it('should automatically clean up expired entries', async () => {
      // Use fake timers for this test
      vi.useFakeTimers()
      
      const testCache = new SettingsCache(100) // 100ms TTL
      
      testCache.set('0.0.111111', { ...mockSettings, account: '0.0.111111' })
      testCache.set('0.0.222222', { ...mockSettings, account: '0.0.222222' })
      
      expect(testCache.getStats().size).toBe(2)
      
      // Advance time past TTL
      vi.advanceTimersByTime(150)
      
      // Trigger cleanup (runs every 60 seconds)
      vi.advanceTimersByTime(60 * 1000)
      
      // Entries should be cleaned up
      expect(testCache.getStats().size).toBe(0)
      
      testCache.destroy()
      vi.useRealTimers()
    })
  })

  describe('Destroy Method', () => {
    it('should stop cleanup interval and clear cache', () => {
      cache.set('0.0.123456', mockSettings)
      
      expect(cache.getStats().size).toBe(1)
      
      cache.destroy()
      
      expect(cache.getStats().size).toBe(0)
    })

    it('should be safe to call destroy multiple times', () => {
      expect(() => {
        cache.destroy()
        cache.destroy()
        cache.destroy()
      }).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty account ID', () => {
      cache.set('', mockSettings)
      
      const result = cache.get('')
      expect(result).toEqual(mockSettings)
    })

    it('should handle very long account IDs', () => {
      const longAccountId = '0.0.' + '1'.repeat(1000)
      cache.set(longAccountId, mockSettings)
      
      const result = cache.get(longAccountId)
      expect(result).toEqual(mockSettings)
    })

    it('should handle zero TTL', async () => {
      cache.set('0.0.123456', mockSettings, 0)
      
      // Wait a tiny bit to ensure expiration
      await new Promise(resolve => setTimeout(resolve, 1))
      
      // Should be expired
      const result = cache.get('0.0.123456')
      expect(result).toBeNull()
    })

    it('should handle negative TTL', () => {
      cache.set('0.0.123456', mockSettings, -1000)
      
      // Should be immediately expired
      const result = cache.get('0.0.123456')
      expect(result).toBeNull()
    })

    it('should handle very large TTL', () => {
      const largeCache = new SettingsCache(Number.MAX_SAFE_INTEGER)
      largeCache.set('0.0.123456', mockSettings)
      
      const result = largeCache.get('0.0.123456')
      expect(result).toEqual(mockSettings)
      
      largeCache.destroy()
    })
  })
})
