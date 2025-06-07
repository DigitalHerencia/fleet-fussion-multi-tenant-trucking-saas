# Monitoring & Observability

This guide covers monitoring, logging, analytics, and observability practices for FleetFusion in production environments.

## Overview

FleetFusion implements comprehensive monitoring across multiple layers to ensure system reliability, performance, and user experience. Our monitoring strategy covers application performance, infrastructure health, business metrics, and security events.

## Application Performance Monitoring

### Vercel Analytics
- **Real User Monitoring (RUM)**: Automatic collection of Core Web Vitals and user experience metrics
- **Performance Insights**: Page load times, TTFB, FCP, LCP, CLS tracking
- **Geographic Performance**: Performance breakdown by user location
- **Device & Browser Analytics**: Performance across different platforms

### Next.js Built-in Monitoring
```typescript
// next.config.ts - Performance monitoring configuration
const nextConfig: NextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  // Enable performance monitoring
  analytics: {
    provider: 'vercel',
  },
}
```

### Custom Performance Tracking
```typescript
// lib/monitoring/performance.ts
export function trackPerformance(name: string, fn: () => Promise<any>) {
  return async function(...args: any[]) {
    const start = performance.now();
    try {
      const result = await fn.apply(this, args);
      const duration = performance.now() - start;
      
      // Track to analytics
      if (typeof window !== 'undefined') {
        window.gtag?.('event', 'performance', {
          custom_parameter_name: name,
          value: Math.round(duration),
        });
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`Performance tracking failed for ${name}:`, error);
      throw error;
    }
  };
}
```

## Error Monitoring & Logging

### Error Boundaries
```typescript
// components/shared/error-boundary.tsx
'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Error boundary caught an error:', error, errorInfo);
    
    // Send to external monitoring (implement based on your service)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // Implement error logging to your preferred service
    // Examples: Sentry, LogRocket, Bugsnag, etc.
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Something went wrong
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              We've been notified and are working to fix this issue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Server-Side Error Logging
```typescript
// lib/monitoring/logger.ts
export interface LogContext {
  userId?: string;
  organizationId?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export class Logger {
  static error(message: string, error?: Error, context?: LogContext) {
    const logEntry = {
      level: 'error',
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
      context,
      timestamp: new Date().toISOString(),
    };

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', logEntry);
    }

    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(logEntry);
    }
  }

  static info(message: string, context?: LogContext) {
    const logEntry = {
      level: 'info',
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    console.log('Info:', logEntry);
  }

  static warn(message: string, context?: LogContext) {
    const logEntry = {
      level: 'warn',
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    console.warn('Warning:', logEntry);
  }

  private static sendToLoggingService(logEntry: any) {
    // Implement based on your logging service
    // Examples: Winston, Pino, DataDog, etc.
  }
}
```

## Database Monitoring

### Query Performance Tracking
```typescript
// lib/database/monitoring.ts
import { PrismaClient } from '@prisma/client';

export function createMonitoredPrismaClient(): PrismaClient {
  const prisma = new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' },
    ],
  });

  // Query performance monitoring
  prisma.$on('query' as never, (e: any) => {
    const duration = e.duration;
    const query = e.query;

    // Log slow queries
    if (duration > 1000) { // 1 second threshold
      Logger.warn('Slow query detected', {
        duration,
        query: query.substring(0, 200) + '...', // Truncate for logging
      });
    }

    // Track query metrics
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'database_query', {
        custom_parameter_duration: duration,
        custom_parameter_type: query.split(' ')[0], // SELECT, INSERT, UPDATE, etc.
      });
    }
  });

  prisma.$on('error' as never, (e: any) => {
    Logger.error('Database error', new Error(e.message), {
      target: e.target,
    });
  });

  return prisma;
}
```

### Neon Database Metrics
Monitor key database metrics in Neon dashboard:
- Connection count and connection pooling
- Query execution time and slow queries
- Database size and storage usage
- CPU and memory utilization
- Backup status and point-in-time recovery

## Business Metrics & Analytics

### Key Performance Indicators (KPIs)
```typescript
// lib/analytics/kpis.ts
export interface BusinessMetrics {
  // User engagement
  activeUsers: number;
  sessionDuration: number;
  pageViews: number;
  
  // Fleet operations
  totalVehicles: number;
  activeDrivers: number;
  completedLoads: number;
  onTimeDeliveryRate: number;
  
  // Financial
  revenue: number;
  averageLoadValue: number;
  fuelCosts: number;
  
  // System performance
  errorRate: number;
  averageResponseTime: number;
  systemUptime: number;
}

export async function collectBusinessMetrics(organizationId: string): Promise<BusinessMetrics> {
  // Implement metric collection from various sources
  // This would typically aggregate data from your database
  // and external services
}
```

### Custom Event Tracking
```typescript
// lib/analytics/events.ts
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  organizationId?: string;
}

export class Analytics {
  static track(event: AnalyticsEvent) {
    // Client-side tracking
    if (typeof window !== 'undefined') {
      window.gtag?.('event', event.event, {
        custom_parameter_user_id: event.userId,
        custom_parameter_org_id: event.organizationId,
        ...event.properties,
      });
    }

    // Server-side tracking for important events
    if (this.isImportantEvent(event.event)) {
      this.trackServerSide(event);
    }
  }

  private static isImportantEvent(eventName: string): boolean {
    const importantEvents = [
      'user_signup',
      'organization_created',
      'subscription_changed',
      'load_created',
      'compliance_violation',
    ];
    return importantEvents.includes(eventName);
  }

