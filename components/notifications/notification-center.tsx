"use client";

import { useEffect, useState } from "react";
import { BellIcon, CheckCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
} from "@/lib/actions/notifications";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
  type: string;
  data?: any;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Get user and company from hooks
  const { user } = useCurrentUser();
  const { companyId } = useCurrentCompany();

  const userId = user?.id;

  const fetchNotifications = async () => {
    if (!userId || !companyId) return;
    try {
      // Fetch notifications and count in parallel
      const [userNotifications, count] = await Promise.all([
        getUserNotifications(userId, companyId),
        getUnreadNotificationCount(userId, companyId),
      ]);

      setNotifications(userNotifications as Notification[]);
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      // Handle error (e.g., show a toast)
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId, companyId]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId || !companyId) return;
    try {
      await markAllNotificationsRead(userId, companyId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // Periodically refresh notifications and unread count
  useEffect(() => {
    if (!isOpen) return; // Only refresh if the dropdown is open
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [isOpen, userId, companyId]);

  if (!userId || !companyId) {
    return null; // Or some other placeholder if user/company not available
  }

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0.5 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 md:w-96">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {notifications.length > 0 && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              <CheckCheckIcon className="mr-1 h-3 w-3" /> Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <DropdownMenuItem
            disabled
            className="text-center text-muted-foreground py-4"
          >
            No new notifications
          </DropdownMenuItem>
        ) : (
          <ScrollArea className="h-[300px] md:h-[400px]">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start gap-1 p-3 border-b ${
                  notification.read ? "opacity-60" : "font-semibold"
                }`}
                onSelect={(e) => e.preventDefault()} // Prevent closing on item click
              >
                <div className="flex justify-between w-full items-center">
                  <span className="text-sm">{notification.title}</span>
                  {!notification.read && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="h-6 px-1.5 text-xs"
                    >
                      Mark read
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-tight">
                  {notification.body}
                </p>
                <p className="text-xs text-muted-foreground/80">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center">
          {/* TODO: Link to a page with all notifications */}
          <Button variant="link" size="sm" className="w-full">
            View all notifications
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
