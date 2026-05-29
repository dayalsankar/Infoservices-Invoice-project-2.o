// src/types/master.ts

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: 'Current' | 'Savings';
  branchName: string;
}

export interface ContactPerson {
  name: string;
  email: string;
  phone: string;
  designation: string;
}

// ─── Company ──────────────────────────────────────────────────────────────────

export type CompanyType = 'Pvt Ltd' | 'LLP' | 'Public Ltd' | 'Sole Proprietorship' | 'Partnership' | 'OPC' | 'Trust';
export type CompanyStatus = 'Active' | 'Inactive' | 'Suspended';
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';
export type BillingCycle = 'Monthly' | 'Bi-Monthly' | 'Quarterly' | 'Milestone';

export interface Company {
  id: string;
  code: string;
  name: string;
  displayName: string;
  type: CompanyType;
  gstin: string;
  pan: string;
  tan: string;
  cin: string;
  incorporationDate: string;
  address: Address;
  contactEmail: string;
  contactPhone: string;
  website: string;
  industry: string;
  currency: Currency;
  paymentTerms: number;
  billingCycle: BillingCycle;
  bankDetails: BankDetails;
  status: CompanyStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Client ───────────────────────────────────────────────────────────────────

export type ClientType = 'Corporate' | 'SME' | 'Startup' | 'Government' | 'PSU' | 'Individual';
export type ClientStatus = 'Active' | 'Inactive' | 'On Hold' | 'Blacklisted';

export interface Client {
  id: string;
  code: string;
  name: string;
  displayName: string;
  companyId: string;
  type: ClientType;
  gstin: string;
  pan: string;
  primaryContact: ContactPerson;
  billingContact: ContactPerson;
  address: Address;
  creditLimit: number;
  currency: Currency;
  paymentTerms: number;
  invoicePrefix: string;
  industry: string;
  notes: string;
  status: ClientStatus;
  onboardedDate: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Consultant ───────────────────────────────────────────────────────────────

export type ConsultantType = 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
export type ConsultantStatus = 'Active' | 'On Bench' | 'On Leave' | 'Terminated' | 'Resigned';
export type RateType = 'Hourly' | 'Daily' | 'Monthly';

export interface Consultant {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  type: ConsultantType;
  skills: string[];
  technologies: string[];
  joiningDate: string;
  experienceYears: number;
  billingRate: number;
  rateType: RateType;
  currency: 'INR' | 'USD';
  managerId: string;
  managerName: string;
  companyId: string;
  status: ConsultantStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Assignment ───────────────────────────────────────────────────────────────

export type BillingType = 'Time & Material' | 'Fixed Price' | 'Retainer' | 'Milestone';
export type AssignmentStatus = 'Active' | 'Completed' | 'On Hold' | 'Cancelled' | 'Upcoming';

export interface Assignment {
  id: string;
  assignmentCode: string;
  consultantId: string;
  consultantName: string;
  clientId: string;
  clientName: string;
  companyId: string;
  projectName: string;
  sowNumber: string;
  startDate: string;
  endDate: string;
  billingType: BillingType;
  billingRate: number;
  currency: 'INR' | 'USD';
  allottedHours: number;
  deliveryManagerId: string;
  deliveryManagerName: string;
  status: AssignmentStatus;
  description: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
