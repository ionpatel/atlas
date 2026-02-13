"use client";

import { useEffect, useState, useRef } from "react";
import { useWebsiteStore } from "@/stores/website-store";
import {
  Globe, Plus, Eye, EyeOff, Trash2, Copy, GripVertical, Layout, Type, Image as ImageIcon, Users, DollarSign,
  MessageSquare, Mail, Grid, Star, Zap, ExternalLink, Palette, FileText, Home, Monitor, Smartphone,
  Tablet, Check, ChevronRight, ChevronDown, ChevronUp, Sparkles, Settings2, Paintbrush, LayoutTemplate, X, Rocket, Link2,
  Shield, BarChart3, Search, Layers, RefreshCw, Upload, CheckCircle, ArrowRight, Move, MousePointer,
  Building2, Briefcase, ShoppingBag, Camera, Utensils, GraduationCap, Dumbbell, Phone, MapPin,
  Clock, Facebook, Twitter, Instagram, Linkedin, Youtube, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Square, Circle, Triangle, Play, Pause, Video, Music, Code,
  Maximize2, Minimize2, RotateCw, FlipHorizontal, FlipVertical, Lock, Unlock, Droplet, Sun, Moon,
  Sliders, Box, Columns, Rows, ArrowUp, ArrowDown, CornerUpLeft, CornerUpRight, Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════ STYLE SYSTEM ═══════════════════════ */

interface ElementStyles {
  // Typography
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  textAlign: string;
  textTransform: string;
  textDecoration: string;
  color: string;
  // Spacing
  marginTop: string;
  marginRight: string;
  marginBottom: string;
  marginLeft: string;
  paddingTop: string;
  paddingRight: string;
  paddingBottom: string;
  paddingLeft: string;
  // Background
  backgroundColor: string;
  backgroundImage: string;
  backgroundSize: string;
  backgroundPosition: string;
  backgroundOverlay: string;
  // Border
  borderWidth: string;
  borderStyle: string;
  borderColor: string;
  borderRadius: string;
  borderTopLeftRadius: string;
  borderTopRightRadius: string;
  borderBottomRightRadius: string;
  borderBottomLeftRadius: string;
  // Shadow
  boxShadow: string;
  shadowX: string;
  shadowY: string;
  shadowBlur: string;
  shadowSpread: string;
  shadowColor: string;
  // Effects
  opacity: string;
  filter: string;
  backdropFilter: string;
  // Animation
  transition: string;
  hoverScale: string;
  hoverOpacity: string;
  hoverBackground: string;
  hoverColor: string;
  hoverShadow: string;
  hoverBorderColor: string;
  // Layout
  display: string;
  flexDirection: string;
  justifyContent: string;
  alignItems: string;
  gap: string;
  width: string;
  height: string;
  minWidth: string;
  maxWidth: string;
}

const defaultStyles: ElementStyles = {
  fontFamily: "Inter",
  fontSize: "16px",
  fontWeight: "400",
  lineHeight: "1.5",
  letterSpacing: "0",
  textAlign: "left",
  textTransform: "none",
  textDecoration: "none",
  color: "#ffffff",
  marginTop: "0",
  marginRight: "0",
  marginBottom: "0",
  marginLeft: "0",
  paddingTop: "16px",
  paddingRight: "16px",
  paddingBottom: "16px",
  paddingLeft: "16px",
  backgroundColor: "transparent",
  backgroundImage: "",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundOverlay: "",
  borderWidth: "0",
  borderStyle: "solid",
  borderColor: "#333333",
  borderRadius: "12px",
  borderTopLeftRadius: "12px",
  borderTopRightRadius: "12px",
  borderBottomRightRadius: "12px",
  borderBottomLeftRadius: "12px",
  boxShadow: "none",
  shadowX: "0",
  shadowY: "4",
  shadowBlur: "16",
  shadowSpread: "0",
  shadowColor: "rgba(0,0,0,0.25)",
  opacity: "1",
  filter: "none",
  backdropFilter: "none",
  transition: "all 0.3s ease",
  hoverScale: "1",
  hoverOpacity: "1",
  hoverBackground: "",
  hoverColor: "",
  hoverShadow: "",
  hoverBorderColor: "",
  display: "block",
  flexDirection: "row",
  justifyContent: "flex-start",
  alignItems: "stretch",
  gap: "16px",
  width: "auto",
  height: "auto",
  minWidth: "0",
  maxWidth: "none",
};

const FONT_FAMILIES = [
  "Inter", "Plus Jakarta Sans", "Manrope", "Space Grotesk", "DM Sans", "Poppins",
  "Outfit", "Lato", "Playfair Display", "Montserrat", "Roboto", "Open Sans",
  "Raleway", "Oswald", "Merriweather", "Source Sans Pro", "Nunito", "Ubuntu"
];

const FONT_WEIGHTS = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];
const FONT_SIZES = ["10px", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "40px", "48px", "56px", "64px", "72px", "80px", "96px"];
const LINE_HEIGHTS = ["1", "1.2", "1.4", "1.5", "1.6", "1.75", "2"];
const LETTER_SPACINGS = ["-0.05em", "-0.025em", "0", "0.025em", "0.05em", "0.1em", "0.2em"];

