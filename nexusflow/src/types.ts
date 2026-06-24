export type UserRole = 'Super Admin' | 'Manager / Operator' | 'End User / Client';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  dateJoined: string;
}

export interface OperationalTask {
  id: string;
  title: string;
  category: 'Infrastructure' | 'Security' | 'Logistics' | 'Operations' | 'Finance';
  status: 'Pending' | 'In Progress' | 'Completed';
  operator: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  value: number; // Quantitative metric value for chart analysis
  timestamp: string;
  lastUpdated: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  role: UserRole;
  action: string;
  type: 'Security' | 'Operation' | 'System' | 'Backup' | 'Configuration';
  timestamp: string;
  ipAddress: string;
}

export interface NotificationAlert {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
  read: boolean;
}
