"use client";

import { useEffect, useState, useRef } from "react";
import {
  Globe, Plus, Eye, EyeOff, Trash2, Copy, GripVertical, Type, Image as ImageIcon, 
  DollarSign, MessageSquare, Mail, Grid, Star, Zap, Palette, FileText, Home, Monitor, Smartphone,
  Tablet, Check, ChevronRight, ChevronDown, ChevronUp, Sparkles, Settings2, Paintbrush, X, Rocket,
  BarChart3, Layers, Upload, CheckCircle, ArrowRight, ArrowLeft, MousePointer,
  Building2, Briefcase, ShoppingBag, Camera, Utensils, Dumbbell,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Square, Play, 
  Box, Minus, Link, ExternalLink, LayoutGrid, Columns, SlidersHorizontal,
  CircleDot, ChevronLeftIcon, ChevronRightIcon, Maximize2, Video, Music,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════ TYPES ═══════════════════════ */

interface ElementData {
  id: string;
  type: "heading" | "text" | "button" | "image" | "video" | "carousel" | "modal" | "container" | "nav" | "footer";
  content: string;
  styles: Record<string, string>;
  children?: ElementData[];
  props?: Record<string, any>;
}

interface SectionData {
  id: string;
  type: string;
  elements: ElementData[];
  styles: Record<string, string>;
}

interface PageData {
  id: string;
  name: string;
  slug: string;
  sections: SectionData[];
}

/* ═══════════════════════ TEMPLATES ═══════════════════════ */

const TEMPLATES = [
  {
    id: "saas-starter",
    name: "SaaS Platform",
    category: "SaaS",
    icon: BarChart3,
    preview: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    popular: true,
    description: "Analytics dashboard with pricing & features",
  },
  {
    id: "agency-creative",
    name: "Creative Agency",
    category: "Agency",
    icon: Briefcase,
    preview: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)",
    popular: true,
    description: "Portfolio showcase with services",
  },
  {
    id: "ecommerce",
    name: "E-Commerce Store",
    category: "Shop",
    icon: ShoppingBag,
    preview: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
    description: "Product catalog with cart",
  },
  {
    id: "restaurant",
    name: "Restaurant",
    category: "Food",
    icon: Utensils,
    preview: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    description: "Menu & reservations",
  },
  {
    id: "fitness",
    name: "Fitness & Gym",
    category: "Health",
    icon: Dumbbell,
    preview: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    description: "Classes & membership",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    category: "Personal",
    icon: Camera,
    preview: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
    description: "Showcase your work",
  },
];

/* ═══════════════════════ PREBUILT COMPONENTS ═══════════════════════ */

const COMPONENTS = [
  { id: "heading", name: "Heading", icon: Type, category: "Text" },
  { id: "text", name: "Paragraph", icon: FileText, category: "Text" },
  { id: "button", name: "Button", icon: Square, category: "Interactive" },
  { id: "image", name: "Image", icon: ImageIcon, category: "Media" },
  { id: "video", name: "Video", icon: Video, category: "Media" },
  { id: "carousel", name: "Carousel", icon: Columns, category: "Gallery" },
  { id: "slider", name: "Slider", icon: SlidersHorizontal, category: "Gallery" },
  { id: "modal", name: "Modal/Popup", icon: Maximize2, category: "Interactive" },
  { id: "nav", name: "Navigation", icon: LayoutGrid, category: "Layout" },
  { id: "grid", name: "Grid", icon: Grid, category: "Layout" },
  { id: "testimonial", name: "Testimonial", icon: MessageSquare, category: "Content" },
  { id: "pricing", name: "Pricing Card", icon: DollarSign, category: "Content" },
  { id: "cta", name: "CTA Section", icon: Zap, category: "Content" },
  { id: "footer", name: "Footer", icon: Mail, category: "Layout" },
];

