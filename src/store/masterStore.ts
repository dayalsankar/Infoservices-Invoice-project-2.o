// src/store/masterStore.ts — Zustand store with localStorage persistence

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Company, Client, Consultant, Assignment } from '../types/master';
import { MOCK_COMPANIES, MOCK_CLIENTS, MOCK_CONSULTANTS, MOCK_ASSIGNMENTS } from '../data/mockData';

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const ts  = () => new Date().toISOString();

interface MasterState {
  companies:   Company[];
  clients:     Client[];
  consultants: Consultant[];
  assignments: Assignment[];

  // Companies
  addCompany:    (c: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCompany: (id: string, c: Partial<Company>) => void;
  deleteCompany: (id: string) => void;

  // Clients
  addClient:    (c: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (id: string, c: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Consultants
  addConsultant:    (c: Omit<Consultant, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateConsultant: (id: string, c: Partial<Consultant>) => void;
  deleteConsultant: (id: string) => void;

  // Assignments
  addAssignment:    (a: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAssignment: (id: string, a: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
}

export const useMasterStore = create<MasterState>()(
  persist(
    (set) => ({
      companies:   MOCK_COMPANIES,
      clients:     MOCK_CLIENTS,
      consultants: MOCK_CONSULTANTS,
      assignments: MOCK_ASSIGNMENTS,

      addCompany: (c) =>
        set((s) => ({ companies: [...s.companies, { ...c, id: `cmp_${uid()}`, createdAt: ts(), updatedAt: ts() }] })),
      updateCompany: (id, c) =>
        set((s) => ({ companies: s.companies.map((x) => x.id === id ? { ...x, ...c, updatedAt: ts() } : x) })),
      deleteCompany: (id) =>
        set((s) => ({ companies: s.companies.filter((x) => x.id !== id) })),

      addClient: (c) =>
        set((s) => ({ clients: [...s.clients, { ...c, id: `cli_${uid()}`, createdAt: ts(), updatedAt: ts() }] })),
      updateClient: (id, c) =>
        set((s) => ({ clients: s.clients.map((x) => x.id === id ? { ...x, ...c, updatedAt: ts() } : x) })),
      deleteClient: (id) =>
        set((s) => ({ clients: s.clients.filter((x) => x.id !== id) })),

      addConsultant: (c) =>
        set((s) => ({ consultants: [...s.consultants, { ...c, id: `con_${uid()}`, createdAt: ts(), updatedAt: ts() }] })),
      updateConsultant: (id, c) =>
        set((s) => ({ consultants: s.consultants.map((x) => x.id === id ? { ...x, ...c, updatedAt: ts() } : x) })),
      deleteConsultant: (id) =>
        set((s) => ({ consultants: s.consultants.filter((x) => x.id !== id) })),

      addAssignment: (a) =>
        set((s) => ({ assignments: [...s.assignments, { ...a, id: `asg_${uid()}`, createdAt: ts(), updatedAt: ts() }] })),
      updateAssignment: (id, a) =>
        set((s) => ({ assignments: s.assignments.map((x) => x.id === id ? { ...x, ...a, updatedAt: ts() } : x) })),
      deleteAssignment: (id) =>
        set((s) => ({ assignments: s.assignments.filter((x) => x.id !== id) })),
    }),
    { name: 'infoservices-master-data' },
  ),
);
