"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { BookOpen, LayoutDashboard, SquareStack, Brain, LogOut, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useRef } from "react"

export function NavBar() {
  const pathname = usePathname()
  const { logout, user, refreshProfilePhoto } = useAuth()
  const hasRefreshed = useRef(false)

  // Refresh profile photo on mount (only once)
  useEffect(() => {
    if (user && !hasRefreshed.current) {
      hasRefreshed.current = true
      refreshProfilePhoto().catch(err => {
        console.error('Failed to refresh profile photo:', err)
      })
    }
  }, [user, refreshProfilePhoto])

  // Get profile picture from OAuth prefs or use Appwrite's avatar service
  const profilePicture = user?.prefs?.picture || user?.prefs?.avatar_url || 
    (user ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&size=128` : null)

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/flashcards", label: "Flashcards", icon: SquareStack },
    { href: "/quiz", label: "Quiz", icon: Brain },
  ]

  return (
    <nav className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Verbal Nova</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "gap-2 hover:bg-white/10 text-white hover:text-white",
                      isActive && "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-white/20 text-white",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {user ? (
                  <Button variant="ghost" size="icon" className="rounded-full bg-blue-500/20 hover:bg-blue-500/30 p-0">
                    <Avatar className="h-8 w-8">
                      {profilePicture && (
                        <AvatarImage 
                          src={profilePicture} 
                          alt={user.name || "User"} 
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <AvatarFallback className="bg-blue-500/50 text-white">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="rounded-full bg-blue-500/20 hover:bg-blue-500/30">
                    <Menu className="h-5 w-5 text-blue-300" />
                  </Button>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card border-white/20 min-w-[180px]">
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                {user ? (
                  <>
                    <DropdownMenuItem className="cursor-default">
                      <span className="text-sm text-gray-300">{user.name ?? "Profile"} ({user.email})</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-white hover:bg-white/10">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login">Log in</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/signup">Get Started</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {user ? (
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full bg-blue-500/20 hover:bg-blue-500/30 p-0">
                    <Avatar className="h-8 w-8">
                      {profilePicture && (
                        <AvatarImage 
                          src={profilePicture} 
                          alt={user.name || "User"} 
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <AvatarFallback className="bg-blue-500/50 text-white">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card border-white/20">
                  <DropdownMenuItem className="cursor-pointer">
                    <span className="text-sm text-gray-300">{user.name ?? "Profile"} ({user.email})</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-white hover:bg-white/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-white/10 hover:text-white text-white">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
