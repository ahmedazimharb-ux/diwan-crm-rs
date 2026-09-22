"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, Plus, Calculator, Calendar, Check, DollarSign, Sparkles } from "lucide-react";

export default function PaymentPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulator state
  const [simPrice, setSimPrice] = useState<string>("5737500");
  const [simDpPercent, setSimDpPercent] = useState<string>("10");
  const [simYears, setSimYears] = useState<string>("3");
  const [simFreq, setSimFreq] = useState<string>("Quarterly");
  const [simDiscount, setSimDiscount] = useState<string>("10");
  const [simSchedule, setSimSchedule] = useState<any | null>(null);

  useEffect(() => {
    fetchPlans();
    runSimulation();
  }, []);

  async function fetchPlans() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/payment-plans");
      const json = await res.json();
      if (json.success) {
        setPlans(json.paymentPlans);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function runSimulation() {
    try {
      const res = await fetch("/api/payment-plans/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalPrice: simPrice,
          downPaymentPercent: simDpPercent,
          durationYears: simYears,
          installmentFrequency: simFreq,
          discountPercent: simDiscount,
          maintenancePercent: 7,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSimSchedule(json);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-1">
            <CreditCard className="w-4 h-4" /> Installment Schedule Builder
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payment Plans & Schedules</h1>
          <p className="text-slate-500 text-xs mt-1">
            Build custom flexible payment plans and run instant installment schedule simulations.
          </p>
        </div>
      </div>

      {/* Existing Plans Cards */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm">Active Payment Systems (Value 9 Mall & Projects)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {plans.map((p) => (
            <div key={p.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-sm">{p.name}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200 text-[10px]">
                  {p.discountCashPercent}% Cash Disc.
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">{p.description}</p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 font-medium text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Down Payment</span>
                  <span className="font-black text-slate-900">{p.downPaymentPercent}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Duration</span>
                  <span className="font-black text-slate-900">{p.durationYears} Years ({p.installmentsCount} inst.)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PAYMENT SCHEDULE SIMULATOR ENGINE */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-amber-600" />
          <h3 className="font-black text-slate-900 text-base">Interactive Installment Calculator Simulator</h3>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">UNIT LIST PRICE (EGP)</label>
            <input
              type="number"
              value={simPrice}
              onChange={(e) => setSimPrice(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">DISCOUNT %</label>
            <input
              type="number"
              value={simDiscount}
              onChange={(e) => setSimDiscount(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">DOWN PAYMENT %</label>
            <input
              type="number"
              value={simDpPercent}
              onChange={(e) => setSimDpPercent(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">DURATION (YEARS)</label>
            <input
              type="number"
              value={simYears}
              onChange={(e) => setSimYears(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={runSimulation}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
            >
              Calculate Schedule
            </button>
          </div>
        </div>

        {/* Breakdown Output */}
        {simSchedule && (
          <div className="space-y-4 pt-4 border-t border-slate-100 text-xs">
            <div className="grid grid-cols-4 gap-4 bg-slate-900 text-white p-4 rounded-2xl">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">NET CONTRACT VALUE</span>
                <span className="text-lg font-black text-amber-300">
                  {simSchedule.calculation.netContractValue.toLocaleString()} EGP
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">DOWN PAYMENT AMOUNT</span>
                <span className="text-lg font-black text-emerald-400">
                  {simSchedule.calculation.downPaymentAmount.toLocaleString()} EGP
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">QUARTERLY INSTALLMENT</span>
                <span className="text-lg font-black text-blue-300">
                  {simSchedule.calculation.installmentAmount.toLocaleString()} EGP
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">7% MAINTENANCE DEPOSIT</span>
                <span className="text-lg font-black text-purple-300">
                  {simSchedule.calculation.maintenanceDepositAmount.toLocaleString()} EGP
                </span>
              </div>
            </div>

            {/* Generated Installments Schedule Table */}
            <div className="border rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-500">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Payment Milestone</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3">EGP Amount</th>
                    <th className="p-3">% Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {simSchedule.schedule.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-400">{row.number}</td>
                      <td className="p-3 font-bold text-slate-900">{row.type}</td>
                      <td className="p-3 font-mono text-slate-600">{row.dueDate}</td>
                      <td className="p-3 font-bold font-mono text-slate-900">
                        {row.amount.toLocaleString()} EGP
                      </td>
                      <td className="p-3 font-bold text-amber-600">{row.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
