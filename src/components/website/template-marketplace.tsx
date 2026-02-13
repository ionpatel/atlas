"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Store, Search, Download, Eye, Star, Users, Clock, Filter, Grid, List,
  Heart, HeartOff, Check, ChevronDown, ChevronRight, ExternalLink, Sparkles,
  TrendingUp, Award, Zap, Lock, Crown, X, ArrowRight, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   TEMPLATE MARKETPLACE
   Browse, preview, and install community templates
   ═══════════════════════════════════════════════════════════════════════════ */

export interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail: string;
  preview?: string;
  author: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  stats: {
    downloads: number;
    rating: number;
    reviews: number;
    favorites: number;
  };
  pricing: {
    type: "free" | "premium" | "pro";
    price?: number;
  };
  features: string[];
  createdAt: string;
  updatedAt: string;
  version: string;
  compatibility: string[];
  // The actual template data
  templateData?: unknown;
}

// Categories
const CATEGORIES = [
  { id: "all", label: "All Templates", icon: Grid },
  { id: "landing", label: "Landing Pages", icon: Zap },
  { id: "business", label: "Business", icon: Award },
  { id: "ecommerce", label: "E-commerce", icon: Store },
  { id: "portfolio", label: "Portfolio", icon: Star },
  { id: "blog", label: "Blog", icon: TrendingUp },
  { id: "saas", label: "SaaS", icon: Sparkles },
  { id: "agency", label: "Agency", icon: Users },
];

// Sort options
const SORT_OPTIONS = [
  { id: "popular", label: "Most Popular" },
  { id: "newest", label: "Newest" },
  { id: "rating", label: "Highest Rated" },
  { id: "downloads", label: "Most Downloads" },
];

