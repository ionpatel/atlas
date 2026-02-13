"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  Undo2, Redo2, History, Save, Bookmark, GitBranch, GitCommit, ChevronDown,
  ChevronRight, RotateCcw, Trash2, Clock, Tag, Plus, X, Check, Copy,
  ArrowUp, ArrowDown, FolderTree, Eye, Edit2, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   ADVANCED UNDO STACK
   Named snapshots, branching, and visual history
   ═══════════════════════════════════════════════════════════════════════════ */

export interface HistoryEntry {
  id: string;
  timestamp: number;
  action: string;
  description?: string;
  data: unknown;
  snapshot?: boolean;
  snapshotName?: string;
  branchId?: string;
}

export interface Branch {
  id: string;
  name: string;
  parentId?: string;
  parentEntryId?: string;
  createdAt: number;
  entries: HistoryEntry[];
  current: number; // Current position in this branch
}

export interface UndoStackState {
  branches: Branch[];
  activeBranchId: string;
  maxEntries?: number;
}

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Format timestamp
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
};

// Create initial state
export function createInitialUndoState(initialData: unknown): UndoStackState {
  const mainBranch: Branch = {
    id: "main",
    name: "Main",
    createdAt: Date.now(),
    entries: [{
      id: generateId(),
      timestamp: Date.now(),
      action: "Initial state",
      data: initialData,
    }],
    current: 0,
  };

  return {
    branches: [mainBranch],
    activeBranchId: "main",
    maxEntries: 100,
  };
}

