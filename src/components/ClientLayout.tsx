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
  Globe,
  User
} from "lucide-react";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(false);
  
  // Authentication & Session States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [sessionUser, setSessionUser] = useState({ name: "", email: "" });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("axiom_user_role");
      const name = localStorage.getItem("axiom_user_name") || "";
      const email = localStorage.getItem("axiom_user_email") || "";

      if (role === "client") {
        setIsAuthenticated(true);
        setSessionUser({ name, email });
      } else {
        setIsAuthenticated(false);
      }
    }
  }, []);

  const handleAuthorizeDemo = () => {
    setCheckingAuth(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("axiom_user_role", "client");
        localStorage.setItem("axiom_user_email", "enterprise.scale@openai.com");
        localStorage.setItem("axiom_user_name", "Aether Labs");
        localStorage.setItem("axiom_client_email", "enterprise.scale@openai.com");
      }
      setSessionUser({ name: "Aether Labs", email: "enterprise.scale@openai.com" });
      setIsAuthenticated(true);
      setCheckingAuth(false);
    }, 1000);
  };
  
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Fine-tuning job FT-AXM-MOCK-JOB successfully compiled and deployed.", time: "1 hour ago", read: false },
    { id: 2, text: "Invoice Stripe #3894 cleared for Shared Medical License.", time: "1 day ago", read: false },
    { id: 3, text: "New Hinglish Bilingual Medical Dataset is active.", time: "2 days ago", read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const activeNotificationsCount = notifications.filter(n => !n.read).length;

  const handleConnectWallet = (provider: string) => {
    setConnectingWallet(true);
    setTimeout(() => {
      setConnectingWallet(false);
      setWalletConnected(true);
      setWalletAddress("0xAXIOM_CLIENT_2894_a923");
      setShowWalletModal(false);
    }, 1200);
  };

  const handleDisconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress("");
    setShowWalletModal(false);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
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
      href: "/client/sft",
      icon: Cpu
    },
    {
      name: "Billing & Receipts",
      href: "/client/billing",
      icon: Receipt
    },
    {
      name: "Client Profile",
      href: "/client/profile",
      icon: User
    }
  ];

  return (
    <div className="min-h-screen flex overflow-x-hidden bg-[#0a0a0a] text-[#e7e4ee] font-label select-none selection:bg-[#A8A8A8]/30 selection:text-white">
      {/* Persistent Left SideNavBar */}
      <aside className="w-64 fixed left-0 top-0 h-screen bg-[#080808] border-r border-[#1e1e1e] flex flex-col py-8 px-4 z-50">
        {/* Branding header */}
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#0a0a0a] border border-[#1e1e1e] flex items-center justify-center text-[#A8A8A8]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tighter text-[#A8A8A8] leading-none">Axiom</h1>
            <p className="text-[10px] text-zinc-500 font-label uppercase tracking-widest mt-1">Enterprise Lab</p>
          </div>
        </div>

        {/* Global Action CTA */}
        <Link href="/leaderboard">
          <button className="mb-8 w-full py-3 px-4 rounded bg-white text-black font-display font-bold text-xs hover:bg-zinc-200 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4" />
            View Leaderboard
          </button>
        </Link>

        {/* Navigation List */}
        <nav className="flex flex-col gap-1.5 flex-grow">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 font-display font-semibold text-sm rounded transition-all duration-200 cursor-pointer active:scale-[0.97] ${
                    isActive
                      ? "bg-white/10 text-white border border-white/20 font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#acaab4]"}`} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Support & Connection Status Footer */}
        <ul className="flex flex-col gap-2 mt-auto pt-6 border-t border-[#1e1e1e]">
          <li>
            <a 
              href="mailto:support@axiom.ai" 
              className="flex items-center gap-3 px-4 py-2 font-display font-semibold text-xs text-zinc-400 hover:text-white transition-colors rounded"
            >
              <HelpCircle className="w-4 h-4" />
              Enterprise Support
            </a>
          </li>
          <li>
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2 font-display font-bold text-[10px] text-zinc-500 uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A8A8A8]"></span>
                </span>
                Active Node
              </div>
              <span className="text-[10px] font-mono text-[#A8A8A8]">axm-eu-west</span>
            </div>
          </li>
        </ul>
      </aside>

      {/* Main Canvas & Content Wrapper */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen relative">
        {/* TopNavBar Header */}
        <header className="bg-[#0a0a0a]/80 backdrop-blur-md fixed top-0 right-0 w-[calc(100%-16rem)] z-40 border-b border-[#1e1e1e] flex justify-between items-center h-16 px-8">
          <div className="flex-1 max-w-md relative group">
            <input
              className="bg-[#0a0a0a] border border-[#1e1e1e] focus:border-[#A8A8A8] rounded py-1.5 px-4 pl-10 text-xs focus:ring-0 outline-none text-white placeholder:text-zinc-500 w-48 focus:w-64 transition-all duration-300"
              placeholder="Search datasets..."
              type="text"
            />
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          </div>

          <div className="flex items-center gap-5 relative">
            {/* Notification bell */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="text-zinc-400 hover:text-white hover:bg-white/5 p-2 rounded transition-all relative"
              >
                <Bell className="w-4 h-4" />
                {activeNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#A8A8A8]" />
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-80 bg-[#080808] border border-[#1e1e1e] rounded-lg shadow-2xl p-4 z-50 animate-fade-in text-xs">
                  <div className="flex justify-between items-center pb-2.5 border-b border-white/5 mb-3">
                    <span className="font-bold text-white font-display">Notifications</span>
                    {activeNotificationsCount > 0 && (
                      <button 
                        onClick={markAllNotificationsAsRead}
                        className="text-[10px] text-zinc-500 hover:text-white transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-zinc-500 text-center py-4">No new notifications</p>
                    ) : (
                      notifications.map(item => (
                        <div key={item.id} className={`p-2 rounded border border-transparent transition-colors flex justify-between gap-3 ${item.read ? 'bg-transparent text-zinc-400' : 'bg-white/5 text-white'}`}>
                          <div className="space-y-1">
                            <p className="leading-snug">{item.text}</p>
                            <span className="text-[9px] text-zinc-600 block">{item.time}</span>
                          </div>
                          <button 
                            onClick={() => dismissNotification(item.id)}
                            className="text-zinc-600 hover:text-zinc-400 self-start"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Wallet button */}
            <button
              onClick={() => setShowWalletModal(true)}
              className={`px-4 py-1.5 rounded border text-xs font-display font-semibold transition-all duration-200 active:scale-95 flex items-center gap-2 ${
                walletConnected
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-white/5 border-[#262626] hover:bg-white/10 text-white"
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              {walletConnected ? `${walletAddress.substring(0, 8)}...${walletAddress.substring(14)}` : "Connect Wallet"}
            </button>

            {/* Avatar and Profile Menu */}
            <div className="relative">
              <div 
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="w-8 h-8 rounded bg-[#080808] overflow-hidden flex-shrink-0 border border-[#1e1e1e] select-none cursor-pointer hover:border-white/20 transition duration-200"
              >
                <img
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRPiAgYk0cgHkRdff-CdxETwSAhMYc4kPoWzET9rmyHgfZTqZnobyIlqScXnZru2ODKwEPD_fNdQhxi_4ynF726dZvpt9ZRFQinEUqtPwRNnJyF5XiL8GSArybev_ptHgSSyur1qWG4J6eo0rL8EXXRYUXjSke8WHRp0n1bNuWcmysvjarbCzweicvVWV0dCifv4uXU8_VkqEBWo-el-QBPrHSPfB_bwCeXlMWVappw0_KaxYm2eNE5dg8pk0-1gdo1HE8XNsWUy_1"
                />
              </div>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2.5 w-48 bg-[#080808] border border-[#1e1e1e] rounded-lg shadow-2xl p-2 z-50 animate-fade-in text-xs text-zinc-400">
                  <div className="p-2 border-b border-white/5 mb-1.5">
                    <span className="font-bold text-white block">{sessionUser.name || "Aether Labs"}</span>
                    <span className="text-[10px] text-zinc-500 block">Enterprise Buyer</span>
                  </div>
                  <Link href="/client/profile" onClick={() => setShowProfileMenu(false)}>
                    <div className="p-2 hover:bg-white/5 rounded text-white cursor-pointer transition">
                      Client Profile
                    </div>
                  </Link>
                  <Link href="/client/billing" onClick={() => setShowProfileMenu(false)}>
                    <div className="p-2 hover:bg-white/5 rounded text-white cursor-pointer transition">
                      Billing &amp; Receipts
                    </div>
                  </Link>
                  <div 
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("axiom_user_role");
                        localStorage.removeItem("axiom_user_email");
                        localStorage.removeItem("axiom_user_name");
                        localStorage.removeItem("axiom_client_email");
                      }
                      setIsAuthenticated(false);
                      setSessionUser({ name: "", email: "" });
                    }}
                    className="p-2 hover:bg-white/5 rounded hover:text-white cursor-pointer transition text-zinc-500 font-semibold"
                  >
                    Log Out
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Content canvas */}
        <main className="flex-1 mt-16 p-8 max-w-[1600px] mx-auto w-full relative z-10 animate-fade-in">
          {children}
        </main>
      </div>

      {/* Security Auth Gate Overlay */}
      {isAuthenticated === null ? (
        <div className="fixed inset-0 z-[200] bg-[#0a0a0a] flex items-center justify-center">
          <span className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        </div>
      ) : !isAuthenticated ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#0a0a0a] text-[#e7e4ee] font-label select-none bg-grid-cyber overflow-hidden animate-fade-in">
          {/* Ambient background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#A8A8A8]/5 blur-[120px] pointer-events-none" />

          <div className="w-full max-w-md p-8 bg-[#080808] border border-[#1e1e1e] rounded-xl text-center space-y-6 relative z-10 shadow-2xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded bg-[#0a0a0a] border border-[#1e1e1e] flex items-center justify-center text-[#A8A8A8] mb-2">
                <Globe className="w-7 h-7 text-[#A8A8A8]" />
              </div>
              <h2 className="text-2xl font-display font-extrabold text-white tracking-tighter uppercase leading-none">
                Axiom Core Security
              </h2>
              <span className="text-[10px] font-mono tracking-widest text-[#A8A8A8] uppercase block font-bold">
                Enterprise Access Port
              </span>
            </div>

            <div className="p-4 rounded bg-[#0a0a0a] border border-[#1e1e1e] text-xs text-zinc-400 leading-relaxed font-mono text-left">
              <span className="text-[#A8A8A8] font-bold block mb-1">🔐 PROTOCOL SECURED</span>
              Enterprise license signature required. Access is restricted to authorized commercial buyers and AI laboratory pipelines.
            </div>

            {checkingAuth ? (
              <div className="py-6 flex flex-col items-center justify-center gap-3">
                <span className="w-6 h-6 border-2 border-[#A8A8A8] border-t-transparent rounded-full animate-spin"></span>
                <p className="text-xs text-zinc-500 font-mono">Verifying enterprise API credentials...</p>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleAuthorizeDemo}
                  className="w-full py-3.5 px-4 rounded bg-white text-black font-display font-bold text-xs hover:bg-zinc-200 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Authorize via Demo Enterprise Lab
                </button>
                
                <Link href="/signup?track=client" className="block">
                  <button className="w-full py-3 px-4 rounded bg-transparent border border-white/20 text-white font-semibold text-xs hover:bg-white/5 transition-all duration-200 active:scale-[0.98]">
                    Request Enterprise Access
                  </button>
                </Link>

                <Link href="/" className="block pt-2">
                  <span className="text-xs text-zinc-500 hover:text-white transition font-mono cursor-pointer">
                    ← Return to Landing Page
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Simulated Wallet connection modal (Rendered at Root Level to avoid frame clipping) */}
      {showWalletModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm p-6 bg-[#080808] border border-[#1e1e1e] rounded relative overflow-hidden">
            <h3 className="text-sm font-display font-bold text-white mb-2 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#A8A8A8]" />
              Enterprise Wallet Node
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Connect your cryptographic identity to unlock high-fidelity datasets and manage Stripe fine-tuning licensing.
            </p>

            {connectingWallet ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <p className="text-xs text-zinc-400 font-mono">Simulating handshake...</p>
              </div>
            ) : walletConnected ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded bg-[#0a0a0a] border border-[#1e1e1e] space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                    <span>Wallet address</span>
                    <span className="text-[#A8A8A8]">CONNECTED</span>
                  </div>
                  <span className="text-xs font-mono text-white select-all block break-all font-semibold">
                    {walletAddress}
                  </span>
                  
                  <div className="h-[1px] bg-white/5 w-full my-2" />
                  
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                    <span>AXM balance</span>
                    <span className="text-white font-bold">25,000 AXM</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                    <span>Mainnet Status</span>
                    <span className="text-[#A8A8A8]">ACTIVE NODE</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(walletAddress);
                      alert("Address copied to clipboard!");
                    }}
                    className="flex-grow py-2 border border-[#1e1e1e] hover:bg-white/5 text-white text-xs font-semibold rounded transition"
                  >
                    Copy Address
                  </button>
                  <button
                    onClick={handleDisconnectWallet}
                    className="py-2 px-4 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded transition"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => handleConnectWallet("metamask")}
                  className="w-full py-2.5 px-4 rounded bg-[#0a0a0a] border border-[#1e1e1e] hover:border-white/20 text-xs text-left text-white font-semibold flex items-center justify-between transition-all"
                >
                  <span>MetaMask Extension</span>
                  <span className="text-[10px] text-zinc-500">PROV_1</span>
                </button>
                <button
                  onClick={() => handleConnectWallet("coinbase")}
                  className="w-full py-2.5 px-4 rounded bg-[#0a0a0a] border border-[#1e1e1e] hover:border-white/20 text-xs text-left text-white font-semibold flex items-center justify-between transition-all"
                >
                  <span>Coinbase Wallet</span>
                  <span className="text-[10px] text-zinc-500">PROV_2</span>
                </button>
                <button
                  onClick={() => handleConnectWallet("axiom-node")}
                  className="w-full py-2.5 px-4 rounded bg-[#0a0a0a] border border-[#1e1e1e] hover:border-white/20 text-xs text-left text-white font-semibold flex items-center justify-between transition-all"
                >
                  <span>Axiom Local Client Key</span>
                  <span className="text-[10px] text-zinc-500">NATIVE</span>
                </button>
                
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="w-full py-2 text-zinc-500 hover:text-white text-xs transition mt-2 block text-center"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


