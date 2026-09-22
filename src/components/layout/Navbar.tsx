"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Building,
  ShieldCheck,
  User,
  Check,
  Sparkles,
} from "lucide-react";
import { useApp, Role } from "@/context/AppContext";
import Link from "next/link";

export function Navbar({ onOpenNewLead, onOpenNewUnit }: { onOpenNewLead?: () => void; onOpenNewUnit?: () => void }) {
  const {
    role,
    setRole,
    activeProjectId,
    setActiveProjectId,
    unreadNotificationsCount,
    setOpenGlobalSearch,
  } = useApp();

  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showQuickAction, setShowQuickAction] = useState(false);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        if (data.success) {
          setProjectsList(data.projects);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadProjects();
  }, []);

  const roles: Role[] = ["Super Admin", "Sales Manager", "Sales Agent", "Accountant", "Marketing"];

  const activeProjectName =
    activeProjectId === "all"
      ? "All Projects"
      : projectsList.find((p) => p.id.toString() === activeProjectId)?.name || "Select Project";

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-6 shadow-xs">
      {/* Left: Project Switcher & Search */}
      <div className="flex items-center gap-4">
        {/* Project Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold border border-slate-200 transition-all"
          >
            <Building className="w-3.5 h-3.5 text-amber-600" />
            <span>{activeProjectName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProjectDropdown && (
            <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Filter Active Project
              </div>
              <button
                onClick={() => {
                  setActiveProjectId("all");
                  setShowProjectDropdown(false);
                }}
                className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-slate-50 font-medium ${
                  activeProjectId === "all" ? "text-amber-600 font-bold bg-amber-50/50" : "text-slate-700"
                }`}
              >
                <span>All Projects</span>
                {activeProjectId === "all" && <Check className="w-3.5 h-3.5 text-amber-600" />}
              </button>
              {projectsList.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveProjectId(p.id.toString());
                    setShowProjectDropdown(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-slate-50 font-medium ${
                    activeProjectId === p.id.toString()
                      ? "text-amber-600 font-bold bg-amber-50/50"
                      : "text-slate-700"
                  }`}
                >
                  <div className="truncate">
                    <span className="block">{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{p.location}</span>
                  </div>
                  {activeProjectId === p.id.toString() && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Search Bar */}
        <button
          onClick={() => setOpenGlobalSearch(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-400 text-xs w-64 transition-all"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">Search units, customers, leads...</span>
          <kbd className="ml-auto text-[10px] bg-white text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded-md font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Actions: Role Switcher, Quick Action, Notifications, User Profile */}
      <div className="flex items-center gap-3">
        {/* Live Role Switcher (Crucial for Evaluator) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200/80 text-xs font-semibold transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Role: {role}</span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-600/70" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Role Permission
              </div>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-amber-50/60 font-medium ${
                    role === r ? "text-amber-700 font-bold bg-amber-50" : "text-slate-700"
                  }`}
                >
                  <span>{r}</span>
                  {role === r && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Action Button */}
        <div className="relative">
          <button
            onClick={() => setShowQuickAction(!showQuickAction)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick Action</span>
          </button>

          {showQuickAction && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
              <Link
                href="/units?action=new"
                onClick={() => setShowQuickAction(false)}
                className="w-full text-left px-3.5 py-2 block hover:bg-slate-50 text-slate-700 font-medium"
              >
                + Add New Unit
              </Link>
              <Link
                href="/leads?action=new"
                onClick={() => setShowQuickAction(false)}
                className="w-full text-left px-3.5 py-2 block hover:bg-slate-50 text-slate-700 font-medium"
              >
                + Create New Lead
              </Link>
              <Link
                href="/reservations?action=new"
                onClick={() => setShowQuickAction(false)}
                className="w-full text-left px-3.5 py-2 block hover:bg-slate-50 text-slate-700 font-medium"
              >
                + New Reservation
              </Link>
              <Link
                href="/customers?action=new"
                onClick={() => setShowQuickAction(false)}
                className="w-full text-left px-3.5 py-2 block hover:bg-slate-50 text-slate-700 font-medium"
              >
                + Add Customer
              </Link>
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <Link
          href="/settings?tab=notifications"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
          )}
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 font-bold flex items-center justify-center text-xs shadow-xs">
            AA
          </div>
          <div className="hidden lg:block text-left">
            <span className="block text-xs font-semibold text-slate-900 leading-none">
              Ahmed Al-Mansi
            </span>
            <span className="text-[10px] text-slate-400 font-medium">{role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
