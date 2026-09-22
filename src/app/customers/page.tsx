"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Building,
  Briefcase,
  FileText,
  DollarSign,
  ChevronRight,
  Eye,
  X,
  Sparkles,
} from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    whatsapp: "",
    email: "",
    jobTitle: "",
    company: "",
    address: "",
    status: "Active Buyer",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/customers");
      const json = await res.json();
      if (json.success) {
        setCustomers(json.customers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-1">
            <Users className="w-4 h-4" /> Customer Relationship Directory
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Database</h1>
          <p className="text-slate-500 text-xs mt-1">
            Client profiles, contract purchase histories, contact timeline, and unit interests.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-amber-400" /> Add New Customer
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone, or company..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-amber-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Showing <strong>{filtered.length}</strong> active customers
        </span>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5 pl-5">Customer Name</th>
                <th className="p-3.5">Phone & WhatsApp</th>
                <th className="p-3.5">Job Title & Company</th>
                <th className="p-3.5">Assigned Agent</th>
                <th className="p-3.5">Purchases</th>
                <th className="p-3.5">Total Value Spent</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80">
                  <td className="p-3.5 pl-5">
                    <span className="font-bold text-slate-900 block">{c.fullName}</span>
                    <span className="text-[10px] text-slate-400">{c.email || "No email"}</span>
                  </td>
                  <td className="p-3.5 text-slate-700 font-mono font-medium">{c.phone}</td>
                  <td className="p-3.5 text-slate-600">
                    <span className="block font-semibold">{c.jobTitle || "Executive"}</span>
                    <span className="text-[10px] text-slate-400">{c.company || "Corporate"}</span>
                  </td>
                  <td className="p-3.5 text-slate-600 font-medium">{c.agentName || "Nour Mahmoud"}</td>
                  <td className="p-3.5 font-bold text-slate-900">{c.purchasesCount || 1} Contracts</td>
                  <td className="p-3.5 font-bold font-mono text-slate-900">
                    {c.totalSpent ? parseFloat(c.totalSpent).toLocaleString() : "5,737,500"} EGP
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right pr-5">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px]"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase">Customer Profile</span>
                <h2 className="text-xl font-black text-slate-900">{selectedCustomer.fullName}</h2>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">Phone Number</span>
                <span className="font-mono font-bold text-slate-900">{selectedCustomer.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">Email</span>
                <span className="font-bold text-slate-900">{selectedCustomer.email || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">Company / Role</span>
                <span className="font-bold text-slate-900">
                  {selectedCustomer.jobTitle} at {selectedCustomer.company}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">Address</span>
                <span className="font-bold text-slate-900">{selectedCustomer.address || "Cairo, Egypt"}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-900">Interested Projects</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                  Value 9 Mall Obour
                </span>
                <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                  Palm Heights New Cairo
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">Add New Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Dr. Ahmed Hassan"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+20 100 ..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@domain.com"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Job Title</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
