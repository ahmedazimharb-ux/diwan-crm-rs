"use client";

import React, { useEffect, useState } from "react";
import { FileCheck2, Search, Download, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default function SalesPage() {
  const [salesList, setSalesList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/sales");
      const json = await res.json();
      if (json.success) {
        setSalesList(json.sales);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const filtered = salesList.filter(
    (s) =>
      (s.customerName && s.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (s.unitNumber && s.unitNumber.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-1">
            <FileCheck2 className="w-4 h-4" /> Contracted Revenue Ledger
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sales & Executed Contracts</h1>
          <p className="text-slate-500 text-xs mt-1">
            Official sales records, contract values, down payments, and PDF contract documents.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by buyer name or unit code..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-amber-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Total Closed Sales Volume:{" "}
          <strong className="text-slate-900">
            {salesList.reduce((acc, s) => acc + parseFloat(s.netSaleValue || "0"), 0).toLocaleString()} EGP
          </strong>
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5 pl-5">Sale Date</th>
                <th className="p-3.5">Buyer Customer</th>
                <th className="p-3.5">Unit Code</th>
                <th className="p-3.5">Project</th>
                <th className="p-3.5">Payment Plan</th>
                <th className="p-3.5">Net Sale Value</th>
                <th className="p-3.5">Commission</th>
                <th className="p-3.5">Contract Status</th>
                <th className="p-3.5 text-right pr-5">Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80">
                  <td className="p-3.5 pl-5 text-slate-500 font-mono">{s.saleDate}</td>
                  <td className="p-3.5 font-bold text-slate-900">{s.customerName}</td>
                  <td className="p-3.5 font-black text-amber-600">{s.unitNumber}</td>
                  <td className="p-3.5 text-slate-700">{s.projectName}</td>
                  <td className="p-3.5 text-slate-600">{s.paymentPlanName || "10% Down / 3 Yrs"}</td>
                  <td className="p-3.5 font-bold font-mono text-slate-900">
                    {parseFloat(s.netSaleValue).toLocaleString()} EGP
                  </td>
                  <td className="p-3.5 font-mono text-emerald-700 font-bold">
                    {parseFloat(s.commissionAmount).toLocaleString()} EGP
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                      {s.contractStatus}
                    </span>
                  </td>
                  <td className="p-3.5 text-right pr-5">
                    <button className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] inline-flex items-center gap-1">
                      <FileText className="w-3 h-3 text-amber-600" /> Contract PDF
                    </button>
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
