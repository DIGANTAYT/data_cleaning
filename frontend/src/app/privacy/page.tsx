'use client';

import * as React from 'react';
import { Shield, ArrowLeft, Lock, Eye, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicy() {
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
            <Shield className="w-3.5 h-3.5 mr-1" />
            Security & Privacy First
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-400">
            Privacy Policy
          </h1>
          <p className="text-neutral-400 text-sm font-mono">Last updated: May 29, 2026</p>
        </div>

        <div className="space-y-8 leading-relaxed text-sm text-neutral-300">
          <p>
            At Metrics Flow AI Corporation, we prioritize the protection and confidentiality of your datasets and personal information. This Privacy Policy describes how we collect, process, and safeguard your data when you integrate and use our SaaS platform services.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-805 backdrop-blur-md space-y-3">
              <Lock className="w-5 h-5 text-blue-400" />
              <h4 className="font-bold text-white">Dataset Sovereignty</h4>
              <p className="text-xs text-neutral-400">
                Any file or dataset you upload is processed strictly in-memory during cleaning and ML auto-training operations. We do not store or persist your datasets in database instances without explicit action.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-805 backdrop-blur-md space-y-3">
              <Eye className="w-5 h-5 text-purple-400" />
              <h4 className="font-bold text-white">API Key Privacy</h4>
              <p className="text-xs text-neutral-400">
                Developer API keys and custom OpenAI Secret Keys sk-... are kept purely in your browser's local sandbox, sent securely through SSL/TLS during API cleaning streams.
              </p>
            </div>
          </div>

          <div className="space-y-4 border-t border-neutral-900 pt-8">
            <h3 className="text-lg font-bold text-white">1. Information We Collect</h3>
            <p>
              We collect minimal account identifiers required to manage quotas, subscriptions, and security states:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-xs text-neutral-400">
              <li><strong>Profile Credentials:</strong> Name, Email, Password hash, and active subscription billing identifiers.</li>
              <li><strong>Usage Telemetry:</strong> Log files of cleaning runs, AI query counts, credits deducted, and browser sessions.</li>
            </ul>
          </div>

          <div className="space-y-4 border-t border-neutral-900 pt-8">
            <h3 className="text-lg font-bold text-white">2. Data Security Protocols</h3>
            <p>
              Metrics Flow employs state-of-the-art administrative, technical, and physical safeguards:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-xs text-neutral-400">
              <li>SSL/TLS end-to-end data transmission encryption.</li>
              <li>Isolated database container schemas managed through Supabase and Prisma.</li>
              <li>Automated webhook monitoring detecting billing integrity anomalies.</li>
            </ul>
          </div>

          <div className="space-y-4 border-t border-neutral-900 pt-8">
            <h3 className="text-lg font-bold text-white">3. Contact Privacy Officer</h3>
            <p>
              If you have any questions, compliance reviews, or database account wipe requests, please reach out to our privacy team directly:
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
