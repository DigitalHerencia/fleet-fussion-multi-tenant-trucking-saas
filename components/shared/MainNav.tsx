import Link from "next/link"
import { cn } from "@/lib/utils"
import { Home, Truck, Users, ClipboardList, FileText, BarChart2, Settings, ChevronLeft, ChevronRight, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SignOutButton } from "@/components/shared/SignOutButton"
import { RouteProtection } from "@/lib/auth/permissions"
import type { UserContext } from "@/types/auth"

// Utility: Get dashboard path by role (same as in middleware)
function getDashboardPath(userContext: UserContext): string {
  const orgId = userContext.organizationId
  const userId = userContext.userId
  return `/${orgId}/dashboard/${userId}`
}

interface MainNavProps {
  className?: string
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  userContext: UserContext // <-- Pass this from your layout/page
}

export function MainNav({ className, collapsed, setCollapsed, userContext }: MainNavProps) {
  const { organizationId: orgId, userId } = userContext

  // All tenant-aware links, with RBAC checks
  const navLinks = [
    {
      key: "dashboard",
      href: `/${orgId}/dashboard/${userId}`,
      label: "Dashboard",
      icon: <Home />,
      canAccess: RouteProtection.canAccessRoute(userContext, `/${orgId}/dashboard/${userId}`),
    },
    {
      key: "dispatch",
      href: `/${orgId}/dispatch`,
      label: "Dispatch",
      icon: <ClipboardList />,
      canAccess: RouteProtection.canAccessRoute(userContext, `/${orgId}/dispatch`),
    },
    {
      key: "drivers",
      href: `/${orgId}/drivers/${userId}`,
      label: "Drivers",
      icon: <Users />,
      canAccess: RouteProtection.canAccessRoute(userContext, `/${orgId}/drivers/${userId}`),
    },
    {
      key: "vehicles",
      href: `/${orgId}/vehicles`,
      label: "Vehicles",
      icon: <Truck />,
      canAccess: RouteProtection.canAccessRoute(userContext, `/${orgId}/vehicles`),
    },
    {
      key: "compliance",
      href: `/${orgId}/compliance/${userId}`,
      label: "Compliance",
      icon: <FileText />,
      canAccess: RouteProtection.canAccessRoute(userContext, `/${orgId}/compliance/${userId}`),
    },
    {
      key: "ifta",
      href: `/${orgId}/ifta`,
      label: "IFTA",
      icon: <Activity />,
      canAccess: RouteProtection.canAccessRoute(userContext, `/${orgId}/ifta`),
    },
    {
      key: "analytics",
      href: `/${orgId}/analytics`,
      label: "Analytics",
      icon: <BarChart2 />,
      canAccess: RouteProtection.canAccessRoute(userContext, `/${orgId}/analytics`),
    },
  ]

  const settingsLink = {
    key: "settings",
    href: `/${orgId}/settings`,
    label: "Settings",
    icon: <Settings />,
    canAccess: RouteProtection.canAccessRoute(userContext, `/${orgId}/settings`),
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 bottom-0 z-40 flex flex-col border-r border-grey-600 bg-blue-600/30 backdrop-blur-lg shadow-xl transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-72",
        className
      )}
      data-collapsed={collapsed}
    >
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Navigation Links */}
        <nav className="flex-1 px-8 py-4 mt-6 space-y-4">
          {navLinks
            .filter(link => link.canAccess)
            .map(link => (
              <SidebarLink
                key={link.key}
                href={link.href}
                icon={link.icon}
                collapsed={collapsed}
              >
                {link.label}
              </SidebarLink>
            ))}
        </nav>

        {/* Bottom Settings Link */}
        <div className="px-2 py-4 border-t border-[hsl(var(--sidebar-border))]/60">
          {settingsLink.canAccess && (
            <SidebarLink
              href={settingsLink.href}
              icon={settingsLink.icon}
              collapsed={collapsed}
            >
              {settingsLink.label}
            </SidebarLink>
          )}
          {/* Sign Out Button */}
          <div className={cn(collapsed ? "flex justify-center" : "mt-4")}>
            <SignOutButton />
          </div>
        </div>

        {/* Collapse Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-3 h-8 w-8 rounded-full border border-[hsl(var(--sidebar-border))] bg-black shadow-md hover:bg-[hsl(var(--sidebar-accent))]"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-zinc-400" />
          )}
        </Button>
      </div>
    </aside>
  )
}

function SidebarLink({ href, children, icon, collapsed }: { href: string; children: React.ReactNode; icon: React.ReactNode; collapsed: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-zinc-300 font-medium transition-all duration-200 hover:text-white hover:bg-zinc-800/70 group sidebar-link",
        collapsed ? "justify-center px-2" : "justify-start",
        "hover:shadow-md",
      )}
    >
      <span className="w-5 h-5 flex-shrink-0 group-hover:text-primary transition-colors duration-200">{icon}</span>
      {!collapsed && <span className="truncate text-base">{children}</span>}
    </Link>
  )
}

// Add sidebar-link styles via Tailwind in globals.css or as a component if not present:
// .sidebar-link { @apply text-base font-medium rounded-lg px-3 py-2 transition-colors hover:bg-muted hover:text-primary text-muted-foreground; }
