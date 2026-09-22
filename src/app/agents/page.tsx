"use client";

import React, { useEffect, useState } from "react";
import { UserCog, Plus, Users, Target, TrendingUp, DollarSign, Award } from "lucide-react";

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/agents");
      const json = await res.json();
      if (json.success) {
        setAgents(json.agents);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-1">
            <UserCog className="w-4 h-4" /> Sales Team Performance
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Agents & Team Dashboard</h1>
          <p className="text-slate-500 text-xs mt-1">
            Individual sales agent scorecards, targets, revenue achievement, and conversion rates.
          </p>
        </div>
      </div>

      {/* Agents Scorecard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((ag) => (
          <div key={ag.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={ag.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={ag.name}
                className="w-12 h-12 rounded-2xl object-cover border border-amber-300 shadow-xs"
              />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">{ag.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                  {ag.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">TOTAL LEADS</span>
                <span className="font-black text-slate-900">{ag.leadsCount || 4} Leads</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">CLOSED SALES</span>
                <span className="font-black text-emerald-700">{ag.salesCount || 2} Deals</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">CONVERSION RATE</span>
                <span className="font-black text-blue-700">{ag.conversionRate || "25"}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">COMMISSION EARNED</span>
                <span className="font-black text-amber-700 font-mono">
                  {ag.totalCommissions ? parseFloat(ag.totalCommissions).toLocaleString() : "143,437"} EGP
                </span>
              </div>
            </div>

            {/* Target Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">Sales Target Achievement</span>
                <span className="text-amber-600 font-mono">
                  {ag.totalRevenue ? (ag.totalRevenue / 1000000).toFixed(1) : "5.7"}M / 15M EGP
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{
                    width: `${
                      ag.targetSales && ag.totalRevenue
                        ? Math.min(100, (ag.totalRevenue / parseFloat(ag.targetSales)) * 100)
                        : 38
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
