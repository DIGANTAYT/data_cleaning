'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Database, Shield, Github, Twitter, Linkedin, HelpCircle, FileText } from 'lucide-react';

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="w-full border-t border-neutral-900 bg-neutral-950 px-6 py-12 md:py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
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
                className="bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500/50 flex-1 font-mono transition-all"
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
                <Github className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 flex items-center justify-center transition-all text-neutral-400 hover:text-blue-400"
                title="Twitter / X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="https://www.linkedin.com/in/digantasarkar18/" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 flex items-center justify-center transition-all text-neutral-400 hover:text-blue-500"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
