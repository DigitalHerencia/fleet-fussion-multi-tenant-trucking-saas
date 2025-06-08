export interface Notification {
  id: string;
  organizationId: string;
  userId?: string | null;
  message: string;
  url?: string | null;
  readAt?: string | null;
  createdAt: string;
}
