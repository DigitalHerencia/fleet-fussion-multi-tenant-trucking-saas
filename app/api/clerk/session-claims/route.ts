import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';

import  db  from '@/lib/database/db';
import { getPermissionsForRole, type SystemRole } from '@/types/abac';
import type { UserSessionAttributes } from '@/types/abac';

/**
 * Custom Session Claims API for FleetFusion ABAC
 * 
 * This endpoint is called by Clerk to enrich JWT tokens with custom claims.
 * It adds organizationId, role, and permissions to the JWT for server-side ABAC.
 * 
 * @see https://clerk.com/docs/backend-requests/making/custom-session-token
 */

// Validation schema for Clerk session claims request
const SessionClaimsRequestSchema = z.object({
  session_id: z.string(),
  user_id: z.string(),
  template_name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Verify request is from Clerk
    const authToken = req.headers.get('authorization');
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Invalid authorization header' },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await req.json();
    const { session_id, user_id } = SessionClaimsRequestSchema.parse(body);

    console.log('🔐 Processing session claims request:', {
      sessionId: session_id,
      userId: user_id,
      timestamp: new Date().toISOString(),
    });

    // Get user from Clerk to access metadata
    const resolvedClerkClient = await clerkClient();
    const clerkUser = await resolvedClerkClient.users.getUser(user_id);

    if (!clerkUser) {
      console.error('❌ User not found in Clerk:', user_id);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user from database for additional context
    let dbUser;
    try {
      dbUser = await db.user.findUnique({
        where: { clerkId: user_id },
        include: {
          organization: {
            select: {
              id: true,
              slug: true,
              name: true,
              subscriptionTier: true,
              subscriptionStatus: true,
              isActive: true,
            },
          },
        },
      });
    } catch (dbError) {
      console.warn('⚠️ Database user lookup failed, using Clerk metadata:', dbError);
    }

    // Extract user metadata from Clerk (fallback to database)
    const privateMetadata = clerkUser.privateMetadata as any;
    const publicMetadata = clerkUser.publicMetadata as any;

    // Determine organization ID (prioritize database, fallback to metadata)
    const organizationId =
      dbUser?.organizationId ||
      privateMetadata?.organizationId ||
      publicMetadata?.organizationId ||
      '';

    // Determine user role (prioritize database, fallback to metadata)
    const userRole: SystemRole =
      dbUser?.role ||
      privateMetadata?.role ||
      publicMetadata?.role ||
      'member'; // Default role

    // Get permissions for the role
    const permissions = getPermissionsForRole(userRole);

    // Check if onboarding is complete
    const onboardingComplete =
      dbUser?.onboardingComplete ||
      privateMetadata?.onboardingComplete ||
      publicMetadata?.onboardingComplete ||
      false;

    // Build ABAC session attributes
    const sessionAttributes: UserSessionAttributes = {
      role: userRole,
      organizationId,
      permissions,
    };

    // Build custom claims for JWT
    const customClaims = {
      // ABAC attributes (primary)
      abac: sessionAttributes,

      // Organization context
      'org.id': organizationId,
      'org.name': dbUser?.organization?.name || '',
      'org.role': userRole,

      // User context
      'user.id': user_id,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      primaryEmail: clerkUser.primaryEmailAddress?.emailAddress,
      fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),

      // Permissions for legacy compatibility
      'org_membership.permissions': permissions,

      // Public metadata
      publicMetadata: {
        onboardingComplete,
        organizationId,
        role: userRole,
      },

      // Organization info for client-side routing
      'user.organizations': organizationId ? [organizationId] : [],

      // Metadata for backward compatibility
      metadata: {
        organizationId,
        role: userRole,
        permissions: permissions,
        isActive: dbUser?.isActive ?? true,
        lastLogin: dbUser?.lastLogin?.toISOString() || new Date().toISOString(),
        onboardingComplete,
      },
    };

    console.log('✅ Generated session claims:', {
      userId: user_id,
      organizationId,
      role: userRole,
      permissionsCount: permissions.length,
      onboardingComplete,
      hasDbUser: !!dbUser,
    });

    // Return claims to Clerk
    return NextResponse.json(customClaims);

  } catch (error: any) {
    console.error('❌ Session claims generation failed:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    // Return empty claims to prevent JWT failures
    return NextResponse.json(
      {
        error: 'Session claims generation failed',
        fallback: {
          'user.id': '',
          'org.id': '',
          'org.role': 'member',
          abac: {
            role: 'member',
            organizationId: '',
            permissions: [],
          },
          metadata: {
            organizationId: '',
            role: 'member',
            permissions: [],
            isActive: true,
            onboardingComplete: false,
          },
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint for session claims API
 */
export async function GET(req: NextRequest) {
  try {
    const healthCheck = {
      status: 'healthy',
      service: 'session-claims-api',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      checks: {
        database: 'checking...',
        clerk: 'checking...',
      },
    };

    // Test database connection
    try {
      await db.$queryRaw`SELECT 1`;
      healthCheck.checks.database = 'healthy';
    } catch (dbError) {
      healthCheck.checks.database = 'unhealthy';
      console.error('Database health check failed:', dbError);
    }

    // Test Clerk client
    try {
      const resolvedClerkClient = await clerkClient();
      await resolvedClerkClient.users.getCount();
      healthCheck.checks.clerk = 'healthy';
    } catch (clerkError) {
      healthCheck.checks.clerk = 'unhealthy';
      console.error('Clerk health check failed:', clerkError);
    }

    const isHealthy = Object.values(healthCheck.checks).every(
      (status) => status === 'healthy'
    );

    return NextResponse.json(healthCheck, {
      status: isHealthy ? 200 : 503,
    });

  } catch (error: any) {
    console.error('Session claims health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