const EASING_OPTIONS = [
  { label: "Linear", value: "linear" },
  { label: "Ease", value: "ease" },
  { label: "Ease In", value: "ease-in" },
  { label: "Ease Out", value: "ease-out" },
  { label: "Ease In Out", value: "ease-in-out" },
  { label: "Spring", value: "cubic-bezier(0.68, -0.55, 0.265, 1.55)" },
  { label: "Bounce", value: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
];

const SCROLL_ANIMATIONS = [
  { label: "None", value: "none" },
  { label: "Fade In", value: "fade-in" },
  { label: "Fade Up", value: "fade-up" },
  { label: "Fade Down", value: "fade-down" },
  { label: "Slide Left", value: "slide-left" },
  { label: "Slide Right", value: "slide-right" },
  { label: "Zoom In", value: "zoom-in" },
  { label: "Zoom Out", value: "zoom-out" },
  { label: "Flip", value: "flip" },
  { label: "Rotate", value: "rotate" },
];

/* ═══════════════════════ STYLE PANEL COMPONENTS ═══════════════════════ */

function StyleSection({ title, icon: Icon, children, defaultOpen = false }: { title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#222]">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#1a1a1a] transition-colors">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-[#CDB49E]" />
          <span className="text-sm font-medium text-white">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-[#555]" /> : <ChevronDown className="w-4 h-4 text-[#555]" />}
      </button>
      {isOpen && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function StyleInput({ label, value, onChange, type = "text", suffix, options }: { label: string; value: string; onChange: (v: string) => void; type?: string; suffix?: string; options?: string[] }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-[#888] flex-shrink-0">{label}</span>
      <div className="flex items-center gap-1">
        {options ? (
          <select value={value} onChange={(e) => onChange(e.target.value)} className="w-24 px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : type === "color" ? (
          <div className="flex items-center gap-1">
            <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded border border-[#333] bg-transparent cursor-pointer" />
            <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-20 px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white font-mono" />
          </div>
        ) : (
          <div className="flex items-center">
            <input type={type} value={value.replace(/[^\d.-]/g, '')} onChange={(e) => onChange(e.target.value + (suffix || ''))} className="w-16 px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white text-right" />
            {suffix && <span className="text-[10px] text-[#555] ml-1">{suffix}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function SpacingBox({ label, values, onChange }: { label: string; values: { top: string; right: string; bottom: string; left: string }; onChange: (side: string, value: string) => void }) {
  return (
    <div>
      <span className="text-xs text-[#888] block mb-2">{label}</span>
      <div className="relative w-full aspect-[2/1] bg-[#1a1a1a] rounded-lg border border-[#333] flex items-center justify-center">
        {/* Top */}
        <input type="text" value={values.top.replace(/[^\d]/g, '')} onChange={(e) => onChange('top', e.target.value + 'px')} className="absolute top-1 left-1/2 -translate-x-1/2 w-12 text-center text-xs bg-transparent text-[#CDB49E] border-b border-[#333] focus:outline-none" />
        {/* Right */}
        <input type="text" value={values.right.replace(/[^\d]/g, '')} onChange={(e) => onChange('right', e.target.value + 'px')} className="absolute right-1 top-1/2 -translate-y-1/2 w-12 text-center text-xs bg-transparent text-[#CDB49E] border-b border-[#333] focus:outline-none" />
        {/* Bottom */}
        <input type="text" value={values.bottom.replace(/[^\d]/g, '')} onChange={(e) => onChange('bottom', e.target.value + 'px')} className="absolute bottom-1 left-1/2 -translate-x-1/2 w-12 text-center text-xs bg-transparent text-[#CDB49E] border-b border-[#333] focus:outline-none" />
        {/* Left */}
        <input type="text" value={values.left.replace(/[^\d]/g, '')} onChange={(e) => onChange('left', e.target.value + 'px')} className="absolute left-1 top-1/2 -translate-y-1/2 w-12 text-center text-xs bg-transparent text-[#CDB49E] border-b border-[#333] focus:outline-none" />
        {/* Center */}
        <div className="w-12 h-6 rounded bg-[#333] flex items-center justify-center">
          <span className="text-[10px] text-[#666]">{label}</span>
        </div>
      </div>
    </div>
  );
}

function BorderRadiusControl({ values, onChange }: { values: { tl: string; tr: string; br: string; bl: string }; onChange: (corner: string, value: string) => void }) {
  const [linked, setLinked] = useState(true);
  const allSame = values.tl === values.tr && values.tr === values.br && values.br === values.bl;

  const handleChange = (corner: string, value: string) => {
    if (linked) {
      onChange('tl', value);
      onChange('tr', value);
      onChange('br', value);
      onChange('bl', value);
    } else {
      onChange(corner, value);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#888]">Border Radius</span>
        <button onClick={() => setLinked(!linked)} className={cn("p-1 rounded", linked ? "text-[#CDB49E]" : "text-[#555]")}>
          {linked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
        </button>
      </div>
      {linked ? (
        <input type="range" min="0" max="50" value={parseInt(values.tl) || 0} onChange={(e) => handleChange('tl', e.target.value + 'px')} className="w-full accent-[#CDB49E]" />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <input type="text" value={values.tl} onChange={(e) => handleChange('tl', e.target.value)} placeholder="TL" className="px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white text-center" />
          <input type="text" value={values.tr} onChange={(e) => handleChange('tr', e.target.value)} placeholder="TR" className="px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white text-center" />
          <input type="text" value={values.bl} onChange={(e) => handleChange('bl', e.target.value)} placeholder="BL" className="px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white text-center" />
          <input type="text" value={values.br} onChange={(e) => handleChange('br', e.target.value)} placeholder="BR" className="px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white text-center" />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ FULL STYLE PANEL ═══════════════════════ */

function FullStylePanel({ styles, setStyles, elementType }: { styles: ElementStyles; setStyles: (s: ElementStyles) => void; elementType: string }) {
  const updateStyle = (key: keyof ElementStyles, value: string) => {
    setStyles({ ...styles, [key]: value });
  };

  return (
    <div className="h-full overflow-auto">
      {/* Element Type Badge */}
      <div className="px-4 py-3 border-b border-[#222] flex items-center justify-between">
        <span className="text-xs px-2 py-1 rounded-full bg-[#CDB49E]/10 text-[#CDB49E] font-medium">{elementType}</span>
        <button className="text-xs text-[#555] hover:text-white">Reset All</button>
      </div>

      {/* Typography */}
      <StyleSection title="Typography" icon={Type} defaultOpen>
        <div className="space-y-3">
          <div>
            <span className="text-xs text-[#888] block mb-1.5">Font Family</span>
            <select value={styles.fontFamily} onChange={(e) => updateStyle('fontFamily', e.target.value)} className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
              {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-[#888] block mb-1">Size</span>
              <select value={styles.fontSize} onChange={(e) => updateStyle('fontSize', e.target.value)} className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
                {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <span className="text-xs text-[#888] block mb-1">Weight</span>
              <select value={styles.fontWeight} onChange={(e) => updateStyle('fontWeight', e.target.value)} className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
                {FONT_WEIGHTS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-[#888] block mb-1">Line Height</span>
              <select value={styles.lineHeight} onChange={(e) => updateStyle('lineHeight', e.target.value)} className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
                {LINE_HEIGHTS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <span className="text-xs text-[#888] block mb-1">Letter Spacing</span>
              <select value={styles.letterSpacing} onChange={(e) => updateStyle('letterSpacing', e.target.value)} className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
                {LETTER_SPACINGS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <span className="text-xs text-[#888] block mb-1.5">Text Align</span>
            <div className="flex gap-1">
              {[{ icon: AlignLeft, value: 'left' }, { icon: AlignCenter, value: 'center' }, { icon: AlignRight, value: 'right' }, { icon: AlignJustify, value: 'justify' }].map(({ icon: Icon, value }) => (
                <button key={value} onClick={() => updateStyle('textAlign', value)} className={cn("flex-1 p-2 rounded-lg border transition-colors", styles.textAlign === value ? "bg-[#CDB49E]/10 border-[#CDB49E] text-[#CDB49E]" : "border-[#333] text-[#666] hover:text-white")}>
                  <Icon className="w-4 h-4 mx-auto" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-[#888] block mb-1.5">Text Style</span>
            <div className="flex gap-1">
              {[{ icon: Bold, value: 'bold', key: 'fontWeight', activeValue: '700' }, { icon: Italic, style: 'italic' }, { icon: Underline, value: 'underline', key: 'textDecoration' }].map(({ icon: Icon, value, key, activeValue, style }, i) => (
                <button key={i} onClick={() => key && updateStyle(key as keyof ElementStyles, styles[key as keyof ElementStyles] === (activeValue || value) ? 'normal' : (activeValue || value!))} className={cn("p-2 rounded-lg border transition-colors", "border-[#333] text-[#666] hover:text-white")}>
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
          <StyleInput label="Color" value={styles.color} onChange={(v) => updateStyle('color', v)} type="color" />
        </div>
      </StyleSection>

      {/* Spacing */}
      <StyleSection title="Spacing" icon={Box}>
        <SpacingBox label="Margin" values={{ top: styles.marginTop, right: styles.marginRight, bottom: styles.marginBottom, left: styles.marginLeft }} onChange={(side, value) => updateStyle(`margin${side.charAt(0).toUpperCase() + side.slice(1)}` as keyof ElementStyles, value)} />
        <SpacingBox label="Padding" values={{ top: styles.paddingTop, right: styles.paddingRight, bottom: styles.paddingBottom, left: styles.paddingLeft }} onChange={(side, value) => updateStyle(`padding${side.charAt(0).toUpperCase() + side.slice(1)}` as keyof ElementStyles, value)} />
      </StyleSection>

      {/* Size & Layout */}
      <StyleSection title="Size & Layout" icon={Maximize2}>
        <div className="grid grid-cols-2 gap-2">
          <StyleInput label="Width" value={styles.width} onChange={(v) => updateStyle('width', v)} suffix="px" />
          <StyleInput label="Height" value={styles.height} onChange={(v) => updateStyle('height', v)} suffix="px" />
          <StyleInput label="Min W" value={styles.minWidth} onChange={(v) => updateStyle('minWidth', v)} suffix="px" />
          <StyleInput label="Max W" value={styles.maxWidth} onChange={(v) => updateStyle('maxWidth', v)} suffix="px" />
        </div>
        <div>
          <span className="text-xs text-[#888] block mb-1.5">Display</span>
          <div className="flex gap-1">
            {['block', 'flex', 'grid', 'inline'].map(d => (
              <button key={d} onClick={() => updateStyle('display', d)} className={cn("flex-1 px-2 py-1.5 text-xs rounded-lg border transition-colors capitalize", styles.display === d ? "bg-[#CDB49E]/10 border-[#CDB49E] text-[#CDB49E]" : "border-[#333] text-[#666] hover:text-white")}>
                {d}
              </button>
            ))}
          </div>
        </div>
        {styles.display === 'flex' && (
          <>
            <div>
              <span className="text-xs text-[#888] block mb-1.5">Direction</span>
              <div className="flex gap-1">
                {[{ icon: Rows, value: 'row' }, { icon: Columns, value: 'column' }].map(({ icon: Icon, value }) => (
                  <button key={value} onClick={() => updateStyle('flexDirection', value)} className={cn("flex-1 p-2 rounded-lg border transition-colors", styles.flexDirection === value ? "bg-[#CDB49E]/10 border-[#CDB49E] text-[#CDB49E]" : "border-[#333] text-[#666] hover:text-white")}>
                    <Icon className="w-4 h-4 mx-auto" />
                  </button>
                ))}
              </div>
            </div>
            <StyleInput label="Gap" value={styles.gap} onChange={(v) => updateStyle('gap', v)} suffix="px" />
          </>
        )}
      </StyleSection>

      {/* Background */}
      <StyleSection title="Background" icon={Droplet}>
        <StyleInput label="Color" value={styles.backgroundColor} onChange={(v) => updateStyle('backgroundColor', v)} type="color" />
        <div>
          <span className="text-xs text-[#888] block mb-1.5">Image/Video</span>
          <div className="h-24 rounded-lg border-2 border-dashed border-[#333] flex flex-col items-center justify-center cursor-pointer hover:border-[#CDB49E]/50 transition-colors">
            <Upload className="w-6 h-6 text-[#555] mb-1" />
            <span className="text-xs text-[#555]">Drop image or video</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-xs text-[#888] block mb-1">Size</span>
            <select value={styles.backgroundSize} onChange={(e) => updateStyle('backgroundSize', e.target.value)} className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div>
            <span className="text-xs text-[#888] block mb-1">Position</span>
            <select value={styles.backgroundPosition} onChange={(e) => updateStyle('backgroundPosition', e.target.value)} className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
              <option value="center">Center</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
        <StyleInput label="Overlay" value={styles.backgroundOverlay} onChange={(v) => updateStyle('backgroundOverlay', v)} type="color" />
      </StyleSection>

      {/* Border */}
      <StyleSection title="Border" icon={Square}>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-xs text-[#888] block mb-1">Width</span>
            <input type="number" min="0" max="20" value={parseInt(styles.borderWidth) || 0} onChange={(e) => updateStyle('borderWidth', e.target.value + 'px')} className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white text-center" />
          </div>
          <div>
            <span className="text-xs text-[#888] block mb-1">Style</span>
            <select value={styles.borderStyle} onChange={(e) => updateStyle('borderStyle', e.target.value)} className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="double">Double</option>
            </select>
          </div>
          <div>
            <span className="text-xs text-[#888] block mb-1">Color</span>
            <input type="color" value={styles.borderColor} onChange={(e) => updateStyle('borderColor', e.target.value)} className="w-full h-8 rounded border border-[#333] bg-transparent cursor-pointer" />
          </div>
        </div>
        <BorderRadiusControl 
          values={{ tl: styles.borderTopLeftRadius, tr: styles.borderTopRightRadius, br: styles.borderBottomRightRadius, bl: styles.borderBottomLeftRadius }}
          onChange={(corner, value) => updateStyle(`border${corner === 'tl' ? 'TopLeft' : corner === 'tr' ? 'TopRight' : corner === 'br' ? 'BottomRight' : 'BottomLeft'}Radius` as keyof ElementStyles, value)}
        />
      </StyleSection>

      {/* Shadow */}
      <StyleSection title="Shadow" icon={Layers}>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <StyleInput label="X Offset" value={styles.shadowX} onChange={(v) => updateStyle('shadowX', v)} suffix="px" />
            <StyleInput label="Y Offset" value={styles.shadowY} onChange={(v) => updateStyle('shadowY', v)} suffix="px" />
            <StyleInput label="Blur" value={styles.shadowBlur} onChange={(v) => updateStyle('shadowBlur', v)} suffix="px" />
            <StyleInput label="Spread" value={styles.shadowSpread} onChange={(v) => updateStyle('shadowSpread', v)} suffix="px" />
          </div>
          <StyleInput label="Color" value={styles.shadowColor} onChange={(v) => updateStyle('shadowColor', v)} type="color" />
          {/* Preview */}
          <div className="h-16 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
            <div className="w-12 h-12 rounded-lg bg-[#333]" style={{ boxShadow: `${styles.shadowX}px ${styles.shadowY}px ${styles.shadowBlur}px ${styles.shadowSpread}px ${styles.shadowColor}` }} />
          </div>
        </div>
      </StyleSection>

      {/* Effects */}
      <StyleSection title="Effects" icon={Sparkles}>
        <div>
          <span className="text-xs text-[#888] block mb-1">Opacity: {Math.round(parseFloat(styles.opacity) * 100)}%</span>
          <input type="range" min="0" max="1" step="0.01" value={styles.opacity} onChange={(e) => updateStyle('opacity', e.target.value)} className="w-full accent-[#CDB49E]" />
        </div>
        <div>
          <span className="text-xs text-[#888] block mb-1.5">Blur</span>
          <input type="range" min="0" max="20" value={parseInt(styles.filter.replace(/[^\d]/g, '')) || 0} onChange={(e) => updateStyle('filter', `blur(${e.target.value}px)`)} className="w-full accent-[#CDB49E]" />
        </div>
        <div>
          <span className="text-xs text-[#888] block mb-1.5">Backdrop Blur</span>
          <input type="range" min="0" max="20" value={parseInt(styles.backdropFilter.replace(/[^\d]/g, '')) || 0} onChange={(e) => updateStyle('backdropFilter', `blur(${e.target.value}px)`)} className="w-full accent-[#CDB49E]" />
        </div>
      </StyleSection>

      {/* Hover Effects */}
      <StyleSection title="Hover Effects" icon={MousePointer}>
        <div>
          <span className="text-xs text-[#888] block mb-1">Scale: {styles.hoverScale}x</span>
          <input type="range" min="0.9" max="1.2" step="0.01" value={styles.hoverScale} onChange={(e) => updateStyle('hoverScale', e.target.value)} className="w-full accent-[#CDB49E]" />
        </div>
        <div>
          <span className="text-xs text-[#888] block mb-1">Opacity: {Math.round(parseFloat(styles.hoverOpacity) * 100)}%</span>
          <input type="range" min="0" max="1" step="0.01" value={styles.hoverOpacity} onChange={(e) => updateStyle('hoverOpacity', e.target.value)} className="w-full accent-[#CDB49E]" />
        </div>
        <StyleInput label="Background" value={styles.hoverBackground} onChange={(v) => updateStyle('hoverBackground', v)} type="color" />
        <StyleInput label="Text Color" value={styles.hoverColor} onChange={(v) => updateStyle('hoverColor', v)} type="color" />
        <StyleInput label="Border" value={styles.hoverBorderColor} onChange={(v) => updateStyle('hoverBorderColor', v)} type="color" />
      </StyleSection>

      {/* Animations */}
      <StyleSection title="Animations" icon={Play}>
        <div>
          <span className="text-xs text-[#888] block mb-1.5">Scroll Animation</span>
          <select className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
            {SCROLL_ANIMATIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>
        <div>
          <span className="text-xs text-[#888] block mb-1.5">Transition</span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-[#555] block mb-1">Duration</span>
              <select className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
                <option value="0.1s">100ms</option>
                <option value="0.2s">200ms</option>
                <option value="0.3s">300ms</option>
                <option value="0.5s">500ms</option>
                <option value="1s">1s</option>
              </select>
            </div>
            <div>
              <span className="text-[10px] text-[#555] block mb-1">Easing</span>
              <select className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
                {EASING_OPTIONS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div>
          <span className="text-xs text-[#888] block mb-1.5">Click Animation</span>
          <div className="flex gap-1">
            {['none', 'scale', 'bounce', 'shake', 'pulse'].map(a => (
              <button key={a} className="flex-1 px-2 py-1.5 text-xs border border-[#333] rounded-lg text-[#666] hover:text-white capitalize">{a}</button>
            ))}
          </div>
        </div>
      </StyleSection>
    </div>
  );
}

/* ═══════════════════════ TEMPLATES ═══════════════════════ */

const TEMPLATES = [
  { id: "saas", name: "SaaS Platform", icon: BarChart3, preview: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", popular: true },
  { id: "agency", name: "Creative Agency", icon: Briefcase, preview: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)", popular: true },
  { id: "ecommerce", name: "E-Commerce", icon: ShoppingBag, preview: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)" },
  { id: "restaurant", name: "Restaurant", icon: Utensils, preview: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" },
  { id: "fitness", name: "Fitness & Gym", icon: Dumbbell, preview: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" },
  { id: "portfolio", name: "Portfolio", icon: Camera, preview: "linear-gradient(135deg, #fafafa 0%, #e5e5e5 100%)" },
];

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */

export default function WebsitePage() {
  const { fetchPages } = useWebsiteStore();
  const [selectedElement, setSelectedElement] = useState<string | null>("hero-heading");
  const [elementStyles, setElementStyles] = useState<ElementStyles>(defaultStyles);
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activePanel, setActivePanel] = useState<"style" | "layers" | "settings">("style");
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    fetchPages("org1");
  }, [fetchPages]);

  // Generate CSS from styles
  const getElementCSS = (styles: ElementStyles) => ({
    fontFamily: styles.fontFamily,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    lineHeight: styles.lineHeight,
    letterSpacing: styles.letterSpacing,
    textAlign: styles.textAlign as any,
    textTransform: styles.textTransform as any,
    textDecoration: styles.textDecoration,
    color: styles.color,
    marginTop: styles.marginTop,
    marginRight: styles.marginRight,
    marginBottom: styles.marginBottom,
    marginLeft: styles.marginLeft,
    paddingTop: styles.paddingTop,
    paddingRight: styles.paddingRight,
    paddingBottom: styles.paddingBottom,
    paddingLeft: styles.paddingLeft,
    backgroundColor: styles.backgroundColor,
    backgroundImage: styles.backgroundImage ? `url(${styles.backgroundImage})` : undefined,
    backgroundSize: styles.backgroundSize,
    backgroundPosition: styles.backgroundPosition,
    borderWidth: styles.borderWidth,
    borderStyle: styles.borderStyle,
    borderColor: styles.borderColor,
    borderRadius: styles.borderRadius,
    boxShadow: styles.boxShadow !== 'none' ? `${styles.shadowX}px ${styles.shadowY}px ${styles.shadowBlur}px ${styles.shadowSpread}px ${styles.shadowColor}` : 'none',
    opacity: styles.opacity,
    filter: styles.filter,
    backdropFilter: styles.backdropFilter,
    transition: styles.transition,
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Top Toolbar */}
      <div className="h-12 bg-[#111] border-b border-[#222] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#CDB49E]" />
            <span className="text-sm font-semibold text-white">Website Builder</span>
          </div>
          <div className="h-6 w-px bg-[#333]" />
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-xs text-[#888] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors">Undo</button>
            <button className="px-3 py-1.5 text-xs text-[#888] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors">Redo</button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
            <button onClick={() => setZoom(Math.max(25, zoom - 25))} className="text-[#888] hover:text-white"><Minus className="w-3 h-3" /></button>
            <span className="text-xs text-white w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(200, zoom + 25))} className="text-[#888] hover:text-white"><Plus className="w-3 h-3" /></button>
          </div>

          {/* Device Preview */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
            {[{ id: "desktop" as const, icon: Monitor }, { id: "tablet" as const, icon: Tablet }, { id: "mobile" as const, icon: Smartphone }].map(({ id, icon: Icon }) => (
              <button key={id} onClick={() => setDevicePreview(id)} className={cn("p-1.5 rounded-md transition-colors", devicePreview === id ? "bg-[#CDB49E]/10 text-[#CDB49E]" : "text-[#555] hover:text-white")}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-[#333]" />

          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#888] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors">
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
            <Rocket className="w-4 h-4" /> Publish
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel - Layers */}
        <div className="w-64 bg-[#111] border-r border-[#222] flex flex-col">
          <div className="p-3 border-b border-[#222]">
            <h3 className="text-xs font-semibold text-[#555] uppercase tracking-wider">Layers</h3>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {/* Layer tree */}
            {['Page', '  └ Header', '    └ Logo', '    └ Nav', '  └ Hero Section', '    └ Heading', '    └ Subheading', '    └ CTA Button', '  └ Features', '  └ Pricing', '  └ Footer'].map((layer, i) => (
              <button
                key={i}
                onClick={() => setSelectedElement(layer.trim().toLowerCase().replace(/[^a-z]/g, '-'))}
                className={cn(
                  "w-full text-left px-2 py-1.5 text-xs rounded transition-colors",
                  selectedElement === layer.trim().toLowerCase().replace(/[^a-z]/g, '-')
                    ? "bg-[#CDB49E]/10 text-[#CDB49E]"
                    : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
                )}
                style={{ paddingLeft: `${(layer.length - layer.trimStart().length) * 6 + 8}px` }}
              >
                {layer.trim().replace(/[└─]/g, '').trim()}
              </button>
            ))}
          </div>

          {/* Add Element */}
          <div className="p-3 border-t border-[#222]">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-[#888] hover:text-white hover:border-[#CDB49E]/50 transition-colors">
              <Plus className="w-4 h-4" /> Add Element
            </button>
          </div>
        </div>

        {/* Canvas */}
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
            {/* Live Preview */}
            <div className="min-h-[800px]">
              {/* Nav */}
              <nav className="flex items-center justify-between px-8 py-4 border-b border-[#222]">
                <span className="text-xl font-bold text-[#CDB49E]">Brand</span>
                <div className="flex items-center gap-6 text-sm text-[#888]">
                  <span>Home</span><span>Features</span><span>Pricing</span><span>Contact</span>
                </div>
                <button className="px-4 py-2 text-sm font-medium bg-[#CDB49E] text-black rounded-lg">Get Started</button>
              </nav>

              {/* Hero */}
              <section className="px-8 py-24 text-center">
                <h1
                  className={cn("cursor-pointer rounded-lg transition-all", selectedElement === "hero-heading" && "ring-2 ring-[#CDB49E] ring-offset-2 ring-offset-[#0a0a0a]")}
                  style={selectedElement === "hero-heading" ? getElementCSS(elementStyles) : { fontSize: '48px', fontWeight: '700', color: '#fff', marginBottom: '24px' }}
                  onClick={() => setSelectedElement("hero-heading")}
                >
                  Build Amazing Websites
                </h1>
                <p
                  className={cn("cursor-pointer rounded-lg transition-all max-w-2xl mx-auto", selectedElement === "hero-subheading" && "ring-2 ring-[#CDB49E] ring-offset-2 ring-offset-[#0a0a0a]")}
                  style={selectedElement === "hero-subheading" ? getElementCSS(elementStyles) : { fontSize: '18px', color: '#888', marginBottom: '32px' }}
                  onClick={() => setSelectedElement("hero-subheading")}
                >
                  Create stunning, responsive websites with our powerful visual editor. No coding required.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    className={cn("cursor-pointer transition-all", selectedElement === "cta-button" && "ring-2 ring-[#CDB49E] ring-offset-2 ring-offset-[#0a0a0a]")}
                    style={selectedElement === "cta-button" ? getElementCSS(elementStyles) : { padding: '16px 32px', fontSize: '14px', fontWeight: '600', backgroundColor: '#CDB49E', color: '#111', borderRadius: '12px' }}
                    onClick={() => setSelectedElement("cta-button")}
                  >
                    Start Building Free
                  </button>
                  <button className="px-8 py-4 text-sm font-semibold border border-[#CDB49E] text-[#CDB49E] rounded-xl">Watch Demo</button>
                </div>
              </section>

              {/* Features */}
              <section className="px-8 py-20 bg-[#111]">
                <h2 className="text-3xl font-bold text-center text-white mb-4">Powerful Features</h2>
                <p className="text-center text-[#888] mb-12">Everything you need to build professional websites</p>
                <div className="grid grid-cols-3 gap-8">
                  {[
                    { icon: "🎨", title: "Visual Editor", desc: "Drag and drop interface" },
                    { icon: "📱", title: "Responsive", desc: "Works on all devices" },
                    { icon: "⚡", title: "Fast", desc: "Optimized performance" },
                  ].map((f, i) => (
                    <div key={i} className="p-6 rounded-xl bg-[#0a0a0a] text-center">
                      <div className="text-4xl mb-4">{f.icon}</div>
                      <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                      <p className="text-sm text-[#888]">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Right Panel - Style Editor */}
        <div className="w-80 bg-[#111] border-l border-[#222] flex flex-col">
          {/* Panel Tabs */}
          <div className="flex border-b border-[#222]">
            {[
              { id: "style" as const, icon: Paintbrush, label: "Style" },
              { id: "settings" as const, icon: Settings2, label: "Settings" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 text-xs transition-colors",
                  activePanel === tab.id ? "text-[#CDB49E] border-b-2 border-[#CDB49E] -mb-[1px]" : "text-[#666] hover:text-white"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panel Content */}
          {activePanel === "style" && selectedElement && (
            <FullStylePanel
              styles={elementStyles}
              setStyles={setElementStyles}
              elementType={selectedElement.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            />
          )}

          {!selectedElement && (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div>
                <MousePointer className="w-12 h-12 text-[#333] mx-auto mb-4" />
                <p className="text-sm text-[#666]">Click an element on the canvas to edit its styles</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
