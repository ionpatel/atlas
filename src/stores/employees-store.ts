import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
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

  // Async CRUD
  fetchEmployees: (orgId: string) => Promise<void>;
  addEmployee: (employee: Omit<Employee, "id" | "created_at">) => Promise<Employee | null>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<boolean>;
  deleteEmployee: (id: string) => Promise<boolean>;

  // Sync helpers
  setSearchQuery: (query: string) => void;
  setFilter: (key: keyof EmployeesFilters, value: string) => void;
  resetFilters: () => void;
  filteredEmployees: () => Employee[];
}

// Demo org UUID
const DEMO_ORG_ID = "00000000-0000-0000-0000-000000000001";

const mockEmployees: Employee[] = [
  { id: "e1", org_id: DEMO_ORG_ID, name: "Alexandra Mitchell", job_title: "CEO & Founder", department: "Management", email: "a.mitchell@atlas.io", phone: "(416) 555-0001", start_date: "2024-01-15", status: "active", tags: ["Manager", "Executive"], avatar_color: "#CDB49E", created_at: "2024-01-15T10:00:00Z" },
  { id: "e2", org_id: DEMO_ORG_ID, name: "Jordan Kimura", job_title: "VP of Engineering", department: "Engineering", email: "j.kimura@atlas.io", phone: "(416) 555-0002", start_date: "2024-03-01", status: "active", tags: ["Manager", "Employee"], avatar_color: "#60a5fa", created_at: "2024-03-01T10:00:00Z" },
  { id: "e3", org_id: DEMO_ORG_ID, name: "Sam Torres", job_title: "Senior Developer", department: "Engineering", email: "s.torres@atlas.io", phone: "(647) 555-0003", start_date: "2024-05-10", status: "active", tags: ["Employee", "Remote"], avatar_color: "#a78bfa", created_at: "2024-05-10T10:00:00Z" },
  { id: "e4", org_id: DEMO_ORG_ID, name: "Priya Sharma", job_title: "Full Stack Developer", department: "Engineering", email: "p.sharma@atlas.io", phone: "(905) 555-0004", start_date: "2024-08-20", status: "active", tags: ["Employee"], avatar_color: "#34d399", created_at: "2024-08-20T10:00:00Z" },
  { id: "e5", org_id: DEMO_ORG_ID, name: "Marcus Williams", job_title: "Head of Sales", department: "Sales", email: "m.williams@atlas.io", phone: "(416) 555-0005", start_date: "2024-04-15", status: "active", tags: ["Manager", "Employee"], avatar_color: "#fbbf24", created_at: "2024-04-15T10:00:00Z" },
  { id: "e6", org_id: DEMO_ORG_ID, name: "Emily Chen", job_title: "Sales Representative", department: "Sales", email: "e.chen@atlas.io", phone: "(647) 555-0006", start_date: "2024-09-01", status: "on_leave", tags: ["Employee"], avatar_color: "#f87171", created_at: "2024-09-01T10:00:00Z" },
  { id: "e7", org_id: DEMO_ORG_ID, name: "David Park", job_title: "Support Team Lead", department: "Support", email: "d.park@atlas.io", phone: "(905) 555-0007", start_date: "2024-06-10", status: "active", tags: ["Manager", "Employee"], avatar_color: "#60a5fa", created_at: "2024-06-10T10:00:00Z" },
  { id: "e8", org_id: DEMO_ORG_ID, name: "Lisa Nguyen", job_title: "Customer Support Specialist", department: "Support", email: "l.nguyen@atlas.io", phone: "(416) 555-0008", start_date: "2024-10-15", status: "active", tags: ["Employee", "Remote"], avatar_color: "#a78bfa", created_at: "2024-10-15T10:00:00Z" },
  { id: "e9", org_id: DEMO_ORG_ID, name: "Ryan Foster", job_title: "DevOps Engineer", department: "Engineering", email: "r.foster@atlas.io", phone: "(647) 555-0009", start_date: "2025-01-05", status: "active", tags: ["Employee"], avatar_color: "#34d399", created_at: "2025-01-05T10:00:00Z" },
  { id: "e10", org_id: DEMO_ORG_ID, name: "Karen Webb", job_title: "Operations Manager", department: "Management", email: "k.webb@atlas.io", phone: "(905) 555-0010", start_date: "2024-02-20", status: "active", tags: ["Manager", "Employee"], avatar_color: "#CDB49E", created_at: "2024-02-20T10:00:00Z" },
];

