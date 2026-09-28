// Dedicated Audit Log Service for Navin Homeo Care & Research Center Admin
// Conforms to Section 14 (Audit Log) requirement:
// Logs: Login, Product Created, Product Edited, Stock Changed, Order Status Changed, Appointment Status Changed, Settings Changed
// Stores: Action, Timestamp, Admin Account

export interface AuditLogEntry {
  id: string;
  action: string;
  details?: string;
  timestamp: string;
  adminAccount: string;
}

const AUDIT_LOG_STORAGE_KEY = 'nhc_audit_logs_v1';

export const auditLogService = {
  getLogs(): AuditLogEntry[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  log(action: string, details?: string, adminAccount: string = 'navin@navinhomeocare.com'): void {
    if (typeof window === 'undefined') return;
    try {
      const logs = this.getLogs();
      const newEntry: AuditLogEntry = {
        id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        action,
        details,
        timestamp: new Date().toISOString(),
        adminAccount,
      };
      // Keep last 200 entries
      const updated = [newEntry, ...logs.slice(0, 199)];
      localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed writing to audit log', err);
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(AUDIT_LOG_STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};
