import React, { useState } from 'react';
import { UserRole, OperationalTask, NotificationAlert } from '../types';
import { 
  TrendingUp, 
  Database, 
  Clock, 
  Download, 
  ChevronRight, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  FileSpreadsheet,
  Gauge,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardViewProps {
  tasks: OperationalTask[];
  alerts: NotificationAlert[];
  dismissAlert: (id: string) => void;
  role: UserRole;
  onExportCSV: () => void;
  onNavigateToIngestion: () => void;
}

export default function DashboardView({ 
  tasks, 
  alerts, 
  dismissAlert, 
  role, 
  onExportCSV,
  onNavigateToIngestion
}: DashboardViewProps) {
  
  const [selectedMetric, setSelectedMetric] = useState<'value' | 'count'>('value');

  // Compute actual metrics from tasks state
  const totalValue = tasks.reduce((sum, task) => sum + task.value, 0);
  const taskCount = tasks.length;
  const avgValue = taskCount > 0 ? totalValue / taskCount : 0;
  
  // High Priority or Critical task ratio
  const highPriorityTasks = tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;

  // Group by Category
  const categories: Record<string, { count: number; total: number }> = {};
  tasks.forEach(t => {
    if (!categories[t.category]) {
      categories[t.category] = { count: 0, total: 0 };
    }
    categories[t.category].count += 1;
    categories[t.category].total += t.value;
  });

  const categoryArray = Object.keys(categories).map(cat => ({
    name: cat,
    count: categories[cat].count,
    total: categories[cat].total,
    percentage: totalValue > 0 ? (categories[cat].total / totalValue) * 100 : 0
  })).sort((a, b) => b.total - a.total);

  // Group by Status
  const statusCounts = {
    'Pending': tasks.filter(t => t.status === 'Pending').length,
    'In Progress': tasks.filter(t => t.status === 'In Progress').length,
    'Completed': tasks.filter(t => t.status === 'Completed').length,
  };

  // Generate mock historical coordinates for custom SVG Trendline Chart based on task values
  const maxVal = Math.max(...tasks.map(t => t.value), 100);
  const chartPoints = tasks.slice(-8).map((task, idx) => {
    const x = 50 + idx * 90;
    // Map value to y coordinate (height 160, padding 20)
    const y = 150 - (task.value / maxVal) * 110;
    return { x, y, title: task.title, value: task.value, date: new Date(task.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  });

  // SVG Line path construction
  const linePath = chartPoints.length > 0 
    ? `M ${chartPoints.map(p => `${p.x} ${p.y}`).join(' L ')}` 
    : '';

  const areaPath = chartPoints.length > 0 
    ? `${linePath} L ${chartPoints[chartPoints.length - 1].x} 160 L ${chartPoints[0].x} 160 Z`
    : '';

  return (
    <div className="space-y-6">
      {/* Top Banner Alert System Context */}
      <AnimatePresence>
        {alerts.filter(a => !a.read).length > 0 && (
          <div className="space-y-2">
            {alerts.filter(a => !a.read).map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-4 rounded-xl border flex items-start gap-3 shadow-lg ${
                  alert.type === 'error' ? 'bg-red-950/20 text-red-400 border-red-900/35' :
                  alert.type === 'warning' ? 'bg-amber-950/20 text-amber-400 border-amber-900/35' :
                  alert.type === 'success' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/35' :
                  'bg-blue-950/20 text-blue-400 border-blue-900/35'
                }`}
              >
                <div className="mt-0.5">
                  {alert.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                  {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  {alert.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {alert.type === 'info' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-mono font-semibold uppercase tracking-wider mb-0.5">
                    System Alert &bull; {alert.type}
                  </p>
                  <p className="text-xs font-medium leading-relaxed">{alert.message}</p>
                </div>
                <button 
                  onClick={() => dismissAlert(alert.id)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5 opacity-60 hover:opacity-100 text-white" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Dashboard Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] p-6 rounded-2xl border border-[#1f2937] shadow-xl">
        <div>
          <h2 className="text-2xl font-sans font-bold tracking-tight text-white">NexusFlow Analytical Desk</h2>
          <p className="text-xs text-gray-500 font-mono mt-1">
            EXECUTIVE CONTROL SCREEN &bull; PRIVILEGE LEVEL: {role.toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {role !== 'End User / Client' ? (
            <button
              onClick={onExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0b] hover:bg-zinc-800 text-gray-300 border border-[#1f2937] rounded-xl text-xs font-mono font-medium transition-all duration-200 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              Export Flat Ledger (CSV)
            </button>
          ) : (
            <div className="text-[10px] text-gray-500 border border-[#1f2937] rounded-xl px-3 py-1.5 bg-[#0a0a0b] font-mono">
              Export is locked under Client role
            </div>
          )}
          {role !== 'End User / Client' && (
            <button
              onClick={onNavigateToIngestion}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all duration-200 shadow-lg shadow-blue-600/10"
            >
              Ingest Record
            </button>
          )}
        </div>
      </div>

      {/* Numerical Metrics Summary Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric Card 1: Total Value */}
        <div className="bg-[#111827] p-5 rounded-2xl border border-[#1f2937] shadow-lg flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-widest block">
              Total Analytical Throughput
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-sans font-extrabold text-white">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-900/50 px-1.5 py-0.5 rounded">
                +14.2%
              </span>
            </div>
            <span className="text-[10px] text-gray-500 block font-mono">
              Sum value of operational metrics
            </span>
          </div>
          <div className="w-12 h-12 bg-blue-950/40 text-blue-400 border border-blue-900/40 rounded-xl flex items-center justify-center shadow-inner">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Metric Card 2: Database Record Volume */}
        <div className="bg-[#111827] p-5 rounded-2xl border border-[#1f2937] shadow-lg flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-widest block">
              Operational Task Ledger
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-sans font-extrabold text-white">
                {taskCount}
              </span>
              <span className="text-xs text-gray-500 font-mono">records</span>
            </div>
            <span className="text-[10px] text-gray-500 block font-mono">
              {pendingTasks} pending validation states
            </span>
          </div>
          <div className="w-12 h-12 bg-blue-950/40 text-blue-400 border border-blue-900/40 rounded-xl flex items-center justify-center shadow-inner">
            <Database className="w-5 h-5" />
          </div>
        </div>

        {/* Metric Card 3: Performance Latency Target */}
        <div className="bg-[#111827] p-5 rounded-2xl border border-[#1f2937] shadow-lg flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-widest block">
              Average Latency Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-sans font-extrabold text-white">
                {avgValue > 0 ? (avgValue / 100).toFixed(2) : '1.14'}s
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-900/50 px-1.5 py-0.5 rounded">
                Strict Limit
              </span>
            </div>
            <span className="text-[10px] text-gray-500 block font-mono">
              Average metric score calculation
            </span>
          </div>
          <div className="w-12 h-12 bg-blue-950/40 text-blue-400 border border-blue-900/40 rounded-xl flex items-center justify-center shadow-inner">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Analytical Trend Chart & Category Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Visualization Card */}
        <div className="bg-[#111827] p-6 rounded-2xl border border-[#1f2937] shadow-xl lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-sans font-bold text-white">Real-Time Metric Aggregates</h3>
                <p className="text-[11px] text-gray-500 font-mono">Feed pipeline mapping MySQL transaction logs</p>
              </div>
              <div className="flex items-center bg-[#0a0a0b] rounded-lg p-0.5 border border-[#1f2937]">
                <button
                  onClick={() => setSelectedMetric('value')}
                  className={`px-3 py-1 text-[10px] font-mono rounded-md transition-all ${
                    selectedMetric === 'value' ? 'bg-blue-600 text-white shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  VALUE TREND
                </button>
                <button
                  onClick={() => setSelectedMetric('count')}
                  className={`px-3 py-1 text-[10px] font-mono rounded-md transition-all ${
                    selectedMetric === 'count' ? 'bg-blue-600 text-white shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  VOLUME COUNT
                </button>
              </div>
            </div>

            {/* Custom SVG Responsive Line/Area Chart */}
            <div className="h-56 bg-[#0a0a0b] rounded-xl border border-[#1f2937] p-4 relative flex flex-col justify-between overflow-hidden">
              {chartPoints.length > 0 ? (
                <div className="relative w-full h-full">
                  <svg className="w-full h-full" viewBox="0 0 750 180" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal gridlines */}
                    <line x1="50" y1="40" x2="700" y2="40" stroke="#1f2937" strokeDasharray="4 4" strokeWidth="1" />
                    <line x1="50" y1="95" x2="700" y2="95" stroke="#1f2937" strokeDasharray="4 4" strokeWidth="1" />
                    <line x1="50" y1="150" x2="700" y2="150" stroke="#1f2937" strokeDasharray="4 4" strokeWidth="1" />

                    {/* Area under curve */}
                    <path d={areaPath} fill="url(#chartGrad)" />

                    {/* Primary Curve */}
                    <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Interaction Points */}
                    {chartPoints.map((point, index) => (
                      <g key={index} className="group/dot cursor-pointer">
                        <circle cx={point.x} cy={point.y} r="5" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                        <circle cx={point.x} cy={point.y} r="10" fill="#2563eb" fillOpacity="0" className="hover:fill-opacity-10 transition-all duration-150" />
                        
                        {/* Interactive tooltip shown on hover */}
                        <foreignObject x={point.x - 55} y={point.y - 45} width="110" height="40" className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                          <div className="bg-[#111827] text-white text-[9px] font-mono p-1 rounded border border-[#1f2937] shadow-md text-center">
                            <p className="truncate font-semibold text-gray-200">{point.title}</p>
                            <p className="text-blue-400">${point.value.toFixed(1)}</p>
                          </div>
                        </foreignObject>
                      </g>
                    ))}
                  </svg>

                  {/* X Axis Labels */}
                  <div className="flex justify-between px-10 pt-2 border-t border-[#1f2937]">
                    {chartPoints.map((point, index) => (
                      <span key={index} className="text-[9px] font-mono text-gray-500 text-center w-14 truncate">
                        {point.date}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-mono text-gray-500">Loading dynamic live visual telemetry...</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-gray-500 border-t border-[#1f2937] pt-3 mt-4">
            <span>TRANSACTION REPLICATION: NORMAL</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              AUTO-SYNC TO MYSQL ACTIVE
            </span>
          </div>
        </div>

        {/* Categories Breakdown Allocation Card */}
        <div className="bg-[#111827] p-6 rounded-2xl border border-[#1f2937] shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-sans font-bold text-white mb-1">Data Category Allocation</h3>
            <p className="text-[11px] text-gray-500 font-mono mb-4">Volume distribution by operational tags</p>

            <div className="space-y-4">
              {categoryArray.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-200">{cat.name}</span>
                    <span className="font-mono text-gray-500 text-[10px]">
                      {cat.count} items &bull; ${cat.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-[#0a0a0b] h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full" 
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}

              {categoryArray.length === 0 && (
                <p className="text-xs font-mono text-gray-500 text-center py-10">No ingestion operations loaded yet.</p>
              )}
            </div>
          </div>

          <div className="bg-[#0a0a0b] p-3 rounded-xl border border-[#1f2937] mt-6">
            <h4 className="text-[11px] font-sans font-bold text-white mb-0.5">Role Workflow Access Checklist</h4>
            <div className="grid grid-cols-3 gap-2 mt-2 text-[9px] font-mono">
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-500">SUPER ADMIN</span>
                <span className="text-emerald-400 font-bold">UNRESTRICTED</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-500">MANAGER</span>
                <span className="text-emerald-400 font-bold">UNRESTRICTED</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-500">CLIENT</span>
                <span className="text-rose-400 font-bold">READ ONLY</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Reporting Data Grid (Recent operations) */}
      <div className="bg-[#111827] p-6 rounded-2xl border border-[#1f2937] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="text-sm font-sans font-bold text-white">Dynamic Reporting Grid</h3>
            <p className="text-[11px] text-gray-500 font-mono">Real-time raw metrics replication buffer</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span className="text-gray-500">Status distribution:</span>
            <span className="px-1.5 py-0.5 bg-amber-950/40 text-amber-400 rounded border border-amber-900/50">{statusCounts.Pending} Pending</span>
            <span className="px-1.5 py-0.5 bg-blue-950/40 text-blue-400 rounded border border-blue-900/50">{statusCounts['In Progress']} In-Progress</span>
            <span className="px-1.5 py-0.5 bg-emerald-950/40 text-emerald-400 rounded border border-emerald-900/50">{statusCounts.Completed} Completed</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0a0a0b]/60 border-y border-[#1f2937] text-gray-400 font-mono text-[10px]">
              <tr>
                <th className="p-3">Record ID</th>
                <th className="p-3">Title / Parameter</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3">Priority</th>
                <th className="p-3 text-right">Metric Value</th>
                <th className="p-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {tasks.slice(0, 5).map((task) => (
                <tr key={task.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-mono text-gray-500 text-[11px]">#{task.id}</td>
                  <td className="p-3">
                    <div className="font-semibold text-white">{task.title}</div>
                    <div className="text-[10px] text-gray-500 truncate max-w-xs">{task.description}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-[#0a0a0b] text-gray-300 border border-[#1f2937] rounded text-[10px] font-mono">
                      {task.category}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      task.status === 'Completed' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50' :
                      task.status === 'In Progress' ? 'bg-blue-950/40 text-blue-400 border border-blue-900/50' :
                      'bg-amber-950/40 text-amber-400 border border-amber-900/50'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                      task.priority === 'Critical' ? 'bg-red-950/40 text-red-400 border border-red-900/50' :
                      task.priority === 'High' ? 'bg-orange-950/40 text-orange-400 border border-orange-900/50' :
                      task.priority === 'Medium' ? 'bg-blue-950/40 text-blue-400 border border-blue-900/50' :
                      'bg-[#0a0a0b] text-gray-400 border border-[#1f2937]'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-semibold text-white">
                    ${task.value.toFixed(2)}
                  </td>
                  <td className="p-3 text-right text-gray-500 font-mono text-[10px]">
                    {new Date(task.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </tr>
              ))}

              {tasks.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 font-mono text-xs">
                    No records loaded. Use Ingestion Hub to populate operations.
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
