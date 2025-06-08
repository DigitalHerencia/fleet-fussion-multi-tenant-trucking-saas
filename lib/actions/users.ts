'use server'

import { revalidatePath } from 'next/cache'
import { clerkClient, auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/auth'
import { canManageUsers } from '@/lib/auth/permissions'
import { logAuditEvent } from '@/lib/actions/auditActions'
import type { ActionResult } from '@/types/auth'

const idSchema = z.string().min(1)

export async function revokeInvitation(invitationId: string): Promise<ActionResult> {
  const parsed = idSchema.safeParse(invitationId)
  if (!parsed.success) {
    return { success: false, error: 'Invalid invitation id' }
  }

  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  if (!canManageUsers(user)) {
    return { success: false, error: 'Permission denied' }
  }

  try {
    const client = await clerkClient()
    await client.invitations.revokeInvitation(invitationId)

    await logAuditEvent('invitation.revoked', 'user', invitationId, {
      revokedBy: user.userId
    })

    revalidatePath(`/app/${user.organizationId}/settings`, 'page')
    return { success: true }
  } catch (error) {
    console.error('Error revoking invitation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to revoke invitation'
    }
  }
}
