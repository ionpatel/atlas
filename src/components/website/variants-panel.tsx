"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Palette, Sparkles, Copy, Check, ChevronRight, ChevronDown,
  Eye, EyeOff, Lock, Unlock, Trash2, Plus, RotateCcw, Wand2
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT VARIANTS PANEL
   Multiple style variants per component type
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ComponentVariant {
  id: string;
  name: string;
  description: string;
  styles: Record<string, string>;
  preview?: string;
  isCustom?: boolean;
}

export interface VariantCategory {
  id: string;
  name: string;
  componentType: string;
  variants: ComponentVariant[];
}

// Built-in variants for common components
export const BUILT_IN_VARIANTS: VariantCategory[] = [
  // Button Variants
  {
    id: "button-variants",
    name: "Button Styles",
    componentType: "button",
    variants: [
      {
        id: "btn-primary",
        name: "Primary Solid",
        description: "Bold primary action button",
        styles: {
          backgroundColor: "#CDB49E",
          color: "#111111",
          padding: "16px 32px",
          borderRadius: "8px",
          fontSize: "15px",
          fontWeight: "600",
          border: "none",
        },
      },
      {
        id: "btn-secondary",
        name: "Secondary",
        description: "Subtle secondary button",
        styles: {
          backgroundColor: "#222222",
          color: "#ffffff",
          padding: "14px 28px",
          borderRadius: "8px",
          fontSize: "15px",
          fontWeight: "500",
          border: "1px solid #333",
        },
      },
      {
        id: "btn-outline",
        name: "Outline",
        description: "Bordered transparent button",
        styles: {
          backgroundColor: "transparent",
          color: "#CDB49E",
          padding: "14px 28px",
          borderRadius: "8px",
          fontSize: "15px",
          fontWeight: "600",
          border: "2px solid #CDB49E",
        },
      },
      {
        id: "btn-ghost",
        name: "Ghost",
        description: "Minimal text button",
        styles: {
          backgroundColor: "transparent",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "6px",
          fontSize: "14px",
          fontWeight: "500",
          border: "none",
        },
      },
      {
        id: "btn-gradient",
        name: "Gradient",
        description: "Vibrant gradient button",
        styles: {
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#ffffff",
          padding: "16px 32px",
          borderRadius: "10px",
          fontSize: "15px",
          fontWeight: "600",
          border: "none",
        },
      },
      {
        id: "btn-pill",
        name: "Pill",
        description: "Rounded pill shape",
        styles: {
          backgroundColor: "#CDB49E",
          color: "#111111",
          padding: "14px 32px",
          borderRadius: "50px",
          fontSize: "14px",
          fontWeight: "600",
          border: "none",
        },
      },
      {
        id: "btn-minimal",
        name: "Minimal",
        description: "Clean minimal style",
        styles: {
          backgroundColor: "#111111",
          color: "#ffffff",
          padding: "16px 40px",
          borderRadius: "0px",
          fontSize: "13px",
          fontWeight: "500",
          border: "1px solid #333",
          letterSpacing: "1px",
          textTransform: "uppercase",
        },
      },
      {
        id: "btn-neon",
        name: "Neon Glow",
        description: "Glowing neon effect",
        styles: {
          backgroundColor: "#7c3aed",
          color: "#ffffff",
          padding: "14px 28px",
          borderRadius: "8px",
          fontSize: "15px",
          fontWeight: "600",
          border: "none",
          boxShadow: "0 0 20px rgba(124, 58, 237, 0.5), 0 0 40px rgba(124, 58, 237, 0.3)",
        },
      },
    ],
  },
  
  // Heading Variants
  {
    id: "heading-variants",
    name: "Heading Styles",
    componentType: "heading",
    variants: [
      {
        id: "h-hero",
        name: "Hero Display",
        description: "Large bold hero heading",
        styles: {
          fontSize: "64px",
          fontWeight: "800",
          color: "#ffffff",
          lineHeight: "1.1",
          letterSpacing: "-2px",
        },
      },
      {
        id: "h-section",
        name: "Section Title",
        description: "Standard section heading",
        styles: {
          fontSize: "42px",
          fontWeight: "700",
          color: "#ffffff",
          lineHeight: "1.2",
          letterSpacing: "-1px",
        },
      },
      {
        id: "h-elegant",
        name: "Elegant",
        description: "Refined elegant style",
        styles: {
          fontSize: "48px",
          fontWeight: "300",
          color: "#f5f5f5",
          lineHeight: "1.3",
          letterSpacing: "2px",
          textTransform: "uppercase",
        },
      },
      {
        id: "h-gradient",
        name: "Gradient Text",
        description: "Colorful gradient effect",
        styles: {
          fontSize: "56px",
          fontWeight: "800",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f43f5e 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: "1.2",
        },
      },
      {
        id: "h-accent",
        name: "With Accent",
        description: "Heading with accent color",
        styles: {
          fontSize: "48px",
          fontWeight: "700",
          color: "#CDB49E",
          lineHeight: "1.2",
        },
      },
      {
        id: "h-minimal",
        name: "Minimal",
        description: "Clean minimal heading",
        styles: {
          fontSize: "36px",
          fontWeight: "400",
          color: "#888888",
          lineHeight: "1.4",
          letterSpacing: "0.5px",
        },
      },
    ],
  },

  // Card Variants
  {
    id: "card-variants",
    name: "Card Styles",
    componentType: "card",
    variants: [
      {
        id: "card-default",
        name: "Default",
        description: "Standard card style",
        styles: {
          padding: "24px",
          backgroundColor: "#111111",
          borderRadius: "16px",
          border: "1px solid #222222",
        },
      },
      {
        id: "card-elevated",
        name: "Elevated",
        description: "Card with shadow",
        styles: {
          padding: "28px",
          backgroundColor: "#111111",
          borderRadius: "20px",
          border: "none",
          boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
        },
      },
      {
        id: "card-glass",
        name: "Glassmorphism",
        description: "Frosted glass effect",
        styles: {
          padding: "24px",
          backgroundColor: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.1)",
        },
      },
      {
        id: "card-gradient-border",
        name: "Gradient Border",
        description: "Card with gradient border",
        styles: {
          padding: "24px",
          backgroundColor: "#0a0a0a",
          borderRadius: "16px",
          border: "2px solid transparent",
          background: "linear-gradient(#0a0a0a, #0a0a0a) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box",
        },
      },
      {
        id: "card-neon",
        name: "Neon Glow",
        description: "Glowing border effect",
        styles: {
          padding: "24px",
          backgroundColor: "#0a0a0a",
          borderRadius: "16px",
          border: "1px solid #CDB49E",
          boxShadow: "0 0 20px rgba(205,180,158,0.2), inset 0 0 20px rgba(205,180,158,0.05)",
        },
      },
      {
        id: "card-minimal",
        name: "Minimal",
        description: "Clean minimal card",
        styles: {
          padding: "32px",
          backgroundColor: "transparent",
          borderRadius: "0px",
          border: "1px solid #333333",
        },
      },
    ],
  },

  // Hero Section Variants
  {
    id: "hero-variants",
    name: "Hero Layouts",
    componentType: "hero",
    variants: [
      {
        id: "hero-center",
        name: "Centered",
        description: "Classic centered hero",
        styles: {
          padding: "120px 48px",
          textAlign: "center",
          backgroundColor: "#0a0a0a",
        },
      },
      {
        id: "hero-left",
        name: "Left Aligned",
        description: "Content aligned left",
        styles: {
          padding: "100px 48px",
          textAlign: "left",
          backgroundColor: "#0a0a0a",
        },
      },
      {
        id: "hero-gradient-bg",
        name: "Gradient Background",
        description: "Vibrant gradient bg",
        styles: {
          padding: "140px 48px",
          textAlign: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        },
      },
      {
        id: "hero-dark-gradient",
        name: "Dark Gradient",
        description: "Subtle dark gradient",
        styles: {
          padding: "140px 48px",
          textAlign: "center",
          background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)",
        },
      },
      {
        id: "hero-minimal",
        name: "Minimal",
        description: "Clean minimal hero",
        styles: {
          padding: "200px 48px",
          textAlign: "center",
          backgroundColor: "#000000",
        },
      },
      {
        id: "hero-tall",
        name: "Full Height",
        description: "Full viewport height",
        styles: {
          padding: "0 48px",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          backgroundColor: "#0a0a0a",
        },
      },
    ],
  },

  // Section Variants
  {
    id: "section-variants",
    name: "Section Styles",
    componentType: "section",
    variants: [
      {
        id: "sec-default",
        name: "Default",
        description: "Standard section padding",
        styles: {
          padding: "80px 48px",
          backgroundColor: "#0a0a0a",
        },
      },
      {
        id: "sec-compact",
        name: "Compact",
        description: "Reduced padding",
        styles: {
          padding: "48px 32px",
          backgroundColor: "#0a0a0a",
        },
      },
      {
        id: "sec-spacious",
        name: "Spacious",
        description: "Extra breathing room",
        styles: {
          padding: "120px 48px",
          backgroundColor: "#0a0a0a",
        },
      },
      {
        id: "sec-dark",
        name: "Dark",
        description: "Darker background",
        styles: {
          padding: "80px 48px",
          backgroundColor: "#050505",
        },
      },
      {
        id: "sec-light",
        name: "Light",
        description: "Lighter background",
        styles: {
          padding: "80px 48px",
          backgroundColor: "#111111",
        },
      },
      {
        id: "sec-gradient",
        name: "Gradient",
        description: "Subtle gradient bg",
        styles: {
          padding: "100px 48px",
          background: "linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)",
        },
      },
    ],
  },

  // Text/Paragraph Variants
  {
    id: "text-variants",
    name: "Text Styles",
    componentType: "text",
    variants: [
      {
        id: "text-body",
        name: "Body",
        description: "Standard body text",
        styles: {
          fontSize: "16px",
          color: "#888888",
          lineHeight: "1.7",
        },
      },
      {
        id: "text-lead",
        name: "Lead",
        description: "Intro paragraph",
        styles: {
          fontSize: "20px",
          color: "#aaaaaa",
          lineHeight: "1.6",
          fontWeight: "300",
        },
      },
      {
        id: "text-small",
        name: "Small",
        description: "Smaller text",
        styles: {
          fontSize: "14px",
          color: "#666666",
          lineHeight: "1.6",
        },
      },
      {
        id: "text-caption",
        name: "Caption",
        description: "Caption/label text",
        styles: {
          fontSize: "12px",
          color: "#555555",
          lineHeight: "1.5",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
        },
      },
      {
        id: "text-highlight",
        name: "Highlight",
        description: "Emphasized text",
        styles: {
          fontSize: "18px",
          color: "#CDB49E",
          lineHeight: "1.6",
          fontWeight: "500",
        },
      },
    ],
  },

  // Image Variants
  {
    id: "image-variants",
    name: "Image Styles",
    componentType: "image",
    variants: [
      {
        id: "img-default",
        name: "Default",
        description: "Standard image",
        styles: {
          width: "100%",
          borderRadius: "12px",
        },
      },
      {
        id: "img-rounded",
        name: "More Rounded",
        description: "Larger border radius",
        styles: {
          width: "100%",
          borderRadius: "24px",
        },
      },
      {
        id: "img-sharp",
        name: "Sharp",
        description: "No border radius",
        styles: {
          width: "100%",
          borderRadius: "0px",
        },
      },
      {
        id: "img-shadow",
        name: "With Shadow",
        description: "Drop shadow effect",
        styles: {
          width: "100%",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        },
      },
      {
        id: "img-border",
        name: "Bordered",
        description: "With border",
        styles: {
          width: "100%",
          borderRadius: "12px",
          border: "4px solid #222222",
        },
      },
      {
        id: "img-circle",
        name: "Circle",
        description: "Circular crop",
        styles: {
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          objectFit: "cover",
        },
      },
    ],
  },

  // Badge/Tag Variants
  {
    id: "badge-variants",
    name: "Badge Styles",
    componentType: "badge",
    variants: [
      {
        id: "badge-primary",
        name: "Primary",
        description: "Primary badge",
        styles: {
          backgroundColor: "#CDB49E",
          color: "#111111",
          padding: "6px 14px",
          borderRadius: "20px",
          fontSize: "11px",
          fontWeight: "700",
        },
      },
      {
        id: "badge-secondary",
        name: "Secondary",
        description: "Subtle badge",
        styles: {
          backgroundColor: "#222222",
          color: "#888888",
          padding: "6px 14px",
          borderRadius: "20px",
          fontSize: "11px",
          fontWeight: "600",
        },
      },
      {
        id: "badge-outline",
        name: "Outline",
        description: "Bordered badge",
        styles: {
          backgroundColor: "transparent",
          color: "#CDB49E",
          padding: "5px 12px",
          borderRadius: "20px",
          fontSize: "11px",
          fontWeight: "600",
          border: "1px solid #CDB49E",
        },
      },
      {
        id: "badge-pill",
        name: "Pill Small",
        description: "Compact pill",
        styles: {
          backgroundColor: "#CDB49E",
          color: "#111111",
          padding: "4px 10px",
          borderRadius: "100px",
          fontSize: "10px",
          fontWeight: "700",
        },
      },
      {
        id: "badge-dot",
        name: "With Dot",
        description: "Badge with dot indicator",
        styles: {
          backgroundColor: "#111111",
          color: "#ffffff",
          padding: "6px 14px 6px 10px",
          borderRadius: "20px",
          fontSize: "11px",
          fontWeight: "600",
          border: "1px solid #333333",
        },
      },
    ],
  },
];

