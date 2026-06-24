import React, { useState, useEffect } from 'react';
import { UserRole, OperationalTask, ActivityLog, NotificationAlert } from './types';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import IngestionView from './components/IngestionView';
import LogsView from './components/LogsView';
import DjangoExplorer from './components/DjangoExplorer';
import { 
  Lock, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2,
  LockKeyhole
} from 'lucide-react';

// Pre-seeded authentic operational records
const INITIAL_TASKS: OperationalTask[] = [
  {
    id: 'TSK-1092',
    title: 'Core WAN Routing Uplink',
    category: 'Infrastructure',
    status: 'Completed',
    operator: 'Super Admin',
    priority: 'Critical',
    description: 'Upgraded physical trunk fibers to double redundant paths. Resolved visual latency bottlenecks on ASIA-PACIFIC routes.',
    value: 12500.00,
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 24h ago
    lastUpdated: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'TSK-1093',
    title: 'CORS Security Session Key Rotate',
    category: 'Security',
    status: 'Completed',
    operator: 'Super Admin',
    priority: 'Critical',
    description: 'Pushed PBKDF2 cryptography SHA256 updates across django.contrib.sessions backend keys.',
    value: 4500.00,
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), // 18h ago
    lastUpdated: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'TSK-1094',
    title: 'Optimize MySQL Core Schema Indexes',
    category: 'Operations',
    status: 'In Progress',
    operator: 'Manager / Operator',
    priority: 'Medium',
    description: 'Applying compound keys index on fields (category, status, priority) on nexusflow_operations. Prevents page load latency from exceeding NFR 1.5s.',
    value: 850.00,
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), // 8h ago
    lastUpdated: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'TSK-1095',
    title: 'Warehouse Automated Routing Logistics',
    category: 'Logistics',
    status: 'Pending',
    operator: 'Manager / Operator',
    priority: 'Low',
    description: 'Parsing dispatch orders and tracking operations across regional fulfillment hubs.',
    value: 3100.00,
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), // 4h ago
    lastUpdated: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'TSK-1096',
    title: 'Q3 Financial Ledgers Audit',
    category: 'Finance',
    status: 'Pending',
    operator: 'Manager / Operator',
    priority: 'High',
    description: 'Summarizing operations throughput, composite task values, and compiling dynamic ledger aggregates.',
    value: 24500.00,
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), // 1h ago
    lastUpdated: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];

// Pre-seeded automatic audit logging trail records
const INITIAL_LOGS: ActivityLog[] = [
  {
    id: '8a2b1',
    userId: 'USR-001',
    username: 'admin@nexusflow.com',
    role: 'Super Admin',
    action: 'Database system integrity checks passed on 3306 MySQL database ports.',
    type: 'System',
    timestamp: new Date(Date.now() - 3600000 * 25).toISOString(),
    ipAddress: '10.0.12.11'
  },
  {
    id: '8a2b2',
    userId: 'USR-001',
    username: 'admin@nexusflow.com',
    role: 'Super Admin',
    action: 'Cold system physical storage backups synchronized with redundant cloud drives.',
    type: 'Backup',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    ipAddress: '10.0.12.11'
  },
  {
    id: '8a2b3',
    userId: 'USR-001',
    username: 'admin@nexusflow.com',
    role: 'Super Admin',
    action: 'Created Data Ingestion Operation: TSK-1092 WAN Uplink Upgrade.',
    type: 'Operation',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    ipAddress: '10.0.12.11'
  },
  {
    id: '8a2b4',
    userId: 'USR-001',
    username: 'admin@nexusflow.com',
    role: 'Super Admin',
    action: 'Rotated server cryptography session keys under Django security middleware protocol.',
    type: 'Security',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    ipAddress: '10.0.12.11'
  },
  {
    id: '8a2b5',
    userId: 'USR-002',
    username: 'operator@nexusflow.com',
    role: 'Manager / Operator',
    action: 'Changed task status to In Progress for Operational Record: TSK-1094',
    type: 'Operation',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    ipAddress: '10.0.12.15'
  }
];

