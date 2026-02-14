"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Clock,
  Play,
  Pause,
  Square,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Download,
  X,
  Pencil,
  Trash2,
  Timer,
  DollarSign,
  FolderKanban,
  FileText,
  RotateCcw,
} from "lucide-react";
import { useTimeTrackingStore, DEMO_PROJECTS } from "@/stores/time-tracking-store";
import { useToastStore } from "@/components/ui/toast";
import { cn, formatCurrency } from "@/lib/utils";
import type { TimeEntry } from "@/types";

/* ─────────── constants ─────────── */

const DEMO_ORG_ID = "00000000-0000-0000-0000-000000000001";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ─────────── helpers ─────────── */

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getWeekBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

function getWeekDays(date: Date): Date[] {
  const { start } = getWeekBounds(date);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    days.push(day);
  }
  return days;
}

/* ─────────── Status Badge ─────────── */

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    running: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    paused: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    stopped: "bg-[#222222] text-[#888888] border-[#2a2a2a]",
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${styles[status] || styles.stopped}`}>
      {label}
    </span>
  );
}

/* ─────────── Timer Display ─────────── */

function TimerDisplay({ entry, onStop, onPause, onResume }: { 
  entry: TimeEntry; 
  onStop: () => void; 
  onPause: () => void; 
  onResume: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (entry.status !== "running") {
      setElapsed(entry.duration_minutes * 60);
      return;
    }

    const startTime = new Date(entry.start_time).getTime();
    const baseSeconds = entry.duration_minutes * 60;
    
    const updateElapsed = () => {
      const now = Date.now();
      const runningSeconds = Math.floor((now - startTime) / 1000);
      setElapsed(baseSeconds + runningSeconds);
    };
    
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [entry.start_time, entry.status, entry.duration_minutes]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  return (
    <div className="bg-gradient-to-br from-[#38BDF8]/10 to-[#0EA5E9]/10 border border-[#38BDF8]/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#f5f0eb]">{entry.task || "Untitled Task"}</h3>
          <p className="text-sm text-[#888888]">{entry.project_name || "No project"}</p>
        </div>
        <StatusBadge status={entry.status} />
      </div>
      
      <div className="flex items-center justify-center py-6">
        <div className="text-5xl font-mono text-[#38BDF8] tracking-wider">
          {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        {entry.status === "running" ? (
          <>
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>
            <button
              onClick={onStop}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
            >
              <Square className="w-4 h-4" />
              <span>Stop</span>
            </button>
          </>
        ) : entry.status === "paused" ? (
          <>
            <button
              onClick={onResume}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Resume</span>
            </button>
            <button
              onClick={onStop}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
            >
              <Square className="w-4 h-4" />
              <span>Stop</span>
            </button>
          </>
        ) : null}
      </div>

      {entry.billable && (
        <div className="mt-4 flex items-center justify-center gap-2 text-[#38BDF8]">
          <DollarSign className="w-4 h-4" />
          <span className="text-sm">Billable</span>
        </div>
      )}
    </div>
  );
}

/* ─────────── Start Timer Form ─────────── */

function StartTimerForm({ onStart, onClose }: { onStart: (data: Partial<TimeEntry>) => void; onClose: () => void }) {
  const [task, setTask] = useState("");
  const [projectId, setProjectId] = useState("");
  const [billable, setBillable] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const project = DEMO_PROJECTS.find((p) => p.id === projectId);
    onStart({
      org_id: DEMO_ORG_ID,
      user_id: "e1",
      user_name: "Alexandra Mitchell",
      task,
      project_id: projectId || undefined,
      project_name: project?.name,
      billable,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
          <h2 className="text-xl font-semibold text-[#f5f0eb]">Start Timer</h2>
          <button onClick={onClose} className="text-[#888888] hover:text-[#f5f0eb] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#888888] mb-1.5">Task Description</label>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="What are you working on?"
              autoFocus
              className="w-full px-4 py-2.5 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] placeholder:text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]/50 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#888888] mb-1.5">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]/50 transition-all duration-200"
            >
              <option value="">No project</option>
              {DEMO_PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#888888] mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes..."
              rows={2}
              className="w-full px-4 py-2.5 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] placeholder:text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]/50 transition-all duration-200 resize-none"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={billable}
                onChange={(e) => setBillable(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-[#222222] rounded-full peer-checked:bg-[#38BDF8] transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform" />
            </div>
            <span className="text-sm text-[#f5f0eb]">Billable time</span>
          </label>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-[#222222] hover:bg-[#2a2a2a] text-[#f5f0eb] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] hover:from-[#38BDF8]/90 hover:to-[#0EA5E9]/90 text-[#0F172A] font-medium rounded-lg transition-all"
            >
              <Play className="w-4 h-4" />
              Start Timer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────── Manual Entry Form ─────────── */

function ManualEntryForm({ onSave, onClose }: { onSave: (data: Omit<TimeEntry, "id" | "created_at" | "status">) => void; onClose: () => void }) {
  const [task, setTask] = useState("");
  const [projectId, setProjectId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [billable, setBillable] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const project = DEMO_PROJECTS.find((p) => p.id === projectId);
    
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    const durationMinutes = Math.floor((endDateTime.getTime() - startDateTime.getTime()) / 60000);

    onSave({
      org_id: DEMO_ORG_ID,
      user_id: "e1",
      user_name: "Alexandra Mitchell",
      task,
      project_id: projectId || undefined,
      project_name: project?.name,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      duration_minutes: durationMinutes,
      billable,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
          <h2 className="text-xl font-semibold text-[#f5f0eb]">Add Time Entry</h2>
          <button onClick={onClose} className="text-[#888888] hover:text-[#f5f0eb] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#888888] mb-1.5">Task Description</label>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="What did you work on?"
              required
              className="w-full px-4 py-2.5 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] placeholder:text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]/50 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#888888] mb-1.5">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]/50 transition-all duration-200"
            >
              <option value="">No project</option>
              {DEMO_PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#888888] mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]/50 transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#888888] mb-1.5">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]/50 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#888888] mb-1.5">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]/50 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#888888] mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes..."
              rows={2}
              className="w-full px-4 py-2.5 bg-[#222222] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] placeholder:text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]/50 transition-all duration-200 resize-none"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={billable}
                onChange={(e) => setBillable(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-[#222222] rounded-full peer-checked:bg-[#38BDF8] transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform" />
            </div>
            <span className="text-sm text-[#f5f0eb]">Billable time</span>
          </label>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-[#222222] hover:bg-[#2a2a2a] text-[#f5f0eb] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] hover:from-[#38BDF8]/90 hover:to-[#0EA5E9]/90 text-[#0F172A] font-medium rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────── Weekly Timesheet ─────────── */

function WeeklyTimesheet({
  entries,
  selectedWeek,
  onPrevWeek,
  onNextWeek,
  onEntryClick,
}: {
  entries: TimeEntry[];
  selectedWeek: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onEntryClick: (entry: TimeEntry) => void;
}) {
  const weekDays = getWeekDays(selectedWeek);
  const { start, end } = getWeekBounds(selectedWeek);

  const entriesByDay = useMemo(() => {
    const map: Record<string, TimeEntry[]> = {};
    weekDays.forEach((day) => {
      const key = day.toISOString().split("T")[0];
      map[key] = [];
    });
    entries.forEach((entry) => {
      const key = new Date(entry.start_time).toISOString().split("T")[0];
      if (map[key]) {
        map[key].push(entry);
      }
    });
    return map;
  }, [entries, weekDays]);

  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    Object.entries(entriesByDay).forEach(([key, dayEntries]) => {
      totals[key] = dayEntries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0);
    });
    return totals;
  }, [entriesByDay]);

  const weekTotal = Object.values(dailyTotals).reduce((sum, mins) => sum + mins, 0);

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
      {/* Week Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
        <button
          onClick={onPrevWeek}
          className="p-2 hover:bg-[#222222] rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-[#888888]" />
        </button>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-[#f5f0eb]">
            {start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </h3>
          <p className="text-sm text-[#888888]">Total: {formatDuration(weekTotal)}</p>
        </div>
        <button
          onClick={onNextWeek}
          className="p-2 hover:bg-[#222222] rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-[#888888]" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-[#2a2a2a]">
        {weekDays.map((day, idx) => {
          const key = day.toISOString().split("T")[0];
          const isToday = key === new Date().toISOString().split("T")[0];
          return (
            <div
              key={idx}
              className={cn(
                "p-3 text-center border-r border-[#2a2a2a] last:border-r-0",
                isToday && "bg-[#38BDF8]/5"
              )}
            >
              <div className={cn("text-xs font-medium", isToday ? "text-[#38BDF8]" : "text-[#888888]")}>
                {DAYS_OF_WEEK[idx]}
              </div>
              <div className={cn("text-lg font-semibold", isToday ? "text-[#38BDF8]" : "text-[#f5f0eb]")}>
                {day.getDate()}
              </div>
              <div className="text-xs text-[#555555] mt-1">
                {formatDuration(dailyTotals[key] || 0)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Entries Grid */}
      <div className="grid grid-cols-7 min-h-[300px]">
        {weekDays.map((day, idx) => {
          const key = day.toISOString().split("T")[0];
          const dayEntries = entriesByDay[key] || [];
          const isToday = key === new Date().toISOString().split("T")[0];
          return (
            <div
              key={idx}
              className={cn(
                "p-2 border-r border-[#2a2a2a] last:border-r-0 space-y-2",
                isToday && "bg-[#38BDF8]/5"
              )}
            >
              {dayEntries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => onEntryClick(entry)}
                  className={cn(
                    "w-full p-2 rounded-lg text-left transition-all hover:scale-[1.02]",
                    entry.billable
                      ? "bg-[#38BDF8]/10 border border-[#38BDF8]/20"
                      : "bg-[#222222] border border-[#2a2a2a]"
                  )}
                >
                  <div className="text-xs font-medium text-[#f5f0eb] line-clamp-1">
                    {entry.task || "Untitled"}
                  </div>
                  <div className="text-[10px] text-[#888888] mt-0.5">
                    {formatDuration(entry.duration_minutes)}
                  </div>
                  {entry.project_name && (
                    <div className="text-[10px] text-[#38BDF8] mt-0.5 line-clamp-1">
                      {entry.project_name}
                    </div>
                  )}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── Entry Row ─────────── */

function EntryRow({ entry, onEdit, onDelete }: { entry: TimeEntry; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:border-[#38BDF8]/20 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-[#f5f0eb] truncate">{entry.task || "Untitled Task"}</h4>
          {entry.billable && (
            <DollarSign className="w-3.5 h-3.5 text-[#38BDF8] flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-[#888888]">
          {entry.project_name && (
            <span className="flex items-center gap-1">
              <FolderKanban className="w-3.5 h-3.5" />
              {entry.project_name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(entry.start_time)}
          </span>
          {entry.end_time && (
            <span>{formatTime(entry.start_time)} - {formatTime(entry.end_time)}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-semibold text-[#f5f0eb]">{formatDuration(entry.duration_minutes)}</div>
          <StatusBadge status={entry.status} />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-[#222222] rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4 text-[#888888]" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Main Page ─────────── */

export default function TimeTrackingPage() {
  const {
    entries,
    activeEntry,
    loading,
    selectedWeek,
    fetchEntries,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    addManualEntry,
    deleteEntry,
    setSelectedWeek,
    getWeekEntries,
    getTotalHours,
    getBillableHours,
  } = useTimeTrackingStore();

  const toast = useToastStore();

  const [showStartTimer, setShowStartTimer] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [viewMode, setViewMode] = useState<"timesheet" | "list">("timesheet");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchEntries(DEMO_ORG_ID);
  }, [fetchEntries]);

  const weekEntries = getWeekEntries();
  const totalHours = getTotalHours(weekEntries);
  const billableHours = getBillableHours(weekEntries);

  const handleStartTimer = async (data: Partial<TimeEntry>) => {
    const result = await startTimer(data);
    if (result) {
      toast.addToast({ type: "success", message: "Timer started!" });
    }
  };

  const handlePauseTimer = async () => {
    if (activeEntry) {
      await pauseTimer(activeEntry.id);
      toast.addToast({ type: "info", message: "Timer paused" });
    }
  };

  const handleResumeTimer = async () => {
    if (activeEntry) {
      await resumeTimer(activeEntry.id);
      toast.addToast({ type: "success", message: "Timer resumed!" });
    }
  };

  const handleStopTimer = async () => {
    if (activeEntry) {
      await stopTimer(activeEntry.id);
      toast.addToast({ type: "success", message: "Timer stopped and saved!" });
    }
  };

  const handleAddManualEntry = async (data: Omit<TimeEntry, "id" | "created_at" | "status">) => {
    const result = await addManualEntry(data);
    if (result) {
      toast.addToast({ type: "success", message: "Time entry added!" });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    const result = await deleteEntry(id);
    if (result) {
      toast.addToast({ type: "success", message: "Entry deleted" });
    }
  };

  const handlePrevWeek = () => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setSelectedWeek(newWeek);
  };

  const handleNextWeek = () => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setSelectedWeek(newWeek);
  };

  const handleExportPDF = () => {
    toast.addToast({ type: "info", message: "Exporting timesheet to PDF..." });
    // PDF export would be implemented here
  };

  const filteredEntries = searchQuery
    ? entries.filter(
        (e) =>
          e.task?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.project_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : entries;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f5f0eb]">Time Tracking</h1>
          <p className="text-[#888888] mt-1">Track your work hours and manage timesheets</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#222222] hover:bg-[#2a2a2a] text-[#f5f0eb] rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={() => setShowManualEntry(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#222222] hover:bg-[#2a2a2a] text-[#f5f0eb] rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Manual Entry
          </button>
          {!activeEntry && (
            <button
              onClick={() => setShowStartTimer(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] hover:from-[#38BDF8]/90 hover:to-[#0EA5E9]/90 text-[#0F172A] font-medium rounded-lg transition-all shadow-lg shadow-[#38BDF8]/20"
            >
              <Play className="w-4 h-4" />
              Start Timer
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#38BDF8]/10 flex items-center justify-center">
              <Timer className="w-5 h-5 text-[#38BDF8]" />
            </div>
            <span className="text-sm text-[#888888]">This Week</span>
          </div>
          <div className="text-2xl font-bold text-[#f5f0eb]">{totalHours.toFixed(1)}h</div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-sm text-[#888888]">Billable</span>
          </div>
          <div className="text-2xl font-bold text-[#f5f0eb]">{billableHours.toFixed(1)}h</div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-violet-400" />
            </div>
            <span className="text-sm text-[#888888]">Projects</span>
          </div>
          <div className="text-2xl font-bold text-[#f5f0eb]">
            {new Set(weekEntries.filter(e => e.project_id).map(e => e.project_id)).size}
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-sm text-[#888888]">Entries</span>
          </div>
          <div className="text-2xl font-bold text-[#f5f0eb]">{weekEntries.length}</div>
        </div>
      </div>

      {/* Active Timer */}
      {activeEntry && (
        <TimerDisplay
          entry={activeEntry}
          onStop={handleStopTimer}
          onPause={handlePauseTimer}
          onResume={handleResumeTimer}
        />
      )}

      {/* View Toggle & Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-1">
          <button
            onClick={() => setViewMode("timesheet")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              viewMode === "timesheet"
                ? "bg-[#38BDF8] text-[#0F172A]"
                : "text-[#888888] hover:text-[#f5f0eb]"
            )}
          >
            <Calendar className="w-4 h-4 inline-block mr-2" />
            Timesheet
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              viewMode === "list"
                ? "bg-[#38BDF8] text-[#0F172A]"
                : "text-[#888888] hover:text-[#f5f0eb]"
            )}
          >
            <Clock className="w-4 h-4 inline-block mr-2" />
            List
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className="pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] placeholder:text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]/50 transition-all w-64"
          />
        </div>
      </div>

      {/* Content */}
      {viewMode === "timesheet" ? (
        <WeeklyTimesheet
          entries={weekEntries}
          selectedWeek={selectedWeek}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onEntryClick={(entry) => console.log("Edit entry:", entry.id)}
        />
      ) : (
        <div className="space-y-3">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-[#888888]">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No time entries found</p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                onEdit={() => console.log("Edit:", entry.id)}
                onDelete={() => handleDeleteEntry(entry.id)}
              />
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {showStartTimer && (
        <StartTimerForm onStart={handleStartTimer} onClose={() => setShowStartTimer(false)} />
      )}
      {showManualEntry && (
        <ManualEntryForm onSave={handleAddManualEntry} onClose={() => setShowManualEntry(false)} />
      )}
    </div>
  );
}
