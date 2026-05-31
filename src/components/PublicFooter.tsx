import Link from "next/link";
import { Database } from "lucide-react";

const footerLinks = [
  { href: "/docs", label: "Documentation" },
  { href: "/terminals", label: "Terminals" },
  { href: "/privacy", label: "Privacy Ledger" },
  { href: "/whitepaper", label: "Whitepaper v2.4" },
];

export default function PublicFooter() {
  return (
    <footer className="border-t border-[#262626] bg-[#141313] z-20 relative py-12 text-xs text-zinc-500 font-mono mt-16">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <Link href="/" className="flex items-center gap-3 hover:text-white transition-colors">
          <div className="w-9 h-9 rounded bg-[#121212] border border-[#262626] flex items-center justify-center text-white">
            <Database className="w-4 h-4" />
          </div>
          <span className="text-base font-bold text-white tracking-widest font-mono">
            AXIOM
          </span>
        </Link>

        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center text-[10px]">
          <span>© 2026 Axiom Protocol Layer. All rights reserved.</span>
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          <span className="text-[10px] text-zinc-400 font-bold tracking-wider font-mono">
            ALL PROTOCOL NODES OPERATIONAL
          </span>
        </div>
      </div>
    </footer>
  );
}