const BUTTON_STYLES = [
  { id: "solid", name: "Solid", style: { backgroundColor: "#CDB49E", color: "#111", border: "none" } },
  { id: "outline", name: "Outline", style: { backgroundColor: "transparent", color: "#CDB49E", border: "2px solid #CDB49E" } },
  { id: "ghost", name: "Ghost", style: { backgroundColor: "transparent", color: "#CDB49E", border: "none" } },
  { id: "gradient", name: "Gradient", style: { background: "linear-gradient(135deg, #CDB49E 0%, #d4c0ad 100%)", color: "#111", border: "none" } },
  { id: "glow", name: "Glow", style: { backgroundColor: "#CDB49E", color: "#111", border: "none", boxShadow: "0 0 20px rgba(205,180,158,0.5)" } },
];

const CAROUSEL_PRESETS = [
  { id: "hero", name: "Hero Carousel", slides: 3, autoplay: true, arrows: true },
  { id: "testimonials", name: "Testimonials", slides: 1, autoplay: true, dots: true },
  { id: "gallery", name: "Image Gallery", slides: 4, arrows: true },
  { id: "products", name: "Product Slider", slides: 3, arrows: true, dots: true },
];

/* ═══════════════════════ INLINE EDITOR ═══════════════════════ */

function InlineEditor({ 
  value, 
  onChange, 
  type = "text",
  placeholder = "Click to edit...",
  style = {},
  className = "",
}: { 
  value: string; 
  onChange: (v: string) => void;
  type?: "heading" | "text" | "button";
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      // Select all text
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [editing]);

  return (
    <div
      ref={ref}
      contentEditable={editing}
      suppressContentEditableWarning
      onClick={() => setEditing(true)}
      onBlur={(e) => {
        setEditing(false);
        onChange(e.currentTarget.textContent || "");
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          e.currentTarget.blur();
        }
        if (e.key === "Escape") {
          e.currentTarget.blur();
        }
      }}
      className={cn(
        "outline-none cursor-text transition-all",
        editing && "ring-2 ring-[#CDB49E] ring-offset-2 ring-offset-[#0a0a0a] rounded",
        !value && "opacity-50",
        className
      )}
      style={style}
    >
      {value || placeholder}
    </div>
  );
}

/* ═══════════════════════ CAROUSEL COMPONENT ═══════════════════════ */

