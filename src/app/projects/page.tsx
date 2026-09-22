"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  Plus,
  MapPin,
  Calendar,
  Layers,
  Grid3X3,
  DollarSign,
  FileText,
  Video,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";
import { generateProjectDescription } from "@/lib/projectDescription";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    developer: "Al Qasr Development",
    location: "",
    address: "",
    description: "",
    projectType: "Commercial Mall",
    deliveryDate: "2027-12-31",
    constructionStatus: "Under Construction",
    totalLandArea: "",
    numberOfBuildings: "1",
    numberOfUnits: "67",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/projects");
      const json = await res.json();
      if (json.success) {
        setProjects(json.projects);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerateDescription(projectId: number) {
    setIsGeneratingDescription(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/generate-description`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setSelectedProject((prev: any) => (prev ? { ...prev, description: json.description } : prev));
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingDescription(false);
    }
  }

  function handleGenerateDraftDescription() {
    const draft = generateProjectDescription({
      name: formData.name || "This Project",
      developer: formData.developer,
      location: formData.location || "Egypt",
      projectType: formData.projectType,
      totalLandArea: formData.totalLandArea,
      numberOfUnits: parseInt(formData.numberOfUnits) || 0,
      deliveryDate: formData.deliveryDate,
      constructionStatus: formData.constructionStatus,
      amenities: [],
    });
    setFormData({ ...formData, description: draft });
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setShowCreateModal(false);
        fetchProjects();
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
            <Building2 className="w-4 h-4" /> Real Estate Portfolio
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Project Management</h1>
          <p className="text-slate-500 text-xs mt-1">
            Manage projects, developers, master plans, construction milestones & specs.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-amber-400" /> Create New Project
        </button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading projects...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Hero Cover Image */}
                <div className="relative h-48 bg-slate-900 overflow-hidden">
                  <img
                    src={
                      p.images && p.images[0]
                        ? p.images[0]
                        : "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"
                    }
                    alt={p.name}
                    className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* Status Badges */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                      {p.projectType}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-white text-[11px] font-bold">
                      {p.constructionStatus}
                    </span>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h2 className="text-xl font-extrabold">{p.name}</h2>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" /> {p.location}
                    </p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>

                  {/* Specs Pill Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Developer</span>
                      <span className="font-bold text-slate-800 text-[11px] truncate block">{p.developer}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Delivery Date</span>
                      <span className="font-bold text-slate-800 text-[11px]">{p.deliveryDate || "Dec 2027"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Total Units</span>
                      <span className="font-bold text-slate-800 text-[11px]">{p.totalUnits || p.numberOfUnits} Units</span>
                    </div>
                  </div>

                  {/* Availability Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600">Unit Sales Progress</span>
                      <span className="text-emerald-600">{p.soldUnits || 0} Sold / {p.availableUnits || 0} Available</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{
                          width: `${
                            p.totalUnits ? ((p.soldUnits || 0) / p.totalUnits) * 100 : 20
                          }%`,
                        }}
                      />
                      <div
                        className="bg-amber-400 h-full"
                        style={{
                          width: `${
                            p.totalUnits ? ((p.reservedUnits || 0) / p.totalUnits) * 100 : 15
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Amenities */}
                  {p.amenities && p.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {p.amenities.slice(0, 4).map((am: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-medium"
                        >
                          ✓ {am}
                        </span>
                      ))}
                      {p.amenities.length > 4 && (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[10px]">
                          +{p.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/units?projectId=${p.id}`}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Grid3X3 className="w-3.5 h-3.5" /> Unit Availability <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => setSelectedProject(p)}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-all flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" /> Dedicated Dashboard
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dedicated Project Dashboard Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                  Project Master Dashboard
                </span>
                <h2 className="text-xl font-black">{selectedProject.name}</h2>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Project Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">TOTAL INVENTORY VALUE</span>
                  <span className="text-lg font-black text-slate-900 mt-1 block">
                    {parseFloat(selectedProject.totalInventoryVal || "350000000").toLocaleString()} EGP
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-600 font-bold block">AVAILABLE UNITS</span>
                  <span className="text-lg font-black text-emerald-700 mt-1 block">
                    {selectedProject.availableUnits || 35} Units
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] text-amber-600 font-bold block">RESERVED UNITS</span>
                  <span className="text-lg font-black text-amber-700 mt-1 block">
                    {selectedProject.reservedUnits || 5} Units
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                  <span className="text-[10px] text-purple-600 font-bold block">CONTRACTED / SOLD</span>
                  <span className="text-lg font-black text-purple-700 mt-1 block">
                    {selectedProject.soldUnits || 27} Units
                  </span>
                </div>
              </div>

              {/* Description & Developer */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs">Project Overview & Location</h4>
                  <button
                    onClick={() => handleGenerateDescription(selectedProject.id)}
                    disabled={isGeneratingDescription}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3" /> {isGeneratingDescription ? "Generating..." : "Generate with AI"}
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedProject.description}</p>
                <div className="text-xs text-slate-500 font-medium pt-1">
                  <strong>Address:</strong> {selectedProject.address}
                </div>
              </div>

              {/* Master Plan & Media */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-3">Master Plan & Media Gallery</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl overflow-hidden border border-slate-200 h-48 bg-slate-900">
                    <img
                      src={selectedProject.masterPlanUrl || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"}
                      alt="Master Plan"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 h-48 bg-slate-900">
                    <img
                      src={selectedProject.images?.[1] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"}
                      alt="Facade Render"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Link
                  href={`/units?projectId=${selectedProject.id}`}
                  onClick={() => setSelectedProject(null)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Manage Project Units & Availability
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">Create New Real Estate Project</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Value 10 Commercial Hub"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Developer</label>
                  <input
                    type="text"
                    value={formData.developer}
                    onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Project Type</label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white"
                  >
                    <option value="Commercial Mall">Commercial Mall</option>
                    <option value="Residential Compound">Residential Compound</option>
                    <option value="Mixed-Use">Mixed-Use</option>
                    <option value="Medical & Office">Medical & Office</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. 9th District, Obour City"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Delivery Date</label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 block">Project Description</label>
                  <button
                    type="button"
                    onClick={handleGenerateDraftDescription}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-[10px]"
                  >
                    <Sparkles className="w-3 h-3" /> Generate with AI
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key selling points, amenities, facades..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
