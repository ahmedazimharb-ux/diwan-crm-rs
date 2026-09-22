"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Grid3X3, Users, UserCheck, Building2, UserCog, ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";

export function GlobalSearchModal() {
  const { openGlobalSearch, setOpenGlobalSearch } = useApp();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    units: any[];
    customers: any[];
    leads: any[];
    projects: any[];
    agents: any[];
  }>({
    units: [],
    customers: [],
    leads: [],
    projects: [],
    agents: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpenGlobalSearch(true);
      }
      if (e.key === "Escape") {
        setOpenGlobalSearch(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setOpenGlobalSearch]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({ units: [], customers: [], leads: [], projects: [], agents: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.results);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!openGlobalSearch) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search unit number, customer name, phone, lead, project..."
            autoFocus
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden font-medium"
          />
          <button
            onClick={() => setOpenGlobalSearch(false)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {isLoading && (
            <div className="py-8 text-center text-xs text-slate-400">Searching CRM database...</div>
          )}

          {!isLoading && query.length < 2 && (
            <div className="py-8 text-center text-xs text-slate-400">
              Type at least 2 characters to search across all CRM records.
            </div>
          )}

          {!isLoading &&
            query.length >= 2 &&
            results.units.length === 0 &&
            results.customers.length === 0 &&
            results.leads.length === 0 &&
            results.projects.length === 0 &&
            results.agents.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No matching results found for &ldquo;{query}&rdquo;.
              </div>
            )}

          {/* Units */}
          {results.units.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Grid3X3 className="w-3.5 h-3.5 text-amber-500" /> Units & Availability
              </div>
              <div className="space-y-1">
                {results.units.map((u) => (
                  <Link
                    key={u.id}
                    href={`/units?search=${u.unitNumber}`}
                    onClick={() => setOpenGlobalSearch(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-xs">Unit {u.unitNumber}</span>
                      <span className="text-slate-400 text-[11px] ml-2 font-normal">
                        {u.floor} • {u.unitType} • {u.area} SQM
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900">
                        {parseFloat(u.netPrice || u.currentPrice).toLocaleString()} EGP
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {results.customers.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" /> Customers
              </div>
              <div className="space-y-1">
                {results.customers.map((c) => (
                  <Link
                    key={c.id}
                    href={`/customers?search=${c.fullName}`}
                    onClick={() => setOpenGlobalSearch(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-xs">{c.fullName}</span>
                      <span className="text-slate-400 text-[11px] ml-2 font-mono">{c.phone}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Leads */}
          {results.leads.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> CRM Leads
              </div>
              <div className="space-y-1">
                {results.leads.map((l) => (
                  <Link
                    key={l.id}
                    href={`/leads?search=${l.fullName}`}
                    onClick={() => setOpenGlobalSearch(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-xs">{l.fullName}</span>
                      <span className="text-slate-400 text-[11px] ml-2 font-normal">
                        {l.status} • {l.leadSource}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {results.projects.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-500" /> Real Estate Projects
              </div>
              <div className="space-y-1">
                {results.projects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects`}
                    onClick={() => setOpenGlobalSearch(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-xs">{p.name}</span>
                      <span className="text-slate-400 text-[11px] ml-2 font-normal">{p.location}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
