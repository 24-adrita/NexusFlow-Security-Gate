import React from 'react';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Database, 
  ScrollText, 
  FileCode, 
  ShieldCheck, 
  LogOut, 
  Settings, 
  Key,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: { username: string; email: string; role: UserRole };
  onLogout: () => void;
  onChangeRole: (role: UserRole) => void;
}

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  currentUser, 
  onLogout, 
  onChangeRole 
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', label: 'Analytics Dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Manager / Operator', 'End User / Client'] },
    { id: 'ingestion', label: 'Ingestion & Workflows', icon: Database, roles: ['Super Admin', 'Manager / Operator', 'End User / Client'] },
    { id: 'logs', label: 'Audit System Logs', icon: ScrollText, roles: ['Super Admin', 'Manager / Operator'] },
    { id: 'blueprints', label: 'Django Blueprints', icon: FileCode, roles: ['Super Admin', 'Manager / Operator', 'End User / Client'] },
  ];

  const roles: UserRole[] = ['Super Admin', 'Manager / Operator', 'End User / Client'];

  return (
    <aside className="w-80 bg-[#0f1115] text-gray-200 flex flex-col border-r border-[#1f2937] shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#1f2937] flex items-center justify-between bg-[#0a0a0b]/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg tracking-wider text-white shadow-md shadow-blue-900/30">
            NF
          </div>
          <div>
            <h1 className="font-sans font-bold text-lg tracking-wider text-white">NexusFlow</h1>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Enterprise Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#111827] border border-[#1f2937] rounded text-[9px] font-mono text-gray-400">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          LIVE
        </div>
      </div>

      {/* Role Swapper Widget - Highlighted Simulation Utility */}
      <div className="p-4 mx-4 my-5 bg-[#111827] border border-[#1f2937] rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-mono font-medium text-white">RBAC Gate Simulation</span>
        </div>
        <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
          Switch roles to test the decorator authorization constraints across dashboard blocks & modules.
        </p>
        <div className="space-y-1.5">
          {roles.map((role) => {
            const isSelected = currentUser.role === role;
            return (
              <button
                key={role}
                onClick={() => onChangeRole(role)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 flex items-center justify-between ${
                  isSelected 
                    ? 'bg-blue-600/15 text-blue-300 border border-blue-500/35 font-semibold' 
                    : 'text-gray-400 hover:text-white hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                <span>{role}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 space-y-1.5">
        <span className="block px-3 text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-widest mb-2">
          OPERATIONAL DESKS
        </span>
        {menuItems.map((item) => {
          const hasAccess = item.roles.includes(currentUser.role);
          const isSelected = currentTab === item.id;

          if (!hasAccess) {
            return (
              <div 
                key={item.id} 
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-gray-600 bg-zinc-950/40 border border-[#1f2937]/50 cursor-not-allowed"
                title="Your assigned security Clearance role prevents access to this view."
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 opacity-50" />
                  <span className="font-sans line-through">{item.label}</span>
                </div>
                <Key className="w-3.5 h-3.5 text-gray-700" />
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 group relative ${
                isSelected 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-[#111827]'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span className="font-sans">{item.label}</span>
              </div>
              {item.id === 'blueprints' && (
                <span className={`px-1.5 py-0.5 text-[9px] font-mono rounded border ${
                  isSelected ? 'bg-blue-800 text-white border-blue-400' : 'bg-blue-950 text-blue-400 border-blue-900'
                }`}>
                  Django
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Status Footer */}
      <div className="p-4 border-t border-[#1f2937] bg-[#111827]/40 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-gray-300 font-semibold text-xs border border-zinc-700">
            {currentUser.username[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white truncate">{currentUser.username}</p>
            <p className="text-[10px] text-gray-500 truncate font-mono">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#1f2937]/60 text-[11px] font-mono">
          <span className="text-gray-500 uppercase">Clearance:</span>
          <span className="text-blue-400 font-semibold">{currentUser.role.split(' ')[0]}</span>
        </div>

        <button
          onClick={onLogout}
          className="w-full mt-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#111827] hover:bg-red-950/20 text-gray-400 hover:text-red-400 border border-[#1f2937] hover:border-red-900/30 rounded-lg text-xs font-mono transition-colors duration-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          Terminate Session
        </button>
      </div>
    </aside>
  );
}
