// Strong Clerk webhook event types for use in API handlers

export type ClerkWebhookEventType =
  | "user.created"
  | "user.updated"
  | "user.deleted"
  | "organization.created"
  | "organization.updated"
  | "organization.deleted"
  | "organizationMembership.created"
  | "organizationMembership.updated"
  | "organizationMembership.deleted";

export interface ClerkWebhookBaseEvent<TType extends ClerkWebhookEventType, TData = any> {
  object: "event";
  type: TType;
  data: TData;
}

// User event data
export interface ClerkUserEventData {
  id: string;
  email_addresses?: Array<{ id: string; email_address: string }>;
  first_name?: string;
  last_name?: string;
  // Add more fields as needed
}

// Organization event data
export interface ClerkOrganizationEventData {
  id: string;
  name: string;
  // Add more fields as needed
}

// Organization membership event data
export interface ClerkOrganizationMembershipEventData {
  organization: { id: string };
  publicUserData: { userId: string };
  role: string;
  // Add more fields as needed
}

export type ClerkWebhookEvent =
  | ClerkWebhookBaseEvent<"user.created", ClerkUserEventData>
  | ClerkWebhookBaseEvent<"user.updated", ClerkUserEventData>
  | ClerkWebhookBaseEvent<"user.deleted", ClerkUserEventData>
  | ClerkWebhookBaseEvent<"organization.created", ClerkOrganizationEventData>
  | ClerkWebhookBaseEvent<"organization.updated", ClerkOrganizationEventData>
  | ClerkWebhookBaseEvent<"organization.deleted", ClerkOrganizationEventData>
  | ClerkWebhookBaseEvent<"organizationMembership.created", ClerkOrganizationMembershipEventData>
  | ClerkWebhookBaseEvent<"organizationMembership.updated", ClerkOrganizationMembershipEventData>
  | ClerkWebhookBaseEvent<"organizationMembership.deleted", ClerkOrganizationMembershipEventData>;
