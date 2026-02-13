"use client";

import { useState } from "react";
import { 
  X, History, RotateCcw, Eye, Trash2, Clock, Check, Star,
  ChevronRight, Download, Upload, AlertCircle, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   VERSION HISTORY PANEL
   Save, view, compare, and restore previous versions of the page
   ═══════════════════════════════════════════════════════════════════════════ */

export interface PageVersion {
  id: string;
  name: string;
  createdAt: string;
  elementsSnapshot: string; // JSON stringified elements
  isAutosave: boolean;
  isStarred: boolean;
  description?: string;
  elementCount: number;
}

interface VersionHistoryPanelProps {
  versions: PageVersion[];
  currentElements: any[];
  onRestore: (version: PageVersion) => void;
  onSaveVersion: (name: string, description?: string) => void;
  onDeleteVersion: (id: string) => void;
  onToggleStar: (id: string) => void;
  onClose: () => void;
  onPreview?: (version: PageVersion) => void;
}

export function VersionHistoryPanel({
  versions,
  currentElements,
  onRestore,
  onSaveVersion,
  onDeleteVersion,
  onToggleStar,
  onClose,
  onPreview,
}: VersionHistoryPanelProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newVersionName, setNewVersionName] = useState("");
  const [newVersionDesc, setNewVersionDesc] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "manual" | "starred">("all");

  const filteredVersions = versions.filter(v => {
    if (filter === "manual") return !v.isAutosave;
    if (filter === "starred") return v.isStarred;
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    });
  };

  const handleSave = () => {
    if (!newVersionName.trim()) return;
    onSaveVersion(newVersionName, newVersionDesc || undefined);
    setShowSaveModal(false);
    setNewVersionName("");
    setNewVersionDesc("");
  };

  const handleRestore = (version: PageVersion) => {
    onRestore(version);
    setSelectedVersion(null);
  };

  const selected = selectedVersion ? versions.find(v => v.id === selectedVersion) : null;

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#333]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#CDB49E]/10 flex items-center justify-center">
            <History className="w-5 h-5 text-[#CDB49E]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Version History</h2>
            <p className="text-xs text-[#666]">{versions.length} versions saved</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg text-[#666] hover:text-white hover:bg-[#222]">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Actions Bar */}
      <div className="p-4 border-b border-[#333] flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {[
            { id: "all" as const, label: "All" },
            { id: "manual" as const, label: "Manual" },
            { id: "starred" as const, label: "Starred", icon: Star },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1",
                filter === f.id 
                  ? "bg-[#CDB49E]/10 text-[#CDB49E]" 
                  : "text-[#666] hover:text-white hover:bg-[#222]"
              )}
            >
              {f.icon && <f.icon className="w-3 h-3" />}
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowSaveModal(true)}
          className="px-3 py-1.5 rounded-lg bg-[#CDB49E] text-black text-xs font-medium hover:bg-[#d4c0ad] flex items-center gap-1"
        >
          <Download className="w-3 h-3" />
          Save Version
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Version List */}
        <div className="flex-1 overflow-y-auto">
          {filteredVersions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-[#333]" />
              </div>
              <p className="text-sm text-[#666] mb-2">No versions yet</p>
              <p className="text-xs text-[#555]">Save a version to track your changes</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredVersions.map(version => (
                <div
                  key={version.id}
                  onClick={() => setSelectedVersion(version.id)}
                  className={cn(
                    "p-3 rounded-xl cursor-pointer transition-all group",
                    selectedVersion === version.id
                      ? "bg-[#CDB49E]/10 border border-[#CDB49E]/30"
                      : "hover:bg-[#1a1a1a] border border-transparent"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white truncate">
                          {version.name}
                        </span>
                        {version.isAutosave && (
                          <span className="px-1.5 py-0.5 rounded bg-[#222] text-[10px] text-[#666]">
                            Auto
                          </span>
                        )}
                        {version.isStarred && (
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#666]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(version.createdAt)}
                        </span>
                        <span>{version.elementCount} elements</span>
                      </div>
                      {version.description && (
                        <p className="text-xs text-[#555] mt-1 line-clamp-1">
                          {version.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleStar(version.id); }}
                        className="p-1.5 rounded-lg hover:bg-[#222] text-[#666] hover:text-amber-400"
                      >
                        <Star className={cn(
                          "w-4 h-4",
                          version.isStarred && "fill-amber-400 text-amber-400"
                        )} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(version.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#666] hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {selected && (
          <div className="w-72 border-l border-[#333] flex flex-col">
            <div className="p-4 border-b border-[#333]">
              <h3 className="text-sm font-semibold text-white mb-1">{selected.name}</h3>
              <p className="text-xs text-[#666]">
                {new Date(selected.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {selected.description && (
                <p className="text-xs text-[#888] mb-4">{selected.description}</p>
              )}

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#222]">
                  <span className="text-xs text-[#666]">Elements</span>
                  <span className="text-lg font-semibold text-white block">{selected.elementCount}</span>
                </div>

                <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#222]">
                  <span className="text-xs text-[#666]">Type</span>
                  <span className="text-sm text-white block">
                    {selected.isAutosave ? "Autosave" : "Manual Save"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#333] space-y-2">
              {onPreview && (
                <button
                  onClick={() => onPreview(selected)}
                  className="w-full px-4 py-2 rounded-lg border border-[#333] text-[#888] hover:text-white hover:border-[#444] text-sm flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
              )}
              <button
                onClick={() => handleRestore(selected)}
                className="w-full px-4 py-2 rounded-lg bg-[#CDB49E] text-black font-medium text-sm hover:bg-[#d4c0ad] flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Restore This Version
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save Version Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-[#111] rounded-2xl border border-[#333] w-[400px] shadow-2xl">
            <div className="p-4 border-b border-[#333] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Save Version</h3>
              <button 
                onClick={() => setShowSaveModal(false)} 
                className="p-2 rounded-lg text-[#666] hover:text-white hover:bg-[#222]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#888] mb-2">Version Name</label>
                <input
                  type="text"
                  value={newVersionName}
                  onChange={e => setNewVersionName(e.target.value)}
                  placeholder="e.g., Before hero redesign"
                  className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#333] text-white placeholder:text-[#555] focus:border-[#CDB49E] focus:outline-none text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#888] mb-2">
                  Description <span className="text-[#555]">(optional)</span>
                </label>
                <textarea
                  value={newVersionDesc}
                  onChange={e => setNewVersionDesc(e.target.value)}
                  placeholder="What changes were made..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#333] text-white placeholder:text-[#555] focus:border-[#CDB49E] focus:outline-none text-sm resize-none"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#0a0a0a] border border-[#222] flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#666]" />
                <div>
                  <span className="text-xs text-[#666] block">Current state</span>
                  <span className="text-sm text-white">{currentElements.length} elements</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#333] flex items-center justify-end gap-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 rounded-lg text-[#888] hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!newVersionName.trim()}
                className="px-4 py-2 rounded-lg bg-[#CDB49E] text-black font-medium text-sm hover:bg-[#d4c0ad] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Save Version
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-[#111] rounded-2xl border border-[#333] w-[350px] shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Version?</h3>
                <p className="text-xs text-[#666]">This action cannot be undone</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg text-[#888] hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteVersion(confirmDelete);
                  setConfirmDelete(null);
                  if (selectedVersion === confirmDelete) setSelectedVersion(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Utility hook for managing versions
export function useVersionHistory(initialVersions: PageVersion[] = []) {
  const [versions, setVersions] = useState<PageVersion[]>(initialVersions);

  const saveVersion = (elements: any[], name: string, description?: string, isAutosave = false) => {
    const newVersion: PageVersion = {
      id: `v-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      elementsSnapshot: JSON.stringify(elements),
      isAutosave,
      isStarred: false,
      description,
      elementCount: elements.length,
    };
    setVersions(prev => [newVersion, ...prev].slice(0, 50)); // Keep max 50 versions
    return newVersion;
  };

  const deleteVersion = (id: string) => {
    setVersions(prev => prev.filter(v => v.id !== id));
  };

  const toggleStar = (id: string) => {
    setVersions(prev => prev.map(v => 
      v.id === id ? { ...v, isStarred: !v.isStarred } : v
    ));
  };

  const restoreVersion = (version: PageVersion): any[] => {
    try {
      return JSON.parse(version.elementsSnapshot);
    } catch {
      return [];
    }
  };

  return { versions, saveVersion, deleteVersion, toggleStar, restoreVersion };
}
