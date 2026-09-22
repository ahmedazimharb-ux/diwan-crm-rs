"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Grid3X3,
  Table as TableIcon,
  Filter,
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  BookmarkCheck,
  Tag,
  CheckCircle2,
  Clock,
  Ban,
  DollarSign,
  ChevronRight,
  Eye,
  Edit,
  X,
  Sparkles,
  Calculator,
  UserPlus,
  RefreshCw,
  Check,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function UnitsPage() {
  const { activeProjectId, role } = useApp();
  const [units, setUnits] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View state: 'matrix' or 'table'
  const [viewMode, setViewMode] = useState<"matrix" | "table">("matrix");

  // Filters
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterFloor, setFilterFloor] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Selection
  const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([]);

  // Modals & Drawers
  const [drawerUnit, setDrawerUnit] = useState<any | null>(null);
  const [reserveModalUnit, setReserveModalUnit] = useState<any | null>(null);
  const [sellModalUnit, setSellModalUnit] = useState<any | null>(null);
  const [priceModalUnit, setPriceModalUnit] = useState<any | null>(null);
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);

  // Reserve form state
  const [reserveForm, setReserveForm] = useState({
    customerId: "",
    customerName: "",
    reservationAmount: "100000",
    expiryDate: "2025-06-30",
    notes: "Booking deposit paid",
  });

  // Sell form state
  const [sellForm, setSellForm] = useState({
    customerId: "",
    customerName: "",
    contractValue: "",
    discountAmount: "0",
    netSaleValue: "",
    paymentPlanId: "",
    commissionPercent: "2.5",
    contractStatus: "Signed",
  });

  // Price form state
  const [priceForm, setPriceForm] = useState({
    newPrice: "",
    reason: "Official Obour Launch price indexation",
  });

  // Bulk action form
  const [bulkAction, setBulkAction] = useState<string>("change_status");
  const [bulkStatus, setBulkStatus] = useState<string>("Available");
  const [bulkPriceValue, setBulkPriceValue] = useState<string>("10");
  const [bulkPriceType, setBulkPriceType] = useState<string>("percent_increase");
  const [bulkPlanId, setBulkPlanId] = useState<string>("");

  // Import Excel state
  const [importReport, setImportReport] = useState<any | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Load data
  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setIsLoading(true);
    try {
      const [uRes, pRes, plRes, cRes, aRes] = await Promise.all([
        fetch("/api/units"),
        fetch("/api/projects"),
        fetch("/api/payment-plans"),
        fetch("/api/customers"),
        fetch("/api/agents"),
      ]);

      const [uData, pData, plData, cData, aData] = await Promise.all([
        uRes.json(),
        pRes.json(),
        plRes.json(),
        cRes.json(),
        aRes.json(),
      ]);

      if (uData.success) setUnits(uData.units);
      if (pData.success) setProjects(pData.projects);
      if (plData.success) setPaymentPlans(plData.paymentPlans);
      if (cData.success) setCustomers(cData.customers);
      if (aData.success) setAgents(aData.agents);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  // Filtered Units calculation
  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      if (filterProject !== "all" && u.projectId.toString() !== filterProject) return false;
      if (filterFloor !== "all" && u.floor !== filterFloor) return false;
      if (filterType !== "all" && u.unitType !== filterType) return false;
      if (filterStatus !== "all" && u.status !== filterStatus) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.trim().toLowerCase();
        if (!u.unitNumber.toLowerCase().includes(q) && !(u.notes && u.notes.toLowerCase().includes(q))) {
          return false;
        }
      }
      return true;
    });
  }, [units, filterProject, filterFloor, filterType, filterStatus, searchQuery]);

  // Executive Stats
  const stats = useMemo(() => {
    const total = filteredUnits.length;
    const available = filteredUnits.filter((u) => u.status === "Available").length;
    const hold = filteredUnits.filter((u) => u.status === "Hold").length;
    const reserved = filteredUnits.filter((u) => u.status === "Reserved").length;
    const contracted = filteredUnits.filter((u) => u.status === "Contracted").length;
    const sold = filteredUnits.filter((u) => u.status === "Sold").length;
    const totalValue = filteredUnits.reduce((acc, u) => acc + parseFloat(u.netPrice || u.currentPrice || "0"), 0);

    return { total, available, hold, reserved, contracted, sold, totalValue };
  }, [filteredUnits]);

  // Group units by Floor for Floor Matrix Stacking Plan
  const unitsByFloor = useMemo(() => {
    const map: Record<string, any[]> = {};
    filteredUnits.forEach((u) => {
      const fl = u.floor || "Ground Floor";
      if (!map[fl]) map[fl] = [];
      map[fl].push(u);
    });
    return map;
  }, [filteredUnits]);

  // Select All toggle
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUnitIds(filteredUnits.map((u) => u.id));
    } else {
      setSelectedUnitIds([]);
    }
  };

  const handleSelectUnit = (id: number) => {
    if (selectedUnitIds.includes(id)) {
      setSelectedUnitIds(selectedUnitIds.filter((item) => item !== id));
    } else {
      setSelectedUnitIds([...selectedUnitIds, id]);
    }
  };

  // Status Badge Styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
      case "Hold":
        return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100";
      case "Reserved":
        return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100";
      case "Contracted":
        return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
      case "Sold":
        return "bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  // Submit Reservation
  async function handleReserveSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reserveModalUnit) return;

    const cust = customers.find((c) => c.id.toString() === reserveForm.customerId);

    try {
      const res = await fetch(`/api/units/${reserveModalUnit.id}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reserveForm,
          customerName: cust ? cust.fullName : reserveForm.customerName || "Customer",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReserveModalUnit(null);
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Submit Sale
  async function handleSellSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sellModalUnit) return;

    const cust = customers.find((c) => c.id.toString() === sellForm.customerId);

    try {
      const res = await fetch(`/api/units/${sellModalUnit.id}/sell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sellForm,
          customerName: cust ? cust.fullName : sellForm.customerName || "Customer",
          netSaleValue: sellForm.netSaleValue || sellModalUnit.netPrice,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSellModalUnit(null);
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Submit Price Update
  async function handlePriceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!priceModalUnit) return;

    try {
      const res = await fetch(`/api/units/${priceModalUnit.id}/price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(priceForm),
      });
      const data = await res.json();
      if (data.success) {
        setPriceModalUnit(null);
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Submit Bulk Action
  async function handleBulkSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/units/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitIds: selectedUnitIds,
          action: bulkAction,
          status: bulkStatus,
          priceAdjustmentType: bulkPriceType,
          priceAdjustmentValue: bulkPriceValue,
          paymentPlanId: bulkPlanId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowBulkModal(false);
        setSelectedUnitIds([]);
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Handle Demo Excel Import Preview
  async function handleRunDemoImport() {
    setIsImporting(true);
    try {
      const sampleItems = [
        { unitNumber: "G22-V9", floor: "Ground Floor", area: 55, basePrice: 10175000, unitType: "Retail Store", status: "Available" },
        { unitNumber: "F31-V9", floor: "1st Floor", area: 32, basePrice: 3840000, unitType: "Commercial Space", status: "Available" },
        { unitNumber: "S17-V9", floor: "2nd Floor", area: 50, basePrice: 3500000, unitType: "Administrative Office", status: "Available" },
        { unitNumber: "G1-V9", floor: "Ground Floor", area: 57, basePrice: 11115000, unitType: "Retail Store", status: "Available" }, // Duplicate
      ];

      const res = await fetch("/api/units/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: sampleItems, projectId: 1, confirmImport: false }),
      });
      const json = await res.json();
      if (json.success) {
        setImportReport(json.report);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  }

  async function handleConfirmImport() {
    if (!importReport || !importReport.preview || importReport.preview.length === 0) return;
    setIsImporting(true);
    try {
      const res = await fetch("/api/units/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: importReport.preview, projectId: 1, confirmImport: true }),
      });
      const json = await res.json();
      if (json.success) {
        setShowImportModal(false);
        setImportReport(null);
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-1">
            <Grid3X3 className="w-4 h-4" /> Core Availability Engine
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Units & Real-Time Availability</h1>
          <p className="text-slate-500 text-xs mt-1">
            Visual floor matrix, inventory status, price list calculator, and reservations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Import Excel
          </button>

          {selectedUnitIds.length > 0 && (
            <button
              onClick={() => setShowBulkModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Edit className="w-4 h-4" /> Bulk Actions ({selectedUnitIds.length})
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode("matrix")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "matrix" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5 text-amber-600" /> Floor Matrix
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 text-blue-600" /> Table View
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Units</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">{stats.total}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-[10px] text-emerald-600 font-bold block uppercase">Available</span>
          <span className="text-xl font-extrabold text-emerald-700 mt-1 block">{stats.available}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-xs">
          <span className="text-[10px] text-purple-600 font-bold block uppercase">Hold</span>
          <span className="text-xl font-extrabold text-purple-700 mt-1 block">{stats.hold}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-[10px] text-amber-600 font-bold block uppercase">Reserved</span>
          <span className="text-xl font-extrabold text-amber-700 mt-1 block">{stats.reserved}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <span className="text-[10px] text-blue-600 font-bold block uppercase">Contracted</span>
          <span className="text-xl font-extrabold text-blue-700 mt-1 block">{stats.contracted}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-300 bg-slate-100/40 shadow-xs">
          <span className="text-[10px] text-slate-600 font-bold block uppercase">Sold</span>
          <span className="text-xl font-extrabold text-slate-800 mt-1 block">{stats.sold}</span>
        </div>
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 shadow-xs col-span-2 md:col-span-1">
          <span className="text-[10px] text-amber-400 font-bold block uppercase">Inventory Valuation</span>
          <span className="text-sm font-black mt-1 block text-amber-300">
            {stats.totalValue.toLocaleString()} EGP
          </span>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Project */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">PROJECT</label>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Floor */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">FLOOR</label>
            <select
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
            >
              <option value="all">All Floors</option>
              <option value="Ground Floor">Ground Floor (Retail)</option>
              <option value="1st Floor">1st Floor (Commercial)</option>
              <option value="2nd Floor">2nd Floor (Medical & Office)</option>
            </select>
          </div>

          {/* Unit Type */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">UNIT TYPE</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
            >
              <option value="all">All Types</option>
              <option value="Retail Store">Retail Store</option>
              <option value="Commercial Space">Commercial Space</option>
              <option value="Administrative Office">Administrative Office</option>
              <option value="Medical Clinic">Medical Clinic</option>
              <option value="Apartment">Apartment</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">STATUS</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Hold">Hold</option>
              <option value="Reserved">Reserved</option>
              <option value="Contracted">Contracted</option>
              <option value="Sold">Sold</option>
            </select>
          </div>

          {/* Unit Search */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">SEARCH UNIT NUMBER</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. G1-V9, F5, S2"
                className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: Visual Floor Matrix / Stacking Plan */}
      {viewMode === "matrix" && (
        <div className="space-y-6">
          {Object.keys(unitsByFloor).length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
              No units match the selected filters.
            </div>
          ) : (
            Object.entries(unitsByFloor).map(([floorName, floorUnits]) => (
              <div key={floorName} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <h3 className="font-extrabold text-slate-900 text-sm">{floorName}</h3>
                    <span className="text-xs text-slate-400 font-medium">({floorUnits.length} Units)</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    Floor Valuation:{" "}
                    <strong className="text-slate-900">
                      {floorUnits
                        .reduce((acc, u) => acc + parseFloat(u.netPrice || "0"), 0)
                        .toLocaleString()}{" "}
                      EGP
                    </strong>
                  </span>
                </div>

                {/* Grid of Interactive Unit Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {floorUnits.map((u) => {
                    const isSelected = selectedUnitIds.includes(u.id);

                    return (
                      <div
                        key={u.id}
                        className={`p-3 rounded-2xl border text-xs transition-all relative group flex flex-col justify-between cursor-pointer ${getStatusBadge(
                          u.status
                        )} ${isSelected ? "ring-2 ring-amber-500 shadow-md" : ""}`}
                        onClick={() => setDrawerUnit(u)}
                      >
                        {/* Checkbox for Bulk */}
                        <div
                          className="absolute top-2.5 right-2.5 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectUnit(u.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded-md border-slate-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="font-black text-slate-900 text-sm flex items-center gap-1">
                            {u.unitNumber}
                          </div>
                          <div className="text-[10px] text-slate-600 font-medium mt-0.5">
                            {u.unitType} • {u.area} SQM
                          </div>
                          <div className="text-[11px] font-bold text-slate-900 mt-2">
                            {parseFloat(u.netPrice || u.currentPrice).toLocaleString()} EGP
                          </div>
                          <div className="text-[9px] text-slate-500">
                            {parseFloat(u.pricePerSqm).toLocaleString()} EGP / SQM
                          </div>
                        </div>

                        {/* Status Label & Quick Action */}
                        <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-bold">
                          <span className="uppercase tracking-wider">{u.status}</span>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            {u.status === "Available" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReserveModalUnit(u);
                                }}
                                className="px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 hover:bg-amber-400"
                              >
                                Reserve
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW 2: Table View */}
      {viewMode === "table" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5 pl-5">
                    <input
                      type="checkbox"
                      checked={
                        selectedUnitIds.length > 0 && selectedUnitIds.length === filteredUnits.length
                      }
                      onChange={handleSelectAll}
                      className="rounded-md border-slate-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                    />
                  </th>
                  <th className="p-3.5">Unit Code</th>
                  <th className="p-3.5">Floor</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Area (SQM)</th>
                  <th className="p-3.5">View</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Price / SQM</th>
                  <th className="p-3.5">Net Price</th>
                  <th className="p-3.5">Agent</th>
                  <th className="p-3.5 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUnits.map((u) => {
                  const isSelected = selectedUnitIds.includes(u.id);

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-amber-50/40" : ""
                      }`}
                    >
                      <td className="p-3.5 pl-5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectUnit(u.id)}
                          className="rounded-md border-slate-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                        />
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">{u.unitNumber}</td>
                      <td className="p-3.5 text-slate-600 font-medium">{u.floor}</td>
                      <td className="p-3.5 text-slate-600 font-medium">{u.unitType}</td>
                      <td className="p-3.5 font-semibold text-slate-800">{u.area} SQM</td>
                      <td className="p-3.5 text-slate-500 truncate max-w-[120px]">{u.view}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                            u.status
                          )}`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-mono">
                        {parseFloat(u.pricePerSqm).toLocaleString()} EGP
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 font-mono">
                        {parseFloat(u.netPrice || u.currentPrice).toLocaleString()} EGP
                      </td>
                      <td className="p-3.5 text-slate-500">{u.agentName || "Unassigned"}</td>
                      <td className="p-3.5 text-right pr-5 space-x-1">
                        <button
                          onClick={() => setDrawerUnit(u)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {u.status === "Available" && (
                          <button
                            onClick={() => setReserveModalUnit(u)}
                            className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px]"
                          >
                            Reserve
                          </button>
                        )}

                        {(u.status === "Available" || u.status === "Reserved") && (
                          <button
                            onClick={() => {
                              setSellForm({
                                ...sellForm,
                                contractValue: u.basePrice,
                                netSaleValue: u.netPrice,
                              });
                              setSellModalUnit(u);
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                          >
                            Sell
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setPriceForm({ newPrice: u.currentPrice, reason: "" });
                            setPriceModalUnit(u);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600"
                          title="Change Price"
                        >
                          <Tag className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* UNIT DETAIL DRAWER */}
      {drawerUnit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto p-6 space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Unit Specification Drawer
                </span>
                <h2 className="text-2xl font-black text-slate-900">Unit {drawerUnit.unitNumber}</h2>
              </div>
              <button
                onClick={() => setDrawerUnit(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Pricing Summary Card */}
            <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-400 font-bold uppercase">{drawerUnit.unitType}</span>
                <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  {drawerUnit.status}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Total Net Price</span>
                <div className="text-3xl font-black text-amber-300 mt-1">
                  {parseFloat(drawerUnit.netPrice || drawerUnit.currentPrice).toLocaleString()}{" "}
                  <span className="text-sm text-slate-300 font-normal">EGP</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Price Per SQM</span>
                  <span className="font-bold text-slate-200">
                    {parseFloat(drawerUnit.pricePerSqm).toLocaleString()} EGP
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Area</span>
                  <span className="font-bold text-slate-200">{drawerUnit.area} SQM</span>
                </div>
              </div>
            </div>

            {/* Spec Details Table */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Unit Specifications</h4>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Floor Location</span>
                  <span className="font-bold text-slate-800">{drawerUnit.floor}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Project / Mall</span>
                  <span className="font-bold text-slate-800">{drawerUnit.projectName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Terrace / Outdoor Area</span>
                  <span className="font-bold text-slate-800">{drawerUnit.terraceArea || 0} SQM</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">View / Frontage</span>
                  <span className="font-bold text-slate-800">{drawerUnit.view}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons inside Drawer */}
            <div className="flex items-center gap-2 pt-4 border-t border-slate-100 flex-wrap">
              {drawerUnit.status === "Available" && (
                <button
                  onClick={() => {
                    setReserveModalUnit(drawerUnit);
                    setDrawerUnit(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Reserve Unit
                </button>
              )}
              {(drawerUnit.status === "Available" || drawerUnit.status === "Reserved") && (
                <button
                  onClick={() => {
                    setSellForm({
                      ...sellForm,
                      contractValue: drawerUnit.basePrice,
                      netSaleValue: drawerUnit.netPrice,
                    });
                    setSellModalUnit(drawerUnit);
                    setDrawerUnit(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                >
                  Create Sale Contract
                </button>
              )}
              <a
                href={`/units/${drawerUnit.id}/offer`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md text-center"
              >
                PDF Offer
              </a>
            </div>
          </div>
        </div>
      )}

      {/* RESERVE UNIT MODAL */}
      {reserveModalUnit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase">
                  Reservation Booking
                </span>
                <h3 className="font-black text-slate-900 text-base">
                  Reserve Unit {reserveModalUnit.unitNumber}
                </h3>
              </div>
              <button
                onClick={() => setReserveModalUnit(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReserveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Customer *</label>
                <select
                  required
                  value={reserveForm.customerId}
                  onChange={(e) => setReserveForm({ ...reserveForm, customerId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Booking Deposit Amount (EGP) *</label>
                <input
                  type="number"
                  required
                  value={reserveForm.reservationAmount}
                  onChange={(e) => setReserveForm({ ...reserveForm, reservationAmount: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reservation Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={reserveForm.expiryDate}
                  onChange={(e) => setReserveForm({ ...reserveForm, expiryDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes & Payment Reference</label>
                <textarea
                  rows={2}
                  value={reserveForm.notes}
                  onChange={(e) => setReserveForm({ ...reserveForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReserveModalUnit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SELL UNIT MODAL */}
      {sellModalUnit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">
                  Sales Contract Workflow
                </span>
                <h3 className="font-black text-slate-900 text-base">
                  Sell Unit {sellModalUnit.unitNumber}
                </h3>
              </div>
              <button onClick={() => setSellModalUnit(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSellSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Buyer / Customer *</label>
                <select
                  required
                  value={sellForm.customerId}
                  onChange={(e) => setSellForm({ ...sellForm, customerId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900"
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contract Value (EGP)</label>
                  <input
                    type="number"
                    value={sellForm.contractValue || sellModalUnit.basePrice}
                    onChange={(e) => setSellForm({ ...sellForm, contractValue: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Net Sale Value (EGP)</label>
                  <input
                    type="number"
                    value={sellForm.netSaleValue || sellModalUnit.netPrice}
                    onChange={(e) => setSellForm({ ...sellForm, netSaleValue: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Plan</label>
                  <select
                    value={sellForm.paymentPlanId}
                    onChange={(e) => setSellForm({ ...sellForm, paymentPlanId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">-- Select Payment Plan --</option>
                    {paymentPlans.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Commission %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sellForm.commissionPercent}
                    onChange={(e) => setSellForm({ ...sellForm, commissionPercent: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSellModalUnit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500"
                >
                  Generate Sale Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRICE CHANGE MODAL */}
      {priceModalUnit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">
                Change Price for Unit {priceModalUnit.unitNumber}
              </h3>
              <button onClick={() => setPriceModalUnit(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePriceSubmit} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-400 text-[10px] block font-bold">Current Base Price</span>
                <span className="font-bold text-slate-900 text-sm">
                  {parseFloat(priceModalUnit.currentPrice).toLocaleString()} EGP
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">New Unit Price (EGP) *</label>
                <input
                  type="number"
                  required
                  value={priceForm.newPrice}
                  onChange={(e) => setPriceForm({ ...priceForm, newPrice: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Adjustment *</label>
                <input
                  type="text"
                  required
                  value={priceForm.reason}
                  onChange={(e) => setPriceForm({ ...priceForm, reason: e.target.value })}
                  placeholder="e.g. Official Obour Launch Price Indexation"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPriceModalUnit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Save & Log History
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK ACTIONS MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">
                Bulk Action ({selectedUnitIds.length} Selected Units)
              </h3>
              <button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Action</label>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
                >
                  <option value="change_status">Change Availability Status</option>
                  <option value="update_price">Adjust Prices (Bulk)</option>
                  <option value="assign_payment_plan">Assign Payment Plan</option>
                </select>
              </div>

              {bulkAction === "change_status" && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">New Target Status</label>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
                  >
                    <option value="Available">Available</option>
                    <option value="Hold">Hold</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
              )}

              {bulkAction === "update_price" && (
                <div className="space-y-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Adjustment Type</label>
                    <select
                      value={bulkPriceType}
                      onChange={(e) => setBulkPriceType(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="percent_increase">Percentage Increase (+%)</option>
                      <option value="percent_decrease">Percentage Decrease (-%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Percentage Value (%)</label>
                    <input
                      type="number"
                      value={bulkPriceValue}
                      onChange={(e) => setBulkPriceValue(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Apply to {selectedUnitIds.length} Units
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT EXCEL MODAL WITH VALIDATION REPORT PREVIEW */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">
                  Bulk Data Ingestion
                </span>
                <h3 className="font-black text-slate-900 text-base">
                  Import Units Spreadsheet & Pre-Validation Report
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportReport(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!importReport ? (
              <div className="space-y-4 text-xs">
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center space-y-3 bg-slate-50">
                  <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto" />
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">
                      Upload Excel / CSV File
                    </span>
                    <span className="text-slate-400 text-xs mt-1 block">
                      Supports .xlsx, .csv formatted price sheets with unit code, area, price & floor
                    </span>
                  </div>
                  <button
                    onClick={handleRunDemoImport}
                    disabled={isImporting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Load Sample Sheet & Run Validation Engine
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Validation Report Summary */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">TOTAL ROWS</span>
                    <span className="text-lg font-black text-slate-900">{importReport.total}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-600 font-bold block">VALID ROWS</span>
                    <span className="text-lg font-black text-emerald-700">{importReport.validCount}</span>
                  </div>
                  <div className="p-3 bg-red-50 rounded-2xl border border-red-200">
                    <span className="text-[10px] text-red-600 font-bold block">ERRORS / DUPLICATES</span>
                    <span className="text-lg font-black text-red-700">{importReport.invalidCount}</span>
                  </div>
                </div>

                {/* Validation Errors list */}
                {importReport.errors.length > 0 && (
                  <div className="p-3 bg-red-50 rounded-2xl border border-red-200 space-y-1">
                    <div className="font-bold text-red-800 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Validation Alerts & Duplicate Protection:
                    </div>
                    {importReport.errors.map((err: any, i: number) => (
                      <div key={i} className="text-red-700 text-[11px]">
                        Row {err.row} ({err.unitNumber}): {err.issues.join(", ")}
                      </div>
                    ))}
                  </div>
                )}

                {/* Valid Preview Table */}
                <div className="max-h-48 overflow-y-auto border rounded-2xl">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 font-bold">
                      <tr>
                        <th className="p-2">Unit</th>
                        <th className="p-2">Floor</th>
                        <th className="p-2">Area</th>
                        <th className="p-2">Price</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {importReport.preview.map((p: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-bold">{p.unitNumber}</td>
                          <td className="p-2">{p.floor}</td>
                          <td className="p-2">{p.area} SQM</td>
                          <td className="p-2">{parseFloat(p.basePrice).toLocaleString()} EGP</td>
                          <td className="p-2 text-emerald-600 font-bold">{p.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setImportReport(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={isImporting || importReport.validCount === 0}
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-md"
                  >
                    Confirm Import {importReport.validCount} Valid Units
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
