"use client";

import { useState, useRef, useEffect } from "react";
import { 
  X, Eye, Check, Sparkles, Maximize2, Monitor, Tablet, Smartphone,
  ChevronLeft, ChevronRight, Star, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   TEMPLATE PREVIEW COMPONENT
   Full preview modal with device switching and live preview
   ═══════════════════════════════════════════════════════════════════════════ */

export interface TemplateInfo {
  id: string;
  name: string;
  category: string;
  preview: string;       // Gradient or image URL
  thumbnail?: string;    // Optional static thumbnail
  description?: string;
  features?: string[];
  popular?: boolean;
}

interface TemplatePreviewProps {
  template: TemplateInfo;
  templates: TemplateInfo[];
  onSelect: (templateId: string) => void;
  onClose: () => void;
  renderPreview?: (templateId: string) => React.ReactNode;
}

// Template thumbnails with realistic preview data
export const TEMPLATE_THUMBNAILS: Record<string, string> = {
  athletic: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
  saas: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
  agency: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&q=80",
  consulting: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  lawfirm: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
  realestate: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
  medical: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
  wellness: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80",
  gym: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
  ecommerce: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80",
  fashion: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  portfolio: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
  photography: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80",
  restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  cafe: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
  education: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
  travel: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
};

// Template feature descriptions
export const TEMPLATE_FEATURES: Record<string, string[]> = {
  athletic: ["Hero with video background", "Training programs grid", "Testimonial carousel", "Class schedule"],
  saas: ["Animated statistics", "Feature comparison", "Pricing tables", "Integration logos"],
  agency: ["Portfolio showcase", "Team profiles", "Services grid", "Contact form"],
  consulting: ["Professional hero", "Case studies", "Client testimonials", "Booking form"],
  lawfirm: ["Practice areas", "Attorney profiles", "Consultation form", "FAQ section"],
  realestate: ["Property listings", "Search filters", "Agent profiles", "Virtual tours"],
  medical: ["Services overview", "Doctor profiles", "Appointment booking", "Insurance info"],
  wellness: ["Treatment menu", "Booking calendar", "Testimonials", "Gallery"],
  gym: ["Class schedules", "Membership plans", "Trainer profiles", "Before/after gallery"],
  ecommerce: ["Product grid", "Shopping cart", "Category filters", "Customer reviews"],
  fashion: ["Lookbook gallery", "Collection showcase", "Size guides", "Wishlist"],
  portfolio: ["Project gallery", "About section", "Skills showcase", "Contact form"],
  photography: ["Full-screen gallery", "Project categories", "About section", "Booking"],
  restaurant: ["Menu display", "Reservation form", "Gallery", "Location map"],
  cafe: ["Menu board", "Hours & location", "Instagram feed", "Online ordering"],
  education: ["Course catalog", "Instructor bios", "Curriculum preview", "Enrollment form"],
  travel: ["Destination showcase", "Trip packages", "Booking form", "Travel guides"],
};

export function TemplatePreviewModal({
  template,
  templates,
  onSelect,
  onClose,
  renderPreview,
}: TemplatePreviewProps) {
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [currentIndex, setCurrentIndex] = useState(templates.findIndex(t => t.id === template.id));
  const currentTemplate = templates[currentIndex] || template;

  const goNext = () => {
    setCurrentIndex(prev => (prev + 1) % templates.length);
  };

  const goPrev = () => {
    setCurrentIndex(prev => (prev - 1 + templates.length) % templates.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Enter") onSelect(currentTemplate.id);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTemplate, onClose, onSelect]);

  const thumbnail = TEMPLATE_THUMBNAILS[currentTemplate.id] || currentTemplate.thumbnail;
  const features = TEMPLATE_FEATURES[currentTemplate.id] || currentTemplate.features || [];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col">
      {/* Header */}
      <div className="h-14 bg-[#111]/80 backdrop-blur border-b border-[#333] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-[#666] hover:text-white hover:bg-[#222]"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-[#333]" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">{currentTemplate.name}</h2>
              {currentTemplate.popular && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400" />
                  Popular
                </span>
              )}
            </div>
            <span className="text-xs text-[#666] capitalize">{currentTemplate.category}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Device Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
            {[
              { id: "desktop" as const, icon: Monitor, label: "Desktop" },
              { id: "tablet" as const, icon: Tablet, label: "Tablet" },
              { id: "mobile" as const, icon: Smartphone, label: "Mobile" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setDevicePreview(id)}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  devicePreview === id 
                    ? "bg-[#CDB49E]/10 text-[#CDB49E]" 
                    : "text-[#555] hover:text-white"
                )}
                title={label}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          <button
            onClick={() => onSelect(currentTemplate.id)}
            className="px-4 py-2 rounded-lg bg-[#CDB49E] text-black font-medium text-sm hover:bg-[#d4c0ad] flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Use Template
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Arrows */}
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-[#111]/80 backdrop-blur border border-[#333] text-white hover:bg-[#222] hover:border-[#444]"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-[#111]/80 backdrop-blur border border-[#333] text-white hover:bg-[#222] hover:border-[#444]"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div 
            className={cn(
              "bg-[#0a0a0a] rounded-xl shadow-2xl overflow-hidden transition-all duration-300 border border-[#333]",
              devicePreview === "desktop" && "w-full max-w-5xl h-[80vh]",
              devicePreview === "tablet" && "w-[768px] h-[80vh]",
              devicePreview === "mobile" && "w-[375px] h-[80vh]"
            )}
          >
            {renderPreview ? (
              <div className="w-full h-full overflow-auto">
                {renderPreview(currentTemplate.id)}
              </div>
            ) : thumbnail ? (
              <div 
                className="w-full h-full bg-cover bg-top"
                style={{ backgroundImage: `url(${thumbnail})` }}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a]/80" />
              </div>
            ) : (
              <div 
                className="w-full h-full flex flex-col"
                style={{ background: currentTemplate.preview }}
              >
                {/* Placeholder Preview */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-white/30 mx-auto mb-4" />
                    <p className="text-white/50 text-sm">Template Preview</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-[#111] border-l border-[#333] p-6 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">{currentTemplate.name}</h3>
            <p className="text-sm text-[#888]">
              {currentTemplate.description || `A beautiful ${currentTemplate.category} template designed for modern businesses.`}
            </p>
          </div>

          {features.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-[#666] uppercase mb-3">Included Sections</h4>
              <ul className="space-y-2">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#888]">
                    <Zap className="w-4 h-4 text-[#CDB49E]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-6">
            <h4 className="text-xs font-semibold text-[#666] uppercase mb-3">Category</h4>
            <span className="inline-block px-3 py-1.5 rounded-full bg-[#1a1a1a] text-sm text-white capitalize">
              {currentTemplate.category}
            </span>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onSelect(currentTemplate.id)}
              className="w-full px-4 py-3 rounded-xl bg-[#CDB49E] text-black font-semibold text-sm hover:bg-[#d4c0ad] flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Use This Template
            </button>
            <p className="text-xs text-center text-[#555]">
              Press Enter to select • Arrow keys to browse
            </p>
          </div>
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="h-24 bg-[#111]/80 backdrop-blur border-t border-[#333] px-8 py-3 overflow-x-auto">
        <div className="flex items-center gap-3 h-full">
          {templates.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "h-full aspect-video rounded-lg overflow-hidden transition-all shrink-0",
                i === currentIndex 
                  ? "ring-2 ring-[#CDB49E] scale-105" 
                  : "opacity-60 hover:opacity-100"
              )}
            >
              {TEMPLATE_THUMBNAILS[t.id] ? (
                <img 
                  src={TEMPLATE_THUMBNAILS[t.id]} 
                  alt={t.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full"
                  style={{ background: t.preview }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Smaller preview card for template grid
export function TemplateCard({
  template,
  onSelect,
  onPreview,
}: {
  template: TemplateInfo;
  onSelect: (id: string) => void;
  onPreview?: (id: string) => void;
}) {
  const thumbnail = TEMPLATE_THUMBNAILS[template.id] || template.thumbnail;

  return (
    <div className="group relative bg-[#111] border border-[#2a2a2a] rounded-2xl overflow-hidden hover:border-[#CDB49E]/50 transition-all cursor-pointer hover:transform hover:scale-[1.02]">
      {/* Thumbnail */}
      <div className="h-40 relative overflow-hidden">
        {thumbnail ? (
          <img 
            src={thumbnail}
            alt={template.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div 
            className="w-full h-full" 
            style={{ background: template.preview }}
          />
        )}
        
        {template.popular && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500 text-[10px] font-bold text-black uppercase tracking-wider">
            Popular
          </span>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          {onPreview && (
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(template.id); }}
              className="p-3 rounded-full bg-white/10 backdrop-blur text-white hover:bg-white/20"
            >
              <Eye className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => onSelect(template.id)}
            className="px-4 py-2 rounded-full bg-[#CDB49E] text-black font-medium text-sm hover:bg-[#d4c0ad]"
          >
            Use Template
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-5" onClick={() => onSelect(template.id)}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-white block">{template.name}</span>
            <span className="text-xs text-[#666] capitalize">{template.category}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
