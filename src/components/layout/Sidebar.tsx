"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Grid3X3,
  Tag,
  Users,
  UserCheck,
  FileCheck2,
  BookmarkCheck,
  CreditCard,
  Percent,
  UserCog,
  FileText,
  BarChart3,
  Settings,
  Building,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: Building2 },
  { name: "Units / Availability", href: "/units", icon: Grid3X3, highlight: true },
  { name: "Pricing", href: "/pricing", icon: Tag },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Leads / CRM", href: "/leads", icon: UserCheck },
  { name: "Sales", href: "/sales", icon: FileCheck2 },
  { name: "Reservations", href: "/reservations", icon: BookmarkCheck },
  { name: "Payment Plans", href: "/payment-plans", icon: CreditCard },
  { name: "Commissions", href: "/commissions", icon: Percent },
  { name: "Agents / Team", href: "/agents", icon: UserCog },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useApp();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 min-h-screen sticky top-0 h-screen z-30">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-extrabold shadow-lg shadow-amber-500/20">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1">
              VALUE <span className="text-amber-400 font-light">CRM</span>
            </span>
            <span className="block text-[10px] text-amber-300/80 font-mono font-medium tracking-wider uppercase">
              Real Estate Enterprise
            </span>
          </div>
        </Link>
      </div>

      {/* Role Badge Indicator */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">Access Role:</span>
        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold text-[11px]">
          {role}
        </span>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold shadow-md shadow-amber-500/15"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </div>
              {item.highlight && !isActive && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Featured Project Widget Footnote */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900 border border-slate-700/60 text-xs">
        <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Value 9 Mall Obour</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed mb-2">
          Featured Commercial Hub. 67 units available across 3 floors on Al Thawra St.
        </p>
        <Link
          href="/units?projectId=1"
          className="inline-block w-full text-center py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 text-[11px] transition-colors"
        >
          View Live Availability
        </Link>
      </div>
    </aside>
  );
}
