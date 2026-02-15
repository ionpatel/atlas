"use client";

import { useState, useMemo } from "react";
import {
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  FileText,
  CheckCircle2,
  Clock,
  User,
  Plus,
  Filter,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Activity {
  id: string;
  type: "call" | "email" | "meeting" | "note" | "task" | "deal_update";
  title: string;
  description?: string;
  contact?: string;
  deal?: string;
  user: string;
  timestamp: string;
  completed?: boolean;
  duration?: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
  onAddActivity?: () => void;
  compact?: boolean;
}

const activityConfig = {
  call: {
    icon: Phone,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    label: "Call",
  },
  email: {
    icon: Mail,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    label: "Email",
  },
  meeting: {
    icon: Calendar,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
    label: "Meeting",
  },
  note: {
    icon: MessageSquare,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    label: "Note",
  },
  task: {
    icon: CheckCircle2,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
    label: "Task",
  },
  deal_update: {
    icon: FileText,
    color: "text-[#111827]",
    bgColor: "bg-[rgba(156,74,41,0.15)]",
    borderColor: "border-[#E5E7EB]/20",
    label: "Deal Update",
  },
};

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ActivityTimeline({
  activities,
  onAddActivity,
  compact = false,
}: ActivityTimelineProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filteredActivities = useMemo(() => {
    if (filterType === "all") return activities;
    return activities.filter((a) => a.type === filterType);
  }, [activities, filterType]);

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: { date: string; activities: Activity[] }[] = [];
    let currentDate = "";

    filteredActivities.forEach((activity) => {
      const date = new Date(activity.timestamp).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
      if (date !== currentDate) {
        groups.push({ date, activities: [activity] });
        currentDate = date;
      } else {
        groups[groups.length - 1].activities.push(activity);
      }
    });

    return groups;
  }, [filteredActivities]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#111827]">Activity</h3>
        <div className="flex items-center gap-2">
          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#E5E7EB] rounded-lg text-xs text-[#374151] hover:text-[#111827] hover:bg-[#F8F9FA] transition-all"
            >
              <Filter className="w-3 h-3" />
              {filterType === "all"
                ? "All"
                : activityConfig[filterType as keyof typeof activityConfig]?.label}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showFilterMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowFilterMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-36 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg shadow-xl z-20 py-1">
                  <button
                    onClick={() => {
                      setFilterType("all");
                      setShowFilterMenu(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs transition-colors",
                      filterType === "all"
                        ? "text-[#111827] bg-[rgba(156,74,41,0.15)]"
                        : "text-[#374151] hover:text-[#111827] hover:bg-[#F8F9FA]"
                    )}
                  >
                    All Activity
                  </button>
                  {Object.entries(activityConfig).map(([type, config]) => (
                    <button
                      key={type}
                      onClick={() => {
                        setFilterType(type);
                        setShowFilterMenu(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors",
                        filterType === type
                          ? "text-[#111827] bg-[rgba(156,74,41,0.15)]"
                          : "text-[#374151] hover:text-[#111827] hover:bg-[#F8F9FA]"
                      )}
                    >
                      <config.icon className={cn("w-3 h-3", config.color)} />
                      {config.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {onAddActivity && (
            <button
              onClick={onAddActivity}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white text-white rounded-lg text-xs font-medium hover:bg-white transition-all"
            >
              <Plus className="w-3 h-3" />
              Log
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto pr-1 -mr-1">
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="w-8 h-8 text-[#111827] mb-3" />
            <p className="text-sm text-[#111827]">No activities yet</p>
            <p className="text-xs text-[#111827] mt-1">
              Log calls, emails, and meetings here
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedActivities.map((group) => (
              <div key={group.date}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-[#F8F9FA]" />
                  <span className="text-[10px] font-medium text-[#111827] uppercase tracking-wider">
                    {group.date}
                  </span>
                  <div className="h-px flex-1 bg-[#F8F9FA]" />
                </div>

                {/* Activities */}
                <div className="space-y-3">
                  {group.activities.map((activity, i) => {
                    const config = activityConfig[activity.type];
                    const Icon = config.icon;

                    return (
                      <div
                        key={activity.id}
                        className={cn(
                          "flex gap-3 group",
                          compact ? "items-center" : "items-start"
                        )}
                      >
                        {/* Icon */}
                        <div
                          className={cn(
                            "flex-shrink-0 rounded-lg flex items-center justify-center",
                            config.bgColor,
                            compact ? "w-7 h-7" : "w-8 h-8"
                          )}
                        >
                          <Icon className={cn(config.color, compact ? "w-3.5 h-3.5" : "w-4 h-4")} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p
                              className={cn(
                                "font-medium text-[#111827] truncate",
                                compact ? "text-xs" : "text-sm"
                              )}
                            >
                              {activity.title}
                            </p>
                            {activity.completed !== undefined && (
                              <span
                                className={cn(
                                  "px-1.5 py-0.5 rounded text-[9px] font-medium",
                                  activity.completed
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-amber-500/10 text-amber-400"
                                )}
                              >
                                {activity.completed ? "Done" : "Pending"}
                              </span>
                            )}
                          </div>

                          {activity.description && !compact && (
                            <p className="text-xs text-[#111827] mb-1 line-clamp-2">
                              {activity.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[11px] text-[#111827]">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {activity.user}
                            </span>
                            <span>{formatRelativeTime(activity.timestamp)}</span>
                            {activity.duration && (
                              <span>· {activity.duration}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Mock activities for demo
export const mockActivities: Activity[] = [
  {
    id: "a1",
    type: "call",
    title: "Discovery call with Sarah Johnson",
    description: "Discussed ERP requirements and timeline. Very interested in inventory module.",
    contact: "Sarah Johnson",
    deal: "ERP Implementation",
    user: "Alex M.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    duration: "32 min",
  },
  {
    id: "a2",
    type: "email",
    title: "Sent proposal to DataStream Corp",
    description: "Cloud migration proposal with pricing breakdown and implementation timeline.",
    contact: "Michael Chen",
    deal: "Cloud Migration Project",
    user: "Jordan K.",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a3",
    type: "meeting",
    title: "Demo presentation for BrightLeaf Media",
    description: "Presented website builder module. Emily wants to proceed with design phase.",
    contact: "Emily Davis",
    deal: "Website Redesign",
    user: "Alex M.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    duration: "1h 15min",
    completed: true,
  },
  {
    id: "a4",
    type: "task",
    title: "Send contract to NovaPharma",
    deal: "Annual Support Contract",
    user: "Sam T.",
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    completed: false,
  },
  {
    id: "a5",
    type: "note",
    title: "Budget concerns from InsightIQ",
    description: "David mentioned budget approval needed from CFO. Follow up next week.",
    contact: "David Torres",
    deal: "Data Analytics Platform",
    user: "Alex M.",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a6",
    type: "deal_update",
    title: "ShopNest deal moved to Won",
    description: "Contract signed! Implementation starts next Monday.",
    deal: "E-commerce Platform",
    user: "Alex M.",
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a7",
    type: "call",
    title: "Follow-up call with Lisa Park",
    description: "Discussed mobile app requirements and tech stack preferences.",
    contact: "Lisa Park",
    deal: "Mobile App Development",
    user: "Jordan K.",
    timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    duration: "45 min",
  },
];
