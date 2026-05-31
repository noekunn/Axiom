"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  Sparkles, 
  Compass, 
  UserCheck, 
  Database, 
  Wallet,
  ArrowRight
} from "lucide-react";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  options?: Array<{ label: string; action: string }>;
}

export default function AxiomBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Welcome to Axiom Protocol. I am **Axiom Core-AI**, your sovereign guide. How can I help you today?",
      options: [
        { label: "Expert Onboarding & Vetting", action: "expert" },
        { label: "Client Licensing & Downloads", action: "client" },
        { label: "Wallet Connection & Royalties", action: "wallet" },
        { label: "UPI & Instant Payouts", action: "upi" }
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const knowledgeBase = [
    {
      keys: ["expert", "onboard", "vetting", "earn", "points", "challenge", " workbench"],
      answer: "To get started as an **Expert**:\n1. Click **Get Started** on the homepage and register.\n2. If your account is **Shortlisted**, navigate to the **Vetting Arena** to pass the timed Hinglish/technical reasoning tests.\n3. Go to the **Expert Workbench** to claim active prompt tasks and submit responses.\n4. Approved tasks instantly credit points and payouts!"
    },
    {
      keys: ["client", "dataset", "download", "license", "exclusive", "shared", "jsonl", "fine-tune", "sft"],
      answer: "For **Enterprise Clients**:\n1. Enter the **Enterprise Lab** to browse data pools.\n2. Choose between a **Shared License** (standard usage) or an **Exclusive License** (full ownership; removes the pool from the market).\n3. After licensing, click **Download JSONL** to fetch the formatted prompt dataset.\n4. Navigate to the **SFT Console** to configure and simulate fine-tuning runs."
    },
    {
      keys: ["wallet", "web3", "metamask", "connect", "royalty", "royalties", "compounding"],
      answer: "To connect a **Web3 Wallet**:\n1. Click **Connect Wallet** in the top-right header of your dashboard (Expert or Client).\n2. Authorize MetaMask, Coinbase, or WalletConnect.\n3. Linking your wallet enables you to track and collect your **compounding 5% royalty split** on-chain whenever datasets you contributed to are licensed."
    },
    {
      keys: ["upi", "razorpay", "payout", "payment", "bank", "rupees", "transfer"],
      answer: "Configuring **Payments**:\n1. Experts get paid instantly for accepted tasks using **Razorpay X**.\n2. When registering or editing credentials, provide a valid **UPI VPA address** (e.g., `username@okaxis`).\n3. Upon consensus approval, payouts are routed directly to your linked bank account."
    },
    {
      keys: ["help", "navigate", "docs", "where", "support"],
      answer: "You can visit our detailed **[Support Hub](/docs)** to view interactive guides on all platform functions. For direct issues, reach out to us at **support@axiom.ai**."
    }
  ];

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, sender: "user", text }]);
    setInputValue("");
    setIsTyping(true);

    // AI thinking animation delay
    setTimeout(() => {
      setIsTyping(false);
      const query = text.toLowerCase();
      let matchedAnswer = "I'm sorry, I didn't quite catch that. Could you try rephrasing or ask about **experts**, **datasets**, **wallets**, or **UPI payouts**?";

      // Search knowledge base
      for (const entry of knowledgeBase) {
        if (entry.keys.some(key => query.includes(key))) {
          matchedAnswer = entry.answer;
          break;
        }
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: matchedAnswer,
        options: [
          { label: "Back to Menu", action: "menu" }
        ]
      }]);
    }, 1200);
  };

  const handleOptionClick = (action: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let text = "";
      let nextOptions = [{ label: "Back to Menu", action: "menu" }];

      switch (action) {
        case "expert":
          text = "To contribute as an **Expert**, sign up with your credentials. If your node status is **Shortlisted**, complete the timed cognitive evaluation in the **Vetting Arena** to activate mainnet claiming.";
          break;
        case "client":
          text = "In the **Enterprise Lab**, you can browse dataset pools and buy either a **Shared** or **Exclusive** license. Once licensed, you can download the **JSONL** file directly or run **OpenAI SFT** simulated fine-tuning runs.";
          break;
        case "wallet":
          text = "Click **Connect Wallet** in the top right of your dashboard to bind your Web3 identity. Connected experts receive a **5% compounding royalty share** automatically distributed on-chain whenever their dataset is licensed.";
          break;
        case "upi":
          text = "Set up your **Razorpay UPI VPA** (e.g., `username@okaxis`) in your Expert settings. Axiom processes task consensus reviews within 3 seconds, transferring upfront cash payouts instantly to your account.";
          break;
        case "menu":
        default:
          text = "What details can I clarify for you? Select a topic below or type your question:";
          nextOptions = [
            { label: "Expert Onboarding & Vetting", action: "expert" },
            { label: "Client Licensing & Downloads", action: "client" },
            { label: "Wallet Connection & Royalties", action: "wallet" },
            { label: "UPI & Instant Payouts", action: "upi" }
          ];
          break;
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: "bot",
        text,
        options: nextOptions
      }]);
    }, 800);
  };

  // Helper to render bold markdown (**text**) inside messages
  const renderMessageText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans select-text">
      {/* Expanded Chat Widget */}
      {isOpen ? (
        <div className="w-[360px] h-[500px] bg-[#121212]/95 border border-[#262626] rounded-2xl shadow-2xl flex flex-col backdrop-blur-xl animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-[#262626] bg-[#0c0c0c] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white border border-white/10 relative">
                <Bot className="w-4 h-4" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border-2 border-[#0c0c0c]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5 font-mono">
                  AXIOM-BOT <Sparkles className="w-3 h-3 text-[#A8A8A8]" />
                </h4>
                <span className="text-[9px] text-zinc-500 font-mono">PROTOCOL ASSISTANT</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed border ${
                    msg.sender === "user" 
                      ? "bg-white text-black border-white" 
                      : "bg-white/5 text-zinc-300 border-white/5"
                  }`}
                >
                  <p className="whitespace-pre-line">{renderMessageText(msg.text)}</p>
                </div>
                
                {/* Custom Options Buttons */}
                {msg.options && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.options.map((opt) => (
                      <button
                        key={opt.action}
                        onClick={() => handleOptionClick(opt.action)}
                        className="text-[10px] font-semibold bg-white/5 hover:bg-white/10 text-white px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-all active:scale-[0.98]"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-1 bg-white/5 border border-white/5 px-4 py-3 rounded-2xl w-fit">
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-3 border-t border-[#262626] bg-[#0c0c0c] flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-[#161616] border border-[#262626] focus:border-white/20 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 outline-none transition"
            />
            <button 
              type="submit"
              className="p-2 bg-white text-black hover:bg-zinc-200 transition-all rounded-xl flex items-center justify-center active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        /* Floating Button Bubble */
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transition duration-300 transform hover:scale-105 active:scale-95 border border-white relative group"
        >
          <MessageSquare className="w-5 h-5 group-hover:hidden" />
          <Bot className="w-5 h-5 hidden group-hover:block" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
        </button>
      )}
    </div>
  );
}
