'use client';

import * as React from 'react';
import { FileText, ArrowLeft, Terminal, Cookie, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function TermsOfService() {
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
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold text-blue-400">
            <FileText className="w-3.5 h-3.5 mr-1" />
            Legal Agreement
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-400">
            Terms of Service & Cookies
          </h1>
          <p className="text-neutral-400 text-sm font-mono">Last updated: May 29, 2026</p>
        </div>

        <div className="space-y-8 leading-relaxed text-sm text-neutral-300">
          <p>
            By accessing or integrating Metrics Flow services, you agree to comply with and be bound by the following Terms of Service and Cookies policy. Please read them carefully.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-805 backdrop-blur-md space-y-3">
              <Terminal className="w-5 h-5 text-blue-400" />
              <h4 className="font-bold text-white">Fair Usage & Credits</h4>
              <p className="text-xs text-neutral-400">
                You agree not to automate web scraping operations, manipulate API quota counters, or execute duplicate credit requests using client secret tokens.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-805 backdrop-blur-md space-y-3">
              <Cookie className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-white">Cookie Preferences</h4>
              <p className="text-xs text-neutral-400">
                We use strictly functional cookies and Local Storage keys to persist account session tokens, API keys, subscription levels, and credits.
              </p>
            </div>
          </div>

          <div className="space-y-4 border-t border-neutral-900 pt-8">
            <h3 className="text-lg font-bold text-white">1. Provision of SaaS Quotas</h3>
            <p>
              Metrics Flow grants you a limited, non-exclusive, non-transferable access license to upload, clean, and run AutoML algorithms on files according to your selected plan. Quotas reset at the start of each billing cycle. Unused credits do not roll over.
            </p>
          </div>

          <div className="space-y-4 border-t border-neutral-900 pt-8">
            <h3 className="text-lg font-bold text-white">2. Prohibited System Interactions</h3>
            <p>
              Under this agreement, you explicitly commit not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-xs text-neutral-400">
              <li>Reverse engineer the FastAPI/Python anomaly detection engine.</li>
              <li>Inject malicious file payloads or script injections into the CSV parsing queues.</li>
              <li>Forge billing signatures or spoof Stripe checkout completed callbacks.</li>
            </ul>
          </div>

          <div className="space-y-4 border-t border-neutral-900 pt-8">
            <h3 className="text-lg font-bold text-white">3. Cookies & Session Persistence</h3>
            <p>
              We prioritize privacy and speed, choosing to avoid non-consensual trackers. Our cookies satisfy GDPR rules because:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-xs text-neutral-400">
              <li>They only retain local tokens to keep you safely authenticated.</li>
              <li>OpenAI Keys are stored exclusively in client local storage, completely controlled by you.</li>
            </ul>
          </div>

          <div className="space-y-4 border-t border-neutral-900 pt-8">
            <h3 className="text-lg font-bold text-white">4. Governing Law</h3>
            <p>
              This agreement is governed by and construed in accordance with the laws of the Republic of India. Any litigation arising from the service usage must be handled under Karnataka legal jurisdictions.
            </p>
          </div>

          <div className="space-y-4 border-t border-neutral-900 pt-8">
            <h3 className="text-lg font-bold text-white">5. Legal Inquiries & Contacts</h3>
            <p>
              For any clarification regarding our Terms of Service or Cookies policy, please write to us at:
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