function CarouselPreview({ slides = 3, currentSlide = 0 }: { slides?: number; currentSlide?: number }) {
  const [current, setCurrent] = useState(currentSlide);
  
  return (
    <div className="relative w-full h-64 bg-[#1a1a1a] rounded-xl overflow-hidden">
      {/* Slides */}
      <div className="absolute inset-0 flex transition-transform duration-500" style={{ transform: `translateX(-${current * 100}%)` }}>
        {Array.from({ length: slides }).map((_, i) => (
          <div key={i} className="w-full h-full flex-shrink-0 flex items-center justify-center" style={{ background: `linear-gradient(135deg, hsl(${i * 60}, 70%, 50%) 0%, hsl(${i * 60 + 30}, 70%, 40%) 100%)` }}>
            <span className="text-white text-2xl font-bold">Slide {i + 1}</span>
          </div>
        ))}
      </div>
      {/* Arrows */}
      <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <button onClick={() => setCurrent((c) => Math.min(slides - 1, c + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70">
        <ArrowRight className="w-5 h-5" />
      </button>
      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {Array.from({ length: slides }).map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={cn("w-2 h-2 rounded-full transition-colors", current === i ? "bg-white" : "bg-white/40")} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════ MODAL COMPONENT ═══════════════════════ */

function ModalPreview({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-[#333] rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#666] hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold text-white mb-4">Modal Title</h3>
        <p className="text-[#888] mb-6">This is a customizable modal popup. Edit the content and styling as needed.</p>
        <button className="w-full py-3 bg-[#CDB49E] text-black rounded-xl font-semibold">Take Action</button>
      </div>
    </div>
  );
}

/* ═══════════════════════ STYLE PANEL ═══════════════════════ */

function StylePanel({ 
  element, 
  styles, 
  onStyleChange,
  onDelete,
  onDuplicate,
}: { 
  element: ElementData | null;
  styles: Record<string, string>;
  onStyleChange: (key: string, value: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"style" | "animation" | "link">("style");

  if (!element) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <MousePointer className="w-12 h-12 text-[#333] mx-auto mb-4" />
          <p className="text-sm text-[#666]">Click an element to edit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Element Info */}
      <div className="p-4 border-b border-[#222] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-[#CDB49E]/10 text-[#CDB49E] font-medium capitalize">{element.type}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onDuplicate} className="p-1.5 text-[#666] hover:text-white rounded"><Copy className="w-4 h-4" /></button>
          <button onClick={onDelete} className="p-1.5 text-[#666] hover:text-red-400 rounded"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#222]">
        {[
          { id: "style" as const, label: "Style" },
          { id: "animation" as const, label: "Animation" },
          { id: "link" as const, label: "Link" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn("flex-1 py-2.5 text-xs font-medium transition-colors", activeTab === tab.id ? "text-[#CDB49E] border-b-2 border-[#CDB49E]" : "text-[#666] hover:text-white")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {activeTab === "style" && (
          <>
            {/* Typography (for text elements) */}
            {(element.type === "heading" || element.type === "text" || element.type === "button") && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#555] uppercase">Typography</h4>
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Font Size</label>
                  <div className="flex items-center gap-2">
                    <input type="range" min="12" max="96" value={parseInt(styles.fontSize) || 16} onChange={(e) => onStyleChange("fontSize", e.target.value + "px")} className="flex-1 accent-[#CDB49E]" />
                    <span className="text-xs text-white w-12">{styles.fontSize || "16px"}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Font Weight</label>
                  <select value={styles.fontWeight || "400"} onChange={(e) => onStyleChange("fontWeight", e.target.value)} className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
                    {["300", "400", "500", "600", "700", "800"].map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#888] mb-1.5 block">Text Align</label>
                  <div className="flex gap-1">
                    {[{ icon: AlignLeft, value: "left" }, { icon: AlignCenter, value: "center" }, { icon: AlignRight, value: "right" }].map(({ icon: Icon, value }) => (
                      <button key={value} onClick={() => onStyleChange("textAlign", value)} className={cn("flex-1 p-2 rounded-lg border transition-colors", styles.textAlign === value ? "bg-[#CDB49E]/10 border-[#CDB49E] text-[#CDB49E]" : "border-[#333] text-[#666] hover:text-white")}>
                        <Icon className="w-4 h-4 mx-auto" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={styles.color || "#ffffff"} onChange={(e) => onStyleChange("color", e.target.value)} className="w-10 h-10 rounded border border-[#333] bg-transparent cursor-pointer" />
                    <input type="text" value={styles.color || "#ffffff"} onChange={(e) => onStyleChange("color", e.target.value)} className="flex-1 px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white font-mono" />
                  </div>
                </div>
              </div>
            )}

            {/* Button Styles */}
            {element.type === "button" && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#555] uppercase">Button Style</h4>
                <div className="grid grid-cols-3 gap-2">
                  {BUTTON_STYLES.map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => {
                        Object.entries(btn.style).forEach(([k, v]) => onStyleChange(k, v));
                      }}
                      className="p-3 rounded-lg border border-[#333] hover:border-[#CDB49E] transition-colors"
                    >
                      <div className="px-2 py-1 rounded text-xs" style={btn.style as React.CSSProperties}>{btn.name}</div>
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Border Radius</label>
                  <input type="range" min="0" max="50" value={parseInt(styles.borderRadius) || 12} onChange={(e) => onStyleChange("borderRadius", e.target.value + "px")} className="w-full accent-[#CDB49E]" />
                </div>
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Padding</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="H" value={parseInt(styles.paddingLeft) || 24} onChange={(e) => { onStyleChange("paddingLeft", e.target.value + "px"); onStyleChange("paddingRight", e.target.value + "px"); }} className="px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
                    <input type="number" placeholder="V" value={parseInt(styles.paddingTop) || 12} onChange={(e) => { onStyleChange("paddingTop", e.target.value + "px"); onStyleChange("paddingBottom", e.target.value + "px"); }} className="px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Background */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Background</h4>
              <div>
                <label className="text-xs text-[#888] mb-1 block">Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={styles.backgroundColor || "#111111"} onChange={(e) => onStyleChange("backgroundColor", e.target.value)} className="w-10 h-10 rounded border border-[#333] bg-transparent cursor-pointer" />
                  <input type="text" value={styles.backgroundColor || "#111111"} onChange={(e) => onStyleChange("backgroundColor", e.target.value)} className="flex-1 px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white font-mono" />
                </div>
              </div>
              {element.type === "image" && (
                <div>
                  <label className="text-xs text-[#888] mb-1.5 block">Image</label>
                  <div className="h-24 rounded-lg border-2 border-dashed border-[#333] flex flex-col items-center justify-center cursor-pointer hover:border-[#CDB49E]/50 transition-colors">
                    <Upload className="w-6 h-6 text-[#555] mb-1" />
                    <span className="text-xs text-[#555]">Click or drop image</span>
                  </div>
                </div>
              )}
            </div>

            {/* Spacing */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Spacing</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-[#666] mb-1 block">Margin Top</label>
                  <input type="number" value={parseInt(styles.marginTop) || 0} onChange={(e) => onStyleChange("marginTop", e.target.value + "px")} className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
                </div>
                <div>
                  <label className="text-xs text-[#666] mb-1 block">Margin Bottom</label>
                  <input type="number" value={parseInt(styles.marginBottom) || 0} onChange={(e) => onStyleChange("marginBottom", e.target.value + "px")} className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
                </div>
              </div>
            </div>

            {/* Shadow */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Shadow</h4>
              <div className="flex gap-2">
                {[
                  { label: "None", value: "none" },
                  { label: "SM", value: "0 1px 2px rgba(0,0,0,0.3)" },
                  { label: "MD", value: "0 4px 12px rgba(0,0,0,0.3)" },
                  { label: "LG", value: "0 10px 40px rgba(0,0,0,0.4)" },
                ].map((s) => (
                  <button key={s.label} onClick={() => onStyleChange("boxShadow", s.value)} className={cn("flex-1 py-2 text-xs rounded-lg border transition-colors", styles.boxShadow === s.value ? "bg-[#CDB49E]/10 border-[#CDB49E] text-[#CDB49E]" : "border-[#333] text-[#666] hover:text-white")}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "animation" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#888] mb-1.5 block">Hover Effect</label>
              <select className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
                <option value="none">None</option>
                <option value="scale">Scale Up</option>
                <option value="scale-down">Scale Down</option>
                <option value="lift">Lift (Shadow)</option>
                <option value="glow">Glow</option>
                <option value="color-shift">Color Shift</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1.5 block">Click Effect</label>
              <select className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
                <option value="none">None</option>
                <option value="pulse">Pulse</option>
                <option value="bounce">Bounce</option>
                <option value="shake">Shake</option>
                <option value="ripple">Ripple</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1.5 block">Scroll Animation</label>
              <select className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
                <option value="none">None</option>
                <option value="fade-in">Fade In</option>
                <option value="slide-up">Slide Up</option>
                <option value="slide-left">Slide from Left</option>
                <option value="slide-right">Slide from Right</option>
                <option value="zoom-in">Zoom In</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1.5 block">Transition Duration</label>
              <div className="flex items-center gap-2">
                <input type="range" min="100" max="1000" step="100" defaultValue="300" className="flex-1 accent-[#CDB49E]" />
                <span className="text-xs text-white w-12">300ms</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "link" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#888] mb-1.5 block">Link Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button className="p-3 rounded-lg border border-[#CDB49E] bg-[#CDB49E]/10 text-[#CDB49E] text-xs font-medium">
                  <Link className="w-4 h-4 mx-auto mb-1" />
                  Page Link
                </button>
                <button className="p-3 rounded-lg border border-[#333] text-[#666] text-xs font-medium hover:border-[#444]">
                  <ExternalLink className="w-4 h-4 mx-auto mb-1" />
                  External URL
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1.5 block">Navigate To</label>
              <select className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
                <option value="">Select page...</option>
                <option value="/">Home</option>
                <option value="/about">About</option>
                <option value="/services">Services</option>
                <option value="/pricing">Pricing</option>
                <option value="/contact">Contact</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1.5 block">Or External URL</label>
              <input type="url" placeholder="https://example.com" className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="newTab" className="rounded border-[#333]" />
              <label htmlFor="newTab" className="text-xs text-[#888]">Open in new tab</label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════ SETTINGS PANEL ═══════════════════════ */

function SettingsPanel() {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-[#555] uppercase">Site Info</h4>
        <div>
          <label className="text-xs text-[#888] mb-1 block">Site Name</label>
          <input type="text" defaultValue="My Website" className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
        </div>
        <div>
          <label className="text-xs text-[#888] mb-1 block">Tagline</label>
          <input type="text" placeholder="A short description" className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-[#555] uppercase">Branding</h4>
        <div>
          <label className="text-xs text-[#888] mb-1.5 block">Logo</label>
          <div className="h-20 rounded-lg border-2 border-dashed border-[#333] flex items-center justify-center cursor-pointer hover:border-[#CDB49E]/50">
            <div className="text-center">
              <Upload className="w-5 h-5 text-[#555] mx-auto mb-1" />
              <span className="text-xs text-[#555]">Upload logo</span>
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs text-[#888] mb-1.5 block">Favicon</label>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
              <Globe className="w-6 h-6 text-[#555]" />
            </div>
            <button className="text-xs text-[#CDB49E] hover:underline">Upload</button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-[#555] uppercase">Colors</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#666] mb-1 block">Primary</label>
            <input type="color" defaultValue="#CDB49E" className="w-full h-10 rounded border border-[#333] bg-transparent cursor-pointer" />
          </div>
          <div>
            <label className="text-xs text-[#666] mb-1 block">Secondary</label>
            <input type="color" defaultValue="#111111" className="w-full h-10 rounded border border-[#333] bg-transparent cursor-pointer" />
          </div>
          <div>
            <label className="text-xs text-[#666] mb-1 block">Accent</label>
            <input type="color" defaultValue="#8b5cf6" className="w-full h-10 rounded border border-[#333] bg-transparent cursor-pointer" />
          </div>
          <div>
            <label className="text-xs text-[#666] mb-1 block">Background</label>
            <input type="color" defaultValue="#0a0a0a" className="w-full h-10 rounded border border-[#333] bg-transparent cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-[#555] uppercase">Typography</h4>
        <div>
          <label className="text-xs text-[#888] mb-1 block">Heading Font</label>
          <select className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
            <option>Inter</option>
            <option>Poppins</option>
            <option>Playfair Display</option>
            <option>Montserrat</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-[#888] mb-1 block">Body Font</label>
          <select className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
            <option>Inter</option>
            <option>Lato</option>
            <option>Open Sans</option>
            <option>Roboto</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-[#555] uppercase">SEO</h4>
        <div>
          <label className="text-xs text-[#888] mb-1 block">Meta Title</label>
          <input type="text" placeholder="Page title for search engines" className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
        </div>
        <div>
          <label className="text-xs text-[#888] mb-1 block">Meta Description</label>
          <textarea placeholder="Brief description for search results" rows={2} className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white resize-none" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */

export default function WebsitePage() {
  const [view, setView] = useState<"templates" | "editor">("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  const [elementStyles, setElementStyles] = useState<Record<string, string>>({});
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [rightPanel, setRightPanel] = useState<"style" | "components" | "settings">("style");
  const [showModal, setShowModal] = useState(false);
  const [zoom, setZoom] = useState(100);
  
  // Editable content state
  const [content, setContent] = useState({
    heroHeading: "Build Amazing Websites",
    heroSubheading: "Create stunning, responsive websites with our powerful visual editor. No coding required.",
    heroButton: "Start Building Free",
    heroButton2: "Watch Demo",
    feature1Title: "Visual Editor",
    feature1Desc: "Drag and drop interface",
    feature2Title: "Responsive",
    feature2Desc: "Works on all devices",
    feature3Title: "Fast",
    feature3Desc: "Optimized performance",
  });

  const updateContent = (key: string, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const handleStyleChange = (key: string, value: string) => {
    setElementStyles(prev => ({ ...prev, [key]: value }));
  };

  // Template Gallery View
  if (view === "templates") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CDB49E]/10 text-[#CDB49E] text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Ready-to-Use Templates
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Choose Your Template</h1>
            <p className="text-lg text-[#888]">Start with a professional design and customize everything</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <div key={template.id} className="group relative bg-[#111] border border-[#2a2a2a] rounded-2xl overflow-hidden hover:border-[#CDB49E]/50 transition-all">
                  <div className="relative h-40" style={{ background: template.preview }}>
                    {template.popular && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500 text-[10px] font-bold text-black">POPULAR</div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <button
                        onClick={() => { setSelectedTemplate(template.id); setView("editor"); }}
                        className="px-5 py-2.5 rounded-xl bg-[#CDB49E] text-black text-sm font-semibold hover:bg-[#d4c0ad]"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#CDB49E]/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#CDB49E]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{template.name}</h3>
                        <span className="text-[10px] text-[#666]">{template.category}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#888]">{template.description}</p>
                  </div>
                </div>
              );
            })}

            {/* Blank Template */}
            <div
              onClick={() => { setSelectedTemplate("blank"); setView("editor"); }}
              className="group bg-[#111] border-2 border-dashed border-[#333] rounded-2xl overflow-hidden hover:border-[#CDB49E]/50 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[240px]"
            >
              <Plus className="w-12 h-12 text-[#444] mb-3" />
              <span className="text-sm font-medium text-[#666]">Start from Scratch</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Editor View
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Toolbar */}
      <div className="h-12 bg-[#111] border-b border-[#222] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setView("templates")} className="flex items-center gap-2 text-sm text-[#888] hover:text-white">
            <ChevronRight className="w-4 h-4 rotate-180" /> Templates
          </button>
          <div className="h-5 w-px bg-[#333]" />
          <span className="text-sm font-medium text-white">My Website</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
            <button onClick={() => setZoom(Math.max(50, zoom - 25))} className="text-[#888] hover:text-white"><Minus className="w-3 h-3" /></button>
            <span className="text-xs text-white w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(150, zoom + 25))} className="text-[#888] hover:text-white"><Plus className="w-3 h-3" /></button>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
            {[{ id: "desktop" as const, icon: Monitor }, { id: "tablet" as const, icon: Tablet }, { id: "mobile" as const, icon: Smartphone }].map(({ id, icon: Icon }) => (
              <button key={id} onClick={() => setDevicePreview(id)} className={cn("p-1.5 rounded-md transition-colors", devicePreview === id ? "bg-[#CDB49E]/10 text-[#CDB49E]" : "text-[#555] hover:text-white")}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          <button onClick={() => setShowModal(true)} className="px-3 py-1.5 text-xs text-[#888] hover:text-white border border-[#333] rounded-lg">
            Test Modal
          </button>

          <button className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
            <Rocket className="w-4 h-4" /> Publish
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left: Components Panel */}
        <div className="w-64 bg-[#111] border-r border-[#222] flex flex-col">
          <div className="p-3 border-b border-[#222]">
            <h3 className="text-xs font-semibold text-[#555] uppercase">Add Elements</h3>
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-4">
            {["Text", "Interactive", "Media", "Gallery", "Content", "Layout"].map((category) => (
              <div key={category}>
                <h4 className="text-[10px] font-semibold text-[#444] uppercase mb-2">{category}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {COMPONENTS.filter(c => c.category === category).map((comp) => {
                    const Icon = comp.icon;
                    return (
                      <button key={comp.id} className="p-3 rounded-lg border border-[#2a2a2a] hover:border-[#CDB49E]/50 transition-colors text-center group">
                        <Icon className="w-5 h-5 text-[#666] group-hover:text-[#CDB49E] mx-auto mb-1 transition-colors" />
                        <span className="text-[10px] text-[#888]">{comp.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Carousel Presets */}
            <div>
              <h4 className="text-[10px] font-semibold text-[#444] uppercase mb-2">Carousel Presets</h4>
              <div className="space-y-2">
                {CAROUSEL_PRESETS.map((preset) => (
                  <button key={preset.id} className="w-full p-3 rounded-lg border border-[#2a2a2a] hover:border-[#CDB49E]/50 text-left">
                    <span className="text-xs text-white">{preset.name}</span>
                    <span className="text-[10px] text-[#666] block">{preset.slides} slides</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 bg-[#1a1a1a] overflow-auto p-8 flex items-start justify-center">
          <div
            className={cn(
              "bg-[#0a0a0a] rounded-xl shadow-2xl overflow-hidden transition-all duration-300",
              devicePreview === "desktop" && "w-full max-w-5xl",
              devicePreview === "tablet" && "w-[768px]",
              devicePreview === "mobile" && "w-[375px]"
            )}
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            {/* Nav */}
            <nav className="flex items-center justify-between px-8 py-4 border-b border-[#222]">
              <InlineEditor value="Brand" onChange={(v) => {}} style={{ fontSize: '20px', fontWeight: '700', color: '#CDB49E' }} />
              <div className="flex items-center gap-6 text-sm text-[#888]">
                {["Home", "Features", "Pricing", "Contact"].map((item) => (
                  <InlineEditor key={item} value={item} onChange={(v) => {}} style={{ fontSize: '14px', color: '#888' }} />
                ))}
              </div>
              <button
                onClick={() => setSelectedElement({ id: "nav-cta", type: "button", content: "Get Started", styles: {} })}
                className={cn("px-4 py-2 text-sm font-medium bg-[#CDB49E] text-black rounded-lg transition-all", selectedElement?.id === "nav-cta" && "ring-2 ring-[#CDB49E] ring-offset-2 ring-offset-[#0a0a0a]")}
              >
                <InlineEditor value="Get Started" onChange={(v) => {}} style={{ display: 'inline' }} />
              </button>
            </nav>

            {/* Hero */}
            <section className="px-8 py-24 text-center">
              <div
                onClick={() => { setSelectedElement({ id: "hero-heading", type: "heading", content: content.heroHeading, styles: {} }); setElementStyles({ fontSize: '48px', fontWeight: '700', color: '#ffffff' }); }}
                className={cn("mb-6 cursor-pointer", selectedElement?.id === "hero-heading" && "ring-2 ring-[#CDB49E] ring-offset-4 ring-offset-[#0a0a0a] rounded")}
              >
                <InlineEditor
                  value={content.heroHeading}
                  onChange={(v) => updateContent("heroHeading", v)}
                  style={{ ...elementStyles, ...(selectedElement?.id === "hero-heading" ? elementStyles : { fontSize: '48px', fontWeight: '700', color: '#ffffff' }) }}
                />
              </div>

              <div
                onClick={() => { setSelectedElement({ id: "hero-sub", type: "text", content: content.heroSubheading, styles: {} }); setElementStyles({ fontSize: '18px', color: '#888888' }); }}
                className={cn("max-w-2xl mx-auto mb-8 cursor-pointer", selectedElement?.id === "hero-sub" && "ring-2 ring-[#CDB49E] ring-offset-4 ring-offset-[#0a0a0a] rounded")}
              >
                <InlineEditor
                  value={content.heroSubheading}
                  onChange={(v) => updateContent("heroSubheading", v)}
                  style={selectedElement?.id === "hero-sub" ? elementStyles : { fontSize: '18px', color: '#888888' }}
                />
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => { setSelectedElement({ id: "hero-btn1", type: "button", content: content.heroButton, styles: {} }); setElementStyles({ backgroundColor: '#CDB49E', color: '#111111', padding: '16px 32px', borderRadius: '12px' }); }}
                  className={cn("transition-all", selectedElement?.id === "hero-btn1" && "ring-2 ring-[#CDB49E] ring-offset-2 ring-offset-[#0a0a0a]")}
                  style={selectedElement?.id === "hero-btn1" ? { ...elementStyles } : { padding: '16px 32px', fontSize: '14px', fontWeight: '600', backgroundColor: '#CDB49E', color: '#111', borderRadius: '12px' }}
                >
                  <InlineEditor value={content.heroButton} onChange={(v) => updateContent("heroButton", v)} style={{ display: 'inline' }} />
                </button>
                <button
                  onClick={() => { setSelectedElement({ id: "hero-btn2", type: "button", content: content.heroButton2, styles: {} }); setElementStyles({ backgroundColor: 'transparent', color: '#CDB49E', border: '2px solid #CDB49E', padding: '16px 32px', borderRadius: '12px' }); }}
                  className={cn("transition-all", selectedElement?.id === "hero-btn2" && "ring-2 ring-[#CDB49E] ring-offset-2 ring-offset-[#0a0a0a]")}
                  style={selectedElement?.id === "hero-btn2" ? { ...elementStyles } : { padding: '16px 32px', fontSize: '14px', fontWeight: '600', backgroundColor: 'transparent', color: '#CDB49E', border: '2px solid #CDB49E', borderRadius: '12px' }}
                >
                  <InlineEditor value={content.heroButton2} onChange={(v) => updateContent("heroButton2", v)} style={{ display: 'inline' }} />
                </button>
              </div>
            </section>

            {/* Carousel Demo */}
            <section className="px-8 py-12">
              <h2 className="text-2xl font-bold text-white text-center mb-8">Featured Carousel</h2>
              <CarouselPreview slides={3} />
            </section>

            {/* Features */}
            <section className="px-8 py-20 bg-[#111]">
              <h2 className="text-3xl font-bold text-center text-white mb-4">
                <InlineEditor value="Powerful Features" onChange={() => {}} />
              </h2>
              <p className="text-center text-[#888] mb-12">
                <InlineEditor value="Everything you need to build professional websites" onChange={() => {}} />
              </p>
              <div className="grid grid-cols-3 gap-8">
                {[
                  { key: "feature1", icon: "🎨" },
                  { key: "feature2", icon: "📱" },
                  { key: "feature3", icon: "⚡" },
                ].map((f, i) => (
                  <div key={i} className="p-6 rounded-xl bg-[#0a0a0a] text-center">
                    <div className="text-4xl mb-4">{f.icon}</div>
                    <h3 className="font-semibold text-white mb-2">
                      <InlineEditor value={content[`${f.key}Title` as keyof typeof content]} onChange={(v) => updateContent(`${f.key}Title`, v)} />
                    </h3>
                    <p className="text-sm text-[#888]">
                      <InlineEditor value={content[`${f.key}Desc` as keyof typeof content]} onChange={(v) => updateContent(`${f.key}Desc`, v)} />
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Right: Style Panel */}
        <div className="w-80 bg-[#111] border-l border-[#222] flex flex-col">
          {/* Panel Tabs */}
          <div className="flex border-b border-[#222]">
            {[
              { id: "style" as const, icon: Paintbrush, label: "Style" },
              { id: "settings" as const, icon: Settings2, label: "Settings" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRightPanel(tab.id)}
                className={cn("flex-1 flex items-center justify-center gap-2 py-3 text-xs transition-colors", rightPanel === tab.id ? "text-[#CDB49E] border-b-2 border-[#CDB49E]" : "text-[#666] hover:text-white")}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panel Content */}
          {rightPanel === "style" ? (
            <StylePanel
              element={selectedElement}
              styles={elementStyles}
              onStyleChange={handleStyleChange}
              onDelete={() => setSelectedElement(null)}
              onDuplicate={() => {}}
            />
          ) : (
            <div className="flex-1 overflow-auto">
              <SettingsPanel />
            </div>
          )}
        </div>
      </div>

      {/* Modal Preview */}
      <ModalPreview isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
