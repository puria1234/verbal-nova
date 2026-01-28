"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/firebase-auth-context"
import { Button } from "@/components/ui/button"
import { BookOpen, LayoutDashboard, SquareStack, Brain, LogOut, Menu, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function NavBar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()

  // Get profile picture from Firebase user
  const profilePicture = user?.photoURL || 
    (user ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&background=3b82f6&color=fff&size=128` : null)

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/daily-challenge", label: "Daily", icon: Brain },
    { href: "/flashcards", label: "Flashcards", icon: SquareStack },
    { href: "/quiz", label: "Quiz", icon: Brain },
  ]

  return (
    <nav className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Verbal Nova</span>
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
                      "gap-2",
                      isActive ? "bg-secondary text-foreground border-border" : "text-foreground hover:bg-muted"
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
                          alt={user.displayName || user.email || "User"} 
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
              <DropdownMenuContent align="end" className="glass-card border-border min-w-[180px] bg-card">
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
                      <span className="text-sm text-muted-foreground">{user.displayName ?? "Profile"} ({user.email})</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
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
                  <Button variant="ghost" size="icon" className="rounded-full border border-border bg-secondary/80 hover:bg-secondary p-0">
                    <Avatar className="h-8 w-8">
                      {profilePicture && (
                        <AvatarImage 
                          src={profilePicture} 
                          alt={user.displayName || user.email || "User"} 
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <AvatarFallback className="bg-blue-500/50 text-white">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-card border-border bg-card">
                  <DropdownMenuItem className="cursor-pointer">
                    <span className="text-sm text-muted-foreground">{user.displayName ?? "Profile"} ({user.email})</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