  private static trackServerSide(event: AnalyticsEvent) {
    // Implement server-side tracking
    // Could be webhook to analytics service, database logging, etc.
  }
}
```

## Security Monitoring

### Audit Logging
```typescript
// lib/monitoring/audit.ts
export interface AuditEvent {
  userId: string;
  organizationId: string;
  action: string;
  resource: string;
  resourceId?: string;
  outcome: 'success' | 'failure';
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAuditEvent(event: AuditEvent) {
  try {
    await prisma.auditLog.create({
      data: {
        ...event,
        timestamp: new Date(),
      },
    });

    // Send critical security events to monitoring
    if (event.outcome === 'failure' || event.action.includes('delete')) {
      Logger.warn('Security audit event', {
        auditEvent: event,
      });
    }
  } catch (error) {
    Logger.error('Failed to log audit event', error as Error, {
      auditEvent: event,
    });
  }
}
```

### Failed Authentication Monitoring
```typescript
// lib/monitoring/auth-monitoring.ts
export async function monitorAuthenticationFailures(
  email: string,
  ipAddress: string,
  reason: string
) {
  // Track failed login attempts
  Analytics.track({
    event: 'authentication_failure',
    properties: {
      email: email.substring(0, 3) + '***', // Partial email for privacy
      reason,
      ipAddress,
    },
  });

  // Implement rate limiting and blocking logic
  await checkForSuspiciousActivity(email, ipAddress);
}

async function checkForSuspiciousActivity(email: string, ipAddress: string) {
  // Implement logic to detect and respond to suspicious activity
  // Could integrate with services like Auth0 Attack Protection or similar
}
```

## Infrastructure Monitoring

### Vercel Function Monitoring
Monitor serverless function performance:
- Execution duration and cold starts
- Memory usage and optimization
- Error rates and timeout monitoring
- Geographic distribution and edge performance

### Health Checks
```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = await Promise.allSettled([
    // Database connectivity
    checkDatabase(),
    // External service connectivity
    checkClerkService(),
    // Cache availability
    checkCacheService(),
  ]);

  const results = checks.map((check, index) => ({
    service: ['database', 'clerk', 'cache'][index],
    status: check.status === 'fulfilled' ? 'healthy' : 'unhealthy',
    details: check.status === 'rejected' ? check.reason : undefined,
  }));

  const overallHealth = results.every(r => r.status === 'healthy') ? 'healthy' : 'unhealthy';

  return Response.json({
    status: overallHealth,
    timestamp: new Date().toISOString(),
    services: results,
  }, {
    status: overallHealth === 'healthy' ? 200 : 503,
  });
}

async function checkDatabase() {
  await prisma.$queryRaw`SELECT 1`;
}

async function checkClerkService() {
  // Implement Clerk service health check
  // Could be a simple API call to Clerk's status endpoint
}

async function checkCacheService() {
  // Implement cache service health check if using external cache
}
```

## Alerting & Notifications

### Error Rate Thresholds
Set up alerts for:
- Error rate > 5% over 5-minute window
- Response time > 2 seconds for 95th percentile
- Database connection failures
- Failed authentication attempts > threshold
- Compliance document expiration warnings

### Integration Examples
```typescript
// lib/monitoring/alerts.ts
export async function sendAlert(severity: 'low' | 'medium' | 'high', message: string, context?: any) {
  const alert = {
    severity,
    message,
    context,
    timestamp: new Date().toISOString(),
    service: 'fleetfusion',
  };

  // Log the alert
  Logger.error(`Alert [${severity.toUpperCase()}]: ${message}`, undefined, context);

  // Send to alerting service (implement based on your choice)
  // Examples: PagerDuty, Slack, email, etc.
  if (severity === 'high') {
    await sendHighPriorityAlert(alert);
  }
}

async function sendHighPriorityAlert(alert: any) {
  // Implement high-priority alert delivery
  // Could be SMS, phone call, PagerDuty, etc.
}
```

## Dashboard & Visualization

### Key Metrics Dashboard
Create monitoring dashboards that track:

**System Health**
- Application uptime and availability
- Response time trends
- Error rate trends
- Database performance metrics

**Business Metrics**
- Active users and session analytics
- Fleet utilization metrics
- Revenue and billing metrics
- Compliance status overview

**Security Metrics**
- Authentication success/failure rates
- Suspicious activity detection
- Audit log summaries
- Permission change tracking

## Best Practices

### Monitoring Strategy
1. **Layer Monitoring**: Monitor at application, infrastructure, and business levels
2. **Proactive Alerting**: Set up alerts before issues impact users
3. **Data Retention**: Keep monitoring data for trend analysis and capacity planning
4. **Privacy Compliance**: Ensure monitoring respects user privacy and GDPR requirements

### Performance Optimization
1. **Efficient Logging**: Use structured logging and avoid excessive log volume
2. **Sampling**: Implement sampling for high-volume events to manage costs
3. **Async Processing**: Process monitoring data asynchronously to avoid performance impact
4. **Resource Monitoring**: Monitor CPU, memory, and bandwidth usage

### Security Considerations
1. **Sensitive Data**: Never log sensitive information like passwords or PII
2. **Access Control**: Restrict access to monitoring data and dashboards
3. **Audit Trail**: Maintain audit trails for monitoring system access
4. **Encryption**: Encrypt monitoring data in transit and at rest

---

## Integration with External Services

### Recommended Monitoring Stack
- **APM**: Vercel Analytics + custom performance tracking
- **Error Tracking**: Sentry or LogRocket for detailed error analysis
- **Logging**: Winston or Pino for structured server-side logging
- **Alerting**: PagerDuty or Slack for incident management
- **Business Intelligence**: Custom dashboards with Chart.js or similar

This monitoring setup provides comprehensive visibility into FleetFusion's performance, security, and business metrics while maintaining the scalability and reliability expected from a production SaaS platform.