// Custom hook for undo/redo with branching
export function useUndoStack<T>(initialData: T) {
  const [state, setState] = useState<UndoStackState>(() => 
    createInitialUndoState(initialData)
  );

  // Get active branch
  const activeBranch = useMemo(() => 
    state.branches.find(b => b.id === state.activeBranchId)!,
    [state.branches, state.activeBranchId]
  );

  // Get current data
  const currentData = useMemo(() => {
    const entry = activeBranch.entries[activeBranch.current];
    return entry?.data as T;
  }, [activeBranch]);

  // Can undo/redo
  const canUndo = activeBranch.current > 0;
  const canRedo = activeBranch.current < activeBranch.entries.length - 1;

  // Push new entry
  const push = useCallback((action: string, data: T, description?: string) => {
    setState(prev => {
      const branch = prev.branches.find(b => b.id === prev.activeBranchId)!;
      
      // If we're not at the end, we need to create a new branch or truncate
      const shouldTruncate = branch.current < branch.entries.length - 1;
      
      const newEntry: HistoryEntry = {
        id: generateId(),
        timestamp: Date.now(),
        action,
        description,
        data,
        branchId: prev.activeBranchId,
      };

      let newEntries = shouldTruncate
        ? [...branch.entries.slice(0, branch.current + 1), newEntry]
        : [...branch.entries, newEntry];

      // Limit entries if maxEntries is set
      if (prev.maxEntries && newEntries.length > prev.maxEntries) {
        // Keep snapshots when trimming
        const trimmed = newEntries.slice(-prev.maxEntries);
        const snapshots = newEntries
          .slice(0, -prev.maxEntries)
          .filter(e => e.snapshot);
        newEntries = [...snapshots, ...trimmed];
      }

      const newBranches = prev.branches.map(b =>
        b.id === prev.activeBranchId
          ? { ...b, entries: newEntries, current: newEntries.length - 1 }
          : b
      );

      return { ...prev, branches: newBranches };
    });
  }, []);

  // Undo
  const undo = useCallback(() => {
    if (!canUndo) return;
    setState(prev => ({
      ...prev,
      branches: prev.branches.map(b =>
        b.id === prev.activeBranchId
          ? { ...b, current: Math.max(0, b.current - 1) }
          : b
      ),
    }));
  }, [canUndo]);

  // Redo
  const redo = useCallback(() => {
    if (!canRedo) return;
    setState(prev => ({
      ...prev,
      branches: prev.branches.map(b =>
        b.id === prev.activeBranchId
          ? { ...b, current: Math.min(b.entries.length - 1, b.current + 1) }
          : b
      ),
    }));
  }, [canRedo]);

  // Jump to specific entry
  const jumpTo = useCallback((entryId: string) => {
    setState(prev => {
      const branch = prev.branches.find(b => b.id === prev.activeBranchId)!;
      const index = branch.entries.findIndex(e => e.id === entryId);
      if (index === -1) return prev;
      
      return {
        ...prev,
        branches: prev.branches.map(b =>
          b.id === prev.activeBranchId
            ? { ...b, current: index }
            : b
        ),
      };
    });
  }, []);

  // Create named snapshot
  const createSnapshot = useCallback((name: string) => {
    setState(prev => {
      const branch = prev.branches.find(b => b.id === prev.activeBranchId)!;
      const currentEntry = branch.entries[branch.current];
      
      const snapshotEntry: HistoryEntry = {
        ...currentEntry,
        id: generateId(),
        snapshot: true,
        snapshotName: name,
        action: `Snapshot: ${name}`,
      };

      return {
        ...prev,
        branches: prev.branches.map(b =>
          b.id === prev.activeBranchId
            ? { ...b, entries: [...b.entries, snapshotEntry], current: b.entries.length }
            : b
        ),
      };
    });
  }, []);

  // Create branch from current state
  const createBranch = useCallback((name: string) => {
    setState(prev => {
      const parentBranch = prev.branches.find(b => b.id === prev.activeBranchId)!;
      const currentEntry = parentBranch.entries[parentBranch.current];

      const newBranch: Branch = {
        id: generateId(),
        name,
        parentId: prev.activeBranchId,
        parentEntryId: currentEntry.id,
        createdAt: Date.now(),
        entries: [{
          ...currentEntry,
          id: generateId(),
          action: `Branched from ${parentBranch.name}`,
        }],
        current: 0,
      };

      return {
        ...prev,
        branches: [...prev.branches, newBranch],
        activeBranchId: newBranch.id,
      };
    });
  }, []);

  // Switch branch
  const switchBranch = useCallback((branchId: string) => {
    setState(prev => ({
      ...prev,
      activeBranchId: branchId,
    }));
  }, []);

  // Delete branch
  const deleteBranch = useCallback((branchId: string) => {
    if (branchId === "main") return; // Can't delete main branch
    setState(prev => ({
      ...prev,
      branches: prev.branches.filter(b => b.id !== branchId),
      activeBranchId: prev.activeBranchId === branchId ? "main" : prev.activeBranchId,
    }));
  }, []);

  // Rename snapshot
  const renameSnapshot = useCallback((entryId: string, newName: string) => {
    setState(prev => ({
      ...prev,
      branches: prev.branches.map(b =>
        b.id === prev.activeBranchId
          ? {
              ...b,
              entries: b.entries.map(e =>
                e.id === entryId && e.snapshot
                  ? { ...e, snapshotName: newName, action: `Snapshot: ${newName}` }
                  : e
              ),
            }
          : b
      ),
    }));
  }, []);

  // Get all snapshots
  const snapshots = useMemo(() => 
    activeBranch.entries.filter(e => e.snapshot),
    [activeBranch]
  );

  // Clear history (keep only current state)
  const clearHistory = useCallback(() => {
    setState(prev => {
      const branch = prev.branches.find(b => b.id === prev.activeBranchId)!;
      const currentEntry = branch.entries[branch.current];
      
      return {
        ...prev,
        branches: prev.branches.map(b =>
          b.id === prev.activeBranchId
            ? { ...b, entries: [{ ...currentEntry, id: generateId() }], current: 0 }
            : b
        ),
      };
    });
  }, []);

  return {
    // Data
    data: currentData,
    state,
    activeBranch,
    snapshots,
    
    // Capabilities
    canUndo,
    canRedo,
    
    // Actions
    push,
    undo,
    redo,
    jumpTo,
    createSnapshot,
    createBranch,
    switchBranch,
    deleteBranch,
    renameSnapshot,
    clearHistory,
  };
}

