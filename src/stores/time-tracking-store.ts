import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { logAuditEvent } from "@/lib/audit";
import type { TimeEntry, TimeEntryStatus } from "@/types";

interface TimeTrackingFilters {
  projectId: string;
  billable: string;
  userId: string;
}

interface TimeTrackingState {
  entries: TimeEntry[];
  activeEntry: TimeEntry | null;
  searchQuery: string;
  filters: TimeTrackingFilters;
  loading: boolean;
  error: string | null;
  selectedWeek: Date;

  // Async CRUD
  fetchEntries: (orgId: string, startDate?: Date, endDate?: Date) => Promise<void>;
  startTimer: (data: Partial<TimeEntry>) => Promise<TimeEntry | null>;
  pauseTimer: (id: string) => Promise<boolean>;
  resumeTimer: (id: string) => Promise<boolean>;
  stopTimer: (id: string) => Promise<boolean>;
  addManualEntry: (entry: Omit<TimeEntry, "id" | "created_at" | "status">) => Promise<TimeEntry | null>;
  updateEntry: (id: string, data: Partial<TimeEntry>) => Promise<boolean>;
  deleteEntry: (id: string) => Promise<boolean>;

  // Sync helpers
  setSearchQuery: (query: string) => void;
  setFilter: (key: keyof TimeTrackingFilters, value: string) => void;
  resetFilters: () => void;
  setSelectedWeek: (date: Date) => void;
  getWeekEntries: () => TimeEntry[];
  getTotalHours: (entries: TimeEntry[]) => number;
  getBillableHours: (entries: TimeEntry[]) => number;
}

const DEMO_ORG_ID = "00000000-0000-0000-0000-000000000001";

// Mock projects for demo
const DEMO_PROJECTS = [
  { id: "p1", name: "Atlas ERP Development" },
  { id: "p2", name: "Client Website Redesign" },
  { id: "p3", name: "Mobile App MVP" },
  { id: "p4", name: "Internal Tools" },
];

const mockEntries: TimeEntry[] = [
  { id: "t1", org_id: DEMO_ORG_ID, user_id: "e1", user_name: "Alexandra Mitchell", project_id: "p1", project_name: "Atlas ERP Development", task: "Architecture Review", start_time: new Date(Date.now() - 86400000 * 2).toISOString(), end_time: new Date(Date.now() - 86400000 * 2 + 7200000).toISOString(), duration_minutes: 120, billable: true, notes: "Reviewed system architecture", status: "stopped", created_at: new Date().toISOString() },
  { id: "t2", org_id: DEMO_ORG_ID, user_id: "e2", user_name: "Jordan Kimura", project_id: "p1", project_name: "Atlas ERP Development", task: "Sprint Planning", start_time: new Date(Date.now() - 86400000).toISOString(), end_time: new Date(Date.now() - 86400000 + 5400000).toISOString(), duration_minutes: 90, billable: false, notes: "Weekly sprint planning", status: "stopped", created_at: new Date().toISOString() },
  { id: "t3", org_id: DEMO_ORG_ID, user_id: "e3", user_name: "Sam Torres", project_id: "p2", project_name: "Client Website Redesign", task: "Frontend Development", start_time: new Date(Date.now() - 86400000).toISOString(), end_time: new Date(Date.now() - 86400000 + 14400000).toISOString(), duration_minutes: 240, billable: true, notes: "Implemented new dashboard components", status: "stopped", created_at: new Date().toISOString() },
  { id: "t4", org_id: DEMO_ORG_ID, user_id: "e4", user_name: "Priya Sharma", project_id: "p3", project_name: "Mobile App MVP", task: "API Integration", start_time: new Date().toISOString(), duration_minutes: 45, billable: true, status: "running", created_at: new Date().toISOString() },
  { id: "t5", org_id: DEMO_ORG_ID, user_id: "e5", user_name: "Marcus Williams", project_id: "p4", project_name: "Internal Tools", task: "Documentation", start_time: new Date(Date.now() - 86400000 * 3).toISOString(), end_time: new Date(Date.now() - 86400000 * 3 + 3600000).toISOString(), duration_minutes: 60, billable: false, notes: "Updated API documentation", status: "stopped", created_at: new Date().toISOString() },
];

const isSupabaseConfigured = () => !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function getWeekBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

