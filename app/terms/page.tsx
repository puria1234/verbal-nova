"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
          <p className="text-sm text-gray-400">Last updated: December 31, 2024</p>

          <div className="space-y-4 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-2">Acceptance of Terms</h2>
              <p>By using Verbal Nova, you agree to these terms. If you don't agree, please don't use the service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">Use of Service</h2>
              <p>You agree to:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Use the service for personal, educational purposes</li>
                <li>Not share your account with others</li>
                <li>Not attempt to hack or disrupt the service</li>
                <li>Provide accurate information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">Content</h2>
              <p>All vocabulary content is provided for educational purposes. We strive for accuracy but cannot guarantee all definitions are error-free.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">Account Termination</h2>
              <p>We reserve the right to terminate accounts that violate these terms or engage in abusive behavior.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">Disclaimer</h2>
              <p>The service is provided "as is" without warranties. We are not responsible for SAT scores or test outcomes.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">Changes to Terms</h2>
              <p>We may update these terms. Continued use of the service means you accept the updated terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">Contact</h2>
              <p>Questions about these terms? Contact us through the app.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
