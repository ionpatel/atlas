"use client";

import { useState, useRef, useCallback } from "react";
import { 
  Image as ImageIcon, Upload, Search, X, Check, Loader2, 
  Grid, Rows, Mountain, Building2, User, Utensils, Dumbbell, 
  Briefcase, Camera, Palette, Heart, MapPin, ShoppingBag, 
  Laptop, Music2, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   ATLAS IMAGE LIBRARY - Placeholder Library + Drag-Drop Upload
   ═══════════════════════════════════════════════════════════════════════════ */

interface ImageLibraryProps {
  onSelectImage: (url: string) => void;
  onClose?: () => void;
}

// Curated placeholder image collections
const PLACEHOLDER_CATEGORIES = [
  { id: "all", name: "All", icon: Grid },
  { id: "business", name: "Business", icon: Briefcase },
  { id: "fitness", name: "Fitness", icon: Dumbbell },
  { id: "food", name: "Food", icon: Utensils },
  { id: "nature", name: "Nature", icon: Mountain },
  { id: "architecture", name: "Architecture", icon: Building2 },
  { id: "people", name: "People", icon: User },
  { id: "tech", name: "Tech", icon: Laptop },
  { id: "travel", name: "Travel", icon: MapPin },
  { id: "ecommerce", name: "Products", icon: ShoppingBag },
];

// High-quality placeholder images from Unsplash
const PLACEHOLDER_IMAGES = [
  // Business
  { url: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&q=80", category: "business", tags: ["office", "meeting", "team"] },
  { url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80", category: "business", tags: ["professional", "portrait", "corporate"] },
  { url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80", category: "business", tags: ["woman", "professional", "office"] },
  { url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80", category: "business", tags: ["presentation", "meeting", "team"] },
  { url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80", category: "business", tags: ["teamwork", "collaboration", "office"] },
  
  // Fitness
  { url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80", category: "fitness", tags: ["gym", "workout", "weights"] },
  { url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80", category: "fitness", tags: ["gym", "equipment", "training"] },
  { url: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80", category: "fitness", tags: ["gym", "workout", "fitness"] },
  { url: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80", category: "fitness", tags: ["gym", "modern", "equipment"] },
  { url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80", category: "fitness", tags: ["yoga", "wellness", "meditation"] },
  
  // Food
  { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", category: "food", tags: ["restaurant", "dining", "fine dining"] },
  { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", category: "food", tags: ["food", "plate", "gourmet"] },
  { url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80", category: "food", tags: ["pancakes", "breakfast", "delicious"] },
  { url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80", category: "food", tags: ["salad", "healthy", "fresh"] },
  { url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80", category: "food", tags: ["pizza", "italian", "food"] },
  
  // Nature
  { url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80", category: "nature", tags: ["mountains", "landscape", "scenic"] },
  { url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80", category: "nature", tags: ["lake", "mountains", "reflection"] },
  { url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80", category: "nature", tags: ["forest", "trees", "path"] },
  { url: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80", category: "nature", tags: ["waterfall", "nature", "scenic"] },
  { url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80", category: "nature", tags: ["mountains", "lake", "landscape"] },
  
  // Architecture
  { url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80", category: "architecture", tags: ["modern", "house", "luxury"] },
  { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", category: "architecture", tags: ["house", "exterior", "modern"] },
  { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80", category: "architecture", tags: ["interior", "living room", "modern"] },
  { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80", category: "architecture", tags: ["villa", "pool", "luxury"] },
  { url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80", category: "architecture", tags: ["interior", "design", "living"] },
  
  // People
  { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", category: "people", tags: ["man", "portrait", "professional"] },
  { url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80", category: "people", tags: ["woman", "portrait", "smile"] },
  { url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80", category: "people", tags: ["woman", "portrait", "professional"] },
  { url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80", category: "people", tags: ["man", "portrait", "casual"] },
  { url: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800&q=80", category: "people", tags: ["man", "athlete", "fitness"] },
  
  // Tech
  { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80", category: "tech", tags: ["laptop", "work", "analytics"] },
  { url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80", category: "tech", tags: ["team", "computers", "office"] },
  { url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80", category: "tech", tags: ["laptop", "minimal", "work"] },
  { url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80", category: "tech", tags: ["gaming", "retro", "tech"] },
  { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80", category: "tech", tags: ["circuit", "technology", "futuristic"] },
  
  // Travel
  { url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80", category: "travel", tags: ["paris", "eiffel tower", "city"] },
  { url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80", category: "travel", tags: ["boat", "lake", "mountains"] },
  { url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", category: "travel", tags: ["beach", "pool", "resort"] },
  { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", category: "travel", tags: ["beach", "tropical", "palm"] },
  { url: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&q=80", category: "travel", tags: ["santorini", "greece", "architecture"] },
  
  // E-commerce / Products
  { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80", category: "ecommerce", tags: ["watch", "product", "minimal"] },
  { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", category: "ecommerce", tags: ["headphones", "product", "tech"] },
  { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", category: "ecommerce", tags: ["shoes", "sneakers", "product"] },
  { url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80", category: "ecommerce", tags: ["sunglasses", "product", "fashion"] },
  { url: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80", category: "ecommerce", tags: ["skincare", "beauty", "product"] },
];

export function ImageLibrary({ onSelectImage, onClose }: ImageLibraryProps) {
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "rows">("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter images based on category and search
  const filteredImages = PLACEHOLDER_IMAGES.filter((img) => {
    const matchesCategory = category === "all" || img.category === category;
    const matchesSearch = searchQuery === "" || 
      img.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      img.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle file upload (convert to base64 for local storage/preview)
  const handleFileUpload = useCallback(async (files: FileList) => {
    setIsUploading(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newImages.push(base64);
      } catch (err) {
        console.error("Error reading file:", err);
      }
    }

    setUploadedImages(prev => [...newImages, ...prev]);
    setIsUploading(false);
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  return (
    <div className="flex flex-col h-full bg-[#111]">
      {/* Header */}
      <div className="p-4 border-b border-[#222]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#CDB49E]" />
            <h3 className="text-sm font-semibold text-white">Image Library</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("p-1.5 rounded", viewMode === "grid" ? "bg-[#CDB49E]/20 text-[#CDB49E]" : "text-[#666] hover:text-white")}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("rows")}
              className={cn("p-1.5 rounded", viewMode === "rows" ? "bg-[#CDB49E]/20 text-[#CDB49E]" : "text-[#666] hover:text-white")}
            >
              <Rows className="w-4 h-4" />
            </button>
            {onClose && (
              <button onClick={onClose} className="p-1.5 text-[#666] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
          <input
            type="text"
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder:text-[#555] focus:border-[#CDB49E] focus:outline-none"
          />
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "mx-4 mt-4 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all",
          isDragging
            ? "border-[#CDB49E] bg-[#CDB49E]/10"
            : "border-[#333] hover:border-[#444] hover:bg-[#0a0a0a]"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />
        <div className="text-center">
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-[#CDB49E] mx-auto mb-2 animate-spin" />
              <p className="text-sm text-[#888]">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-[#666] mx-auto mb-2" />
              <p className="text-sm text-white mb-1">Drop images here</p>
              <p className="text-xs text-[#666]">or click to browse</p>
            </>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-1 px-4 py-3 overflow-x-auto scrollbar-hide">
        {PLACEHOLDER_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                category === cat.id
                  ? "bg-[#CDB49E] text-[#111]"
                  : "bg-[#1a1a1a] text-[#888] hover:text-white"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Image Grid */}
      <div className="flex-1 overflow-auto p-4">
        {/* Uploaded Images Section */}
        {uploadedImages.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-[#555] uppercase mb-3">Your Uploads</h4>
            <div className={cn(
              viewMode === "grid"
                ? "grid grid-cols-3 gap-2"
                : "space-y-2"
            )}>
              {uploadedImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => onSelectImage(img)}
                  className={cn(
                    "group relative rounded-lg overflow-hidden border border-[#333] hover:border-[#CDB49E] transition-all",
                    viewMode === "grid" ? "aspect-square" : "h-24 w-full flex"
                  )}
                >
                  <img
                    src={img}
                    alt=""
                    className={cn(
                      "object-cover transition-transform group-hover:scale-105",
                      viewMode === "grid" ? "w-full h-full" : "w-24 h-full"
                    )}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Check className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {viewMode === "rows" && (
                    <div className="flex-1 px-3 py-2">
                      <p className="text-xs text-[#888]">Uploaded image</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Placeholder Images */}
        <h4 className="text-xs font-semibold text-[#555] uppercase mb-3">
          {category === "all" ? "All Images" : PLACEHOLDER_CATEGORIES.find(c => c.id === category)?.name}
          <span className="text-[#444] ml-2">({filteredImages.length})</span>
        </h4>
        <div className={cn(
          viewMode === "grid"
            ? "grid grid-cols-3 gap-2"
            : "space-y-2"
        )}>
          {filteredImages.map((img, i) => (
            <button
              key={i}
              onClick={() => onSelectImage(img.url)}
              className={cn(
                "group relative rounded-lg overflow-hidden border border-[#333] hover:border-[#CDB49E] transition-all",
                viewMode === "grid" ? "aspect-square" : "h-24 w-full flex"
              )}
            >
              <img
                src={img.url}
                alt={img.tags.join(", ")}
                className={cn(
                  "object-cover transition-transform group-hover:scale-105",
                  viewMode === "grid" ? "w-full h-full" : "w-24 h-full"
                )}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <Check className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {viewMode === "rows" && (
                <div className="flex-1 px-3 py-2">
                  <p className="text-xs text-white mb-1 capitalize">{img.category}</p>
                  <p className="text-[10px] text-[#666]">{img.tags.join(", ")}</p>
                </div>
              )}
            </button>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-12">
            <Camera className="w-12 h-12 text-[#333] mx-auto mb-3" />
            <p className="text-sm text-[#666]">No images found</p>
            <p className="text-xs text-[#555]">Try a different search or category</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageLibrary;
