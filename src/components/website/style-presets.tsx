"use client";

import { useState } from "react";
import { 
  Palette, Save, Download, Upload, Trash2, Check, Plus, X,
  Type, Droplets, RefreshCw, Star, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   ATLAS GLOBAL STYLE PRESETS
   Save/Load color themes, font combos, and site-wide styles
   ═══════════════════════════════════════════════════════════════════════════ */

export interface StylePreset {
  id: string;
  name: string;
  createdAt: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  borderRadius: string;
  spacing: "compact" | "normal" | "relaxed";
}

interface StylePresetsProps {
  currentPreset: StylePreset;
  onApplyPreset: (preset: StylePreset) => void;
  onClose?: () => void;
}

// Built-in presets
const BUILT_IN_PRESETS: Omit<StylePreset, "id" | "createdAt">[] = [
  {
    name: "Atlas Dark Gold",
    colors: {
      primary: "#CDB49E",
      secondary: "#111111",
      accent: "#d4c0ad",
      background: "#0a0a0a",
      surface: "#111111",
      text: "#ffffff",
      textMuted: "#888888",
      border: "#222222",
    },
    fonts: { heading: "Inter", body: "Inter", mono: "JetBrains Mono" },
    borderRadius: "12px",
    spacing: "normal",
  },
  {
    name: "Minimal Light",
    colors: {
      primary: "#000000",
      secondary: "#f5f5f5",
      accent: "#333333",
      background: "#ffffff",
      surface: "#fafafa",
      text: "#111111",
      textMuted: "#666666",
      border: "#eeeeee",
    },
    fonts: { heading: "Inter", body: "Inter", mono: "SF Mono" },
    borderRadius: "8px",
    spacing: "relaxed",
  },
  {
    name: "Ocean Blue",
    colors: {
      primary: "#0ea5e9",
      secondary: "#0f172a",
      accent: "#38bdf8",
      background: "#020617",
      surface: "#0f172a",
      text: "#f1f5f9",
      textMuted: "#94a3b8",
      border: "#1e293b",
    },
    fonts: { heading: "Plus Jakarta Sans", body: "Inter", mono: "Fira Code" },
    borderRadius: "16px",
    spacing: "normal",
  },
  {
    name: "Purple Haze",
    colors: {
      primary: "#8b5cf6",
      secondary: "#1a1625",
      accent: "#a78bfa",
      background: "#0f0a1a",
      surface: "#1a1625",
      text: "#ffffff",
      textMuted: "#a1a1aa",
      border: "#27212e",
    },
    fonts: { heading: "Space Grotesk", body: "Inter", mono: "JetBrains Mono" },
    borderRadius: "20px",
    spacing: "normal",
  },
  {
    name: "Forest Green",
    colors: {
      primary: "#22c55e",
      secondary: "#0a1f0a",
      accent: "#4ade80",
      background: "#030a03",
      surface: "#0a1f0a",
      text: "#ecfdf5",
      textMuted: "#86efac",
      border: "#14532d",
    },
    fonts: { heading: "DM Sans", body: "Inter", mono: "IBM Plex Mono" },
    borderRadius: "10px",
    spacing: "compact",
  },
  {
    name: "Rose Elegant",
    colors: {
      primary: "#f43f5e",
      secondary: "#1f1115",
      accent: "#fb7185",
      background: "#0f0809",
      surface: "#1f1115",
      text: "#fff1f2",
      textMuted: "#fda4af",
      border: "#4c1d24",
    },
    fonts: { heading: "Playfair Display", body: "Source Sans Pro", mono: "Fira Code" },
    borderRadius: "4px",
    spacing: "relaxed",
  },
  {
    name: "Warm Sunset",
    colors: {
      primary: "#f97316",
      secondary: "#1c1412",
      accent: "#fb923c",
      background: "#0c0906",
      surface: "#1c1412",
      text: "#fff7ed",
      textMuted: "#fdba74",
      border: "#431407",
    },
    fonts: { heading: "Outfit", body: "Inter", mono: "Menlo" },
    borderRadius: "14px",
    spacing: "normal",
  },
  {
    name: "Corporate Blue",
    colors: {
      primary: "#2563eb",
      secondary: "#f8fafc",
      accent: "#3b82f6",
      background: "#ffffff",
      surface: "#f1f5f9",
      text: "#0f172a",
      textMuted: "#64748b",
      border: "#e2e8f0",
    },
    fonts: { heading: "Inter", body: "Inter", mono: "SF Mono" },
    borderRadius: "6px",
    spacing: "compact",
  },
];

const FONT_OPTIONS = [
  "Inter",
  "Plus Jakarta Sans",
  "Space Grotesk",
  "DM Sans",
  "Outfit",
  "Playfair Display",
  "Source Sans Pro",
  "Poppins",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Raleway",
  "Work Sans",
];

const MONO_FONT_OPTIONS = [
  "JetBrains Mono",
  "Fira Code",
  "SF Mono",
  "IBM Plex Mono",
  "Source Code Pro",
  "Monaco",
  "Menlo",
];

const STORAGE_KEY = "atlas-style-presets";

export function StylePresetsPanel({ currentPreset, onApplyPreset, onClose }: StylePresetsProps) {
  const [activeTab, setActiveTab] = useState<"presets" | "customize" | "saved">("presets");
  const [savedPresets, setSavedPresets] = useState<StylePreset[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [customPreset, setCustomPreset] = useState<StylePreset>(currentPreset);
  const [presetName, setPresetName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Save presets to localStorage
  const savePresetsToStorage = (presets: StylePreset[]) => {
    setSavedPresets(presets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  };

  // Save current customization as a preset
  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    
    const newPreset: StylePreset = {
      ...customPreset,
      id: `preset-${Date.now()}`,
      name: presetName.trim(),
      createdAt: new Date().toISOString(),
    };
    
    savePresetsToStorage([newPreset, ...savedPresets]);
    setPresetName("");
    setShowSaveDialog(false);
    setActiveTab("saved");
  };

  // Delete a saved preset
  const handleDeletePreset = (id: string) => {
    savePresetsToStorage(savedPresets.filter(p => p.id !== id));
  };

  // Export preset as JSON
  const handleExportPreset = (preset: StylePreset) => {
    const blob = new Blob([JSON.stringify(preset, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${preset.name.toLowerCase().replace(/\s+/g, "-")}-preset.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import preset from JSON
  const handleImportPreset = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const preset = JSON.parse(event.target?.result as string) as StylePreset;
        preset.id = `preset-${Date.now()}`;
        preset.createdAt = new Date().toISOString();
        savePresetsToStorage([preset, ...savedPresets]);
      } catch (err) {
        console.error("Failed to import preset:", err);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const updateCustomColor = (key: keyof StylePreset["colors"], value: string) => {
    setCustomPreset(prev => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
  };

  const updateCustomFont = (key: keyof StylePreset["fonts"], value: string) => {
    setCustomPreset(prev => ({
      ...prev,
      fonts: { ...prev.fonts, [key]: value },
    }));
  };

  return (
    <div className="flex flex-col h-full bg-[#111] text-white">
      {/* Header */}
      <div className="p-4 border-b border-[#222] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#CDB49E]/10 flex items-center justify-center">
            <Palette className="w-5 h-5 text-[#CDB49E]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Style Presets</h3>
            <p className="text-xs text-[#666]">Colors, fonts & themes</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 text-[#666] hover:text-white rounded-lg hover:bg-[#1a1a1a]">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#222]">
        {[
          { id: "presets" as const, label: "Built-in", icon: Sparkles },
          { id: "customize" as const, label: "Customize", icon: Droplets },
          { id: "saved" as const, label: "Saved", icon: Star },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors",
              activeTab === tab.id
                ? "text-[#CDB49E] border-b-2 border-[#CDB49E]"
                : "text-[#666] hover:text-white"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.id === "saved" && savedPresets.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-[#CDB49E]/20 text-[#CDB49E] rounded-full">
                {savedPresets.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === "presets" && (
          <div className="grid grid-cols-2 gap-3">
            {BUILT_IN_PRESETS.map((preset, i) => (
              <button
                key={i}
                onClick={() => {
                  const fullPreset: StylePreset = {
                    ...preset,
                    id: `builtin-${i}`,
                    createdAt: new Date().toISOString(),
                  };
                  setCustomPreset(fullPreset);
                  onApplyPreset(fullPreset);
                }}
                className="group p-3 rounded-xl border border-[#333] hover:border-[#CDB49E] transition-all text-left"
              >
                {/* Color Preview */}
                <div className="flex gap-1 mb-3">
                  {[preset.colors.primary, preset.colors.secondary, preset.colors.accent, preset.colors.background].map((color, j) => (
                    <div
                      key={j}
                      className="w-6 h-6 rounded-full border border-[#333]"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="text-xs font-medium group-hover:text-[#CDB49E] transition-colors">{preset.name}</div>
                <div className="text-[10px] text-[#666] mt-0.5">{preset.fonts.heading}</div>
              </button>
            ))}
          </div>
        )}

        {activeTab === "customize" && (
          <div className="space-y-6">
            {/* Color Palette */}
            <div>
              <h4 className="text-xs font-semibold text-[#888] uppercase mb-3 flex items-center gap-2">
                <Droplets className="w-4 h-4" /> Color Palette
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(customPreset.colors).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-[10px] text-[#666] capitalize mb-1 block">
                      {key.replace(/([A-Z])/g, " $1")}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => updateCustomColor(key as keyof StylePreset["colors"], e.target.value)}
                        className="w-10 h-10 rounded-lg border border-[#333] bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateCustomColor(key as keyof StylePreset["colors"], e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div>
              <h4 className="text-xs font-semibold text-[#888] uppercase mb-3 flex items-center gap-2">
                <Type className="w-4 h-4" /> Typography
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-[#666] mb-1 block">Heading Font</label>
                  <select
                    value={customPreset.fonts.heading}
                    onChange={(e) => updateCustomFont("heading", e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm"
                  >
                    {FONT_OPTIONS.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#666] mb-1 block">Body Font</label>
                  <select
                    value={customPreset.fonts.body}
                    onChange={(e) => updateCustomFont("body", e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm"
                  >
                    {FONT_OPTIONS.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#666] mb-1 block">Monospace Font</label>
                  <select
                    value={customPreset.fonts.mono}
                    onChange={(e) => updateCustomFont("mono", e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm"
                  >
                    {MONO_FONT_OPTIONS.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Border Radius */}
            <div>
              <label className="text-[10px] text-[#666] mb-1 block">Border Radius</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={parseInt(customPreset.borderRadius)}
                  onChange={(e) => setCustomPreset(prev => ({ ...prev, borderRadius: `${e.target.value}px` }))}
                  className="flex-1 accent-[#CDB49E]"
                />
                <span className="text-xs text-white w-12">{customPreset.borderRadius}</span>
              </div>
            </div>

            {/* Spacing */}
            <div>
              <label className="text-[10px] text-[#666] mb-2 block">Spacing</label>
              <div className="flex gap-2">
                {(["compact", "normal", "relaxed"] as const).map(spacing => (
                  <button
                    key={spacing}
                    onClick={() => setCustomPreset(prev => ({ ...prev, spacing }))}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-medium capitalize border transition-colors",
                      customPreset.spacing === spacing
                        ? "bg-[#CDB49E]/10 border-[#CDB49E] text-[#CDB49E]"
                        : "border-[#333] text-[#888] hover:text-white"
                    )}
                  >
                    {spacing}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="text-[10px] text-[#666] mb-2 block">Preview</label>
              <div
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: customPreset.colors.background,
                  borderRadius: customPreset.borderRadius,
                }}
              >
                <div
                  className="p-4 rounded-lg mb-3"
                  style={{
                    backgroundColor: customPreset.colors.surface,
                    border: `1px solid ${customPreset.colors.border}`,
                    borderRadius: customPreset.borderRadius,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: customPreset.fonts.heading,
                      color: customPreset.colors.text,
                      fontSize: "18px",
                      fontWeight: 600,
                      marginBottom: "8px",
                    }}
                  >
                    Preview Heading
                  </h3>
                  <p
                    style={{
                      fontFamily: customPreset.fonts.body,
                      color: customPreset.colors.textMuted,
                      fontSize: "14px",
                    }}
                  >
                    This is sample body text demonstrating your typography choices.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    style={{
                      backgroundColor: customPreset.colors.primary,
                      color: customPreset.colors.background,
                      padding: "10px 20px",
                      borderRadius: customPreset.borderRadius,
                      fontFamily: customPreset.fonts.body,
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    Primary Button
                  </button>
                  <button
                    style={{
                      border: `2px solid ${customPreset.colors.border}`,
                      color: customPreset.colors.text,
                      padding: "10px 20px",
                      borderRadius: customPreset.borderRadius,
                      fontFamily: customPreset.fonts.body,
                      fontSize: "14px",
                      background: "transparent",
                    }}
                  >
                    Secondary
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onApplyPreset(customPreset)}
                className="flex-1 py-3 bg-[#CDB49E] text-[#111] rounded-xl text-sm font-semibold hover:bg-[#d4c0ad] flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Apply Theme
              </button>
              <button
                onClick={() => setShowSaveDialog(true)}
                className="px-4 py-3 border border-[#333] rounded-xl text-sm font-medium hover:border-[#444] flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
              </button>
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-[#1a1a1a] rounded-2xl p-6 w-80 border border-[#333]">
                  <h4 className="text-lg font-semibold mb-4">Save Preset</h4>
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Preset name..."
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-xl text-sm mb-4 focus:border-[#CDB49E] focus:outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSaveDialog(false)}
                      className="flex-1 py-2 border border-[#333] rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePreset}
                      className="flex-1 py-2 bg-[#CDB49E] text-[#111] rounded-lg text-sm font-semibold"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="space-y-4">
            {/* Import/Export */}
            <div className="flex gap-2 mb-4">
              <label className="flex-1 py-2 border border-dashed border-[#333] rounded-lg text-xs text-[#888] text-center cursor-pointer hover:border-[#444] flex items-center justify-center gap-1.5">
                <Upload className="w-4 h-4" /> Import Preset
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportPreset}
                  className="hidden"
                />
              </label>
            </div>

            {savedPresets.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-[#333] mx-auto mb-3" />
                <p className="text-sm text-[#666]">No saved presets</p>
                <p className="text-xs text-[#555]">Customize and save your own themes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedPresets.map(preset => (
                  <div
                    key={preset.id}
                    className="p-4 rounded-xl border border-[#333] hover:border-[#444] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm font-medium">{preset.name}</div>
                        <div className="text-[10px] text-[#666]">
                          {new Date(preset.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleExportPreset(preset)}
                          className="p-1.5 text-[#666] hover:text-white rounded"
                          title="Export"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePreset(preset.id)}
                          className="p-1.5 text-[#666] hover:text-red-400 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-3">
                      {[preset.colors.primary, preset.colors.secondary, preset.colors.accent, preset.colors.background].map((color, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full border border-[#333]"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setCustomPreset(preset);
                        onApplyPreset(preset);
                      }}
                      className="w-full py-2 bg-[#CDB49E]/10 text-[#CDB49E] rounded-lg text-xs font-medium hover:bg-[#CDB49E]/20"
                    >
                      Apply Preset
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StylePresetsPanel;
