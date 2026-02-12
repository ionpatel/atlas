import { create } from "zustand";
import type { Project } from "@/types";

interface ProjectsFilters {
  status: string;
}

interface ProjectsState {
  projects: Project[];
  searchQuery: string;
  filters: ProjectsFilters;
  loading: boolean;
  error: string | null;

  setSearchQuery: (query: string) => void;
  setFilter: (key: keyof ProjectsFilters, value: string) => void;
  resetFilters: () => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  toggleFavorite: (id: string) => void;
  filteredProjects: () => Project[];
}

const mockProjects: Project[] = [
  {
    id: "p1", org_id: "org1", name: "Atlas ERP Platform",
    customer: "Internal", start_date: "2025-01-15", end_date: "2026-06-30",
    tags: ["Internal", "Development"], task_count: 47,
    milestone_progress: "2/5", status: "on_track", is_favorite: true,
    assigned_to: ["Jordan K.", "Sam T."],
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "p2", org_id: "org1", name: "TechVault Office Redesign",
    customer: "TechVault Inc.", start_date: "2026-01-10", end_date: "2026-04-15",
    tags: ["Architecture", "Design"], task_count: 23,
    milestone_progress: "1/3", status: "on_track", is_favorite: false,
    assigned_to: ["Alex M."],
    created_at: "2026-01-10T10:00:00Z",
  },
  {
    id: "p3", org_id: "org1", name: "DataStream Migration",
    customer: "DataStream Corp", start_date: "2026-02-01", end_date: "2026-08-31",
    tags: ["External", "Cloud"], task_count: 34,
    milestone_progress: "0/4", status: "at_risk", is_favorite: true,
    assigned_to: ["Jordan K.", "Priya S."],
    created_at: "2026-02-01T10:00:00Z",
  },
  {
    id: "p4", org_id: "org1", name: "BrightLeaf Web Portal",
    customer: "BrightLeaf Media", start_date: "2025-11-01", end_date: "2026-03-15",
    tags: ["Design", "Web"], task_count: 18,
    milestone_progress: "2/3", status: "on_track", is_favorite: false,
    assigned_to: ["Sam T."],
    created_at: "2025-11-01T10:00:00Z",
  },
  {
    id: "p5", org_id: "org1", name: "NovaPharma Compliance",
    customer: "NovaPharma Ltd.", start_date: "2025-09-01", end_date: "2026-01-31",
    tags: ["External", "Compliance"], task_count: 11,
    milestone_progress: "3/3", status: "done", is_favorite: false,
    assigned_to: ["Alex M.", "David P."],
    created_at: "2025-09-01T10:00:00Z",
  },
  {
    id: "p6", org_id: "org1", name: "UrbanFlow Mobile App",
    customer: "UrbanFlow", start_date: "2026-01-20", end_date: "2026-07-20",
    tags: ["Development", "Mobile"], task_count: 29,
    milestone_progress: "1/4", status: "at_risk", is_favorite: true,
    assigned_to: ["Priya S.", "Ryan F."],
    created_at: "2026-01-20T10:00:00Z",
  },
  {
    id: "p7", org_id: "org1", name: "Sterling HR Integration",
    customer: "Sterling & Co.", start_date: "2026-02-10", end_date: "2026-05-10",
    tags: ["Internal", "HR"], task_count: 15,
    milestone_progress: "0/2", status: "on_track", is_favorite: false,
    assigned_to: ["Sam T."],
    created_at: "2026-02-10T10:00:00Z",
  },
  {
    id: "p8", org_id: "org1", name: "VaultSecure Audit",
    customer: "VaultSecure", start_date: "2025-12-01", end_date: "2026-02-28",
    tags: ["External", "Security"], task_count: 8,
    milestone_progress: "2/2", status: "off_track", is_favorite: false,
    assigned_to: ["Jordan K."],
    created_at: "2025-12-01T10:00:00Z",
  },
  {
    id: "p9", org_id: "org1", name: "ShopNest E-commerce",
    customer: "ShopNest", start_date: "2026-01-05", end_date: "2026-09-30",
    tags: ["Development", "E-commerce"], task_count: 52,
    milestone_progress: "1/6", status: "on_track", is_favorite: true,
    assigned_to: ["Alex M.", "Priya S."],
    created_at: "2026-01-05T10:00:00Z",
  },
];

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: mockProjects,
  searchQuery: "",
  filters: { status: "" },
  loading: false,
  error: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () => set({ filters: { status: "" }, searchQuery: "" }),

  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),

  updateProject: (id, data) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),

  toggleFavorite: (id) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, is_favorite: !p.is_favorite } : p
      ),
    })),

  filteredProjects: () => {
    const { projects, searchQuery, filters } = get();
    return projects.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.customer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !filters.status || p.status === filters.status;
      return matchesSearch && matchesStatus;
    });
  },
}));
