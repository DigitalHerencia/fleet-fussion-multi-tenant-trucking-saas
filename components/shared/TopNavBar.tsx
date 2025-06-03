"use client"

import { useAuth } from "@/components/auth/context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, MapPinned, Menu, Moon, User } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface TopNavBarProps {
  className?: string
}

export function TopNavBar({ className }: TopNavBarProps) {
  const { user, organization } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    router.push("/login")
  }

  if (!user || !organization) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-16 bg-black border-b border-gray-200 shadow-lg">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Logo Placeholder */}
        <div className="flex items-center">
          <div>
            <div className="flex flex-1 items-center">
              <Link className="flex items-center justify-center hover:text-blue-500 hover:underline underline-offset-4" href="/">
               <MapPinned className="h-6 w-6 text-blue-500 mr-1" />
               <span className="font-extrabold text-white dark:text-white text-2xl">FleetFusion</span>
              </Link>
            </div>                
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Company Name */}
          <span className="text-xl font-medium text-zinc-200 hidden sm:block">
            {organization.name || " "}
          </span>
          {/* Notifications */}
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" className="h-7 w-7 p-0 border border-zinc-400 rounded-4xl relative hover:bg-zinc-900">
              <Bell className="h-4 w-4 text-zinc-400" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
              >
              </Badge>
            </Button>
          </div>
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2">
            <Button variant="default" size="sm" className="h-7 w-7 p-0 border border-zinc-400 rounded-4xl relative hover:bg-zinc-900">
              <Menu className="h-4 w-4 text-gray-400" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
              >
              </Badge>
            </Button>
          </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2 bg-black border-gray-700" align="end">
              <div className="flex items-center gap-3 px-2 py-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.profileImage} alt={user.name} />
                  <AvatarFallback className="bg-gray-600 text-gray-200">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-sm font-semibold leading-tight text-zinc-200">{user.name}</span>
                  <span className="truncate text-xs text-zinc-200">{user.email}</span>
                  <Badge className="mt-1 bg-blue-500 text-zinc-200 text-xs text-center">{organization.name}</Badge>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-gray-600" />
              <DropdownMenuItem className="rounded-md px-3 py-2 hover:bg-gray-600 transition-colors cursor-pointer text-zinc-200">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-md px-3 py-2 hover:bg-gray-600 transition-colors cursor-pointer text-zinc-200">
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-600" />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="rounded-md px-3 py-2 text-red-400 hover:bg-red-500/10 cursor-pointer"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
