import Link from "next/link"
import { cn } from "@/lib/utils/utils"
import { Home, Truck, Users, ClipboardList, FileText, BarChart2, Settings, ChevronLeft, ChevronRight, Activity, LogOut } from "lucide-react"
import { useClerk } from '@clerk/nextjs'

// MainNavProps interface: defines props for MainNav component
interface MainNavProps {
  className?: string
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  orgId: string
  userId: string
}

// MainNav component: renders the sidebar navigation
export function MainNav({ className, collapsed, setCollapsed, orgId, userId }: MainNavProps) {
  const { signOut } = useClerk()

  // navLinks: array of navigation link objects for the sidebar
  const navLinks = [
    {
      key: "dashboard",
      href: `/${orgId}/dashboard/${userId}`,
      label: "Dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      key: "dispatch",
      href: `/${orgId}/dispatch/${userId}`,
      label: "Dispatch",
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      key: "drivers",
      href: `/${orgId}/drivers/${userId}`,
      label: "Drivers",
      icon: <Users className="h-5 w-5" />,
    },
    {
      key: "vehicles",
      href: `/${orgId}/vehicles`,
      label: "Vehicles",
      icon: <Truck className="h-5 w-5" />,
    },
    {
      key: "compliance",
      href: `/${orgId}/compliance/${userId}`,
      label: "Compliance",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      key: "ifta",
      href: `/${orgId}/ifta`,
      label: "IFTA",
      icon: <Activity className="h-5 w-5" />,
    },
    {
      key: "analytics",
      href: `/${orgId}/analytics`,
      label: "Analytics",
      icon: <BarChart2 className="h-5 w-5" />,
    },  
    {
      key: "settings",
      href: `/${orgId}/settings`,
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      key: "signout",
      href: "#",
      label: "Sign Out",
      icon: <LogOut className="h-5 w-5" />,
      // Sign Out handler
      onClick: async (e: React.MouseEvent) => {
        e.preventDefault()
        await signOut({ redirectUrl: '/' })
      },
    },
  ]


  return (
    // Sidebar container
    <aside
      className={cn(
        "fixed left-0 top-16 bottom-0 z-40 flex flex-col border-r border-gray-200 bg-blue-500/60 shadow-xl transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64",
        className
      )}
      data-collapsed={collapsed}
    >
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Navigation Links Section */}
        <nav className="flex-1 px-8 py-4 mt-6 space-y-4">
          {navLinks.map(link => (
            <SidebarLink
              key={link.key}
              href={link.href}
              icon={link.icon}
              collapsed={collapsed}
              // Pass onClick if present (for Sign Out)
              {...(link.onClick ? { onClick: link.onClick } : {})}
            >
              {link.label}
            </SidebarLink>
          ))}
        </nav>
        {/* Collapse Sidebar Button */}
        <button
          className="absolute -right-4 top-3 h-8 w-8 rounded-full border border-b bg-black shadow-md flex items-center justify-center hover:bg-gray-900"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-zinc-400 mx-auto my-auto" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-zinc-400 mx-auto my-auto" />
          )}
        </button>
      </div>
    </aside>
  )
}

// SidebarLink component: renders a single sidebar navigation link
function SidebarLink({
  href,
  children,
  icon,
  collapsed,
  onClick,
}: {
  href: string
  children: React.ReactNode
  icon: React.ReactNode
  collapsed: boolean
  onClick?: (e: React.MouseEvent) => void
}) {
  // If onClick is provided, render as a button for accessibility (e.g., Sign Out)
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2 text-zinc-200 font-medium transition-all duration-300 ease-in-out w-full text-left",
          collapsed ? "justify-center px-2" : "justify-start",
          "hover:shadow-md",
        )}
        type="button"
      >
        <span className="w-5 h-5 flex-shrink-0 group-hover:text-primary transition-all duration-300 ease-in-out">{icon}</span>
        {!collapsed && <span className="truncate text-base transition-all duration-300 ease-in-out">{children}</span>}
      </button>
    )
  }
  // Default: render as a Link
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-zinc-200 font-medium transition-all duration-300 ease-in-out",
        collapsed ? "justify-center px-2" : "justify-start",
        "hover:shadow-md",
      )}
    >
      <span className="w-5 h-5 flex-shrink-0 group-hover:text-primary transition-all duration-300 ease-in-out">{icon}</span>
      {!collapsed && <span className="truncate text-base transition-all duration-300 ease-in-out">{children}</span>}
    </Link>
  )
}

// Add sidebar-link styles via Tailwind in globals.css or as a component if not present: