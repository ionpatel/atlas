import { create } from "zustand";
import type { Employee } from "@/types";

interface EmployeesFilters {
  department: string;
  status: string;
}

interface EmployeesState {
  employees: Employee[];
  searchQuery: string;
  filters: EmployeesFilters;
  loading: boolean;
  error: string | null;

  setSearchQuery: (query: string) => void;
  setFilter: (key: keyof EmployeesFilters, value: string) => void;
  resetFilters: () => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  filteredEmployees: () => Employee[];
}

const mockEmployees: Employee[] = [
  {
    id: "e1", org_id: "org1", name: "Alexandra Mitchell",
    job_title: "CEO & Founder", department: "Management",
    email: "a.mitchell@atlas.io", phone: "(416) 555-0001",
    start_date: "2024-01-15", status: "active",
    tags: ["Manager", "Executive"], avatar_color: "#CDB49E",
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "e2", org_id: "org1", name: "Jordan Kimura",
    job_title: "VP of Engineering", department: "Engineering",
    email: "j.kimura@atlas.io", phone: "(416) 555-0002",
    start_date: "2024-03-01", status: "active",
    tags: ["Manager", "Employee"], avatar_color: "#60a5fa",
    created_at: "2024-03-01T10:00:00Z",
  },
  {
    id: "e3", org_id: "org1", name: "Sam Torres",
    job_title: "Senior Developer", department: "Engineering",
    email: "s.torres@atlas.io", phone: "(647) 555-0003",
    start_date: "2024-05-10", status: "active",
    tags: ["Employee", "Remote"], avatar_color: "#a78bfa",
    created_at: "2024-05-10T10:00:00Z",
  },
  {
    id: "e4", org_id: "org1", name: "Priya Sharma",
    job_title: "Full Stack Developer", department: "Engineering",
    email: "p.sharma@atlas.io", phone: "(905) 555-0004",
    start_date: "2024-08-20", status: "active",
    tags: ["Employee"], avatar_color: "#34d399",
    created_at: "2024-08-20T10:00:00Z",
  },
  {
    id: "e5", org_id: "org1", name: "Marcus Williams",
    job_title: "Head of Sales", department: "Sales",
    email: "m.williams@atlas.io", phone: "(416) 555-0005",
    start_date: "2024-04-15", status: "active",
    tags: ["Manager", "Employee"], avatar_color: "#fbbf24",
    created_at: "2024-04-15T10:00:00Z",
  },
  {
    id: "e6", org_id: "org1", name: "Emily Chen",
    job_title: "Sales Representative", department: "Sales",
    email: "e.chen@atlas.io", phone: "(647) 555-0006",
    start_date: "2024-09-01", status: "on_leave",
    tags: ["Employee"], avatar_color: "#f87171",
    created_at: "2024-09-01T10:00:00Z",
  },
  {
    id: "e7", org_id: "org1", name: "David Park",
    job_title: "Support Team Lead", department: "Support",
    email: "d.park@atlas.io", phone: "(905) 555-0007",
    start_date: "2024-06-10", status: "active",
    tags: ["Manager", "Employee"], avatar_color: "#60a5fa",
    created_at: "2024-06-10T10:00:00Z",
  },
  {
    id: "e8", org_id: "org1", name: "Lisa Nguyen",
    job_title: "Customer Support Specialist", department: "Support",
    email: "l.nguyen@atlas.io", phone: "(416) 555-0008",
    start_date: "2024-10-15", status: "active",
    tags: ["Employee", "Remote"], avatar_color: "#a78bfa",
    created_at: "2024-10-15T10:00:00Z",
  },
  {
    id: "e9", org_id: "org1", name: "Ryan Foster",
    job_title: "DevOps Engineer", department: "Engineering",
    email: "r.foster@atlas.io", phone: "(647) 555-0009",
    start_date: "2025-01-05", status: "active",
    tags: ["Employee"], avatar_color: "#34d399",
    created_at: "2025-01-05T10:00:00Z",
  },
  {
    id: "e10", org_id: "org1", name: "Karen Webb",
    job_title: "Operations Manager", department: "Management",
    email: "k.webb@atlas.io", phone: "(905) 555-0010",
    start_date: "2024-02-20", status: "active",
    tags: ["Manager", "Employee"], avatar_color: "#CDB49E",
    created_at: "2024-02-20T10:00:00Z",
  },
];

export const useEmployeesStore = create<EmployeesState>((set, get) => ({
  employees: mockEmployees,
  searchQuery: "",
  filters: { department: "", status: "" },
  loading: false,
  error: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () => set({ filters: { department: "", status: "" }, searchQuery: "" }),

  addEmployee: (employee) =>
    set((state) => ({ employees: [employee, ...state.employees] })),

  updateEmployee: (id, data) =>
    set((state) => ({
      employees: state.employees.map((e) => (e.id === id ? { ...e, ...data } : e)),
    })),

  deleteEmployee: (id) =>
    set((state) => ({
      employees: state.employees.filter((e) => e.id !== id),
    })),

  filteredEmployees: () => {
    const { employees, searchQuery, filters } = get();
    return employees.filter((e) => {
      const matchesSearch =
        !searchQuery ||
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = !filters.department || e.department === filters.department;
      const matchesStatus = !filters.status || e.status === filters.status;
      return matchesSearch && matchesDept && matchesStatus;
    });
  },
}));
