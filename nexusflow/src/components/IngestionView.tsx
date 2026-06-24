import React, { useState } from 'react';
import { UserRole, OperationalTask } from '../types';
import { 
  Database, 
  Search, 
  Filter, 
  Trash2, 
  ArrowRight, 
  AlertCircle,
  PlusCircle,
  RefreshCw,
  SlidersHorizontal,
  XCircle,
  Lock,
  LockKeyhole
} from 'lucide-react';

interface IngestionViewProps {
  tasks: OperationalTask[];
  onAddTask: (task: Omit<OperationalTask, 'id' | 'timestamp' | 'lastUpdated'>) => void;
  onUpdateStatus: (id: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => void;
  onDeleteTask: (id: string) => void;
  role: UserRole;
}

export default function IngestionView({ 
  tasks, 
  onAddTask, 
  onUpdateStatus, 
  onDeleteTask,
  role 
}: IngestionViewProps) {
  
  // Ingestion Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Infrastructure' | 'Security' | 'Logistics' | 'Operations' | 'Finance'>('Operations');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Submit Handler with client-side robust validations
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    // Enforce role permission in client logic too
    if (role === 'End User / Client') {
      setFormError('Clearance violation: Your Client role has read-only access.');
      return;
    }

    if (!title.trim() || title.length < 3) {
      setFormError('Validation Failure: Title / Parameter name must be at least 3 characters.');
      return;
    }

    if (!category) {
      setFormError('Validation Failure: Please select a valid target database category.');
      return;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue < 0) {
      setFormError('Validation Failure: Value must be a positive decimal count.');
      return;
    }

    // Call state update
    onAddTask({
      title: title.trim(),
      category,
      priority,
      value: numericValue,
      description: description.trim(),
      status: 'Pending',
      operator: 'Simulated User Session'
    });

    // Reset Form
    setTitle('');
    setValue('');
    setDescription('');
    setSuccessMsg('Record successfully validated and committed to MySQL memory buffer!');
    
    // Auto clear success message after 4s
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Filter Tasks based on Composite Inputs
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('all');
    setFilterStatus('all');
    setFilterPriority('all');
  };

