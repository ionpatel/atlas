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
  Rocket,
  Link2,
  Shield,
  BarChart3,
  Search,
  Code,
  ImageIcon,
  Layers,
  Move,
  MousePointer,
  RefreshCw,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Building2,
  Briefcase,
  ShoppingBag,
  Camera,
  Utensils,
  GraduationCap,
  Heart,
  Dumbbell,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════ WEBSITE TEMPLATES ═══════════════════════ */

const TEMPLATES = [
  {
    id: "saas-starter",
    name: "SaaS Starter",
    category: "SaaS",
    icon: Rocket,
    description: "Perfect for software products with pricing, features, and testimonials",
    preview: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
    pages: ["Home", "Features", "Pricing", "About", "Contact"],
    blocks: ["hero", "features", "pricing", "testimonials", "cta"],
    popular: true,
  },
  {
    id: "business-pro",
    name: "Business Pro",
    category: "Business",
    icon: Building2,
    description: "Professional business website with services and team sections",
    preview: "linear-gradient(135deg, #111111 0%, #333333 100%)",
    pages: ["Home", "Services", "About", "Team", "Contact"],
    blocks: ["hero", "features", "team", "testimonials", "contact"],
  },
  {
    id: "agency-creative",
    name: "Agency Creative",
    category: "Agency",
    icon: Briefcase,
    description: "Bold creative agency template with portfolio showcase",
    preview: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)",
    pages: ["Home", "Work", "Services", "About", "Contact"],
    blocks: ["hero", "gallery", "features", "testimonials", "cta"],
    popular: true,
  },
  {
    id: "ecommerce-starter",
    name: "E-Commerce",
    category: "Shop",
    icon: ShoppingBag,
    description: "Online store template with products and checkout",
    preview: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
    pages: ["Home", "Products", "Categories", "Cart", "About"],
    blocks: ["hero", "products", "features", "testimonials", "cta"],
  },
  {
    id: "portfolio-minimal",
    name: "Portfolio Minimal",
    category: "Portfolio",
    icon: Camera,
    description: "Clean portfolio for designers and photographers",
    preview: "linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)",
    pages: ["Home", "Work", "About", "Contact"],
    blocks: ["hero", "gallery", "text", "contact"],
  },
  {
    id: "restaurant-menu",
    name: "Restaurant",
    category: "Food",
    icon: Utensils,
    description: "Restaurant website with menu and reservations",
    preview: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    pages: ["Home", "Menu", "About", "Reservations", "Contact"],
    blocks: ["hero", "gallery", "features", "testimonials", "contact"],
  },
  {
    id: "education-course",
    name: "Education",
    category: "Education",
    icon: GraduationCap,
    description: "Online courses and educational platform",
    preview: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
    pages: ["Home", "Courses", "Instructors", "Pricing", "Contact"],
    blocks: ["hero", "features", "pricing", "team", "testimonials"],
  },
  {
    id: "fitness-gym",
    name: "Fitness & Gym",
    category: "Health",
    icon: Dumbbell,
    description: "Gym and fitness center with classes and trainers",
    preview: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    pages: ["Home", "Classes", "Trainers", "Membership", "Contact"],
    blocks: ["hero", "features", "pricing", "team", "cta"],
  },
];

/* ═══════════════════════ THEMES ═══════════════════════ */

const THEMES = [
  {
    id: "atlas-dark",
    name: "Atlas Dark",
    colors: { primary: "#CDB49E", secondary: "#111111", accent: "#f5f0eb", background: "#0a0a0a", text: "#ffffff", muted: "#888888" },
    fonts: { heading: "Inter", body: "Inter" },
    borderRadius: "12px",
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    colors: { primary: "#0ea5e9", secondary: "#0c4a6e", accent: "#38bdf8", background: "#0f172a", text: "#f8fafc", muted: "#64748b" },
    fonts: { heading: "Plus Jakarta Sans", body: "Inter" },
    borderRadius: "16px",
  },
  {
    id: "emerald-pro",
    name: "Emerald Pro",
    colors: { primary: "#10b981", secondary: "#064e3b", accent: "#34d399", background: "#0d1117", text: "#f0fdf4", muted: "#6b7280" },
    fonts: { heading: "Manrope", body: "Inter" },
    borderRadius: "12px",
  },
  {
    id: "violet-dream",
    name: "Violet Dream",
    colors: { primary: "#8b5cf6", secondary: "#2e1065", accent: "#a78bfa", background: "#0f0720", text: "#faf5ff", muted: "#a1a1aa" },
    fonts: { heading: "Space Grotesk", body: "Inter" },
    borderRadius: "20px",
  },
  {
    id: "rose-elegant",
    name: "Rose Elegant",
    colors: { primary: "#f43f5e", secondary: "#4c0519", accent: "#fb7185", background: "#0f0506", text: "#fff1f2", muted: "#9ca3af" },
    fonts: { heading: "Playfair Display", body: "Lato" },
    borderRadius: "4px",
  },
  {
    id: "minimal-light",
    name: "Minimal Light",
    colors: { primary: "#111111", secondary: "#ffffff", accent: "#666666", background: "#ffffff", text: "#111111", muted: "#6b7280" },
    fonts: { heading: "Inter", body: "Inter" },
    borderRadius: "8px",
  },
];

