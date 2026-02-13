"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Globe, Plus, Eye, EyeOff, Trash2, Copy, GripVertical, Type, Image as ImageIcon, 
  DollarSign, MessageSquare, Mail, Grid, Star, Zap, Palette, FileText, Home, Monitor, Smartphone,
  Tablet, Check, ChevronRight, ChevronDown, ChevronUp, Sparkles, Settings2, Paintbrush, X, Rocket,
  BarChart3, Layers, Upload, CheckCircle, ArrowRight, ArrowLeft, MousePointer,
  Building2, Briefcase, ShoppingBag, Camera, Utensils, Dumbbell, Heart, GraduationCap,
  Stethoscope, Scale, Car, Plane, Music2, Gamepad2, Coffee, Leaf,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Square, Play, 
  Box, Minus, Link, ExternalLink, LayoutGrid, Columns, SlidersHorizontal,
  CircleDot, Maximize2, Video, Move, Lock, Unlock, RotateCcw,
  Undo2, Redo2, Save, Code, PanelLeft, PanelRight,
  Frame, Container, Rows, AlignStartVertical, AlignCenterVertical,
  AlignEndVertical, GalleryHorizontal, Expand, ZoomIn, ZoomOut, Target,
  Droplets, Sparkle, Move3D, SquareDashed, PaletteIcon,
  AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd,
  AlignHorizontalSpaceBetween, Trophy, Users, Clock, Award, MapPin, Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   ATLAS WEBSITE BUILDER PRO v2.0
   Shopify + Wix + Figma Level Website Builder
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─────────────────────────── TYPES ─────────────────────────── */

interface ElementStyles {
  [key: string]: string | undefined;
}

interface ElementData {
  id: string;
  type: string;
  content: string;
  styles: ElementStyles;
  children?: ElementData[];
  locked?: boolean;
  hidden?: boolean;
}

interface SectionData {
  id: string;
  name: string;
  type: string;
  elements: ElementData[];
  styles: ElementStyles;
  locked?: boolean;
  hidden?: boolean;
}

/* ─────────────────────────── PREMIUM TEMPLATES ─────────────────────────── */

