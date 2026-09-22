"use client";

import React, { useEffect, useState } from "react";
import { Percent, CheckCircle2, Clock, DollarSign, Search } from "lucide-react";

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCommissions();
  }, []);

  async function fetchCommissions() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/commissions");
      const json = await res.json();
      if (json.success) {
        setCommissions(json.commissions);
        setStats(json.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateStatus(id: number, paymentStatus: string) {
    try {
      const res = await fetch(`/api/commissions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });
      const json = await res.json();
      if (json.success) {
        fetchCommissions();
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = commissions.filter(
    (c) =>
      (c.agentName && c.agentName.toLowerCase().includes(search.toLowerCase())) ||
      (c.unitNumber && c.unitNumber.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-1">
            <Percent className="w-4 h-4" /> Agent Earnings & Payout Ledger
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Commission Tracking</h1>
          <p className="text-slate-500 text-xs mt-1">
            Track agent commissions, manager approval workflows, and payout status.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Commissions</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {stats.totalCommissionsVal ? stats.totalCommissionsVal.toLocaleString() : "0"} EGP
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-[10px] text-emerald-600 font-bold block uppercase">Paid Commissions</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {stats.paidCommissionsVal ? stats.paidCommissionsVal.toLocaleString() : "0"} EGP
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-[10px] text-amber-600 font-bold block uppercase">Pending / Approved</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">
            {stats.pendingCommissionsVal ? stats.pendingCommissionsVal.toLocaleString() : "0"} EGP
          </span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agent name or unit code..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-amber-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5 pl-5">Agent Name</th>
                <th className="p-3.5">Unit Code</th>
                <th className="p-3.5">Commission Rate</th>
                <th className="p-3.5">Commission Amount</th>
                <th className="p-3.5">Due Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right pr-5">Payout Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80">
                  <td className="p-3.5 pl-5 font-bold text-slate-900">{c.agentName}</td>
                  <td className="p-3.5 font-black text-amber-600">{c.unitNumber}</td>
                  <td className="p-3.5 font-bold text-slate-700">{c.commissionPercentage}%</td>
                  <td className="p-3.5 font-bold font-mono text-emerald-700">
                    {parseFloat(c.commissionAmount).toLocaleString()} EGP
                  </td>
                  <td className="p-3.5 font-mono text-slate-500">{c.dueDate}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${
                        c.paymentStatus === "Paid"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : c.paymentStatus === "Approved"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {c.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3.5 text-right pr-5 space-x-1">
                    {c.paymentStatus === "Pending" && (
                      <button
                        onClick={() => handleUpdateStatus(c.id, "Approved")}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px]"
                      >
                        Approve
                      </button>
                    )}
                    {c.paymentStatus === "Approved" && (
                      <button
                        onClick={() => handleUpdateStatus(c.id, "Paid")}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