// UI Component
export function UndoStackPanel({
  state,
  activeBranch,
  canUndo,
  canRedo,
  snapshots,
  onUndo,
  onRedo,
  onJumpTo,
  onCreateSnapshot,
  onCreateBranch,
  onSwitchBranch,
  onDeleteBranch,
  onRenameSnapshot,
  onClearHistory,
}: {
  state: UndoStackState;
  activeBranch: Branch;
  canUndo: boolean;
  canRedo: boolean;
  snapshots: HistoryEntry[];
  onUndo: () => void;
  onRedo: () => void;
  onJumpTo: (entryId: string) => void;
  onCreateSnapshot: (name: string) => void;
  onCreateBranch: (name: string) => void;
  onSwitchBranch: (branchId: string) => void;
  onDeleteBranch: (branchId: string) => void;
  onRenameSnapshot: (entryId: string, newName: string) => void;
  onClearHistory: () => void;
}) {
  const [showSnapshots, setShowSnapshots] = useState(true);
  const [showBranches, setShowBranches] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const [newSnapshotName, setNewSnapshotName] = useState("");
  const [newBranchName, setNewBranchName] = useState("");
  const [creatingSnapshot, setCreatingSnapshot] = useState(false);
  const [creatingBranch, setCreatingBranch] = useState(false);
  const [editingSnapshot, setEditingSnapshot] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Handle snapshot creation
  const handleCreateSnapshot = () => {
    if (newSnapshotName.trim()) {
      onCreateSnapshot(newSnapshotName.trim());
      setNewSnapshotName("");
      setCreatingSnapshot(false);
    }
  };

  // Handle branch creation
  const handleCreateBranch = () => {
    if (newBranchName.trim()) {
      onCreateBranch(newBranchName.trim());
      setNewBranchName("");
      setCreatingBranch(false);
    }
  };

  // Handle rename
  const handleRename = (entryId: string) => {
    if (editName.trim()) {
      onRenameSnapshot(entryId, editName.trim());
      setEditingSnapshot(null);
      setEditName("");
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Header with Undo/Redo */}
      <div className="p-4 border-b border-[#222]">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <History className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">History</h3>
            <p className="text-[10px] text-[#666]">
              {activeBranch.entries.length} changes • {snapshots.length} snapshots
            </p>
          </div>
        </div>

        {/* Undo/Redo Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-xs transition-all",
              canUndo
                ? "bg-[#1a1a1a] text-white hover:bg-[#222] border border-[#333]"
                : "bg-[#111] text-[#444] cursor-not-allowed border border-[#222]"
            )}
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-xs transition-all",
              canRedo
                ? "bg-[#1a1a1a] text-white hover:bg-[#222] border border-[#333]"
                : "bg-[#111] text-[#444] cursor-not-allowed border border-[#222]"
            )}
          >
            <Redo2 className="w-4 h-4" />
            Redo
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Snapshots Section */}
        <div className="border border-[#222] rounded-lg overflow-hidden">
          <button
            onClick={() => setShowSnapshots(!showSnapshots)}
            className="w-full flex items-center justify-between p-3 hover:bg-[#111] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#CDB49E]" />
              <span className="text-xs font-semibold text-white">Snapshots</span>
              <span className="text-[10px] text-[#555] bg-[#1a1a1a] px-1.5 py-0.5 rounded">
                {snapshots.length}
              </span>
            </div>
            {showSnapshots ? (
              <ChevronDown className="w-4 h-4 text-[#555]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#555]" />
            )}
          </button>

          {showSnapshots && (
            <div className="p-3 pt-0 space-y-2">
              {/* Create Snapshot */}
              {creatingSnapshot ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSnapshotName}
                    onChange={(e) => setNewSnapshotName(e.target.value)}
                    placeholder="Snapshot name..."
                    className="flex-1 px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleCreateSnapshot()}
                  />
                  <button
                    onClick={handleCreateSnapshot}
                    className="p-1.5 rounded bg-[#CDB49E] text-black"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setCreatingSnapshot(false)}
                    className="p-1.5 rounded text-[#666] hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCreatingSnapshot(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-[#333] text-xs text-[#888] hover:text-[#CDB49E] hover:border-[#CDB49E] transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Create Snapshot
                </button>
              )}

              {/* Snapshot List */}
              {snapshots.length > 0 ? (
                <div className="space-y-1.5">
                  {snapshots.map((snapshot) => (
                    <div
                      key={snapshot.id}
                      className="group flex items-center gap-2 p-2 rounded-lg bg-[#111] border border-[#222] hover:border-[#333] transition-colors"
                    >
                      <Tag className="w-3 h-3 text-[#CDB49E] shrink-0" />
                      
                      {editingSnapshot === snapshot.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-1 py-0.5 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white"
                          autoFocus
                          onKeyDown={(e) => e.key === "Enter" && handleRename(snapshot.id)}
                          onBlur={() => handleRename(snapshot.id)}
                        />
                      ) : (
                        <button
                          onClick={() => onJumpTo(snapshot.id)}
                          className="flex-1 text-left"
                        >
                          <span className="text-xs text-white">{snapshot.snapshotName}</span>
                          <p className="text-[10px] text-[#555]">{formatTime(snapshot.timestamp)}</p>
                        </button>
                      )}

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingSnapshot(snapshot.id);
                            setEditName(snapshot.snapshotName || "");
                          }}
                          className="p-1 text-[#666] hover:text-[#CDB49E] rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onJumpTo(snapshot.id)}
                          className="p-1 text-[#666] hover:text-white rounded"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-[#555] text-center py-2">
                  No snapshots yet. Create one to save your progress.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Branches Section */}
        <div className="border border-[#222] rounded-lg overflow-hidden">
          <button
            onClick={() => setShowBranches(!showBranches)}
            className="w-full flex items-center justify-between p-3 hover:bg-[#111] transition-colors"
          >
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-semibold text-white">Branches</span>
              <span className="text-[10px] text-[#555] bg-[#1a1a1a] px-1.5 py-0.5 rounded">
                {state.branches.length}
              </span>
            </div>
            {showBranches ? (
              <ChevronDown className="w-4 h-4 text-[#555]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#555]" />
            )}
          </button>

          {showBranches && (
            <div className="p-3 pt-0 space-y-2">
              {/* Create Branch */}
              {creatingBranch ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    placeholder="Branch name..."
                    className="flex-1 px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleCreateBranch()}
                  />
                  <button
                    onClick={handleCreateBranch}
                    className="p-1.5 rounded bg-violet-500 text-white"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setCreatingBranch(false)}
                    className="p-1.5 rounded text-[#666] hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCreatingBranch(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-[#333] text-xs text-[#888] hover:text-violet-400 hover:border-violet-400 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Create Branch
                </button>
              )}

              {/* Branch List */}
              <div className="space-y-1.5">
                {state.branches.map((branch) => (
                  <div
                    key={branch.id}
                    className={cn(
                      "group flex items-center gap-2 p-2 rounded-lg transition-colors",
                      branch.id === state.activeBranchId
                        ? "bg-violet-500/10 border border-violet-500/30"
                        : "bg-[#111] border border-[#222] hover:border-[#333]"
                    )}
                  >
                    <GitCommit className={cn(
                      "w-3 h-3 shrink-0",
                      branch.id === state.activeBranchId ? "text-violet-400" : "text-[#666]"
                    )} />
                    
                    <button
                      onClick={() => onSwitchBranch(branch.id)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-xs",
                          branch.id === state.activeBranchId ? "text-violet-400 font-medium" : "text-white"
                        )}>
                          {branch.name}
                        </span>
                        {branch.id === state.activeBranchId && (
                          <span className="text-[9px] text-violet-400 px-1.5 py-0.5 bg-violet-500/20 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#555]">
                        {branch.entries.length} changes • {formatTime(branch.createdAt)}
                      </p>
                    </button>

                    {branch.id !== "main" && (
                      <button
                        onClick={() => onDeleteBranch(branch.id)}
                        className="p-1 text-[#444] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        <div className="border border-[#222] rounded-lg overflow-hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between p-3 hover:bg-[#111] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-white">Recent History</span>
              <span className="text-[10px] text-[#555] bg-[#1a1a1a] px-1.5 py-0.5 rounded">
                {activeBranch.entries.length}
              </span>
            </div>
            {showHistory ? (
              <ChevronDown className="w-4 h-4 text-[#555]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#555]" />
            )}
          </button>

          {showHistory && (
            <div className="p-3 pt-0">
              <div className="space-y-1 max-h-60 overflow-auto">
                {[...activeBranch.entries].reverse().map((entry, idx) => {
                  const realIndex = activeBranch.entries.length - 1 - idx;
                  const isCurrent = realIndex === activeBranch.current;
                  
                  return (
                    <button
                      key={entry.id}
                      onClick={() => onJumpTo(entry.id)}
                      className={cn(
                        "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors",
                        isCurrent
                          ? "bg-blue-500/10 border border-blue-500/30"
                          : "hover:bg-[#111] border border-transparent"
                      )}
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        isCurrent ? "bg-blue-400" : realIndex < activeBranch.current ? "bg-[#333]" : "bg-[#222]"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-xs truncate",
                            isCurrent ? "text-blue-400 font-medium" : "text-white"
                          )}>
                            {entry.action}
                          </span>
                          {entry.snapshot && (
                            <Tag className="w-3 h-3 text-[#CDB49E] shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-[#555]">{formatTime(entry.timestamp)}</p>
                      </div>
                      {isCurrent && (
                        <span className="text-[9px] text-blue-400 px-1.5 py-0.5 bg-blue-500/20 rounded shrink-0">
                          NOW
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-[#222]">
        <button
          onClick={onClearHistory}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-[#666] hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <AlertTriangle className="w-3 h-3" />
          Clear History
        </button>
      </div>
    </div>
  );
}

export default UndoStackPanel;
