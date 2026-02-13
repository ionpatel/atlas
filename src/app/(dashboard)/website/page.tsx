"use client";

import { useEffect, useState } from "react";
import { useWebsiteStore, BlockType } from "@/stores/website-store";
import {
  Globe,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  GripVertical,
  Layout,
  Type,
  Image,
  Users,
  DollarSign,
  MessageSquare,
  Mail,
  Grid,
  Star,
  Zap,
  ExternalLink,
  Palette,
  FileText,
  Home,
  Monitor,
  Smartphone,
  Tablet,
  Wand2,
  Check,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Settings2,
  Paintbrush,
  LayoutTemplate,
  X,
  Play,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════ THEMES ═══════════════════════ */

const THEMES = [
  {
    id: "atlas-dark",
    name: "Atlas Dark",
    category: "Business",
    preview: "linear-gradient(135deg, #111 0%, #1a1a1a 100%)",
    colors: { primary: "#CDB49E", secondary: "#111111", accent: "#f5f0eb", background: "#0a0a0a", text: "#ffffff" },
    fonts: { heading: "Inter", body: "Inter" },
    borderRadius: "12px",
    popular: true,
  },
  {
    id: "minimal-light",
    name: "Minimal Light",
    category: "Clean",
    preview: "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
    colors: { primary: "#000000", secondary: "#ffffff", accent: "#666666", background: "#ffffff", text: "#111111" },
    fonts: { heading: "Inter", body: "Inter" },
    borderRadius: "8px",
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    category: "SaaS",
    preview: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
    colors: { primary: "#0ea5e9", secondary: "#0c4a6e", accent: "#38bdf8", background: "#0f172a", text: "#f8fafc" },
    fonts: { heading: "Plus Jakarta Sans", body: "Inter" },
    borderRadius: "16px",
    popular: true,
  },
  {
    id: "emerald-pro",
    name: "Emerald Pro",
    category: "Finance",
    preview: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    colors: { primary: "#10b981", secondary: "#064e3b", accent: "#34d399", background: "#0d1117", text: "#f0fdf4" },
    fonts: { heading: "Manrope", body: "Inter" },
    borderRadius: "12px",
  },
  {
    id: "violet-dream",
    name: "Violet Dream",
    category: "Creative",
    preview: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    colors: { primary: "#8b5cf6", secondary: "#2e1065", accent: "#a78bfa", background: "#0f0720", text: "#faf5ff" },
    fonts: { heading: "Space Grotesk", body: "Inter" },
    borderRadius: "20px",
  },
  {
    id: "sunset-warm",
    name: "Sunset Warm",
    category: "Lifestyle",
    preview: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    colors: { primary: "#f97316", secondary: "#431407", accent: "#fb923c", background: "#1c1917", text: "#fff7ed" },
    fonts: { heading: "DM Sans", body: "Inter" },
    borderRadius: "14px",
  },
  {
    id: "rose-elegant",
    name: "Rose Elegant",
    category: "Fashion",
    preview: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
    colors: { primary: "#f43f5e", secondary: "#4c0519", accent: "#fb7185", background: "#0f0506", text: "#fff1f2" },
    fonts: { heading: "Playfair Display", body: "Lato" },
    borderRadius: "4px",
    popular: true,
  },
  {
    id: "nordic-snow",
    name: "Nordic Snow",
    category: "Clean",
    preview: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
    colors: { primary: "#475569", secondary: "#f8fafc", accent: "#64748b", background: "#ffffff", text: "#0f172a" },
    fonts: { heading: "Outfit", body: "Inter" },
    borderRadius: "6px",
  },
];

const FONT_OPTIONS = [
  "Inter", "Plus Jakarta Sans", "Manrope", "Space Grotesk", "DM Sans", 
  "Outfit", "Poppins", "Lato", "Playfair Display", "Montserrat"
];

const RADIUS_OPTIONS = ["0px", "4px", "8px", "12px", "16px", "20px", "9999px"];

/* ═══════════════════════ COMPONENTS ═══════════════════════ */

const blockIcons: Record<BlockType, React.ComponentType<{ className?: string }>> = {
  hero: Zap,
  features: Grid,
  pricing: DollarSign,
  testimonials: MessageSquare,
  cta: Star,
  gallery: Image,
  contact: Mail,
  text: Type,
  products: Layout,
  team: Users,
};

const blockLabels: Record<BlockType, string> = {
  hero: "Hero Section",
  features: "Features",
  pricing: "Pricing Table",
  testimonials: "Testimonials",
  cta: "Call to Action",
  gallery: "Gallery",
  contact: "Contact Form",
  text: "Text Block",
  products: "Products",
  team: "Team Members",
};

/* ─────────── Theme Card ─────────── */
function ThemeCard({ 
  theme, 
  isActive, 
  onSelect 
}: { 
  theme: typeof THEMES[0]; 
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative rounded-xl overflow-hidden border-2 transition-all duration-200",
        isActive 
          ? "border-[#CDB49E] ring-2 ring-[#CDB49E]/20" 
          : "border-[#2a2a2a] hover:border-[#444]"
      )}
    >
      {/* Preview */}
      <div 
        className="h-32 w-full relative"
        style={{ background: theme.preview }}
      >
        {/* Mock content */}
        <div className="absolute inset-4 flex flex-col items-center justify-center">
          <div 
            className="w-16 h-2 rounded-full mb-2" 
            style={{ backgroundColor: theme.colors.primary }}
          />
          <div className="w-24 h-1.5 rounded-full bg-white/30" />
          <div className="w-20 h-1.5 rounded-full bg-white/20 mt-1" />
          <div 
            className="w-12 h-5 rounded mt-3" 
            style={{ backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius }}
          />
        </div>
        
        {theme.popular && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/90 text-[10px] font-bold text-black">
            POPULAR
          </div>
        )}
        
        {isActive && (
          <div className="absolute inset-0 bg-[#CDB49E]/20 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#CDB49E] flex items-center justify-center">
              <Check className="w-5 h-5 text-black" />
            </div>
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-3 bg-[#111]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">{theme.name}</span>
          <span className="text-[10px] text-[#888] px-2 py-0.5 rounded-full bg-[#222]">
            {theme.category}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ─────────── Color Picker ─────────── */
function ColorPicker({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#888]">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg border border-[#333] bg-transparent cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white font-mono"
        />
      </div>
    </div>
  );
}

/* ─────────── Section Accordion ─────────── */
function Accordion({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false 
}: { 
  title: string; 
  icon: React.ComponentType<{ className?: string }>; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-[#2a2a2a] rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-[#111] hover:bg-[#1a1a1a] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-[#CDB49E]" />
          <span className="text-sm font-medium text-white">{title}</span>
        </div>
        <ChevronRight className={cn(
          "w-4 h-4 text-[#555] transition-transform",
          isOpen && "rotate-90"
        )} />
      </button>
      {isOpen && (
        <div className="p-4 border-t border-[#2a2a2a] bg-[#0a0a0a] space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */

export default function WebsitePage() {
  const {
    pages,
    settings,
    currentPage,
    selectedBlock,
    previewMode,
    fetchPages,
    createPage,
    setCurrentPage,
    publishPage,
    addBlock,
    updateBlock,
    deleteBlock,
    selectBlock,
    duplicateBlock,
    togglePreview,
  } = useWebsiteStore();

  const [activeTab, setActiveTab] = useState<"pages" | "themes" | "styles">("pages");
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [customColors, setCustomColors] = useState(THEMES[0].colors);
  const [customFonts, setCustomFonts] = useState(THEMES[0].fonts);
  const [customRadius, setCustomRadius] = useState(THEMES[0].borderRadius);
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showNewPage, setShowNewPage] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");

  useEffect(() => {
    fetchPages("org1");
  }, [fetchPages]);

  const handleCreatePage = () => {
    if (!newPageTitle.trim()) return;
    createPage({
      title: newPageTitle,
      slug: `/${newPageTitle.toLowerCase().replace(/\s+/g, "-")}`,
    });
    setNewPageTitle("");
    setShowNewPage(false);
  };

  const handleAddBlock = (type: BlockType) => {
    if (currentPage) {
      addBlock(currentPage.id, type);
      setShowAddBlock(false);
    }
  };

  const handleSelectTheme = (theme: typeof THEMES[0]) => {
    setSelectedTheme(theme);
    setCustomColors(theme.colors);
    setCustomFonts(theme.fonts);
    setCustomRadius(theme.borderRadius);
  };

  const currentBlock = currentPage?.blocks.find((b) => b.id === selectedBlock);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left Sidebar */}
      <div className="w-72 bg-[#111] border-r border-[#222] flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-[#222]">
          {[
            { id: "pages" as const, icon: FileText, label: "Pages" },
            { id: "themes" as const, icon: LayoutTemplate, label: "Themes" },
            { id: "styles" as const, icon: Paintbrush, label: "Styles" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors",
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

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {/* Pages Tab */}
          {activeTab === "pages" && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#555] uppercase tracking-wider">Site Pages</h3>
                <button
                  onClick={() => setShowNewPage(true)}
                  className="w-6 h-6 rounded-lg bg-[#CDB49E]/10 flex items-center justify-center text-[#CDB49E] hover:bg-[#CDB49E]/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="space-y-1">
                {pages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => setCurrentPage(page.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl text-left transition-all",
                      currentPage?.id === page.id
                        ? "bg-[#CDB49E]/10 border border-[#CDB49E]/30"
                        : "hover:bg-[#1a1a1a] border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      {page.is_homepage ? (
                        <Home className="w-4 h-4 text-[#CDB49E]" />
                      ) : (
                        <FileText className="w-4 h-4 text-[#555]" />
                      )}
                      <span className="text-sm text-white">{page.title}</span>
                    </div>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full",
                      page.is_published 
                        ? "bg-emerald-500/10 text-emerald-400" 
                        : "bg-[#333] text-[#666]"
                    )}>
                      {page.is_published ? "Live" : "Draft"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Themes Tab */}
          {activeTab === "themes" && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#555] uppercase tracking-wider">Choose Theme</h3>
                <span className="text-[10px] text-[#666]">{THEMES.length} themes</span>
              </div>
              
              <div className="space-y-3">
                {THEMES.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isActive={selectedTheme.id === theme.id}
                    onSelect={() => handleSelectTheme(theme)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Styles Tab */}
          {activeTab === "styles" && (
            <div className="p-4 space-y-3">
              {/* Colors */}
              <Accordion title="Colors" icon={Palette} defaultOpen>
                <ColorPicker 
                  label="Primary" 
                  value={customColors.primary} 
                  onChange={(v) => setCustomColors(c => ({ ...c, primary: v }))} 
                />
                <ColorPicker 
                  label="Secondary" 
                  value={customColors.secondary} 
                  onChange={(v) => setCustomColors(c => ({ ...c, secondary: v }))} 
                />
                <ColorPicker 
                  label="Accent" 
                  value={customColors.accent} 
                  onChange={(v) => setCustomColors(c => ({ ...c, accent: v }))} 
                />
                <ColorPicker 
                  label="Background" 
                  value={customColors.background} 
                  onChange={(v) => setCustomColors(c => ({ ...c, background: v }))} 
                />
                <ColorPicker 
                  label="Text" 
                  value={customColors.text} 
                  onChange={(v) => setCustomColors(c => ({ ...c, text: v }))} 
                />
              </Accordion>

              {/* Typography */}
              <Accordion title="Typography" icon={Type}>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[#666] mb-1.5 block">Heading Font</label>
                    <select
                      value={customFonts.heading}
                      onChange={(e) => setCustomFonts(f => ({ ...f, heading: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white"
                    >
                      {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[#666] mb-1.5 block">Body Font</label>
                    <select
                      value={customFonts.body}
                      onChange={(e) => setCustomFonts(f => ({ ...f, body: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white"
                    >
                      {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              </Accordion>

              {/* Border Radius */}
              <Accordion title="Border Radius" icon={Settings2}>
                <div className="flex flex-wrap gap-2">
                  {RADIUS_OPTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setCustomRadius(r)}
                      className={cn(
                        "px-3 py-1.5 text-xs rounded-lg border transition-colors",
                        customRadius === r
                          ? "bg-[#CDB49E]/10 border-[#CDB49E] text-[#CDB49E]"
                          : "bg-[#1a1a1a] border-[#333] text-[#888] hover:border-[#444]"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </Accordion>

              {/* AI Generate */}
              <button className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 text-violet-300 hover:from-violet-600/30 hover:to-fuchsia-600/30 transition-all">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Generate with AI</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {currentPage ? (
          <>
            {/* Toolbar */}
            <div className="h-14 bg-[#111] border-b border-[#222] flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <h1 className="font-semibold text-white">{currentPage.title}</h1>
                <span className="text-xs text-[#555] px-2 py-1 rounded-lg bg-[#1a1a1a]">{currentPage.slug}</span>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Device Preview */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
                  {[
                    { id: "desktop" as const, icon: Monitor },
                    { id: "tablet" as const, icon: Tablet },
                    { id: "mobile" as const, icon: Smartphone },
                  ].map((device) => (
                    <button
                      key={device.id}
                      onClick={() => setDevicePreview(device.id)}
                      className={cn(
                        "p-2 rounded-md transition-colors",
                        devicePreview === device.id
                          ? "bg-[#CDB49E]/10 text-[#CDB49E]"
                          : "text-[#555] hover:text-white"
                      )}
                    >
                      <device.icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>

                <div className="w-px h-6 bg-[#333]" />

                <button
                  onClick={togglePreview}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                    previewMode
                      ? "bg-[#CDB49E]/10 text-[#CDB49E]"
                      : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
                  )}
                >
                  {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {previewMode ? "Edit" : "Preview"}
                </button>

                <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  View
                </button>

                <button
                  onClick={() => publishPage(currentPage.id, !currentPage.is_published)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    currentPage.is_published
                      ? "bg-[#333] text-white hover:bg-[#444]"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  )}
                >
                  {currentPage.is_published ? "Unpublish" : "Publish"}
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div 
              className="flex-1 overflow-auto p-8"
              style={{ backgroundColor: customColors.background }}
            >
              <div className={cn(
                "mx-auto transition-all duration-300",
                devicePreview === "desktop" && "max-w-5xl",
                devicePreview === "tablet" && "max-w-2xl",
                devicePreview === "mobile" && "max-w-sm"
              )}>
                {currentPage.blocks.length === 0 ? (
                  <div 
                    className="border-2 border-dashed rounded-2xl p-16 text-center"
                    style={{ borderColor: customColors.primary + "40" }}
                  >
                    <Layout className="w-16 h-16 mx-auto mb-4" style={{ color: customColors.primary }} />
                    <h3 className="text-xl font-semibold mb-2" style={{ color: customColors.text }}>
                      Start Building Your Page
                    </h3>
                    <p className="mb-6" style={{ color: customColors.text + "80" }}>
                      Add blocks to create your page layout
                    </p>
                    <button
                      onClick={() => setShowAddBlock(true)}
                      className="px-6 py-3 rounded-xl text-sm font-semibold transition-all"
                      style={{ 
                        backgroundColor: customColors.primary, 
                        color: customColors.secondary,
                        borderRadius: customRadius
                      }}
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Add First Block
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentPage.blocks
                      .sort((a, b) => a.order - b.order)
                      .map((block) => {
                        const Icon = blockIcons[block.type];
                        const isSelected = selectedBlock === block.id;

                        return (
                          <div
                            key={block.id}
                            onClick={() => selectBlock(block.id)}
                            className={cn(
                              "group relative rounded-2xl transition-all cursor-pointer overflow-hidden",
                              isSelected && "ring-2 ring-offset-2",
                              !previewMode && "hover:ring-1"
                            )}
                            style={{
                              backgroundColor: customColors.secondary,
                              borderRadius: customRadius,
                              ...(isSelected ? { 
                                ringColor: customColors.primary,
                                ringOffsetColor: customColors.background
                              } : {
                                ringColor: customColors.primary + "40"
                              })
                            }}
                          >
                            {/* Live Preview of Block */}
                            <div className="p-8">
                              {block.type === "hero" && (
                                <div className="text-center py-12">
                                  <h1 
                                    className="text-4xl font-bold mb-4"
                                    style={{ color: customColors.text, fontFamily: customFonts.heading }}
                                  >
                                    {block.content?.headline || "Your Headline Here"}
                                  </h1>
                                  <p 
                                    className="text-lg mb-8 max-w-2xl mx-auto"
                                    style={{ color: customColors.text + "99", fontFamily: customFonts.body }}
                                  >
                                    {block.content?.subheadline || "Add a compelling subheadline"}
                                  </p>
                                  <button
                                    className="px-8 py-3 text-sm font-semibold"
                                    style={{ 
                                      backgroundColor: customColors.primary, 
                                      color: customColors.secondary,
                                      borderRadius: customRadius
                                    }}
                                  >
                                    {block.content?.buttonText || "Get Started"}
                                  </button>
                                </div>
                              )}

                              {block.type === "features" && (
                                <div>
                                  <h2 
                                    className="text-2xl font-bold text-center mb-8"
                                    style={{ color: customColors.text, fontFamily: customFonts.heading }}
                                  >
                                    {block.content?.title || "Features"}
                                  </h2>
                                  <div className="grid grid-cols-3 gap-6">
                                    {(block.content?.features || [1,2,3]).slice(0, 3).map((f: any, i: number) => (
                                      <div 
                                        key={i} 
                                        className="p-6 rounded-xl text-center"
                                        style={{ backgroundColor: customColors.background, borderRadius: customRadius }}
                                      >
                                        <div 
                                          className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center text-2xl"
                                          style={{ backgroundColor: customColors.primary + "20" }}
                                        >
                                          {f.icon || "⚡"}
                                        </div>
                                        <h3 className="font-semibold mb-2" style={{ color: customColors.text }}>
                                          {f.title || `Feature ${i + 1}`}
                                        </h3>
                                        <p className="text-sm" style={{ color: customColors.text + "80" }}>
                                          {f.description || "Feature description goes here"}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {block.type === "pricing" && (
                                <div>
                                  <h2 
                                    className="text-2xl font-bold text-center mb-8"
                                    style={{ color: customColors.text, fontFamily: customFonts.heading }}
                                  >
                                    Pricing
                                  </h2>
                                  <div className="flex justify-center gap-6">
                                    {(block.content?.plans || [{name:"Basic",price:9},{name:"Pro",price:29,popular:true},{name:"Enterprise",price:99}]).map((p: any, i: number) => (
                                      <div 
                                        key={i} 
                                        className={cn(
                                          "w-64 p-6 rounded-xl text-center",
                                          p.popular && "ring-2"
                                        )}
                                        style={{ 
                                          backgroundColor: p.popular ? customColors.primary + "10" : customColors.background,
                                          borderRadius: customRadius,
                                          ...(p.popular && { ringColor: customColors.primary })
                                        }}
                                      >
                                        {p.popular && (
                                          <span 
                                            className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
                                            style={{ backgroundColor: customColors.primary, color: customColors.secondary }}
                                          >
                                            POPULAR
                                          </span>
                                        )}
                                        <h3 className="font-semibold mb-2" style={{ color: customColors.text }}>{p.name}</h3>
                                        <p className="text-3xl font-bold mb-4" style={{ color: customColors.primary }}>
                                          ${p.price}<span className="text-sm font-normal" style={{ color: customColors.text + "60" }}>/mo</span>
                                        </p>
                                        <button
                                          className="w-full py-2 text-sm font-medium"
                                          style={{ 
                                            backgroundColor: p.popular ? customColors.primary : "transparent",
                                            color: p.popular ? customColors.secondary : customColors.primary,
                                            border: `1px solid ${customColors.primary}`,
                                            borderRadius: customRadius
                                          }}
                                        >
                                          Choose Plan
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {block.type === "cta" && (
                                <div 
                                  className="text-center py-12 rounded-xl"
                                  style={{ backgroundColor: customColors.primary + "10", borderRadius: customRadius }}
                                >
                                  <h2 
                                    className="text-2xl font-bold mb-4"
                                    style={{ color: customColors.text, fontFamily: customFonts.heading }}
                                  >
                                    {block.content?.title || "Ready to Get Started?"}
                                  </h2>
                                  <p className="mb-6" style={{ color: customColors.text + "80" }}>
                                    {block.content?.description || "Join thousands of happy customers"}
                                  </p>
                                  <button
                                    className="px-8 py-3 text-sm font-semibold"
                                    style={{ 
                                      backgroundColor: customColors.primary, 
                                      color: customColors.secondary,
                                      borderRadius: customRadius
                                    }}
                                  >
                                    {block.content?.buttonText || "Start Free Trial"}
                                  </button>
                                </div>
                              )}

                              {block.type === "text" && (
                                <div className="max-w-3xl mx-auto">
                                  <h2 
                                    className="text-2xl font-bold mb-4"
                                    style={{ color: customColors.text, fontFamily: customFonts.heading }}
                                  >
                                    {block.content?.title || "Text Section"}
                                  </h2>
                                  <p style={{ color: customColors.text + "99", fontFamily: customFonts.body }}>
                                    {block.content?.body || "Add your content here..."}
                                  </p>
                                </div>
                              )}

                              {block.type === "testimonials" && (
                                <div className="text-center">
                                  <h2 
                                    className="text-2xl font-bold mb-8"
                                    style={{ color: customColors.text, fontFamily: customFonts.heading }}
                                  >
                                    What Our Customers Say
                                  </h2>
                                  <div className="grid grid-cols-2 gap-6">
                                    {[1,2].map(i => (
                                      <div 
                                        key={i}
                                        className="p-6 rounded-xl text-left"
                                        style={{ backgroundColor: customColors.background, borderRadius: customRadius }}
                                      >
                                        <p className="mb-4 italic" style={{ color: customColors.text + "99" }}>
                                          "Amazing product that transformed our business!"
                                        </p>
                                        <div className="flex items-center gap-3">
                                          <div 
                                            className="w-10 h-10 rounded-full"
                                            style={{ backgroundColor: customColors.primary + "30" }}
                                          />
                                          <div>
                                            <p className="font-medium" style={{ color: customColors.text }}>John Doe</p>
                                            <p className="text-sm" style={{ color: customColors.text + "60" }}>CEO, Company</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {block.type === "contact" && (
                                <div className="max-w-md mx-auto">
                                  <h2 
                                    className="text-2xl font-bold text-center mb-8"
                                    style={{ color: customColors.text, fontFamily: customFonts.heading }}
                                  >
                                    Contact Us
                                  </h2>
                                  <div className="space-y-4">
                                    <input
                                      type="text"
                                      placeholder="Your Name"
                                      className="w-full px-4 py-3 border"
                                      style={{ 
                                        backgroundColor: customColors.background, 
                                        borderColor: customColors.text + "20",
                                        color: customColors.text,
                                        borderRadius: customRadius
                                      }}
                                    />
                                    <input
                                      type="email"
                                      placeholder="Email Address"
                                      className="w-full px-4 py-3 border"
                                      style={{ 
                                        backgroundColor: customColors.background, 
                                        borderColor: customColors.text + "20",
                                        color: customColors.text,
                                        borderRadius: customRadius
                                      }}
                                    />
                                    <textarea
                                      placeholder="Your Message"
                                      rows={4}
                                      className="w-full px-4 py-3 border"
                                      style={{ 
                                        backgroundColor: customColors.background, 
                                        borderColor: customColors.text + "20",
                                        color: customColors.text,
                                        borderRadius: customRadius
                                      }}
                                    />
                                    <button
                                      className="w-full py-3 text-sm font-semibold"
                                      style={{ 
                                        backgroundColor: customColors.primary, 
                                        color: customColors.secondary,
                                        borderRadius: customRadius
                                      }}
                                    >
                                      Send Message
                                    </button>
                                  </div>
                                </div>
                              )}

                              {(block.type === "gallery" || block.type === "products" || block.type === "team") && (
                                <div className="text-center py-8">
                                  <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center" style={{ color: customColors.primary }}>
                                    <Icon className="w-12 h-12" />
                                  </div>
                                  <h3 className="font-semibold" style={{ color: customColors.text }}>
                                    {blockLabels[block.type]}
                                  </h3>
                                  <p className="text-sm" style={{ color: customColors.text + "60" }}>
                                    Configure this section
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Block Actions */}
                            {isSelected && !previewMode && (
                              <div 
                                className="absolute -top-3 right-4 flex items-center gap-1 rounded-lg p-1"
                                style={{ backgroundColor: customColors.secondary, border: `1px solid ${customColors.primary}40` }}
                              >
                                <button className="p-2 rounded-md text-[#888] hover:text-white">
                                  <GripVertical className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); duplicateBlock(currentPage.id, block.id); }}
                                  className="p-2 rounded-md text-[#888] hover:text-white"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); deleteBlock(currentPage.id, block.id); }}
                                  className="p-2 rounded-md text-[#888] hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}

                    {/* Add Block Button */}
                    {!previewMode && (
                      <button
                        onClick={() => setShowAddBlock(true)}
                        className="w-full py-6 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 transition-colors"
                        style={{ 
                          borderColor: customColors.primary + "40",
                          color: customColors.text + "60",
                          borderRadius: customRadius
                        }}
                      >
                        <Plus className="w-5 h-5" />
                        Add Block
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: customColors.background }}>
            <div className="text-center">
              <Globe className="w-20 h-20 mx-auto mb-6" style={{ color: customColors.primary }} />
              <h2 className="text-2xl font-bold mb-3" style={{ color: customColors.text }}>
                Website Builder
              </h2>
              <p className="mb-8" style={{ color: customColors.text + "80" }}>
                Select a page or create a new one to get started
              </p>
              <button
                onClick={() => setShowNewPage(true)}
                className="px-6 py-3 rounded-xl text-sm font-semibold"
                style={{ 
                  backgroundColor: customColors.primary, 
                  color: customColors.secondary,
                  borderRadius: customRadius
                }}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Create Page
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Block Editor */}
      {selectedBlock && currentBlock && !previewMode && (
        <div className="w-80 bg-[#111] border-l border-[#222] overflow-auto">
          <div className="p-4 border-b border-[#222] flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              {(() => { const Icon = blockIcons[currentBlock.type]; return <Icon className="w-4 h-4 text-[#CDB49E]" />; })()}
              {blockLabels[currentBlock.type]}
            </h3>
            <button onClick={() => selectBlock(null)} className="text-[#555] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-5">
            {/* Dynamic Fields Based on Block Type */}
            {currentBlock.content?.headline !== undefined && (
              <div>
                <label className="text-xs text-[#666] mb-1.5 block">Headline</label>
                <input
                  type="text"
                  value={currentBlock.content.headline}
                  onChange={(e) => updateBlock(currentPage!.id, currentBlock.id, { 
                    content: { ...currentBlock.content, headline: e.target.value } 
                  })}
                  className="w-full px-3 py-2.5 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#CDB49E]/50 focus:outline-none"
                />
              </div>
            )}

            {currentBlock.content?.subheadline !== undefined && (
              <div>
                <label className="text-xs text-[#666] mb-1.5 block">Subheadline</label>
                <textarea
                  value={currentBlock.content.subheadline}
                  onChange={(e) => updateBlock(currentPage!.id, currentBlock.id, { 
                    content: { ...currentBlock.content, subheadline: e.target.value } 
                  })}
                  className="w-full px-3 py-2.5 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#CDB49E]/50 focus:outline-none"
                  rows={3}
                />
              </div>
            )}

            {currentBlock.content?.title !== undefined && (
              <div>
                <label className="text-xs text-[#666] mb-1.5 block">Title</label>
                <input
                  type="text"
                  value={currentBlock.content.title}
                  onChange={(e) => updateBlock(currentPage!.id, currentBlock.id, { 
                    content: { ...currentBlock.content, title: e.target.value } 
                  })}
                  className="w-full px-3 py-2.5 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#CDB49E]/50 focus:outline-none"
                />
              </div>
            )}

            {currentBlock.content?.buttonText !== undefined && (
              <div>
                <label className="text-xs text-[#666] mb-1.5 block">Button Text</label>
                <input
                  type="text"
                  value={currentBlock.content.buttonText}
                  onChange={(e) => updateBlock(currentPage!.id, currentBlock.id, { 
                    content: { ...currentBlock.content, buttonText: e.target.value } 
                  })}
                  className="w-full px-3 py-2.5 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#CDB49E]/50 focus:outline-none"
                />
              </div>
            )}

            {currentBlock.content?.description !== undefined && (
              <div>
                <label className="text-xs text-[#666] mb-1.5 block">Description</label>
                <textarea
                  value={currentBlock.content.description}
                  onChange={(e) => updateBlock(currentPage!.id, currentBlock.id, { 
                    content: { ...currentBlock.content, description: e.target.value } 
                  })}
                  className="w-full px-3 py-2.5 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#CDB49E]/50 focus:outline-none"
                  rows={4}
                />
              </div>
            )}

            {currentBlock.content?.body !== undefined && (
              <div>
                <label className="text-xs text-[#666] mb-1.5 block">Content</label>
                <textarea
                  value={currentBlock.content.body}
                  onChange={(e) => updateBlock(currentPage!.id, currentBlock.id, { 
                    content: { ...currentBlock.content, body: e.target.value } 
                  })}
                  className="w-full px-3 py-2.5 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#CDB49E]/50 focus:outline-none"
                  rows={8}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Page Modal */}
      {showNewPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNewPage(false)} />
          <div className="relative bg-[#111] border border-[#333] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">Create New Page</h2>
            <div>
              <label className="text-xs text-[#666] mb-1.5 block">Page Title</label>
              <input
                type="text"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                placeholder="e.g., About Us"
                className="w-full px-4 py-3 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#CDB49E]/50 focus:outline-none"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewPage(false)}
                className="flex-1 px-4 py-2.5 text-sm text-[#888] hover:text-white border border-[#333] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePage}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[#CDB49E] text-black rounded-lg hover:bg-[#d4c0ad]"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Block Modal */}
      {showAddBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddBlock(false)} />
          <div className="relative bg-[#111] border border-[#333] rounded-2xl w-full max-w-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Add Block</h2>
              <button onClick={() => setShowAddBlock(false)} className="text-[#555] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(Object.keys(blockLabels) as BlockType[]).map((type) => {
                const Icon = blockIcons[type];
                return (
                  <button
                    key={type}
                    onClick={() => handleAddBlock(type)}
                    className="flex items-center gap-3 p-4 rounded-xl bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] hover:border-[#CDB49E] transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#222] group-hover:bg-[#CDB49E]/10 flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5 text-[#CDB49E]" />
                    </div>
                    <span className="text-sm font-medium text-white">{blockLabels[type]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