const isSupabaseConfigured = () => !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function mapEmployeeFromDb(row: Record<string, unknown>): Employee {
  return {
    id: row.id as string,
    org_id: row.org_id as string,
    name: row.name as string,
    job_title: (row.job_title as string) || "",
    department: (row.department as string) || "",
    email: (row.email as string) || "",
    phone: (row.phone as string) || "",
    start_date: (row.start_date as string) || "",
    status: (row.status as Employee["status"]) || "active",
    tags: (row.tags as string[]) || [],
    avatar_color: (row.avatar_color as string) || "#CDB49E",
    created_at: row.created_at as string,
  };
}

export const useEmployeesStore = create<EmployeesState>((set, get) => ({
  employees: [],
  searchQuery: "",
  filters: { department: "", status: "" },
  loading: false,
  error: null,

  fetchEmployees: async (orgId: string) => {
    if (!isSupabaseConfigured()) {
      set({ employees: mockEmployees, loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("org_id", orgId)
        .order("name", { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        // No employees yet, use mock data
        set({ employees: mockEmployees, loading: false });
        return;
      }

      const employees = data.map((row: Record<string, unknown>) => mapEmployeeFromDb(row));
      set({ employees, loading: false });
    } catch (err) {
      console.error("fetchEmployees error:", err);
      set({ employees: mockEmployees, loading: false, error: String(err) });
    }
  },

  addEmployee: async (employeeData) => {
    const id = crypto.randomUUID();
    const newEmployee: Employee = {
      ...employeeData,
      id,
      created_at: new Date().toISOString(),
    };

    // Update local state immediately
    set((state) => ({ employees: [newEmployee, ...state.employees] }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("employees").insert({
          id: newEmployee.id,
          org_id: newEmployee.org_id,
          name: newEmployee.name,
          job_title: newEmployee.job_title,
          department: newEmployee.department,
          email: newEmployee.email,
          phone: newEmployee.phone,
          start_date: newEmployee.start_date || null,
          status: newEmployee.status,
          tags: newEmployee.tags,
          avatar_color: newEmployee.avatar_color,
        });

        if (error) {
          console.error("Error adding employee:", error);
          // Revert on error
          set((state) => ({ employees: state.employees.filter((e) => e.id !== id) }));
          return null;
        }
      } catch (err) {
        console.error("addEmployee error:", err);
        return null;
      }
    }

    return newEmployee;
  },

  updateEmployee: async (id, data) => {
    // Update local state immediately
    set((state) => ({
      employees: state.employees.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const updateData: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() };
        delete updateData.id;
        delete updateData.created_at;

        const { error } = await supabase.from("employees").update(updateData).eq("id", id);

        if (error) {
          console.error("Error updating employee:", error);
          return false;
        }
      } catch (err) {
        console.error("updateEmployee error:", err);
        return false;
      }
    }

    return true;
  },

  deleteEmployee: async (id) => {
    const { employees } = get();
    const employee = employees.find((e) => e.id === id);

    // Update local state immediately
    set((state) => ({ employees: state.employees.filter((e) => e.id !== id) }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("employees").delete().eq("id", id);

        if (error) {
          console.error("Error deleting employee:", error);
          // Revert on error
          if (employee) {
            set((state) => ({ employees: [...state.employees, employee] }));
          }
          return false;
        }
      } catch (err) {
        console.error("deleteEmployee error:", err);
        return false;
      }
    }

    return true;
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () => set({ filters: { department: "", status: "" }, searchQuery: "" }),

  filteredEmployees: () => {
    const { employees, searchQuery, filters } = get();
    return employees.filter((e) => {
      const matchesSearch =
        !searchQuery ||
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = !filters.department || e.department === filters.department;
      const matchesStatus = !filters.status || e.status === filters.status;
      return matchesSearch && matchesDept && matchesStatus;
    });
  },
}));
