export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface SoftDeletable {
  deletedAt: Date | null
}

export interface Auditable {
  createdBy: string
  updatedBy: string
}

export interface TenantScoped {
  organizationId: string
}