export const useTimeTrackingStore = create<TimeTrackingState>((set, get) => ({
  entries: [],
  activeEntry: null,
  searchQuery: "",
  filters: { projectId: "", billable: "", userId: "" },
  loading: false,
  error: null,
  selectedWeek: new Date(),

  fetchEntries: async (orgId: string, startDate?: Date, endDate?: Date) => {
    if (!isSupabaseConfigured()) {
      const active = mockEntries.find(e => e.status === 'running');
      set({ entries: mockEntries, activeEntry: active || null, loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      let query = supabase
        .from("time_entries")
        .select("*, employees!user_id(name), projects(name)")
        .eq("org_id", orgId)
        .order("start_time", { ascending: false });

      if (startDate) {
        query = query.gte("start_time", startDate.toISOString());
      }
      if (endDate) {
        query = query.lte("start_time", endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        const active = mockEntries.find(e => e.status === 'running');
        set({ entries: mockEntries, activeEntry: active || null, loading: false });
        return;
      }

      const entries: TimeEntry[] = data.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        org_id: row.org_id as string,
        user_id: row.user_id as string,
        user_name: (row.employees as Record<string, string>)?.name,
        project_id: row.project_id as string | undefined,
        project_name: (row.projects as Record<string, string>)?.name,
        task: row.task as string,
        start_time: row.start_time as string,
        end_time: row.end_time as string | undefined,
        duration_minutes: row.duration_minutes as number,
        billable: row.billable as boolean,
        notes: row.notes as string | undefined,
        status: row.status as TimeEntryStatus,
        created_at: row.created_at as string,
      }));

      const active = entries.find(e => e.status === 'running');
      set({ entries, activeEntry: active || null, loading: false });
    } catch (err) {
      console.error("fetchEntries error:", err);
      const active = mockEntries.find(e => e.status === 'running');
      set({ entries: mockEntries, activeEntry: active || null, loading: false, error: String(err) });
    }
  },

  startTimer: async (data) => {
    const id = crypto.randomUUID();
    const newEntry: TimeEntry = {
      id,
      org_id: data.org_id || DEMO_ORG_ID,
      user_id: data.user_id || "e1",
      user_name: data.user_name,
      project_id: data.project_id,
      project_name: data.project_name,
      task: data.task || "",
      start_time: new Date().toISOString(),
      duration_minutes: 0,
      billable: data.billable ?? false,
      notes: data.notes,
      status: "running",
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      entries: [newEntry, ...state.entries],
      activeEntry: newEntry,
    }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("time_entries").insert({
          id: newEntry.id,
          org_id: newEntry.org_id,
          user_id: newEntry.user_id,
          project_id: newEntry.project_id,
          task: newEntry.task,
          start_time: newEntry.start_time,
          duration_minutes: 0,
          billable: newEntry.billable,
          notes: newEntry.notes,
          status: "running",
        });

        if (error) {
          console.error("Error starting timer:", error);
          set((state) => ({
            entries: state.entries.filter((e) => e.id !== id),
            activeEntry: null,
          }));
          return null;
        }

        logAuditEvent({
          orgId: newEntry.org_id,
          action: "create",
          tableName: "time_entries",
          recordId: newEntry.id,
          newValues: newEntry as unknown as Record<string, unknown>,
        });
      } catch (err) {
        console.error("startTimer error:", err);
        return null;
      }
    }

    return newEntry;
  },

  pauseTimer: async (id: string) => {
    const { entries } = get();
    const entry = entries.find(e => e.id === id);
    if (!entry) return false;

    const now = new Date();
    const startTime = new Date(entry.start_time);
    const additionalMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000);
    const newDuration = entry.duration_minutes + additionalMinutes;

    set((state) => ({
      entries: state.entries.map(e => 
        e.id === id ? { ...e, status: "paused" as TimeEntryStatus, duration_minutes: newDuration } : e
      ),
      activeEntry: null,
    }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("time_entries")
          .update({ status: "paused", duration_minutes: newDuration })
          .eq("id", id);

        if (error) {
          console.error("Error pausing timer:", error);
          return false;
        }
      } catch (err) {
        console.error("pauseTimer error:", err);
        return false;
      }
    }

    return true;
  },

  resumeTimer: async (id: string) => {
    const { entries } = get();
    const entry = entries.find(e => e.id === id);
    if (!entry) return false;

    const updatedEntry = {
      ...entry,
      start_time: new Date().toISOString(),
      status: "running" as TimeEntryStatus,
    };

    set((state) => ({
      entries: state.entries.map(e => e.id === id ? updatedEntry : e),
      activeEntry: updatedEntry,
    }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("time_entries")
          .update({ status: "running", start_time: updatedEntry.start_time })
          .eq("id", id);

        if (error) {
          console.error("Error resuming timer:", error);
          return false;
        }
      } catch (err) {
        console.error("resumeTimer error:", err);
        return false;
      }
    }

    return true;
  },

  stopTimer: async (id: string) => {
    const { entries } = get();
    const entry = entries.find(e => e.id === id);
    if (!entry) return false;

    const now = new Date();
    const startTime = new Date(entry.start_time);
    let totalMinutes = entry.duration_minutes;
    
    if (entry.status === "running") {
      totalMinutes += Math.floor((now.getTime() - startTime.getTime()) / 60000);
    }

    set((state) => ({
      entries: state.entries.map(e => 
        e.id === id ? { 
          ...e, 
          status: "stopped" as TimeEntryStatus, 
          end_time: now.toISOString(),
          duration_minutes: totalMinutes 
        } : e
      ),
      activeEntry: null,
    }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("time_entries")
          .update({ 
            status: "stopped", 
            end_time: now.toISOString(),
            duration_minutes: totalMinutes 
          })
          .eq("id", id);

        if (error) {
          console.error("Error stopping timer:", error);
          return false;
        }
      } catch (err) {
        console.error("stopTimer error:", err);
        return false;
      }
    }

    return true;
  },

  addManualEntry: async (entryData) => {
    const id = crypto.randomUUID();
    const newEntry: TimeEntry = {
      ...entryData,
      id,
      status: "stopped",
      created_at: new Date().toISOString(),
    };

    set((state) => ({ entries: [newEntry, ...state.entries] }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("time_entries").insert({
          id: newEntry.id,
          org_id: newEntry.org_id,
          user_id: newEntry.user_id,
          project_id: newEntry.project_id,
          task: newEntry.task,
          start_time: newEntry.start_time,
          end_time: newEntry.end_time,
          duration_minutes: newEntry.duration_minutes,
          billable: newEntry.billable,
          notes: newEntry.notes,
          status: "stopped",
        });

        if (error) {
          console.error("Error adding manual entry:", error);
          set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
          return null;
        }

        logAuditEvent({
          orgId: newEntry.org_id,
          action: "create",
          tableName: "time_entries",
          recordId: newEntry.id,
          newValues: newEntry as unknown as Record<string, unknown>,
        });
      } catch (err) {
        console.error("addManualEntry error:", err);
        return null;
      }
    }

    return newEntry;
  },

  updateEntry: async (id, data) => {
    set((state) => ({
      entries: state.entries.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const updateData: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() };
        delete updateData.id;
        delete updateData.created_at;

        const { error } = await supabase.from("time_entries").update(updateData).eq("id", id);

        if (error) {
          console.error("Error updating entry:", error);
          return false;
        }
      } catch (err) {
        console.error("updateEntry error:", err);
        return false;
      }
    }

    return true;
  },

  deleteEntry: async (id) => {
    const { entries } = get();
    const entry = entries.find((e) => e.id === id);

    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("time_entries").delete().eq("id", id);

        if (error) {
          console.error("Error deleting entry:", error);
          if (entry) {
            set((state) => ({ entries: [...state.entries, entry] }));
          }
          return false;
        }

        if (entry) {
          logAuditEvent({
            orgId: entry.org_id,
            action: "delete",
            tableName: "time_entries",
            recordId: id,
            oldValues: entry as unknown as Record<string, unknown>,
          });
        }
      } catch (err) {
        console.error("deleteEntry error:", err);
        return false;
      }
    }

    return true;
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () => set({ filters: { projectId: "", billable: "", userId: "" }, searchQuery: "" }),

  setSelectedWeek: (date) => set({ selectedWeek: date }),

  getWeekEntries: () => {
    const { entries, selectedWeek, searchQuery, filters } = get();
    const { start, end } = getWeekBounds(selectedWeek);

    return entries.filter((e) => {
      const entryDate = new Date(e.start_time);
      const inWeek = entryDate >= start && entryDate <= end;
      
      const matchesSearch =
        !searchQuery ||
        e.task?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProject = !filters.projectId || e.project_id === filters.projectId;
      const matchesBillable = 
        !filters.billable || 
        (filters.billable === "true" && e.billable) || 
        (filters.billable === "false" && !e.billable);
      const matchesUser = !filters.userId || e.user_id === filters.userId;

      return inWeek && matchesSearch && matchesProject && matchesBillable && matchesUser;
    });
  },

  getTotalHours: (entries) => {
    return entries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0) / 60;
  },

  getBillableHours: (entries) => {
    return entries.filter(e => e.billable).reduce((sum, e) => sum + (e.duration_minutes || 0), 0) / 60;
  },
}));

export { DEMO_PROJECTS };
