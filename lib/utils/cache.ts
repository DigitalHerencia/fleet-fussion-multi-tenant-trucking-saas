/**
 * Centralized caching utility for data fetchers
 * Provides TTL-based caching with automatic cleanup
 */

// Cache for data fetchers with TTL-based expiration
const dataCache = new Map<string, {
  data: any;
  timestamp: number;
  ttl: number;
}>();

export const CACHE_TTL = {
  DATA: 5 * 60 * 1000, // 5 minutes cache for general data queries
  KPI: 2 * 60 * 1000,  // 2 minutes cache for KPIs (more frequent updates)
  SHORT: 1 * 60 * 1000, // 1 minute cache for rapidly changing data
} as const;

/**
 * Get cached data if available and not expired
 */
export function getCachedData<T>(key: string): T | null {
  const cached = dataCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  if (cached) {
    dataCache.delete(key);
  }
  return null;
}

/**
 * Set cached data with specified TTL
 */
export function setCachedData<T>(key: string, data: T, ttl: number = CACHE_TTL.DATA): void {
  dataCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

/**
 * Invalidate cache entries for a specific organization or type
 */
export function invalidateCache(organizationId: string, type?: 'kpis' | 'loads' | 'vehicles' | 'drivers'): void {
  if (type) {
    // Invalidate specific cache type
    const patterns = [
      `${type}:${organizationId}:`,
      `batch:${organizationId}:`
    ];
    
    for (const [key] of dataCache) {
      if (patterns.some(pattern => key.startsWith(pattern))) {
        dataCache.delete(key);
      }
    }
  } else {
    // Invalidate all cache for the organization
    for (const [key] of dataCache) {
      if (key.includes(`${organizationId}:`)) {
        dataCache.delete(key);
      }
    }
  }
}

/**
 * Cleanup expired cache entries
 */
export function cleanupExpiredCache(): void {
  const now = Date.now();
  for (const [key, value] of dataCache) {
    if (now - value.timestamp >= value.ttl) {
      dataCache.delete(key);
    }
  }
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats() {
  return {
    size: dataCache.size,
    keys: Array.from(dataCache.keys()),
  };
}

/**
 * Clear all cache entries
 */
export function clearCache(): void {
  dataCache.clear();
}

// Set up periodic cache cleanup
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredCache, 60 * 1000); // Clean up every minute
}

// Graceful shutdown cleanup
if (typeof process !== 'undefined') {
  const cleanup = () => {
    dataCache.clear();
  };
  
  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}
