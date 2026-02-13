"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Monitor, Tablet, Smartphone, Eye, EyeOff, Copy, Trash2, 
  ChevronDown, ChevronRight, RefreshCw, Layers, Settings2,
  AlignLeft, AlignCenter, AlignRight, Maximize2, Minimize2,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   RESPONSIVE EDITOR
   Per-breakpoint style overrides for components
   ═══════════════════════════════════════════════════════════════════════════ */

export type Breakpoint = "desktop" | "tablet" | "mobile";

export interface BreakpointStyles {
  desktop: Record<string, string>;
  tablet: Record<string, string>;
  mobile: Record<string, string>;
}

export interface ResponsiveConfig {
  breakpoints: {
    desktop: { minWidth: number; label: string };
    tablet: { minWidth: number; maxWidth: number; label: string };
    mobile: { maxWidth: number; label: string };
  };
}

const DEFAULT_CONFIG: ResponsiveConfig = {
  breakpoints: {
    desktop: { minWidth: 1024, label: "Desktop (≥1024px)" },
    tablet: { minWidth: 768, maxWidth: 1023, label: "Tablet (768-1023px)" },
    mobile: { maxWidth: 767, label: "Mobile (≤767px)" },
  },
};

// Breakpoint icons and colors
const BREAKPOINT_INFO: Record<Breakpoint, { icon: typeof Monitor; color: string; preview: number }> = {
  desktop: { icon: Monitor, color: "text-blue-400", preview: 1200 },
  tablet: { icon: Tablet, color: "text-purple-400", preview: 768 },
  mobile: { icon: Smartphone, color: "text-pink-400", preview: 375 },
};

