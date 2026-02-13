"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Globe, Plus, Eye, EyeOff, Trash2, Copy, GripVertical, Type, Image as ImageIcon, 
  DollarSign, MessageSquare, Mail, Grid, Star, Zap, Palette, FileText, Home, Monitor, Smartphone,
  Tablet, Check, ChevronRight, ChevronDown, ChevronUp, Sparkles, Settings2, Paintbrush, X, Rocket,
  BarChart3, Layers, Upload, CheckCircle, ArrowRight, ArrowLeft, MousePointer,
  Building2, Briefcase, ShoppingBag, Camera, Utensils, Dumbbell,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Square, Play, 
  Box, Minus, Link, ExternalLink, LayoutGrid, Columns, SlidersHorizontal,
  CircleDot, ChevronLeftIcon, ChevronRightIcon, Maximize2, Video, Music,
  AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd,
  AlignHorizontalSpaceBetween, AlignVerticalJustifyStart, AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd, Move, Lock, Unlock, RotateCcw, RotateCw, FlipHorizontal,
  FlipVertical, Undo2, Redo2, Save, Code, Download, PanelLeft, PanelRight, Scissors,
  Blend, Frame, Component, Container, Rows, AlignStartVertical, AlignCenterVertical,
  AlignEndVertical, GalleryHorizontal, Expand, Shrink, ZoomIn, ZoomOut, Target, Crosshair,
  Circle, Triangle, Hexagon, Pentagon, Octagon, Heart, Bookmark, Flag, Award, Crown,
  Filter, Droplets, Sun, Moon, CloudRain, Wind, Snowflake, Flame, Sparkle, Wand2,
  Proportions, Move3D, Fullscreen, Square as SquareIcon, RectangleHorizontal, RectangleVertical,
  CircleDashed, SquareDashed, PenTool, Pipette, Palette as PaletteIcon, Brush, Eraser, LayersIcon, SeparatorHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   ATLAS WEBSITE BUILDER PRO
   Full Webflow/Figma-Level Visual Editor
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─────────────────────────── TYPES ─────────────────────────── */

// Simple string-based styles for the editor
interface ElementStyles {
  [key: string]: string | undefined;
}

interface AnimationConfig {
  hover?: string;
  click?: string;
  scroll?: string;
  duration?: string;
  delay?: string;
  easing?: string;
}

interface ElementData {
  id: string;
  type: "section" | "container" | "heading" | "text" | "button" | "image" | "video" | "icon" | "divider" | "spacer" | "nav" | "footer" | "form" | "input" | "carousel" | "grid" | "flex" | "card" | "testimonial" | "pricing" | "cta" | "hero" | "features" | "gallery" | "contact" | "team" | "stats" | "faq" | "countdown" | "social" | "embed";
  content: string;
  styles: ElementStyles;
  responsiveStyles?: {
    tablet?: Partial<ElementStyles>;
    mobile?: Partial<ElementStyles>;
  };
  animation?: AnimationConfig;
  children?: ElementData[];
  props?: Record<string, any>;
  locked?: boolean;
  hidden?: boolean;
  name?: string;
}

interface SectionData {
  id: string;
  name: string;
  elements: ElementData[];
  styles: ElementStyles;
  locked?: boolean;
  hidden?: boolean;
}

interface PageData {
  id: string;
  name: string;
  slug: string;
  sections: SectionData[];
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
}

interface HistoryState {
  past: PageData[];
  present: PageData;
  future: PageData[];
}

/* ─────────────────────────── CONSTANTS ─────────────────────────── */