  const isClient = role === 'End User / Client';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Module 1: Complex Multi-field Data Ingestion Form */}
        <div className="bg-[#111827] p-6 rounded-2xl border border-[#1f2937] shadow-xl relative overflow-hidden">
          {isClient && (
            <div className="absolute inset-0 bg-[#0a0a0b]/85 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 bg-[#111827] rounded-full flex items-center justify-center text-white shadow-lg mb-3 border border-[#1f2937]">
                <LockKeyhole className="w-5 h-5 text-blue-500" />
              </div>
              <h4 className="text-sm font-sans font-bold text-white">Ingestion Blocked</h4>
              <p className="text-[11px] text-gray-400 max-w-xs mt-1 leading-relaxed">
                Auth state requires a minimum of <span className="font-mono font-semibold text-blue-400">Manager / Operator</span> role parameters.
              </p>
              <p className="text-[10px] text-gray-500 font-mono mt-3">
                @NexusFlowLoginRequired(allowed_roles=['super_admin', 'manager'])
              </p>
            </div>
          )}

          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#1f2937]">
            <PlusCircle className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="text-sm font-sans font-bold text-white">Ingestion Desk</h3>
              <p className="text-[11px] text-gray-500 font-mono">Parser for raw enterprise metrics</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block">
                Parameter / Title
              </label>
              <input
                type="text"
                disabled={isClient}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Core Network Socket Buffer"
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-[#0a0a0b] text-white transition-all disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block">
                  Category
                </label>
                <select
                  disabled={isClient}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-[#0a0a0b] text-white transition-all"
                >
                  <option value="Operations">Operations</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Security">Security</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block">
                  Priority
                </label>
                <select
                  disabled={isClient}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-[#0a0a0b] text-white transition-all"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block">
                Metric Target Value ($ / Throughput)
              </label>
              <input
                type="number"
                step="0.01"
                disabled={isClient}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 1500.25"
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-[#0a0a0b] text-white transition-all disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block">
                Details / Description
              </label>
              <textarea
                disabled={isClient}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specify precise context or technical logs..."
                rows={3}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-[#0a0a0b] text-white transition-all disabled:opacity-50 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isClient}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold tracking-wide shadow-lg shadow-blue-600/10 transition-all cursor-pointer"
            >
              Commit to Relational Store
            </button>
          </form>
        </div>

        {/* Module 2: Advanced Search Filter and Workflow Pipeline list */}
        <div className="bg-[#111827] p-6 rounded-2xl border border-[#1f2937] shadow-xl lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1f2937] gap-2">
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="text-sm font-sans font-bold text-white">Task Workflow Pipeline</h3>
                <p className="text-[11px] text-gray-500 font-mono">Managing system record execution cycles</p>
              </div>
            </div>
            
            <div className="text-[10px] font-mono text-gray-500">
              Query latency: <span className="text-emerald-400 font-bold font-mono">0.03s</span> (INDEXED SEARCH)
            </div>
          </div>

          {/* Search and Composite filter section */}
          <div className="bg-[#0a0a0b] p-4 rounded-xl border border-[#1f2937] space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search parameter index or details..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-[#111827] text-white rounded-lg border border-[#1f2937] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] font-mono font-bold text-gray-500 block mb-1 uppercase">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full text-[11px] px-2 py-1.5 bg-[#111827] text-gray-300 border border-[#1f2937] rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Operations">Operations</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Security">Security</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-mono font-bold text-gray-500 block mb-1 uppercase">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full text-[11px] px-2 py-1.5 bg-[#111827] text-gray-300 border border-[#1f2937] rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-mono font-bold text-gray-500 block mb-1 uppercase">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full text-[11px] px-2 py-1.5 bg-[#111827] text-gray-300 border border-[#1f2937] rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {(searchQuery || filterCategory !== 'all' || filterStatus !== 'all' || filterPriority !== 'all') && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={clearFilters}
                  className="text-[10px] font-mono text-gray-400 hover:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Clear Query Filters
                </button>
              </div>
            )}
          </div>

          {/* Workflow Task Grid list */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {filteredTasks.map((task) => (
              <div 
                key={task.id} 
                className="p-4 bg-[#0a0a0b] hover:bg-white/5 rounded-xl border border-[#1f2937] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-gray-500">#{task.id}</span>
                    <span className="px-2 py-0.5 bg-[#111827] text-gray-300 border border-[#1f2937] rounded text-[9px] font-mono">
                      {task.category}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${
                      task.priority === 'Critical' ? 'bg-red-950/40 text-red-400 border border-red-900/50' :
                      task.priority === 'High' ? 'bg-orange-950/40 text-orange-400 border border-orange-900/50' :
                      task.priority === 'Medium' ? 'bg-blue-950/40 text-blue-400 border border-blue-900/50' :
                      'bg-[#111827] text-gray-400 border border-[#1f2937]'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <h4 className="text-xs font-sans font-bold text-white">{task.title}</h4>
                  <p className="text-[11px] text-gray-400 line-clamp-2">{task.description}</p>
                  
                  <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono pt-1">
                    <span>Val: <strong className="text-gray-300">${task.value.toFixed(2)}</strong></span>
                    <span>Operator: {task.operator}</span>
                    <span>Commit: {new Date(task.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Workflow pipeline actions (Status changes) */}
                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 bg-[#111827] p-1 rounded-lg border border-[#1f2937]">
                    <button
                      disabled={isClient}
                      onClick={() => onUpdateStatus(task.id, 'Pending')}
                      className={`px-2 py-1 text-[10px] font-mono rounded cursor-pointer transition-all ${
                        task.status === 'Pending' 
                          ? 'bg-amber-950/40 text-amber-400 border border-amber-900/50 font-bold scale-[1.02]' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      disabled={isClient}
                      onClick={() => onUpdateStatus(task.id, 'In Progress')}
                      className={`px-2 py-1 text-[10px] font-mono rounded cursor-pointer transition-all ${
                        task.status === 'In Progress' 
                          ? 'bg-blue-950/40 text-blue-400 border border-blue-900/50 font-bold scale-[1.02]' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      disabled={isClient}
                      onClick={() => onUpdateStatus(task.id, 'Completed')}
                      className={`px-2 py-1 text-[10px] font-mono rounded cursor-pointer transition-all ${
                        task.status === 'Completed' 
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 font-bold scale-[1.02]' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      Done
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-500 font-mono">
                      State: <strong className="text-gray-300 uppercase">{task.status}</strong>
                    </span>
                    {role === 'Super Admin' && (
                      <button 
                        onClick={() => onDeleteTask(task.id)}
                        className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                        title="Delete Operational Record (Super Admin only)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredTasks.length === 0 && (
              <div className="text-center py-12 bg-[#0a0a0b] rounded-xl border border-dashed border-[#1f2937]">
                <XCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-xs font-mono text-gray-500">No active parameters match your search composite filters.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
