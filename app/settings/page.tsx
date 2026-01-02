"use client"

import { useState, useRef } from "react"
import { useAuth } from "@/contexts/firebase-auth-context"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trash2, AlertTriangle, Camera, User } from "lucide-react"
import { toast } from "sonner"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

export default function SettingsPage() {
  const { user, deleteAccount, updateProfilePicture } = useAuth()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploadingPfp, setIsUploadingPfp] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const profilePicture = user?.photoURL || 
    (user ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&background=3b82f6&color=fff&size=256` : null)

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await deleteAccount()
      toast.success("Account deleted successfully")
      router.push("/")
    } catch (error: any) {
      console.error("Error deleting account:", error)
      
      // Handle re-authentication required error
      if (error.code === "auth/requires-recent-login") {
        toast.error("For security, please log out and log back in before deleting your account")
      } else {
        toast.error("Failed to delete account. Please try again.")
      }
      setIsDeleting(false)
    }
  }

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB")
      return
    }

    setIsUploadingPfp(true)
    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `profile-pictures/${user.uid}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      
      // Update user profile
      await updateProfilePicture(downloadURL)
      
      toast.success("Profile picture updated successfully")
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      toast.error("Failed to upload profile picture. Please try again.")
    } finally {
      setIsUploadingPfp(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <NavBar />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-2xl sm:text-3xl font-bold">Account Settings</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your account preferences</p>
          </div>

          <div className="max-w-2xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Update your profile picture</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    {profilePicture && (
                      <AvatarImage 
                        src={profilePicture} 
                        alt={user?.displayName || user?.email || "User"} 
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <AvatarFallback className="bg-blue-500/50 text-white text-2xl">
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleProfilePictureClick}
                    disabled={isUploadingPfp}
                    className="absolute bottom-0 right-0 rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button 
                    onClick={handleProfilePictureClick}
                    disabled={isUploadingPfp}
                    variant="outline"
                  >
                    {isUploadingPfp ? "Uploading..." : "Change Picture"}
                  </Button>
                  <p className="mt-2 text-sm text-muted-foreground">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{user?.displayName || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Irreversible actions</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove all your data including:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Learning progress and statistics</li>
                          <li>Quiz results and history</li>
                          <li>All personal information</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? "Deleting..." : "Delete Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