const TEMPLATES = [
  { id: "saas-starter", name: "SaaS Platform", category: "SaaS", icon: BarChart3, preview: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", popular: true, description: "Analytics dashboard with pricing & features" },
  { id: "agency-creative", name: "Creative Agency", category: "Agency", icon: Briefcase, preview: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)", popular: true, description: "Portfolio showcase with services" },
  { id: "ecommerce", name: "E-Commerce Store", category: "Shop", icon: ShoppingBag, preview: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)", description: "Product catalog with cart" },
  { id: "restaurant", name: "Restaurant", category: "Food", icon: Utensils, preview: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", description: "Menu & reservations" },
  { id: "fitness", name: "Fitness & Gym", category: "Health", icon: Dumbbell, preview: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", description: "Classes & membership" },
  { id: "portfolio", name: "Portfolio", category: "Personal", icon: Camera, preview: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)", description: "Showcase your work" },
];

const COMPONENT_LIBRARY = {
  Layout: [
    { id: "section", name: "Section", icon: Frame, description: "Full-width container" },
    { id: "container", name: "Container", icon: Container, description: "Centered content box" },
    { id: "flex", name: "Flex Box", icon: Rows, description: "Flexible layout" },
    { id: "grid", name: "Grid", icon: Grid, description: "Grid layout" },
    { id: "columns", name: "Columns", icon: Columns, description: "Multi-column layout" },
  ],
  Text: [
    { id: "heading", name: "Heading", icon: Type, description: "H1-H6 titles" },
    { id: "text", name: "Paragraph", icon: FileText, description: "Body text" },
    { id: "list", name: "List", icon: AlignLeft, description: "Bullet or numbered" },
    { id: "quote", name: "Quote", icon: MessageSquare, description: "Blockquote" },
  ],
  Media: [
    { id: "image", name: "Image", icon: ImageIcon, description: "Photos & graphics" },
    { id: "video", name: "Video", icon: Video, description: "Embed videos" },
    { id: "icon", name: "Icon", icon: Star, description: "Icon library" },
    { id: "gallery", name: "Gallery", icon: GalleryHorizontal, description: "Image grid" },
    { id: "carousel", name: "Carousel", icon: Columns, description: "Sliding content" },
  ],
  Interactive: [
    { id: "button", name: "Button", icon: Square, description: "CTA buttons" },
    { id: "link", name: "Link", icon: Link, description: "Text link" },
    { id: "form", name: "Form", icon: Mail, description: "Contact form" },
    { id: "input", name: "Input", icon: Type, description: "Form field" },
    { id: "dropdown", name: "Dropdown", icon: ChevronDown, description: "Select menu" },
  ],
  Blocks: [
    { id: "hero", name: "Hero", icon: Zap, description: "Hero section" },
    { id: "features", name: "Features", icon: Grid, description: "Feature grid" },
    { id: "pricing", name: "Pricing", icon: DollarSign, description: "Pricing table" },
    { id: "testimonial", name: "Testimonials", icon: MessageSquare, description: "Reviews" },
    { id: "cta", name: "CTA", icon: Rocket, description: "Call to action" },
    { id: "team", name: "Team", icon: Building2, description: "Team members" },
    { id: "contact", name: "Contact", icon: Mail, description: "Contact section" },
    { id: "faq", name: "FAQ", icon: CircleDot, description: "Questions" },
    { id: "stats", name: "Stats", icon: BarChart3, description: "Numbers" },
  ],
  Utility: [
    { id: "divider", name: "Divider", icon: Minus, description: "Horizontal line" },
    { id: "spacer", name: "Spacer", icon: Expand, description: "Empty space" },
    { id: "embed", name: "Embed", icon: Code, description: "Custom code" },
    { id: "social", name: "Social", icon: Globe, description: "Social links" },
  ],
};

const FONTS = [
  { name: "Inter", value: "Inter, sans-serif", category: "Sans-serif" },
  { name: "Poppins", value: "'Poppins', sans-serif", category: "Sans-serif" },
  { name: "Montserrat", value: "'Montserrat', sans-serif", category: "Sans-serif" },
  { name: "Open Sans", value: "'Open Sans', sans-serif", category: "Sans-serif" },
  { name: "Roboto", value: "'Roboto', sans-serif", category: "Sans-serif" },
  { name: "Playfair Display", value: "'Playfair Display', serif", category: "Serif" },
  { name: "Merriweather", value: "'Merriweather', serif", category: "Serif" },
  { name: "Georgia", value: "Georgia, serif", category: "Serif" },
  { name: "Fira Code", value: "'Fira Code', monospace", category: "Monospace" },
  { name: "JetBrains Mono", value: "'JetBrains Mono', monospace", category: "Monospace" },
];

const COLOR_PRESETS = [
  { name: "Atlas Gold", colors: ["#CDB49E", "#d4c0ad", "#111111", "#0a0a0a"] },
  { name: "Ocean", colors: ["#3b82f6", "#1d4ed8", "#1e3a5f", "#0c1929"] },
  { name: "Forest", colors: ["#10b981", "#059669", "#1a3329", "#0d1f17"] },
  { name: "Sunset", colors: ["#f97316", "#ea580c", "#3d1f0d", "#1a0d06"] },
  { name: "Berry", colors: ["#a855f7", "#7c3aed", "#2d1b4e", "#1a0f2e"] },
  { name: "Rose", colors: ["#f43f5e", "#e11d48", "#3d0f1a", "#1f0810"] },
];

const HOVER_EFFECTS = [
  { id: "none", name: "None", css: "" },
  { id: "scale-up", name: "Scale Up", css: "transform: scale(1.05)" },
  { id: "scale-down", name: "Scale Down", css: "transform: scale(0.95)" },
  { id: "lift", name: "Lift", css: "transform: translateY(-4px); box-shadow: 0 10px 40px rgba(0,0,0,0.3)" },
  { id: "glow", name: "Glow", css: "box-shadow: 0 0 20px currentColor" },
  { id: "brightness", name: "Brighten", css: "filter: brightness(1.1)" },
  { id: "dim", name: "Dim", css: "opacity: 0.8" },
  { id: "border-glow", name: "Border Glow", css: "box-shadow: inset 0 0 0 2px currentColor" },
];

const SCROLL_ANIMATIONS = [
  { id: "none", name: "None" },
  { id: "fade-in", name: "Fade In" },
  { id: "fade-up", name: "Fade Up" },
  { id: "fade-down", name: "Fade Down" },
  { id: "fade-left", name: "Fade Left" },
  { id: "fade-right", name: "Fade Right" },
  { id: "zoom-in", name: "Zoom In" },
  { id: "zoom-out", name: "Zoom Out" },
  { id: "flip-up", name: "Flip Up" },
  { id: "flip-down", name: "Flip Down" },
];

const BLEND_MODES = ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];

const EASING_FUNCTIONS = [
  { id: "ease", name: "Ease" },
  { id: "ease-in", name: "Ease In" },
  { id: "ease-out", name: "Ease Out" },
  { id: "ease-in-out", name: "Ease In Out" },
  { id: "linear", name: "Linear" },
  { id: "cubic-bezier(0.4, 0, 0.2, 1)", name: "Smooth" },
  { id: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", name: "Bounce" },
];

/* ─────────────────────────── INLINE EDITOR ─────────────────────────── */

function InlineEditor({ 
  value, 
  onChange, 
  placeholder = "Click to edit...",
  style = {},
  className = "",
  multiline = false,
}: { 
  value: string; 
  onChange: (v: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
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
        if (e.key === "Enter" && !multiline && !e.shiftKey) {
          e.preventDefault();
          e.currentTarget.blur();
        }
        if (e.key === "Escape") e.currentTarget.blur();
      }}
      className={cn(
        "outline-none cursor-text transition-all min-w-[1ch]",
        editing && "ring-2 ring-[#CDB49E] ring-offset-2 ring-offset-[#0a0a0a] rounded",
        !value && !editing && "opacity-50",
        className
      )}
      style={style}
    >
      {value || (editing ? "" : placeholder)}
    </div>
  );
}

/* ─────────────────────────── STYLE CONTROLS ─────────────────────────── */

// Numeric input with unit selector
function SizeInput({ 
  value, 
  onChange, 
  label,
  units = ["px", "%", "rem", "em", "vw", "vh", "auto"],
}: { 
  value: string;
  onChange: (v: string) => void;
  label?: string;
  units?: string[];
}) {
  const numericValue = parseFloat(value) || 0;
  const currentUnit = value?.replace(/[\d.-]/g, "") || "px";

  return (
    <div className="flex items-center gap-1">
      {label && <span className="text-[10px] text-[#666] w-8">{label}</span>}
      <input
        type="number"
        value={numericValue}
        onChange={(e) => onChange(e.target.value + currentUnit)}
        className="w-14 px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white text-center"
      />
      <select
        value={currentUnit}
        onChange={(e) => onChange(numericValue + e.target.value)}
        className="px-1 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white"
      >
        {units.map((u) => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>
    </div>
  );
}

// Color picker with transparency
function ColorPicker({ 
  value, 
  onChange, 
  label,
  showAlpha = true,
}: { 
  value: string;
  onChange: (v: string) => void;
  label?: string;
  showAlpha?: boolean;
}) {
  const [showPalette, setShowPalette] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs text-[#888] block">{label}</label>}
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value?.startsWith("#") ? value.slice(0, 7) : "#ffffff"}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg border border-[#333] bg-transparent cursor-pointer"
          />
          <div 
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{ 
              background: `repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 8px 8px`,
              opacity: 0.3,
              zIndex: -1
            }} 
          />
        </div>
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white font-mono"
        />
        <button 
          onClick={() => setShowPalette(!showPalette)}
          className="p-2 text-[#666] hover:text-white rounded-lg hover:bg-[#222]"
        >
          <PaletteIcon className="w-4 h-4" />
        </button>
      </div>
      {showPalette && (
        <div className="grid grid-cols-8 gap-1 p-2 bg-[#1a1a1a] rounded-lg border border-[#333]">
          {["#ffffff", "#000000", "#CDB49E", "#3b82f6", "#10b981", "#f97316", "#a855f7", "#f43f5e", "#6b7280", "#374151", "#1f2937", "#111827", "#fbbf24", "#84cc16", "#06b6d4", "#8b5cf6"].map((color) => (
            <button
              key={color}
              onClick={() => { onChange(color); setShowPalette(false); }}
              className="w-6 h-6 rounded border border-[#333] hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Slider with numeric input
function SliderInput({
  value,
  onChange,
  label,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
}: {
  value: number;
  onChange: (v: number) => void;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs text-[#888] block">{label}</label>}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-[#CDB49E]"
        />
        <span className="text-xs text-white w-12 text-right">{value}{unit}</span>
      </div>
    </div>
  );
}

// Button group selector
function ButtonGroup<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: T; icon?: React.ComponentType<any>; label?: string }[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs text-[#888] block">{label}</label>}
      <div className="flex gap-1">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={cn(
                "flex-1 p-2 rounded-lg border transition-colors flex items-center justify-center gap-1",
                value === opt.id
                  ? "bg-[#CDB49E]/10 border-[#CDB49E] text-[#CDB49E]"
                  : "border-[#333] text-[#666] hover:text-white hover:border-[#444]"
              )}
              title={opt.label}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {!Icon && opt.label && <span className="text-xs">{opt.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────── STYLE PANELS ─────────────────────────── */

function LayoutPanel({ 
  styles, 
  onChange 
}: { 
  styles: ElementStyles; 
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Display Type */}
      <ButtonGroup
        label="Display"
        options={[
          { id: "block", label: "Block" },
          { id: "flex", label: "Flex" },
          { id: "grid", label: "Grid" },
          { id: "inline", label: "Inline" },
          { id: "none", label: "None" },
        ]}
        value={(styles.display as any) || "block"}
        onChange={(v) => onChange("display", v)}
      />

      {/* Flex Direction */}
      {styles.display === "flex" && (
        <>
          <ButtonGroup
            label="Direction"
            options={[
              { id: "row", icon: Rows },
              { id: "row-reverse", icon: Rows },
              { id: "column", icon: Columns },
              { id: "column-reverse", icon: Columns },
            ]}
            value={(styles.flexDirection as any) || "row"}
            onChange={(v) => onChange("flexDirection", v)}
          />

          <ButtonGroup
            label="Justify"
            options={[
              { id: "flex-start", icon: AlignHorizontalJustifyStart },
              { id: "center", icon: AlignHorizontalJustifyCenter },
              { id: "flex-end", icon: AlignHorizontalJustifyEnd },
              { id: "space-between", icon: AlignHorizontalSpaceBetween },
              { id: "space-around", label: "Around" },
            ]}
            value={(styles.justifyContent as any) || "flex-start"}
            onChange={(v) => onChange("justifyContent", v)}
          />

          <ButtonGroup
            label="Align"
            options={[
              { id: "flex-start", icon: AlignStartVertical },
              { id: "center", icon: AlignCenterVertical },
              { id: "flex-end", icon: AlignEndVertical },
              { id: "stretch", label: "Stretch" },
            ]}
            value={(styles.alignItems as any) || "stretch"}
            onChange={(v) => onChange("alignItems", v)}
          />

          <ButtonGroup
            label="Wrap"
            options={[
              { id: "nowrap", label: "No Wrap" },
              { id: "wrap", label: "Wrap" },
              { id: "wrap-reverse", label: "Reverse" },
            ]}
            value={(styles.flexWrap as any) || "nowrap"}
            onChange={(v) => onChange("flexWrap", v)}
          />

          <div>
            <label className="text-xs text-[#888] mb-1.5 block">Gap</label>
            <SizeInput
              value={styles.gap || "0px"}
              onChange={(v) => onChange("gap", v)}
            />
          </div>
        </>
      )}

      {/* Grid Controls */}
      {styles.display === "grid" && (
        <>
          <div>
            <label className="text-xs text-[#888] mb-1.5 block">Columns</label>
            <input
              type="text"
              value={styles.gridTemplateColumns || ""}
              onChange={(e) => onChange("gridTemplateColumns", e.target.value)}
              placeholder="e.g., repeat(3, 1fr)"
              className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-[#888] mb-1.5 block">Rows</label>
            <input
              type="text"
              value={styles.gridTemplateRows || ""}
              onChange={(e) => onChange("gridTemplateRows", e.target.value)}
              placeholder="e.g., auto 1fr auto"
              className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-[#888] mb-1.5 block">Gap</label>
            <SizeInput
              value={styles.gap || "0px"}
              onChange={(v) => onChange("gap", v)}
            />
          </div>
        </>
      )}
    </div>
  );
}

function SizePanel({ 
  styles, 
  onChange 
}: { 
  styles: ElementStyles; 
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Width & Height */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#888] mb-1.5 block">Width</label>
          <SizeInput
            value={styles.width || "auto"}
            onChange={(v) => onChange("width", v)}
            units={["px", "%", "rem", "vw", "auto", "fit-content"]}
          />
        </div>
        <div>
          <label className="text-xs text-[#888] mb-1.5 block">Height</label>
          <SizeInput
            value={styles.height || "auto"}
            onChange={(v) => onChange("height", v)}
            units={["px", "%", "rem", "vh", "auto", "fit-content"]}
          />
        </div>
      </div>

      {/* Min/Max */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#888] mb-1.5 block">Min Width</label>
          <SizeInput
            value={styles.minWidth || "0"}
            onChange={(v) => onChange("minWidth", v)}
          />
        </div>
        <div>
          <label className="text-xs text-[#888] mb-1.5 block">Max Width</label>
          <SizeInput
            value={styles.maxWidth || "none"}
            onChange={(v) => onChange("maxWidth", v)}
            units={["px", "%", "rem", "vw", "none"]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#888] mb-1.5 block">Min Height</label>
          <SizeInput
            value={styles.minHeight || "0"}
            onChange={(v) => onChange("minHeight", v)}
          />
        </div>
        <div>
          <label className="text-xs text-[#888] mb-1.5 block">Max Height</label>
          <SizeInput
            value={styles.maxHeight || "none"}
            onChange={(v) => onChange("maxHeight", v)}
            units={["px", "%", "rem", "vh", "none"]}
          />
        </div>
      </div>

      {/* Aspect Ratio */}
      <div>
        <label className="text-xs text-[#888] mb-1.5 block">Aspect Ratio</label>
        <select
          value={styles.aspectRatio || "auto"}
          onChange={(e) => onChange("aspectRatio", e.target.value)}
          className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white"
        >
          <option value="auto">Auto</option>
          <option value="1/1">1:1 Square</option>
          <option value="16/9">16:9 Widescreen</option>
          <option value="4/3">4:3 Standard</option>
          <option value="3/2">3:2 Photo</option>
          <option value="21/9">21:9 Ultra-wide</option>
          <option value="9/16">9:16 Vertical</option>
        </select>
      </div>

      {/* Overflow */}
      <ButtonGroup
        label="Overflow"
        options={[
          { id: "visible", label: "Show" },
          { id: "hidden", label: "Hide" },
          { id: "scroll", label: "Scroll" },
          { id: "auto", label: "Auto" },
        ]}
        value={(styles.overflow as any) || "visible"}
        onChange={(v) => onChange("overflow", v)}
      />
    </div>
  );
}

function SpacingPanel({ 
  styles, 
  onChange 
}: { 
  styles: ElementStyles; 
  onChange: (key: string, value: string) => void;
}) {
  const [linkPadding, setLinkPadding] = useState(true);
  const [linkMargin, setLinkMargin] = useState(true);

  return (
    <div className="space-y-4">
      {/* Padding */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-[#888]">Padding</label>
          <button 
            onClick={() => setLinkPadding(!linkPadding)}
            className={cn("p-1 rounded", linkPadding ? "text-[#CDB49E]" : "text-[#555]")}
          >
            <Link className="w-3 h-3" />
          </button>
        </div>
        {linkPadding ? (
          <SizeInput
            value={styles.padding || "0px"}
            onChange={(v) => onChange("padding", v)}
          />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <SizeInput label="T" value={styles.paddingTop || "0px"} onChange={(v) => onChange("paddingTop", v)} />
            <SizeInput label="R" value={styles.paddingRight || "0px"} onChange={(v) => onChange("paddingRight", v)} />
            <SizeInput label="B" value={styles.paddingBottom || "0px"} onChange={(v) => onChange("paddingBottom", v)} />
            <SizeInput label="L" value={styles.paddingLeft || "0px"} onChange={(v) => onChange("paddingLeft", v)} />
          </div>
        )}
      </div>

      {/* Margin */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-[#888]">Margin</label>
          <button 
            onClick={() => setLinkMargin(!linkMargin)}
            className={cn("p-1 rounded", linkMargin ? "text-[#CDB49E]" : "text-[#555]")}
          >
            <Link className="w-3 h-3" />
          </button>
        </div>
        {linkMargin ? (
          <SizeInput
            value={styles.margin || "0px"}
            onChange={(v) => onChange("margin", v)}
            units={["px", "%", "rem", "auto"]}
          />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <SizeInput label="T" value={styles.marginTop || "0px"} onChange={(v) => onChange("marginTop", v)} />
            <SizeInput label="R" value={styles.marginRight || "0px"} onChange={(v) => onChange("marginRight", v)} />
            <SizeInput label="B" value={styles.marginBottom || "0px"} onChange={(v) => onChange("marginBottom", v)} />
            <SizeInput label="L" value={styles.marginLeft || "0px"} onChange={(v) => onChange("marginLeft", v)} />
          </div>
        )}
      </div>
    </div>
  );
}

function TypographyPanel({ 
  styles, 
  onChange 
}: { 
  styles: ElementStyles; 
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Font Family */}
      <div>
        <label className="text-xs text-[#888] mb-1.5 block">Font</label>
        <select
          value={styles.fontFamily || "Inter, sans-serif"}
          onChange={(e) => onChange("fontFamily", e.target.value)}
          className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white"
        >
          {FONTS.map((font) => (
            <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>
              {font.name}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size & Weight */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#888] mb-1.5 block">Size</label>
          <SizeInput
            value={styles.fontSize || "16px"}
            onChange={(v) => onChange("fontSize", v)}
            units={["px", "rem", "em", "%"]}
          />
        </div>
        <div>
          <label className="text-xs text-[#888] mb-1.5 block">Weight</label>
          <select
            value={styles.fontWeight || "400"}
            onChange={(e) => onChange("fontWeight", e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white"
          >
            {["100", "200", "300", "400", "500", "600", "700", "800", "900"].map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Line Height & Letter Spacing */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#888] mb-1.5 block">Line Height</label>
          <SizeInput
            value={styles.lineHeight || "1.5"}
            onChange={(v) => onChange("lineHeight", v)}
            units={["", "px", "%", "em"]}
          />
        </div>
        <div>
          <label className="text-xs text-[#888] mb-1.5 block">Letter Spacing</label>
          <SizeInput
            value={styles.letterSpacing || "0px"}
            onChange={(v) => onChange("letterSpacing", v)}
            units={["px", "em"]}
          />
        </div>
      </div>

      {/* Text Align */}
      <ButtonGroup
        label="Align"
        options={[
          { id: "left", icon: AlignLeft },
          { id: "center", icon: AlignCenter },
          { id: "right", icon: AlignRight },
        ]}
        value={(styles.textAlign as any) || "left"}
        onChange={(v) => onChange("textAlign", v)}
      />

      {/* Text Transform */}
      <ButtonGroup
        label="Transform"
        options={[
          { id: "none", label: "Aa" },
          { id: "uppercase", label: "AA" },
          { id: "lowercase", label: "aa" },
          { id: "capitalize", label: "Ab" },
        ]}
        value={(styles.textTransform as any) || "none"}
        onChange={(v) => onChange("textTransform", v)}
      />

      {/* Text Decoration */}
      <ButtonGroup
        label="Decoration"
        options={[
          { id: "none", label: "None" },
          { id: "underline", icon: Underline },
          { id: "line-through", label: "Strike" },
        ]}
        value={(styles.textDecoration as any) || "none"}
        onChange={(v) => onChange("textDecoration", v)}
      />

      {/* Color */}
      <ColorPicker
        label="Color"
        value={styles.color || "#ffffff"}
        onChange={(v) => onChange("color", v)}
      />
    </div>
  );
}

function BackgroundPanel({ 
  styles, 
  onChange 
}: { 
  styles: ElementStyles; 
  onChange: (key: string, value: string) => void;
}) {
  const [bgType, setBgType] = useState<"color" | "gradient" | "image">("color");

  return (
    <div className="space-y-4">
      {/* Background Type */}
      <ButtonGroup
        label="Type"
        options={[
          { id: "color", label: "Color" },
          { id: "gradient", label: "Gradient" },
          { id: "image", label: "Image" },
        ]}
        value={bgType}
        onChange={setBgType}
      />

      {bgType === "color" && (
        <ColorPicker
          label="Background Color"
          value={styles.backgroundColor || "transparent"}
          onChange={(v) => onChange("backgroundColor", v)}
        />
      )}

      {bgType === "gradient" && (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-[#888] mb-1.5 block">Gradient</label>
            <input
              type="text"
              value={styles.backgroundImage || ""}
              onChange={(e) => onChange("backgroundImage", e.target.value)}
              placeholder="linear-gradient(135deg, #6366f1, #8b5cf6)"
              className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white font-mono"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)",
              "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
              "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            ].map((gradient, i) => (
              <button
                key={i}
                onClick={() => onChange("backgroundImage", gradient)}
                className="h-8 rounded-lg border border-[#333] hover:border-[#CDB49E]"
                style={{ background: gradient }}
              />
            ))}
          </div>
        </div>
      )}

      {bgType === "image" && (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-[#888] mb-1.5 block">Image URL</label>
            <input
              type="text"
              value={styles.backgroundImage?.replace(/url\(['"]?|['"]?\)/g, "") || ""}
              onChange={(e) => onChange("backgroundImage", e.target.value ? `url('${e.target.value}')` : "")}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white"
            />
          </div>
          <div className="h-24 rounded-lg border-2 border-dashed border-[#333] flex flex-col items-center justify-center cursor-pointer hover:border-[#CDB49E]/50 transition-colors">
            <Upload className="w-6 h-6 text-[#555] mb-1" />
            <span className="text-xs text-[#555]">Upload Image</span>
          </div>
          <div>
            <label className="text-xs text-[#888] mb-1.5 block">Size</label>
            <select
              value={styles.backgroundSize || "cover"}
              onChange={(e) => onChange("backgroundSize", e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white"
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="auto">Auto</option>
              <option value="100% 100%">Stretch</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[#888] mb-1.5 block">Position</label>
            <select
              value={styles.backgroundPosition || "center"}
              onChange={(e) => onChange("backgroundPosition", e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white"
            >
              <option value="center">Center</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

function BorderPanel({ 
  styles, 
  onChange 
}: { 
  styles: ElementStyles; 
  onChange: (key: string, value: string) => void;
}) {
  const [linkRadius, setLinkRadius] = useState(true);

  return (
    <div className="space-y-4">
      {/* Border Width */}
      <SliderInput
        label="Width"
        value={parseInt(styles.borderWidth || "0")}
        onChange={(v) => onChange("borderWidth", v + "px")}
        max={20}
        unit="px"
      />

      {/* Border Style */}
      <ButtonGroup
        label="Style"
        options={[
          { id: "none", label: "None" },
          { id: "solid", label: "Solid" },
          { id: "dashed", label: "Dash" },
          { id: "dotted", label: "Dot" },
        ]}
        value={(styles.borderStyle as any) || "none"}
        onChange={(v) => onChange("borderStyle", v)}
      />

      {/* Border Color */}
      <ColorPicker
        label="Color"
        value={styles.borderColor || "#333333"}
        onChange={(v) => onChange("borderColor", v)}
      />

      {/* Border Radius */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-[#888]">Radius</label>
          <button 
            onClick={() => setLinkRadius(!linkRadius)}
            className={cn("p-1 rounded", linkRadius ? "text-[#CDB49E]" : "text-[#555]")}
          >
            <Link className="w-3 h-3" />
          </button>
        </div>
        {linkRadius ? (
          <SliderInput
            value={parseInt(styles.borderRadius || "0")}
            onChange={(v) => onChange("borderRadius", v + "px")}
            max={100}
            unit="px"
          />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <SizeInput label="TL" value={styles.borderTopLeftRadius || "0px"} onChange={(v) => onChange("borderTopLeftRadius", v)} />
            <SizeInput label="TR" value={styles.borderTopRightRadius || "0px"} onChange={(v) => onChange("borderTopRightRadius", v)} />
            <SizeInput label="BL" value={styles.borderBottomLeftRadius || "0px"} onChange={(v) => onChange("borderBottomLeftRadius", v)} />
            <SizeInput label="BR" value={styles.borderBottomRightRadius || "0px"} onChange={(v) => onChange("borderBottomRightRadius", v)} />
          </div>
        )}
      </div>
    </div>
  );
}

function EffectsPanel({ 
  styles, 
  onChange 
}: { 
  styles: ElementStyles; 
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Opacity */}
      <SliderInput
        label="Opacity"
        value={parseFloat(styles.opacity || "1") * 100}
        onChange={(v) => onChange("opacity", String(v / 100))}
        max={100}
        unit="%"
      />

      {/* Box Shadow Presets */}
      <div>
        <label className="text-xs text-[#888] mb-1.5 block">Shadow</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "None", value: "none" },
            { label: "SM", value: "0 1px 2px rgba(0,0,0,0.3)" },
            { label: "MD", value: "0 4px 12px rgba(0,0,0,0.3)" },
            { label: "LG", value: "0 10px 40px rgba(0,0,0,0.4)" },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => onChange("boxShadow", s.value)}
              className={cn(
                "py-2 text-xs rounded-lg border transition-colors",
                styles.boxShadow === s.value
                  ? "bg-[#CDB49E]/10 border-[#CDB49E] text-[#CDB49E]"
                  : "border-[#333] text-[#666] hover:text-white"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={styles.boxShadow || ""}
          onChange={(e) => onChange("boxShadow", e.target.value)}
          placeholder="Custom shadow..."
          className="w-full mt-2 px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white font-mono"
        />
      </div>

      {/* Blur & Filters */}
      <div>
        <label className="text-xs text-[#888] mb-1.5 block">Blur</label>
        <SliderInput
          value={parseInt(styles.filter?.match(/blur\((\d+)/)?.[1] || "0")}
          onChange={(v) => onChange("filter", v ? `blur(${v}px)` : "none")}
          max={50}
          unit="px"
        />
      </div>

      {/* Backdrop Blur (Glassmorphism) */}
      <div>
        <label className="text-xs text-[#888] mb-1.5 block">Backdrop Blur (Glass)</label>
        <SliderInput
          value={parseInt(styles.backdropFilter?.match(/blur\((\d+)/)?.[1] || "0")}
          onChange={(v) => onChange("backdropFilter", v ? `blur(${v}px)` : "none")}
          max={50}
          unit="px"
        />
      </div>

      {/* Blend Mode */}
      <div>
        <label className="text-xs text-[#888] mb-1.5 block">Blend Mode</label>
        <select
          value={styles.mixBlendMode || "normal"}
          onChange={(e) => onChange("mixBlendMode", e.target.value)}
          className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white"
        >
          {BLEND_MODES.map((mode) => (
            <option key={mode} value={mode}>{mode}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function TransformPanel({ 
  styles, 
  onChange 
}: { 
  styles: ElementStyles; 
  onChange: (key: string, value: string) => void;
}) {
  // Parse existing transform
  const parseTransform = (transform: string = "") => {
    const rotate = transform.match(/rotate\(([-\d.]+)/)?.[1] || "0";
    const scale = transform.match(/scale\(([-\d.]+)/)?.[1] || "1";
    const translateX = transform.match(/translateX\(([-\d.]+)/)?.[1] || "0";
    const translateY = transform.match(/translateY\(([-\d.]+)/)?.[1] || "0";
    const skewX = transform.match(/skewX\(([-\d.]+)/)?.[1] || "0";
    const skewY = transform.match(/skewY\(([-\d.]+)/)?.[1] || "0";
    return { rotate, scale, translateX, translateY, skewX, skewY };
  };

  const buildTransform = (updates: Partial<ReturnType<typeof parseTransform>>) => {
    const current = parseTransform(styles.transform);
    const merged = { ...current, ...updates };
    const parts = [];
    if (merged.rotate !== "0") parts.push(`rotate(${merged.rotate}deg)`);
    if (merged.scale !== "1") parts.push(`scale(${merged.scale})`);
    if (merged.translateX !== "0") parts.push(`translateX(${merged.translateX}px)`);
    if (merged.translateY !== "0") parts.push(`translateY(${merged.translateY}px)`);
    if (merged.skewX !== "0") parts.push(`skewX(${merged.skewX}deg)`);
    if (merged.skewY !== "0") parts.push(`skewY(${merged.skewY}deg)`);
    return parts.join(" ") || "none";
  };

  const t = parseTransform(styles.transform);

  return (
    <div className="space-y-4">
      {/* Rotate */}
      <SliderInput
        label="Rotate"
        value={parseInt(t.rotate)}
        onChange={(v) => onChange("transform", buildTransform({ rotate: String(v) }))}
        min={-180}
        max={180}
        unit="°"
      />

      {/* Scale */}
      <SliderInput
        label="Scale"
        value={parseFloat(t.scale) * 100}
        onChange={(v) => onChange("transform", buildTransform({ scale: String(v / 100) }))}
        min={0}
        max={200}
        unit="%"
      />

      {/* Translate */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#888] mb-1.5 block">Move X</label>
          <input
            type="number"
            value={parseInt(t.translateX)}
            onChange={(e) => onChange("transform", buildTransform({ translateX: e.target.value }))}
            className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white"
          />
        </div>
        <div>
          <label className="text-xs text-[#888] mb-1.5 block">Move Y</label>
          <input
            type="number"
            value={parseInt(t.translateY)}
            onChange={(e) => onChange("transform", buildTransform({ translateY: e.target.value }))}
            className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white"
          />
        </div>
      </div>

      {/* Skew */}
      <div className="grid grid-cols-2 gap-3">
        <SliderInput
          label="Skew X"
          value={parseInt(t.skewX)}
          onChange={(v) => onChange("transform", buildTransform({ skewX: String(v) }))}
          min={-45}
          max={45}
          unit="°"
        />
        <SliderInput
          label="Skew Y"
          value={parseInt(t.skewY)}
          onChange={(v) => onChange("transform", buildTransform({ skewY: String(v) }))}
          min={-45}
          max={45}
          unit="°"
        />
      </div>

      {/* Transform Origin */}
      <div>
        <label className="text-xs text-[#888] mb-1.5 block">Origin</label>
        <select
          value={styles.transformOrigin || "center"}
          onChange={(e) => onChange("transformOrigin", e.target.value)}
          className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white"
        >
          <option value="center">Center</option>
          <option value="top left">Top Left</option>
          <option value="top center">Top Center</option>
          <option value="top right">Top Right</option>
          <option value="bottom left">Bottom Left</option>
          <option value="bottom center">Bottom Center</option>
          <option value="bottom right">Bottom Right</option>
        </select>
      </div>

      {/* Reset */}
      <button
        onClick={() => onChange("transform", "none")}
        className="w-full py-2 text-xs text-[#888] hover:text-white border border-[#333] rounded-lg hover:border-[#444]"
      >
        <RotateCcw className="w-3 h-3 inline mr-1" />
        Reset Transform
      </button>
    </div>
  );
}

function PositionPanel({ 
  styles, 
  onChange 
}: { 
  styles: ElementStyles; 
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Position Type */}
      <ButtonGroup
        label="Position"
        options={[
          { id: "static", label: "Static" },
          { id: "relative", label: "Relative" },
          { id: "absolute", label: "Absolute" },
          { id: "fixed", label: "Fixed" },
          { id: "sticky", label: "Sticky" },
        ]}
        value={(styles.position as any) || "static"}
        onChange={(v) => onChange("position", v)}
      />

      {/* Position Values (for non-static) */}
      {styles.position && styles.position !== "static" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#888] mb-1.5 block">Top</label>
            <SizeInput
              value={styles.top || "auto"}
              onChange={(v) => onChange("top", v)}
              units={["px", "%", "auto"]}
            />
          </div>
          <div>
            <label className="text-xs text-[#888] mb-1.5 block">Right</label>
            <SizeInput
              value={styles.right || "auto"}
              onChange={(v) => onChange("right", v)}
              units={["px", "%", "auto"]}
            />
          </div>
          <div>
            <label className="text-xs text-[#888] mb-1.5 block">Bottom</label>
            <SizeInput
              value={styles.bottom || "auto"}
              onChange={(v) => onChange("bottom", v)}
              units={["px", "%", "auto"]}
            />
          </div>
          <div>
            <label className="text-xs text-[#888] mb-1.5 block">Left</label>
            <SizeInput
              value={styles.left || "auto"}
              onChange={(v) => onChange("left", v)}
              units={["px", "%", "auto"]}
            />
          </div>
        </div>
      )}

      {/* Z-Index */}
      <div>
        <label className="text-xs text-[#888] mb-1.5 block">Z-Index</label>
        <input
          type="number"
          value={styles.zIndex || "0"}
          onChange={(e) => onChange("zIndex", e.target.value)}
          className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white"
        />
      </div>
    </div>
  );
}

function AnimationPanel({ 
  animation,
  onChange 
}: { 
  animation?: AnimationConfig;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Hover Effect */}
      <div>
        <label className="text-xs text-[#888] mb-1.5 block">Hover Effect</label>
        <select
          value={animation?.hover || "none"}
          onChange={(e) => onChange("hover", e.target.value)}
          className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white"
        >
          {HOVER_EFFECTS.map((effect) => (
            <option key={effect.id} value={effect.id}>{effect.name}</option>
          ))}
        </select>
      </div>

      {/* Click Effect */}
      <div>
        <label className="text-xs text-[#888] mb-1.5 block">Click Effect</label>
        <select
          value={animation?.click || "none"}
          onChange={(e) => onChange("click", e.target.value)}
          className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white"
        >
          <option value="none">None</option>
          <option value="pulse">Pulse</option>
          <option value="bounce">Bounce</option>
          <option value="shake">Shake</option>
          <option value="ripple">Ripple</option>
        </select>
      </div>

      {/* Scroll Animation */}
      <div>
        <label className="text-xs text-[#888] mb-1.5 block">Scroll Animation</label>
        <select
          value={animation?.scroll || "none"}
          onChange={(e) => onChange("scroll", e.target.value)}
          className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white"
        >
          {SCROLL_ANIMATIONS.map((anim) => (
            <option key={anim.id} value={anim.id}>{anim.name}</option>
          ))}
        </select>
      </div>

      {/* Duration */}
      <SliderInput
        label="Duration"
        value={parseInt(animation?.duration || "300")}
        onChange={(v) => onChange("duration", String(v))}
        min={100}
        max={2000}
        step={100}
        unit="ms"
      />

      {/* Delay */}
      <SliderInput
        label="Delay"
        value={parseInt(animation?.delay || "0")}
        onChange={(v) => onChange("delay", String(v))}
        min={0}
        max={1000}
        step={50}
        unit="ms"
      />

      {/* Easing */}
      <div>
        <label className="text-xs text-[#888] mb-1.5 block">Easing</label>
        <select
          value={animation?.easing || "ease"}
          onChange={(e) => onChange("easing", e.target.value)}
          className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white"
        >
          {EASING_FUNCTIONS.map((ef) => (
            <option key={ef.id} value={ef.id}>{ef.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ─────────────────────────── LAYERS PANEL ─────────────────────────── */

function LayersPanel({
  sections,
  selectedId,
  onSelect,
  onReorder,
  onToggleHidden,
  onToggleLocked,
  onDelete,
  onDuplicate,
}: {
  sections: SectionData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onToggleHidden: (id: string) => void;
  onToggleLocked: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-[#222] flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[#888] uppercase">Layers</h3>
        <span className="text-[10px] text-[#555]">{sections.length} sections</span>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {sections.map((section, index) => (
          <div
            key={section.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null && dragIndex !== index) {
                onReorder(dragIndex, index);
              }
              setDragIndex(null);
            }}
            onClick={() => onSelect(section.id)}
            className={cn(
              "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors mb-1",
              selectedId === section.id
                ? "bg-[#CDB49E]/10 border border-[#CDB49E]/30"
                : "hover:bg-[#1a1a1a] border border-transparent",
              section.hidden && "opacity-40"
            )}
          >
            <GripVertical className="w-3 h-3 text-[#444] cursor-grab" />
            <Frame className="w-4 h-4 text-[#666]" />
            <span className="flex-1 text-xs text-white truncate">{section.name}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleHidden(section.id); }}
                className="p-1 text-[#555] hover:text-white rounded"
              >
                {section.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleLocked(section.id); }}
                className="p-1 text-[#555] hover:text-white rounded"
              >
                {section.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDuplicate(section.id); }}
                className="p-1 text-[#555] hover:text-white rounded"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(section.id); }}
                className="p-1 text-[#555] hover:text-red-400 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── MAIN STYLE PANEL ─────────────────────────── */

function MainStylePanel({
  element,
  styles,
  animation,
  onStyleChange,
  onAnimationChange,
  onDelete,
  onDuplicate,
}: {
  element: ElementData | null;
  styles: ElementStyles;
  animation?: AnimationConfig;
  onStyleChange: (key: string, value: string) => void;
  onAnimationChange: (key: string, value: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"layout" | "size" | "spacing" | "typography" | "background" | "border" | "effects" | "transform" | "position" | "animation">("layout");

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

  const tabs = [
    { id: "layout" as const, label: "Layout", icon: LayoutGrid },
    { id: "size" as const, label: "Size", icon: Maximize2 },
    { id: "spacing" as const, label: "Spacing", icon: Expand },
    { id: "typography" as const, label: "Text", icon: Type },
    { id: "background" as const, label: "Fill", icon: Droplets },
    { id: "border" as const, label: "Border", icon: SquareDashed },
    { id: "effects" as const, label: "Effects", icon: Sparkle },
    { id: "transform" as const, label: "Transform", icon: Move3D },
    { id: "position" as const, label: "Position", icon: Target },
    { id: "animation" as const, label: "Motion", icon: Play },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Element Info */}
      <div className="p-4 border-b border-[#222] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-[#CDB49E]/10 text-[#CDB49E] font-medium capitalize">
            {element.type}
          </span>
          <span className="text-xs text-[#666]">{element.name || element.id}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onDuplicate} className="p-1.5 text-[#666] hover:text-white rounded" title="Duplicate">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-[#666] hover:text-red-400 rounded" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-[#222]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                activeTab === tab.id
                  ? "bg-[#CDB49E]/10 text-[#CDB49E]"
                  : "text-[#555] hover:text-white hover:bg-[#1a1a1a]"
              )}
              title={tab.label}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === "layout" && <LayoutPanel styles={styles} onChange={onStyleChange} />}
        {activeTab === "size" && <SizePanel styles={styles} onChange={onStyleChange} />}
        {activeTab === "spacing" && <SpacingPanel styles={styles} onChange={onStyleChange} />}
        {activeTab === "typography" && <TypographyPanel styles={styles} onChange={onStyleChange} />}
        {activeTab === "background" && <BackgroundPanel styles={styles} onChange={onStyleChange} />}
        {activeTab === "border" && <BorderPanel styles={styles} onChange={onStyleChange} />}
        {activeTab === "effects" && <EffectsPanel styles={styles} onChange={onStyleChange} />}
        {activeTab === "transform" && <TransformPanel styles={styles} onChange={onStyleChange} />}
        {activeTab === "position" && <PositionPanel styles={styles} onChange={onStyleChange} />}
        {activeTab === "animation" && <AnimationPanel animation={animation} onChange={onAnimationChange} />}
      </div>
    </div>
  );
}

/* ─────────────────────────── SETTINGS PANEL ─────────────────────────── */

function SettingsPanel() {
  return (
    <div className="p-4 space-y-6 overflow-auto">
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
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-[#555] uppercase">Color Scheme</h4>
        <div className="grid grid-cols-2 gap-3">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              className="p-2 rounded-lg border border-[#333] hover:border-[#CDB49E] transition-colors text-left"
            >
              <div className="flex gap-1 mb-2">
                {preset.colors.map((color, i) => (
                  <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                ))}
              </div>
              <span className="text-xs text-[#888]">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-[#555] uppercase">Typography</h4>
        <div>
          <label className="text-xs text-[#888] mb-1 block">Heading Font</label>
          <select className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
            {FONTS.map((font) => (
              <option key={font.name} value={font.value}>{font.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-[#888] mb-1 block">Body Font</label>
          <select className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
            {FONTS.map((font) => (
              <option key={font.name} value={font.value}>{font.name}</option>
            ))}
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

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-[#555] uppercase">Custom Code</h4>
        <div>
          <label className="text-xs text-[#888] mb-1 block">Head Code</label>
          <textarea placeholder="<script> or <link> tags" rows={3} className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white resize-none font-mono" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── COMPONENT PANEL ─────────────────────────── */

function ComponentsPanel({
  onAddComponent,
}: {
  onAddComponent: (type: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredComponents = Object.entries(COMPONENT_LIBRARY).map(([category, components]) => ({
    category,
    components: components.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((g) => g.components.length > 0);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-[#222]">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search components..."
          className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder-[#555]"
        />
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {filteredComponents.map(({ category, components }) => (
          <div key={category}>
            <h4 className="text-[10px] font-semibold text-[#444] uppercase mb-2">{category}</h4>
            <div className="grid grid-cols-2 gap-2">
              {components.map((comp) => {
                const Icon = comp.icon;
                return (
                  <button
                    key={comp.id}
                    onClick={() => onAddComponent(comp.id)}
                    className="p-3 rounded-lg border border-[#2a2a2a] hover:border-[#CDB49E]/50 transition-colors text-center group"
                    title={comp.description}
                  >
                    <Icon className="w-5 h-5 text-[#666] group-hover:text-[#CDB49E] mx-auto mb-1 transition-colors" />
                    <span className="text-[10px] text-[#888]">{comp.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export default function WebsitePage() {
  // View state
  const [view, setView] = useState<"templates" | "editor">("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Editor state
  const [sections, setSections] = useState<SectionData[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  const [elementStyles, setElementStyles] = useState<ElementStyles>({});
  const [elementAnimation, setElementAnimation] = useState<AnimationConfig>({});
  
  // UI state
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [leftPanel, setLeftPanel] = useState<"components" | "layers">("components");
  const [rightPanel, setRightPanel] = useState<"style" | "settings">("style");
  const [zoom, setZoom] = useState(100);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  
  // History for undo/redo
  const [history, setHistory] = useState<{ past: SectionData[][]; future: SectionData[][] }>({ past: [], future: [] });
  
  // Editable content state
  const [content, setContent] = useState({
    brandName: "Atlas",
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

  // Initialize with demo content when template selected
  useEffect(() => {
    if (selectedTemplate && view === "editor") {
      const initialSections: SectionData[] = [
        {
          id: "section-nav",
          name: "Navigation",
          elements: [],
          styles: { padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #222" },
        },
        {
          id: "section-hero",
          name: "Hero",
          elements: [],
          styles: { padding: "96px 32px", textAlign: "center" },
        },
        {
          id: "section-features",
          name: "Features",
          elements: [],
          styles: { padding: "80px 32px", backgroundColor: "#111" },
        },
      ];
      setSections(initialSections);
    }
  }, [selectedTemplate, view]);

  // Handlers
  const updateContent = (key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const handleStyleChange = (key: string, value: string) => {
    setElementStyles((prev) => ({ ...prev, [key]: value }));
  };

  const handleAnimationChange = (key: string, value: string) => {
    setElementAnimation((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddComponent = (type: string) => {
    // Add component logic
    console.log("Add component:", type);
  };

  const handleReorderSections = (fromIndex: number, toIndex: number) => {
    const newSections = [...sections];
    const [moved] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, moved);
    setSections(newSections);
  };

  const handleToggleSectionHidden = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, hidden: !s.hidden } : s))
    );
  };

  const handleToggleSectionLocked = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, locked: !s.locked } : s))
    );
  };

  const handleDeleteSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (selectedSectionId === id) setSelectedSectionId(null);
  };

  const handleDuplicateSection = (id: string) => {
    const section = sections.find((s) => s.id === id);
    if (section) {
      const newSection = {
        ...section,
        id: `section-${Date.now()}`,
        name: `${section.name} Copy`,
      };
      const index = sections.findIndex((s) => s.id === id);
      const newSections = [...sections];
      newSections.splice(index + 1, 0, newSection);
      setSections(newSections);
    }
  };

  const undo = useCallback(() => {
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    setHistory({
      past: history.past.slice(0, -1),
      future: [sections, ...history.future],
    });
    setSections(previous);
  }, [history, sections]);

  const redo = useCallback(() => {
    if (history.future.length === 0) return;
    const next = history.future[0];
    setHistory({
      past: [...history.past, sections],
      future: history.future.slice(1),
    });
    setSections(next);
  }, [history, sections]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // ─────────────────────────── TEMPLATE GALLERY ───────────────────────────

  if (view === "templates") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CDB49E]/10 text-[#CDB49E] text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Professional Templates
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Choose Your Starting Point</h1>
            <p className="text-lg text-[#888]">Start with a professional design, customize everything visually</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  className="group relative bg-[#111] border border-[#2a2a2a] rounded-2xl overflow-hidden hover:border-[#CDB49E]/50 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    setView("editor");
                  }}
                >
                  <div className="relative h-40" style={{ background: template.preview }}>
                    {template.popular && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500 text-[10px] font-bold text-black">
                        POPULAR
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <span className="px-5 py-2.5 rounded-xl bg-[#CDB49E] text-black text-sm font-semibold">
                        Use Template
                      </span>
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
              onClick={() => {
                setSelectedTemplate("blank");
                setView("editor");
              }}
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

  // ─────────────────────────── EDITOR ───────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* ═══════════ TOOLBAR ═══════════ */}
      <div className="h-12 bg-[#111] border-b border-[#222] flex items-center justify-between px-4 flex-shrink-0">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView("templates")}
            className="flex items-center gap-2 text-sm text-[#888] hover:text-white"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Templates
          </button>
          <div className="h-5 w-px bg-[#333]" />
          <span className="text-sm font-medium text-white">My Website</span>
          <div className="h-5 w-px bg-[#333]" />
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={history.past.length === 0}
              className="p-1.5 text-[#666] hover:text-white disabled:opacity-30 rounded"
              title="Undo (⌘Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={history.future.length === 0}
              className="p-1.5 text-[#666] hover:text-white disabled:opacity-30 rounded"
              title="Redo (⌘⇧Z)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center */}
        <div className="flex items-center gap-3">
          {/* Zoom */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
            <button onClick={() => setZoom(Math.max(25, zoom - 25))} className="text-[#888] hover:text-white">
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-xs text-white w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(200, zoom + 25))} className="text-[#888] hover:text-white">
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          {/* Device Preview */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
            {[
              { id: "desktop" as const, icon: Monitor },
              { id: "tablet" as const, icon: Tablet },
              { id: "mobile" as const, icon: Smartphone },
            ].map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setDevicePreview(id)}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  devicePreview === id ? "bg-[#CDB49E]/10 text-[#CDB49E]" : "text-[#555] hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className={cn("p-2 rounded-lg transition-colors", showLeftPanel ? "text-[#CDB49E]" : "text-[#555] hover:text-white")}
          >
            <PanelLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className={cn("p-2 rounded-lg transition-colors", showRightPanel ? "text-[#CDB49E]" : "text-[#555] hover:text-white")}
          >
            <PanelRight className="w-4 h-4" />
          </button>
          <div className="h-5 w-px bg-[#333]" />
          <button className="px-3 py-1.5 text-xs text-[#888] hover:text-white border border-[#333] rounded-lg">
            <Eye className="w-4 h-4 inline mr-1" />
            Preview
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
            <Rocket className="w-4 h-4" />
            Publish
          </button>
        </div>
      </div>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ═══════════ LEFT PANEL ═══════════ */}
        {showLeftPanel && (
          <div className="w-64 bg-[#111] border-r border-[#222] flex flex-col flex-shrink-0">
            {/* Panel Tabs */}
            <div className="flex border-b border-[#222]">
              <button
                onClick={() => setLeftPanel("components")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 text-xs transition-colors",
                  leftPanel === "components" ? "text-[#CDB49E] border-b-2 border-[#CDB49E]" : "text-[#666] hover:text-white"
                )}
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
              <button
                onClick={() => setLeftPanel("layers")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 text-xs transition-colors",
                  leftPanel === "layers" ? "text-[#CDB49E] border-b-2 border-[#CDB49E]" : "text-[#666] hover:text-white"
                )}
              >
                <Layers className="w-4 h-4" />
                Layers
              </button>
            </div>

            {/* Panel Content */}
            {leftPanel === "components" ? (
              <ComponentsPanel onAddComponent={handleAddComponent} />
            ) : (
              <LayersPanel
                sections={sections}
                selectedId={selectedSectionId}
                onSelect={setSelectedSectionId}
                onReorder={handleReorderSections}
                onToggleHidden={handleToggleSectionHidden}
                onToggleLocked={handleToggleSectionLocked}
                onDelete={handleDeleteSection}
                onDuplicate={handleDuplicateSection}
              />
            )}
          </div>
        )}

        {/* ═══════════ CANVAS ═══════════ */}
        <div className="flex-1 bg-[#1a1a1a] overflow-auto p-8 flex items-start justify-center">
          <div
            className={cn(
              "bg-[#0a0a0a] rounded-xl shadow-2xl overflow-hidden transition-all duration-300",
              devicePreview === "desktop" && "w-full max-w-5xl",
              devicePreview === "tablet" && "w-[768px]",
              devicePreview === "mobile" && "w-[375px]"
            )}
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          >
            {/* Navigation */}
            <nav className="flex items-center justify-between px-8 py-4 border-b border-[#222]">
              <InlineEditor
                value={content.brandName}
                onChange={(v) => updateContent("brandName", v)}
                style={{ fontSize: "20px", fontWeight: "700", color: "#CDB49E" }}
              />
              <div className="flex items-center gap-6 text-sm text-[#888]">
                {["Home", "Features", "Pricing", "Contact"].map((item) => (
                  <InlineEditor key={item} value={item} onChange={() => {}} style={{ fontSize: "14px" }} />
                ))}
              </div>
              <button
                onClick={() => setSelectedElement({ id: "nav-cta", type: "button", content: "Get Started", styles: {} })}
                className={cn(
                  "px-4 py-2 text-sm font-medium bg-[#CDB49E] text-black rounded-lg transition-all",
                  selectedElement?.id === "nav-cta" && "ring-2 ring-[#CDB49E] ring-offset-2 ring-offset-[#0a0a0a]"
                )}
              >
                Get Started
              </button>
            </nav>

            {/* Hero Section */}
            <section
              className={cn(
                "px-8 py-24 text-center cursor-pointer transition-all",
                selectedSectionId === "section-hero" && "ring-2 ring-[#CDB49E] ring-inset"
              )}
              onClick={() => setSelectedSectionId("section-hero")}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement({ id: "hero-heading", type: "heading", content: content.heroHeading, styles: {} });
                  setElementStyles({ fontSize: "48px", fontWeight: "700", color: "#ffffff" });
                }}
                className={cn(
                  "mb-6 cursor-pointer transition-all",
                  selectedElement?.id === "hero-heading" && "ring-2 ring-[#CDB49E] ring-offset-4 ring-offset-[#0a0a0a] rounded"
                )}
              >
                <InlineEditor
                  value={content.heroHeading}
                  onChange={(v) => updateContent("heroHeading", v)}
                  style={selectedElement?.id === "hero-heading" ? elementStyles as React.CSSProperties : { fontSize: "48px", fontWeight: "700", color: "#ffffff" }}
                />
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement({ id: "hero-sub", type: "text", content: content.heroSubheading, styles: {} });
                  setElementStyles({ fontSize: "18px", color: "#888888" });
                }}
                className={cn(
                  "max-w-2xl mx-auto mb-8 cursor-pointer transition-all",
                  selectedElement?.id === "hero-sub" && "ring-2 ring-[#CDB49E] ring-offset-4 ring-offset-[#0a0a0a] rounded"
                )}
              >
                <InlineEditor
                  value={content.heroSubheading}
                  onChange={(v) => updateContent("heroSubheading", v)}
                  style={selectedElement?.id === "hero-sub" ? elementStyles as React.CSSProperties : { fontSize: "18px", color: "#888888" }}
                  multiline
                />
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement({ id: "hero-btn1", type: "button", content: content.heroButton, styles: {} });
                    setElementStyles({ backgroundColor: "#CDB49E", color: "#111111", padding: "16px 32px", borderRadius: "12px" });
                  }}
                  className={cn(
                    "transition-all",
                    selectedElement?.id === "hero-btn1" && "ring-2 ring-[#CDB49E] ring-offset-2 ring-offset-[#0a0a0a]"
                  )}
                  style={
                    selectedElement?.id === "hero-btn1"
                      ? { ...(elementStyles as React.CSSProperties) }
                      : { padding: "16px 32px", fontSize: "14px", fontWeight: "600", backgroundColor: "#CDB49E", color: "#111", borderRadius: "12px" }
                  }
                >
                  <InlineEditor value={content.heroButton} onChange={(v) => updateContent("heroButton", v)} style={{ display: "inline" }} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement({ id: "hero-btn2", type: "button", content: content.heroButton2, styles: {} });
                    setElementStyles({ backgroundColor: "transparent", color: "#CDB49E", border: "2px solid #CDB49E", padding: "16px 32px", borderRadius: "12px" });
                  }}
                  className={cn(
                    "transition-all",
                    selectedElement?.id === "hero-btn2" && "ring-2 ring-[#CDB49E] ring-offset-2 ring-offset-[#0a0a0a]"
                  )}
                  style={
                    selectedElement?.id === "hero-btn2"
                      ? { ...(elementStyles as React.CSSProperties) }
                      : { padding: "16px 32px", fontSize: "14px", fontWeight: "600", backgroundColor: "transparent", color: "#CDB49E", border: "2px solid #CDB49E", borderRadius: "12px" }
                  }
                >
                  <InlineEditor value={content.heroButton2} onChange={(v) => updateContent("heroButton2", v)} style={{ display: "inline" }} />
                </button>
              </div>
            </section>

            {/* Features Section */}
            <section
              className={cn(
                "px-8 py-20 bg-[#111] cursor-pointer transition-all",
                selectedSectionId === "section-features" && "ring-2 ring-[#CDB49E] ring-inset"
              )}
              onClick={() => setSelectedSectionId("section-features")}
            >
              <h2 className="text-3xl font-bold text-center text-white mb-4">
                <InlineEditor value="Powerful Features" onChange={() => {}} />
              </h2>
              <p className="text-center text-[#888] mb-12">
                <InlineEditor value="Everything you need to build professional websites" onChange={() => {}} />
              </p>
              <div className={cn("grid gap-8", devicePreview === "mobile" ? "grid-cols-1" : "grid-cols-3")}>
                {[
                  { key: "feature1", icon: "🎨" },
                  { key: "feature2", icon: "📱" },
                  { key: "feature3", icon: "⚡" },
                ].map((f, i) => (
                  <div key={i} className="p-6 rounded-xl bg-[#0a0a0a] text-center">
                    <div className="text-4xl mb-4">{f.icon}</div>
                    <h3 className="font-semibold text-white mb-2">
                      <InlineEditor
                        value={content[`${f.key}Title` as keyof typeof content]}
                        onChange={(v) => updateContent(`${f.key}Title`, v)}
                      />
                    </h3>
                    <p className="text-sm text-[#888]">
                      <InlineEditor
                        value={content[`${f.key}Desc` as keyof typeof content]}
                        onChange={(v) => updateContent(`${f.key}Desc`, v)}
                      />
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <section className="px-8 py-20 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                <InlineEditor value="Ready to Get Started?" onChange={() => {}} />
              </h2>
              <p className="text-[#888] mb-8 max-w-xl mx-auto">
                <InlineEditor value="Join thousands of businesses already using our platform to build amazing websites." onChange={() => {}} multiline />
              </p>
              <button className="px-8 py-4 bg-[#CDB49E] text-black rounded-xl font-semibold text-lg hover:bg-[#d4c0ad] transition-colors">
                Start Free Trial
              </button>
            </section>

            {/* Footer */}
            <footer className="px-8 py-8 border-t border-[#222] text-center text-sm text-[#666]">
              © 2026 {content.brandName}. All rights reserved.
            </footer>
          </div>
        </div>

        {/* ═══════════ RIGHT PANEL ═══════════ */}
        {showRightPanel && (
          <div className="w-80 bg-[#111] border-l border-[#222] flex flex-col flex-shrink-0">
            {/* Panel Tabs */}
            <div className="flex border-b border-[#222]">
              <button
                onClick={() => setRightPanel("style")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 text-xs transition-colors",
                  rightPanel === "style" ? "text-[#CDB49E] border-b-2 border-[#CDB49E]" : "text-[#666] hover:text-white"
                )}
              >
                <Paintbrush className="w-4 h-4" />
                Style
              </button>
              <button
                onClick={() => setRightPanel("settings")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 text-xs transition-colors",
                  rightPanel === "settings" ? "text-[#CDB49E] border-b-2 border-[#CDB49E]" : "text-[#666] hover:text-white"
                )}
              >
                <Settings2 className="w-4 h-4" />
                Settings
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-hidden">
              {rightPanel === "style" ? (
                <MainStylePanel
                  element={selectedElement}
                  styles={elementStyles}
                  animation={elementAnimation}
                  onStyleChange={handleStyleChange}
                  onAnimationChange={handleAnimationChange}
                  onDelete={() => setSelectedElement(null)}
                  onDuplicate={() => {}}
                />
              ) : (
                <SettingsPanel />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