// Mock marketplace data (would come from API in production)
const MOCK_TEMPLATES: MarketplaceTemplate[] = [
  {
    id: "tpl-001",
    name: "SaaS Pro",
    description: "Modern SaaS landing page with pricing, features, and testimonials. Perfect for software products.",
    category: "saas",
    tags: ["saas", "startup", "landing", "modern", "dark"],
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    author: { name: "Atlas Team", verified: true },
    stats: { downloads: 12500, rating: 4.9, reviews: 342, favorites: 1823 },
    pricing: { type: "free" },
    features: ["Hero Section", "Feature Grid", "Pricing Table", "Testimonials", "CTA", "Footer"],
    createdAt: "2026-01-15",
    updatedAt: "2026-02-10",
    version: "2.1.0",
    compatibility: ["Atlas Builder 3.0+"],
  },
  {
    id: "tpl-002",
    name: "Agency Portfolio",
    description: "Creative agency portfolio with case studies, team section, and contact form.",
    category: "agency",
    tags: ["agency", "creative", "portfolio", "dark", "minimal"],
    thumbnail: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&q=80",
    author: { name: "Design Studio", verified: true },
    stats: { downloads: 8900, rating: 4.8, reviews: 256, favorites: 1456 },
    pricing: { type: "premium", price: 29 },
    features: ["Portfolio Grid", "Case Studies", "Team Section", "Contact Form", "Animated Sections"],
    createdAt: "2026-01-20",
    updatedAt: "2026-02-08",
    version: "1.5.0",
    compatibility: ["Atlas Builder 3.0+"],
  },
  {
    id: "tpl-003",
    name: "E-commerce Starter",
    description: "Complete e-commerce template with product grid, cart, and checkout flow.",
    category: "ecommerce",
    tags: ["ecommerce", "shop", "products", "modern"],
    thumbnail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    author: { name: "Commerce Labs" },
    stats: { downloads: 6700, rating: 4.7, reviews: 189, favorites: 987 },
    pricing: { type: "pro", price: 49 },
    features: ["Product Grid", "Shopping Cart", "Checkout", "Order Summary", "Quick View"],
    createdAt: "2026-01-10",
    updatedAt: "2026-02-05",
    version: "3.0.0",
    compatibility: ["Atlas Builder 3.0+"],
  },
  {
    id: "tpl-004",
    name: "Personal Portfolio",
    description: "Clean personal portfolio for designers and developers. Showcase your work beautifully.",
    category: "portfolio",
    tags: ["portfolio", "personal", "minimal", "clean"],
    thumbnail: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80",
    author: { name: "MinimalDesigns", verified: true },
    stats: { downloads: 15600, rating: 4.9, reviews: 567, favorites: 2341 },
    pricing: { type: "free" },
    features: ["Hero", "About", "Projects Grid", "Skills", "Contact", "Resume Download"],
    createdAt: "2025-12-20",
    updatedAt: "2026-02-01",
    version: "2.3.0",
    compatibility: ["Atlas Builder 3.0+"],
  },
  {
    id: "tpl-005",
    name: "Tech Blog",
    description: "Modern blog template with article cards, categories, and newsletter signup.",
    category: "blog",
    tags: ["blog", "tech", "articles", "newsletter"],
    thumbnail: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80",
    author: { name: "BlogCraft" },
    stats: { downloads: 4500, rating: 4.6, reviews: 134, favorites: 678 },
    pricing: { type: "premium", price: 19 },
    features: ["Blog Hero", "Article Cards", "Categories", "Author Bio", "Newsletter", "Related Posts"],
    createdAt: "2026-01-25",
    updatedAt: "2026-02-12",
    version: "1.2.0",
    compatibility: ["Atlas Builder 3.0+"],
  },
  {
    id: "tpl-006",
    name: "Startup Launch",
    description: "High-converting startup landing page with waitlist signup and social proof.",
    category: "landing",
    tags: ["startup", "launch", "waitlist", "conversion"],
    thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    author: { name: "LaunchPad", verified: true },
    stats: { downloads: 9800, rating: 4.8, reviews: 298, favorites: 1567 },
    pricing: { type: "free" },
    features: ["Video Hero", "Problem/Solution", "Features", "Testimonials", "Waitlist Form", "FAQ"],
    createdAt: "2026-01-05",
    updatedAt: "2026-02-09",
    version: "2.0.0",
    compatibility: ["Atlas Builder 3.0+"],
  },
  {
    id: "tpl-007",
    name: "Consulting Firm",
    description: "Professional template for consulting and professional services firms.",
    category: "business",
    tags: ["business", "consulting", "corporate", "professional"],
    thumbnail: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    author: { name: "BizTemplates" },
    stats: { downloads: 5600, rating: 4.7, reviews: 178, favorites: 892 },
    pricing: { type: "premium", price: 39 },
    features: ["Hero", "Services", "Case Studies", "Team", "Testimonials", "Contact"],
    createdAt: "2026-01-18",
    updatedAt: "2026-02-07",
    version: "1.8.0",
    compatibility: ["Atlas Builder 3.0+"],
  },
  {
    id: "tpl-008",
    name: "Fitness Studio",
    description: "Athletic and dynamic template for gyms, fitness studios, and personal trainers.",
    category: "business",
    tags: ["fitness", "gym", "athletic", "health"],
    thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    author: { name: "Atlas Team", verified: true },
    stats: { downloads: 7200, rating: 4.8, reviews: 234, favorites: 1123 },
    pricing: { type: "free" },
    features: ["Video Hero", "Classes", "Trainers", "Pricing", "Schedule", "Contact"],
    createdAt: "2025-12-15",
    updatedAt: "2026-02-11",
    version: "2.5.0",
    compatibility: ["Atlas Builder 3.0+"],
  },
];

// Format number with K/M suffix
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

// Price badge component
function PriceBadge({ pricing }: { pricing: MarketplaceTemplate["pricing"] }) {
  if (pricing.type === "free") {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">
        FREE
      </span>
    );
  }
  if (pricing.type === "premium") {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#CDB49E]/20 text-[#CDB49E]">
        ${pricing.price}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/20 text-violet-400">
      <Crown className="w-3 h-3" />
      PRO ${pricing.price}
    </span>
  );
}

// Rating stars component
function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "w-3 h-3",
            star <= Math.floor(rating) 
              ? "text-yellow-400 fill-yellow-400" 
              : "text-[#333]"
          )}
        />
      ))}
    </div>
  );
}