const FONT_OPTIONS = [
  "Inter", "Plus Jakarta Sans", "Manrope", "Space Grotesk", "DM Sans", 
  "Outfit", "Poppins", "Lato", "Playfair Display", "Montserrat"
];

/* ═══════════════════════ BLOCK DEFINITIONS ═══════════════════════ */

const blockIcons: Record<BlockType, React.ComponentType<{ className?: string }>> = {
  hero: Zap, features: Grid, pricing: DollarSign, testimonials: MessageSquare,
  cta: Star, gallery: Image, contact: Mail, text: Type, products: Layout, team: Users,
};

const blockLabels: Record<BlockType, string> = {
  hero: "Hero Section", features: "Features", pricing: "Pricing Table", testimonials: "Testimonials",
  cta: "Call to Action", gallery: "Gallery", contact: "Contact Form", text: "Text Block", products: "Products", team: "Team Members",
};

/* ═══════════════════════ COMPONENTS ═══════════════════════ */

function TemplateCard({ 
  template, 
  onSelect,
  onPreview 
}: { 
  template: typeof TEMPLATES[0];
  onSelect: () => void;
  onPreview: () => void;
}) {
  const Icon = template.icon;
  return (
    <div className="group relative bg-[#111] border border-[#2a2a2a] rounded-2xl overflow-hidden hover:border-[#CDB49E]/50 transition-all duration-300">
      {/* Preview */}
      <div className="relative h-48 overflow-hidden" style={{ background: template.preview }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-[200px] space-y-2">
            <div className="h-3 w-3/4 mx-auto rounded-full bg-white/30" />
            <div className="h-2 w-1/2 mx-auto rounded-full bg-white/20" />
            <div className="flex justify-center gap-2 mt-4">
              <div className="h-6 w-16 rounded bg-white/40" />
              <div className="h-6 w-16 rounded bg-white/20" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="h-10 rounded bg-white/10" />
              <div className="h-10 rounded bg-white/10" />
              <div className="h-10 rounded bg-white/10" />
            </div>
          </div>
        </div>
        
        {template.popular && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500 text-[10px] font-bold text-black">
            POPULAR
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
          <button
            onClick={onPreview}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-colors"
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Preview
          </button>
          <button
            onClick={onSelect}
            className="px-4 py-2 rounded-xl bg-[#CDB49E] text-black text-sm font-semibold hover:bg-[#d4c0ad] transition-colors"
          >
            Use Template
          </button>
        </div>
      </div>
      
      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#CDB49E]/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-[#CDB49E]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{template.name}</h3>
              <span className="text-[10px] text-[#666]">{template.category}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-[#888] mb-3">{template.description}</p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#555] px-2 py-1 rounded-full bg-[#1a1a1a]">
            {template.pages.length} pages
          </span>
          <span className="text-[10px] text-[#555] px-2 py-1 rounded-full bg-[#1a1a1a]">
            {template.blocks.length} sections
          </span>
        </div>
      </div>
    </div>
  );
}

function DeploymentPanel({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [domain, setDomain] = useState("");
  const [deployStatus, setDeployStatus] = useState<"idle" | "deploying" | "success" | "error">("idle");
  const [customDomain, setCustomDomain] = useState("");
  
  if (!isOpen) return null;

  const handleDeploy = () => {
    setDeployStatus("deploying");
    setTimeout(() => setDeployStatus("success"), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-[#2a2a2a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Deploy Website</h2>
              <p className="text-xs text-[#888]">Publish your site to the web</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Free Domain */}
          <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#2a2a2a]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#CDB49E]" />
                <span className="text-sm font-medium text-white">Atlas Domain</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">FREE</span>
              </div>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="your-site"
                className="flex-1 px-4 py-3 text-sm bg-[#111] border border-[#333] rounded-xl text-white focus:border-[#CDB49E]/50 focus:outline-none"
              />
              <span className="text-sm text-[#666]">.atlas.site</span>
            </div>
            {domain && (
              <p className="text-xs text-emerald-400 mt-2">
                ✓ https://{domain}.atlas.site is available
              </p>
            )}
          </div>

          {/* Custom Domain */}
          <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#2a2a2a]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#CDB49E]" />
                <span className="text-sm font-medium text-white">Custom Domain</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">PRO</span>
              </div>
            </div>
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="www.yourdomain.com"
              className="w-full px-4 py-3 text-sm bg-[#111] border border-[#333] rounded-xl text-white focus:border-[#CDB49E]/50 focus:outline-none"
            />
            <div className="mt-3 p-3 rounded-lg bg-[#111] border border-[#222]">
              <p className="text-xs text-[#888] mb-2">Add these DNS records:</p>
              <div className="space-y-1 font-mono text-xs">
                <div className="flex gap-4 text-[#666]">
                  <span className="w-12">Type</span>
                  <span className="w-24">Name</span>
                  <span>Value</span>
                </div>
                <div className="flex gap-4 text-white">
                  <span className="w-12 text-emerald-400">A</span>
                  <span className="w-24">@</span>
                  <span>76.76.21.21</span>
                </div>
                <div className="flex gap-4 text-white">
                  <span className="w-12 text-emerald-400">CNAME</span>
                  <span className="w-24">www</span>
                  <span>cname.atlas.site</span>
                </div>
              </div>
            </div>
          </div>

          {/* SSL & Security */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#2a2a2a]">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-white">SSL Certificate</span>
              </div>
              <p className="text-xs text-[#888]">Free SSL/TLS encryption enabled automatically</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#2a2a2a]">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-[#CDB49E]" />
                <span className="text-sm font-medium text-white">Analytics</span>
              </div>
              <p className="text-xs text-[#888]">Track visitors and page views</p>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#2a2a2a]">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-[#CDB49E]" />
              <span className="text-sm font-medium text-white">SEO Settings</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#666] mb-1 block">Meta Title</label>
                <input
                  type="text"
                  placeholder="Your awesome website"
                  className="w-full px-3 py-2.5 text-sm bg-[#111] border border-[#333] rounded-lg text-white focus:border-[#CDB49E]/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[#666] mb-1 block">Meta Description</label>
                <textarea
                  placeholder="Describe your website in 160 characters..."
                  rows={2}
                  className="w-full px-3 py-2.5 text-sm bg-[#111] border border-[#333] rounded-lg text-white focus:border-[#CDB49E]/50 focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-[#666] mb-1 block">Social Image</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-20 rounded-lg border border-dashed border-[#333] flex items-center justify-center">
                    <div className="text-center">
                      <Upload className="w-5 h-5 text-[#555] mx-auto mb-1" />
                      <span className="text-[10px] text-[#555]">1200×630px</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#2a2a2a] bg-[#0a0a0a]">
          <div className="flex items-center gap-2 text-xs text-[#888]">
            {deployStatus === "success" && (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Deployed successfully!</span>
              </>
            )}
            {deployStatus === "deploying" && (
              <>
                <RefreshCw className="w-4 h-4 text-[#CDB49E] animate-spin" />
                <span>Deploying changes...</span>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm text-[#888] hover:text-white border border-[#333] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeploy}
              disabled={deployStatus === "deploying"}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Rocket className="w-4 h-4" />
              {deployStatus === "deploying" ? "Deploying..." : "Deploy Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionStyleEditor({
  isOpen,
  onClose,
  theme,
}: {
  isOpen: boolean;
  onClose: () => void;
  theme: typeof THEMES[0];
}) {
  const [bgType, setBgType] = useState<"solid" | "gradient" | "image">("solid");
  const [padding, setPadding] = useState({ top: 80, bottom: 80 });
  const [animation, setAnimation] = useState("none");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-[#2a2a2a] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white">Section Styling</h3>
          <button onClick={onClose} className="text-[#555] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Background Type */}
          <div>
            <label className="text-xs text-[#666] mb-2 block">Background</label>
            <div className="flex gap-2">
              {(["solid", "gradient", "image"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setBgType(type)}
                  className={cn(
                    "flex-1 py-2.5 text-xs font-medium rounded-lg border transition-colors capitalize",
                    bgType === type
                      ? "bg-[#CDB49E]/10 border-[#CDB49E] text-[#CDB49E]"
                      : "bg-[#1a1a1a] border-[#333] text-[#888] hover:border-[#444]"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
            
            {bgType === "solid" && (
              <div className="mt-3 flex items-center gap-3">
                <input type="color" defaultValue={theme.colors.secondary} className="w-10 h-10 rounded-lg border border-[#333] bg-transparent cursor-pointer" />
                <input type="text" defaultValue={theme.colors.secondary} className="flex-1 px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white font-mono" />
              </div>
            )}
            
            {bgType === "gradient" && (
              <div className="mt-3 space-y-3">
                <div className="h-12 rounded-lg" style={{ background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)` }} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#555] block mb-1">From</label>
                    <input type="color" defaultValue={theme.colors.primary} className="w-full h-8 rounded-lg border border-[#333] bg-transparent cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#555] block mb-1">To</label>
                    <input type="color" defaultValue={theme.colors.secondary} className="w-full h-8 rounded-lg border border-[#333] bg-transparent cursor-pointer" />
                  </div>
                </div>
              </div>
            )}
            
            {bgType === "image" && (
              <div className="mt-3">
                <div className="h-24 rounded-lg border border-dashed border-[#333] flex items-center justify-center cursor-pointer hover:border-[#CDB49E]/50 transition-colors">
                  <div className="text-center">
                    <ImageIcon className="w-6 h-6 text-[#555] mx-auto mb-1" />
                    <span className="text-xs text-[#555]">Click to upload</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input type="checkbox" id="overlay" className="rounded border-[#333]" />
                  <label htmlFor="overlay" className="text-xs text-[#888]">Add dark overlay</label>
                </div>
              </div>
            )}
          </div>

          {/* Padding */}
          <div>
            <label className="text-xs text-[#666] mb-2 block">Padding</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#555] block mb-1">Top: {padding.top}px</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={padding.top}
                  onChange={(e) => setPadding(p => ({ ...p, top: Number(e.target.value) }))}
                  className="w-full accent-[#CDB49E]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#555] block mb-1">Bottom: {padding.bottom}px</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={padding.bottom}
                  onChange={(e) => setPadding(p => ({ ...p, bottom: Number(e.target.value) }))}
                  className="w-full accent-[#CDB49E]"
                />
              </div>
            </div>
          </div>

          {/* Animation */}
          <div>
            <label className="text-xs text-[#666] mb-2 block">Animation</label>
            <select
              value={animation}
              onChange={(e) => setAnimation(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white"
            >
              <option value="none">None</option>
              <option value="fade-up">Fade Up</option>
              <option value="fade-down">Fade Down</option>
              <option value="slide-left">Slide from Left</option>
              <option value="slide-right">Slide from Right</option>
              <option value="zoom">Zoom In</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-[#2a2a2a]">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm text-[#888] border border-[#333] rounded-xl hover:text-white">
            Cancel
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold bg-[#CDB49E] text-black rounded-xl hover:bg-[#d4c0ad]">
            Apply Styles
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */

export default function WebsitePage() {
  const {
    pages, currentPage, selectedBlock, previewMode,
    fetchPages, createPage, setCurrentPage, publishPage,
    addBlock, updateBlock, deleteBlock, selectBlock, duplicateBlock, togglePreview,
  } = useWebsiteStore();

  const [view, setView] = useState<"templates" | "editor">("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showDeploy, setShowDeploy] = useState(false);
  const [showSectionStyle, setShowSectionStyle] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"pages" | "theme" | "settings">("pages");

  useEffect(() => {
    fetchPages("org1");
  }, [fetchPages]);

  const handleSelectTemplate = (template: typeof TEMPLATES[0]) => {
    setSelectedTemplate(template);
    // Auto-create pages based on template
    template.pages.forEach((pageName, i) => {
      createPage({
        title: pageName,
        slug: pageName === "Home" ? "/" : `/${pageName.toLowerCase().replace(/\s+/g, "-")}`,
      });
    });
    setView("editor");
  };

  const handleAddBlock = (type: BlockType) => {
    if (currentPage) {
      addBlock(currentPage.id, type);
      setShowAddBlock(false);
    }
  };

  const currentBlock = currentPage?.blocks.find((b) => b.id === selectedBlock);
  const theme = selectedTheme;

  // Template Gallery View
  if (view === "templates") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CDB49E]/10 text-[#CDB49E] text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              8 Professional Templates
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Choose Your Website Template
            </h1>
            <p className="text-lg text-[#888] max-w-2xl mx-auto">
              Start with a professionally designed template and customize everything to match your brand.
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {["All", "SaaS", "Business", "Agency", "Shop", "Portfolio"].map((cat) => (
              <button
                key={cat}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                  cat === "All"
                    ? "bg-[#CDB49E] text-black"
                    : "bg-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#222]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => handleSelectTemplate(template)}
                onPreview={() => {}}
              />
            ))}
          </div>

          {/* Start from Scratch */}
          <div className="mt-12 text-center">
            <p className="text-[#666] mb-4">Or start with a blank canvas</p>
            <button
              onClick={() => setView("editor")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-white hover:border-[#CDB49E]/50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Start from Scratch
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Editor View
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left Sidebar */}
      <div className="w-72 bg-[#111] border-r border-[#222] flex flex-col">
        {/* Back to Templates */}
        <button
          onClick={() => setView("templates")}
          className="flex items-center gap-2 px-4 py-3 text-sm text-[#888] hover:text-white border-b border-[#222] transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Templates
        </button>

        {/* Tabs */}
        <div className="flex border-b border-[#222]">
          {[
            { id: "pages" as const, icon: FileText, label: "Pages" },
            { id: "theme" as const, icon: Palette, label: "Theme" },
            { id: "settings" as const, icon: Settings2, label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSidebarTab(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors",
                sidebarTab === tab.id
                  ? "text-[#CDB49E] border-b-2 border-[#CDB49E] -mb-[1px]"
                  : "text-[#666] hover:text-white"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-auto p-4">
          {sidebarTab === "pages" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#555] uppercase tracking-wider">Pages</h3>
                <button className="w-6 h-6 rounded-lg bg-[#CDB49E]/10 flex items-center justify-center text-[#CDB49E] hover:bg-[#CDB49E]/20">
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
                      {page.is_homepage ? <Home className="w-4 h-4 text-[#CDB49E]" /> : <FileText className="w-4 h-4 text-[#555]" />}
                      <span className="text-sm text-white">{page.title}</span>
                    </div>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full",
                      page.is_published ? "bg-emerald-500/10 text-emerald-400" : "bg-[#333] text-[#666]"
                    )}>
                      {page.is_published ? "Live" : "Draft"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {sidebarTab === "theme" && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-[#555] uppercase tracking-wider">Color Theme</h3>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTheme(t)}
                    className={cn(
                      "p-3 rounded-xl border transition-all text-left",
                      selectedTheme.id === t.id
                        ? "border-[#CDB49E] bg-[#CDB49E]/5"
                        : "border-[#2a2a2a] hover:border-[#444]"
                    )}
                  >
                    <div className="flex gap-1 mb-2">
                      {[t.colors.primary, t.colors.secondary, t.colors.accent].map((c, i) => (
                        <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <span className="text-xs text-white">{t.name}</span>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-[#222] space-y-3">
                <h4 className="text-xs font-medium text-[#888]">Typography</h4>
                <div>
                  <label className="text-[10px] text-[#555] mb-1 block">Heading Font</label>
                  <select className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
                    {FONT_OPTIONS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#555] mb-1 block">Body Font</label>
                  <select className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
                    {FONT_OPTIONS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {sidebarTab === "settings" && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-[#555] uppercase tracking-wider">Site Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#666] mb-1 block">Site Name</label>
                  <input type="text" defaultValue="My Website" className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
                </div>
                <div>
                  <label className="text-xs text-[#666] mb-1 block">Favicon</label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
                      <Globe className="w-5 h-5 text-[#555]" />
                    </div>
                    <button className="text-xs text-[#CDB49E] hover:underline">Upload</button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#666] mb-1 block">Logo</label>
                  <div className="h-16 rounded-lg border border-dashed border-[#333] flex items-center justify-center cursor-pointer hover:border-[#CDB49E]/50">
                    <div className="text-center">
                      <Upload className="w-4 h-4 text-[#555] mx-auto" />
                      <span className="text-[10px] text-[#555]">Upload logo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 bg-[#111] border-b border-[#222] flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-white">{currentPage?.title || "Select a page"}</h1>
            {currentPage && (
              <span className="text-xs text-[#555] px-2 py-1 rounded-lg bg-[#1a1a1a]">{currentPage.slug}</span>
            )}
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
                    devicePreview === device.id ? "bg-[#CDB49E]/10 text-[#CDB49E]" : "text-[#555] hover:text-white"
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
                previewMode ? "bg-[#CDB49E]/10 text-[#CDB49E]" : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
              )}
            >
              {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {previewMode ? "Edit" : "Preview"}
            </button>

            <button
              onClick={() => setShowDeploy(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              <Rocket className="w-4 h-4" />
              Deploy
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-8" style={{ backgroundColor: theme.colors.background }}>
          <div className={cn(
            "mx-auto transition-all duration-300",
            devicePreview === "desktop" && "max-w-5xl",
            devicePreview === "tablet" && "max-w-2xl",
            devicePreview === "mobile" && "max-w-sm"
          )}>
            {!currentPage ? (
              <div className="text-center py-20">
                <Globe className="w-16 h-16 mx-auto mb-4" style={{ color: theme.colors.primary }} />
                <h2 className="text-xl font-semibold mb-2" style={{ color: theme.colors.text }}>Select a Page</h2>
                <p style={{ color: theme.colors.muted }}>Choose a page from the sidebar to start editing</p>
              </div>
            ) : currentPage.blocks.length === 0 ? (
              <div
                className="border-2 border-dashed rounded-2xl p-16 text-center"
                style={{ borderColor: theme.colors.primary + "40" }}
              >
                <Layers className="w-16 h-16 mx-auto mb-4" style={{ color: theme.colors.primary }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.text }}>Add Your First Section</h3>
                <p className="mb-6" style={{ color: theme.colors.muted }}>Build your page by adding sections</p>
                <button
                  onClick={() => setShowAddBlock(true)}
                  className="px-6 py-3 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: theme.colors.primary, color: theme.colors.secondary, borderRadius: theme.borderRadius }}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Section
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {currentPage.blocks.sort((a, b) => a.order - b.order).map((block) => {
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
                        backgroundColor: theme.colors.secondary,
                        borderRadius: theme.borderRadius,
                        ...(isSelected ? { ringColor: theme.colors.primary, ringOffsetColor: theme.colors.background } : { ringColor: theme.colors.primary + "40" })
                      }}
                    >
                      {/* Block Content */}
                      <div className="p-8">
                        {block.type === "hero" && (
                          <div className="text-center py-16">
                            <h1 className="text-5xl font-bold mb-6" style={{ color: theme.colors.text, fontFamily: theme.fonts.heading }}>
                              {block.content?.headline || "Build Something Amazing"}
                            </h1>
                            <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: theme.colors.muted, fontFamily: theme.fonts.body }}>
                              {block.content?.subheadline || "Create beautiful websites with our powerful drag-and-drop builder"}
                            </p>
                            <div className="flex justify-center gap-4">
                              <button className="px-8 py-4 text-sm font-semibold" style={{ backgroundColor: theme.colors.primary, color: theme.colors.secondary, borderRadius: theme.borderRadius }}>
                                {block.content?.buttonText || "Get Started Free"}
                              </button>
                              <button className="px-8 py-4 text-sm font-semibold border" style={{ borderColor: theme.colors.primary, color: theme.colors.primary, borderRadius: theme.borderRadius }}>
                                Watch Demo
                              </button>
                            </div>
                          </div>
                        )}

                        {block.type === "features" && (
                          <div className="py-8">
                            <h2 className="text-3xl font-bold text-center mb-4" style={{ color: theme.colors.text }}>{block.content?.title || "Features"}</h2>
                            <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: theme.colors.muted }}>Everything you need to build modern websites</p>
                            <div className="grid grid-cols-3 gap-8">
                              {[
                                { icon: "⚡", title: "Lightning Fast", desc: "Optimized for speed and performance" },
                                { icon: "🎨", title: "Customizable", desc: "Fully customizable to match your brand" },
                                { icon: "📱", title: "Responsive", desc: "Looks great on all devices" },
                              ].map((f, i) => (
                                <div key={i} className="text-center p-6 rounded-xl" style={{ backgroundColor: theme.colors.background, borderRadius: theme.borderRadius }}>
                                  <div className="text-4xl mb-4">{f.icon}</div>
                                  <h3 className="font-semibold mb-2" style={{ color: theme.colors.text }}>{f.title}</h3>
                                  <p className="text-sm" style={{ color: theme.colors.muted }}>{f.desc}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {block.type === "pricing" && (
                          <div className="py-8">
                            <h2 className="text-3xl font-bold text-center mb-4" style={{ color: theme.colors.text }}>Simple Pricing</h2>
                            <p className="text-center mb-12" style={{ color: theme.colors.muted }}>Choose the plan that's right for you</p>
                            <div className="flex justify-center gap-8">
                              {[
                                { name: "Starter", price: 29, features: ["5 Pages", "Basic Analytics", "Email Support"] },
                                { name: "Pro", price: 79, features: ["Unlimited Pages", "Advanced Analytics", "Priority Support", "Custom Domain"], popular: true },
                                { name: "Enterprise", price: 199, features: ["Everything in Pro", "White Label", "Dedicated Manager", "SLA"] },
                              ].map((p, i) => (
                                <div
                                  key={i}
                                  className={cn("w-72 p-8 rounded-2xl text-center", p.popular && "ring-2")}
                                  style={{ backgroundColor: p.popular ? theme.colors.primary + "10" : theme.colors.background, borderRadius: theme.borderRadius, ...(p.popular && { ringColor: theme.colors.primary }) }}
                                >
                                  {p.popular && <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" style={{ backgroundColor: theme.colors.primary, color: theme.colors.secondary }}>MOST POPULAR</span>}
                                  <h3 className="font-semibold mb-2" style={{ color: theme.colors.text }}>{p.name}</h3>
                                  <p className="text-4xl font-bold mb-6" style={{ color: theme.colors.primary }}>${p.price}<span className="text-sm font-normal" style={{ color: theme.colors.muted }}>/mo</span></p>
                                  <ul className="space-y-3 mb-8 text-sm text-left">
                                    {p.features.map((f, j) => (
                                      <li key={j} className="flex items-center gap-2" style={{ color: theme.colors.muted }}>
                                        <Check className="w-4 h-4" style={{ color: theme.colors.primary }} />
                                        {f}
                                      </li>
                                    ))}
                                  </ul>
                                  <button className="w-full py-3 text-sm font-semibold" style={{ backgroundColor: p.popular ? theme.colors.primary : "transparent", color: p.popular ? theme.colors.secondary : theme.colors.primary, border: `1px solid ${theme.colors.primary}`, borderRadius: theme.borderRadius }}>
                                    Choose Plan
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {block.type === "cta" && (
                          <div className="py-16 text-center rounded-2xl" style={{ backgroundColor: theme.colors.primary + "10", borderRadius: theme.borderRadius }}>
                            <h2 className="text-3xl font-bold mb-4" style={{ color: theme.colors.text }}>{block.content?.title || "Ready to Get Started?"}</h2>
                            <p className="mb-8" style={{ color: theme.colors.muted }}>{block.content?.description || "Join thousands of happy customers today"}</p>
                            <button className="px-10 py-4 text-sm font-semibold" style={{ backgroundColor: theme.colors.primary, color: theme.colors.secondary, borderRadius: theme.borderRadius }}>
                              Start Free Trial <ArrowRight className="w-4 h-4 inline ml-2" />
                            </button>
                          </div>
                        )}

                        {block.type === "testimonials" && (
                          <div className="py-8">
                            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: theme.colors.text }}>Loved by Thousands</h2>
                            <div className="grid grid-cols-2 gap-6">
                              {[1, 2].map(i => (
                                <div key={i} className="p-6 rounded-xl" style={{ backgroundColor: theme.colors.background, borderRadius: theme.borderRadius }}>
                                  <div className="flex gap-1 mb-4">{[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" style={{ color: theme.colors.primary }} />)}</div>
                                  <p className="mb-6 italic" style={{ color: theme.colors.muted }}>"This product completely transformed how we work. Highly recommended!"</p>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full" style={{ backgroundColor: theme.colors.primary + "30" }} />
                                    <div>
                                      <p className="font-medium" style={{ color: theme.colors.text }}>John Smith</p>
                                      <p className="text-sm" style={{ color: theme.colors.muted }}>CEO, Company Inc</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {(block.type === "text" || block.type === "contact" || block.type === "gallery" || block.type === "products" || block.type === "team") && (
                          <div className="py-8 text-center">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.colors.primary + "20", color: theme.colors.primary }}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold mb-2" style={{ color: theme.colors.text }}>{blockLabels[block.type]}</h3>
                            <p className="text-sm" style={{ color: theme.colors.muted }}>Click to configure this section</p>
                          </div>
                        )}
                      </div>

                      {/* Block Actions */}
                      {isSelected && !previewMode && (
                        <div className="absolute -top-3 right-4 flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: theme.colors.secondary, border: `1px solid ${theme.colors.primary}40` }}>
                          <button onClick={(e) => { e.stopPropagation(); setShowSectionStyle(true); }} className="p-2 rounded-md text-[#888] hover:text-white" title="Section Styles">
                            <Paintbrush className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-md text-[#888] hover:text-white"><GripVertical className="w-4 h-4" /></button>
                          <button onClick={(e) => { e.stopPropagation(); duplicateBlock(currentPage.id, block.id); }} className="p-2 rounded-md text-[#888] hover:text-white"><Copy className="w-4 h-4" /></button>
                          <button onClick={(e) => { e.stopPropagation(); deleteBlock(currentPage.id, block.id); }} className="p-2 rounded-md text-[#888] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {!previewMode && (
                  <button
                    onClick={() => setShowAddBlock(true)}
                    className="w-full py-8 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 transition-colors"
                    style={{ borderColor: theme.colors.primary + "40", color: theme.colors.muted, borderRadius: theme.borderRadius }}
                  >
                    <Plus className="w-5 h-5" />
                    Add Section
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Block Editor */}
      {selectedBlock && currentBlock && !previewMode && (
        <div className="w-80 bg-[#111] border-l border-[#222] overflow-auto">
          <div className="p-4 border-b border-[#222] flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              {(() => { const I = blockIcons[currentBlock.type]; return <I className="w-4 h-4 text-[#CDB49E]" />; })()}
              {blockLabels[currentBlock.type]}
            </h3>
            <button onClick={() => selectBlock(null)} className="text-[#555] hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-4 space-y-4">
            {currentBlock.content?.headline !== undefined && (
              <div>
                <label className="text-xs text-[#666] mb-1.5 block">Headline</label>
                <input type="text" value={currentBlock.content.headline} onChange={(e) => updateBlock(currentPage!.id, currentBlock.id, { content: { ...currentBlock.content, headline: e.target.value } })} className="w-full px-3 py-2.5 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#CDB49E]/50 focus:outline-none" />
              </div>
            )}
            {currentBlock.content?.subheadline !== undefined && (
              <div>
                <label className="text-xs text-[#666] mb-1.5 block">Subheadline</label>
                <textarea value={currentBlock.content.subheadline} onChange={(e) => updateBlock(currentPage!.id, currentBlock.id, { content: { ...currentBlock.content, subheadline: e.target.value } })} className="w-full px-3 py-2.5 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#CDB49E]/50 focus:outline-none" rows={3} />
              </div>
            )}
            {currentBlock.content?.buttonText !== undefined && (
              <div>
                <label className="text-xs text-[#666] mb-1.5 block">Button Text</label>
                <input type="text" value={currentBlock.content.buttonText} onChange={(e) => updateBlock(currentPage!.id, currentBlock.id, { content: { ...currentBlock.content, buttonText: e.target.value } })} className="w-full px-3 py-2.5 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#CDB49E]/50 focus:outline-none" />
              </div>
            )}
            {currentBlock.content?.title !== undefined && (
              <div>
                <label className="text-xs text-[#666] mb-1.5 block">Title</label>
                <input type="text" value={currentBlock.content.title} onChange={(e) => updateBlock(currentPage!.id, currentBlock.id, { content: { ...currentBlock.content, title: e.target.value } })} className="w-full px-3 py-2.5 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#CDB49E]/50 focus:outline-none" />
              </div>
            )}
            {currentBlock.content?.description !== undefined && (
              <div>
                <label className="text-xs text-[#666] mb-1.5 block">Description</label>
                <textarea value={currentBlock.content.description} onChange={(e) => updateBlock(currentPage!.id, currentBlock.id, { content: { ...currentBlock.content, description: e.target.value } })} className="w-full px-3 py-2.5 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#CDB49E]/50 focus:outline-none" rows={4} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <DeploymentPanel isOpen={showDeploy} onClose={() => setShowDeploy(false)} />
      <SectionStyleEditor isOpen={showSectionStyle} onClose={() => setShowSectionStyle(false)} theme={theme} />

      {/* Add Block Modal */}
      {showAddBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddBlock(false)} />
          <div className="relative bg-[#111] border border-[#333] rounded-2xl w-full max-w-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Add Section</h2>
              <button onClick={() => setShowAddBlock(false)} className="text-[#555] hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(Object.keys(blockLabels) as BlockType[]).map((type) => {
                const Icon = blockIcons[type];
                return (
                  <button key={type} onClick={() => handleAddBlock(type)} className="flex items-center gap-3 p-4 rounded-xl bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] hover:border-[#CDB49E] transition-all text-left group">
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
