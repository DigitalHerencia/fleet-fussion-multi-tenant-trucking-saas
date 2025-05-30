import Link from "next/link"
import { cn } from "@/lib/utils"
import { Home, Truck, Users, ClipboardList, FileText, BarChart2, Settings, ChevronLeft, ChevronRight, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SignOutButton } from "@/components/shared/sign-out-button"

interface MainNavProps {
  className?: string
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

export function MainNav({ className, collapsed, setCollapsed }: MainNavProps) {
  return (
    <aside
      className={cn(
        // Modern glassmorphism sidebar
        "fixed left-0 top-16 bottom-0 z-40 flex flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))] backdrop-blur-lg shadow-xl transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-72",
        className
      )}
      data-collapsed={collapsed}
    >
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Navigation Links */}
        <nav className="flex-1 px-8 py-4 mt-6 space-y-4">
          <SidebarLink href="/dashboard" icon={<Home />} collapsed={collapsed}>Dashboard</SidebarLink>
          <SidebarLink href="/dispatch" icon={<ClipboardList />} collapsed={collapsed}>Dispatch</SidebarLink>
          <SidebarLink href="/drivers" icon={<Users />} collapsed={collapsed}>Drivers</SidebarLink>
          <SidebarLink href="/vehicles" icon={<Truck />} collapsed={collapsed}>Vehicles</SidebarLink>
          <SidebarLink href="/compliance" icon={<FileText />} collapsed={collapsed}>Compliance</SidebarLink>
          <SidebarLink href="/ifta" icon={<Activity />} collapsed={collapsed}>IFTA</SidebarLink>
          <SidebarLink href="/analytics" icon={<BarChart2 />} collapsed={collapsed}>Analytics</SidebarLink>
        </nav>

        {/* Bottom Settings Link */}
        <div className="px-2 py-4 border-t border-[hsl(var(--sidebar-border))]/60">
          <SidebarLink href="/settings" icon={<Settings />} collapsed={collapsed}>Settings</SidebarLink>
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
  // Highlight active link (optional: add logic for active route)
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-zinc-300 font-medium transition-all duration-200 hover:text-white hover:bg-zinc-800/70 group sidebar-link",
        collapsed ? "justify-center px-2" : "justify-start",
        // Add shadow and icon highlight on hover
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