// Template card component
function TemplateCard({
  template,
  onPreview,
  onInstall,
  isFavorite,
  onToggleFavorite,
  viewMode,
}: {
  template: MarketplaceTemplate;
  onPreview: () => void;
  onInstall: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  viewMode: "grid" | "list";
}) {
  const [isHovered, setIsHovered] = useState(false);

  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-4 p-4 bg-[#111] rounded-xl border border-[#222] hover:border-[#333] transition-colors">
        {/* Thumbnail */}
        <div className="relative w-40 h-24 rounded-lg overflow-hidden shrink-0">
          <img 
            src={template.thumbnail} 
            alt={template.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            <PriceBadge pricing={template.pricing} />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-white truncate">{template.name}</h3>
            {template.author.verified && (
              <Check className="w-3.5 h-3.5 text-blue-400" />
            )}
          </div>
          <p className="text-xs text-[#888] line-clamp-1 mb-2">{template.description}</p>
          <div className="flex items-center gap-4 text-[10px] text-[#666]">
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {formatNumber(template.stats.downloads)}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" />
              {template.stats.rating}
            </span>
            <span>by {template.author.name}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleFavorite}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isFavorite 
                ? "text-red-400 bg-red-500/10" 
                : "text-[#666] hover:text-red-400 hover:bg-[#1a1a1a]"
            )}
          >
            {isFavorite ? <Heart className="w-4 h-4 fill-current" /> : <HeartOff className="w-4 h-4" />}
          </button>
          <button
            onClick={onPreview}
            className="px-3 py-2 rounded-lg text-xs text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onInstall}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-[#CDB49E] text-black hover:opacity-90 transition-opacity"
          >
            {template.pricing.type === "free" ? "Install" : "Get"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative bg-[#111] rounded-xl border border-[#222] overflow-hidden hover:border-[#333] transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={template.thumbnail}
          alt={template.name}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500",
            isHovered && "scale-105"
          )}
        />
        
        {/* Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-2">
            <button
              onClick={onPreview}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/10 backdrop-blur-sm text-white text-xs font-medium hover:bg-white/20 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              onClick={onInstall}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#CDB49E] text-black text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <Download className="w-3.5 h-3.5" />
              {template.pricing.type === "free" ? "Install" : "Get"}
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <PriceBadge pricing={template.pricing} />
        </div>

        {/* Favorite */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full transition-all",
            isFavorite 
              ? "bg-red-500/20 text-red-400" 
              : "bg-black/40 text-white/60 opacity-0 group-hover:opacity-100 hover:text-red-400"
          )}
        >
          <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">{template.name}</h3>
              {template.author.verified && (
                <Check className="w-3.5 h-3.5 text-blue-400" />
              )}
            </div>
            <p className="text-[10px] text-[#666]">by {template.author.name}</p>
          </div>
          <div className="flex items-center gap-1">
            <RatingStars rating={template.stats.rating} />
            <span className="text-[10px] text-[#888] ml-1">{template.stats.rating}</span>
          </div>
        </div>

        <p className="text-xs text-[#888] line-clamp-2 mb-3">{template.description}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-[10px] text-[#666]">
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {formatNumber(template.stats.downloads)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {formatNumber(template.stats.favorites)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            v{template.version}
          </span>
        </div>
      </div>
    </div>
  );
}

// Preview modal component
function PreviewModal({
  template,
  onClose,
  onInstall,
}: {
  template: MarketplaceTemplate;
  onClose: () => void;
  onInstall: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#111] rounded-2xl overflow-hidden border border-[#333]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#222]">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">{template.name}</h2>
                {template.author.verified && (
                  <Check className="w-4 h-4 text-blue-400" />
                )}
                <PriceBadge pricing={template.pricing} />
              </div>
              <p className="text-xs text-[#666]">by {template.author.name} • v{template.version}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onInstall}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#CDB49E] text-black text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Download className="w-4 h-4" />
              {template.pricing.type === "free" ? "Install Template" : `Get for $${template.pricing.price}`}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#888] hover:text-white hover:bg-[#222] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="relative h-[60vh] overflow-auto bg-[#0a0a0a]">
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-auto"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8">
              <p className="text-[#666] mb-4">Full preview would render the template here</p>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-[#CDB49E] text-sm hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Open Full Preview
              </a>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-4 border-t border-[#222]">
          <div className="grid grid-cols-4 gap-6">
            {/* Stats */}
            <div>
              <h4 className="text-xs font-semibold text-[#888] mb-2">Stats</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#666]">Downloads</span>
                  <span className="text-white">{formatNumber(template.stats.downloads)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#666]">Rating</span>
                  <span className="text-white flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    {template.stats.rating}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#666]">Reviews</span>
                  <span className="text-white">{template.stats.reviews}</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="col-span-2">
              <h4 className="text-xs font-semibold text-[#888] mb-2">Included Sections</h4>
              <div className="flex flex-wrap gap-1">
                {template.features.map((feature) => (
                  <span
                    key={feature}
                    className="px-2 py-1 rounded-full bg-[#1a1a1a] text-[10px] text-[#888]"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-xs font-semibold text-[#888] mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded text-[10px] text-[#666] bg-[#1a1a1a]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TemplateMarketplace({
  onInstallTemplate,
  installedTemplates = [],
}: {
  onInstallTemplate: (template: MarketplaceTemplate) => void;
  installedTemplates?: string[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [previewTemplate, setPreviewTemplate] = useState<MarketplaceTemplate | null>(null);
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "premium">("all");
  const [isLoading, setIsLoading] = useState(false);

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let result = [...MOCK_TEMPLATES];

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter(t => t.category === selectedCategory);
    }

    // Price filter
    if (priceFilter !== "all") {
      result = result.filter(t => 
        priceFilter === "free" ? t.pricing.type === "free" : t.pricing.type !== "free"
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "rating":
        result.sort((a, b) => b.stats.rating - a.stats.rating);
        break;
      case "downloads":
        result.sort((a, b) => b.stats.downloads - a.stats.downloads);
        break;
      default: // popular
        result.sort((a, b) => (b.stats.downloads * b.stats.rating) - (a.stats.downloads * a.stats.rating));
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy, priceFilter]);

  // Toggle favorite
  const toggleFavorite = useCallback((templateId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(templateId)) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }
      return next;
    });
  }, []);

  // Handle install
  const handleInstall = useCallback((template: MarketplaceTemplate) => {
    setIsLoading(true);
    // Simulate installation
    setTimeout(() => {
      onInstallTemplate(template);
      setIsLoading(false);
      setPreviewTemplate(null);
    }, 1000);
  }, [onInstallTemplate]);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="p-4 border-b border-[#222]">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Template Marketplace</h3>
            <p className="text-[10px] text-[#666]">{MOCK_TEMPLATES.length} templates available</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm text-white placeholder-[#666] focus:border-[#CDB49E] focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Pills */}
          <div className="flex gap-1 overflow-x-auto pb-1 flex-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                    selectedCategory === cat.id
                      ? "bg-[#CDB49E] text-black"
                      : "bg-[#1a1a1a] text-[#888] hover:text-white"
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Price Filter */}
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value as "all" | "free" | "premium")}
            className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#333] text-xs text-white"
          >
            <option value="all">All Prices</option>
            <option value="free">Free Only</option>
            <option value="premium">Premium</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#333] text-xs text-white"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>

          {/* View Mode */}
          <div className="flex border border-[#333] rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5",
                viewMode === "grid" ? "bg-[#333] text-white" : "text-[#666] hover:text-white"
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5",
                viewMode === "list" ? "bg-[#333] text-white" : "text-[#666] hover:text-white"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <div className="flex-1 overflow-auto p-4">
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Search className="w-12 h-12 text-[#333] mb-4" />
            <p className="text-sm text-[#666]">No templates found</p>
            <p className="text-xs text-[#555] mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={cn(
            viewMode === "grid" 
              ? "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
              : "space-y-3"
          )}>
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onPreview={() => setPreviewTemplate(template)}
                onInstall={() => handleInstall(template)}
                isFavorite={favorites.has(template.id)}
                onToggleFavorite={() => toggleFavorite(template.id)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onInstall={() => handleInstall(previewTemplate)}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-8 bg-[#111] rounded-2xl border border-[#333]">
            <RefreshCw className="w-8 h-8 text-[#CDB49E] animate-spin" />
            <p className="text-sm text-white">Installing template...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplateMarketplace;