// Pre-seeded dynamic alerts context
const INITIAL_ALERTS: NotificationAlert[] = [
  {
    id: 'ALT-1',
    type: 'warning',
    message: 'Crypt Key Audit: fresh security hash rounds are recommended across django.contrib.sessions cookies.',
    timestamp: new Date().toISOString(),
    read: false
  },
  {
    id: 'ALT-2',
    type: 'success',
    message: 'Operational replication live. Connection bound to MySQL instance on port 3306.',
    timestamp: new Date().toISOString(),
    read: false
  }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  
  // Auth state
  const [loginEmail, setLoginEmail] = useState<string>('admin@nexusflow.com');
  const [loginPassword, setLoginPassword] = useState<string>('password');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Core application structures state
  const [tasks, setTasks] = useState<OperationalTask[]>(INITIAL_TASKS);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);
  const [alerts, setAlerts] = useState<NotificationAlert[]>(INITIAL_ALERTS);

  // Current session user properties
  const [currentUser, setCurrentUser] = useState<{ username: string; email: string; role: UserRole }>({
    username: 'Administrator',
    email: 'admin@nexusflow.com',
    role: 'Super Admin'
  });

  // Automatically enforce redirect or switch restrictions when roles update
  useEffect(() => {
    // If Client role is chosen, and current active tab requires higher clearance (Logs view),
    // kick them back to Dashboard with standard NexusFlowLoginRequired alert feedback!
    if (currentUser.role === 'End User / Client' && (currentTab === 'logs')) {
      setCurrentTab('dashboard');
      addSystemLog('Session security supervisor redirected Client back to home. Action: restricted path hit.', 'Security');
      addNotification('warning', 'NexusFlowLoginRequired: Access to the Security Audit logs page requires Manager or Super Admin role credentials.');
    }
  }, [currentUser.role, currentTab]);

  // Auth processing controller
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    let assignedRole: UserRole | null = null;
    let assignedUsername = '';

    // Simulate database lookup and cryptographic PBKDF2 evaluation
    if (loginEmail === 'admin@nexusflow.com' && loginPassword === 'password') {
      assignedRole = 'Super Admin';
      assignedUsername = 'Executive Super Admin';
    } else if (loginEmail === 'manager@nexusflow.com' && loginPassword === 'password') {
      assignedRole = 'Manager / Operator';
      assignedUsername = 'Operational Manager';
    } else if (loginEmail === 'client@nexusflow.com' && loginPassword === 'password') {
      assignedRole = 'End User / Client';
      assignedUsername = 'Corporate Partner Client';
    } else {
      setLoginError('Authentication Denied: Invalid secure credentials or expired session cookies.');
      return;
    }

    const matchedUser = {
      username: assignedUsername,
      email: loginEmail,
      role: assignedRole
    };

    setCurrentUser(matchedUser);
    setIsAuthenticated(true);
    
    // Log successful session start
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substring(2, 7),
      userId: loginEmail === 'admin@nexusflow.com' ? 'USR-001' : 'USR-002',
      username: loginEmail,
      role: assignedRole,
      action: `Session Authenticated. Token generated & mapped to Django secure sessions storage framework.`,
      type: 'Security',
      timestamp: new Date().toISOString(),
      ipAddress: '10.0.12.33'
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleLogout = () => {
    // Log termination
    const endLog: ActivityLog = {
      id: Math.random().toString(36).substring(2, 7),
      userId: currentUser.email === 'admin@nexusflow.com' ? 'USR-001' : 'USR-002',
      username: currentUser.email,
      role: currentUser.role,
      action: 'Authenticated session terminated gracefully. Session storage flushed.',
      type: 'Security',
      timestamp: new Date().toISOString(),
      ipAddress: '10.0.12.33'
    };
    setLogs(prev => [endLog, ...prev]);
    setIsAuthenticated(false);
    setLoginPassword('');
    setCurrentTab('dashboard');
  };

  const handleChangeRole = (newRole: UserRole) => {
    let email = 'admin@nexusflow.com';
    let name = 'Executive Super Admin';
    if (newRole === 'Manager / Operator') {
      email = 'manager@nexusflow.com';
      name = 'Operational Manager';
    } else if (newRole === 'End User / Client') {
      email = 'client@nexusflow.com';
      name = 'Corporate Partner Client';
    }

    setCurrentUser({
      username: name,
      email,
      role: newRole
    });

    addSystemLog(`Role switched inside sandbox environment to: ${newRole}`, 'Security');
  };

  // Helper: append real-time log with exact timestamp
  const addSystemLog = (action: string, type: 'Security' | 'Operation' | 'System' | 'Backup') => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substring(2, 7),
      userId: currentUser.email === 'admin@nexusflow.com' ? 'USR-001' : 'USR-002',
      username: currentUser.email,
      role: currentUser.role,
      action,
      type,
      timestamp: new Date().toISOString(),
      ipAddress: '10.0.12.33'
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Helper: add custom alert/notification context
  const addNotification = (type: 'info' | 'success' | 'warning' | 'error', message: string) => {
    const newAlert: NotificationAlert = {
      id: `ALT-${Math.random().toString(36).substring(2, 7)}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  // Ingestion: add task to list
  const handleAddTask = (taskData: Omit<OperationalTask, 'id' | 'timestamp' | 'lastUpdated'>) => {
    const newId = `TSK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTask: OperationalTask = {
      ...taskData,
      id: newId,
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
    addSystemLog(`Committed New Data Ingestion: ${taskData.title} (ID: ${newId})`, 'Operation');
    addNotification('success', `Valid entry received! Record committed to database schema memory layout.`);
  };

  // Workflow status management
  const handleUpdateStatus = (id: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus, lastUpdated: new Date().toISOString() } : t));
    const task = tasks.find(t => t.id === id);
    if (task) {
      addSystemLog(`State update on record ${id}: changed to [${newStatus}]`, 'Operation');
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    addSystemLog(`Purged Operational Record: ${id} directly from table.`, 'Operation');
    addNotification('info', `Record ${id} permanently removed by administrator privileges.`);
  };

  // Admin Tools: Simulated Cold backup
  const handleTriggerBackup = () => {
    addSystemLog('Super Admin initiated mysqldump compression pipelines. Backup status: COMPLETE.', 'Backup');
    addNotification('success', 'Backup Pipeline Resolved: 2.3MB schema footprint successfully synced to cold archive storage.');
  };

  // Admin Tools: Update Config
  const handleTriggerConfigChange = () => {
    addSystemLog('Global network security layer re-encrypted with updated salt seeds.', 'System');
    addNotification('success', 'Security Middleware Config Pushed: cryptographic verification tokens flushed & rotated.');
  };

  // Diagnostic: Reset alert banners
  const handleResetBanners = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: false })));
    addSystemLog('Flushed dynamic warning alerts cache.', 'System');
  };

  // Export CSV Data directly in UI
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Record ID,Title,Category,Status,Priority,Value,Timestamp\n';
    
    tasks.forEach(t => {
      csvContent += `"${t.id}","${t.title}","${t.category}","${t.status}","${t.priority}","${t.value}","${t.timestamp}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'nexusflow_operational_records_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addSystemLog('Exported current active database list in flat CSV file format.', 'System');
    addNotification('info', 'Flat file download pipeline activated. File downloaded: nexusflow_operational_records_export.csv.');
  };

  // Main login page if unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col justify-center items-center p-6 select-none relative overflow-hidden">
        
        {/* Absolute Background Accent Design Elements */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-900/10 -top-40 -left-40 blur-3xl" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-blue-900/5 -bottom-20 -right-20 blur-3xl" />

        <div className="w-full max-w-md bg-[#111827] border border-[#1f2937] rounded-3xl p-8 shadow-2xl relative z-10">
          
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-2xl tracking-wider text-white mx-auto shadow-lg shadow-blue-900/30 mb-4">
              NF
            </div>
            <h1 className="text-2xl font-sans font-bold tracking-tight text-white">NexusFlow Security Gate</h1>
            <p className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-widest">
              Enterprise Management &bull; Q3 2026
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3.5 bg-red-950/20 border border-red-900/35 text-red-400 text-xs rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span className="leading-relaxed">{loginError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                User Session Identity (Email)
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g. administrator@nexusflow.com"
                className="w-full text-xs px-4 py-3 rounded-xl border border-[#1f2937] focus:border-blue-500 bg-[#0a0a0b] text-gray-200 focus:outline-none transition-all placeholder:text-gray-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                Security Passkey (Password)
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password credential"
                className="w-full text-xs px-4 py-3 rounded-xl border border-[#1f2937] focus:border-blue-500 bg-[#0a0a0b] text-gray-200 focus:outline-none transition-all placeholder:text-gray-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold tracking-wider uppercase shadow-md shadow-blue-950 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              Establish Authenticated Connection
            </button>
          </form>

          {/* Quick Sandbox Login assistance overlay */}
          <div className="mt-8 pt-6 border-t border-[#1f2937] space-y-2">
            <h4 className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">
              Assisted Sandbox Accounts
            </h4>
            <div className="grid grid-cols-1 gap-1.5 text-[11px] font-mono text-gray-400">
              <button 
                onClick={() => { setLoginEmail('admin@nexusflow.com'); setLoginPassword('password'); }}
                className="w-full flex items-center justify-between px-3 py-1.5 bg-[#0a0a0b] hover:bg-zinc-800/50 border border-[#1f2937] rounded-lg text-left transition-colors"
              >
                <span>admin@nexusflow.com (Super Admin)</span>
                <span className="text-gray-600">&bull; Pass: password</span>
              </button>
              <button 
                onClick={() => { setLoginEmail('manager@nexusflow.com'); setLoginPassword('password'); }}
                className="w-full flex items-center justify-between px-3 py-1.5 bg-[#0a0a0b] hover:bg-zinc-800/50 border border-[#1f2937] rounded-lg text-left transition-colors"
              >
                <span>manager@nexusflow.com (Manager)</span>
                <span className="text-gray-600">&bull; Pass: password</span>
              </button>
              <button 
                onClick={() => { setLoginEmail('client@nexusflow.com'); setLoginPassword('password'); }}
                className="w-full flex items-center justify-between px-3 py-1.5 bg-[#0a0a0b] hover:bg-zinc-800/50 border border-[#1f2937] rounded-lg text-left transition-colors"
              >
                <span>client@nexusflow.com (Client/End User)</span>
                <span className="text-gray-600">&bull; Pass: password</span>
              </button>
            </div>
          </div>
        </div>

        {/* Outer Credit details */}
        <p className="text-[10px] font-mono text-gray-600 mt-6 tracking-wide">
          NEXUSFLOW GATEWAY CONSOLE V2.4 &bull; SECURE MEMORY ACTIVE
        </p>
      </div>
    );
  }

  // Authenticated Workspace Page Layout
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e5e7eb] flex font-sans overflow-hidden">
      
      {/* Sidebar - Handles tabs, role switching and logout actions */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        currentUser={currentUser} 
        onLogout={handleLogout}
        onChangeRole={handleChangeRole}
      />

      {/* Main Content Workspace Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Core Header Navigation line */}
        <header className="bg-[#0f1115] border-b border-[#1f2937] px-8 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-gray-500">SESSION TARGET:</span>
            <span className="text-xs font-mono text-gray-300 bg-[#111827] border border-[#1f2937] rounded px-2 py-0.5">
              DATABASE: MYSQL@3306
            </span>
            <span className="text-xs font-mono text-gray-300 bg-[#111827] border border-[#1f2937] rounded px-2 py-0.5">
              HOST: CLOUD_RUN
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-gray-500">RBAC Clearance:</span>
            <span className="px-2.5 py-0.5 bg-blue-600/10 text-blue-400 rounded-full border border-blue-500/20 font-bold">
              {currentUser.role}
            </span>
          </div>
        </header>

        {/* Content View Routing based on Tab */}
        <div className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView 
              tasks={tasks}
              alerts={alerts}
              dismissAlert={dismissAlert}
              role={currentUser.role}
              onExportCSV={handleExportCSV}
              onNavigateToIngestion={() => setCurrentTab('ingestion')}
            />
          )}

          {currentTab === 'ingestion' && (
            <IngestionView 
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateStatus={handleUpdateStatus}
              onDeleteTask={handleDeleteTask}
              role={currentUser.role}
            />
          )}

          {currentTab === 'logs' && (
            <LogsView 
              logs={logs}
              onTriggerBackup={handleTriggerBackup}
              onTriggerConfigChange={handleTriggerConfigChange}
              onResetBanners={handleResetBanners}
              role={currentUser.role}
            />
          )}

          {currentTab === 'blueprints' && (
            <DjangoExplorer />
          )}
        </div>

        {/* Bottom Status Footer */}
        <footer className="h-10 bg-[#0f1115] border-t border-[#1f2937] flex items-center justify-between px-8 text-[10px] font-mono text-gray-500 shrink-0 select-none">
          <div className="flex gap-4">
            <span>SYSTEM: <span className="text-emerald-500 font-bold">STABLE</span></span>
            <span>RELEASE: v1.0.4-Q3-2026</span>
          </div>
          <div className="flex gap-4">
            <span>DB: <span className="text-blue-400">MySQL Cluster 8.0</span></span>
            <span>SECURITY: AES-256-GCM</span>
            <span className="text-blue-400 animate-pulse font-bold">NEXUSFLOW ENGINE RUNNING</span>
          </div>
        </footer>
      </main>

    </div>
  );
}
