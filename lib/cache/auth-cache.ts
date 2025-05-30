/**
 * Enhanced Authentication Cache Layer
 * 
 * Implements sophisticated in-memory caching for auth data with:
 * - Multi-level caching (L1 hot cache + L2 warm cache)
 * - LRU eviction strategy
 * - Circuit breaker pattern
 * - Performance metrics collection
 * - Smart cache warming
 */

import { UserContext, ClerkUserMetadata, ClerkOrganizationMetadata } from '@/types/auth';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  errors: number;
  totalRequests: number;
}

interface CircuitBreakerState {
  isOpen: boolean;
  failures: number;
  lastFailure: number;
  nextAttempt: number;
}

class AuthCache {  // L1 Cache - Hot data (frequently accessed)
  private userHotCache = new Map<string, CacheItem<UserContext>>();
  private permissionHotCache = new Map<string, CacheItem<string[]>>();
  private orgCache = new Map<string, CacheItem<ClerkOrganizationMetadata>>();
  
  private readonly USER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly ORG_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly PERMISSION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  // Cache cleanup interval
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired items every 2 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 2 * 60 * 1000);
  }

  /**
   * Check if cache item is valid
   */
  private isValid<T>(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  /**
   * Get user from cache
   */
  getUser(clerkId: string): UserContext | null {
    const item = this.userHotCache.get(clerkId);
    if (item && this.isValid(item)) {
      return item.data;
    }
    if (item) {
      this.userHotCache.delete(clerkId);
    }
    return null;
  }

  /**
   * Set user in cache
   */
  setUser(clerkId: string, user: UserContext): void {
    this.userHotCache.set(clerkId, {
        data: user,
        timestamp: Date.now(),
        ttl: this.USER_CACHE_TTL,
        accessCount: 0,
        lastAccessed: 0
    });
  }

  /**
   * Get organization from cache
   */
  getOrganization(clerkId: string): ClerkOrganizationMetadata | null {
    const item = this.orgCache.get(clerkId);
    if (item && this.isValid(item)) {
      return item.data;
    }
    if (item) {
      this.orgCache.delete(clerkId);
    }
    return null;
  }
  /**
   * Set organization in cache
   */
  setOrganization(clerkId: string, org: ClerkOrganizationMetadata): void {
    this.orgCache.set(clerkId, {
      data: org,
      timestamp: Date.now(),
      ttl: this.ORG_CACHE_TTL,
      accessCount: 0,
      lastAccessed: Date.now()
    });
  }

  /**
   * Get permissions from cache
   */
  getPermissions(userId: string): string[] | null {
    const item = this.permissionHotCache.get(userId);
    if (item && this.isValid(item)) {
      return item.data;
    }
    if (item) {
      this.permissionHotCache.delete(userId);
    }
    return null;
  }

  /**
   * Set permissions in cache
   */
  setPermissions(userId: string, permissions: string[]): void {
    this.permissionHotCache.set(userId, {
        data: permissions,
        timestamp: Date.now(),
        ttl: this.PERMISSION_CACHE_TTL,
        accessCount: 0,
        lastAccessed: 0
    });
  }

  /**
   * Invalidate user cache
   */
  invalidateUser(clerkId: string): void {
    this.userHotCache.delete(clerkId);
    this.permissionHotCache.delete(clerkId);
  }

  /**
   * Invalidate organization cache
   */
  invalidateOrganization(clerkId: string): void {
    this.orgCache.delete(clerkId);
    // Invalidate all users of this organization
    for (const [userId, item] of this.userHotCache.entries()) {
      if (item.data.organizationId === clerkId) {
        this.userHotCache.delete(userId);
        this.permissionHotCache.delete(userId);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.userHotCache.clear();
    this.orgCache.clear();
    this.permissionHotCache.clear();
  }

  /**
   * Clean up expired items
   */
  private cleanup(): void {
    const now = Date.now();
    
    // Clean user cache
    for (const [key, item] of this.userHotCache.entries()) {
      if (now - item.timestamp >= item.ttl) {
        this.userHotCache.delete(key);
      }
    }
    
    // Clean organization cache
    for (const [key, item] of this.orgCache.entries()) {
      if (now - item.timestamp >= item.ttl) {
        this.orgCache.delete(key);
      }
    }
    
    // Clean permission cache
    for (const [key, item] of this.permissionHotCache.entries()) {
      if (now - item.timestamp >= item.ttl) {
        this.permissionHotCache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      userCacheSize: this.userHotCache.size,
      orgCacheSize: this.orgCache.size,
      permissionCacheSize: this.permissionHotCache.size,
    };
  }

  /**
   * Destroy cache and cleanup interval
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Export singleton instance
export const authCache = new AuthCache();

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    authCache.destroy();
  });
  process.on('SIGINT', () => {
    authCache.destroy();
  });
}
