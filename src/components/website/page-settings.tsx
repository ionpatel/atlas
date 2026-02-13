"use client";

import { useState } from "react";
import { 
  X, Settings, Link, Lock, Calendar, Eye, EyeOff, Copy, Check,
  ExternalLink, AlertCircle, Clock, Globe, Shield, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE SETTINGS PANEL
   Slug, password protection, scheduling, visibility
   ═══════════════════════════════════════════════════════════════════════════ */

export interface PageSettings {
  slug: string;
  title: string;
  
  // Visibility
  visibility: "public" | "password" | "private";
  password?: string;
  
  // Scheduling
  scheduleEnabled: boolean;
  publishDate?: string;
  unpublishDate?: string;
  
  // Indexing
  noIndex: boolean;
  noFollow: boolean;
  
  // Social
  socialImage?: string;
  
  // Advanced
  customCanonical?: string;
  redirectUrl?: string;
  redirectType?: "301" | "302";
}

interface PageSettingsPanelProps {
  settings: PageSettings;
  onChange: (settings: PageSettings) => void;
  onClose: () => void;
  siteUrl?: string;
}

const DEFAULT_SETTINGS: PageSettings = {
  slug: "/",
  title: "Home",
  visibility: "public",
  scheduleEnabled: false,
  noIndex: false,
  noFollow: false,
};

export function PageSettingsPanel({ settings, onChange, onClose, siteUrl = "yoursite.com" }: PageSettingsPanelProps) {
  const currentSettings = { ...DEFAULT_SETTINGS, ...settings };
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<"general" | "visibility" | "schedule" | "advanced">("general");

  const handleChange = <K extends keyof PageSettings>(key: K, value: PageSettings[K]) => {
    onChange({ ...currentSettings, [key]: value });
  };

  const generateSlug = (title: string) => {
    return "/" + title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const fullUrl = `https://${siteUrl}${currentSettings.slug}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isScheduleValid = () => {
    if (!currentSettings.scheduleEnabled) return true;
    if (currentSettings.publishDate && currentSettings.unpublishDate) {
      return new Date(currentSettings.publishDate) < new Date(currentSettings.unpublishDate);
    }
    return true;
  };

  const sections = [
    { id: "general" as const, label: "General", icon: Settings },
    { id: "visibility" as const, label: "Visibility", icon: Eye },
    { id: "schedule" as const, label: "Schedule", icon: Calendar },
    { id: "advanced" as const, label: "Advanced", icon: Shield },
  ];

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#333]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#CDB49E]/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#CDB49E]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Page Settings</h2>
            <p className="text-xs text-[#666]">Configure page URL, access, and scheduling</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg text-[#666] hover:text-white hover:bg-[#222]">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#333]">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2",
              activeSection === section.id 
                ? "text-[#CDB49E] border-[#CDB49E]" 
                : "text-[#666] border-transparent hover:text-white"
            )}
          >
            <section.icon className="w-4 h-4" />
            {section.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* General */}
        {activeSection === "general" && (
          <>
            {/* Page Title */}
            <div>
              <label className="block text-xs font-medium text-[#888] mb-2">Page Title</label>
              <input
                type="text"
                value={currentSettings.title}
                onChange={e => handleChange("title", e.target.value)}
                placeholder="Home"
                className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#333] text-white placeholder:text-[#555] focus:border-[#CDB49E] focus:outline-none text-sm"
              />
            </div>

            {/* URL Slug */}
            <div>
              <label className="block text-xs font-medium text-[#888] mb-2">
                URL Slug
              </label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center rounded-lg bg-[#0a0a0a] border border-[#333] overflow-hidden">
                  <span className="px-3 py-2.5 text-sm text-[#555] bg-[#111] border-r border-[#333]">
                    {siteUrl}
                  </span>
                  <input
                    type="text"
                    value={currentSettings.slug}
                    onChange={e => handleChange("slug", e.target.value)}
                    placeholder="/"
                    className="flex-1 px-3 py-2.5 bg-transparent text-white placeholder:text-[#555] focus:outline-none text-sm"
                  />
                </div>
                <button
                  onClick={() => handleChange("slug", generateSlug(currentSettings.title))}
                  className="px-3 py-2 rounded-lg bg-[#222] text-[#888] hover:text-white text-xs"
                  title="Generate from title"
                >
                  Auto
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-[#555]">{fullUrl}</span>
                <button
                  onClick={handleCopyUrl}
                  className="p-1 rounded text-[#666] hover:text-white"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Social Image */}
            <div>
              <label className="block text-xs font-medium text-[#888] mb-2">
                Social Share Image
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentSettings.socialImage || ""}
                  onChange={e => handleChange("socialImage", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#333] text-white placeholder:text-[#555] focus:border-[#CDB49E] focus:outline-none text-sm"
                />
              </div>
              <p className="text-[10px] text-[#555] mt-1">
                Recommended: 1200x630px. Used when sharing on social media.
              </p>
            </div>
          </>
        )}

        {/* Visibility */}
        {activeSection === "visibility" && (
          <>
            <div className="space-y-3">
              {[
                { value: "public" as const, label: "Public", desc: "Anyone can view this page", icon: Globe },
                { value: "password" as const, label: "Password Protected", desc: "Require password to access", icon: Lock },
                { value: "private" as const, label: "Private", desc: "Only you can see this page", icon: EyeOff },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handleChange("visibility", option.value)}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all flex items-start gap-4",
                    currentSettings.visibility === option.value
                      ? "bg-[#CDB49E]/10 border-[#CDB49E]/50"
                      : "bg-[#1a1a1a] border-[#333] hover:border-[#444]"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    currentSettings.visibility === option.value ? "bg-[#CDB49E]/20" : "bg-[#222]"
                  )}>
                    <option.icon className={cn(
                      "w-5 h-5",
                      currentSettings.visibility === option.value ? "text-[#CDB49E]" : "text-[#666]"
                    )} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white block">{option.label}</span>
                    <span className="text-xs text-[#666]">{option.desc}</span>
                  </div>
                  {currentSettings.visibility === option.value && (
                    <Check className="w-5 h-5 text-[#CDB49E] ml-auto shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Password Input */}
            {currentSettings.visibility === "password" && (
              <div className="pt-2">
                <label className="block text-xs font-medium text-[#888] mb-2">Page Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={currentSettings.password || ""}
                    onChange={e => handleChange("password", e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-2.5 pr-10 rounded-lg bg-[#0a0a0a] border border-[#333] text-white placeholder:text-[#555] focus:border-[#CDB49E] focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {!currentSettings.password && (
                  <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Set a password to enable protection
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* Schedule */}
        {activeSection === "schedule" && (
          <>
            {/* Enable Scheduling */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#1a1a1a] border border-[#333]">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#CDB49E]" />
                <div>
                  <span className="text-sm font-medium text-white block">Schedule Publishing</span>
                  <span className="text-xs text-[#666]">Set when this page goes live</span>
                </div>
              </div>
              <button
                onClick={() => handleChange("scheduleEnabled", !currentSettings.scheduleEnabled)}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  currentSettings.scheduleEnabled ? "bg-[#CDB49E]" : "bg-[#333]"
                )}
              >
                <span className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                  currentSettings.scheduleEnabled ? "left-7" : "left-1"
                )} />
              </button>
            </div>

            {currentSettings.scheduleEnabled && (
              <div className="space-y-4 pt-2">
                {/* Publish Date */}
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-2">Publish Date</label>
                  <input
                    type="datetime-local"
                    value={currentSettings.publishDate || ""}
                    onChange={e => handleChange("publishDate", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#333] text-white focus:border-[#CDB49E] focus:outline-none text-sm [color-scheme:dark]"
                  />
                </div>

                {/* Unpublish Date */}
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-2">
                    Unpublish Date <span className="text-[#555]">(optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={currentSettings.unpublishDate || ""}
                    onChange={e => handleChange("unpublishDate", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#333] text-white focus:border-[#CDB49E] focus:outline-none text-sm [color-scheme:dark]"
                  />
                </div>

                {!isScheduleValid() && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-red-400">Unpublish date must be after publish date</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Advanced */}
        {activeSection === "advanced" && (
          <>
            {/* SEO Indexing */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#888] uppercase">Search Engine Indexing</h4>
              
              <label className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] border border-[#222] cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white">Hide from search engines</span>
                  <span className="text-[10px] text-[#555] px-2 py-0.5 rounded bg-[#222]">noindex</span>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.noIndex}
                  onChange={e => handleChange("noIndex", e.target.checked)}
                  className="w-4 h-4 rounded border-[#333] bg-[#0a0a0a] text-[#CDB49E] focus:ring-[#CDB49E] focus:ring-offset-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] border border-[#222] cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white">Don&apos;t follow links</span>
                  <span className="text-[10px] text-[#555] px-2 py-0.5 rounded bg-[#222]">nofollow</span>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.noFollow}
                  onChange={e => handleChange("noFollow", e.target.checked)}
                  className="w-4 h-4 rounded border-[#333] bg-[#0a0a0a] text-[#CDB49E] focus:ring-[#CDB49E] focus:ring-offset-0"
                />
              </label>
            </div>

            {/* Custom Canonical */}
            <div className="pt-4">
              <label className="block text-xs font-medium text-[#888] mb-2">
                Custom Canonical URL
                <span className="text-[#555] ml-1">(optional)</span>
              </label>
              <input
                type="text"
                value={currentSettings.customCanonical || ""}
                onChange={e => handleChange("customCanonical", e.target.value)}
                placeholder="https://example.com/original-page"
                className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#333] text-white placeholder:text-[#555] focus:border-[#CDB49E] focus:outline-none text-sm"
              />
              <p className="text-[10px] text-[#555] mt-1 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Use to indicate the preferred version of a page
              </p>
            </div>

            {/* Redirect */}
            <div className="pt-4">
              <label className="block text-xs font-medium text-[#888] mb-2">
                Redirect to URL
                <span className="text-[#555] ml-1">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentSettings.redirectUrl || ""}
                  onChange={e => handleChange("redirectUrl", e.target.value)}
                  placeholder="https://example.com/new-page"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#333] text-white placeholder:text-[#555] focus:border-[#CDB49E] focus:outline-none text-sm"
                />
                <select
                  value={currentSettings.redirectType || "301"}
                  onChange={e => handleChange("redirectType", e.target.value as "301" | "302")}
                  className="px-3 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#333] text-white text-sm"
                >
                  <option value="301">301 (Permanent)</option>
                  <option value="302">302 (Temporary)</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#333] flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-[#888] hover:text-white text-sm"
        >
          Cancel
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-[#CDB49E] text-black font-medium text-sm hover:bg-[#d4c0ad]"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
