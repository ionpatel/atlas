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
  CircleDot, Maximize2, Video, Music, Move, Lock, Unlock, RotateCcw,
  Undo2, Redo2, Save, Code, PanelLeft, PanelRight,
  Frame, Container, Rows, AlignStartVertical, AlignCenterVertical,
  AlignEndVertical, GalleryHorizontal, Expand, ZoomIn, ZoomOut, Target,
  Droplets, Sparkle, Move3D, SquareDashed, PaletteIcon,
  AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd,
  AlignHorizontalSpaceBetween,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   ATLAS WEBSITE BUILDER PRO - FUNCTIONAL VERSION
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

/* ─────────────────────────── TEMPLATES ─────────────────────────── */

const TEMPLATES = [
  { id: "saas", name: "SaaS Platform", icon: BarChart3, preview: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", popular: true },
  { id: "agency", name: "Creative Agency", icon: Briefcase, preview: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)", popular: true },
  { id: "ecommerce", name: "E-Commerce", icon: ShoppingBag, preview: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)" },
  { id: "restaurant", name: "Restaurant", icon: Utensils, preview: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" },
  { id: "portfolio", name: "Portfolio", icon: Camera, preview: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)" },
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
    { id: "icon", name: "Icon", icon: Star },
    { id: "avatar", name: "Avatar", icon: CircleDot },
    { id: "gallery", name: "Image Gallery", icon: GalleryHorizontal },
  ],
  Cards: [
    { id: "card", name: "Basic Card", icon: Square },
    { id: "featureCard", name: "Feature Card", icon: Zap },
    { id: "profileCard", name: "Profile Card", icon: CircleDot },
    { id: "pricingCard", name: "Pricing Card", icon: DollarSign },
    { id: "testimonialCard", name: "Testimonial Card", icon: MessageSquare },
    { id: "statCard", name: "Stat Card", icon: BarChart3 },
  ],
  Navigation: [
    { id: "navbar", name: "Navbar", icon: LayoutGrid },
    { id: "navbarDark", name: "Dark Navbar", icon: LayoutGrid },
    { id: "footer", name: "Footer", icon: Rows },
    { id: "footerSimple", name: "Simple Footer", icon: Minus },
  ],
  Sections: [
    { id: "hero", name: "Hero", icon: Zap },
    { id: "heroWithImage", name: "Hero + Image", icon: Zap },
    { id: "features3", name: "3 Features", icon: Grid },
    { id: "features4", name: "4 Features", icon: LayoutGrid },
    { id: "testimonials", name: "Testimonials", icon: MessageSquare },
    { id: "pricing3", name: "Pricing Table", icon: DollarSign },
    { id: "team", name: "Team Section", icon: Building2 },
    { id: "stats", name: "Stats Section", icon: BarChart3 },
    { id: "faq", name: "FAQ Section", icon: CircleDot },
    { id: "cta", name: "Call to Action", icon: Rocket },
    { id: "ctaBanner", name: "CTA Banner", icon: Rocket },
    { id: "contact", name: "Contact Section", icon: Mail },
    { id: "logoCloud", name: "Logo Cloud", icon: Building2 },
  ],
  Utility: [
    { id: "divider", name: "Divider", icon: Minus },
    { id: "spacer", name: "Spacer", icon: Expand },
    { id: "spacerLarge", name: "Large Spacer", icon: Expand },
  ],
};

/* ─────────────────────────── DEFAULT ELEMENT CONTENT ─────────────────────────── */

const getDefaultElement = (type: string): Partial<ElementData> => {
  const defaults: Record<string, Partial<ElementData>> = {
    // === BASIC TEXT ===
    heading: {
      content: "Your Heading Here",
      styles: { fontSize: "42px", fontWeight: "700", color: "#ffffff", marginBottom: "16px", lineHeight: "1.2" },
    },
    subheading: {
      content: "Your Subheading Text",
      styles: { fontSize: "24px", fontWeight: "500", color: "#cccccc", marginBottom: "12px", lineHeight: "1.4" },
    },
    text: {
      content: "Add your text content here. Click to edit and customize this paragraph. You can write as much as you need.",
      styles: { fontSize: "16px", color: "#888888", lineHeight: "1.7", marginBottom: "16px" },
    },
    button: {
      content: "Get Started",
      styles: { 
        backgroundColor: "#CDB49E", color: "#111111", padding: "14px 28px", 
        borderRadius: "8px", fontSize: "15px", fontWeight: "600", display: "inline-block",
        cursor: "pointer",
      },
    },
    buttonOutline: {
      content: "Learn More",
      styles: { 
        backgroundColor: "transparent", color: "#CDB49E", padding: "12px 26px", 
        borderRadius: "8px", fontSize: "15px", fontWeight: "600", display: "inline-block",
        border: "2px solid #CDB49E", cursor: "pointer",
      },
    },
    link: {
      content: "Click here to learn more →",
      styles: { fontSize: "15px", color: "#CDB49E", textDecoration: "none", cursor: "pointer" },
    },
    list: {
      content: JSON.stringify(["First item in your list", "Second item goes here", "Third item with details", "Fourth item example"]),
      styles: { fontSize: "16px", color: "#888888", lineHeight: "1.8", marginBottom: "16px", paddingLeft: "20px" },
    },
    quote: {
      content: JSON.stringify({ text: "This is a beautiful quote that will inspire your visitors. Make it memorable.", author: "John Doe, CEO" }),
      styles: { padding: "24px 32px", borderLeft: "4px solid #CDB49E", backgroundColor: "#111", marginBottom: "24px" },
    },
    badge: {
      content: "NEW",
      styles: { 
        backgroundColor: "#CDB49E", color: "#111", padding: "4px 12px", 
        borderRadius: "20px", fontSize: "12px", fontWeight: "700", display: "inline-block", letterSpacing: "0.5px",
      },
    },

    // === MEDIA ===
    image: {
      content: "https://placehold.co/800x450/1a1a1a/666?text=Your+Image+Here",
      styles: { width: "100%", borderRadius: "12px", marginBottom: "16px" },
    },
    imageRounded: {
      content: "https://placehold.co/400x400/1a1a1a/666?text=Photo",
      styles: { width: "200px", height: "200px", borderRadius: "50%", objectFit: "cover" },
    },
    video: {
      content: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      styles: { width: "100%", aspectRatio: "16/9", borderRadius: "12px", marginBottom: "16px" },
    },
    icon: {
      content: "⚡",
      styles: { fontSize: "48px", marginBottom: "16px" },
    },
    avatar: {
      content: "https://placehold.co/100x100/CDB49E/111?text=JD",
      styles: { width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover" },
    },
    gallery: {
      content: JSON.stringify([
        "https://placehold.co/400x300/1a1a1a/666?text=1",
        "https://placehold.co/400x300/1a1a1a/666?text=2",
        "https://placehold.co/400x300/1a1a1a/666?text=3",
        "https://placehold.co/400x300/1a1a1a/666?text=4",
      ]),
      styles: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "24px" },
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
        image: "https://placehold.co/150x150/CDB49E/111?text=JD", 
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
        image: "https://placehold.co/60x60/CDB49E/111?text=SJ",
        rating: 5,
      }),
      styles: { padding: "32px", backgroundColor: "#111", borderRadius: "16px" },
    },
    statCard: {
      content: JSON.stringify({ value: "10,000+", label: "Happy Customers" }),
      styles: { padding: "32px", backgroundColor: "#111", borderRadius: "16px", textAlign: "center" },
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
      styles: { padding: "64px 32px", backgroundColor: "#0a0a0a", borderTop: "1px solid #222" },
    },
    footerSimple: {
      content: JSON.stringify({ 
        copyright: "© 2026 YourBrand. All rights reserved.",
        links: ["Privacy", "Terms", "Contact"],
      }),
      styles: { padding: "24px 32px", backgroundColor: "#0a0a0a", borderTop: "1px solid #222", textAlign: "center" },
    },

    // === SECTIONS ===
    hero: {
      content: JSON.stringify({
        badge: "✨ Now Available",
        heading: "Build Something Amazing Today",
        subheading: "Create stunning websites with our powerful visual editor. No coding skills required — just drag, drop, and publish.",
        buttonText: "Start Free Trial",
        buttonSecondary: "Watch Demo",
      }),
      styles: { padding: "100px 32px", textAlign: "center", backgroundColor: "#0a0a0a" },
    },
    heroWithImage: {
      content: JSON.stringify({
        heading: "The Modern Way to Build Websites",
        subheading: "Powerful tools for designers and developers. Ship faster with beautiful components.",
        buttonText: "Get Started Free",
        image: "https://placehold.co/600x400/1a1a1a/666?text=Product+Screenshot",
      }),
      styles: { padding: "80px 32px", backgroundColor: "#0a0a0a" },
    },
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
      styles: { padding: "80px 32px", backgroundColor: "#111111" },
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
      styles: { padding: "80px 32px", backgroundColor: "#0a0a0a" },
    },
    testimonials: {
      content: JSON.stringify({
        title: "Loved by Thousands",
        subtitle: "See what our customers are saying",
        items: [
          { quote: "Absolutely game-changing! Our productivity increased by 300%.", author: "Sarah Chen", role: "CEO, TechStart", image: "https://placehold.co/60x60/CDB49E/111?text=SC" },
          { quote: "The best investment we've made for our business this year.", author: "Mike Johnson", role: "Founder, DesignCo", image: "https://placehold.co/60x60/CDB49E/111?text=MJ" },
          { quote: "Simple, powerful, and beautiful. Everything we needed.", author: "Emma Wilson", role: "CTO, Innovate", image: "https://placehold.co/60x60/CDB49E/111?text=EW" },
        ],
      }),
      styles: { padding: "80px 32px", backgroundColor: "#111111" },
    },
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
      styles: { padding: "80px 32px", backgroundColor: "#0a0a0a" },
    },
    team: {
      content: JSON.stringify({
        title: "Meet Our Team",
        subtitle: "The people behind the product",
        members: [
          { name: "John Doe", role: "CEO & Founder", image: "https://placehold.co/200x200/CDB49E/111?text=JD" },
          { name: "Sarah Smith", role: "CTO", image: "https://placehold.co/200x200/CDB49E/111?text=SS" },
          { name: "Mike Johnson", role: "Head of Design", image: "https://placehold.co/200x200/CDB49E/111?text=MJ" },
          { name: "Emily Chen", role: "Lead Developer", image: "https://placehold.co/200x200/CDB49E/111?text=EC" },
        ],
      }),
      styles: { padding: "80px 32px", backgroundColor: "#111111" },
    },
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
      styles: { padding: "64px 32px", backgroundColor: "#0a0a0a" },
    },
    faq: {
      content: JSON.stringify({
        title: "Frequently Asked Questions",
        subtitle: "Got questions? We've got answers.",
        items: [
          { question: "How do I get started?", answer: "Simply sign up for a free account and you can start building right away. No credit card required." },
          { question: "Can I cancel anytime?", answer: "Yes! You can cancel your subscription at any time with no questions asked." },
          { question: "Do you offer refunds?", answer: "We offer a 30-day money-back guarantee if you're not satisfied." },
          { question: "Is there a free plan?", answer: "Yes, we offer a generous free tier that lets you try out all the features." },
        ],
      }),
      styles: { padding: "80px 32px", backgroundColor: "#111111" },
    },
    cta: {
      content: JSON.stringify({
        heading: "Ready to Get Started?",
        subheading: "Join thousands of happy customers and start building today.",
        buttonText: "Start Free Trial",
        buttonSecondary: "Contact Sales",
      }),
      styles: { padding: "80px 32px", textAlign: "center", backgroundColor: "#0a0a0a" },
    },
    ctaBanner: {
      content: JSON.stringify({
        heading: "Special Offer: 50% Off",
        subheading: "Limited time only. Don't miss out!",
        buttonText: "Claim Offer",
      }),
      styles: { padding: "32px", textAlign: "center", background: "linear-gradient(135deg, #CDB49E 0%, #d4c0ad 100%)" },
    },
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
      styles: { padding: "80px 32px", backgroundColor: "#111111" },
    },
    logoCloud: {
      content: JSON.stringify({
        title: "Trusted by Leading Companies",
        logos: ["Google", "Microsoft", "Apple", "Amazon", "Meta"],
      }),
      styles: { padding: "48px 32px", backgroundColor: "#0a0a0a", textAlign: "center" },
    },

    // === LAYOUT ===
    section: {
      content: "",
      styles: { padding: "64px 32px" },
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

    // === UTILITY ===
    divider: {
      content: "",
      styles: { height: "1px", backgroundColor: "#333", margin: "32px 0" },
    },
    spacer: {
      content: "",
      styles: { height: "48px" },
    },
    spacerLarge: {
      content: "",
      styles: { height: "96px" },
    },
  };
  return defaults[type] || { content: "", styles: {} };
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
}: {
  element: ElementData;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<ElementData>) => void;
  onDelete: () => void;
}) {
  const baseStyles = element.styles as React.CSSProperties;

  // Helper to parse JSON safely
  const parseData = () => {
    try { return JSON.parse(element.content || "{}"); } catch { return {}; }
  };

  // Render based on type
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

      // === MEDIA ===
      case "image":
      case "imageRounded":
        return <img src={element.content} alt="Content" style={baseStyles} className="max-w-full" />;

      case "avatar":
        return <img src={element.content} alt="Avatar" style={baseStyles} />;

      case "video":
        return <iframe src={element.content} style={baseStyles} allowFullScreen className="border-0" />;

      case "gallery": {
        const images = parseData();
        return (
          <div style={baseStyles}>
            {(Array.isArray(images) ? images : []).map((src: string, i: number) => (
              <img key={i} src={src} alt="" style={{ width: "100%", borderRadius: "8px" }} />
            ))}
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
            <img src={data.image} alt="" style={{ width: "100px", height: "100px", borderRadius: "50%", margin: "0 auto 16px" }} />
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
            <div style={{ fontSize: "42px", fontWeight: "700", color: "#fff" }}>{data.price}<span style={{ fontSize: "16px", color: "#888" }}>{data.period}</span></div>
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
            <div style={{ display: "flex", marginBottom: "12px" }}>{"★".repeat(data.rating || 5)}</div>
            <div style={{ fontSize: "16px", color: "#ccc", fontStyle: "italic", marginBottom: "16px" }}>"{data.quote}"</div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img src={data.image} alt="" style={{ width: "48px", height: "48px", borderRadius: "50%" }} />
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
            <div style={{ fontSize: "42px", fontWeight: "700", color: "#CDB49E" }}>{data.value}</div>
            <div style={{ fontSize: "14px", color: "#888" }}>{data.label}</div>
          </div>
        );
      }

      // === NAVIGATION ===
      case "navbar":
      case "navbarDark": {
        const data = parseData();
        return (
          <nav style={{ ...baseStyles, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#CDB49E" }}>{data.logo}</div>
            <div style={{ display: "flex", gap: "32px" }}>
              {(data.links || []).map((link: string, i: number) => (
                <span key={i} style={{ fontSize: "14px", color: "#888", cursor: "pointer" }}>{link}</span>
              ))}
            </div>
            <div style={{ padding: "10px 20px", backgroundColor: "#CDB49E", color: "#111", borderRadius: "8px", fontWeight: "600", fontSize: "14px" }}>{data.buttonText}</div>
          </nav>
        );
      }

      case "footer": {
        const data = parseData();
        return (
          <footer style={baseStyles}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "48px", marginBottom: "48px" }}>
              <div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#CDB49E", marginBottom: "16px" }}>{data.logo}</div>
                <div style={{ fontSize: "14px", color: "#888" }}>{data.description}</div>
              </div>
              {(data.columns || []).map((col: any, i: number) => (
                <div key={i}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>{col.title}</div>
                  {(col.links || []).map((link: string, j: number) => (
                    <div key={j} style={{ fontSize: "13px", color: "#888", marginBottom: "8px", cursor: "pointer" }}>{link}</div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid #222", paddingTop: "24px", textAlign: "center", fontSize: "13px", color: "#666" }}>{data.copyright}</div>
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
            <div style={{ fontSize: "13px", color: "#666" }}>{data.copyright}</div>
          </footer>
        );
      }

      // === SECTIONS ===
      case "hero": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            {data.badge && <span style={{ display: "inline-block", padding: "6px 16px", backgroundColor: "#CDB49E20", color: "#CDB49E", borderRadius: "20px", fontSize: "13px", marginBottom: "24px" }}>{data.badge}</span>}
            <InlineEditor value={data.heading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, heading: v }) })} style={{ fontSize: "52px", fontWeight: "700", color: "#fff", marginBottom: "20px", lineHeight: "1.1" }} />
            <InlineEditor value={data.subheading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, subheading: v }) })} style={{ fontSize: "18px", color: "#888", marginBottom: "36px", maxWidth: "600px", margin: "0 auto 36px", lineHeight: "1.6" }} />
            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              <div style={{ padding: "16px 32px", backgroundColor: "#CDB49E", color: "#111", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}>{data.buttonText}</div>
              {data.buttonSecondary && <div style={{ padding: "16px 32px", border: "2px solid #333", color: "#fff", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}>{data.buttonSecondary}</div>}
            </div>
          </div>
        );
      }

      case "heroWithImage": {
        const data = parseData();
        return (
          <div style={{ ...baseStyles, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }}>
            <div>
              <InlineEditor value={data.heading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, heading: v }) })} style={{ fontSize: "44px", fontWeight: "700", color: "#fff", marginBottom: "20px", lineHeight: "1.1" }} />
              <InlineEditor value={data.subheading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, subheading: v }) })} style={{ fontSize: "17px", color: "#888", marginBottom: "32px", lineHeight: "1.6" }} />
              <div style={{ padding: "16px 32px", backgroundColor: "#CDB49E", color: "#111", borderRadius: "10px", fontWeight: "600", display: "inline-block", cursor: "pointer" }}>{data.buttonText}</div>
            </div>
            <img src={data.image} alt="" style={{ width: "100%", borderRadius: "16px" }} />
          </div>
        );
      }

      case "features3":
      case "features4": {
        const data = parseData();
        const cols = element.type === "features4" ? 4 : 3;
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.title || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, title: v }) })} style={{ fontSize: "36px", fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: "16px" }} />
            <div style={{ fontSize: "16px", color: "#888", textAlign: "center", marginBottom: "48px" }}>{data.subtitle}</div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "24px" }}>
              {(data.items || []).map((item: any, i: number) => (
                <div key={i} style={{ padding: "32px", backgroundColor: "#0a0a0a", borderRadius: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: "40px", marginBottom: "16px" }}>{item.icon}</div>
                  <div style={{ fontSize: "18px", fontWeight: "600", color: "#fff", marginBottom: "8px" }}>{item.title}</div>
                  <div style={{ fontSize: "14px", color: "#888", lineHeight: "1.5" }}>{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "testimonials": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.title || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, title: v }) })} style={{ fontSize: "36px", fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: "16px" }} />
            <div style={{ fontSize: "16px", color: "#888", textAlign: "center", marginBottom: "48px" }}>{data.subtitle}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
              {(data.items || []).map((item: any, i: number) => (
                <div key={i} style={{ padding: "32px", backgroundColor: "#0a0a0a", borderRadius: "16px" }}>
                  <div style={{ fontSize: "15px", color: "#ccc", fontStyle: "italic", marginBottom: "24px", lineHeight: "1.6" }}>"{item.quote}"</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img src={item.image} alt="" style={{ width: "48px", height: "48px", borderRadius: "50%" }} />
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

      case "pricing3": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.title || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, title: v }) })} style={{ fontSize: "36px", fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: "16px" }} />
            <div style={{ fontSize: "16px", color: "#888", textAlign: "center", marginBottom: "48px" }}>{data.subtitle}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
              {(data.plans || []).map((plan: any, i: number) => (
                <div key={i} style={{ padding: "32px", backgroundColor: "#111", borderRadius: "16px", textAlign: "center", border: plan.popular ? "2px solid #CDB49E" : "1px solid #222" }}>
                  {plan.popular && <span style={{ display: "inline-block", padding: "4px 12px", backgroundColor: "#CDB49E", color: "#111", borderRadius: "20px", fontSize: "11px", fontWeight: "700", marginBottom: "16px" }}>POPULAR</span>}
                  <div style={{ fontSize: "20px", fontWeight: "600", color: "#fff", marginBottom: "8px" }}>{plan.name}</div>
                  <div style={{ fontSize: "42px", fontWeight: "700", color: "#fff" }}>{plan.price}<span style={{ fontSize: "14px", color: "#888" }}>{plan.period}</span></div>
                  <ul style={{ margin: "24px 0", padding: "0", listStyle: "none", textAlign: "left" }}>
                    {(plan.features || []).map((f: string, j: number) => <li key={j} style={{ padding: "10px 0", color: "#888", borderBottom: "1px solid #222" }}>✓ {f}</li>)}
                  </ul>
                  <div style={{ padding: "14px", backgroundColor: plan.popular ? "#CDB49E" : "transparent", color: plan.popular ? "#111" : "#CDB49E", border: plan.popular ? "none" : "2px solid #CDB49E", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>{plan.buttonText}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "team": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.title || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, title: v }) })} style={{ fontSize: "36px", fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: "16px" }} />
            <div style={{ fontSize: "16px", color: "#888", textAlign: "center", marginBottom: "48px" }}>{data.subtitle}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
              {(data.members || []).map((member: any, i: number) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <img src={member.image} alt="" style={{ width: "150px", height: "150px", borderRadius: "50%", margin: "0 auto 16px", objectFit: "cover" }} />
                  <div style={{ fontSize: "16px", fontWeight: "600", color: "#fff" }}>{member.name}</div>
                  <div style={{ fontSize: "13px", color: "#CDB49E" }}>{member.role}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "stats": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            {data.title && <div style={{ fontSize: "14px", color: "#888", textAlign: "center", marginBottom: "32px", textTransform: "uppercase", letterSpacing: "2px" }}>{data.title}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "32px", textAlign: "center" }}>
              {(data.items || []).map((item: any, i: number) => (
                <div key={i}>
                  <div style={{ fontSize: "48px", fontWeight: "700", color: "#CDB49E" }}>{item.value}</div>
                  <div style={{ fontSize: "14px", color: "#888" }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "faq": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.title || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, title: v }) })} style={{ fontSize: "36px", fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: "16px" }} />
            <div style={{ fontSize: "16px", color: "#888", textAlign: "center", marginBottom: "48px" }}>{data.subtitle}</div>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              {(data.items || []).map((item: any, i: number) => (
                <div key={i} style={{ padding: "24px 0", borderBottom: "1px solid #222" }}>
                  <div style={{ fontSize: "18px", fontWeight: "600", color: "#fff", marginBottom: "12px" }}>{item.question}</div>
                  <div style={{ fontSize: "15px", color: "#888", lineHeight: "1.6" }}>{item.answer}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "cta": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.heading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, heading: v }) })} style={{ fontSize: "40px", fontWeight: "700", color: "#fff", marginBottom: "16px" }} />
            <InlineEditor value={data.subheading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, subheading: v }) })} style={{ fontSize: "17px", color: "#888", marginBottom: "36px", maxWidth: "500px", margin: "0 auto 36px" }} />
            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              <div style={{ padding: "16px 32px", backgroundColor: "#CDB49E", color: "#111", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}>{data.buttonText}</div>
              {data.buttonSecondary && <div style={{ padding: "16px 32px", border: "2px solid #333", color: "#fff", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}>{data.buttonSecondary}</div>}
            </div>
          </div>
        );
      }

      case "ctaBanner": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <InlineEditor value={data.heading || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, heading: v }) })} style={{ fontSize: "28px", fontWeight: "700", color: "#111", marginBottom: "8px" }} />
            <div style={{ fontSize: "15px", color: "#333", marginBottom: "20px" }}>{data.subheading}</div>
            <div style={{ padding: "12px 28px", backgroundColor: "#111", color: "#fff", borderRadius: "8px", fontWeight: "600", display: "inline-block", cursor: "pointer" }}>{data.buttonText}</div>
          </div>
        );
      }

      case "contact": {
        const data = parseData();
        return (
          <div style={{ ...baseStyles, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px" }}>
            <div>
              <InlineEditor value={data.title || ""} onChange={(v) => onUpdate({ content: JSON.stringify({ ...data, title: v }) })} style={{ fontSize: "36px", fontWeight: "700", color: "#fff", marginBottom: "16px" }} />
              <div style={{ fontSize: "16px", color: "#888", marginBottom: "32px" }}>{data.subtitle}</div>
              <div style={{ fontSize: "14px", color: "#888", marginBottom: "12px" }}>📧 {data.email}</div>
              <div style={{ fontSize: "14px", color: "#888", marginBottom: "12px" }}>📞 {data.phone}</div>
              <div style={{ fontSize: "14px", color: "#888" }}>📍 {data.address}</div>
            </div>
            <div style={{ backgroundColor: "#0a0a0a", padding: "32px", borderRadius: "16px" }}>
              {(data.formFields || []).map((field: string, i: number) => (
                <div key={i} style={{ marginBottom: "16px" }}>
                  <label style={{ fontSize: "13px", color: "#888", marginBottom: "6px", display: "block" }}>{field}</label>
                  <input type={field === "Email" ? "email" : "text"} placeholder={field} style={{ width: "100%", padding: "12px 16px", backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px", color: "#fff", fontSize: "14px" }} />
                </div>
              ))}
              <div style={{ padding: "14px", backgroundColor: "#CDB49E", color: "#111", borderRadius: "8px", fontWeight: "600", textAlign: "center", cursor: "pointer", marginTop: "8px" }}>{data.buttonText}</div>
            </div>
          </div>
        );
      }

      case "logoCloud": {
        const data = parseData();
        return (
          <div style={baseStyles}>
            <div style={{ fontSize: "13px", color: "#666", marginBottom: "24px", textTransform: "uppercase", letterSpacing: "2px" }}>{data.title}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: "48px", flexWrap: "wrap" }}>
              {(data.logos || []).map((logo: string, i: number) => (
                <span key={i} style={{ fontSize: "18px", color: "#555", fontWeight: "600" }}>{logo}</span>
              ))}
            </div>
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
      {/* Element Actions */}
      {isSelected && (
        <div className="absolute -top-8 left-0 flex items-center gap-1 bg-[#1a1a1a] rounded-lg p-1 shadow-lg border border-[#333] z-10">
          <span className="text-[10px] text-[#888] px-2 capitalize">{element.type}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 text-[#666] hover:text-red-400 rounded"
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
  const isSectionElement = ["hero", "heroWithImage", "features3", "features4", "testimonials", "pricing3", "team", "stats", "faq", "cta", "ctaBanner", "contact", "logoCloud", "navbar", "navbarDark", "footer", "footerSimple"].includes(element.type);

  return (
    <div className="flex-1 overflow-auto flex flex-col">
      {/* Element Info */}
      <div className="p-4 border-b border-[#222] flex items-center justify-between shrink-0">
        <span className="text-xs px-2 py-1 rounded-full bg-[#CDB49E]/10 text-[#CDB49E] font-medium capitalize">
          {element.type}
        </span>
        <button onClick={onDelete} className="p-1.5 text-[#666] hover:text-red-400 rounded">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
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
            {/* Typography - for text elements */}
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
                  <label className="text-xs text-[#888] mb-1 block">Line Height</label>
                  <input type="text" value={styles.lineHeight || "1.5"} onChange={(e) => onStyleChange("lineHeight", e.target.value)} placeholder="e.g., 1.5 or 24px" className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
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

                <div>
                  <label className="text-xs text-[#888] mb-1 block">Letter Spacing</label>
                  <input type="text" value={styles.letterSpacing || "0"} onChange={(e) => onStyleChange("letterSpacing", e.target.value)} placeholder="e.g., 1px or 0.5em" className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
                </div>

                <div>
                  <label className="text-xs text-[#888] mb-1 block">Text Transform</label>
                  <select value={styles.textTransform || "none"} onChange={(e) => onStyleChange("textTransform", e.target.value)} className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
                    <option value="none">None</option>
                    <option value="uppercase">UPPERCASE</option>
                    <option value="lowercase">lowercase</option>
                    <option value="capitalize">Capitalize</option>
                  </select>
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
                  <input type="text" value={styles.backgroundColor || "transparent"} onChange={(e) => onStyleChange("backgroundColor", e.target.value)} className="flex-1 px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white font-mono" />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#888] mb-1 block">Gradient (optional)</label>
                <input type="text" value={styles.background || ""} onChange={(e) => onStyleChange("background", e.target.value)} placeholder="linear-gradient(135deg, #6366f1, #8b5cf6)" className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white font-mono text-[11px]" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { c: "#0a0a0a", l: "Dark" },
                  { c: "#111111", l: "Gray" },
                  { c: "#CDB49E", l: "Gold" },
                  { c: "linear-gradient(135deg, #6366f1, #8b5cf6)", l: "Purple" },
                ].map((preset) => (
                  <button key={preset.l} onClick={() => onStyleChange(preset.c.includes("gradient") ? "background" : "backgroundColor", preset.c)} className="p-2 rounded border border-[#333] hover:border-[#CDB49E] text-[10px] text-[#888]" style={{ background: preset.c }}>
                    {preset.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Border */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Border</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Width</label>
                  <input type="text" value={styles.borderWidth || "0"} onChange={(e) => onStyleChange("borderWidth", e.target.value)} placeholder="e.g., 1px" className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
                </div>
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Style</label>
                  <select value={styles.borderStyle || "solid"} onChange={(e) => onStyleChange("borderStyle", e.target.value)} className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
                    <option value="none">None</option>
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-[#888] mb-1 block">Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={styles.borderColor || "#333333"} onChange={(e) => onStyleChange("borderColor", e.target.value)} className="w-10 h-10 rounded border border-[#333] bg-transparent cursor-pointer" />
                  <input type="text" value={styles.borderColor || "#333333"} onChange={(e) => onStyleChange("borderColor", e.target.value)} className="flex-1 px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white font-mono" />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#888] mb-1 block">Radius</label>
                <div className="flex items-center gap-2">
                  <input type="range" min="0" max="100" value={parseInt(styles.borderRadius || "0")} onChange={(e) => onStyleChange("borderRadius", e.target.value + "px")} className="flex-1 accent-[#CDB49E]" />
                  <input type="number" value={parseInt(styles.borderRadius || "0")} onChange={(e) => onStyleChange("borderRadius", e.target.value + "px")} className="w-16 px-2 py-1 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white text-center" />
                </div>
              </div>
            </div>

            {/* Media Size */}
            {isMediaElement && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#555] uppercase">Size</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#888] mb-1 block">Width</label>
                    <input type="text" value={styles.width || "100%"} onChange={(e) => onStyleChange("width", e.target.value)} placeholder="100% or 500px" className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="text-xs text-[#888] mb-1 block">Height</label>
                    <input type="text" value={styles.height || "auto"} onChange={(e) => onStyleChange("height", e.target.value)} placeholder="auto or 300px" className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Object Fit</label>
                  <select value={styles.objectFit || "cover"} onChange={(e) => onStyleChange("objectFit", e.target.value)} className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="fill">Fill</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "layout" && (
          <>
            {/* Spacing */}
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
                <div>
                  <label className="text-[10px] text-[#666] mb-1 block">Bottom</label>
                  <input type="text" value={styles.paddingBottom || ""} onChange={(e) => onStyleChange("paddingBottom", e.target.value)} placeholder="0" className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-[#666] mb-1 block">Left / Right</label>
                  <input type="text" value={styles.paddingLeft || ""} onChange={(e) => { onStyleChange("paddingLeft", e.target.value); onStyleChange("paddingRight", e.target.value); }} placeholder="0" className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white" />
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
                  <label className="text-[10px] text-[#666] mb-1 block">Top</label>
                  <input type="text" value={styles.marginTop || ""} onChange={(e) => onStyleChange("marginTop", e.target.value)} placeholder="0" className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-[#666] mb-1 block">Bottom</label>
                  <input type="text" value={styles.marginBottom || ""} onChange={(e) => onStyleChange("marginBottom", e.target.value)} placeholder="0" className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-[#666] mb-1 block">Auto Center</label>
                  <button onClick={() => onStyleChange("margin", "0 auto")} className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#333] rounded text-[#888] hover:text-white hover:border-[#CDB49E]">Center</button>
                </div>
              </div>
            </div>

            {/* Size */}
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
            </div>

            {/* Display */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Display</h4>
              <select value={styles.display || "block"} onChange={(e) => onStyleChange("display", e.target.value)} className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
                <option value="block">Block</option>
                <option value="inline-block">Inline Block</option>
                <option value="flex">Flex</option>
                <option value="grid">Grid</option>
                <option value="none">None (Hidden)</option>
              </select>
            </div>
          </>
        )}

        {activeTab === "effects" && (
          <>
            {/* Shadow */}
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
              <input type="text" value={styles.boxShadow || ""} onChange={(e) => onStyleChange("boxShadow", e.target.value)} placeholder="Custom shadow CSS" className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white font-mono text-[11px]" />
            </div>

            {/* Opacity */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Opacity</h4>
              <div className="flex items-center gap-2">
                <input type="range" min="0" max="100" value={parseFloat(styles.opacity || "1") * 100} onChange={(e) => onStyleChange("opacity", String(Number(e.target.value) / 100))} className="flex-1 accent-[#CDB49E]" />
                <span className="text-xs text-white w-12">{Math.round(parseFloat(styles.opacity || "1") * 100)}%</span>
              </div>
            </div>

            {/* Transform */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Transform</h4>
              <div>
                <label className="text-xs text-[#888] mb-1 block">Rotate</label>
                <div className="flex items-center gap-2">
                  <input type="range" min="-180" max="180" value={parseInt(styles.transform?.match(/rotate\(([-\d]+)/)?.[1] || "0")} onChange={(e) => onStyleChange("transform", `rotate(${e.target.value}deg)`)} className="flex-1 accent-[#CDB49E]" />
                  <span className="text-xs text-white w-12">{styles.transform?.match(/rotate\(([-\d]+)/)?.[1] || "0"}°</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-[#888] mb-1 block">Scale</label>
                <div className="flex items-center gap-2">
                  <input type="range" min="50" max="150" value={(parseFloat(styles.transform?.match(/scale\(([\d.]+)/)?.[1] || "1") * 100)} onChange={(e) => onStyleChange("transform", `scale(${Number(e.target.value) / 100})`)} className="flex-1 accent-[#CDB49E]" />
                  <span className="text-xs text-white w-12">{Math.round((parseFloat(styles.transform?.match(/scale\(([\d.]+)/)?.[1] || "1") * 100))}%</span>
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Filters</h4>
              <div>
                <label className="text-xs text-[#888] mb-1 block">Blur</label>
                <div className="flex items-center gap-2">
                  <input type="range" min="0" max="20" value={parseInt(styles.filter?.match(/blur\((\d+)/)?.[1] || "0")} onChange={(e) => onStyleChange("filter", `blur(${e.target.value}px)`)} className="flex-1 accent-[#CDB49E]" />
                  <span className="text-xs text-white w-12">{styles.filter?.match(/blur\((\d+)/)?.[1] || "0"}px</span>
                </div>
              </div>
            </div>

            {/* Cursor */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#555] uppercase">Cursor</h4>
              <select value={styles.cursor || "default"} onChange={(e) => onStyleChange("cursor", e.target.value)} className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white">
                <option value="default">Default</option>
                <option value="pointer">Pointer (Hand)</option>
                <option value="text">Text</option>
                <option value="move">Move</option>
                <option value="not-allowed">Not Allowed</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── COMPONENTS PANEL ─────────────────────────── */

function ComponentsPanel({
  onAdd,
}: {
  onAdd: (type: string) => void;
}) {
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

/* ─────────────────────────── PAGES PANEL ─────────────────────────── */

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

/* ─────────────────────────── LAYERS PANEL ─────────────────────────── */

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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Get element details for display
  const getElementDetails = (el: ElementData) => {
    try {
      const data = JSON.parse(el.content || "{}");
      if (data.heading) return data.heading.substring(0, 30);
      if (data.title) return data.title.substring(0, 30);
      if (data.text) return data.text.substring(0, 30);
      if (typeof el.content === "string" && !el.content.startsWith("{")) {
        return el.content.substring(0, 30);
      }
    } catch {}
    return null;
  };

  // Check if element has nested content
  const hasNestedContent = (el: ElementData) => {
    try {
      const data = JSON.parse(el.content || "{}");
      return data.items || data.plans || data.members || data.columns || data.links;
    } catch {}
    return false;
  };

  // Get nested items
  const getNestedItems = (el: ElementData) => {
    try {
      const data = JSON.parse(el.content || "{}");
      if (data.items) return data.items.map((i: any) => ({ type: "item", label: i.title || i.question || i.value || "Item" }));
      if (data.plans) return data.plans.map((p: any) => ({ type: "plan", label: p.name }));
      if (data.members) return data.members.map((m: any) => ({ type: "member", label: m.name }));
      if (data.links) return data.links.map((l: string) => ({ type: "link", label: l }));
    } catch {}
    return [];
  };

  if (elements.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <Layers className="w-10 h-10 text-[#333] mx-auto mb-3" />
          <p className="text-xs text-[#666]">No elements yet</p>
          <p className="text-[10px] text-[#555]">Add components from the left panel</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-2">
      {elements.map((el, index) => {
        const hasNested = hasNestedContent(el);
        const isExpanded = expandedIds.has(el.id);
        const nestedItems = isExpanded ? getNestedItems(el) : [];
        const details = getElementDetails(el);

        return (
          <div key={el.id} className="mb-1">
            <div
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
                "group flex items-center gap-1.5 p-2 rounded-lg cursor-pointer transition-colors",
                selectedId === el.id
                  ? "bg-[#CDB49E]/10 border border-[#CDB49E]/30"
                  : "hover:bg-[#1a1a1a] border border-transparent",
                el.hidden && "opacity-40"
              )}
            >
              {hasNested ? (
                <button onClick={(e) => { e.stopPropagation(); toggleExpanded(el.id); }} className="p-0.5 text-[#555] hover:text-white">
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
              ) : (
                <GripVertical className="w-3 h-3 text-[#444] cursor-grab" />
              )}
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
            {/* Nested items */}
            {isExpanded && nestedItems.length > 0 && (
              <div className="ml-6 mt-1 space-y-0.5">
                {nestedItems.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-1.5 rounded text-[10px] text-[#666] bg-[#0a0a0a]">
                    <span className="w-4 h-4 flex items-center justify-center rounded bg-[#1a1a1a] text-[#555]">
                      {item.type === "item" ? "•" : item.type === "plan" ? "$" : item.type === "member" ? "👤" : "→"}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

// Page type for multi-page support
interface PageType {
  id: string;
  name: string;
  slug: string;
  elements: ElementData[];
}

const STORAGE_KEY = "atlas-website-builder";

export default function WebsitePage() {
  // View state
  const [view, setView] = useState<"templates" | "editor" | "preview">("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Multi-page state
  const [pages, setPages] = useState<PageType[]>([
    { id: "page-home", name: "Home", slug: "/", elements: [] }
  ]);
  const [currentPageId, setCurrentPageId] = useState("page-home");
  
  // Get current page elements
  const currentPage = pages.find(p => p.id === currentPageId) || pages[0];
  const elements = currentPage?.elements || [];
  
  // Set elements for current page
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
  
  // UI state
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [leftPanel, setLeftPanel] = useState<"components" | "layers" | "pages">("components");
  const [zoom, setZoom] = useState(100);
  const [showPanels, setShowPanels] = useState({ left: true, right: true });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // History for undo/redo
  const [history, setHistory] = useState<{ past: ElementData[][]; future: ElementData[][] }>({ past: [], future: [] });

  // Get selected element
  const selectedElement = elements.find(el => el.id === selectedElementId) || null;

  // Load from localStorage on mount
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
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
  }, []);

  // Save to localStorage
  const handleSave = useCallback(() => {
    setIsSaving(true);
    const data = {
      pages,
      currentPageId,
      template: selectedTemplate,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setLastSaved(new Date());
    setTimeout(() => setIsSaving(false), 500);
  }, [pages, currentPageId, selectedTemplate]);

  // Auto-save every 30 seconds when in editor
  useEffect(() => {
    if (view === "editor" && elements.length > 0) {
      const interval = setInterval(handleSave, 30000);
      return () => clearInterval(interval);
    }
  }, [view, elements.length, handleSave]);

  // Add new page
  const handleAddPage = useCallback(() => {
    const pageNum = pages.length + 1;
    const newPage: PageType = {
      id: `page-${Date.now()}`,
      name: `Page ${pageNum}`,
      slug: `/page-${pageNum}`,
      elements: [],
    };
    setPages(prev => [...prev, newPage]);
    setCurrentPageId(newPage.id);
  }, [pages.length]);

  // Delete page
  const handleDeletePage = useCallback((pageId: string) => {
    if (pages.length <= 1) return; // Keep at least one page
    setPages(prev => prev.filter(p => p.id !== pageId));
    if (currentPageId === pageId) {
      setCurrentPageId(pages[0].id);
    }
  }, [pages, currentPageId]);

  // Rename page
  const handleRenamePage = useCallback((pageId: string, newName: string) => {
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, name: newName } : p));
  }, []);

  // Save to history before changes
  const saveHistory = useCallback(() => {
    setHistory(h => ({
      past: [...h.past.slice(-20), elements],
      future: [],
    }));
  }, [elements]);

  // Add element - FUNCTIONAL
  const handleAddElement = useCallback((type: string) => {
    saveHistory();
    const defaults = getDefaultElement(type);
    const newElement: ElementData = {
      id: `el-${Date.now()}`,
      type,
      content: defaults.content || "",
      styles: defaults.styles || {},
    };
    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  }, [saveHistory]);

  // Update element - FUNCTIONAL
  const handleUpdateElement = useCallback((id: string, updates: Partial<ElementData>) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  }, []);

  // Update element style - FUNCTIONAL
  const handleStyleChange = useCallback((key: string, value: string) => {
    if (!selectedElementId) return;
    saveHistory();
    setElements(prev => prev.map(el => 
      el.id === selectedElementId 
        ? { ...el, styles: { ...el.styles, [key]: value } }
        : el
    ));
  }, [selectedElementId, saveHistory]);

  // Delete element - FUNCTIONAL
  const handleDeleteElement = useCallback((id: string) => {
    saveHistory();
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  }, [selectedElementId, saveHistory]);

  // Reorder elements - FUNCTIONAL
  const handleReorderElements = useCallback((fromIndex: number, toIndex: number) => {
    saveHistory();
    setElements(prev => {
      const newElements = [...prev];
      const [moved] = newElements.splice(fromIndex, 1);
      newElements.splice(toIndex, 0, moved);
      return newElements;
    });
  }, [saveHistory]);

  // Toggle hidden - FUNCTIONAL
  const handleToggleHidden = useCallback((id: string) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, hidden: !el.hidden } : el
    ));
  }, []);

  // Undo/Redo
  const undo = useCallback(() => {
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    setHistory(h => ({
      past: h.past.slice(0, -1),
      future: [elements, ...h.future],
    }));
    setElements(previous);
  }, [history, elements]);

  const redo = useCallback(() => {
    if (history.future.length === 0) return;
    const next = history.future[0];
    setHistory(h => ({
      past: [...h.past, elements],
      future: h.future.slice(1),
    }));
    setElements(next);
  }, [history, elements]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedElementId && document.activeElement?.tagName !== "INPUT") {
          handleDeleteElement(selectedElementId);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, selectedElementId, handleDeleteElement]);

  // Initialize with starter content
  useEffect(() => {
    if (selectedTemplate && view === "editor" && elements.length === 0) {
      const starterElements: ElementData[] = [
        {
          id: "el-hero",
          type: "hero",
          content: JSON.stringify({
            heading: "Build Something Amazing",
            subheading: "Create stunning websites with our visual editor. No coding required.",
            buttonText: "Get Started",
          }),
          styles: { padding: "80px 32px", textAlign: "center", backgroundColor: "#0a0a0a" },
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
          styles: { padding: "80px 32px", backgroundColor: "#111111" },
        },
        {
          id: "el-cta",
          type: "cta",
          content: JSON.stringify({
            heading: "Ready to Get Started?",
            subheading: "Join thousands of happy customers today.",
            buttonText: "Start Free Trial",
          }),
          styles: { padding: "64px 32px", textAlign: "center", backgroundColor: "#0a0a0a" },
        },
      ];
      setElements(starterElements);
    }
  }, [selectedTemplate, view, elements.length]);

  // ─────────────────────────── TEMPLATE GALLERY ───────────────────────────

  if (view === "templates") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CDB49E]/10 text-[#CDB49E] text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Website Builder
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Choose a Template</h1>
            <p className="text-lg text-[#888]">Start with a template or blank canvas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  onClick={() => { setSelectedTemplate(template.id); setView("editor"); }}
                  className="group relative bg-[#111] border border-[#2a2a2a] rounded-2xl overflow-hidden hover:border-[#CDB49E]/50 transition-all cursor-pointer"
                >
                  <div className="h-32" style={{ background: template.preview }}>
                    {template.popular && (
                      <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-amber-500 text-[10px] font-bold text-black">
                        POPULAR
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#CDB49E]/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#CDB49E]" />
                    </div>
                    <span className="text-sm font-semibold text-white">{template.name}</span>
                  </div>
                </div>
              );
            })}

            {/* Blank */}
            <div
              onClick={() => { setSelectedTemplate("blank"); setView("editor"); }}
              className="bg-[#111] border-2 border-dashed border-[#333] rounded-2xl flex flex-col items-center justify-center min-h-[180px] hover:border-[#CDB49E]/50 transition-all cursor-pointer"
            >
              <Plus className="w-10 h-10 text-[#444] mb-2" />
              <span className="text-sm text-[#666]">Start Blank</span>
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
        {/* Preview Toolbar */}
        <div className="fixed top-0 left-0 right-0 h-12 bg-[#111]/95 backdrop-blur border-b border-[#222] flex items-center justify-between px-4 z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => setView("editor")} className="text-sm text-[#888] hover:text-white flex items-center gap-1">
              <ChevronRight className="w-4 h-4 rotate-180" /> Back to Editor
            </button>
            <span className="text-xs text-[#555]">Preview Mode</span>
          </div>
          <div className="flex items-center gap-2">
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
        {/* Preview Content */}
        <div className="pt-12 flex justify-center">
          <div className={cn(
            "bg-[#0a0a0a] min-h-screen",
            devicePreview === "desktop" && "w-full",
            devicePreview === "tablet" && "w-[768px]",
            devicePreview === "mobile" && "w-[375px]"
          )}>
            {elements.map((element) => (
              !element.hidden && (
                <div key={element.id} style={element.styles as React.CSSProperties}>
                  <ElementRenderer
                    element={element}
                    isSelected={false}
                    onSelect={() => {}}
                    onUpdate={() => {}}
                    onDelete={() => {}}
                  />
                </div>
              )
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
            <ChevronRight className="w-4 h-4 rotate-180" /> Back
          </button>
          <div className="h-5 w-px bg-[#333]" />
          <div className="flex items-center gap-1">
            <button onClick={undo} disabled={history.past.length === 0} className="p-1.5 text-[#666] hover:text-white disabled:opacity-30" title="Undo">
              <Undo2 className="w-4 h-4" />
            </button>
            <button onClick={redo} disabled={history.future.length === 0} className="p-1.5 text-[#666] hover:text-white disabled:opacity-30" title="Redo">
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-[#555]">{elements.length} elements</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
            <button onClick={() => setZoom(Math.max(50, zoom - 25))} className="text-[#888] hover:text-white">
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-xs text-white w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(150, zoom + 25))} className="text-[#888] hover:text-white">
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          {/* Device */}
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
          {/* Save */}
          <button 
            onClick={handleSave} 
            className={cn("px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors", isSaving ? "bg-emerald-600 text-white" : "text-[#888] hover:text-white border border-[#333] hover:border-[#444]")}
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save"}
          </button>
          {lastSaved && <span className="text-[10px] text-[#555]">Saved {lastSaved.toLocaleTimeString()}</span>}
          {/* Preview */}
          <button onClick={() => setView("preview")} className="px-3 py-1.5 text-sm text-[#888] hover:text-white border border-[#333] rounded-lg flex items-center gap-2 hover:border-[#444]">
            <Eye className="w-4 h-4" /> Preview
          </button>
          {/* Publish */}
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
              devicePreview === "desktop" && "w-full max-w-4xl",
              devicePreview === "tablet" && "w-[768px]",
              devicePreview === "mobile" && "w-[375px]"
            )}
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          >
            {elements.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
                <Plus className="w-16 h-16 text-[#333] mb-4" />
                <p className="text-[#666] mb-2">Your canvas is empty</p>
                <p className="text-xs text-[#555]">Add components from the left panel to get started</p>
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