// Helper to find variants for a component type
export function getVariantsForType(componentType: string): ComponentVariant[] {
  const category = BUILT_IN_VARIANTS.find(
    c => c.componentType === componentType || 
         c.componentType === componentType.replace(/Card$/, "").toLowerCase() ||
         componentType.toLowerCase().includes(c.componentType)
  );
  return category?.variants || [];
}

// Map component types to variant categories
const TYPE_TO_CATEGORY: Record<string, string> = {
  button: "button",
  buttonOutline: "button",
  heading: "heading",
  subheading: "heading",
  card: "card",
  featureCard: "card",
  profileCard: "card",
  pricingCard: "card",
  testimonialCard: "card",
  statCard: "card",
  serviceCard: "card",
  productCard: "card",
  hero: "hero",
  heroWithImage: "hero",
  heroSplit: "hero",
  heroVideo: "hero",
  heroGradient: "hero",
  heroMinimal: "hero",
  heroAthletic: "hero",
  section: "section",
  features3: "section",
  features4: "section",
  pricing3: "section",
  testimonials: "section",
  text: "text",
  image: "image",
  imageRounded: "image",
  badge: "badge",
};

export function VariantsPanel({
  selectedElementType,
  currentStyles,
  onApplyVariant,
  customVariants,
  onSaveCustomVariant,
  onDeleteCustomVariant,
}: {
  selectedElementType?: string;
  currentStyles?: Record<string, string>;
  onApplyVariant: (styles: Record<string, string>) => void;
  customVariants?: ComponentVariant[];
  onSaveCustomVariant?: (variant: ComponentVariant) => void;
  onDeleteCustomVariant?: (variantId: string) => void;
}) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["button-variants", "heading-variants"]));
  const [savingVariant, setSavingVariant] = useState(false);
  const [newVariantName, setNewVariantName] = useState("");
  const [appliedVariantId, setAppliedVariantId] = useState<string | null>(null);

  // Get matching category for selected element
  const matchingCategory = selectedElementType 
    ? TYPE_TO_CATEGORY[selectedElementType] || selectedElementType
    : null;

  // Get relevant variants
  const relevantVariants = useMemo(() => {
    if (!matchingCategory) return [];
    const category = BUILT_IN_VARIANTS.find(c => c.componentType === matchingCategory);
    return category?.variants || [];
  }, [matchingCategory]);

  // Toggle category expansion
  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  // Apply variant
  const applyVariant = useCallback((variant: ComponentVariant) => {
    onApplyVariant(variant.styles);
    setAppliedVariantId(variant.id);
    setTimeout(() => setAppliedVariantId(null), 1500);
  }, [onApplyVariant]);

  // Save current as custom variant
  const saveAsCustom = useCallback(() => {
    if (!newVariantName.trim() || !currentStyles || !onSaveCustomVariant) return;
    
    const newVariant: ComponentVariant = {
      id: `custom-${Date.now()}`,
      name: newVariantName,
      description: "Custom saved variant",
      styles: currentStyles,
      isCustom: true,
    };
    
    onSaveCustomVariant(newVariant);
    setNewVariantName("");
    setSavingVariant(false);
  }, [newVariantName, currentStyles, onSaveCustomVariant]);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="p-4 border-b border-[#222]">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600">
            <Palette className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Style Variants</h3>
            <p className="text-[10px] text-[#666]">Quick style presets for components</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Selected Element Variants */}
        {selectedElementType && relevantVariants.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#CDB49E]">
                Variants for {selectedElementType}
              </span>
              <span className="text-[10px] text-[#555]">
                {relevantVariants.length} styles
              </span>
            </div>
            
            <div className="grid gap-2">
              {relevantVariants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => applyVariant(variant)}
                  className={cn(
                    "relative p-3 rounded-lg border text-left transition-all group",
                    appliedVariantId === variant.id
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-[#333] hover:border-[#CDB49E] hover:bg-[#111]"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-medium text-white">{variant.name}</span>
                      <p className="text-[10px] text-[#666] mt-0.5">{variant.description}</p>
                    </div>
                    {appliedVariantId === variant.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Wand2 className="w-4 h-4 text-[#444] group-hover:text-[#CDB49E] transition-colors" />
                    )}
                  </div>
                  
                  {/* Mini Preview */}
                  <div 
                    className="mt-2 h-6 rounded overflow-hidden opacity-60"
                    style={{
                      background: variant.styles.background || variant.styles.backgroundColor || "#222",
                      border: variant.styles.border || "1px solid #333",
                      borderRadius: variant.styles.borderRadius || "4px",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No element selected */}
        {!selectedElementType && (
          <div className="text-center py-8">
            <Palette className="w-10 h-10 text-[#333] mx-auto mb-3" />
            <p className="text-sm text-[#666]">Select an element to see available variants</p>
            <p className="text-xs text-[#444] mt-1">Click on any component in the canvas</p>
          </div>
        )}

        {/* Save Custom Variant */}
        {selectedElementType && currentStyles && onSaveCustomVariant && (
          <div className="pt-4 border-t border-[#222]">
            {savingVariant ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newVariantName}
                  onChange={(e) => setNewVariantName(e.target.value)}
                  placeholder="Variant name..."
                  className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveAsCustom}
                    disabled={!newVariantName.trim()}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-medium",
                      newVariantName.trim()
                        ? "bg-[#CDB49E] text-black"
                        : "bg-[#333] text-[#666] cursor-not-allowed"
                    )}
                  >
                    Save Variant
                  </button>
                  <button
                    onClick={() => setSavingVariant(false)}
                    className="px-3 py-2 rounded-lg text-xs text-[#888] hover:text-white border border-[#333]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setSavingVariant(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-[#333] text-xs text-[#888] hover:text-[#CDB49E] hover:border-[#CDB49E] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Save Current as Variant
              </button>
            )}
          </div>
        )}

        {/* Custom Saved Variants */}
        {customVariants && customVariants.length > 0 && (
          <div className="pt-4 border-t border-[#222] space-y-3">
            <span className="text-xs font-semibold text-[#888]">Your Saved Variants</span>
            <div className="grid gap-2">
              {customVariants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-[#333] bg-[#111] group"
                >
                  <button
                    onClick={() => applyVariant(variant)}
                    className="flex-1 text-left"
                  >
                    <span className="text-xs text-white">{variant.name}</span>
                  </button>
                  {onDeleteCustomVariant && (
                    <button
                      onClick={() => onDeleteCustomVariant(variant.id)}
                      className="p-1 text-[#444] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Variant Categories */}
        <div className="pt-4 border-t border-[#222] space-y-2">
          <span className="text-xs font-semibold text-[#555]">All Style Categories</span>
          
          {BUILT_IN_VARIANTS.map((category) => (
            <div key={category.id} className="border border-[#222] rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-[#111] transition-colors"
              >
                <span className="text-xs font-medium text-[#888]">{category.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#555]">{category.variants.length}</span>
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[#555]" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[#555]" />
                  )}
                </div>
              </button>
              
              {expandedCategories.has(category.id) && (
                <div className="p-2 pt-0 space-y-1">
                  {category.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => applyVariant(variant)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors text-left"
                    >
                      <span className="text-[11px] text-[#666]">{variant.name}</span>
                      <Wand2 className="w-3 h-3 text-[#333]" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VariantsPanel;