const TEMPLATES = [
  // Popular
  { id: "athletic", name: "Athletic Pro", icon: Dumbbell, preview: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", popular: true, category: "fitness" },
  { id: "saas", name: "SaaS Platform", icon: BarChart3, preview: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", popular: true, category: "tech" },
  { id: "agency", name: "Creative Agency", icon: Briefcase, preview: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)", popular: true, category: "business" },
  
  // Business
  { id: "consulting", name: "Consulting Firm", icon: Scale, preview: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", category: "business" },
  { id: "lawfirm", name: "Law Firm", icon: Scale, preview: "linear-gradient(135deg, #1c1917 0%, #292524 100%)", category: "business" },
  { id: "realestate", name: "Real Estate", icon: Building2, preview: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)", category: "business" },
  
  // Health & Wellness
  { id: "medical", name: "Medical Clinic", icon: Stethoscope, preview: "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)", category: "health" },
  { id: "wellness", name: "Wellness Spa", icon: Leaf, preview: "linear-gradient(135deg, #84cc16 0%, #22c55e 100%)", category: "health" },
  { id: "gym", name: "Fitness Gym", icon: Dumbbell, preview: "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)", category: "fitness" },
  
  // E-Commerce
  { id: "ecommerce", name: "E-Commerce", icon: ShoppingBag, preview: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)", category: "ecommerce" },
  { id: "fashion", name: "Fashion Store", icon: ShoppingBag, preview: "linear-gradient(135deg, #be185d 0%, #db2777 100%)", category: "ecommerce" },
  
  // Creative
  { id: "portfolio", name: "Portfolio", icon: Camera, preview: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)", category: "creative" },
  { id: "photography", name: "Photography", icon: Camera, preview: "linear-gradient(135deg, #171717 0%, #262626 100%)", category: "creative" },
  
  // Food & Hospitality
  { id: "restaurant", name: "Restaurant", icon: Utensils, preview: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", category: "food" },
  { id: "cafe", name: "Coffee Shop", icon: Coffee, preview: "linear-gradient(135deg, #78350f 0%, #92400e 100%)", category: "food" },
  
  // Education
  { id: "education", name: "Online Course", icon: GraduationCap, preview: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)", category: "education" },
  
  // Travel
  { id: "travel", name: "Travel Agency", icon: Plane, preview: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)", category: "travel" },
];

/* ─────────────────────────── COMPONENT LIBRARY ─────────────────────────── */

const COMPONENTS = {
  Layout: [
    { id: "section", name: "Section", icon: Frame },
    { id: "container", name: "Container", icon: Container },
    { id: "columns2", name: "2 Columns", icon: Columns },
    { id: "columns3", name: "3 Columns", icon: Grid },
    { id: "columns4", name: "4 Columns", icon: LayoutGrid },
  ],
  Basic: [
    { id: "heading", name: "Heading", icon: Type },
    { id: "subheading", name: "Subheading", icon: Type },
    { id: "text", name: "Paragraph", icon: FileText },
    { id: "button", name: "Button", icon: Square },
    { id: "buttonOutline", name: "Outline Button", icon: Square },
    { id: "link", name: "Text Link", icon: Link },
    { id: "list", name: "Bullet List", icon: AlignLeft },
    { id: "quote", name: "Quote", icon: MessageSquare },
    { id: "badge", name: "Badge", icon: Star },
  ],
  Media: [
    { id: "image", name: "Image", icon: ImageIcon },
    { id: "imageRounded", name: "Rounded Image", icon: ImageIcon },
    { id: "video", name: "Video Embed", icon: Video },
    { id: "videoBackground", name: "Video Background", icon: Video },
    { id: "icon", name: "Icon", icon: Star },
    { id: "avatar", name: "Avatar", icon: CircleDot },
    { id: "gallery", name: "Image Gallery", icon: GalleryHorizontal },
    { id: "beforeAfter", name: "Before/After", icon: SlidersHorizontal },
  ],
  Cards: [
    { id: "card", name: "Basic Card", icon: Square },
    { id: "featureCard", name: "Feature Card", icon: Zap },
    { id: "profileCard", name: "Profile Card", icon: CircleDot },
    { id: "pricingCard", name: "Pricing Card", icon: DollarSign },
    { id: "testimonialCard", name: "Testimonial Card", icon: MessageSquare },
    { id: "statCard", name: "Stat Card", icon: BarChart3 },
    { id: "serviceCard", name: "Service Card", icon: Briefcase },
    { id: "productCard", name: "Product Card", icon: ShoppingBag },
  ],
  Navigation: [
    { id: "navbar", name: "Navbar", icon: LayoutGrid },
    { id: "navbarDark", name: "Dark Navbar", icon: LayoutGrid },
    { id: "navbarTransparent", name: "Transparent Nav", icon: LayoutGrid },
    { id: "footer", name: "Footer", icon: Rows },
    { id: "footerSimple", name: "Simple Footer", icon: Minus },
    { id: "footerDark", name: "Dark Footer", icon: Rows },
  ],
  Heroes: [
    { id: "hero", name: "Hero Center", icon: Zap },
    { id: "heroWithImage", name: "Hero + Image", icon: Zap },
    { id: "heroSplit", name: "Hero Split", icon: Columns },
    { id: "heroVideo", name: "Video Hero", icon: Video },
    { id: "heroGradient", name: "Gradient Hero", icon: Sparkle },
    { id: "heroMinimal", name: "Minimal Hero", icon: Minus },
    { id: "heroAthletic", name: "Athletic Hero", icon: Dumbbell },
  ],
  Sections: [
    { id: "features3", name: "3 Features", icon: Grid },
    { id: "features4", name: "4 Features", icon: LayoutGrid },
    { id: "featuresIconGrid", name: "Icon Grid", icon: Grid },
    { id: "testimonials", name: "Testimonials", icon: MessageSquare },
    { id: "testimonialSingle", name: "Single Testimonial", icon: MessageSquare },
    { id: "pricing3", name: "Pricing Table", icon: DollarSign },
    { id: "team", name: "Team Section", icon: Building2 },
    { id: "teamGrid", name: "Team Grid", icon: Grid },
    { id: "stats", name: "Stats Section", icon: BarChart3 },
    { id: "statsAnimated", name: "Animated Stats", icon: BarChart3 },
    { id: "statsWithImage", name: "Stats + Image", icon: BarChart3 },
    { id: "faq", name: "FAQ Section", icon: CircleDot },
    { id: "faqAccordion", name: "FAQ Accordion", icon: ChevronDown },
    { id: "cta", name: "Call to Action", icon: Rocket },
    { id: "ctaBanner", name: "CTA Banner", icon: Rocket },
    { id: "ctaGradient", name: "Gradient CTA", icon: Sparkle },
    { id: "contact", name: "Contact Section", icon: Mail },
    { id: "contactSplit", name: "Contact Split", icon: Columns },
    { id: "logoCloud", name: "Logo Cloud", icon: Building2 },
    { id: "services", name: "Services Grid", icon: Briefcase },
    { id: "gallery3", name: "Gallery 3 Col", icon: GalleryHorizontal },
    { id: "gallery4", name: "Gallery 4 Col", icon: Grid },
    { id: "timeline", name: "Timeline", icon: Clock },
    { id: "process", name: "Process Steps", icon: ArrowRight },
    { id: "comparison", name: "Comparison Table", icon: Columns },
    { id: "mapSection", name: "Map + Contact", icon: MapPin },
    { id: "newsletter", name: "Newsletter", icon: Mail },
    { id: "philosophy", name: "Philosophy", icon: Sparkle },
  ],
  Utility: [
    { id: "divider", name: "Divider", icon: Minus },
    { id: "dividerDots", name: "Dots Divider", icon: CircleDot },
    { id: "spacer", name: "Spacer", icon: Expand },
    { id: "spacerLarge", name: "Large Spacer", icon: Expand },
  ],
  Interactive: [
    { id: "countdown", name: "Countdown", icon: Clock },
    { id: "socialProof", name: "Social Proof", icon: Users },
    { id: "accordion", name: "Accordion", icon: ChevronDown },
    { id: "tabs", name: "Tab Panels", icon: LayoutGrid },
  ],
};

/* ─────────────────────────── DEFAULT ELEMENT CONTENT ─────────────────────────── */

const getDefaultElement = (type: string): Partial<ElementData> => {
  const defaults: Record<string, Partial<ElementData>> = {
    // === BASIC TEXT ===
    heading: {
      content: "Your Heading Here",
      styles: { fontSize: "48px", fontWeight: "700", color: "#ffffff", marginBottom: "16px", lineHeight: "1.1" },
    },
    subheading: {
      content: "Your Subheading Text",
      styles: { fontSize: "24px", fontWeight: "500", color: "#cccccc", marginBottom: "12px", lineHeight: "1.4" },
    },
    text: {
      content: "Add your text content here. Click to edit and customize this paragraph.",
      styles: { fontSize: "16px", color: "#888888", lineHeight: "1.7", marginBottom: "16px" },
    },
    button: {
      content: "Get Started",
      styles: { 
        backgroundColor: "#CDB49E", color: "#111111", padding: "16px 32px", 
        borderRadius: "8px", fontSize: "15px", fontWeight: "600", display: "inline-block",
        cursor: "pointer", transition: "all 0.2s",
      },
    },
    buttonOutline: {
      content: "Learn More",
      styles: { 
        backgroundColor: "transparent", color: "#CDB49E", padding: "14px 30px", 
        borderRadius: "8px", fontSize: "15px", fontWeight: "600", display: "inline-block",
        border: "2px solid #CDB49E", cursor: "pointer",
      },
    },
    link: {
      content: "Learn more →",
      styles: { fontSize: "15px", color: "#CDB49E", textDecoration: "none", cursor: "pointer" },
    },
    list: {
      content: JSON.stringify(["First item in your list", "Second item goes here", "Third item with details", "Fourth item example"]),
      styles: { fontSize: "16px", color: "#888888", lineHeight: "1.8", marginBottom: "16px", paddingLeft: "20px" },
    },
    quote: {
      content: JSON.stringify({ text: "This is a beautiful quote that will inspire your visitors.", author: "John Doe, CEO" }),
      styles: { padding: "24px 32px", borderLeft: "4px solid #CDB49E", backgroundColor: "#111", marginBottom: "24px" },
    },
    badge: {
      content: "NEW",
      styles: { 
        backgroundColor: "#CDB49E", color: "#111", padding: "6px 14px", 
        borderRadius: "20px", fontSize: "11px", fontWeight: "700", display: "inline-block", letterSpacing: "1px",
      },
    },

    // === MEDIA ===
    image: {
      content: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
      styles: { width: "100%", borderRadius: "12px", marginBottom: "16px" },
    },
    imageRounded: {
      content: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",
      styles: { width: "200px", height: "200px", borderRadius: "50%", objectFit: "cover" },
    },
    video: {
      content: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      styles: { width: "100%", aspectRatio: "16/9", borderRadius: "12px", marginBottom: "16px" },
    },
    videoBackground: {
      content: JSON.stringify({
        videoUrl: "https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9e7c02d",
        heading: "Unleash Your Potential",
        subheading: "Transform your body, transform your life",
        buttonText: "Start Training",
      }),
      styles: { padding: "120px 32px", position: "relative", overflow: "hidden" },
    },
    icon: {
      content: "⚡",
      styles: { fontSize: "48px", marginBottom: "16px" },
    },
    avatar: {
      content: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
      styles: { width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover" },
    },
    gallery: {
      content: JSON.stringify([
        "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80",
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80",
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&q=80",
      ]),
      styles: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "24px" },
    },
    beforeAfter: {
      content: JSON.stringify({
        before: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
        after: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80",
        label: "Transformation Results",
      }),
      styles: { borderRadius: "16px", overflow: "hidden" },
    },

    // === CARDS ===
    card: {
      content: JSON.stringify({ title: "Card Title", description: "This is a basic card component. Add your content here." }),
      styles: { padding: "24px", backgroundColor: "#111", borderRadius: "16px", border: "1px solid #222" },
    },
    featureCard: {
      content: JSON.stringify({ icon: "🚀", title: "Feature Name", description: "Describe this amazing feature in a few words." }),
      styles: { padding: "32px", backgroundColor: "#111", borderRadius: "16px", textAlign: "center" },
    },
    profileCard: {
      content: JSON.stringify({ 
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", 
        name: "John Doe", 
        role: "CEO & Founder",
        bio: "Passionate about building great products."
      }),
      styles: { padding: "32px", backgroundColor: "#111", borderRadius: "16px", textAlign: "center" },
    },
    pricingCard: {
      content: JSON.stringify({ 
        name: "Professional", 
        price: "$49", 
        period: "/month",
        features: ["Unlimited projects", "Priority support", "Advanced analytics", "Custom domain"],
        buttonText: "Get Started",
        popular: true,
      }),
      styles: { padding: "32px", backgroundColor: "#111", borderRadius: "16px", textAlign: "center", border: "2px solid #CDB49E" },
    },
    testimonialCard: {
      content: JSON.stringify({ 
        quote: "This product completely transformed our business. Highly recommended!", 
        author: "Sarah Johnson",
        role: "Marketing Director",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
        rating: 5,
      }),
      styles: { padding: "32px", backgroundColor: "#111", borderRadius: "16px" },
    },
    statCard: {
      content: JSON.stringify({ value: "10,000+", label: "Happy Customers" }),
      styles: { padding: "32px", backgroundColor: "#111", borderRadius: "16px", textAlign: "center" },
    },
    serviceCard: {
      content: JSON.stringify({
        icon: "💪",
        title: "Personal Training",
        description: "One-on-one sessions tailored to your goals",
        price: "$80/session",
      }),
      styles: { padding: "32px", backgroundColor: "#0a0a0a", borderRadius: "16px", border: "1px solid #222" },
    },
    productCard: {
      content: JSON.stringify({
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
        name: "Product Name",
        price: "$99",
        originalPrice: "$149",
        rating: 4.8,
      }),
      styles: { backgroundColor: "#111", borderRadius: "16px", overflow: "hidden" },
    },

    // === NAVIGATION ===
    navbar: {
      content: JSON.stringify({ 
        logo: "YourBrand", 
        links: ["Home", "Features", "Pricing", "Contact"],
        buttonText: "Get Started",
      }),
      styles: { padding: "16px 32px", backgroundColor: "#0a0a0a", borderBottom: "1px solid #222" },
    },
    navbarDark: {
      content: JSON.stringify({ 
        logo: "YourBrand", 
        links: ["Home", "About", "Services", "Contact"],
        buttonText: "Sign Up",
      }),
      styles: { padding: "16px 32px", backgroundColor: "#111", borderBottom: "1px solid #333" },
    },
    navbarTransparent: {
      content: JSON.stringify({ 
        logo: "APEX", 
        links: ["Collections", "Story", "Athletes", "Contact"],
        buttonText: "Shop Now",
      }),
      styles: { padding: "20px 48px", backgroundColor: "transparent", position: "absolute", top: "0", left: "0", right: "0", zIndex: "100" },
    },
    footer: {
      content: JSON.stringify({ 
        logo: "YourBrand",
        description: "Building amazing products since 2024.",
        columns: [
          { title: "Product", links: ["Features", "Pricing", "Demo"] },
          { title: "Company", links: ["About", "Careers", "Contact"] },
          { title: "Legal", links: ["Privacy", "Terms", "Security"] },
        ],
        copyright: "© 2026 YourBrand. All rights reserved.",
        socials: ["twitter", "linkedin", "github"],
      }),
      styles: { padding: "80px 32px 40px", backgroundColor: "#0a0a0a", borderTop: "1px solid #222" },
    },
    footerSimple: {
      content: JSON.stringify({ 
        copyright: "© 2026 YourBrand. All rights reserved.",
        links: ["Privacy", "Terms", "Contact"],
      }),
      styles: { padding: "24px 32px", backgroundColor: "#0a0a0a", borderTop: "1px solid #222", textAlign: "center" },
    },
    footerDark: {
      content: JSON.stringify({
        logo: "APEX",
        tagline: "Premium Athletic Wear",
        columns: [
          { title: "Shop", links: ["Men", "Women", "Accessories", "Sale"] },
          { title: "Company", links: ["Our Story", "Sustainability", "Press", "Careers"] },
          { title: "Help", links: ["Shipping", "Returns", "FAQ", "Contact"] },
        ],
        newsletter: true,
        copyright: "© 2026 Apex Athletics. Designed for movement.",
      }),
      styles: { padding: "80px 48px 40px", backgroundColor: "#0a0a0a" },
    },

    // === HERO SECTIONS ===
    hero: {
      content: JSON.stringify({
        badge: "✨ Now Available",
        heading: "Build Something Amazing Today",
        subheading: "Create stunning websites with our powerful visual editor. No coding skills required.",
        buttonText: "Start Free Trial",
        buttonSecondary: "Watch Demo",
      }),
      styles: { padding: "120px 32px", textAlign: "center", backgroundColor: "#0a0a0a" },
    },
    heroWithImage: {
      content: JSON.stringify({
        heading: "The Modern Way to Build Websites",
        subheading: "Powerful tools for designers and developers. Ship faster with beautiful components.",
        buttonText: "Get Started Free",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
      }),
      styles: { padding: "100px 32px", backgroundColor: "#0a0a0a" },
    },
    heroSplit: {
      content: JSON.stringify({
        heading: "Transform Your Business",
        subheading: "We help companies grow with cutting-edge solutions.",
        buttonText: "Book a Call",
        buttonSecondary: "Learn More",
        image: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=600&q=80",
        stats: [
          { value: "500+", label: "Clients" },
          { value: "98%", label: "Satisfaction" },
        ],
      }),
      styles: { padding: "80px 48px", backgroundColor: "#0a0a0a" },
    },
    heroVideo: {
      content: JSON.stringify({
        videoUrl: "https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9e7c02d",
        heading: "Experience Excellence",
        subheading: "Where passion meets performance",
        buttonText: "Get Started",
        overlay: "rgba(0,0,0,0.6)",
      }),
      styles: { padding: "160px 32px", textAlign: "center", position: "relative", minHeight: "80vh" },
    },
    heroGradient: {
      content: JSON.stringify({
        heading: "The Future is Now",
        subheading: "Join the revolution and be part of something extraordinary.",
        buttonText: "Join Waitlist",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }),
      styles: { padding: "140px 32px", textAlign: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    },
    heroMinimal: {
      content: JSON.stringify({
        heading: "Less is more.",
        subheading: "Simplicity is the ultimate sophistication.",
        buttonText: "Discover",
      }),
      styles: { padding: "200px 32px", textAlign: "center", backgroundColor: "#0a0a0a" },
    },
    heroAthletic: {
      content: JSON.stringify({
        badge: "NEW COLLECTION",
        heading: "Designed for Movement",
        subheading: "Premium athletic wear crafted for those who push limits. Sustainable materials. Uncompromising quality.",
        buttonText: "Shop Collection",
        buttonSecondary: "Our Story",
        backgroundImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80",
        stats: [
          { value: "85%", label: "Sustainable Materials" },
          { value: "50K+", label: "Happy Athletes" },
          { value: "12", label: "Countries" },
        ],
      }),
      styles: { padding: "140px 48px", position: "relative", minHeight: "90vh" },
    },

    // === FEATURE SECTIONS ===
    features3: {
      content: JSON.stringify({
        title: "Everything You Need",
        subtitle: "Powerful features to help you build faster",
        items: [
          { icon: "⚡", title: "Lightning Fast", description: "Optimized for speed and performance out of the box." },
          { icon: "🎨", title: "Beautiful Design", description: "Stunning components crafted with attention to detail." },
          { icon: "🔒", title: "Secure & Reliable", description: "Enterprise-grade security you can trust." },
        ],
      }),
      styles: { padding: "100px 32px", backgroundColor: "#111111" },
    },
    features4: {
      content: JSON.stringify({
        title: "Packed with Features",
        subtitle: "Everything you need to succeed",
        items: [
          { icon: "📊", title: "Analytics", description: "Track your growth with detailed insights." },
          { icon: "🔗", title: "Integrations", description: "Connect with your favorite tools." },
          { icon: "📱", title: "Mobile Ready", description: "Looks great on every device." },
          { icon: "🎯", title: "SEO Optimized", description: "Rank higher in search results." },
        ],
      }),
      styles: { padding: "100px 32px", backgroundColor: "#0a0a0a" },
    },
    featuresIconGrid: {
      content: JSON.stringify({
        title: "Why Athletes Choose Us",
        subtitle: "Built for performance, designed for movement",
        items: [
          { icon: "🏃", title: "Performance Fabric", description: "Moisture-wicking, breathable materials" },
          { icon: "♻️", title: "Sustainable", description: "85% recycled and organic materials" },
          { icon: "✂️", title: "Perfect Fit", description: "Engineered for natural movement" },
          { icon: "💪", title: "Durable", description: "Built to last through intense training" },
          { icon: "🌡️", title: "Temperature Control", description: "Stay cool when it heats up" },
          { icon: "🎨", title: "Timeless Design", description: "Style that transcends trends" },
        ],
      }),
      styles: { padding: "100px 48px", backgroundColor: "#0a0a0a" },
    },

    // === TESTIMONIALS ===
    testimonials: {
      content: JSON.stringify({
        title: "Loved by Thousands",
        subtitle: "See what our customers are saying",
        items: [
          { quote: "Absolutely game-changing! Our productivity increased by 300%.", author: "Sarah Chen", role: "CEO, TechStart", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" },
          { quote: "The best investment we've made for our business this year.", author: "Mike Johnson", role: "Founder, DesignCo", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" },
          { quote: "Simple, powerful, and beautiful. Everything we needed.", author: "Emma Wilson", role: "CTO, Innovate", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" },
        ],
      }),
      styles: { padding: "100px 32px", backgroundColor: "#111111" },
    },
    testimonialSingle: {
      content: JSON.stringify({
        quote: "This gear has completely transformed my training. The fit is perfect, the materials are incredible, and I've never felt more confident pushing my limits.",
        author: "Marcus Rivera",
        role: "Professional Athlete, Apex Ambassador",
        image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=300&q=80",
        rating: 5,
      }),
      styles: { padding: "100px 48px", backgroundColor: "#0a0a0a" },
    },

    // === PRICING ===
    pricing3: {
      content: JSON.stringify({
        title: "Simple, Transparent Pricing",
        subtitle: "No hidden fees. Cancel anytime.",
        plans: [
          { name: "Starter", price: "$19", period: "/month", features: ["5 Projects", "Basic Analytics", "Email Support"], buttonText: "Start Free" },
          { name: "Professional", price: "$49", period: "/month", features: ["Unlimited Projects", "Advanced Analytics", "Priority Support", "Custom Domain"], buttonText: "Get Started", popular: true },
          { name: "Enterprise", price: "$99", period: "/month", features: ["Everything in Pro", "Dedicated Support", "SLA", "Custom Integrations"], buttonText: "Contact Sales" },
        ],
      }),
      styles: { padding: "100px 32px", backgroundColor: "#0a0a0a" },
    },

    // === TEAM ===
    team: {
      content: JSON.stringify({
        title: "Meet Our Team",
        subtitle: "The people behind the product",
        members: [
          { name: "John Doe", role: "CEO & Founder", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80" },
          { name: "Sarah Smith", role: "CTO", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80" },
          { name: "Mike Johnson", role: "Head of Design", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80" },
          { name: "Emily Chen", role: "Lead Developer", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80" },
        ],
      }),
      styles: { padding: "100px 32px", backgroundColor: "#111111" },
    },
    teamGrid: {
      content: JSON.stringify({
        title: "Our Athletes",
        subtitle: "Meet the pros who trust Apex",
        members: [
          { name: "Marcus Rivera", role: "CrossFit Champion", image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=300&q=80", achievement: "3x Regional Winner" },
          { name: "Elena Vasquez", role: "Marathon Runner", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80", achievement: "Olympic Qualifier" },
          { name: "David Park", role: "Strength Coach", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80", achievement: "Elite Trainer" },
        ],
      }),
      styles: { padding: "100px 48px", backgroundColor: "#0a0a0a" },
    },

    // === STATS ===
    stats: {
      content: JSON.stringify({
        title: "Trusted by Industry Leaders",
        items: [
          { value: "10K+", label: "Active Users" },
          { value: "99.9%", label: "Uptime" },
          { value: "150+", label: "Countries" },
          { value: "24/7", label: "Support" },
        ],
      }),
      styles: { padding: "80px 32px", backgroundColor: "#0a0a0a" },
    },
    statsAnimated: {
      content: JSON.stringify({
        items: [
          { value: "85%", label: "Sustainable Materials", icon: "♻️" },
          { value: "50K+", label: "Happy Athletes", icon: "💪" },
          { value: "12", label: "Countries", icon: "🌍" },
          { value: "100%", label: "Quality Guarantee", icon: "✓" },
        ],
        style: "animated",
      }),
      styles: { padding: "80px 48px", backgroundColor: "#111" },
    },
    statsWithImage: {
      content: JSON.stringify({
        heading: "Designed for Movement",
        subheading: "Made to Last",
        description: "We believe in creating athletic wear that transcends trends. Each piece is thoughtfully crafted from premium sustainable materials, designed to perform beautifully and age gracefully.",
        buttonText: "Our Story →",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
        stats: [
          { value: "85%", label: "Sustainable Materials" },
          { value: "50K+", label: "Happy Athletes" },
          { value: "12", label: "Countries" },
        ],
      }),
      styles: { padding: "100px 48px", backgroundColor: "#0a0a0a" },
    },

    // === FAQ ===
    faq: {
      content: JSON.stringify({
        title: "Frequently Asked Questions",
        subtitle: "Got questions? We've got answers.",
        items: [
          { question: "How do I get started?", answer: "Simply sign up for a free account and you can start building right away." },
          { question: "Can I cancel anytime?", answer: "Yes! You can cancel your subscription at any time with no questions asked." },
          { question: "Do you offer refunds?", answer: "We offer a 30-day money-back guarantee if you're not satisfied." },
          { question: "Is there a free plan?", answer: "Yes, we offer a generous free tier that lets you try out all features." },
        ],
      }),
      styles: { padding: "100px 32px", backgroundColor: "#111111" },
    },
    faqAccordion: {
      content: JSON.stringify({
        title: "Common Questions",
        items: [
          { question: "What is your return policy?", answer: "We offer free returns within 30 days. Items must be unworn with original tags." },
          { question: "How long does shipping take?", answer: "Standard shipping is 5-7 business days. Express shipping is 2-3 business days." },
          { question: "Do you ship internationally?", answer: "Yes! We ship to over 50 countries worldwide." },
          { question: "How do I find my size?", answer: "Check our size guide for detailed measurements and fit recommendations." },
        ],
      }),
      styles: { padding: "100px 48px", backgroundColor: "#0a0a0a" },
    },

    // === CTA ===
    cta: {
      content: JSON.stringify({
        heading: "Ready to Get Started?",
        subheading: "Join thousands of happy customers and start building today.",
        buttonText: "Start Free Trial",
        buttonSecondary: "Contact Sales",
      }),
      styles: { padding: "100px 32px", textAlign: "center", backgroundColor: "#0a0a0a" },
    },
    ctaBanner: {
      content: JSON.stringify({
        heading: "Special Offer: 50% Off",
        subheading: "Limited time only. Don't miss out!",
        buttonText: "Claim Offer",
      }),
      styles: { padding: "40px", textAlign: "center", background: "linear-gradient(135deg, #CDB49E 0%, #d4c0ad 100%)" },
    },
    ctaGradient: {
      content: JSON.stringify({
        heading: "Join the Movement",
        subheading: "Be the first to know about new drops, exclusive offers, and athlete stories.",
        buttonText: "Subscribe",
        placeholder: "Enter your email",
      }),
      styles: { padding: "100px 48px", textAlign: "center", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" },
    },

    // === CONTACT ===
    contact: {
      content: JSON.stringify({
        title: "Get in Touch",
        subtitle: "We'd love to hear from you",
        email: "hello@yourbrand.com",
        phone: "+1 (555) 123-4567",
        address: "123 Business Ave, Toronto, ON",
        formFields: ["Name", "Email", "Message"],
        buttonText: "Send Message",
      }),
      styles: { padding: "100px 32px", backgroundColor: "#111111" },
    },
    contactSplit: {
      content: JSON.stringify({
        title: "Let's Talk",
        subtitle: "Have a question or want to work together?",
        email: "hello@apex.com",
        phone: "+1 (555) 123-4567",
        hours: "Mon-Fri 9am-6pm EST",
        socials: ["instagram", "twitter", "facebook"],
      }),
      styles: { padding: "100px 48px", backgroundColor: "#0a0a0a" },
    },

    // === MISC SECTIONS ===
    logoCloud: {
      content: JSON.stringify({
        title: "Trusted by Leading Companies",
        logos: ["Google", "Microsoft", "Apple", "Amazon", "Meta"],
      }),
      styles: { padding: "60px 32px", backgroundColor: "#0a0a0a", textAlign: "center" },
    },
    services: {
      content: JSON.stringify({
        title: "Our Services",
        subtitle: "Comprehensive solutions for your business",
        items: [
          { icon: "💼", title: "Strategy", description: "Business strategy and planning", price: "From $5,000" },
          { icon: "🎨", title: "Design", description: "Brand identity and UI/UX", price: "From $3,000" },
          { icon: "💻", title: "Development", description: "Web and mobile apps", price: "From $10,000" },
          { icon: "📈", title: "Marketing", description: "Growth and acquisition", price: "From $2,000/mo" },
        ],
      }),
      styles: { padding: "100px 32px", backgroundColor: "#0a0a0a" },
    },
    gallery3: {
      content: JSON.stringify({
        images: [
          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
          "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80",
        ],
      }),
      styles: { padding: "60px 32px", backgroundColor: "#0a0a0a" },
    },
    gallery4: {
      content: JSON.stringify({
        images: [
          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80",
          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",
          "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80",
          "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&q=80",
        ],
      }),
      styles: { padding: "60px 32px", backgroundColor: "#111" },
    },
    timeline: {
      content: JSON.stringify({
        title: "Our Journey",
        items: [
          { year: "2020", title: "Founded", description: "Started in a small garage with big dreams" },
          { year: "2021", title: "First Product", description: "Launched our flagship product line" },
          { year: "2022", title: "10K Customers", description: "Reached our first major milestone" },
          { year: "2023", title: "Global Expansion", description: "Now serving customers in 50+ countries" },
        ],
      }),
      styles: { padding: "100px 32px", backgroundColor: "#0a0a0a" },
    },
    process: {
      content: JSON.stringify({
        title: "How It Works",
        subtitle: "Simple steps to get started",
        steps: [
          { number: "01", title: "Sign Up", description: "Create your free account in seconds" },
          { number: "02", title: "Choose Template", description: "Pick from our library of designs" },
          { number: "03", title: "Customize", description: "Make it your own with our editor" },
          { number: "04", title: "Publish", description: "Go live with one click" },
        ],
      }),
      styles: { padding: "100px 32px", backgroundColor: "#111" },
    },
    comparison: {
      content: JSON.stringify({
        title: "Why Choose Us",
        headers: ["Feature", "Us", "Others"],
        rows: [
          ["Unlimited projects", "✓", "✗"],
          ["Custom domain", "✓", "$10/mo"],
          ["24/7 Support", "✓", "✗"],
          ["No hidden fees", "✓", "✗"],
        ],
      }),
      styles: { padding: "100px 32px", backgroundColor: "#0a0a0a" },
    },
    newsletter: {
      content: JSON.stringify({
        heading: "Stay Updated",
        subheading: "Get the latest news and updates delivered to your inbox.",
        buttonText: "Subscribe",
        placeholder: "Enter your email",
      }),
      styles: { padding: "80px 32px", textAlign: "center", backgroundColor: "#111" },
    },
    philosophy: {
      content: JSON.stringify({
        badge: "Our Philosophy",
        heading: "Designed for movement. Made to last.",
        description: "We believe in creating athletic wear that transcends trends. Each piece is thoughtfully crafted from premium sustainable materials, designed to perform beautifully and age gracefully.\n\nFrom our design studio in Los Angeles, we obsess over every detail — from the feel of the fabric to the precision of every stitch.",
        buttonText: "Our Story →",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
        stats: [
          { value: "85%", label: "Sustainable Materials" },
          { value: "50K+", label: "Happy Athletes" },
          { value: "12", label: "Countries" },
        ],
      }),
      styles: { padding: "100px 48px", backgroundColor: "#0a0a0a" },
    },

    // === LAYOUT / UTILITY ===
    section: {
      content: "",
      styles: { padding: "80px 32px" },
    },
    container: {
      content: "",
      styles: { maxWidth: "1200px", margin: "0 auto", padding: "0 24px" },
    },
    columns2: {
      content: JSON.stringify({ cols: 2 }),
      styles: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", padding: "32px" },
    },
    columns3: {
      content: JSON.stringify({ cols: 3 }),
      styles: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", padding: "32px" },
    },
    columns4: {
      content: JSON.stringify({ cols: 4 }),
      styles: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", padding: "32px" },
    },
    divider: {
      content: "",
      styles: { height: "1px", backgroundColor: "#333", margin: "32px 0" },
    },
    dividerDots: {
      content: "•••",
      styles: { textAlign: "center", color: "#444", letterSpacing: "8px", padding: "32px 0" },
    },
    spacer: {
      content: "",
      styles: { height: "48px" },
    },
    spacerLarge: {
      content: "",
      styles: { height: "96px" },
    },

    // === INTERACTIVE ===
    countdown: {
      content: JSON.stringify({
        title: "Launch Countdown",
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        labels: { days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds" },
        completedText: "We're Live!",
      }),
      styles: { padding: "60px 32px", textAlign: "center", backgroundColor: "#111" },
    },
    socialProof: {
      content: JSON.stringify({
        notifications: [
          { name: "John D.", action: "just purchased", item: "Premium Plan", time: "2 mins ago", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" },
          { name: "Sarah M.", action: "signed up for", item: "Free Trial", time: "5 mins ago", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" },
          { name: "Mike R.", action: "upgraded to", item: "Pro Plan", time: "8 mins ago", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80" },
        ],
        position: "bottom-left",
        autoRotate: true,
        interval: 5000,
      }),
      styles: { position: "fixed", bottom: "24px", left: "24px", zIndex: "50" },
    },
    accordion: {
      content: JSON.stringify({
        items: [
          { title: "What is your return policy?", content: "We offer a 30-day money-back guarantee on all purchases." },
          { title: "How long does shipping take?", content: "Standard shipping takes 5-7 business days. Express shipping is available." },
          { title: "Do you offer international shipping?", content: "Yes, we ship to over 50 countries worldwide." },
          { title: "How can I contact support?", content: "You can reach our support team via email or live chat 24/7." },
        ],
        allowMultiple: false,
        defaultOpen: 0,
      }),
      styles: { padding: "60px 32px", backgroundColor: "#0a0a0a", maxWidth: "800px", margin: "0 auto" },
    },
    tabs: {
      content: JSON.stringify({
        tabs: [
          { label: "Features", content: "Explore our powerful features that help you build faster." },
          { label: "Pricing", content: "Simple, transparent pricing for teams of all sizes." },
          { label: "FAQ", content: "Frequently asked questions about our product." },
        ],
        defaultTab: 0,
        style: "pills", // "pills" | "underline" | "boxed"
      }),
      styles: { padding: "60px 32px", backgroundColor: "#111" },
    },
  };
  return defaults[type] || { content: "", styles: {} };
};

/* ─────────────────────────── PREBUILT WEBSITE TEMPLATES ─────────────────────────── */

const getTemplateWebsite = (templateId: string): ElementData[] => {
  const templates: Record<string, ElementData[]> = {
    athletic: [
      {
        id: "el-nav",
        type: "navbarTransparent",
        content: JSON.stringify({ 
          logo: "APEX", 
          links: ["Collections", "Story", "Athletes", "Contact"],
          buttonText: "Shop Now",
        }),
        styles: { padding: "20px 48px", backgroundColor: "transparent", position: "absolute", top: "0", left: "0", right: "0", zIndex: "100" },
      },
      {
        id: "el-hero",
        type: "heroAthletic",
        content: JSON.stringify({
          badge: "NEW COLLECTION 2026",
          heading: "Designed for Movement. Made to Last.",
          subheading: "Premium athletic wear crafted for those who push limits. Sustainable materials. Uncompromising quality. Timeless design.",
          buttonText: "Shop Collection",
          buttonSecondary: "Our Story",
          backgroundImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80",
          stats: [
            { value: "85%", label: "Sustainable Materials" },
            { value: "50K+", label: "Happy Athletes" },
            { value: "12", label: "Countries" },
          ],
        }),
        styles: { padding: "140px 48px", position: "relative", minHeight: "90vh" },
      },
      {
        id: "el-philosophy",
        type: "philosophy",
        content: JSON.stringify({
          badge: "Our Philosophy",
          heading: "Designed for movement. Made to last.",
          description: "We believe in creating athletic wear that transcends trends. Each piece is thoughtfully crafted from premium sustainable materials, designed to perform beautifully and age gracefully.\n\nFrom our design studio in Los Angeles, we obsess over every detail — from the feel of the fabric to the precision of every stitch.",
          buttonText: "Our Story →",
          image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
          stats: [
            { value: "85%", label: "Sustainable Materials" },
            { value: "50K+", label: "Happy Athletes" },
            { value: "12", label: "Countries" },
          ],
        }),
        styles: { padding: "100px 48px", backgroundColor: "#0a0a0a" },
      },
      {
        id: "el-features",
        type: "featuresIconGrid",
        content: JSON.stringify({
          title: "Why Athletes Choose Us",
          subtitle: "Built for performance, designed for movement",
          items: [
            { icon: "🏃", title: "Performance Fabric", description: "Moisture-wicking, breathable materials that move with you" },
            { icon: "♻️", title: "Sustainable", description: "85% recycled and organic materials in every piece" },
            { icon: "✂️", title: "Perfect Fit", description: "Engineered patterns for natural range of motion" },
            { icon: "💪", title: "Durable", description: "Built to last through your most intense training" },
            { icon: "🌡️", title: "Temperature Control", description: "Advanced fabrics that adapt to your body heat" },
            { icon: "🎨", title: "Timeless Design", description: "Classic aesthetics that never go out of style" },
          ],
        }),
        styles: { padding: "100px 48px", backgroundColor: "#111" },
      },
      {
        id: "el-testimonial",
        type: "testimonialSingle",
        content: JSON.stringify({
          quote: "This gear has completely transformed my training. The fit is perfect, the materials are incredible, and I've never felt more confident pushing my limits. Apex understands what athletes really need.",
          author: "Marcus Rivera",
          role: "CrossFit Champion, Apex Ambassador",
          image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=300&q=80",
          rating: 5,
        }),
        styles: { padding: "100px 48px", backgroundColor: "#0a0a0a" },
      },
      {
        id: "el-gallery",
        type: "gallery4",
        content: JSON.stringify({
          title: "From Studio to Street",
          images: [
            "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
            "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80",
            "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80",
          ],
        }),
        styles: { padding: "80px 48px", backgroundColor: "#111" },
      },
      {
        id: "el-cta",
        type: "ctaGradient",
        content: JSON.stringify({
          heading: "Join the Movement",
          subheading: "Be the first to know about new drops, exclusive offers, and athlete stories.",
          buttonText: "Subscribe",
          placeholder: "Enter your email",
        }),
        styles: { padding: "100px 48px", textAlign: "center", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" },
      },
      {
        id: "el-footer",
        type: "footerDark",
        content: JSON.stringify({
          logo: "APEX",
          tagline: "Premium Athletic Wear",
          columns: [
            { title: "Shop", links: ["Men", "Women", "Accessories", "Sale"] },
            { title: "Company", links: ["Our Story", "Sustainability", "Press", "Careers"] },
            { title: "Help", links: ["Shipping", "Returns", "FAQ", "Contact"] },
          ],
          newsletter: true,
          copyright: "© 2026 Apex Athletics. Designed for movement.",
        }),
        styles: { padding: "80px 48px 40px", backgroundColor: "#0a0a0a" },
      },
    ],
    saas: [
      {
        id: "el-nav",
        type: "navbar",
        content: JSON.stringify({ 
          logo: "Flowbase", 
          links: ["Features", "Pricing", "Docs", "Blog"],
          buttonText: "Start Free",
        }),
        styles: { padding: "16px 48px", backgroundColor: "#0a0a0a", borderBottom: "1px solid #1a1a1a" },
      },
      {
        id: "el-hero",
        type: "hero",
        content: JSON.stringify({
          badge: "🚀 Version 2.0 is here",
          heading: "Build Faster. Scale Smarter.",
          subheading: "The all-in-one platform for modern teams. Streamline your workflow, collaborate seamlessly, and ship products 10x faster.",
          buttonText: "Start Free Trial",
          buttonSecondary: "Watch Demo",
        }),
        styles: { padding: "120px 48px", textAlign: "center", backgroundColor: "#0a0a0a" },
      },
      {
        id: "el-logos",
        type: "logoCloud",
        content: JSON.stringify({
          title: "Trusted by 10,000+ companies worldwide",
          logos: ["Stripe", "Notion", "Figma", "Linear", "Vercel", "Supabase"],
        }),
        styles: { padding: "60px 48px", backgroundColor: "#0a0a0a", textAlign: "center" },
      },
      {
        id: "el-features",
        type: "features4",
        content: JSON.stringify({
          title: "Everything You Need",
          subtitle: "Powerful features to supercharge your workflow",
          items: [
            { icon: "⚡", title: "Lightning Fast", description: "Built on cutting-edge infrastructure for blazing speed" },
            { icon: "🔒", title: "Enterprise Security", description: "SOC 2 Type II certified with end-to-end encryption" },
            { icon: "🔗", title: "Integrations", description: "Connect with 100+ tools you already use" },
            { icon: "📊", title: "Real-time Analytics", description: "Actionable insights to drive your decisions" },
          ],
        }),
        styles: { padding: "100px 48px", backgroundColor: "#111" },
      },
      {
        id: "el-pricing",
        type: "pricing3",
        content: JSON.stringify({
          title: "Simple, Transparent Pricing",
          subtitle: "No hidden fees. Cancel anytime. Start free.",
          plans: [
            { name: "Starter", price: "$0", period: "/month", features: ["Up to 5 users", "Basic analytics", "Email support", "1GB storage"], buttonText: "Get Started" },
            { name: "Pro", price: "$29", period: "/month", features: ["Unlimited users", "Advanced analytics", "Priority support", "100GB storage", "API access"], buttonText: "Start Free Trial", popular: true },
            { name: "Enterprise", price: "Custom", period: "", features: ["Everything in Pro", "Dedicated support", "Custom SLA", "Unlimited storage", "SSO & SAML"], buttonText: "Contact Sales" },
          ],
        }),
        styles: { padding: "100px 48px", backgroundColor: "#0a0a0a" },
      },
      {
        id: "el-testimonials",
        type: "testimonials",
        content: JSON.stringify({
          title: "Loved by Teams Everywhere",
          subtitle: "See what our customers are saying",
          items: [
            { quote: "Flowbase cut our development time in half. It's the best tool we've adopted this year.", author: "Sarah Chen", role: "CTO, TechStart", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" },
            { quote: "Finally, a platform that actually delivers on its promises. Our team loves it.", author: "Mike Johnson", role: "Product Lead, ScaleUp", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" },
            { quote: "The ROI has been incredible. We saw results within the first week.", author: "Emma Wilson", role: "CEO, GrowthCo", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" },
          ],
        }),
        styles: { padding: "100px 48px", backgroundColor: "#111" },
      },
      {
        id: "el-cta",
        type: "cta",
        content: JSON.stringify({
          heading: "Ready to Transform Your Workflow?",
          subheading: "Join 10,000+ teams already using Flowbase. Start your free trial today.",
          buttonText: "Start Free Trial",
          buttonSecondary: "Schedule Demo",
        }),
        styles: { padding: "100px 48px", textAlign: "center", backgroundColor: "#0a0a0a" },
      },
      {
        id: "el-footer",
        type: "footer",
        content: JSON.stringify({ 
          logo: "Flowbase",
          description: "The all-in-one platform for modern teams.",
          columns: [
            { title: "Product", links: ["Features", "Integrations", "Pricing", "Changelog"] },
            { title: "Resources", links: ["Documentation", "API Reference", "Blog", "Community"] },
            { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
          ],
          copyright: "© 2026 Flowbase. All rights reserved.",
        }),
        styles: { padding: "80px 48px 40px", backgroundColor: "#0a0a0a", borderTop: "1px solid #1a1a1a" },
      },
    ],
    agency: [
      {
        id: "el-nav",
        type: "navbarDark",
        content: JSON.stringify({ 
          logo: "STUDIO", 
          links: ["Work", "Services", "About", "Contact"],
          buttonText: "Let's Talk",
        }),
        styles: { padding: "20px 48px", backgroundColor: "transparent" },
      },
      {
        id: "el-hero",
        type: "heroSplit",
        content: JSON.stringify({
          heading: "We Build Digital Experiences That Matter",
          subheading: "Award-winning creative agency specializing in brand strategy, design, and development for ambitious companies.",
          buttonText: "Start a Project",
          buttonSecondary: "View Work",
          image: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=600&q=80",
          stats: [
            { value: "200+", label: "Projects Delivered" },
            { value: "98%", label: "Client Satisfaction" },
          ],
        }),
        styles: { padding: "100px 48px", backgroundColor: "#111" },
      },
      {
        id: "el-services",
        type: "services",
        content: JSON.stringify({
          title: "What We Do",
          subtitle: "Full-service creative solutions",
          items: [
            { icon: "🎨", title: "Brand Strategy", description: "Build a brand that resonates and endures", price: "From $15,000" },
            { icon: "✨", title: "UI/UX Design", description: "Beautiful interfaces that convert", price: "From $10,000" },
            { icon: "💻", title: "Development", description: "Scalable web and mobile solutions", price: "From $25,000" },
            { icon: "📈", title: "Growth Marketing", description: "Data-driven campaigns that perform", price: "From $5,000/mo" },
          ],
        }),
        styles: { padding: "100px 48px", backgroundColor: "#0a0a0a" },
      },
      {
        id: "el-process",
        type: "process",
        content: JSON.stringify({
          title: "Our Process",
          subtitle: "How we bring your vision to life",
          steps: [
            { number: "01", title: "Discovery", description: "Deep dive into your goals, audience, and competitive landscape" },
            { number: "02", title: "Strategy", description: "Develop a comprehensive roadmap for success" },
            { number: "03", title: "Design", description: "Craft beautiful, functional solutions" },
            { number: "04", title: "Launch", description: "Deploy and optimize for maximum impact" },
          ],
        }),
        styles: { padding: "100px 48px", backgroundColor: "#111" },
      },
      {
        id: "el-testimonial",
        type: "testimonialSingle",
        content: JSON.stringify({
          quote: "Studio transformed our entire digital presence. They didn't just deliver a website — they gave us a platform for growth. Revenue is up 150% since launch.",
          author: "Alexandra Kim",
          role: "CEO, Elevate Brands",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
          rating: 5,
        }),
        styles: { padding: "100px 48px", backgroundColor: "#0a0a0a" },
      },
      {
        id: "el-cta",
        type: "cta",
        content: JSON.stringify({
          heading: "Let's Create Something Extraordinary",
          subheading: "Ready to elevate your digital presence? We'd love to hear about your project.",
          buttonText: "Start a Project",
          buttonSecondary: "hello@studio.com",
        }),
        styles: { padding: "100px 48px", textAlign: "center", backgroundColor: "#111" },
      },
      {
        id: "el-footer",
        type: "footerSimple",
        content: JSON.stringify({ 
          copyright: "© 2026 Studio. Crafted with ♥ in Toronto.",
          links: ["Instagram", "Dribbble", "LinkedIn"],
        }),
        styles: { padding: "40px 48px", backgroundColor: "#0a0a0a", textAlign: "center" },
      },
    ],
    medical: [
      {
        id: "el-nav",
        type: "navbar",
        content: JSON.stringify({ 
          logo: "HealthFirst Clinic", 
          links: ["Services", "Doctors", "About", "Contact"],
          buttonText: "Book Appointment",
        }),
        styles: { padding: "16px 48px", backgroundColor: "#fff", borderBottom: "1px solid #eee" },
      },
      {
        id: "el-hero",
        type: "heroWithImage",
        content: JSON.stringify({
          heading: "Compassionate Care for Your Family",
          subheading: "Comprehensive healthcare services delivered by experienced professionals. Your health is our priority.",
          buttonText: "Book Appointment",
          image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&q=80",
        }),
        styles: { padding: "100px 48px", backgroundColor: "#f8fafc" },
      },
      {
        id: "el-services",
        type: "features4",
        content: JSON.stringify({
          title: "Our Services",
          subtitle: "Comprehensive healthcare under one roof",
          items: [
            { icon: "🩺", title: "Primary Care", description: "Regular checkups and preventive care for all ages" },
            { icon: "❤️", title: "Cardiology", description: "Expert heart health monitoring and treatment" },
            { icon: "🦴", title: "Orthopedics", description: "Bone, joint, and muscle care" },
            { icon: "🧠", title: "Neurology", description: "Brain and nervous system specialists" },
          ],
        }),
        styles: { padding: "100px 48px", backgroundColor: "#fff" },
      },
      {
        id: "el-stats",
        type: "stats",
        content: JSON.stringify({
          items: [
            { value: "25+", label: "Years Experience" },
            { value: "50K+", label: "Patients Served" },
            { value: "30+", label: "Specialists" },
            { value: "4.9", label: "Patient Rating" },
          ],
        }),
        styles: { padding: "80px 48px", backgroundColor: "#0284c7", color: "#fff" },
      },
      {
        id: "el-team",
        type: "team",
        content: JSON.stringify({
          title: "Meet Our Doctors",
          subtitle: "Board-certified specialists dedicated to your care",
          members: [
            { name: "Dr. Sarah Chen", role: "Chief Medical Officer", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&q=80" },
            { name: "Dr. Michael Ross", role: "Cardiologist", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&q=80" },
            { name: "Dr. Emily Park", role: "Family Medicine", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&q=80" },
            { name: "Dr. James Wilson", role: "Orthopedic Surgeon", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&q=80" },
          ],
        }),
        styles: { padding: "100px 48px", backgroundColor: "#f8fafc" },
      },
      {
        id: "el-cta",
        type: "cta",
        content: JSON.stringify({
          heading: "Ready to Take Control of Your Health?",
          subheading: "Schedule an appointment with our caring team today.",
          buttonText: "Book Appointment",
          buttonSecondary: "Call (555) 123-4567",
        }),
        styles: { padding: "100px 48px", textAlign: "center", backgroundColor: "#fff" },
      },
      {
        id: "el-footer",
        type: "footer",
        content: JSON.stringify({ 
          logo: "HealthFirst Clinic",
          description: "Providing compassionate care since 1999.",
          columns: [
            { title: "Services", links: ["Primary Care", "Cardiology", "Orthopedics", "Neurology"] },
            { title: "Patient", links: ["Book Online", "Patient Portal", "Insurance", "FAQ"] },
            { title: "Contact", links: ["Locations", "Phone", "Email", "Hours"] },
          ],
          copyright: "© 2026 HealthFirst Clinic. All rights reserved.",
        }),
        styles: { padding: "80px 48px 40px", backgroundColor: "#0f172a", color: "#fff" },
      },
    ],
    restaurant: [
      {
        id: "el-nav",
        type: "navbarTransparent",
        content: JSON.stringify({ 
          logo: "EMBER", 
          links: ["Menu", "About", "Events", "Contact"],
          buttonText: "Reserve",
        }),
        styles: { padding: "20px 48px", backgroundColor: "transparent" },
      },
      {
        id: "el-hero",
        type: "heroVideo",
        content: JSON.stringify({
          videoUrl: "https://player.vimeo.com/external/370467553.sd.mp4?s=87e0e2c3c59f7d0a4f2e4c0f5f7a3f3a",
          heading: "A Culinary Journey",
          subheading: "Modern American cuisine crafted with passion and local ingredients",
          buttonText: "Reserve a Table",
          overlay: "rgba(0,0,0,0.5)",
        }),
        styles: { padding: "180px 48px", textAlign: "center", position: "relative", minHeight: "90vh" },
      },
      {
        id: "el-about",
        type: "philosophy",
        content: JSON.stringify({
          badge: "Est. 2018",
          heading: "Farm to Table. Heart to Plate.",
          description: "At Ember, we believe great food tells a story. Every dish is crafted with locally-sourced ingredients, prepared with time-honored techniques, and served with genuine hospitality.\n\nChef Marcus Rivera brings 20 years of culinary expertise to create dishes that are both familiar and surprising.",
          buttonText: "Our Story →",
          image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
        }),
        styles: { padding: "100px 48px", backgroundColor: "#0a0a0a" },
      },
      {
        id: "el-features",
        type: "features3",
        content: JSON.stringify({
          title: "The Ember Experience",
          subtitle: "More than a meal — a memory",
          items: [
            { icon: "🌿", title: "Local Sourcing", description: "Ingredients from farms within 50 miles" },
            { icon: "🔥", title: "Wood-Fired", description: "Authentic flavors from our custom hearth" },
            { icon: "🍷", title: "Curated Wines", description: "500+ bottles from around the world" },
          ],
        }),
        styles: { padding: "100px 48px", backgroundColor: "#111" },
      },
      {
        id: "el-cta",
        type: "cta",
        content: JSON.stringify({
          heading: "Reserve Your Table",
          subheading: "Open Tuesday through Sunday, 5pm - 11pm",
          buttonText: "Make Reservation",
          buttonSecondary: "(555) 123-4567",
        }),
        styles: { padding: "100px 48px", textAlign: "center", backgroundColor: "#0a0a0a" },
      },
      {
        id: "el-footer",
        type: "footerSimple",
        content: JSON.stringify({ 
          copyright: "© 2026 Ember Restaurant. 123 Main Street, Toronto.",
          links: ["Instagram", "Menu PDF", "Private Events"],
        }),
        styles: { padding: "40px 48px", backgroundColor: "#0a0a0a", textAlign: "center" },
      },
    ],
    ecommerce: [
      {
        id: "el-nav",
        type: "navbar",
        content: JSON.stringify({ 
          logo: "MINIMAL", 
          links: ["Shop", "Collections", "About", "Contact"],
          buttonText: "Cart (0)",
        }),
        styles: { padding: "16px 48px", backgroundColor: "#fff", borderBottom: "1px solid #eee" },
      },
      {
        id: "el-hero",
        type: "heroSplit",
        content: JSON.stringify({
          heading: "Thoughtfully Designed. Sustainably Made.",
          subheading: "Premium essentials for the modern home. Crafted with intention, built to last.",
          buttonText: "Shop Now",
          buttonSecondary: "Our Story",
          image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
        }),
        styles: { padding: "80px 48px", backgroundColor: "#fafafa" },
      },
      {
        id: "el-features",
        type: "features3",
        content: JSON.stringify({
          title: "Why Choose Minimal",
          items: [
            { icon: "🌱", title: "Sustainable", description: "Eco-friendly materials and processes" },
            { icon: "✨", title: "Quality", description: "Built to last a lifetime" },
            { icon: "🚚", title: "Free Shipping", description: "On all orders over $100" },
          ],
        }),
        styles: { padding: "80px 48px", backgroundColor: "#fff" },
      },
      {
        id: "el-cta",
        type: "ctaBanner",
        content: JSON.stringify({
          heading: "Spring Sale: 20% Off Everything",
          subheading: "Use code SPRING20 at checkout",
          buttonText: "Shop Sale",
        }),
        styles: { padding: "40px 48px", textAlign: "center", background: "#111", color: "#fff" },
      },
      {
        id: "el-newsletter",
        type: "newsletter",
        content: JSON.stringify({
          heading: "Join the Minimal Club",
          subheading: "Get 10% off your first order plus exclusive access to new arrivals.",
          buttonText: "Subscribe",
          placeholder: "Enter your email",
        }),
        styles: { padding: "80px 48px", textAlign: "center", backgroundColor: "#fafafa" },
      },
      {
        id: "el-footer",
        type: "footer",
        content: JSON.stringify({ 
          logo: "MINIMAL",
          description: "Thoughtfully designed home essentials.",
          columns: [
            { title: "Shop", links: ["All Products", "New Arrivals", "Best Sellers", "Sale"] },
            { title: "Help", links: ["Shipping", "Returns", "FAQ", "Contact"] },
            { title: "Company", links: ["About", "Sustainability", "Press", "Careers"] },
          ],
          copyright: "© 2026 Minimal. All rights reserved.",
        }),
        styles: { padding: "80px 48px 40px", backgroundColor: "#111", color: "#fff" },
      },
    ],
    consulting: [
      {
        id: "el-nav",
        type: "navbarDark",
        content: JSON.stringify({ 
          logo: "VERTEX", 
          links: ["Services", "Case Studies", "Team", "Contact"],
          buttonText: "Get Started",
        }),
        styles: { padding: "20px 48px", backgroundColor: "#0f172a" },
      },
      {
        id: "el-hero",
        type: "heroMinimal",
        content: JSON.stringify({
          heading: "Strategy. Execution. Results.",
          subheading: "We help ambitious companies unlock their full potential through data-driven strategy and operational excellence.",
          buttonText: "Schedule Consultation",
        }),
        styles: { padding: "160px 48px", textAlign: "center", backgroundColor: "#0f172a" },
      },
      {
        id: "el-stats",
        type: "stats",
        content: JSON.stringify({
          items: [
            { value: "$2B+", label: "Value Created" },
            { value: "150+", label: "Engagements" },
            { value: "40+", label: "Fortune 500 Clients" },
            { value: "95%", label: "Client Retention" },
          ],
        }),
        styles: { padding: "80px 48px", backgroundColor: "#1e293b" },
      },
      {
        id: "el-services",
        type: "services",
        content: JSON.stringify({
          title: "Our Expertise",
          subtitle: "Deep experience across critical business functions",
          items: [
            { icon: "📊", title: "Strategy", description: "Growth strategy, market entry, and competitive positioning" },
            { icon: "⚙️", title: "Operations", description: "Process optimization and operational transformation" },
            { icon: "💼", title: "M&A", description: "Due diligence, integration, and value capture" },
            { icon: "🎯", title: "Digital", description: "Digital transformation and technology strategy" },
          ],
        }),
        styles: { padding: "100px 48px", backgroundColor: "#0f172a" },
      },
      {
        id: "el-cta",
        type: "cta",
        content: JSON.stringify({
          heading: "Ready to Transform Your Business?",
          subheading: "Let's discuss how we can help you achieve your goals.",
          buttonText: "Schedule Consultation",
          buttonSecondary: "info@vertex.com",
        }),
        styles: { padding: "100px 48px", textAlign: "center", backgroundColor: "#1e293b" },
      },
      {
        id: "el-footer",
        type: "footerSimple",
        content: JSON.stringify({ 
          copyright: "© 2026 Vertex Consulting. Toronto • New York • London",
          links: ["Privacy", "Terms", "LinkedIn"],
        }),
        styles: { padding: "40px 48px", backgroundColor: "#0f172a", textAlign: "center" },
      },
    ],
    portfolio: [
      {
        id: "el-nav",
        type: "navbarTransparent",
        content: JSON.stringify({ 
          logo: "SARAH CHEN", 
          links: ["Work", "About", "Contact"],
          buttonText: "",
        }),
        styles: { padding: "20px 48px", backgroundColor: "transparent" },
      },
      {
        id: "el-hero",
        type: "heroMinimal",
        content: JSON.stringify({
          heading: "Product Designer crafting digital experiences that people love.",
          subheading: "Currently at Stripe. Previously Airbnb, Google.",
          buttonText: "View Work",
        }),
        styles: { padding: "200px 48px", textAlign: "center", backgroundColor: "#0a0a0a" },
      },
      {
        id: "el-gallery",
        type: "gallery3",
        content: JSON.stringify({
          title: "Selected Work",
          images: [
            "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
            "https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&q=80",
            "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80",
          ],
        }),
        styles: { padding: "80px 48px", backgroundColor: "#0a0a0a" },
      },
      {
        id: "el-about",
        type: "philosophy",
        content: JSON.stringify({
          heading: "Design is how it works.",
          description: "I'm a product designer with 10+ years of experience creating intuitive, beautiful digital products. I believe great design solves real problems while delighting users at every interaction.\n\nWhen I'm not pushing pixels, you'll find me hiking, reading, or experimenting in the kitchen.",
          buttonText: "Download Resume →",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
        }),
        styles: { padding: "100px 48px", backgroundColor: "#111" },
      },
      {
        id: "el-cta",
        type: "cta",
        content: JSON.stringify({
          heading: "Let's work together",
          subheading: "Open to freelance opportunities and interesting collaborations.",
          buttonText: "Get in Touch",
          buttonSecondary: "hello@sarahchen.design",
        }),
        styles: { padding: "100px 48px", textAlign: "center", backgroundColor: "#0a0a0a" },
      },
      {
        id: "el-footer",
        type: "footerSimple",
        content: JSON.stringify({ 
          copyright: "© 2026 Sarah Chen",
          links: ["Dribbble", "LinkedIn", "Twitter"],
        }),
        styles: { padding: "40px 48px", backgroundColor: "#0a0a0a", textAlign: "center" },
      },
    ],
    education: [
      {
        id: "el-nav",
        type: "navbar",
        content: JSON.stringify({ 
          logo: "LearnHub", 
          links: ["Courses", "Pricing", "For Business", "Resources"],
          buttonText: "Start Learning",
        }),
        styles: { padding: "16px 48px", backgroundColor: "#fff", borderBottom: "1px solid #eee" },
      },
      {
        id: "el-hero",
        type: "hero",
        content: JSON.stringify({
          badge: "🎓 Over 1M students",
          heading: "Learn Skills That Matter",
          subheading: "Expert-led courses in tech, business, and design. Learn at your own pace, get certified, advance your career.",
          buttonText: "Explore Courses",
          buttonSecondary: "Free Trial",
        }),
        styles: { padding: "120px 48px", textAlign: "center", background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" },
      },
      {
        id: "el-features",
        type: "features4",
        content: JSON.stringify({
          title: "Why Learn With Us",
          subtitle: "The most effective way to build real skills",
          items: [
            { icon: "🎥", title: "HD Video Lessons", description: "Crystal clear instruction from industry experts" },
            { icon: "💻", title: "Hands-on Projects", description: "Build real projects for your portfolio" },
            { icon: "📜", title: "Certificates", description: "Earn credentials recognized by employers" },
            { icon: "💬", title: "Community", description: "Learn alongside 1M+ other students" },
          ],
        }),
        styles: { padding: "100px 48px", backgroundColor: "#fff" },
      },
      {
        id: "el-pricing",
        type: "pricing3",
        content: JSON.stringify({
          title: "Choose Your Plan",
          subtitle: "Start free, upgrade when you're ready",
          plans: [
            { name: "Free", price: "$0", period: "/month", features: ["Access to free courses", "Community forums", "Basic quizzes"], buttonText: "Get Started" },
            { name: "Pro", price: "$29", period: "/month", features: ["All 500+ courses", "Certificates", "Project reviews", "1-on-1 mentoring"], buttonText: "Start Trial", popular: true },
            { name: "Teams", price: "$49", period: "/user/mo", features: ["Everything in Pro", "Team analytics", "Admin dashboard", "Priority support"], buttonText: "Contact Sales" },
          ],
        }),
        styles: { padding: "100px 48px", backgroundColor: "#f5f3ff" },
      },
      {
        id: "el-cta",
        type: "cta",
        content: JSON.stringify({
          heading: "Start Your Learning Journey Today",
          subheading: "Join 1 million+ learners building skills for the future.",
          buttonText: "Get Started Free",
        }),
        styles: { padding: "100px 48px", textAlign: "center", backgroundColor: "#fff" },
      },
      {
        id: "el-footer",
        type: "footer",
        content: JSON.stringify({ 
          logo: "LearnHub",
          description: "Learn skills that matter.",
          columns: [
            { title: "Courses", links: ["Development", "Design", "Business", "Marketing"] },
            { title: "Company", links: ["About", "Careers", "Press", "Blog"] },
            { title: "Support", links: ["Help Center", "Contact", "Community", "Trust & Safety"] },
          ],
          copyright: "© 2026 LearnHub. All rights reserved.",
        }),
        styles: { padding: "80px 48px 40px", backgroundColor: "#111", color: "#fff" },
      },
    ],
  };

  // Return template or default starter
  return templates[templateId] || [
    {
      id: "el-hero",
      type: "hero",
      content: JSON.stringify({
        heading: "Build Something Amazing",
        subheading: "Create stunning websites with our visual editor. No coding required.",
        buttonText: "Get Started",
      }),
      styles: { padding: "100px 32px", textAlign: "center", backgroundColor: "#0a0a0a" },
    },
    {
      id: "el-features",
      type: "features3",
      content: JSON.stringify({
        title: "Why Choose Us",
        subtitle: "Powerful features to help you build faster",
        items: [
          { icon: "⚡", title: "Fast", description: "Lightning quick performance" },
          { icon: "🎨", title: "Beautiful", description: "Stunning visual design" },
          { icon: "🔒", title: "Secure", description: "Enterprise-grade security" },
        ],
      }),
      styles: { padding: "100px 32px", backgroundColor: "#111111" },
    },
    {
      id: "el-cta",
      type: "cta",
      content: JSON.stringify({
        heading: "Ready to Get Started?",
        subheading: "Join thousands of happy customers today.",
        buttonText: "Start Free Trial",
      }),
      styles: { padding: "80px 32px", textAlign: "center", backgroundColor: "#0a0a0a" },
    },
  ];
};

/* ─────────────────────────── INLINE EDITOR ─────────────────────────── */

function InlineEditor({ 
  value, 
  onChange, 
  placeholder = "Click to edit...",
  style = {},
  className = "",
}: { 
  value: string; 
  onChange: (v: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
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
      onClick={(e) => { e.stopPropagation(); setEditing(true); }}
      onBlur={(e) => {
        setEditing(false);
        onChange(e.currentTarget.textContent || "");
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          e.currentTarget.blur();
        }
        if (e.key === "Escape") e.currentTarget.blur();
      }}
      className={cn(
        "outline-none cursor-text transition-all min-w-[20px]",
        editing && "ring-2 ring-[#CDB49E] ring-offset-2 ring-offset-[#0a0a0a] rounded px-1",
        !value && !editing && "opacity-50",
        className
      )}
      style={style}
    >
      {value || (editing ? "" : placeholder)}
    </div>
  );
}

/* ─────────────────────────── ELEMENT RENDERER ─────────────────────────── */

function ElementRenderer({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
}: {
  element: ElementData;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<ElementData>) => void;
  onDelete: () => void;
  onDuplicate?: () => void;
}) {
  const baseStyles = element.styles as React.CSSProperties;

  const parseData = () => {
    try { return JSON.parse(element.content || "{}"); } catch { return {}; }
  };

  const renderContent = () => {
    switch (element.type) {
      // === BASIC TEXT ===
      case "heading":
      case "subheading":
      case "text":
        return <InlineEditor value={element.content} onChange={(v) => onUpdate({ content: v })} style={baseStyles} />;

      case "button":
      case "buttonOutline":
        return (
          <div style={baseStyles}>
            <InlineEditor value={element.content} onChange={(v) => onUpdate({ content: v })} style={{ display: "inline" }} />
          </div>
        );

      case "link":
        return <InlineEditor value={element.content} onChange={(v) => onUpdate({ content: v })} style={baseStyles} />;

      case "list": {
        const items = parseData();
        return (
          <ul style={baseStyles}>
            {(Array.isArray(items) ? items : []).map((item: string, i: number) => (
              <li key={i} style={{ marginBottom: "8px" }}>{item}</li>
            ))}
          </ul>
        );
      }

      case "quote": {
        const data = parseData();
        return (
          <blockquote style={baseStyles}>
            <div style={{ fontSize: "18px", fontStyle: "italic", color: "#ccc", marginBottom: "12px" }}>"{data.text}"</div>
            <div style={{ fontSize: "14px", color: "#888" }}>— {data.author}</div>
          </blockquote>
        );
      }

      case "badge":
        return <span style={baseStyles}>{element.content}</span>;

      case "icon":
        return <div style={baseStyles}>{element.content}</div>;

      case "dividerDots":
        return <div style={baseStyles}>{element.content}</div>;

      // === MEDIA ===
      case "image":
      case "imageRounded": {
        const isPlaceholder = !element.content || element.content.includes("placeholder") || element.content.includes("unsplash");
        return (
          <div className="relative group/img">
            <img src={element.content || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80"} alt="Content" style={baseStyles} className="max-w-full" />
            {isSelected && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                <div className="text-center text-white">
                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-70" />
                  <p className="text-xs opacity-70">Click to change image</p>
                  <input 
                    type="text" 
                    value={element.content} 
                    onChange={(e) => onUpdate({ content: e.target.value })}
                    placeholder="Enter image URL"
                    className="mt-2 px-3 py-2 text-xs bg-white/10 border border-white/20 rounded text-white w-48"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
          </div>
        );
      }

      case "avatar": {
        const isPlaceholder = !element.content || element.content.includes("unsplash");
        return (
          <div className="relative group/img inline-block">
            <img src={element.content || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"} alt="Avatar" style={baseStyles} />
            {isSelected && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity rounded-full">
                <Upload className="w-5 h-5 text-white opacity-70" />
              </div>
            )}
          </div>
        );
      }

      case "video":
        return <iframe src={element.content} style={baseStyles} allowFullScreen className="border-0" />;

      case "gallery":
      case "gallery3":
      case "gallery4": {
        const data = parseData();
        const images = data.images || (Array.isArray(data) ? data : []);
        const cols = element.type === "gallery4" ? 4 : element.type === "gallery3" ? 3 : 2;
        return (
          <div style={baseStyles}>
            {data.title && <div style={{ fontSize: "32px", fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: "40px" }}>{data.title}</div>}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "16px" }}>
              {images.map((src: string, i: number) => (
                <img key={i} src={src} alt="" style={{ width: "100%", borderRadius: "12px", aspectRatio: "1" , objectFit: "cover" }} />
              ))}
            </div>
          </div>
        );
      }

      // === CARDS ===
      case "card": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <div style={{ fontSize: "20px", fontWeight: "600", color: "#fff", marginBottom: "8px" }}>{data.title}</div>
            <div style={{ fontSize: "14px", color: "#888" }}>{data.description}</div>
          </div>
        );
      }

      case "featureCard": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>{data.icon}</div>
            <div style={{ fontSize: "18px", fontWeight: "600", color: "#fff", marginBottom: "8px" }}>{data.title}</div>
            <div style={{ fontSize: "14px", color: "#888" }}>{data.description}</div>
          </div>
        );
      }

      case "profileCard": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <img src={data.image} alt="" style={{ width: "100px", height: "100px", borderRadius: "50%", margin: "0 auto 16px", objectFit: "cover" }} />
            <div style={{ fontSize: "18px", fontWeight: "600", color: "#fff" }}>{data.name}</div>
            <div style={{ fontSize: "14px", color: "#CDB49E", marginBottom: "8px" }}>{data.role}</div>
            <div style={{ fontSize: "13px", color: "#888" }}>{data.bio}</div>
          </div>
        );
      }

      case "pricingCard": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            {data.popular && <span style={{ display: "inline-block", padding: "4px 12px", backgroundColor: "#CDB49E", color: "#111", borderRadius: "20px", fontSize: "11px", fontWeight: "700", marginBottom: "16px" }}>MOST POPULAR</span>}
            <div style={{ fontSize: "20px", fontWeight: "600", color: "#fff", marginBottom: "8px" }}>{data.name}</div>
            <div style={{ fontSize: "48px", fontWeight: "700", color: "#fff" }}>{data.price}<span style={{ fontSize: "16px", color: "#888" }}>{data.period}</span></div>
            <ul style={{ margin: "24px 0", padding: "0", listStyle: "none" }}>
              {(data.features || []).map((f: string, i: number) => (
                <li key={i} style={{ padding: "8px 0", color: "#888", borderBottom: "1px solid #222" }}>✓ {f}</li>
              ))}
            </ul>
            <div style={{ padding: "14px 24px", backgroundColor: data.popular ? "#CDB49E" : "transparent", color: data.popular ? "#111" : "#CDB49E", border: data.popular ? "none" : "2px solid #CDB49E", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>{data.buttonText}</div>
          </div>
        );
      }

      case "testimonialCard": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <div style={{ display: "flex", marginBottom: "12px", color: "#CDB49E" }}>{"★".repeat(data.rating || 5)}</div>
            <div style={{ fontSize: "16px", color: "#ccc", fontStyle: "italic", marginBottom: "16px", lineHeight: "1.6" }}>"{data.quote}"</div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img src={data.image} alt="" style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }} />
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>{data.author}</div>
                <div style={{ fontSize: "12px", color: "#888" }}>{data.role}</div>
              </div>
            </div>
          </div>
        );
      }

      case "statCard": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <div style={{ fontSize: "48px", fontWeight: "700", color: "#CDB49E" }}>{data.value}</div>
            <div style={{ fontSize: "14px", color: "#888", marginTop: "8px" }}>{data.label}</div>
          </div>
        );
      }

      case "serviceCard": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <div style={{ fontSize: "36px", marginBottom: "16px" }}>{data.icon}</div>
            <div style={{ fontSize: "20px", fontWeight: "600", color: "#fff", marginBottom: "8px" }}>{data.title}</div>
            <div style={{ fontSize: "14px", color: "#888", marginBottom: "16px" }}>{data.description}</div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#CDB49E" }}>{data.price}</div>
          </div>
        );
      }

      // === NAVIGATION ===
      case "navbar":
      case "navbarDark":
      case "navbarTransparent": {
        const data = parseData();
        return (
          <nav style={{ ...baseStyles, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: "700", color: "#CDB49E", letterSpacing: "2px" }}>{data.logo}</div>
            <div style={{ display: "flex", gap: "32px" }}>
              {(data.links || []).map((link: string, i: number) => (
                <span key={i} style={{ fontSize: "14px", color: element.type === "navbarTransparent" ? "#fff" : "#888", cursor: "pointer" }}>{link}</span>
              ))}
            </div>
            {data.buttonText && <div style={{ padding: "10px 24px", backgroundColor: "#CDB49E", color: "#111", borderRadius: "8px", fontWeight: "600", fontSize: "14px" }}>{data.buttonText}</div>}
          </nav>
        );
      }

      case "footer":
      case "footerDark": {
        const data = parseData();
        return (
          <footer style={baseStyles}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "48px", marginBottom: "48px" }}>
              <div>
                <div style={{ fontSize: "22px", fontWeight: "700", color: "#CDB49E", marginBottom: "12px", letterSpacing: "2px" }}>{data.logo}</div>
                <div style={{ fontSize: "14px", color: "#888" }}>{data.description || data.tagline}</div>
              </div>
              {(data.columns || []).map((col: any, i: number) => (
                <div key={i}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#fff", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>{col.title}</div>
                  {(col.links || []).map((link: string, j: number) => (
                    <div key={j} style={{ fontSize: "13px", color: "#888", marginBottom: "10px", cursor: "pointer" }}>{link}</div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid #222", paddingTop: "24px", textAlign: "center", fontSize: "13px", color: "#555" }}>{data.copyright}</div>
          </footer>
        );
      }

      case "footerSimple": {
        const data = parseData();
        return (
          <footer style={baseStyles}>
            <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "16px" }}>
              {(data.links || []).map((link: string, i: number) => (
                <span key={i} style={{ fontSize: "13px", color: "#888", cursor: "pointer" }}>{link}</span>
              ))}
            </div>
            <div style={{ fontSize: "13px", color: "#555" }}>{data.copyright}</div>
          </footer>
        );
      }

      // === HERO SECTIONS ===
      case "hero": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            {data.badge && <span style={{ display: "inline-block", padding: "8px 20px", backgroundColor: "#CDB49E20", color: "#CDB49E", borderRadius: "20px", fontSize: "13px", marginBottom: "28px" }}>{data.badge}</span>}
            <InlineEditor value={data.heading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, heading: v }) })} style={{ fontSize: "56px", fontWeight: "700", color: "#fff", marginBottom: "24px", lineHeight: "1.1" }} />
            <InlineEditor value={data.subheading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, subheading: v }) })} style={{ fontSize: "18px", color: "#888", marginBottom: "40px", maxWidth: "640px", margin: "0 auto 40px", lineHeight: "1.6" }} />
            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              <div style={{ padding: "16px 36px", backgroundColor: "#CDB49E", color: "#111", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}>{data.buttonText}</div>
              {data.buttonSecondary && <div style={{ padding: "16px 36px", border: "2px solid #333", color: "#fff", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}>{data.buttonSecondary}</div>}
            </div>
          </div>
        );
      }

      case "heroWithImage": {
        const data = parseData();
        return (
          <div style={{ ...baseStyles, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }}>
            <div>
              <InlineEditor value={data.heading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, heading: v }) })} style={{ fontSize: "48px", fontWeight: "700", color: "#fff", marginBottom: "20px", lineHeight: "1.1" }} />
              <InlineEditor value={data.subheading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, subheading: v }) })} style={{ fontSize: "17px", color: "#888", marginBottom: "32px", lineHeight: "1.6" }} />
              <div style={{ padding: "16px 32px", backgroundColor: "#CDB49E", color: "#111", borderRadius: "10px", fontWeight: "600", display: "inline-block", cursor: "pointer" }}>{data.buttonText}</div>
            </div>
            <img src={data.image} alt="" style={{ width: "100%", borderRadius: "16px" }} />
          </div>
        );
      }

      case "heroSplit": {
        const data = parseData();
        return (
          <div style={{ ...baseStyles, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>
            <div>
              <InlineEditor value={data.heading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, heading: v }) })} style={{ fontSize: "48px", fontWeight: "700", color: "#fff", marginBottom: "20px", lineHeight: "1.1" }} />
              <InlineEditor value={data.subheading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, subheading: v }) })} style={{ fontSize: "17px", color: "#888", marginBottom: "32px", lineHeight: "1.6" }} />
              <div style={{ display: "flex", gap: "16px", marginBottom: "40px" }}>
                <div style={{ padding: "16px 32px", backgroundColor: "#CDB49E", color: "#111", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}>{data.buttonText}</div>
                {data.buttonSecondary && <div style={{ padding: "16px 32px", border: "2px solid #333", color: "#fff", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}>{data.buttonSecondary}</div>}
              </div>
              {data.stats && (
                <div style={{ display: "flex", gap: "40px" }}>
                  {data.stats.map((stat: any, i: number) => (
                    <div key={i}>
                      <div style={{ fontSize: "32px", fontWeight: "700", color: "#CDB49E" }}>{stat.value}</div>
                      <div style={{ fontSize: "13px", color: "#888" }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <img src={data.image} alt="" style={{ width: "100%", borderRadius: "16px" }} />
          </div>
        );
      }

      case "heroVideo": {
        const data = parseData();
        return (
          <div style={{ ...baseStyles, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <video autoPlay muted loop playsInline style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}>
              <source src={data.videoUrl} type="video/mp4" />
            </video>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: data.overlay || "rgba(0,0,0,0.6)", zIndex: 1 }} />
            <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
              <InlineEditor value={data.heading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, heading: v }) })} style={{ fontSize: "64px", fontWeight: "700", color: "#fff", marginBottom: "24px", lineHeight: "1.1" }} />
              <InlineEditor value={data.subheading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, subheading: v }) })} style={{ fontSize: "20px", color: "#ccc", marginBottom: "40px" }} />
              <div style={{ padding: "18px 40px", backgroundColor: "#CDB49E", color: "#111", borderRadius: "10px", fontWeight: "600", display: "inline-block", cursor: "pointer" }}>{data.buttonText}</div>
            </div>
          </div>
        );
      }

      case "heroGradient": {
        const data = parseData();
        return (
          <div style={{ ...baseStyles, background: data.gradient }}>
            <InlineEditor value={data.heading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, heading: v }) })} style={{ fontSize: "56px", fontWeight: "700", color: "#fff", marginBottom: "24px", lineHeight: "1.1" }} />
            <InlineEditor value={data.subheading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, subheading: v }) })} style={{ fontSize: "18px", color: "rgba(255,255,255,0.8)", marginBottom: "40px", maxWidth: "600px", margin: "0 auto 40px" }} />
            <div style={{ padding: "18px 40px", backgroundColor: "#fff", color: "#111", borderRadius: "10px", fontWeight: "600", display: "inline-block", cursor: "pointer" }}>{data.buttonText}</div>
          </div>
        );
      }

      case "heroMinimal": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.heading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, heading: v }) })} style={{ fontSize: "56px", fontWeight: "700", color: "#fff", marginBottom: "24px", lineHeight: "1.1", maxWidth: "800px", margin: "0 auto 24px" }} />
            <InlineEditor value={data.subheading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, subheading: v }) })} style={{ fontSize: "18px", color: "#888", marginBottom: "40px" }} />
            <div style={{ padding: "16px 36px", border: "2px solid #CDB49E", color: "#CDB49E", borderRadius: "10px", fontWeight: "600", display: "inline-block", cursor: "pointer" }}>{data.buttonText}</div>
          </div>
        );
      }

      case "heroAthletic": {
        const data = parseData();
        return (
          <div style={{ ...baseStyles, position: "relative", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url(${data.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.4)" }} />
            <div style={{ position: "relative", zIndex: 1, maxWidth: "700px" }}>
              {data.badge && <span style={{ display: "inline-block", padding: "8px 20px", backgroundColor: "#CDB49E", color: "#111", borderRadius: "4px", fontSize: "11px", fontWeight: "700", letterSpacing: "2px", marginBottom: "28px" }}>{data.badge}</span>}
              <InlineEditor value={data.heading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, heading: v }) })} style={{ fontSize: "64px", fontWeight: "700", color: "#fff", marginBottom: "24px", lineHeight: "1.05" }} />
              <InlineEditor value={data.subheading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, subheading: v }) })} style={{ fontSize: "18px", color: "#ccc", marginBottom: "40px", lineHeight: "1.7" }} />
              <div style={{ display: "flex", gap: "16px", marginBottom: "60px" }}>
                <div style={{ padding: "18px 36px", backgroundColor: "#CDB49E", color: "#111", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>{data.buttonText}</div>
                {data.buttonSecondary && <div style={{ padding: "18px 36px", border: "2px solid #fff", color: "#fff", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>{data.buttonSecondary}</div>}
              </div>
              {data.stats && (
                <div style={{ display: "flex", gap: "48px" }}>
                  {data.stats.map((stat: any, i: number) => (
                    <div key={i}>
                      <div style={{ fontSize: "36px", fontWeight: "700", color: "#CDB49E" }}>{stat.value}</div>
                      <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }

      // === FEATURE SECTIONS ===
      case "features3":
      case "features4": {
        const data = parseData();
        const cols = element.type === "features4" ? 4 : 3;
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.title || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, title: v }) })} style={{ fontSize: "40px", fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: "16px" }} />
            <div style={{ fontSize: "16px", color: "#888", textAlign: "center", marginBottom: "56px" }}>{data.subtitle}</div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "24px" }}>
              {(data.items || []).map((item: any, i: number) => (
                <div key={i} style={{ padding: "36px", backgroundColor: "#0a0a0a", borderRadius: "16px", textAlign: "center", border: "1px solid #1a1a1a" }}>
                  <div style={{ fontSize: "44px", marginBottom: "20px" }}>{item.icon}</div>
                  <div style={{ fontSize: "18px", fontWeight: "600", color: "#fff", marginBottom: "12px" }}>{item.title}</div>
                  <div style={{ fontSize: "14px", color: "#888", lineHeight: "1.6" }}>{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "featuresIconGrid": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.title || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, title: v }) })} style={{ fontSize: "40px", fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: "16px" }} />
            <div style={{ fontSize: "16px", color: "#888", textAlign: "center", marginBottom: "56px" }}>{data.subtitle}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" }}>
              {(data.items || []).map((item: any, i: number) => (
                <div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{ fontSize: "32px", flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#fff", marginBottom: "6px" }}>{item.title}</div>
                    <div style={{ fontSize: "14px", color: "#888", lineHeight: "1.5" }}>{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // === TESTIMONIALS ===
      case "testimonials": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.title || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, title: v }) })} style={{ fontSize: "40px", fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: "16px" }} />
            <div style={{ fontSize: "16px", color: "#888", textAlign: "center", marginBottom: "56px" }}>{data.subtitle}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
              {(data.items || []).map((item: any, i: number) => (
                <div key={i} style={{ padding: "32px", backgroundColor: "#0a0a0a", borderRadius: "16px", border: "1px solid #1a1a1a" }}>
                  <div style={{ fontSize: "15px", color: "#ccc", fontStyle: "italic", marginBottom: "24px", lineHeight: "1.6" }}>"{item.quote}"</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img src={item.image} alt="" style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }} />
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>{item.author}</div>
                      <div style={{ fontSize: "12px", color: "#888" }}>{item.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "testimonialSingle": {
        const data = parseData();
        return (
          <div style={{ ...baseStyles, display: "grid", gridTemplateColumns: "200px 1fr", gap: "48px", alignItems: "center", maxWidth: "900px", margin: "0 auto" }}>
            <img src={data.image} alt="" style={{ width: "200px", height: "200px", borderRadius: "16px", objectFit: "cover" }} />
            <div>
              <div style={{ display: "flex", marginBottom: "20px", color: "#CDB49E", fontSize: "24px" }}>{"★".repeat(data.rating || 5)}</div>
              <div style={{ fontSize: "24px", color: "#fff", fontStyle: "italic", marginBottom: "24px", lineHeight: "1.5" }}>"{data.quote}"</div>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#fff" }}>{data.author}</div>
              <div style={{ fontSize: "14px", color: "#888" }}>{data.role}</div>
            </div>
          </div>
        );
      }

      // === PRICING ===
      case "pricing3": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.title || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, title: v }) })} style={{ fontSize: "40px", fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: "16px" }} />
            <div style={{ fontSize: "16px", color: "#888", textAlign: "center", marginBottom: "56px" }}>{data.subtitle}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
              {(data.plans || []).map((plan: any, i: number) => (
                <div key={i} style={{ padding: "40px", backgroundColor: "#111", borderRadius: "20px", textAlign: "center", border: plan.popular ? "2px solid #CDB49E" : "1px solid #222", position: "relative" }}>
                  {plan.popular && <span style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", padding: "6px 16px", backgroundColor: "#CDB49E", color: "#111", borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}>MOST POPULAR</span>}
                  <div style={{ fontSize: "20px", fontWeight: "600", color: "#fff", marginBottom: "12px" }}>{plan.name}</div>
                  <div style={{ fontSize: "52px", fontWeight: "700", color: "#fff" }}>{plan.price}<span style={{ fontSize: "16px", color: "#888" }}>{plan.period}</span></div>
                  <ul style={{ margin: "32px 0", padding: "0", listStyle: "none", textAlign: "left" }}>
                    {(plan.features || []).map((f: string, j: number) => <li key={j} style={{ padding: "12px 0", color: "#888", borderBottom: "1px solid #1a1a1a", fontSize: "14px" }}>✓ {f}</li>)}
                  </ul>
                  <div style={{ padding: "16px", backgroundColor: plan.popular ? "#CDB49E" : "transparent", color: plan.popular ? "#111" : "#CDB49E", border: plan.popular ? "none" : "2px solid #CDB49E", borderRadius: "10px", fontWeight: "600", cursor: "pointer", fontSize: "15px" }}>{plan.buttonText}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // === TEAM ===
      case "team": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.title || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, title: v }) })} style={{ fontSize: "40px", fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: "16px" }} />
            <div style={{ fontSize: "16px", color: "#888", textAlign: "center", marginBottom: "56px" }}>{data.subtitle}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "32px" }}>
              {(data.members || []).map((member: any, i: number) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <img src={member.image} alt="" style={{ width: "180px", height: "180px", borderRadius: "50%", margin: "0 auto 20px", objectFit: "cover" }} />
                  <div style={{ fontSize: "18px", fontWeight: "600", color: "#fff" }}>{member.name}</div>
                  <div style={{ fontSize: "14px", color: "#CDB49E", marginTop: "4px" }}>{member.role}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "teamGrid": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.title || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, title: v }) })} style={{ fontSize: "40px", fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: "16px" }} />
            <div style={{ fontSize: "16px", color: "#888", textAlign: "center", marginBottom: "56px" }}>{data.subtitle}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" }}>
              {(data.members || []).map((member: any, i: number) => (
                <div key={i} style={{ backgroundColor: "#111", borderRadius: "16px", overflow: "hidden" }}>
                  <img src={member.image} alt="" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
                  <div style={{ padding: "24px" }}>
                    <div style={{ fontSize: "18px", fontWeight: "600", color: "#fff" }}>{member.name}</div>
                    <div style={{ fontSize: "14px", color: "#CDB49E", marginBottom: "8px" }}>{member.role}</div>
                    {member.achievement && <div style={{ fontSize: "13px", color: "#888" }}>{member.achievement}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // === STATS ===
      case "stats": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            {data.title && <div style={{ fontSize: "14px", color: "#888", textAlign: "center", marginBottom: "40px", textTransform: "uppercase", letterSpacing: "3px" }}>{data.title}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "32px", textAlign: "center" }}>
              {(data.items || []).map((item: any, i: number) => (
                <div key={i}>
                  <div style={{ fontSize: "52px", fontWeight: "700", color: "#CDB49E" }}>{item.value}</div>
                  <div style={{ fontSize: "14px", color: "#888", marginTop: "8px" }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "statsAnimated": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "32px", textAlign: "center" }}>
              {(data.items || []).map((item: any, i: number) => (
                <div key={i} style={{ padding: "32px", backgroundColor: "#0a0a0a", borderRadius: "16px" }}>
                  {item.icon && <div style={{ fontSize: "32px", marginBottom: "12px" }}>{item.icon}</div>}
                  <div style={{ fontSize: "48px", fontWeight: "700", color: "#CDB49E" }}>{item.value}</div>
                  <div style={{ fontSize: "14px", color: "#888", marginTop: "8px" }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "statsWithImage": {
        const data = parseData();
        return (
          <div style={{ ...baseStyles, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>
            <div>
              <InlineEditor value={data.heading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, heading: v }) })} style={{ fontSize: "40px", fontWeight: "700", color: "#fff", marginBottom: "12px", lineHeight: "1.1" }} />
              <div style={{ fontSize: "24px", color: "#CDB49E", marginBottom: "24px", fontStyle: "italic" }}>{data.subheading}</div>
              <div style={{ fontSize: "16px", color: "#888", lineHeight: "1.8", marginBottom: "32px", whiteSpace: "pre-line" }}>{data.description}</div>
              <div style={{ color: "#CDB49E", cursor: "pointer", marginBottom: "48px" }}>{data.buttonText}</div>
              <div style={{ display: "flex", gap: "40px" }}>
                {(data.stats || []).map((stat: any, i: number) => (
                  <div key={i}>
                    <div style={{ fontSize: "36px", fontWeight: "700", color: "#CDB49E" }}>{stat.value}</div>
                    <div style={{ fontSize: "13px", color: "#888" }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <img src={data.image} alt="" style={{ width: "100%", borderRadius: "16px" }} />
          </div>
        );
      }

      // === FAQ ===
      case "faq":
      case "faqAccordion": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.title || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, title: v }) })} style={{ fontSize: "40px", fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: "16px" }} />
            {data.subtitle && <div style={{ fontSize: "16px", color: "#888", textAlign: "center", marginBottom: "56px" }}>{data.subtitle}</div>}
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              {(data.items || []).map((item: any, i: number) => (
                <div key={i} style={{ padding: "28px 0", borderBottom: "1px solid #222" }}>
                  <div style={{ fontSize: "18px", fontWeight: "600", color: "#fff", marginBottom: "12px" }}>{item.question}</div>
                  <div style={{ fontSize: "15px", color: "#888", lineHeight: "1.7" }}>{item.answer}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // === CTA ===
      case "cta": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.heading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, heading: v }) })} style={{ fontSize: "44px", fontWeight: "700", color: "#fff", marginBottom: "20px" }} />
            <InlineEditor value={data.subheading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, subheading: v }) })} style={{ fontSize: "17px", color: "#888", marginBottom: "40px", maxWidth: "560px", margin: "0 auto 40px" }} />
            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              <div style={{ padding: "18px 36px", backgroundColor: "#CDB49E", color: "#111", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}>{data.buttonText}</div>
              {data.buttonSecondary && <div style={{ padding: "18px 36px", border: "2px solid #333", color: "#fff", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}>{data.buttonSecondary}</div>}
            </div>
          </div>
        );
      }

      case "ctaBanner": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.heading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, heading: v }) })} style={{ fontSize: "28px", fontWeight: "700", color: "#111", marginBottom: "8px" }} />
            <div style={{ fontSize: "15px", color: "#333", marginBottom: "24px" }}>{data.subheading}</div>
            <div style={{ padding: "14px 32px", backgroundColor: "#111", color: "#fff", borderRadius: "8px", fontWeight: "600", display: "inline-block", cursor: "pointer" }}>{data.buttonText}</div>
          </div>
        );
      }

      case "ctaGradient": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.heading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, heading: v }) })} style={{ fontSize: "44px", fontWeight: "700", color: "#fff", marginBottom: "20px" }} />
            <InlineEditor value={data.subheading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, subheading: v }) })} style={{ fontSize: "17px", color: "rgba(255,255,255,0.8)", marginBottom: "40px", maxWidth: "500px", margin: "0 auto 40px" }} />
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", maxWidth: "400px", margin: "0 auto" }}>
              <input type="email" placeholder={data.placeholder || "Enter your email"} style={{ flex: 1, padding: "16px 20px", backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "#fff", fontSize: "14px" }} />
              <div style={{ padding: "16px 28px", backgroundColor: "#CDB49E", color: "#111", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>{data.buttonText}</div>
            </div>
          </div>
        );
      }

      // === CONTACT ===
      case "contact": {
        const data = parseData();
        return (
          <div style={{ ...baseStyles, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px" }}>
            <div>
              <InlineEditor value={data.title || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, title: v }) })} style={{ fontSize: "40px", fontWeight: "700", color: "#fff", marginBottom: "16px" }} />
              <div style={{ fontSize: "16px", color: "#888", marginBottom: "40px" }}>{data.subtitle}</div>
              <div style={{ fontSize: "15px", color: "#888", marginBottom: "16px" }}>📧 {data.email}</div>
              <div style={{ fontSize: "15px", color: "#888", marginBottom: "16px" }}>📞 {data.phone}</div>
              <div style={{ fontSize: "15px", color: "#888" }}>📍 {data.address}</div>
            </div>
            <div style={{ backgroundColor: "#0a0a0a", padding: "40px", borderRadius: "20px", border: "1px solid #1a1a1a" }}>
              {(data.formFields || []).map((field: string, i: number) => (
                <div key={i} style={{ marginBottom: "20px" }}>
                  <label style={{ fontSize: "13px", color: "#888", marginBottom: "8px", display: "block" }}>{field}</label>
                  <input type={field === "Email" ? "email" : "text"} placeholder={field} style={{ width: "100%", padding: "14px 18px", backgroundColor: "#111", border: "1px solid #222", borderRadius: "10px", color: "#fff", fontSize: "14px" }} />
                </div>
              ))}
              <div style={{ padding: "16px", backgroundColor: "#CDB49E", color: "#111", borderRadius: "10px", fontWeight: "600", textAlign: "center", cursor: "pointer", marginTop: "8px" }}>{data.buttonText}</div>
            </div>
          </div>
        );
      }

      case "contactSplit": {
        const data = parseData();
        return (
          <div style={{ ...baseStyles, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>
            <div>
              <InlineEditor value={data.title || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, title: v }) })} style={{ fontSize: "48px", fontWeight: "700", color: "#fff", marginBottom: "16px" }} />
              <div style={{ fontSize: "17px", color: "#888", marginBottom: "40px" }}>{data.subtitle}</div>
              <div style={{ display: "flex", gap: "16px" }}>
                {(data.socials || []).map((s: string, i: number) => (
                  <span key={i} style={{ padding: "12px 20px", border: "1px solid #333", borderRadius: "8px", color: "#888", cursor: "pointer", textTransform: "capitalize" }}>{s}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "#888", marginBottom: "12px" }}>Email us at</div>
              <div style={{ fontSize: "24px", color: "#CDB49E", marginBottom: "24px" }}>{data.email}</div>
              <div style={{ fontSize: "14px", color: "#888", marginBottom: "12px" }}>Or call</div>
              <div style={{ fontSize: "24px", color: "#fff", marginBottom: "24px" }}>{data.phone}</div>
              <div style={{ fontSize: "14px", color: "#555" }}>{data.hours}</div>
            </div>
          </div>
        );
      }

      // === MISC ===
      case "logoCloud": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <div style={{ fontSize: "13px", color: "#555", marginBottom: "32px", textTransform: "uppercase", letterSpacing: "3px" }}>{data.title}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: "56px", flexWrap: "wrap", alignItems: "center" }}>
              {(data.logos || []).map((logo: string, i: number) => (
                <span key={i} style={{ fontSize: "20px", color: "#444", fontWeight: "600" }}>{logo}</span>
              ))}
            </div>
          </div>
        );
      }

      case "services": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.title || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, title: v }) })} style={{ fontSize: "40px", fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: "16px" }} />
            <div style={{ fontSize: "16px", color: "#888", textAlign: "center", marginBottom: "56px" }}>{data.subtitle}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
              {(data.items || []).map((item: any, i: number) => (
                <div key={i} style={{ padding: "36px", backgroundColor: "#111", borderRadius: "16px", border: "1px solid #1a1a1a" }}>
                  <div style={{ fontSize: "40px", marginBottom: "20px" }}>{item.icon}</div>
                  <div style={{ fontSize: "18px", fontWeight: "600", color: "#fff", marginBottom: "10px" }}>{item.title}</div>
                  <div style={{ fontSize: "14px", color: "#888", marginBottom: "20px", lineHeight: "1.5" }}>{item.description}</div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: "#CDB49E" }}>{item.price}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "timeline": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.title || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, title: v }) })} style={{ fontSize: "40px", fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: "56px" }} />
            <div style={{ maxWidth: "700px", margin: "0 auto" }}>
              {(data.items || []).map((item: any, i: number) => (
                <div key={i} style={{ display: "flex", gap: "32px", marginBottom: "40px", position: "relative" }}>
                  <div style={{ width: "80px", flexShrink: 0, textAlign: "right" }}>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: "#CDB49E" }}>{item.year}</div>
                  </div>
                  <div style={{ flex: 1, paddingBottom: "40px", borderLeft: "2px solid #222", paddingLeft: "32px" }}>
                    <div style={{ fontSize: "18px", fontWeight: "600", color: "#fff", marginBottom: "8px" }}>{item.title}</div>
                    <div style={{ fontSize: "14px", color: "#888", lineHeight: "1.6" }}>{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "process": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.title || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, title: v }) })} style={{ fontSize: "40px", fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: "16px" }} />
            <div style={{ fontSize: "16px", color: "#888", textAlign: "center", marginBottom: "56px" }}>{data.subtitle}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "32px" }}>
              {(data.steps || []).map((step: any, i: number) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "48px", fontWeight: "700", color: "#CDB49E", marginBottom: "16px" }}>{step.number}</div>
                  <div style={{ fontSize: "18px", fontWeight: "600", color: "#fff", marginBottom: "10px" }}>{step.title}</div>
                  <div style={{ fontSize: "14px", color: "#888", lineHeight: "1.5" }}>{step.description}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "comparison": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.title || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, title: v }) })} style={{ fontSize: "40px", fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: "56px" }} />
            <table style={{ width: "100%", maxWidth: "600px", margin: "0 auto", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {(data.headers || []).map((h: string, i: number) => (
                    <th key={i} style={{ padding: "16px", textAlign: i === 0 ? "left" : "center", color: i === 1 ? "#CDB49E" : "#888", fontWeight: "600", borderBottom: "1px solid #333" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data.rows || []).map((row: string[], i: number) => (
                  <tr key={i}>
                    {row.map((cell: string, j: number) => (
                      <td key={j} style={{ padding: "16px", textAlign: j === 0 ? "left" : "center", color: j === 0 ? "#fff" : cell === "✓" ? "#22c55e" : cell === "✗" ? "#ef4444" : "#888", borderBottom: "1px solid #222" }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case "newsletter": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.heading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, heading: v }) })} style={{ fontSize: "36px", fontWeight: "700", color: "#fff", marginBottom: "16px" }} />
            <div style={{ fontSize: "16px", color: "#888", marginBottom: "32px" }}>{data.subheading}</div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", maxWidth: "420px", margin: "0 auto" }}>
              <input type="email" placeholder={data.placeholder || "Enter your email"} style={{ flex: 1, padding: "16px 20px", backgroundColor: "#0a0a0a", border: "1px solid #333", borderRadius: "10px", color: "#fff", fontSize: "14px" }} />
              <div style={{ padding: "16px 28px", backgroundColor: "#CDB49E", color: "#111", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}>{data.buttonText}</div>
            </div>
          </div>
        );
      }

      case "philosophy": {
        const data = parseData();
        return (
          <div style={{ ...baseStyles, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>
            <div>
              {data.badge && <span style={{ display: "inline-block", padding: "8px 16px", backgroundColor: "#CDB49E20", color: "#CDB49E", borderRadius: "4px", fontSize: "12px", fontWeight: "600", letterSpacing: "1px", marginBottom: "24px", textTransform: "uppercase" }}>{data.badge}</span>}
              <InlineEditor value={data.heading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, heading: v }) })} style={{ fontSize: "40px", fontWeight: "700", color: "#fff", marginBottom: "24px", lineHeight: "1.1" }} />
              <div style={{ fontSize: "16px", color: "#888", lineHeight: "1.8", marginBottom: "32px", whiteSpace: "pre-line" }}>{data.description}</div>
              <div style={{ color: "#CDB49E", cursor: "pointer", marginBottom: "48px", fontSize: "15px" }}>{data.buttonText}</div>
              {data.stats && (
                <div style={{ display: "flex", gap: "40px" }}>
                  {data.stats.map((stat: any, i: number) => (
                    <div key={i}>
                      <div style={{ fontSize: "36px", fontWeight: "700", color: "#CDB49E" }}>{stat.value}</div>
                      <div style={{ fontSize: "13px", color: "#888" }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <img src={data.image} alt="" style={{ width: "100%", borderRadius: "16px" }} />
          </div>
        );
      }

      // === LAYOUT / UTILITY ===
      case "divider":
      case "spacer":
      case "spacerLarge":
      case "section":
      case "container":
      case "columns2":
      case "columns3":
      case "columns4":
        return <div style={baseStyles}>{element.content}</div>;

      // === INTERACTIVE ===
      case "countdown": {
        const data = parseData();
        const targetDate = new Date(data.targetDate || Date.now() + 7 * 24 * 60 * 60 * 1000);
        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();
        const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
        const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
        const seconds = Math.max(0, Math.floor((diff % (1000 * 60)) / 1000));

        return (
          <div style={baseStyles}>
            {data.title && <div style={{ fontSize: "28px", fontWeight: "600", color: "#fff", marginBottom: "32px" }}>{data.title}</div>}
            <div style={{ display: "flex", justifyContent: "center", gap: "24px" }}>
              {[
                { value: days, label: data.labels?.days || "Days" },
                { value: hours, label: data.labels?.hours || "Hours" },
                { value: minutes, label: data.labels?.minutes || "Minutes" },
                { value: seconds, label: data.labels?.seconds || "Seconds" },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: "center", minWidth: "80px" }}>
                  <div style={{ fontSize: "48px", fontWeight: "700", color: "#CDB49E", padding: "20px", backgroundColor: "#0a0a0a", borderRadius: "12px", marginBottom: "8px" }}>
                    {String(item.value).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: "12px", color: "#888", textTransform: "uppercase", letterSpacing: "2px" }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "socialProof": {
        const data = parseData();
        const notification = data.notifications?.[0] || { name: "Someone", action: "just joined", item: "", time: "now" };
        return (
          <div style={{ ...baseStyles, padding: "16px 20px", backgroundColor: "#111", borderRadius: "12px", border: "1px solid #222", boxShadow: "0 10px 40px rgba(0,0,0,0.3)", maxWidth: "320px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {notification.avatar && <img src={notification.avatar} alt="" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", color: "#fff" }}>
                  <strong>{notification.name}</strong> {notification.action} {notification.item && <span style={{ color: "#CDB49E" }}>{notification.item}</span>}
                </div>
                <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>{notification.time}</div>
              </div>
            </div>
          </div>
        );
      }

      case "accordion": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            {(data.items || []).map((item: any, i: number) => (
              <div key={i} style={{ borderBottom: "1px solid #222", marginBottom: "0" }}>
                <div style={{ padding: "20px 0", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "16px", fontWeight: "500", color: "#fff" }}>{item.title}</span>
                  <ChevronDown className="w-5 h-5" style={{ color: "#888" }} />
                </div>
                {data.defaultOpen === i && (
                  <div style={{ paddingBottom: "20px", fontSize: "14px", color: "#888", lineHeight: "1.6" }}>{item.content}</div>
                )}
              </div>
            ))}
          </div>
        );
      }

      case "tabs": {
        const data = parseData();
        const tabs = data.tabs || [];
        const activeTab = data.defaultTab || 0;
        return (
          <div style={baseStyles}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: data.style === "underline" ? "1px solid #222" : "none" }}>
              {tabs.map((tab: any, i: number) => (
                <div
                  key={i}
                  style={{
                    padding: data.style === "pills" ? "10px 24px" : "12px 20px",
                    backgroundColor: i === activeTab ? (data.style === "pills" ? "#CDB49E" : "transparent") : "transparent",
                    color: i === activeTab ? (data.style === "pills" ? "#111" : "#CDB49E") : "#888",
                    borderRadius: data.style === "pills" ? "8px" : "0",
                    borderBottom: data.style === "underline" && i === activeTab ? "2px solid #CDB49E" : "none",
                    fontSize: "14px",
                    fontWeight: i === activeTab ? "600" : "400",
                    cursor: "pointer",
                  }}
                >
                  {tab.label}
                </div>
              ))}
            </div>
            <div style={{ fontSize: "15px", color: "#ccc", lineHeight: "1.7" }}>
              {tabs[activeTab]?.content || "Tab content goes here."}
            </div>
          </div>
        );
      }

      default:
        return <div style={baseStyles}>{element.content}</div>;
    }
  };

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className={cn(
        "relative group transition-all",
        isSelected && "ring-2 ring-[#CDB49E] ring-offset-2 ring-offset-[#0a0a0a] rounded-lg",
        element.hidden && "opacity-30"
      )}
    >
      {isSelected && (
        <div className="absolute -top-8 left-0 flex items-center gap-1 bg-[#1a1a1a] rounded-lg p-1 shadow-lg border border-[#333] z-10">
          <span className="text-[10px] text-[#888] px-2 capitalize">{element.type}</span>
          {onDuplicate && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              className="p-1 text-[#666] hover:text-[#CDB49E] rounded"
              title="Duplicate"
            >
              <Copy className="w-3 h-3" />
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 text-[#666] hover:text-red-400 rounded"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
      {renderContent()}
    </div>
  );
}

/* ─────────────────────────── STYLE PANEL ─────────────────────────── */

function StylePanel({
  element,
  onStyleChange,
  onDelete,
}: {
  element: ElementData | null;
  onStyleChange: (key: string, value: string) => void;
  onDelete: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"style" | "layout" | "effects">("style");

  if (!element) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <MousePointer className="w-12 h-12 text-[#333] mx-auto mb-4" />
          <p className="text-sm text-[#666]">Select an element to edit its styles</p>
        </div>
      </div>
    );
  }

  const styles = element.styles;
  const isTextElement = ["heading", "subheading", "text", "button", "buttonOutline", "link", "badge"].includes(element.type);
  const isMediaElement = ["image", "imageRounded", "video", "avatar", "gallery"].includes(element.type);

  return (
    <div className="flex-1 overflow-auto flex flex-col">
      <div className="p-4 border-b border-[#222] flex items-center justify-between shrink-0">
        <span className="text-xs px-2 py-1 rounded-full bg-[#CDB49E]/10 text-[#CDB49E] font-medium capitalize">
          {element.type}
        </span>
        <button onClick={onDelete} className="p-1.5 text-[#666] hover:text-red-400 rounded">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex border-b border-[#222] shrink-0">
        {[
          { id: "style" as const, label: "Style" },
          { id: "layout" as const, label: "Layout" },
          { id: "effects" as const, label: "Effects" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-2.5 text-xs font-medium transition-colors",
              activeTab === tab.id ? "text-[#CDB49E] border-b-2 border-[#CDB49E]" : "text-[#666] hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {activeTab === "style" && (
          <>
            {isTextElement && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#555] uppercase">Typography</h4>
                
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Font Size</label>
                  <div className="flex items-center gap-2">
                    <input type="range" min="12" max="96" value={parseInt(styles.fontSize || "16")} onChange={(e) => onStyleChange("fontSize", e.target.value + "px")} className="flex-1 accent-[#CDB49E]" />
                    <input type="number" value={parseInt(styles.fontSize || "16")} onChange={(e) => onStyleChange("fontSize", e.target.value + "px")} className="w-16 px-2 py-1 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white text-center" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#888] mb-1 block">Font Weight</label>
                  <select value={styles.fontWeight || "400"} onChange={(e) => onStyleChange("fontWeight", e.target.value)} className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
                    <option value="300">Light (300)</option>
                    <option value="400">Regular (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semibold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">Extra Bold (800)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#888] mb-1.5 block">Text Align</label>
                  <div className="flex gap-1">
                    {[{ value: "left", icon: AlignLeft }, { value: "center", icon: AlignCenter }, { value: "right", icon: AlignRight }].map(({ value, icon: Icon }) => (
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

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Background</h4>
              <div>
                <label className="text-xs text-[#888] mb-1 block">Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={styles.backgroundColor || "#111111"} onChange={(e) => onStyleChange("backgroundColor", e.target.value)} className="w-10 h-10 rounded border border-[#333] bg-transparent cursor-pointer" />
                  <input type="text" value={styles.backgroundColor || "transparent"} onChange={(e) => onStyleChange("backgroundColor", e.target.value)} className="flex-1 px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white font-mono" />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#888] mb-1 block">Gradient</label>
                <input type="text" value={styles.background || ""} onChange={(e) => onStyleChange("background", e.target.value)} placeholder="linear-gradient(135deg, #6366f1, #8b5cf6)" className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white font-mono text-[11px]" />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] text-[#555]">Solid Colors</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { c: "#0a0a0a", l: "Dark" },
                    { c: "#111111", l: "Gray" },
                    { c: "#1a1a2e", l: "Navy" },
                    { c: "#CDB49E", l: "Gold" },
                  ].map((preset) => (
                    <button key={preset.l} onClick={() => onStyleChange("backgroundColor", preset.c)} className={cn("p-2 rounded border hover:border-[#CDB49E] text-[10px] text-[#888]", styles.backgroundColor === preset.c ? "border-[#CDB49E]" : "border-[#333]")} style={{ background: preset.c }}>
                      {preset.l}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-[#555]">Gradient Presets</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { c: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", l: "Purple" },
                    { c: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)", l: "Pink" },
                    { c: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", l: "Indigo" },
                    { c: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)", l: "Emerald" },
                    { c: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", l: "Orange" },
                    { c: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)", l: "Cyan" },
                    { c: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", l: "Dark Blue" },
                    { c: "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)", l: "Dark Fade" },
                    { c: "linear-gradient(135deg, #CDB49E 0%, #d4c0ad 100%)", l: "Gold" },
                    { c: "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)", l: "Fire" },
                    { c: "linear-gradient(135deg, #84cc16 0%, #22c55e 100%)", l: "Lime" },
                    { c: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", l: "Violet" },
                  ].map((preset) => (
                    <button key={preset.l} onClick={() => onStyleChange("background", preset.c)} className={cn("p-2 rounded border hover:border-[#CDB49E] text-[10px] text-white font-medium", styles.background === preset.c ? "border-[#CDB49E]" : "border-[#333]")} style={{ background: preset.c }}>
                      {preset.l}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-[#555]">Mesh Gradients</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { c: "radial-gradient(at 40% 20%, #CDB49E 0px, transparent 50%), radial-gradient(at 80% 0%, #764ba2 0px, transparent 50%), radial-gradient(at 0% 50%, #667eea 0px, transparent 50%), #0a0a0a", l: "Aurora" },
                    { c: "radial-gradient(at 0% 0%, #1a1a2e 0px, transparent 50%), radial-gradient(at 100% 0%, #16213e 0px, transparent 50%), radial-gradient(at 50% 100%, #0f172a 0px, transparent 50%), #0a0a0a", l: "Night Sky" },
                  ].map((preset) => (
                    <button key={preset.l} onClick={() => onStyleChange("background", preset.c)} className={cn("p-3 rounded border hover:border-[#CDB49E] text-[10px] text-white font-medium", styles.background === preset.c ? "border-[#CDB49E]" : "border-[#333]")} style={{ background: preset.c }}>
                      {preset.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Border</h4>
              <div>
                <label className="text-xs text-[#888] mb-1 block">Radius</label>
                <div className="flex items-center gap-2">
                  <input type="range" min="0" max="50" value={parseInt(styles.borderRadius || "0")} onChange={(e) => onStyleChange("borderRadius", e.target.value + "px")} className="flex-1 accent-[#CDB49E]" />
                  <input type="number" value={parseInt(styles.borderRadius || "0")} onChange={(e) => onStyleChange("borderRadius", e.target.value + "px")} className="w-16 px-2 py-1 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white text-center" />
                </div>
              </div>
            </div>

            {isMediaElement && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#555] uppercase">Size</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#888] mb-1 block">Width</label>
                    <input type="text" value={styles.width || "100%"} onChange={(e) => onStyleChange("width", e.target.value)} className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="text-xs text-[#888] mb-1 block">Height</label>
                    <input type="text" value={styles.height || "auto"} onChange={(e) => onStyleChange("height", e.target.value)} className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "layout" && (
          <>
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Padding</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#666] mb-1 block">All Sides</label>
                  <input type="text" value={styles.padding || ""} onChange={(e) => onStyleChange("padding", e.target.value)} placeholder="16px" className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-[#666] mb-1 block">Top</label>
                  <input type="text" value={styles.paddingTop || ""} onChange={(e) => onStyleChange("paddingTop", e.target.value)} placeholder="0" className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#666] mb-1 block">Left / Right</label>
                  <input type="text" value={styles.paddingLeft || ""} onChange={(e) => { onStyleChange("paddingLeft", e.target.value); onStyleChange("paddingRight", e.target.value); }} placeholder="0" className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-[#666] mb-1 block">Bottom</label>
                  <input type="text" value={styles.paddingBottom || ""} onChange={(e) => onStyleChange("paddingBottom", e.target.value)} placeholder="0" className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Margin</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#666] mb-1 block">All Sides</label>
                  <input type="text" value={styles.margin || ""} onChange={(e) => onStyleChange("margin", e.target.value)} placeholder="0" className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-[#666] mb-1 block">Auto Center</label>
                  <button onClick={() => onStyleChange("margin", "0 auto")} className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded text-[#888] hover:text-white hover:border-[#CDB49E]">Center</button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Size</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Width</label>
                  <input type="text" value={styles.width || ""} onChange={(e) => onStyleChange("width", e.target.value)} placeholder="auto" className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
                </div>
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Max Width</label>
                  <input type="text" value={styles.maxWidth || ""} onChange={(e) => onStyleChange("maxWidth", e.target.value)} placeholder="none" className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Height</label>
                  <input type="text" value={styles.height || ""} onChange={(e) => onStyleChange("height", e.target.value)} placeholder="auto" className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
                </div>
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Min Height</label>
                  <input type="text" value={styles.minHeight || ""} onChange={(e) => onStyleChange("minHeight", e.target.value)} placeholder="none" className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Display</h4>
              <div className="grid grid-cols-4 gap-2">
                {["block", "flex", "grid", "none"].map((d) => (
                  <button key={d} onClick={() => onStyleChange("display", d)} className={cn("py-2 text-xs rounded-lg border transition-colors capitalize", styles.display === d ? "bg-[#CDB49E]/10 border-[#CDB49E] text-[#CDB49E]" : "border-[#333] text-[#666] hover:text-white")}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {styles.display === "flex" && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#555] uppercase">Flex Properties</h4>
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Direction</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["row", "column"].map((dir) => (
                      <button key={dir} onClick={() => onStyleChange("flexDirection", dir)} className={cn("py-2 text-xs rounded-lg border transition-colors capitalize", styles.flexDirection === dir ? "bg-[#CDB49E]/10 border-[#CDB49E] text-[#CDB49E]" : "border-[#333] text-[#666] hover:text-white")}>
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Justify</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["start", "center", "end", "between", "around", "evenly"].map((j) => (
                      <button key={j} onClick={() => onStyleChange("justifyContent", j === "between" ? "space-between" : j === "around" ? "space-around" : j === "evenly" ? "space-evenly" : j)} className={cn("py-1.5 text-[10px] rounded-lg border transition-colors capitalize", styles.justifyContent?.includes(j) ? "bg-[#CDB49E]/10 border-[#CDB49E] text-[#CDB49E]" : "border-[#333] text-[#666] hover:text-white")}>
                        {j}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Align Items</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["start", "center", "end", "stretch"].map((a) => (
                      <button key={a} onClick={() => onStyleChange("alignItems", a === "start" ? "flex-start" : a === "end" ? "flex-end" : a)} className={cn("py-1.5 text-[10px] rounded-lg border transition-colors capitalize", styles.alignItems?.includes(a) ? "bg-[#CDB49E]/10 border-[#CDB49E] text-[#CDB49E]" : "border-[#333] text-[#666] hover:text-white")}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Gap</label>
                  <input type="text" value={styles.gap || ""} onChange={(e) => onStyleChange("gap", e.target.value)} placeholder="16px" className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Responsive Visibility</h4>
              <p className="text-[10px] text-[#555]">Control visibility on different screen sizes</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-[#1a1a1a] rounded-lg border border-[#333]">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-[#888]" />
                    <span className="text-xs text-[#888]">Desktop</span>
                  </div>
                  <button onClick={() => onStyleChange("--hide-desktop", styles["--hide-desktop"] === "true" ? "false" : "true")} className={cn("p-1.5 rounded", styles["--hide-desktop"] === "true" ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400")}>
                    {styles["--hide-desktop"] === "true" ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#1a1a1a] rounded-lg border border-[#333]">
                  <div className="flex items-center gap-2">
                    <Tablet className="w-4 h-4 text-[#888]" />
                    <span className="text-xs text-[#888]">Tablet</span>
                  </div>
                  <button onClick={() => onStyleChange("--hide-tablet", styles["--hide-tablet"] === "true" ? "false" : "true")} className={cn("p-1.5 rounded", styles["--hide-tablet"] === "true" ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400")}>
                    {styles["--hide-tablet"] === "true" ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#1a1a1a] rounded-lg border border-[#333]">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#888]" />
                    <span className="text-xs text-[#888]">Mobile</span>
                  </div>
                  <button onClick={() => onStyleChange("--hide-mobile", styles["--hide-mobile"] === "true" ? "false" : "true")} className={cn("p-1.5 rounded", styles["--hide-mobile"] === "true" ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400")}>
                    {styles["--hide-mobile"] === "true" ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Position</h4>
              <div className="grid grid-cols-3 gap-2">
                {["relative", "absolute", "fixed"].map((p) => (
                  <button key={p} onClick={() => onStyleChange("position", p)} className={cn("py-2 text-xs rounded-lg border transition-colors capitalize", styles.position === p ? "bg-[#CDB49E]/10 border-[#CDB49E] text-[#CDB49E]" : "border-[#333] text-[#666] hover:text-white")}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "effects" && (
          <>
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Animation</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "None", value: "none" },
                  { label: "Fade In", value: "fadeIn 0.6s ease-out forwards" },
                  { label: "Slide Up", value: "slideUp 0.6s ease-out forwards" },
                  { label: "Slide Down", value: "slideDown 0.6s ease-out forwards" },
                  { label: "Slide Left", value: "slideLeft 0.6s ease-out forwards" },
                  { label: "Slide Right", value: "slideRight 0.6s ease-out forwards" },
                  { label: "Scale In", value: "scaleIn 0.5s ease-out forwards" },
                  { label: "Bounce", value: "bounce 0.8s ease-out forwards" },
                ].map((anim) => (
                  <button key={anim.label} onClick={() => onStyleChange("animation", anim.value)} className={cn("py-2 px-3 text-xs rounded-lg border transition-colors text-left", styles.animation === anim.value ? "bg-[#CDB49E]/10 border-[#CDB49E] text-[#CDB49E]" : "border-[#333] text-[#666] hover:text-white")}>
                    {anim.label}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs text-[#888] mb-1 block">Animation Delay</label>
                <select value={styles.animationDelay || "0s"} onChange={(e) => onStyleChange("animationDelay", e.target.value)} className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
                  <option value="0s">No delay</option>
                  <option value="0.1s">0.1s</option>
                  <option value="0.2s">0.2s</option>
                  <option value="0.3s">0.3s</option>
                  <option value="0.5s">0.5s</option>
                  <option value="0.8s">0.8s</option>
                  <option value="1s">1s</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Hover Effects</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "None", value: "none" },
                  { label: "Lift", value: "hover-lift" },
                  { label: "Glow", value: "hover-glow" },
                  { label: "Scale", value: "hover-scale" },
                ].map((effect) => (
                  <button key={effect.label} onClick={() => onStyleChange("--hover-effect", effect.value)} className={cn("py-2 text-xs rounded-lg border transition-colors", styles["--hover-effect"] === effect.value ? "bg-[#CDB49E]/10 border-[#CDB49E] text-[#CDB49E]" : "border-[#333] text-[#666] hover:text-white")}>
                    {effect.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Shadow</h4>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "None", value: "none" },
                  { label: "SM", value: "0 1px 3px rgba(0,0,0,0.3)" },
                  { label: "MD", value: "0 4px 12px rgba(0,0,0,0.3)" },
                  { label: "LG", value: "0 10px 40px rgba(0,0,0,0.4)" },
                ].map((s) => (
                  <button key={s.label} onClick={() => onStyleChange("boxShadow", s.value)} className={cn("py-2 text-xs rounded-lg border transition-colors", styles.boxShadow === s.value ? "bg-[#CDB49E]/10 border-[#CDB49E] text-[#CDB49E]" : "border-[#333] text-[#666] hover:text-white")}>
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Gold Glow", value: "0 0 40px rgba(205,180,158,0.3)" },
                  { label: "Neon Blue", value: "0 0 30px rgba(99,102,241,0.4)" },
                  { label: "Neon Pink", value: "0 0 30px rgba(236,72,153,0.4)" },
                  { label: "Soft", value: "0 20px 60px rgba(0,0,0,0.3)" },
                ].map((s) => (
                  <button key={s.label} onClick={() => onStyleChange("boxShadow", s.value)} className={cn("py-2 text-xs rounded-lg border transition-colors", styles.boxShadow === s.value ? "bg-[#CDB49E]/10 border-[#CDB49E] text-[#CDB49E]" : "border-[#333] text-[#666] hover:text-white")}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Opacity</h4>
              <div className="flex items-center gap-2">
                <input type="range" min="0" max="100" value={parseFloat(styles.opacity || "1") * 100} onChange={(e) => onStyleChange("opacity", String(Number(e.target.value) / 100))} className="flex-1 accent-[#CDB49E]" />
                <span className="text-xs text-white w-12">{Math.round(parseFloat(styles.opacity || "1") * 100)}%</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Transform</h4>
              <div>
                <label className="text-xs text-[#888] mb-1 block">Rotate</label>
                <div className="flex items-center gap-2">
                  <input type="range" min="-180" max="180" value={parseInt(styles.transform?.match(/rotate\((-?\d+)deg\)/)?.[1] || "0")} onChange={(e) => onStyleChange("transform", `rotate(${e.target.value}deg)`)} className="flex-1 accent-[#CDB49E]" />
                  <span className="text-xs text-white w-12">{parseInt(styles.transform?.match(/rotate\((-?\d+)deg\)/)?.[1] || "0")}°</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-[#888] mb-1 block">Scale</label>
                <div className="flex items-center gap-2">
                  <input type="range" min="50" max="150" value={parseFloat(styles.transform?.match(/scale\(([0-9.]+)\)/)?.[1] || "1") * 100} onChange={(e) => onStyleChange("transform", `scale(${Number(e.target.value) / 100})`)} className="flex-1 accent-[#CDB49E]" />
                  <span className="text-xs text-white w-12">{Math.round(parseFloat(styles.transform?.match(/scale\(([0-9.]+)\)/)?.[1] || "1") * 100)}%</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── PANELS ─────────────────────────── */

function ComponentsPanel({ onAdd }: { onAdd: (type: string) => void }) {
  return (
    <div className="flex-1 overflow-auto p-3 space-y-4">
      {Object.entries(COMPONENTS).map(([category, items]) => (
        <div key={category}>
          <h4 className="text-[10px] font-semibold text-[#444] uppercase mb-2">{category}</h4>
          <div className="grid grid-cols-2 gap-2">
            {items.map((comp) => {
              const Icon = comp.icon;
              return (
                <button
                  key={comp.id}
                  onClick={() => onAdd(comp.id)}
                  className="p-3 rounded-lg border border-[#2a2a2a] hover:border-[#CDB49E] hover:bg-[#CDB49E]/5 transition-all text-center group"
                >
                  <Icon className="w-5 h-5 text-[#666] group-hover:text-[#CDB49E] mx-auto mb-1 transition-colors" />
                  <span className="text-[10px] text-[#888] group-hover:text-white">{comp.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function PagesPanel({
  pages,
  currentPageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onRenamePage,
}: {
  pages: { id: string; name: string; slug: string }[];
  currentPageId: string;
  onSelectPage: (id: string) => void;
  onAddPage: () => void;
  onDeletePage: (id: string) => void;
  onRenamePage: (id: string, name: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  return (
    <div className="flex-1 overflow-auto p-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#555] uppercase">Pages</span>
        <button onClick={onAddPage} className="p-1.5 text-[#CDB49E] hover:bg-[#CDB49E]/10 rounded-lg">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-1">
        {pages.map((page) => (
          <div
            key={page.id}
            onClick={() => onSelectPage(page.id)}
            className={cn(
              "group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors",
              currentPageId === page.id
                ? "bg-[#CDB49E]/10 border border-[#CDB49E]/30"
                : "hover:bg-[#1a1a1a] border border-transparent"
            )}
          >
            <FileText className="w-4 h-4 text-[#666]" />
            {editingId === page.id ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => { onRenamePage(page.id, editName); setEditingId(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") { onRenamePage(page.id, editName); setEditingId(null); } }}
                className="flex-1 px-2 py-0.5 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white"
                autoFocus
              />
            ) : (
              <span className="flex-1 text-xs text-white truncate">{page.name}</span>
            )}
            <span className="text-[10px] text-[#555]">{page.slug}</span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
              <button
                onClick={(e) => { e.stopPropagation(); setEditingId(page.id); setEditName(page.name); }}
                className="p-1 text-[#555] hover:text-white rounded"
              >
                <Type className="w-3 h-3" />
              </button>
              {pages.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDeletePage(page.id); }}
                  className="p-1 text-[#555] hover:text-red-400 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LayersPanel({
  elements,
  selectedId,
  onSelect,
  onDelete,
  onReorder,
  onToggleHidden,
}: {
  elements: ElementData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onToggleHidden: (id: string) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const getElementDetails = (el: ElementData) => {
    try {
      const data = JSON.parse(el.content || "{}");
      if (data.heading) return data.heading.substring(0, 30);
      if (data.title) return data.title.substring(0, 30);
      if (typeof el.content === "string" && !el.content.startsWith("{")) {
        return el.content.substring(0, 30);
      }
    } catch {}
    return null;
  };

  if (elements.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <Layers className="w-10 h-10 text-[#333] mx-auto mb-3" />
          <p className="text-xs text-[#666]">No elements yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-2">
      {elements.map((el, index) => {
        const details = getElementDetails(el);
        return (
          <div
            key={el.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null && dragIndex !== index) {
                onReorder(dragIndex, index);
              }
              setDragIndex(null);
            }}
            onClick={() => onSelect(el.id)}
            className={cn(
              "group flex items-center gap-1.5 p-2 rounded-lg cursor-pointer transition-colors mb-1",
              selectedId === el.id
                ? "bg-[#CDB49E]/10 border border-[#CDB49E]/30"
                : "hover:bg-[#1a1a1a] border border-transparent",
              el.hidden && "opacity-40"
            )}
          >
            <GripVertical className="w-3 h-3 text-[#444] cursor-grab" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white truncate capitalize">{el.type}</div>
              {details && <div className="text-[10px] text-[#555] truncate">{details}...</div>}
            </div>
            <button onClick={(e) => { e.stopPropagation(); onToggleHidden(el.id); }} className="p-1 text-[#555] hover:text-white rounded opacity-0 group-hover:opacity-100">
              {el.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(el.id); }} className="p-1 text-[#555] hover:text-red-400 rounded opacity-0 group-hover:opacity-100">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

interface PageType {
  id: string;
  name: string;
  slug: string;
  elements: ElementData[];
}

const STORAGE_KEY = "atlas-website-builder-v2";

export default function WebsitePage() {
  const [view, setView] = useState<"templates" | "editor" | "preview">("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateCategory, setTemplateCategory] = useState<string>("all");
  
  const [pages, setPages] = useState<PageType[]>([
    { id: "page-home", name: "Home", slug: "/", elements: [] }
  ]);
  const [currentPageId, setCurrentPageId] = useState("page-home");
  
  const currentPage = pages.find(p => p.id === currentPageId) || pages[0];
  const elements = currentPage?.elements || [];
  
  const setElements = useCallback((updater: ElementData[] | ((prev: ElementData[]) => ElementData[])) => {
    setPages(prev => prev.map(p => {
      if (p.id === currentPageId) {
        const newElements = typeof updater === "function" ? updater(p.elements) : updater;
        return { ...p, elements: newElements };
      }
      return p;
    }));
  }, [currentPageId]);
  
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [leftPanel, setLeftPanel] = useState<"components" | "layers" | "pages">("components");
  const [zoom, setZoom] = useState(100);
  const [showPanels, setShowPanels] = useState({ left: true, right: true });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [history, setHistory] = useState<{ past: ElementData[][]; future: ElementData[][] }>({ past: [], future: [] });

  const selectedElement = elements.find(el => el.id === selectedElementId) || null;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.pages && data.pages.length > 0) {
          setPages(data.pages);
          setCurrentPageId(data.currentPageId || data.pages[0].id);
          setView("editor");
          setSelectedTemplate(data.template || "loaded");
          setLastSaved(new Date(data.savedAt));
        }
      } catch (e) {}
    }
  }, []);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    const data = { pages, currentPageId, template: selectedTemplate, savedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setLastSaved(new Date());
    setTimeout(() => setIsSaving(false), 500);
  }, [pages, currentPageId, selectedTemplate]);

  useEffect(() => {
    if (view === "editor" && elements.length > 0) {
      const interval = setInterval(handleSave, 30000);
      return () => clearInterval(interval);
    }
  }, [view, elements.length, handleSave]);

  const handleAddPage = useCallback(() => {
    const pageNum = pages.length + 1;
    const newPage: PageType = { id: `page-${Date.now()}`, name: `Page ${pageNum}`, slug: `/page-${pageNum}`, elements: [] };
    setPages(prev => [...prev, newPage]);
    setCurrentPageId(newPage.id);
  }, [pages.length]);

  const handleDeletePage = useCallback((pageId: string) => {
    if (pages.length <= 1) return;
    setPages(prev => prev.filter(p => p.id !== pageId));
    if (currentPageId === pageId) setCurrentPageId(pages[0].id);
  }, [pages, currentPageId]);

  const handleRenamePage = useCallback((pageId: string, newName: string) => {
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, name: newName } : p));
  }, []);

  const saveHistory = useCallback(() => {
    setHistory(h => ({ past: [...h.past.slice(-20), elements], future: [] }));
  }, [elements]);

  const handleAddElement = useCallback((type: string) => {
    saveHistory();
    const defaults = getDefaultElement(type);
    const newElement: ElementData = { id: `el-${Date.now()}`, type, content: defaults.content || "", styles: defaults.styles || {} };
    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  }, [saveHistory, setElements]);

  const handleUpdateElement = useCallback((id: string, updates: Partial<ElementData>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  }, [setElements]);

  const handleStyleChange = useCallback((key: string, value: string) => {
    if (!selectedElementId) return;
    saveHistory();
    setElements(prev => prev.map(el => el.id === selectedElementId ? { ...el, styles: { ...el.styles, [key]: value } } : el));
  }, [selectedElementId, saveHistory, setElements]);

  const handleDeleteElement = useCallback((id: string) => {
    saveHistory();
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  }, [selectedElementId, saveHistory, setElements]);

  const handleDuplicateElement = useCallback((id: string) => {
    saveHistory();
    const element = elements.find(el => el.id === id);
    if (!element) return;
    
    const newElement: ElementData = {
      ...element,
      id: `el-${Date.now()}`,
      styles: { ...element.styles },
    };
    
    // Insert after the original element
    const index = elements.findIndex(el => el.id === id);
    setElements(prev => {
      const newElements = [...prev];
      newElements.splice(index + 1, 0, newElement);
      return newElements;
    });
    setSelectedElementId(newElement.id);
  }, [elements, saveHistory, setElements]);

  const handleReorderElements = useCallback((fromIndex: number, toIndex: number) => {
    saveHistory();
    setElements(prev => {
      const newElements = [...prev];
      const [moved] = newElements.splice(fromIndex, 1);
      newElements.splice(toIndex, 0, moved);
      return newElements;
    });
  }, [saveHistory, setElements]);

  const handleToggleHidden = useCallback((id: string) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, hidden: !el.hidden } : el));
  }, [setElements]);

  const undo = useCallback(() => {
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    setHistory(h => ({ past: h.past.slice(0, -1), future: [elements, ...h.future] }));
    setElements(previous);
  }, [history, elements, setElements]);

  const redo = useCallback(() => {
    if (history.future.length === 0) return;
    const next = history.future[0];
    setHistory(h => ({ past: [...h.past, elements], future: h.future.slice(1) }));
    setElements(next);
  }, [history, elements, setElements]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputActive = document.activeElement?.tagName === "INPUT" || 
                           document.activeElement?.tagName === "TEXTAREA" ||
                           (document.activeElement as HTMLElement)?.contentEditable === "true";
      
      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      
      // Save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
        return;
      }
      
      // Duplicate (Ctrl/Cmd + D)
      if ((e.metaKey || e.ctrlKey) && e.key === "d" && selectedElementId && !isInputActive) {
        e.preventDefault();
        handleDuplicateElement(selectedElementId);
        return;
      }
      
      // Delete/Backspace
      if ((e.key === "Delete" || e.key === "Backspace") && selectedElementId && !isInputActive) {
        e.preventDefault();
        handleDeleteElement(selectedElementId);
        return;
      }
      
      // Escape to deselect
      if (e.key === "Escape") {
        setSelectedElementId(null);
        return;
      }
      
      // Toggle preview with P
      if (e.key === "p" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setView(view === "preview" ? "editor" : "preview");
        return;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, selectedElementId, handleDeleteElement, handleDuplicateElement, handleSave, view]);

  // Load template content when selected
  useEffect(() => {
    if (selectedTemplate && view === "editor" && elements.length === 0) {
      const templateElements = getTemplateWebsite(selectedTemplate);
      setElements(templateElements);
    }
  }, [selectedTemplate, view, elements.length, setElements]);

  // Template categories
  const categories = [
    { id: "all", name: "All" },
    { id: "fitness", name: "Fitness" },
    { id: "business", name: "Business" },
    { id: "tech", name: "Tech" },
    { id: "ecommerce", name: "E-Commerce" },
    { id: "creative", name: "Creative" },
    { id: "health", name: "Health" },
    { id: "food", name: "Food" },
    { id: "education", name: "Education" },
    { id: "travel", name: "Travel" },
  ];

  const filteredTemplates = templateCategory === "all" 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.category === templateCategory);

  // ─────────────────────────── TEMPLATE GALLERY ───────────────────────────

  if (view === "templates") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CDB49E]/10 text-[#CDB49E] text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Atlas Website Builder Pro
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Choose a Template</h1>
            <p className="text-lg text-[#888]">Professional websites ready to customize</p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setTemplateCategory(cat.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  templateCategory === cat.id
                    ? "bg-[#CDB49E] text-[#111]"
                    : "bg-[#1a1a1a] text-[#888] hover:text-white"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  onClick={() => { setSelectedTemplate(template.id); setView("editor"); }}
                  className="group relative bg-[#111] border border-[#2a2a2a] rounded-2xl overflow-hidden hover:border-[#CDB49E]/50 transition-all cursor-pointer hover:transform hover:scale-[1.02]"
                >
                  <div className="h-40" style={{ background: template.preview }}>
                    {template.popular && (
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500 text-[10px] font-bold text-black uppercase tracking-wider">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#CDB49E]/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#CDB49E]" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-white block">{template.name}</span>
                      <span className="text-xs text-[#666] capitalize">{template.category}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Blank Canvas */}
            <div
              onClick={() => { setSelectedTemplate("blank"); setView("editor"); }}
              className="bg-[#111] border-2 border-dashed border-[#333] rounded-2xl flex flex-col items-center justify-center min-h-[220px] hover:border-[#CDB49E]/50 transition-all cursor-pointer"
            >
              <Plus className="w-12 h-12 text-[#444] mb-3" />
              <span className="text-sm font-medium text-[#666]">Start from Scratch</span>
              <span className="text-xs text-[#555] mt-1">Build your own design</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────── PREVIEW MODE ───────────────────────────

  if (view === "preview") {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="fixed top-0 left-0 right-0 h-12 bg-[#111]/95 backdrop-blur border-b border-[#222] flex items-center justify-between px-4 z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => setView("editor")} className="text-sm text-[#888] hover:text-white flex items-center gap-1">
              <ChevronRight className="w-4 h-4 rotate-180" /> Back to Editor
            </button>
            <span className="text-xs text-[#555]">Preview Mode</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
              {[
                { id: "desktop" as const, icon: Monitor },
                { id: "tablet" as const, icon: Tablet },
                { id: "mobile" as const, icon: Smartphone },
              ].map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setDevicePreview(id)}
                  className={cn("p-1.5 rounded-md", devicePreview === id ? "bg-[#CDB49E]/10 text-[#CDB49E]" : "text-[#555] hover:text-white")}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
            <button onClick={() => setView("editor")} className="px-4 py-1.5 bg-[#CDB49E] text-black rounded-lg text-sm font-medium">
              Edit
            </button>
          </div>
        </div>
        <div className="pt-12 flex justify-center">
          <div className={cn(
            "bg-[#0a0a0a] min-h-screen transition-all",
            devicePreview === "desktop" && "w-full",
            devicePreview === "tablet" && "w-[768px]",
            devicePreview === "mobile" && "w-[375px]"
          )}>
            {elements.filter(el => !el.hidden).map((element) => (
              <ElementRenderer
                key={element.id}
                element={element}
                isSelected={false}
                onSelect={() => {}}
                onUpdate={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────── EDITOR ───────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* TOOLBAR */}
      <div className="h-12 bg-[#111] border-b border-[#222] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setView("templates")} className="text-sm text-[#888] hover:text-white flex items-center gap-1">
            <ChevronRight className="w-4 h-4 rotate-180" /> Templates
          </button>
          <div className="h-5 w-px bg-[#333]" />
          <div className="flex items-center gap-1">
            <button onClick={undo} disabled={history.past.length === 0} className="p-1.5 text-[#666] hover:text-white disabled:opacity-30" title="Undo (Ctrl+Z)">
              <Undo2 className="w-4 h-4" />
            </button>
            <button onClick={redo} disabled={history.future.length === 0} className="p-1.5 text-[#666] hover:text-white disabled:opacity-30" title="Redo (Ctrl+Shift+Z)">
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-[#555]">{elements.length} elements</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
            <button onClick={() => setZoom(Math.max(50, zoom - 25))} className="text-[#888] hover:text-white">
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-xs text-white w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(150, zoom + 25))} className="text-[#888] hover:text-white">
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
            {[
              { id: "desktop" as const, icon: Monitor },
              { id: "tablet" as const, icon: Tablet },
              { id: "mobile" as const, icon: Smartphone },
            ].map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setDevicePreview(id)}
                className={cn("p-1.5 rounded-md", devicePreview === id ? "bg-[#CDB49E]/10 text-[#CDB49E]" : "text-[#555] hover:text-white")}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowPanels(p => ({ ...p, left: !p.left }))} className={cn("p-2 rounded", showPanels.left ? "text-[#CDB49E]" : "text-[#555]")}>
            <PanelLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setShowPanels(p => ({ ...p, right: !p.right }))} className={cn("p-2 rounded", showPanels.right ? "text-[#CDB49E]" : "text-[#555]")}>
            <PanelRight className="w-4 h-4" />
          </button>
          <div className="h-5 w-px bg-[#333]" />
          <button 
            onClick={handleSave} 
            className={cn("px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors", isSaving ? "bg-emerald-600 text-white" : "text-[#888] hover:text-white border border-[#333] hover:border-[#444]")}
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save"}
          </button>
          {lastSaved && <span className="text-[10px] text-[#555]">{lastSaved.toLocaleTimeString()}</span>}
          <button onClick={() => setView("preview")} className="px-3 py-1.5 text-sm text-[#888] hover:text-white border border-[#333] rounded-lg flex items-center gap-2 hover:border-[#444]">
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button 
            onClick={() => {
              // Generate and download HTML
              const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Atlas Website</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: #0a0a0a; }
    ${document.querySelector('style[data-atlas-animations]')?.textContent || ''}
  </style>
</head>
<body>
${elements.map(el => {
  const styles = Object.entries(el.styles || {}).map(([k, v]) => \`\${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: \${v}\`).join('; ');
  return \`<div style="\${styles}">\${el.content}</div>\`;
}).join('\\n')}
</body>
</html>`;
              const blob = new Blob([html], { type: 'text/html' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'website.html';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-3 py-1.5 text-sm text-[#888] hover:text-white border border-[#333] rounded-lg flex items-center gap-2 hover:border-[#444]"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2">
            <Rocket className="w-4 h-4" /> Publish
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL */}
        {showPanels.left && (
          <div className="w-64 bg-[#111] border-r border-[#222] flex flex-col shrink-0">
            <div className="flex border-b border-[#222]">
              <button
                onClick={() => setLeftPanel("pages")}
                className={cn("flex-1 py-3 text-xs flex items-center justify-center gap-1", leftPanel === "pages" ? "text-[#CDB49E] border-b-2 border-[#CDB49E]" : "text-[#666]")}
              >
                <FileText className="w-4 h-4" /> Pages
              </button>
              <button
                onClick={() => setLeftPanel("components")}
                className={cn("flex-1 py-3 text-xs flex items-center justify-center gap-1", leftPanel === "components" ? "text-[#CDB49E] border-b-2 border-[#CDB49E]" : "text-[#666]")}
              >
                <Plus className="w-4 h-4" /> Add
              </button>
              <button
                onClick={() => setLeftPanel("layers")}
                className={cn("flex-1 py-3 text-xs flex items-center justify-center gap-1", leftPanel === "layers" ? "text-[#CDB49E] border-b-2 border-[#CDB49E]" : "text-[#666]")}
              >
                <Layers className="w-4 h-4" /> Layers
              </button>
            </div>
            {leftPanel === "pages" && (
              <PagesPanel
                pages={pages}
                currentPageId={currentPageId}
                onSelectPage={setCurrentPageId}
                onAddPage={handleAddPage}
                onDeletePage={handleDeletePage}
                onRenamePage={handleRenamePage}
              />
            )}
            {leftPanel === "components" && (
              <ComponentsPanel onAdd={handleAddElement} />
            )}
            {leftPanel === "layers" && (
              <LayersPanel
                elements={elements}
                selectedId={selectedElementId}
                onSelect={setSelectedElementId}
                onDelete={handleDeleteElement}
                onReorder={handleReorderElements}
                onToggleHidden={handleToggleHidden}
              />
            )}
          </div>
        )}

        {/* CANVAS */}
        <div 
          className="flex-1 bg-[#1a1a1a] overflow-auto p-8 flex items-start justify-center"
          onClick={() => setSelectedElementId(null)}
        >
          <div
            className={cn(
              "bg-[#0a0a0a] rounded-xl shadow-2xl overflow-hidden transition-all min-h-[600px]",
              devicePreview === "desktop" && "w-full max-w-5xl",
              devicePreview === "tablet" && "w-[768px]",
              devicePreview === "mobile" && "w-[375px]"
            )}
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          >
            {elements.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[500px] text-center p-8">
                <div className="w-20 h-20 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mb-6">
                  <Plus className="w-10 h-10 text-[#333]" />
                </div>
                <p className="text-lg font-medium text-[#666] mb-2">Your canvas is empty</p>
                <p className="text-sm text-[#555]">Add components from the left panel to get started</p>
              </div>
            ) : (
              <div className="space-y-0">
                {elements.filter(el => !el.hidden).map((element) => (
                  <ElementRenderer
                    key={element.id}
                    element={element}
                    isSelected={selectedElementId === element.id}
                    onSelect={() => setSelectedElementId(element.id)}
                    onUpdate={(updates) => handleUpdateElement(element.id, updates)}
                    onDelete={() => handleDeleteElement(element.id)}
                    onDuplicate={() => handleDuplicateElement(element.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        {showPanels.right && (
          <div className="w-80 bg-[#111] border-l border-[#222] flex flex-col shrink-0">
            <div className="p-3 border-b border-[#222]">
              <h3 className="text-xs font-semibold text-[#888] uppercase">Style Editor</h3>
            </div>
            <StylePanel
              element={selectedElement}
              onStyleChange={handleStyleChange}
              onDelete={() => selectedElementId && handleDeleteElement(selectedElementId)}
            />
          </div>
        )}
      </div>
    </div>
  );
}