// Property definition type
interface ResponsiveProperty {
  key: string;
  label: string;
  type?: "text" | "range" | "number";
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

// Common responsive properties
const RESPONSIVE_PROPERTIES: Record<string, ResponsiveProperty[]> = {
  layout: [
    { key: "display", label: "Display", options: ["block", "flex", "grid", "none", "inherit"] },
    { key: "flexDirection", label: "Flex Direction", options: ["row", "column", "row-reverse", "column-reverse", "inherit"] },
    { key: "justifyContent", label: "Justify", options: ["flex-start", "center", "flex-end", "space-between", "space-around", "inherit"] },
    { key: "alignItems", label: "Align Items", options: ["flex-start", "center", "flex-end", "stretch", "inherit"] },
    { key: "flexWrap", label: "Wrap", options: ["nowrap", "wrap", "wrap-reverse", "inherit"] },
    { key: "gap", label: "Gap", type: "text", placeholder: "16px" },
  ],
  sizing: [
    { key: "width", label: "Width", type: "text", placeholder: "100%" },
    { key: "maxWidth", label: "Max Width", type: "text", placeholder: "1200px" },
    { key: "minWidth", label: "Min Width", type: "text", placeholder: "auto" },
    { key: "height", label: "Height", type: "text", placeholder: "auto" },
    { key: "minHeight", label: "Min Height", type: "text", placeholder: "auto" },
  ],
  spacing: [
    { key: "padding", label: "Padding", type: "text", placeholder: "24px" },
    { key: "paddingTop", label: "Padding Top", type: "text", placeholder: "0" },
    { key: "paddingBottom", label: "Padding Bottom", type: "text", placeholder: "0" },
    { key: "paddingLeft", label: "Padding Left", type: "text", placeholder: "0" },
    { key: "paddingRight", label: "Padding Right", type: "text", placeholder: "0" },
    { key: "margin", label: "Margin", type: "text", placeholder: "0 auto" },
    { key: "marginTop", label: "Margin Top", type: "text", placeholder: "0" },
    { key: "marginBottom", label: "Margin Bottom", type: "text", placeholder: "0" },
  ],
  typography: [
    { key: "fontSize", label: "Font Size", type: "text", placeholder: "16px" },
    { key: "lineHeight", label: "Line Height", type: "text", placeholder: "1.5" },
    { key: "textAlign", label: "Text Align", options: ["left", "center", "right", "justify", "inherit"] },
    { key: "letterSpacing", label: "Letter Spacing", type: "text", placeholder: "0" },
  ],
  grid: [
    { key: "gridTemplateColumns", label: "Grid Columns", type: "text", placeholder: "repeat(3, 1fr)" },
    { key: "gridTemplateRows", label: "Grid Rows", type: "text", placeholder: "auto" },
    { key: "gridColumn", label: "Column Span", type: "text", placeholder: "span 1" },
    { key: "gridRow", label: "Row Span", type: "text", placeholder: "span 1" },
  ],
  visibility: [
    { key: "opacity", label: "Opacity", type: "range", min: 0, max: 1, step: 0.1 },
    { key: "--responsive-hidden", label: "Hidden", options: ["false", "true"] },
    { key: "order", label: "Order", type: "number", placeholder: "0" },
  ],
};

// Quick presets for common responsive patterns
const RESPONSIVE_PRESETS = [
  {
    id: "stack-on-mobile",
    name: "Stack on Mobile",
    description: "Horizontal on desktop, vertical on mobile",
    styles: {
      desktop: { flexDirection: "row", gap: "32px" },
      tablet: { flexDirection: "row", gap: "24px" },
      mobile: { flexDirection: "column", gap: "16px" },
    },
  },
  {
    id: "center-on-mobile",
    name: "Center on Mobile",
    description: "Left aligned desktop, centered mobile",
    styles: {
      desktop: { textAlign: "left" },
      tablet: { textAlign: "left" },
      mobile: { textAlign: "center" },
    },
  },
  {
    id: "full-width-mobile",
    name: "Full Width Mobile",
    description: "Constrained desktop, full width mobile",
    styles: {
      desktop: { width: "auto", maxWidth: "600px" },
      tablet: { width: "100%", maxWidth: "none" },
      mobile: { width: "100%", maxWidth: "none" },
    },
  },
  {
    id: "reduce-padding",
    name: "Reduce Padding",
    description: "Less padding on smaller screens",
    styles: {
      desktop: { padding: "80px 48px" },
      tablet: { padding: "60px 32px" },
      mobile: { padding: "40px 20px" },
    },
  },
  {
    id: "smaller-text",
    name: "Responsive Text",
    description: "Smaller text on mobile",
    styles: {
      desktop: { fontSize: "48px" },
      tablet: { fontSize: "36px" },
      mobile: { fontSize: "28px" },
    },
  },
  {
    id: "hide-on-mobile",
    name: "Hide on Mobile",
    description: "Visible on desktop, hidden on mobile",
    styles: {
      desktop: { display: "block", "--responsive-hidden": "false" },
      tablet: { display: "block", "--responsive-hidden": "false" },
      mobile: { display: "none", "--responsive-hidden": "true" },
    },
  },
  {
    id: "grid-to-stack",
    name: "Grid to Stack",
    description: "3 columns to 1 column",
    styles: {
      desktop: { gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" },
      tablet: { gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" },
      mobile: { gridTemplateColumns: "1fr", gap: "16px" },
    },
  },
  {
    id: "2col-to-1col",
    name: "2 Col to 1 Col",
    description: "2 columns to single column",
    styles: {
      desktop: { gridTemplateColumns: "repeat(2, 1fr)", gap: "32px" },
      tablet: { gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" },
      mobile: { gridTemplateColumns: "1fr", gap: "16px" },
    },
  },
];

export function ResponsiveEditor({
  elementStyles,
  responsiveStyles,
  onStyleChange,
  onResponsiveChange,
  currentBreakpoint,
  onBreakpointChange,
}: {
  elementStyles: Record<string, string>;
  responsiveStyles: BreakpointStyles;
  onStyleChange: (key: string, value: string) => void;
  onResponsiveChange: (breakpoint: Breakpoint, key: string, value: string) => void;
  currentBreakpoint: Breakpoint;
  onBreakpointChange: (breakpoint: Breakpoint) => void;
}) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["layout", "sizing"]));
  const [showPresets, setShowPresets] = useState(false);
  const [copiedFrom, setCopiedFrom] = useState<Breakpoint | null>(null);

  // Get current styles for the selected breakpoint
  const currentBreakpointStyles = useMemo(() => {
    const base = { ...elementStyles };
    const responsive = responsiveStyles[currentBreakpoint] || {};
    return { ...base, ...responsive };
  }, [elementStyles, responsiveStyles, currentBreakpoint]);

  // Toggle section expansion
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  // Apply preset
  const applyPreset = useCallback((preset: typeof RESPONSIVE_PRESETS[0]) => {
    Object.entries(preset.styles).forEach(([breakpoint, styles]) => {
      Object.entries(styles).forEach(([key, value]) => {
        onResponsiveChange(breakpoint as Breakpoint, key, value as string);
      });
    });
    setShowPresets(false);
  }, [onResponsiveChange]);

  // Copy styles from one breakpoint to another
  const copyFromBreakpoint = useCallback((from: Breakpoint) => {
    const sourceStyles = responsiveStyles[from] || {};
    Object.entries(sourceStyles).forEach(([key, value]) => {
      onResponsiveChange(currentBreakpoint, key, value);
    });
    setCopiedFrom(from);
    setTimeout(() => setCopiedFrom(null), 1500);
  }, [responsiveStyles, currentBreakpoint, onResponsiveChange]);

  // Clear responsive overrides for current breakpoint
  const clearBreakpointStyles = useCallback(() => {
    const currentStyles = responsiveStyles[currentBreakpoint] || {};
    Object.keys(currentStyles).forEach(key => {
      onResponsiveChange(currentBreakpoint, key, "");
    });
  }, [responsiveStyles, currentBreakpoint, onResponsiveChange]);

  // Count overrides per breakpoint
  const overrideCounts = useMemo(() => ({
    desktop: Object.keys(responsiveStyles.desktop || {}).filter(k => responsiveStyles.desktop[k]).length,
    tablet: Object.keys(responsiveStyles.tablet || {}).filter(k => responsiveStyles.tablet[k]).length,
    mobile: Object.keys(responsiveStyles.mobile || {}).filter(k => responsiveStyles.mobile[k]).length,
  }), [responsiveStyles]);

  // Render a property input
  const renderPropertyInput = (prop: typeof RESPONSIVE_PROPERTIES.layout[0]) => {
    const value = currentBreakpointStyles[prop.key] || "";
    const hasOverride = responsiveStyles[currentBreakpoint]?.[prop.key];

    if (prop.options) {
      return (
        <div className="flex items-center gap-2">
          <select
            value={value}
            onChange={(e) => onResponsiveChange(currentBreakpoint, prop.key, e.target.value)}
            className={cn(
              "flex-1 px-2 py-1.5 text-xs bg-[#1a1a1a] border rounded text-white",
              hasOverride ? "border-[#CDB49E]" : "border-[#333]"
            )}
          >
            <option value="">Inherit</option>
            {prop.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {hasOverride && (
            <button
              onClick={() => onResponsiveChange(currentBreakpoint, prop.key, "")}
              className="p-1 text-[#666] hover:text-red-400"
              title="Clear override"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      );
    }

    if (prop.type === "range") {
      return (
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={prop.min}
            max={prop.max}
            step={prop.step}
            value={parseFloat(value) || prop.max}
            onChange={(e) => onResponsiveChange(currentBreakpoint, prop.key, e.target.value)}
            className="flex-1 accent-[#CDB49E]"
          />
          <span className="text-xs text-[#888] w-10">{value || "1"}</span>
          {hasOverride && (
            <button
              onClick={() => onResponsiveChange(currentBreakpoint, prop.key, "")}
              className="p-1 text-[#666] hover:text-red-400"
              title="Clear override"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <input
          type={prop.type || "text"}
          value={value}
          onChange={(e) => onResponsiveChange(currentBreakpoint, prop.key, e.target.value)}
          placeholder={prop.placeholder}
          className={cn(
            "flex-1 px-2 py-1.5 text-xs bg-[#1a1a1a] border rounded text-white",
            hasOverride ? "border-[#CDB49E]" : "border-[#333]"
          )}
        />
        {hasOverride && (
          <button
            onClick={() => onResponsiveChange(currentBreakpoint, prop.key, "")}
            className="p-1 text-[#666] hover:text-red-400"
            title="Clear override"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="p-4 border-b border-[#222]">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Responsive Editor</h3>
            <p className="text-[10px] text-[#666]">Per-breakpoint style overrides</p>
          </div>
        </div>

        {/* Breakpoint Selector */}
        <div className="flex gap-1 p-1 bg-[#1a1a1a] rounded-lg">
          {(["desktop", "tablet", "mobile"] as Breakpoint[]).map((bp) => {
            const info = BREAKPOINT_INFO[bp];
            const Icon = info.icon;
            const count = overrideCounts[bp];
            
            return (
              <button
                key={bp}
                onClick={() => onBreakpointChange(bp)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-medium transition-all relative",
                  currentBreakpoint === bp
                    ? "bg-[#222] text-white"
                    : "text-[#666] hover:text-white"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", currentBreakpoint === bp && info.color)} />
                <span className="capitalize hidden sm:inline">{bp}</span>
                {count > 0 && (
                  <span className={cn(
                    "absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] flex items-center justify-center",
                    currentBreakpoint === bp ? "bg-[#CDB49E] text-black" : "bg-[#444] text-white"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Breakpoint Info */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-[#555]">
            {DEFAULT_CONFIG.breakpoints[currentBreakpoint].label}
          </span>
          <div className="flex gap-1">
            {currentBreakpoint !== "desktop" && (
              <button
                onClick={() => copyFromBreakpoint("desktop")}
                className={cn(
                  "text-[10px] px-2 py-1 rounded",
                  copiedFrom === "desktop" 
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-[#666] hover:text-[#CDB49E] hover:bg-[#111]"
                )}
              >
                {copiedFrom === "desktop" ? "Copied!" : "Copy from Desktop"}
              </button>
            )}
            {overrideCounts[currentBreakpoint] > 0 && (
              <button
                onClick={clearBreakpointStyles}
                className="text-[10px] px-2 py-1 rounded text-[#666] hover:text-red-400 hover:bg-red-500/10"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Quick Presets */}
        <div className="space-y-2">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-[#333] hover:border-[#CDB49E] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-[#CDB49E]" />
              <span className="text-xs font-medium text-white">Quick Presets</span>
            </div>
            {showPresets ? (
              <ChevronDown className="w-4 h-4 text-[#666]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#666]" />
            )}
          </button>

          {showPresets && (
            <div className="grid gap-2 p-2 bg-[#111] rounded-lg border border-[#222]">
              {RESPONSIVE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#1a1a1a] transition-colors text-left"
                >
                  <div className="flex-1">
                    <span className="text-xs font-medium text-white">{preset.name}</span>
                    <p className="text-[10px] text-[#666] mt-0.5">{preset.description}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#444] mt-0.5" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Property Sections */}
        {Object.entries(RESPONSIVE_PROPERTIES).map(([section, properties]) => (
          <div key={section} className="border border-[#222] rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(section)}
              className="w-full flex items-center justify-between p-3 hover:bg-[#111] transition-colors"
            >
              <span className="text-xs font-semibold text-[#888] capitalize">{section}</span>
              <div className="flex items-center gap-2">
                {/* Show count of overridden props in this section */}
                {properties.some(p => responsiveStyles[currentBreakpoint]?.[p.key]) && (
                  <span className="text-[10px] text-[#CDB49E]">
                    {properties.filter(p => responsiveStyles[currentBreakpoint]?.[p.key]).length} overrides
                  </span>
                )}
                {expandedSections.has(section) ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[#555]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[#555]" />
                )}
              </div>
            </button>

            {expandedSections.has(section) && (
              <div className="p-3 pt-0 space-y-3">
                {properties.map((prop) => (
                  <div key={prop.key}>
                    <label className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-[#666]">{prop.label}</span>
                      {responsiveStyles[currentBreakpoint]?.[prop.key] && (
                        <span className="text-[9px] text-[#CDB49E] px-1.5 py-0.5 bg-[#CDB49E]/10 rounded">
                          Override
                        </span>
                      )}
                    </label>
                    {renderPropertyInput(prop)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#222] bg-[#111]/50">
        <div className="flex items-center justify-between text-[10px] text-[#555]">
          <span>
            {overrideCounts[currentBreakpoint]} overrides on {currentBreakpoint}
          </span>
          <span>
            Preview: {BREAKPOINT_INFO[currentBreakpoint].preview}px
          </span>
        </div>
      </div>
    </div>
  );
}

// Preview wrapper component that applies responsive styles
export function ResponsivePreview({
  children,
  breakpoint,
  className,
}: {
  children: React.ReactNode;
  breakpoint: Breakpoint;
  className?: string;
}) {
  const widths: Record<Breakpoint, string> = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  return (
    <div 
      className={cn(
        "mx-auto transition-all duration-300 ease-in-out",
        className
      )}
      style={{ 
        width: widths[breakpoint],
        maxWidth: "100%",
      }}
    >
      {children}
    </div>
  );
}

// Utility to merge base styles with responsive overrides
export function mergeResponsiveStyles(
  baseStyles: Record<string, string>,
  responsiveStyles: BreakpointStyles,
  currentBreakpoint: Breakpoint
): Record<string, string> {
  return {
    ...baseStyles,
    ...responsiveStyles[currentBreakpoint],
  };
}

// CSS generator for responsive styles
export function generateResponsiveCSS(
  elementId: string,
  responsiveStyles: BreakpointStyles
): string {
  const css: string[] = [];

  // Tablet styles
  if (Object.keys(responsiveStyles.tablet || {}).length > 0) {
    const tabletRules = Object.entries(responsiveStyles.tablet)
      .filter(([_, v]) => v)
      .map(([k, v]) => {
        // Convert camelCase to kebab-case
        const cssKey = k.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `  ${cssKey}: ${v};`;
      })
      .join('\n');
    
    if (tabletRules) {
      css.push(`@media (max-width: 1023px) {\n  #${elementId} {\n${tabletRules}\n  }\n}`);
    }
  }

  // Mobile styles
  if (Object.keys(responsiveStyles.mobile || {}).length > 0) {
    const mobileRules = Object.entries(responsiveStyles.mobile)
      .filter(([_, v]) => v)
      .map(([k, v]) => {
        const cssKey = k.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `  ${cssKey}: ${v};`;
      })
      .join('\n');
    
    if (mobileRules) {
      css.push(`@media (max-width: 767px) {\n  #${elementId} {\n${mobileRules}\n  }\n}`);
    }
  }

  return css.join('\n\n');
}

export default ResponsiveEditor;
