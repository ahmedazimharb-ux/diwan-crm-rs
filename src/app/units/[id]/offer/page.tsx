"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { Printer, Building2, Ruler, MapPin, Calendar, User, Phone } from "lucide-react";

export default function UnitOfferPage() {
  const params = useParams();
  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/units/${params.id}`);
        const json = await res.json();
        if (json.success) setUnit(json.unit);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return <div className="p-10 text-center text-slate-400">Loading offer...</div>;
  }
  if (!unit) {
    return <div className="p-10 text-center text-red-500">Unit not found.</div>;
  }

  const formatCurrency = (v: string | number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(Number(v));

  return (
    <div className="min-h-screen bg-slate-100 py-10 print:bg-white print:py-0">
      {/* Print controls — hidden when actually printing / saving as PDF */}
      <div className="max-w-3xl mx-auto mb-4 flex justify-end print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-md hover:bg-slate-800 transition-all"
        >
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      {/* The offer sheet itself */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl print:rounded-none shadow-xl print:shadow-none border border-slate-200 print:border-0 overflow-hidden">
        {/* Header / letterhead */}
        <div className="bg-gradient-to-l from-slate-900 to-slate-700 text-white px-8 py-6 flex items-center justify-between">
          <div>
            <div className="text-xl font-black tracking-tight">VALUE Real Estate</div>
            <div className="text-slate-300 text-xs mt-0.5">Unit Offer Sheet</div>
          </div>
          <div className="text-right text-xs text-slate-300">
            <div>{new Date().toLocaleDateString()}</div>
            <div>Ref: UNIT-{unit.id}</div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{unit.projectName}</h1>
            <p className="text-slate-500 text-sm mt-1">Unit {unit.unitNumber} · {unit.unitType}</p>
          </div>

          {/* Key specs grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Spec icon={<Building2 className="w-4 h-4" />} label="Floor" value={unit.floor} />
            <Spec icon={<Ruler className="w-4 h-4" />} label="Area" value={`${unit.area} m²`} />
            <Spec icon={<MapPin className="w-4 h-4" />} label="View" value={unit.view} />
            <Spec icon={<Calendar className="w-4 h-4" />} label="Delivery" value={unit.paymentPlan?.deliveryMonths ? `${unit.paymentPlan.deliveryMonths} mo.` : "TBA"} />
          </div>

          {/* Price block */}
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 text-center">
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wide">Net Price</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{formatCurrency(unit.netPrice)}</div>
            {Number(unit.discount) > 0 && (
              <div className="text-xs text-slate-500 mt-1 line-through">{formatCurrency(unit.basePrice)}</div>
            )}
          </div>

          {/* Payment plan */}
          {unit.paymentPlan && (
            <div className="border border-slate-200 rounded-xl p-4 text-sm">
              <div className="font-bold text-slate-800 mb-2">Payment Plan — {unit.paymentPlan.name}</div>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>Down Payment: {unit.paymentPlan.downPaymentPercent}%</div>
                <div>Duration: {unit.paymentPlan.durationYears} years</div>
                <div>Installments: {unit.paymentPlan.installmentFrequency}</div>
                <div>Maintenance: {unit.paymentPlan.maintenanceDepositPercent}%</div>
              </div>
            </div>
          )}

          {/* Agent contact */}
          {unit.agent && (
            <div className="flex items-center gap-4 border-t border-slate-100 pt-5 text-sm text-slate-600">
              <div className="flex items-center gap-1.5"><User className="w-4 h-4" /> {unit.agent.name}</div>
              {unit.agent.phone && (
                <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {unit.agent.phone}</div>
              )}
            </div>
          )}

          <p className="text-[11px] text-slate-400 pt-4 border-t border-slate-100">
            This offer sheet is generated for informational purposes and is subject to availability and final contract terms.
          </p>
        </div>
      </div>
    </div>
  );
}

function Spec({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase mb-1">
        {icon} {label}
      </div>
      <div className="text-sm font-bold text-slate-800">{value}</div>
    </div>
  );
}
