import React, { useState } from 'react';
import { UserRole, ActivityLog, NotificationAlert } from '../types';
import { 
  ScrollText, 
  Terminal, 
  Database, 
  ShieldAlert, 
  Layers, 
  RefreshCw, 
  FileCheck, 
  Sparkles,
  Search,
  Lock,
  LockKeyhole
} from 'lucide-react';

interface LogsViewProps {
  logs: ActivityLog[];
  onTriggerBackup: () => void;
  onTriggerConfigChange: () => void;
  onResetBanners: () => void;
  role: UserRole;
}

export default function LogsView({ 
  logs, 
  onTriggerBackup, 
  onTriggerConfigChange, 
  onResetBanners,
  role 
}: LogsViewProps) {
  
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = logs.filter(log => {
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.ipAddress.includes(searchQuery);
    return matchesType && matchesSearch;
  });

  const isSuperAdmin = role === 'Super Admin';

  return (
    <div className="space-y-6">
      
      {/* Top Controls Grid for administrative simulated actions */}
      <div className="bg-[#111827] p-6 rounded-2xl border border-[#1f2937] shadow-xl">
        <div className="pb-3 border-b border-[#1f2937] mb-4">
          <h3 className="text-sm font-sans font-bold text-white">Administrative System Diagnostics</h3>
          <p className="text-[11px] text-gray-500 font-mono">Simulate operations mapped to the automatic MySQL audit logger</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1: System Backup */}
          <div className="p-4 bg-[#0a0a0b] border border-[#1f2937] rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            {!isSuperAdmin && (
              <div className="absolute inset-0 bg-[#0a0a0b]/85 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-3 text-center">
                <LockKeyhole className="w-4 h-4 text-gray-500 mb-1" />
                <span className="text-[10px] font-mono font-bold text-gray-400">Requires Super Admin</span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Database className="w-4 h-4 text-blue-500" />
                <h4 className="text-xs font-bold text-white">Database Cold Backup</h4>
              </div>
              <p className="text-[11px] text-gray-400 leading-normal">
                Dumps all active schemas, including users, operations, and logs into a secure SQL binary artifact.
              </p>
            </div>
            <button
              onClick={onTriggerBackup}
              disabled={!isSuperAdmin}
              className="w-full mt-3 py-1.5 bg-[#111827] hover:bg-zinc-800 text-gray-300 font-mono text-[10px] uppercase font-bold rounded-lg border border-[#1f2937] transition-all disabled:opacity-40 cursor-pointer"
            >
              Execute Mysqldump Sync
            </button>
          </div>

          {/* Action 2: Update Config */}
          <div className="p-4 bg-[#0a0a0b] border border-[#1f2937] rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            {!isSuperAdmin && (
              <div className="absolute inset-0 bg-[#0a0a0b]/85 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-3 text-center">
                <LockKeyhole className="w-4 h-4 text-gray-500 mb-1" />
                <span className="text-[10px] font-mono font-bold text-gray-400">Requires Super Admin</span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldAlert className="w-4 h-4 text-blue-500" />
                <h4 className="text-xs font-bold text-white">Update Middleware Config</h4>
              </div>
              <p className="text-[11px] text-gray-400 leading-normal">
                Modifies CORS/Session timeout values globally and enforces fresh crypt keys to avoid spoof attacks.
              </p>
            </div>
            <button
              onClick={onTriggerConfigChange}
              disabled={!isSuperAdmin}
              className="w-full mt-3 py-1.5 bg-[#111827] hover:bg-zinc-800 text-gray-300 font-mono text-[10px] uppercase font-bold rounded-lg border border-[#1f2937] transition-all disabled:opacity-40 cursor-pointer"
            >
              Push Config Changes
            </button>
          </div>

          {/* Action 3: Rest Banners */}
          <div className="p-4 bg-[#0a0a0b] border border-[#1f2937] rounded-xl flex flex-col justify-between min-h-[140px]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <h4 className="text-xs font-bold text-white">Flush Validation Banners</h4>
              </div>
              <p className="text-[11px] text-gray-400 leading-normal">
                Re-enables dismissed dynamic alerts and validation notifications on the primary executive dashboard.
              </p>
            </div>
            <button
              onClick={onResetBanners}
              className="w-full mt-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-[10px] uppercase font-bold rounded-lg transition-all cursor-pointer"
            >
              Reset Alert Context
            </button>
          </div>
        </div>
      </div>

      {/* Main Activity Log Grid */}
      <div className="bg-[#111827] p-6 rounded-2xl border border-[#1f2937] shadow-xl space-y-4">
        
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1f2937] gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="text-sm font-sans font-bold text-white">Activity Logs Pipeline</h3>
              <p className="text-[11px] text-gray-500 font-mono font-medium">Automatic system-audit recording trail</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search within logs */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs index..."
                className="text-xs pl-8 pr-3 py-1.5 bg-[#0a0a0b] text-white border border-[#1f2937] rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all w-44"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs px-2 py-1.5 bg-[#0a0a0b] text-gray-300 border border-[#1f2937] rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="Security">Security</option>
              <option value="Operation">Operations</option>
              <option value="System">System Config</option>
              <option value="Backup">Backups</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0a0a0b]/60 border-y border-[#1f2937] text-gray-400 font-mono text-[10px]">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Event ID</th>
                <th className="p-3">Audit Log Type</th>
                <th className="p-3">User context</th>
                <th className="p-3">Clearance</th>
                <th className="p-3">Action logged</th>
                <th className="p-3 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937] font-mono text-[11px] text-gray-400">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 whitespace-nowrap text-gray-500 text-[10px]">
                    {new Date(log.timestamp).toLocaleString([], { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit' 
                    })}
                  </td>
                  <td className="p-3 text-gray-500">UUID-{log.id.substring(0, 5)}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      log.type === 'Security' ? 'bg-red-950/40 text-red-400 border border-red-900/50' :
                      log.type === 'Backup' ? 'bg-blue-950/40 text-blue-400 border border-blue-900/50' :
                      log.type === 'System' ? 'bg-purple-950/40 text-purple-400 border border-purple-900/50' :
                      'bg-[#0a0a0b] text-gray-400 border border-[#1f2937]'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="p-3 font-sans font-semibold text-gray-200">{log.username}</td>
                  <td className="p-3 text-gray-500 font-sans">{log.role.split(' ')[0]}</td>
                  <td className="p-3 text-xs font-sans text-white max-w-sm leading-relaxed">{log.action}</td>
                  <td className="p-3 text-right text-gray-500 text-[10px]">{log.ipAddress}</td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 font-mono text-xs">
                    No log events found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
