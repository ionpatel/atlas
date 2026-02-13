"use client";

import { useState } from "react";
import { 
  Search, Globe, Image as ImageIcon, FileCode, Link2, Twitter, 
  Facebook, CheckCircle, AlertCircle, X, Eye, Sparkles,
  RefreshCw, Copy, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   ATLAS SEO SETTINGS PANEL
   Meta title, description, OG image, favicon, social previews
   ═══════════════════════════════════════════════════════════════════════════ */

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  favicon: string;
  canonicalUrl: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  twitterCard: "summary" | "summary_large_image";
  ogType: "website" | "article" | "product";
  keywords: string[];
}

interface SEOSettingsPanelProps {
  settings: SEOSettings;
  onChange: (settings: SEOSettings) => void;
  onClose?: () => void;
  siteName?: string;
  pageSlug?: string;
}

const defaultSEOSettings: SEOSettings = {
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  favicon: "",
  canonicalUrl: "",
  robotsIndex: true,
  robotsFollow: true,
  twitterCard: "summary_large_image",
  ogType: "website",
  keywords: [],
};

export function SEOSettingsPanel({ 
  settings = defaultSEOSettings, 
  onChange, 
  onClose, 
  siteName = "Your Site",
  pageSlug = "/"
}: SEOSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "social" | "advanced">("basic");
  const [keywordInput, setKeywordInput] = useState("");

  // SEO Score calculation
  const calculateSEOScore = () => {
    let score = 0;
    const issues: string[] = [];
    const passed: string[] = [];

    // Title checks
    if (settings.metaTitle) {
      if (settings.metaTitle.length >= 30 && settings.metaTitle.length <= 60) {
        score += 20;
        passed.push("Title length is optimal (30-60 chars)");
      } else {
        score += 10;
        issues.push(`Title is ${settings.metaTitle.length < 30 ? "too short" : "too long"} (${settings.metaTitle.length} chars)`);
      }
    } else {
      issues.push("Missing meta title");
    }

    // Description checks
    if (settings.metaDescription) {
      if (settings.metaDescription.length >= 120 && settings.metaDescription.length <= 160) {
        score += 20;
        passed.push("Description length is optimal (120-160 chars)");
      } else {
        score += 10;
        issues.push(`Description is ${settings.metaDescription.length < 120 ? "too short" : "too long"} (${settings.metaDescription.length} chars)`);
      }
    } else {
      issues.push("Missing meta description");
    }

    // OG Image
    if (settings.ogImage) {
      score += 20;
      passed.push("Open Graph image is set");
    } else {
      issues.push("Missing Open Graph image");
    }

    // Favicon
    if (settings.favicon) {
      score += 15;
      passed.push("Favicon is set");
    } else {
      issues.push("Missing favicon");
    }

    // Keywords
    if (settings.keywords.length >= 3) {
      score += 15;
      passed.push("Keywords are defined");
    } else if (settings.keywords.length > 0) {
      score += 5;
      issues.push("Add more keywords (at least 3)");
    } else {
      issues.push("No keywords defined");
    }

    // Robots
    if (settings.robotsIndex) {
      score += 10;
      passed.push("Page is indexable");
    }

    return { score: Math.min(score, 100), issues, passed };
  };

  const { score, issues, passed } = calculateSEOScore();

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !settings.keywords.includes(keywordInput.trim())) {
      onChange({ ...settings, keywords: [...settings.keywords, keywordInput.trim()] });
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    onChange({ ...settings, keywords: settings.keywords.filter(k => k !== keyword) });
  };

  const generateMetaDescription = () => {
    // Simple AI-style suggestion based on title
    if (settings.metaTitle) {
      const suggestion = `Discover ${settings.metaTitle.toLowerCase()} at ${siteName}. Learn more about our services and offerings.`;
      onChange({ ...settings, metaDescription: suggestion });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111] text-white">
      {/* Header */}
      <div className="p-4 border-b border-[#222] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#CDB49E]/10 flex items-center justify-center">
            <Search className="w-5 h-5 text-[#CDB49E]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">SEO Settings</h3>
            <p className="text-xs text-[#666]">Optimize for search engines</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* SEO Score */}
          <div className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-semibold",
            score >= 80 ? "bg-emerald-500/20 text-emerald-400" :
            score >= 50 ? "bg-amber-500/20 text-amber-400" :
            "bg-red-500/20 text-red-400"
          )}>
            {score}% SEO
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 text-[#666] hover:text-white rounded-lg hover:bg-[#1a1a1a]">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#222]">
        {[
          { id: "basic" as const, label: "Basic SEO", icon: Search },
          { id: "social" as const, label: "Social", icon: Globe },
          { id: "advanced" as const, label: "Advanced", icon: FileCode },
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
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {activeTab === "basic" && (
          <>
            {/* Meta Title */}
            <div>
              <label className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#888] uppercase">Meta Title</span>
                <span className={cn(
                  "text-[10px]",
                  settings.metaTitle.length > 60 ? "text-red-400" :
                  settings.metaTitle.length >= 30 ? "text-emerald-400" :
                  "text-amber-400"
                )}>
                  {settings.metaTitle.length}/60
                </span>
              </label>
              <input
                type="text"
                value={settings.metaTitle}
                onChange={(e) => onChange({ ...settings, metaTitle: e.target.value })}
                placeholder="Page title for search results"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-xl text-sm focus:border-[#CDB49E] focus:outline-none"
              />
              <p className="text-[10px] text-[#555] mt-1.5">Ideal: 30-60 characters</p>
            </div>

            {/* Meta Description */}
            <div>
              <label className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#888] uppercase">Meta Description</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={generateMetaDescription}
                    className="text-[10px] text-[#CDB49E] hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Generate
                  </button>
                  <span className={cn(
                    "text-[10px]",
                    settings.metaDescription.length > 160 ? "text-red-400" :
                    settings.metaDescription.length >= 120 ? "text-emerald-400" :
                    "text-amber-400"
                  )}>
                    {settings.metaDescription.length}/160
                  </span>
                </div>
              </label>
              <textarea
                value={settings.metaDescription}
                onChange={(e) => onChange({ ...settings, metaDescription: e.target.value })}
                placeholder="Brief description of this page for search results"
                rows={3}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-xl text-sm focus:border-[#CDB49E] focus:outline-none resize-none"
              />
              <p className="text-[10px] text-[#555] mt-1.5">Ideal: 120-160 characters</p>
            </div>

            {/* Keywords */}
            <div>
              <label className="text-xs font-semibold text-[#888] uppercase mb-2 block">Focus Keywords</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                  placeholder="Add keyword..."
                  className="flex-1 px-4 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm focus:border-[#CDB49E] focus:outline-none"
                />
                <button
                  onClick={handleAddKeyword}
                  className="px-4 py-2 bg-[#CDB49E] text-[#111] rounded-lg text-sm font-medium hover:bg-[#d4c0ad]"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.keywords.map(keyword => (
                  <span
                    key={keyword}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1a1a1a] border border-[#333] rounded-full text-xs"
                  >
                    {keyword}
                    <button onClick={() => handleRemoveKeyword(keyword)} className="text-[#666] hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Google Preview */}
            <div>
              <label className="text-xs font-semibold text-[#888] uppercase mb-3 block">Search Preview</label>
              <div className="p-4 bg-white rounded-xl">
                <div className="text-xs text-[#202124] mb-0.5 truncate">
                  yoursite.com{pageSlug}
                </div>
                <div className="text-lg text-[#1a0dab] hover:underline cursor-pointer truncate">
                  {settings.metaTitle || siteName}
                </div>
                <div className="text-sm text-[#4d5156] line-clamp-2 mt-0.5">
                  {settings.metaDescription || "No description provided. Add a meta description to improve your search result appearance."}
                </div>
              </div>
            </div>

            {/* SEO Checklist */}
            <div>
              <label className="text-xs font-semibold text-[#888] uppercase mb-3 block">SEO Checklist</label>
              <div className="space-y-2">
                {passed.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    {item}
                  </div>
                ))}
                {issues.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-amber-400">
                    <AlertCircle className="w-4 h-4" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "social" && (
          <>
            {/* Open Graph Image */}
            <div>
              <label className="text-xs font-semibold text-[#888] uppercase mb-2 block">
                Social Share Image (OG Image)
              </label>
              <div className="aspect-video bg-[#0a0a0a] border border-[#333] rounded-xl overflow-hidden relative">
                {settings.ogImage ? (
                  <>
                    <img src={settings.ogImage} alt="OG Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => onChange({ ...settings, ogImage: "" })}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white hover:bg-black/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <ImageIcon className="w-8 h-8 text-[#444] mb-2" />
                    <p className="text-xs text-[#666]">Recommended: 1200 x 630px</p>
                  </div>
                )}
              </div>
              <input
                type="text"
                value={settings.ogImage}
                onChange={(e) => onChange({ ...settings, ogImage: e.target.value })}
                placeholder="https://example.com/og-image.jpg"
                className="w-full px-4 py-2 mt-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm focus:border-[#CDB49E] focus:outline-none"
              />
            </div>

            {/* Twitter Card Type */}
            <div>
              <label className="text-xs font-semibold text-[#888] uppercase mb-2 block">Twitter Card Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "summary" as const, name: "Summary", desc: "Small image" },
                  { id: "summary_large_image" as const, name: "Large Image", desc: "Full-width image" },
                ].map(card => (
                  <button
                    key={card.id}
                    onClick={() => onChange({ ...settings, twitterCard: card.id })}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-colors",
                      settings.twitterCard === card.id
                        ? "border-[#CDB49E] bg-[#CDB49E]/10"
                        : "border-[#333] hover:border-[#444]"
                    )}
                  >
                    <Twitter className={cn(
                      "w-5 h-5 mb-2",
                      settings.twitterCard === card.id ? "text-[#CDB49E]" : "text-[#666]"
                    )} />
                    <div className="text-sm font-medium">{card.name}</div>
                    <div className="text-xs text-[#666]">{card.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* OG Type */}
            <div>
              <label className="text-xs font-semibold text-[#888] uppercase mb-2 block">Content Type</label>
              <select
                value={settings.ogType}
                onChange={(e) => onChange({ ...settings, ogType: e.target.value as any })}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-xl text-sm focus:border-[#CDB49E] focus:outline-none"
              >
                <option value="website">Website</option>
                <option value="article">Article</option>
                <option value="product">Product</option>
              </select>
            </div>

            {/* Facebook Preview */}
            <div>
              <label className="text-xs font-semibold text-[#888] uppercase mb-3 flex items-center gap-2">
                <Facebook className="w-4 h-4" /> Facebook Preview
              </label>
              <div className="border border-[#333] rounded-xl overflow-hidden">
                <div className="aspect-video bg-[#1a1a1a]">
                  {settings.ogImage ? (
                    <img src={settings.ogImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-[#444]">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="p-3 bg-[#f0f2f5]">
                  <div className="text-[10px] text-[#65676b] uppercase">YOURSITE.COM</div>
                  <div className="text-sm font-semibold text-[#1c1e21] truncate">
                    {settings.metaTitle || siteName}
                  </div>
                  <div className="text-xs text-[#65676b] line-clamp-1">
                    {settings.metaDescription || "Add a description"}
                  </div>
                </div>
              </div>
            </div>

            {/* Twitter Preview */}
            <div>
              <label className="text-xs font-semibold text-[#888] uppercase mb-3 flex items-center gap-2">
                <Twitter className="w-4 h-4" /> Twitter Preview
              </label>
              <div className="border border-[#333] rounded-2xl overflow-hidden">
                <div className={cn(
                  "bg-[#1a1a1a]",
                  settings.twitterCard === "summary_large_image" ? "aspect-[2/1]" : "w-32 h-32 float-left mr-3"
                )}>
                  {settings.ogImage ? (
                    <img src={settings.ogImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-[#444]">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className={cn(
                  "p-3",
                  settings.twitterCard !== "summary_large_image" && "min-h-[128px]"
                )}>
                  <div className="text-sm font-bold text-white truncate">
                    {settings.metaTitle || siteName}
                  </div>
                  <div className="text-xs text-[#888] line-clamp-2 mt-0.5">
                    {settings.metaDescription || "Add a description"}
                  </div>
                  <div className="text-xs text-[#888] mt-1 flex items-center gap-1">
                    <Link2 className="w-3 h-3" /> yoursite.com
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "advanced" && (
          <>
            {/* Favicon */}
            <div>
              <label className="text-xs font-semibold text-[#888] uppercase mb-2 block">Favicon</label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-[#0a0a0a] border border-[#333] rounded-xl flex items-center justify-center overflow-hidden">
                  {settings.favicon ? (
                    <img src={settings.favicon} alt="Favicon" className="w-8 h-8 object-contain" />
                  ) : (
                    <Globe className="w-6 h-6 text-[#444]" />
                  )}
                </div>
                <input
                  type="text"
                  value={settings.favicon}
                  onChange={(e) => onChange({ ...settings, favicon: e.target.value })}
                  placeholder="https://example.com/favicon.ico"
                  className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-xl text-sm focus:border-[#CDB49E] focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-[#555] mt-1.5">Recommended: 32x32px or 64x64px .ico or .png</p>
            </div>

            {/* Canonical URL */}
            <div>
              <label className="text-xs font-semibold text-[#888] uppercase mb-2 block">Canonical URL</label>
              <input
                type="text"
                value={settings.canonicalUrl}
                onChange={(e) => onChange({ ...settings, canonicalUrl: e.target.value })}
                placeholder="https://yoursite.com/page"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-xl text-sm focus:border-[#CDB49E] focus:outline-none"
              />
              <p className="text-[10px] text-[#555] mt-1.5">Prevents duplicate content issues</p>
            </div>

            {/* Robots Meta */}
            <div>
              <label className="text-xs font-semibold text-[#888] uppercase mb-3 block">Search Engine Indexing</label>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-[#333] rounded-xl cursor-pointer">
                  <div>
                    <div className="text-sm font-medium">Allow indexing</div>
                    <div className="text-xs text-[#666]">Search engines can index this page</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.robotsIndex}
                    onChange={(e) => onChange({ ...settings, robotsIndex: e.target.checked })}
                    className="w-5 h-5 rounded accent-[#CDB49E]"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-[#333] rounded-xl cursor-pointer">
                  <div>
                    <div className="text-sm font-medium">Follow links</div>
                    <div className="text-xs text-[#666]">Search engines can follow links on this page</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.robotsFollow}
                    onChange={(e) => onChange({ ...settings, robotsFollow: e.target.checked })}
                    className="w-5 h-5 rounded accent-[#CDB49E]"
                  />
                </label>
              </div>
            </div>

            {/* Generated Meta Tags */}
            <div>
              <label className="text-xs font-semibold text-[#888] uppercase mb-2 flex items-center justify-between">
                Generated Meta Tags
                <button className="text-[#CDB49E] text-[10px] flex items-center gap-1 hover:underline">
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </label>
              <pre className="p-4 bg-[#0a0a0a] border border-[#333] rounded-xl text-xs text-[#888] overflow-auto max-h-48 font-mono">
{`<title>${settings.metaTitle || siteName}</title>
<meta name="description" content="${settings.metaDescription}" />
<meta name="keywords" content="${settings.keywords.join(", ")}" />
<meta name="robots" content="${settings.robotsIndex ? "index" : "noindex"}, ${settings.robotsFollow ? "follow" : "nofollow"}" />
${settings.canonicalUrl ? `<link rel="canonical" href="${settings.canonicalUrl}" />` : ""}

<!-- Open Graph -->
<meta property="og:type" content="${settings.ogType}" />
<meta property="og:title" content="${settings.metaTitle || siteName}" />
<meta property="og:description" content="${settings.metaDescription}" />
${settings.ogImage ? `<meta property="og:image" content="${settings.ogImage}" />` : ""}

<!-- Twitter -->
<meta name="twitter:card" content="${settings.twitterCard}" />
<meta name="twitter:title" content="${settings.metaTitle || siteName}" />
<meta name="twitter:description" content="${settings.metaDescription}" />
${settings.ogImage ? `<meta name="twitter:image" content="${settings.ogImage}" />` : ""}

${settings.favicon ? `<link rel="icon" href="${settings.favicon}" />` : ""}`}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SEOSettingsPanel;
