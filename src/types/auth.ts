// ─── Auth & RBAC Types ────────────────────────────────────────────────────────

export type UserRole =
  | 'super_admin'
  | 'finance_admin'
  | 'hr_admin'
  | 'delivery_manager'
  | 'consultant'
  | 'signing_authority'
  | 'client'
  | 'auditor'
  | 'executive'
  | 'system';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  /** Users who hold more than one role can switch between them */
  availableRoles?: UserRole[];
}

/** Personas that use the dense operator console layout */
export const CONSOLE_ROLES: ReadonlySet<UserRole> = new Set([
  'super_admin',
  'finance_admin',
  'hr_admin',
  'auditor',
  'executive',
]);

/** Personas that use the lightweight task-app layout */
export const TASK_ROLES: ReadonlySet<UserRole> = new Set([
  'delivery_manager',
  'consultant',
  'signing_authority',
  'client',
]);

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  finance_admin: 'Finance Admin',
  hr_admin: 'HR / Admin',
  delivery_manager: 'Delivery Manager',
  consultant: 'Consultant',
  signing_authority: 'Signing Authority',
  client: 'Client',
  auditor: 'Auditor',
  executive: 'Executive',
  system: 'System',
};
