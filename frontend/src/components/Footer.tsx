'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Database, Shield, HelpCircle, FileText } from 'lucide-react';

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="w-full border-t border-neutral-900 bg-neutral-950 px-8 py-12 md:py-16 relative overflow-hidden">
      <div className="max-w-5xl md:max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 pb-12 border-b border-neutral-900">
          
          {/* Brand and Description */}
          <div className="col-span-2 md:col-span-4 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
                <Database className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white font-sans">Metrics Flow</span>
            </div>
            
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              To make data analytics simple, fast, and accessible through AI driven automation.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0 pt-2">
              {/* Live operational indicator */}
              <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full w-fit text-[10px] font-bold text-emerald-400 font-mono">
                <div className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </div>
                <span>All Systems Operational</span>
              </div>
              
              {/* Security Badge */}
              <div className="inline-flex items-center space-x-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full w-fit text-[10px] text-neutral-400 font-mono">
                <Shield className="w-3 h-3 text-blue-500" />
                <span>SSL Secured</span>
              </div>
            </div>
          </div>

          {/* Links Column 1: Studio */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">Platform</h4>
            <ul className="space-y-3 text-xs">
              <li>
                <button 
                  onClick={() => router.push('/dashboard')} 
                  className="text-neutral-400 hover:text-white transition-colors cursor-pointer text-left md:hover:translate-x-0.5 transform duration-150 block py-1"
                >
                  Datasets Studio
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push('/dashboard/settings')} 
                  className="text-neutral-400 hover:text-white transition-colors cursor-pointer text-left md:hover:translate-x-0.5 transform duration-150 block py-1"
                >
                  System Config
                </button>
              </li>
              <li>
                <a 
                  href="https://neel1817-ai-python-engine.hf.space" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-neutral-400 hover:text-white transition-colors md:hover:translate-x-0.5 transform duration-150 block py-1"
                >
                  FastAPI AI Engine
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Resources */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">Docs & Help</h4>
            <ul className="space-y-3 text-xs">
              <li>
                <a 
                  href="#" 
                  className="text-neutral-400 hover:text-white transition-colors md:hover:translate-x-0.5 transform duration-150 block py-1 flex items-center space-x-1"
                >
                  <FileText className="w-3 h-3 text-neutral-500" />
                  <span>Interactive Guide</span>
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-neutral-400 hover:text-white transition-colors md:hover:translate-x-0.5 transform duration-150 block py-1 flex items-center space-x-1"
                >
                  <HelpCircle className="w-3 h-3 text-neutral-500" />
                  <span>Support Center</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:connect@magnetnode.com" 
                  className="text-neutral-400 hover:text-white transition-colors md:hover:translate-x-0.5 transform duration-150 block py-1"
                >
                  Developer API
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter / Connect */}
          <div className="col-span-2 md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">Stay Updated</h4>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Subscribe to get real-time release notes, machine learning features, and security advisories.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }} className="flex space-x-2 max-w-sm">
              <input 
                type="email" 
                placeholder="developer@enterprise.com" 
                required
                className="bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500/50 flex-1 font-mono transition-all"
              />
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded transition-all flex items-center space-x-1"
              >
                <span>Subscribe</span>
              </button>
            </form>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 text-[11px] text-neutral-500 font-mono">
          <div className="flex flex-col md:flex-row items-center md:space-x-4 space-y-3 md:space-y-0 text-center md:text-left">
            <span>© 2026 Metrics Flow AI Corporation. All rights reserved.</span>
            <span className="hidden md:inline text-neutral-800">|</span>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
              <a href="#" className="hover:text-neutral-300 transition-colors py-0.5">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-neutral-300 transition-colors py-0.5">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-neutral-300 transition-colors py-0.5">Cookies</a>
            </div>
          </div>

          {/* Social connections and build stamp */}
          <div className="flex items-center justify-between w-full md:w-auto space-x-4 border-t border-neutral-900/60 pt-4 md:border-none md:pt-0">
            <span className="text-[10px] text-neutral-600 bg-neutral-900 border border-neutral-850 px-2 py-1 rounded font-bold">
              V1.0 Stable
            </span>
            <div className="flex space-x-2">
              <a 
                href="https://github.com/DIGANTAYT/data_cleaning" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 flex items-center justify-center transition-all text-neutral-400 hover:text-white"
                title="GitHub Repository"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 flex items-center justify-center transition-all text-neutral-400 hover:text-blue-400"
                title="Twitter / X"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/in/digantasarkar18/" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 flex items-center justify-center transition-all text-neutral-400 hover:text-blue-500"
                title="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
