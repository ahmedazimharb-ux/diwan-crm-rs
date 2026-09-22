"use client";

import React, { useEffect, useState } from "react";
import { BookmarkCheck, Clock, CheckCircle2, XCircle, Search, AlertCircle } from "lucide-react";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  async function fetchReservations() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reservations");
      const json = await res.json();
      if (json.success) {
        setReservations(json.reservations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateStatus(id: number, status: string) {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        fetchReservations();
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = reservations.filter(
    (r) =>
      (r.customerName && r.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (r.unitNumber && r.unitNumber.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-1">
            <BookmarkCheck className="w-4 h-4" /> Active Unit Holds
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reservations Ledger</h1>
          <p className="text-slate-500 text-xs mt-1">
            Booking deposit tracking, expiration countdowns, and unit release workflows.
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
            placeholder="Search by customer name or unit code..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-amber-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Active Holds: <strong>{reservations.filter((r) => r.status === "Active").length}</strong> reservations
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5 pl-5">Booking Date</th>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Reserved Unit</th>
                <th className="p-3.5">Deposit Paid</th>
                <th className="p-3.5">Expiry Date</th>
                <th className="p-3.5">Assigned Agent</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right pr-5">Workflow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="p-3.5 pl-5 text-slate-500 font-mono">{r.reservationDate}</td>
                  <td className="p-3.5 font-bold text-slate-900">{r.customerName}</td>
                  <td className="p-3.5 font-black text-amber-600">{r.unitNumber}</td>
                  <td className="p-3.5 font-bold font-mono text-emerald-700">
                    {parseFloat(r.reservationAmount).toLocaleString()} EGP
                  </td>
                  <td className="p-3.5 font-mono text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" /> {r.expiryDate}
                  </td>
                  <td className="p-3.5 text-slate-600">{r.agentName || "Sales Agent"}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${
                        r.status === "Active"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : r.status === "Converted"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right pr-5 space-x-1">
                    {r.status === "Active" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(r.id, "Converted")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                        >
                          Convert to Sale
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(r.id, "Expired")}
                          className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[10px]"
                        >
                          Release / Expire
                        </button>
                      </>
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
