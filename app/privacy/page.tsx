"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-4 py-8">
      <div className="container mx-auto max-w-3xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-white hover:bg-white/10">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        <div className="glass-card rounded-2xl p-8 space-y-6">
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          <p className="text-sm text-gray-400">Last updated: December 31, 2025</p>

          <div className="space-y-4 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-2">Information We Collect</h2>
              <p>We collect only the information necessary to provide our service:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Account information (name, email, password)</li>
                <li>Learning progress and quiz results</li>
                <li>Usage data to improve the app</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">How We Use Your Information</h2>
              <p>Your information is used to:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Provide and maintain the service</li>
                <li>Track your learning progress</li>
                <li>Improve user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">Data Storage</h2>
              <p>All data is stored securely using Firebase. We do not transfer your data internationally or share it with third parties.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Access your personal data</li>
                <li>Delete your account and data</li>
                <li>Opt out of data collection</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">Contact</h2>
              <p>For privacy concerns, contact us through the app.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
