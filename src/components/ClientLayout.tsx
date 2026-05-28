"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  Trophy,
  Cpu,
  Receipt,
  HelpCircle,
  Search,
  Bell,
  Wallet,
  Globe
} from "lucide-react";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [notificationActive, setNotificationActive] = useState(true);

  const handleConnectWallet = () => {
    if (walletConnected) {
      setWalletConnected(false);
      setWalletAddress("");
    } else {
      setWalletConnected(true);
      setWalletAddress("0xAXIOM...f7b2");
    }
  };

  const navItems = [
    {
      name: "Dataset Marketplace",
      href: "/client",
      icon: Database
    },
    {
      name: "Model Leaderboard",
      href: "/leaderboard",
      icon: Trophy
    },
    {
      name: "OpenAI SFT Console",
      href: "/client#sft",
      icon: Cpu
    },
    {
      name: "Billing & Receipts",
      href: "/client#billing",
      icon: Receipt
    }
  ];

  return (
    <div className="min-h-screen flex overflow-x-hidden bg-[#0e0e15] text-[#e7e4ee] font-label select-none selection:bg-[#0A84FF]/30 selection:text-white">
      {/* Persistent Left SideNavBar */}
      <aside className="w-64 fixed left-0 top-0 h-screen bg-[#13131a]/40 backdrop-blur-xl border-r border-white/[0.03] shadow-2xl flex flex-col py-8 px-4 z-50">
        {/* Branding header */}
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0A84FF]/20 flex items-center justify-center ambient-shadow-primary text-[#0A84FF]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-black tracking-tighter text-[#0A84FF] leading-none">Axiom</h1>
            <p className="text-[10px] text-[#acaab4] font-label uppercase tracking-widest mt-1">Enterprise Lab</p>
          </div>
        </div>

        {/* Global Action CTA */}
        <Link href="/leaderboard">
          <button className="mb-8 w-full py-3 px-4 rounded-xl bg-[#0A84FF] text-white font-display font-bold text-xs hover:bg-[#0062cc] transition-all duration-300 shadow-[0_0_20px_-5px_rgba(10,132,255,0.4)] active:scale-[0.98] flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4" />
            View Leaderboard
          </button>
        </Link>

        {/* Navigation List */}
        <nav className="flex flex-col gap-1.5 flex-grow">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href.startsWith("/client#") && pathname === "/client");
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 font-display font-semibold text-sm rounded-xl transition-all duration-300 cursor-pointer active:scale-[0.97] ${
                    isActive
                      ? "bg-[#0A84FF]/10 text-[#0A84FF]"
                      : "text-[#acaab4] hover:text-[#e7e4ee] hover:bg-white/[0.03]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#0A84FF]" : "text-[#acaab4]"}`} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Support & Connection Status Footer */}
        <ul className="flex flex-col gap-2 mt-auto pt-6 border-t border-white/5">
          <li>
            <a 
              href="mailto:support@axiom.ai" 
              className="flex items-center gap-3 px-4 py-2 font-display font-semibold text-xs text-[#acaab4] hover:text-[#e7e4ee] transition-colors rounded-xl"
            >
              <HelpCircle className="w-4 h-4" />
              Enterprise Support
            </a>
          </li>
          <li>
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2 font-display font-bold text-[10px] text-[#acaab4] uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Active Node
              </div>
              <span className="text-[10px] font-mono text-emerald-400">axm-eu-west</span>
            </div>
          </li>
        </ul>
      </aside>

      {/* Main Canvas & Content Wrapper */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen relative">
        {/* TopNavBar Header */}
        <header className="bg-[#0e0e15]/40 backdrop-blur-md fixed top-0 right-0 w-[calc(100%-16rem)] z-40 border-b border-white/[0.02] flex justify-between items-center h-16 px-8">
          <div className="flex-1 max-w-md relative group">
            <input
              className="bg-[#1f1f28]/40 border border-white/[0.04] group-hover:border-white/[0.08] focus:border-[#0A84FF]/40 rounded-full py-1.5 px-4 pl-10 text-xs focus:ring-0 outline-none text-[#e7e4ee] placeholder:text-[#acaab4]/60 w-48 focus:w-64 transition-all duration-300"
              placeholder="Search datasets..."
              type="text"
            />
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#acaab4]/60" />
          </div>

          <div className="flex items-center gap-5">
            {/* Notification bell */}
            <button 
              onClick={() => setNotificationActive(false)}
              className="text-[#acaab4] hover:text-[#0A84FF] hover:bg-[#1f1f28]/40 p-2 rounded-full transition-all relative"
            >
              <Bell className="w-4 h-4" />
              {notificationActive && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff6e84] shadow-[0_0_8px_#ff6e84]" />
              )}
            </button>

            {/* Wallet button */}
            <button
              onClick={handleConnectWallet}
              className={`px-4 py-1.5 rounded-full border text-xs font-display font-semibold transition-all duration-300 active:scale-95 flex items-center gap-2 ${
                walletConnected
                  ? "bg-[#0A84FF]/10 border-[#0A84FF]/20 text-[#0A84FF]"
                  : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05] text-[#e7e4ee]"
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              {walletConnected ? walletAddress : "Connect Wallet"}
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#1f1f28] overflow-hidden flex-shrink-0 border border-white/10 select-none">
              <img
                alt="User Avatar"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRPiAgYk0cgHkRdff-CdxETwSAhMYc4kPoWzET9rmyHgfZTqZnobyIlqScXnZru2ODKwEPD_fNdQhxi_4ynF726dZvpt9ZRFQinEUqtPwRNnJyF5XiL8GSArybev_ptHgSSyur1qWG4J6eo0rL8EXXRYUXjSke8WHRp0n1bNuWcmysvjarbCzweicvVWV0dCifv4uXU8_VkqEBWo-el-QBPrHSPfB_bwCeXlMWVappw0_KaxYm2eNE5dg8pk0-1gdo1HE8XNsWUy_1"
              />
            </div>
          </div>
        </header>

        {/* Content canvas */}
        <main className="flex-1 mt-16 p-8 max-w-[1600px] mx-auto w-full relative z-10 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
