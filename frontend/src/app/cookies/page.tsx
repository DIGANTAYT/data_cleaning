'use client';

import * as React from 'react';
import { Cookie, ArrowLeft, Shield, CheckCircle, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function CookiePolicy() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col overflow-x-hidden relative">
      {/* Background glow grids */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 max-w-5xl mx-auto w-full relative z-10">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <Database className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Metrics Flow</span>
        </div>
        <Button onClick={() => router.push('/')} variant="ghost" className="text-neutral-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 md:py-20 relative z-10 space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400">
            <Cookie className="w-3.5 h-3.5 mr-1" />
            Cookie Transparency Policy
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-400">
            Cookie Policy
          </h1>
          <p className="text-neutral-400 text-sm font-mono">Last updated: May 29, 2026</p>
        </div>

        <div className="space-y-8 leading-relaxed text-sm text-neutral-300">
          <p>
            At Metrics Flow, we believe in being clear and open about how we collect and use data related to you. In the spirit of transparency, this policy provides detailed information about how and when we use cookies on our web application.
          </p>

          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-805 backdrop-blur-md space-y-3">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-white">Strictly Functional Storage</h4>
            <p className="text-xs text-neutral-400">
              Metrics Flow does not use advertising tracking cookies or sell your browsing history. We strictly limit storage to necessary authentication states, token verification, and client settings.
            </p>
          </div>

          <div className="space-y-4 border-t border-neutral-900 pt-8">
            <h3 className="text-lg font-bold text-white">1. What are Cookies and Local Storage?</h3>
            <p>
              Cookies are small text files sent by us to your computer or mobile device. They are unique to your account or your browser. Local Storage is a modern web standard that allows applications to store key-value data in your browser securely and with higher speed.
            </p>
          </div>

          <div className="space-y-4 border-t border-neutral-900 pt-8">
            <h3 className="text-lg font-bold text-white">2. How Metrics Flow Uses Browser Storage</h3>
            <p>
              We use both session cookies and HTML5 Local Storage for the following essential purposes:
            </p>
            <div className="overflow-x-auto rounded-lg border border-neutral-850">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-950 text-neutral-450 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-4 py-3">Storage Key</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Purpose</th>
                    <th className="px-4 py-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850 text-neutral-400">
                  <tr>
                    <td className="px-4 py-3 font-mono text-neutral-200 font-bold">token</td>
                    <td className="px-4 py-3 font-mono">Local Storage</td>
                    <td className="px-4 py-3">Stores the JWT authentication token for your session.</td>
                    <td className="px-4 py-3">Until sign-out</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-neutral-200 font-bold">user_plan</td>
                    <td className="px-4 py-3 font-mono">Local Storage</td>
                    <td className="px-4 py-3">Tracks your active role-based subscription tier (e.g. Developer Sandbox).</td>
                    <td className="px-4 py-3">Persistent</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-neutral-200 font-bold">user_credits</td>
                    <td className="px-4 py-3 font-mono">Local Storage</td>
                    <td className="px-4 py-3">Caches your current AI credit balance for instant UI updates.</td>
                    <td className="px-4 py-3">Persistent</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-neutral-200 font-bold">user_openai_key</td>
                    <td className="px-4 py-3 font-mono">Local Storage</td>
                    <td className="px-4 py-3">Optionally stores your custom secret OpenAI key sk-... locally so it is never sent to our database.</td>
                    <td className="px-4 py-3">Until deleted</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4 border-t border-neutral-900 pt-8">
            <h3 className="text-lg font-bold text-white">3. Third-Party Integrations</h3>
            <p>
              When you manage billing inside your Settings Panel, we utilize Stripe to securely process transactions. Stripe may set cookies necessary to prevent fraud, verify payments, and secure the credit card processing gateway. These cookies are subject to Stripe's Privacy and Cookie policies.
            </p>
          </div>

          <div className="space-y-4 border-t border-neutral-900 pt-8">
            <h3 className="text-lg font-bold text-white">4. Your Control Options</h3>
            <p>
              Most web browsers allow you to manage cookie preferences through settings. If you limit the ability of websites to set cookies, you may worsen your overall user experience, as it will no longer be personalized to you. It may also prevent you from saving customized session settings like local API configurations.
            </p>
          </div>

          <div className="space-y-4 border-t border-neutral-900 pt-8">
            <h3 className="text-lg font-bold text-white">5. Contact Information</h3>
            <p>
              If you have any questions about our use of cookies or other tracking technologies, please contact us:
            </p>
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-900 text-xs font-mono text-neutral-400">
              Email: contact@magnetnode.com <br/>
              Address: Kolkata, India
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-900 py-6 text-center text-xs text-neutral-500 font-mono relative z-10 mt-20">
        © 2026 Metrics Flow AI Corporation. All rights reserved.
      </footer>
    </div>
  );
}
