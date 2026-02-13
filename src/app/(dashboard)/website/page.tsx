"use client";

import { useEffect, useState } from "react";
import { useWebsiteStore, BlockType } from "@/stores/website-store";
import {
  Globe, Plus, Eye, EyeOff, Trash2, Copy, GripVertical, Layout, Type, Image, Users, DollarSign,
  MessageSquare, Mail, Grid, Star, Zap, ExternalLink, Palette, FileText, Home, Monitor, Smartphone,
  Tablet, Check, ChevronRight, Sparkles, Settings2, Paintbrush, LayoutTemplate, X, Rocket, Link2,
  Shield, BarChart3, Search, ImageIcon, Layers, RefreshCw, Upload, CheckCircle, ArrowRight,
  Building2, Briefcase, ShoppingBag, Camera, Utensils, GraduationCap, Dumbbell, Phone, MapPin,
  Clock, Facebook, Twitter, Instagram, Linkedin, Youtube, Menu, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════ COMPLETE WEBSITE TEMPLATES ═══════════════════════ */

const TEMPLATES = [
  {
    id: "saas-analytics",
    name: "DataPulse Analytics",
    category: "SaaS",
    icon: BarChart3,
    description: "Analytics SaaS platform - ready to launch",
    preview: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    popular: true,
    content: {
      brand: { name: "DataPulse", tagline: "Analytics that drive growth" },
      hero: {
        headline: "Turn Data Into Decisions",
        subheadline: "Real-time analytics, AI-powered insights, and beautiful dashboards that help you grow faster.",
        cta: "Start Free Trial",
        secondaryCta: "Watch Demo",
      },
      features: [
        { icon: "📊", title: "Real-time Dashboards", desc: "See your metrics update live with zero lag" },
        { icon: "🤖", title: "AI Insights", desc: "Get automated recommendations based on your data" },
        { icon: "🔗", title: "300+ Integrations", desc: "Connect all your tools in minutes" },
        { icon: "🔒", title: "Enterprise Security", desc: "SOC2 compliant with end-to-end encryption" },
        { icon: "📱", title: "Mobile App", desc: "Track your KPIs from anywhere" },
        { icon: "👥", title: "Team Collaboration", desc: "Share reports and dashboards with your team" },
      ],
      pricing: [
        { name: "Starter", price: 29, period: "mo", features: ["5 Users", "10 Dashboards", "30-day data", "Email support"], cta: "Start Free" },
        { name: "Professional", price: 99, period: "mo", features: ["25 Users", "Unlimited Dashboards", "1-year data", "AI Insights", "Priority support"], popular: true, cta: "Start Free Trial" },
        { name: "Enterprise", price: 299, period: "mo", features: ["Unlimited Users", "Custom Dashboards", "Unlimited data", "Dedicated manager", "SLA guarantee"], cta: "Contact Sales" },
      ],
      testimonials: [
        { quote: "DataPulse helped us increase revenue by 47% in 3 months. The AI insights are game-changing.", name: "Sarah Chen", role: "VP of Growth", company: "TechFlow Inc", avatar: "SC" },
        { quote: "Finally, analytics that our whole team actually uses. The UI is incredible.", name: "Marcus Johnson", role: "CEO", company: "ScaleUp Labs", avatar: "MJ" },
      ],
      cta: { title: "Ready to unlock your data's potential?", subtitle: "Join 10,000+ companies making smarter decisions", button: "Start Your Free Trial" },
      footer: { copyright: "© 2026 DataPulse. All rights reserved.", links: ["Privacy", "Terms", "Security", "Status"] },
    },
  },
  {
    id: "agency-creative",
    name: "Nexus Creative Agency",
    category: "Agency",
    icon: Briefcase,
    description: "Creative agency portfolio - client-ready",
    preview: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)",
    popular: true,
    content: {
      brand: { name: "Nexus", tagline: "We craft digital experiences" },
      hero: {
        headline: "We Build Brands That Stand Out",
        subheadline: "Award-winning creative agency specializing in branding, web design, and digital marketing.",
        cta: "Start a Project",
        secondaryCta: "View Our Work",
      },
      services: [
        { icon: "🎨", title: "Brand Identity", desc: "Logo design, brand guidelines, and visual systems that tell your story" },
        { icon: "💻", title: "Web Design", desc: "Beautiful, conversion-focused websites that drive results" },
        { icon: "📈", title: "Digital Marketing", desc: "SEO, PPC, and social media campaigns that grow your business" },
        { icon: "📹", title: "Video Production", desc: "Compelling video content that engages your audience" },
      ],
      portfolio: [
        { title: "TechVenture Rebrand", category: "Branding", image: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" },
        { title: "Luxe Hotels Website", category: "Web Design", image: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)" },
        { title: "FitLife App Launch", category: "Marketing", image: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" },
        { title: "Artisan Coffee Co.", category: "Branding", image: "linear-gradient(135deg, #78350f 0%, #92400e 100%)" },
      ],
      stats: [
        { value: "150+", label: "Projects Completed" },
        { value: "50+", label: "Happy Clients" },
        { value: "12", label: "Awards Won" },
        { value: "8", label: "Years Experience" },
      ],
      testimonials: [
        { quote: "Nexus transformed our brand completely. Our conversions increased 200% after the redesign.", name: "Jennifer Park", role: "Founder", company: "Bloom Beauty", avatar: "JP" },
        { quote: "The most professional agency we've worked with. They truly understand brand strategy.", name: "David Kim", role: "Marketing Director", company: "TechStart", avatar: "DK" },
      ],
      cta: { title: "Let's create something amazing together", subtitle: "Tell us about your project", button: "Get in Touch" },
    },
  },
  {
    id: "ecommerce-fashion",
    name: "Velvet Fashion Store",
    category: "E-Commerce",
    icon: ShoppingBag,
    description: "Fashion e-commerce - ready to sell",
    preview: "linear-gradient(135deg, #111111 0%, #333333 100%)",
    content: {
      brand: { name: "VELVET", tagline: "Effortless elegance" },
      hero: {
        headline: "Spring Collection 2026",
        subheadline: "Discover timeless pieces crafted for the modern wardrobe",
        cta: "Shop Now",
        secondaryCta: "View Lookbook",
      },
      categories: [
        { name: "Women", count: 248, image: "linear-gradient(135deg, #fda4af 0%, #fb7185 100%)" },
        { name: "Men", count: 186, image: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)" },
        { name: "Accessories", count: 94, image: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" },
        { name: "Sale", count: 67, image: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)" },
      ],
      featuredProducts: [
        { name: "Silk Midi Dress", price: 189, originalPrice: 249, image: "linear-gradient(135deg, #fecdd3 0%, #fda4af 100%)" },
        { name: "Cashmere Blazer", price: 329, image: "linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)" },
        { name: "Leather Tote Bag", price: 259, image: "linear-gradient(135deg, #78350f 0%, #92400e 100%)" },
        { name: "Wool Coat", price: 449, image: "linear-gradient(135deg, #374151 0%, #1f2937 100%)" },
      ],
      features: [
        { icon: "🚚", title: "Free Shipping", desc: "On orders over $100" },
        { icon: "↩️", title: "Easy Returns", desc: "30-day return policy" },
        { icon: "💎", title: "Premium Quality", desc: "Ethically sourced materials" },
        { icon: "💬", title: "24/7 Support", desc: "Always here to help" },
      ],
      newsletter: { title: "Join the VELVET Club", subtitle: "Get 15% off your first order + exclusive access to new arrivals", button: "Subscribe" },
    },
  },
  {
    id: "restaurant-fine",
    name: "Saveur Restaurant",
    category: "Restaurant",
    icon: Utensils,
    description: "Fine dining restaurant - reservation ready",
    preview: "linear-gradient(135deg, #78350f 0%, #451a03 100%)",
    content: {
      brand: { name: "Saveur", tagline: "A culinary journey" },
      hero: {
        headline: "Where Every Dish Tells a Story",
        subheadline: "Experience French-inspired cuisine in the heart of downtown",
        cta: "Reserve a Table",
        secondaryCta: "View Menu",
      },
      about: {
        title: "Our Story",
        text: "Founded in 2018 by Chef Marie Laurent, Saveur brings the essence of French countryside cooking to the city. Using locally-sourced ingredients and time-honored techniques, we create dishes that celebrate the art of gastronomy.",
      },
      menuHighlights: [
        { name: "Seared Duck Breast", desc: "Cherry reduction, roasted vegetables, potato gratin", price: 42 },
        { name: "Lobster Bisque", desc: "Fresh Maine lobster, cognac cream, chive oil", price: 24 },
        { name: "Beef Bourguignon", desc: "48-hour braised beef, pearl onions, mushrooms", price: 38 },
        { name: "Crème Brûlée", desc: "Madagascar vanilla, caramelized sugar, seasonal berries", price: 14 },
      ],
      info: {
        hours: "Tue-Sun: 5:30 PM - 10:30 PM",
        address: "245 Main Street, Downtown",
        phone: "(555) 234-5678",
      },
      testimonials: [
        { quote: "The best dining experience in the city. Every dish was perfection.", name: "James & Emily R.", rating: 5 },
        { quote: "Chef Marie's tasting menu is an unforgettable journey.", name: "Michael T.", rating: 5 },
      ],
      cta: { title: "Make a Reservation", subtitle: "Book your table for an unforgettable evening", button: "Reserve Now" },
    },
  },
  {
    id: "fitness-gym",
    name: "Apex Fitness Club",
    category: "Fitness",
    icon: Dumbbell,
    description: "Gym & fitness center - membership ready",
    preview: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
    content: {
      brand: { name: "APEX", tagline: "Elevate your potential" },
      hero: {
        headline: "Transform Your Body. Elevate Your Life.",
        subheadline: "State-of-the-art equipment, expert trainers, and a community that pushes you to be your best.",
        cta: "Start Free Trial",
        secondaryCta: "View Classes",
      },
      features: [
        { icon: "🏋️", title: "Premium Equipment", desc: "Latest Technogym and Hammer Strength machines" },
        { icon: "👨‍🏫", title: "Personal Training", desc: "Certified trainers to guide your journey" },
        { icon: "🧘", title: "50+ Classes/Week", desc: "Yoga, HIIT, Spin, Boxing, and more" },
        { icon: "🧖", title: "Recovery Suite", desc: "Sauna, steam room, and massage therapy" },
      ],
      classes: [
        { name: "HIIT Extreme", time: "6:00 AM", trainer: "Coach Mike", spots: 8 },
        { name: "Power Yoga", time: "7:30 AM", trainer: "Sarah L.", spots: 12 },
        { name: "Spin Class", time: "12:00 PM", trainer: "DJ Chris", spots: 5 },
        { name: "Boxing Basics", time: "6:00 PM", trainer: "Marcus T.", spots: 10 },
      ],
      pricing: [
        { name: "Day Pass", price: 25, features: ["Full gym access", "All classes", "Locker room"] },
        { name: "Monthly", price: 79, features: ["Unlimited access", "All classes", "1 PT session/mo", "Recovery suite"], popular: true },
        { name: "Annual", price: 699, period: "year", features: ["Everything in Monthly", "4 PT sessions/mo", "Guest passes", "Nutrition plan"] },
      ],
      stats: [
        { value: "5,000+", label: "Active Members" },
        { value: "50+", label: "Expert Trainers" },
        { value: "24/7", label: "Access" },
        { value: "15K", label: "Sq Ft Facility" },
      ],
      cta: { title: "Your transformation starts today", subtitle: "Join now and get your first month free", button: "Claim Free Trial" },
    },
  },
  {
    id: "consulting-business",
    name: "Stratix Consulting",
    category: "Business",
    icon: Building2,
    description: "Business consulting - professional presence",
    preview: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
    content: {
      brand: { name: "Stratix", tagline: "Strategy that delivers" },
      hero: {
        headline: "Accelerate Your Business Growth",
        subheadline: "We partner with industry leaders to solve complex challenges and unlock sustainable growth.",
        cta: "Schedule Consultation",
        secondaryCta: "Our Approach",
      },
      services: [
        { icon: "📊", title: "Strategy Consulting", desc: "Market analysis, competitive positioning, and growth roadmaps" },
        { icon: "⚙️", title: "Operations Excellence", desc: "Process optimization, cost reduction, and efficiency gains" },
        { icon: "💰", title: "Financial Advisory", desc: "M&A support, valuation, and capital strategy" },
        { icon: "🔄", title: "Digital Transformation", desc: "Technology strategy, implementation, and change management" },
      ],
      stats: [
        { value: "$2.4B", label: "Value Created" },
        { value: "200+", label: "Clients Served" },
        { value: "35%", label: "Avg. Growth Rate" },
        { value: "15", label: "Industries" },
      ],
      clients: ["Fortune 500 Company", "Tech Unicorn", "Global Bank", "Healthcare Leader", "Retail Giant", "Manufacturing Corp"],
      team: [
        { name: "Alexandra Chen", role: "Managing Partner", bio: "20+ years at McKinsey & Bain" },
        { name: "Robert Williams", role: "Senior Partner", bio: "Former CFO, Fortune 100" },
        { name: "Priya Sharma", role: "Partner, Digital", bio: "Ex-Google, digital transformation expert" },
      ],
      cta: { title: "Let's discuss your challenges", subtitle: "Book a free 30-minute strategy session", button: "Schedule Call" },
    },
  },
  {
    id: "photography-portfolio",
    name: "Lens & Light Studio",
    category: "Portfolio",
    icon: Camera,
    description: "Photography portfolio - showcase ready",
    preview: "linear-gradient(135deg, #fafafa 0%, #e5e5e5 100%)",
    content: {
      brand: { name: "Lens & Light", tagline: "Capturing moments that matter" },
      hero: {
        headline: "Stories Through the Lens",
        subheadline: "Award-winning photography for weddings, portraits, and commercial brands",
        cta: "View Portfolio",
        secondaryCta: "Book a Session",
      },
      services: [
        { name: "Weddings", startingAt: 3500, desc: "Full-day coverage, engagement session, album" },
        { name: "Portraits", startingAt: 450, desc: "2-hour session, 25 edited images, online gallery" },
        { name: "Commercial", startingAt: 1500, desc: "Product, lifestyle, and brand photography" },
        { name: "Events", startingAt: 800, desc: "Corporate events, parties, conferences" },
      ],
      portfolio: [
        { title: "Sarah & James Wedding", category: "Wedding", image: "linear-gradient(135deg, #fecdd3 0%, #fda4af 100%)" },
        { title: "Nike Campaign", category: "Commercial", image: "linear-gradient(135deg, #111 0%, #333 100%)" },
        { title: "Family Portraits", category: "Portrait", image: "linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)" },
        { title: "Tech Summit 2025", category: "Event", image: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)" },
      ],
      about: {
        name: "Elena Rodriguez",
        bio: "With over 12 years of experience and features in Vogue, Elle, and National Geographic, I bring a unique blend of artistic vision and technical expertise to every shoot.",
        awards: ["Best Wedding Photographer 2024", "WPPI Gold Award", "Featured in Vogue"],
      },
      testimonials: [
        { quote: "Elena captured our wedding day perfectly. Every photo tells our story.", name: "Sarah & James", event: "Wedding" },
        { quote: "Professional, creative, and incredibly easy to work with.", name: "Nike Marketing Team", event: "Commercial" },
      ],
      cta: { title: "Let's create something beautiful", subtitle: "Limited availability for 2026", button: "Check Availability" },
    },
  },
  {
    id: "education-online",
    name: "MasterClass Academy",
    category: "Education",
    icon: GraduationCap,
    description: "Online courses platform - enrollment ready",
    preview: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
    content: {
      brand: { name: "MasterClass Academy", tagline: "Learn from the best" },
      hero: {
        headline: "Master New Skills from Industry Experts",
        subheadline: "Join 100,000+ learners advancing their careers with our premium courses",
        cta: "Browse Courses",
        secondaryCta: "Free Trial",
      },
      featuredCourses: [
        { title: "Complete Web Development", instructor: "John Smith", students: 12500, rating: 4.9, price: 199, image: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" },
        { title: "Data Science Masterclass", instructor: "Dr. Sarah Lee", students: 8700, rating: 4.8, price: 249, image: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
        { title: "Digital Marketing Pro", instructor: "Maria Garcia", students: 15200, rating: 4.9, price: 179, image: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" },
        { title: "UI/UX Design Bootcamp", instructor: "Alex Chen", students: 9400, rating: 4.7, price: 229, image: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)" },
      ],
      features: [
        { icon: "🎬", title: "HD Video Lessons", desc: "Crystal clear instruction from expert educators" },
        { icon: "📝", title: "Hands-on Projects", desc: "Build real portfolio pieces as you learn" },
        { icon: "🏆", title: "Certificates", desc: "Earn recognized credentials for your resume" },
        { icon: "💬", title: "Community Access", desc: "Connect with peers and mentors worldwide" },
      ],
      stats: [
        { value: "100K+", label: "Students" },
        { value: "250+", label: "Courses" },
        { value: "50+", label: "Instructors" },
        { value: "4.8", label: "Avg Rating" },
      ],
      pricing: [
        { name: "Single Course", price: 199, features: ["Lifetime access", "Certificate", "Project files", "Community access"] },
        { name: "All Access", price: 29, period: "mo", features: ["All 250+ courses", "New courses monthly", "Priority support", "Career coaching"], popular: true },
        { name: "Team", price: 99, period: "user/mo", features: ["Everything in All Access", "Team dashboard", "Progress tracking", "Custom learning paths"] },
      ],
      cta: { title: "Start learning today", subtitle: "7-day free trial, cancel anytime", button: "Get Started Free" },
    },
  },
];

const THEMES = [
  { id: "modern-dark", name: "Modern Dark", colors: { primary: "#CDB49E", secondary: "#111111", accent: "#f5f0eb", background: "#0a0a0a", text: "#ffffff", muted: "#888888" }, fonts: { heading: "Inter", body: "Inter" }, borderRadius: "12px" },
  { id: "ocean-blue", name: "Ocean Blue", colors: { primary: "#0ea5e9", secondary: "#0c4a6e", accent: "#38bdf8", background: "#0f172a", text: "#f8fafc", muted: "#64748b" }, fonts: { heading: "Inter", body: "Inter" }, borderRadius: "16px" },
  { id: "forest-green", name: "Forest Green", colors: { primary: "#10b981", secondary: "#064e3b", accent: "#34d399", background: "#0d1117", text: "#f0fdf4", muted: "#6b7280" }, fonts: { heading: "Inter", body: "Inter" }, borderRadius: "12px" },
  { id: "violet-dream", name: "Violet Dream", colors: { primary: "#8b5cf6", secondary: "#2e1065", accent: "#a78bfa", background: "#0f0720", text: "#faf5ff", muted: "#a1a1aa" }, fonts: { heading: "Inter", body: "Inter" }, borderRadius: "16px" },
  { id: "rose-elegant", name: "Rose Elegant", colors: { primary: "#f43f5e", secondary: "#4c0519", accent: "#fb7185", background: "#0f0506", text: "#fff1f2", muted: "#9ca3af" }, fonts: { heading: "Playfair Display", body: "Inter" }, borderRadius: "8px" },
  { id: "minimal-light", name: "Minimal Light", colors: { primary: "#111111", secondary: "#ffffff", accent: "#666666", background: "#ffffff", text: "#111111", muted: "#6b7280" }, fonts: { heading: "Inter", body: "Inter" }, borderRadius: "8px" },
];

/* ═══════════════════════ PREVIEW COMPONENTS ═══════════════════════ */

function LiveWebsitePreview({ template, theme }: { template: typeof TEMPLATES[0]; theme: typeof THEMES[0] }) {
  const c = template.content;
  const t = theme.colors;

  return (
    <div className="w-full overflow-auto" style={{ backgroundColor: t.background, color: t.text }}>
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b" style={{ borderColor: t.muted + "20" }}>
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold" style={{ color: t.primary }}>{c.brand.name}</span>
          <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: t.muted }}>
            <span className="hover:text-white cursor-pointer transition-colors">Home</span>
            <span className="hover:text-white cursor-pointer transition-colors">Features</span>
            <span className="hover:text-white cursor-pointer transition-colors">Pricing</span>
            <span className="hover:text-white cursor-pointer transition-colors">About</span>
            <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm" style={{ color: t.muted }}>Sign In</button>
          <button className="px-4 py-2 text-sm font-medium rounded-lg" style={{ backgroundColor: t.primary, color: t.secondary, borderRadius: theme.borderRadius }}>
            {c.hero.cta}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-24 text-center max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: theme.fonts.heading }}>
          {c.hero.headline}
        </h1>
        <p className="text-xl mb-10 max-w-3xl mx-auto" style={{ color: t.muted }}>
          {c.hero.subheadline}
        </p>
        <div className="flex justify-center gap-4">
          <button className="px-8 py-4 text-sm font-semibold rounded-lg" style={{ backgroundColor: t.primary, color: t.secondary, borderRadius: theme.borderRadius }}>
            {c.hero.cta}
          </button>
          <button className="px-8 py-4 text-sm font-semibold rounded-lg border" style={{ borderColor: t.primary, color: t.primary, borderRadius: theme.borderRadius }}>
            {c.hero.secondaryCta}
          </button>
        </div>
      </section>

      {/* Features/Services Section */}
      {'features' in c && (
        <section className="px-8 py-20" style={{ backgroundColor: t.secondary }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Why Choose {c.brand.name}?</h2>
            <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: t.muted }}>Everything you need to succeed</p>
            <div className="grid md:grid-cols-3 gap-8">
              {(c.features || c.services || []).slice(0, 6).map((f: any, i: number) => (
                <div key={i} className="p-6 rounded-xl text-center" style={{ backgroundColor: t.background, borderRadius: theme.borderRadius }}>
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <h3 className="font-semibold mb-2">{f.title || f.name}</h3>
                  <p className="text-sm" style={{ color: t.muted }}>{f.desc || f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section */}
      {'pricing' in c && (
        <section className="px-8 py-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
            <p className="text-center mb-12" style={{ color: t.muted }}>Choose the plan that fits your needs</p>
            <div className="flex flex-wrap justify-center gap-8">
              {c.pricing?.map((p: any, i: number) => (
                <div
                  key={i}
                  className={cn("w-80 p-8 rounded-2xl", p.popular && "ring-2")}
                  style={{ backgroundColor: p.popular ? t.primary + "10" : t.secondary, borderRadius: theme.borderRadius, ...(p.popular && { ringColor: t.primary }) }}
                >
                  {p.popular && <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" style={{ backgroundColor: t.primary, color: t.secondary }}>MOST POPULAR</span>}
                  <h3 className="font-semibold text-lg mb-2">{p.name}</h3>
                  <p className="text-4xl font-bold mb-1" style={{ color: t.primary }}>
                    ${p.price}<span className="text-sm font-normal" style={{ color: t.muted }}>/{p.period || 'mo'}</span>
                  </p>
                  <ul className="space-y-3 my-6 text-sm">
                    {p.features.map((f: string, j: number) => (
                      <li key={j} className="flex items-center gap-2" style={{ color: t.muted }}>
                        <Check className="w-4 h-4" style={{ color: t.primary }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full py-3 text-sm font-semibold rounded-lg" style={{ backgroundColor: p.popular ? t.primary : "transparent", color: p.popular ? t.secondary : t.primary, border: `1px solid ${t.primary}`, borderRadius: theme.borderRadius }}>
                    {p.cta || "Get Started"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {'testimonials' in c && (
        <section className="px-8 py-20" style={{ backgroundColor: t.secondary }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {c.testimonials?.map((t2: any, i: number) => (
                <div key={i} className="p-8 rounded-xl" style={{ backgroundColor: t.background, borderRadius: theme.borderRadius }}>
                  <div className="flex gap-1 mb-4">{[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" style={{ color: t.primary }} />)}</div>
                  <p className="mb-6 italic" style={{ color: t.muted }}>"{t2.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: t.primary + "30", color: t.primary }}>
                      {t2.avatar || t2.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium">{t2.name}</p>
                      <p className="text-sm" style={{ color: t.muted }}>{t2.role || t2.event}{t2.company && `, ${t2.company}`}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {'cta' in c && (
        <section className="px-8 py-20">
          <div className="max-w-4xl mx-auto text-center p-12 rounded-2xl" style={{ backgroundColor: t.primary + "10", borderRadius: theme.borderRadius }}>
            <h2 className="text-3xl font-bold mb-4">{c.cta?.title}</h2>
            <p className="mb-8" style={{ color: t.muted }}>{c.cta?.subtitle}</p>
            <button className="px-10 py-4 text-sm font-semibold rounded-lg inline-flex items-center gap-2" style={{ backgroundColor: t.primary, color: t.secondary, borderRadius: theme.borderRadius }}>
              {c.cta?.button} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="px-8 py-12 border-t" style={{ borderColor: t.muted + "20", backgroundColor: t.secondary }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold" style={{ color: t.primary }}>{c.brand.name}</span>
              <span className="text-sm" style={{ color: t.muted }}>• {c.brand.tagline}</span>
            </div>
            <div className="flex items-center gap-6">
              {((c as any).footer?.links || ['Privacy', 'Terms', 'Contact']).map((link: string, i: number) => (
                <span key={i} className="text-sm cursor-pointer hover:underline" style={{ color: t.muted }}>{link}</span>
              ))}
            </div>
            <div className="flex items-center gap-4" style={{ color: t.muted }}>
              <Facebook className="w-5 h-5 cursor-pointer hover:text-white" />
              <Twitter className="w-5 h-5 cursor-pointer hover:text-white" />
              <Instagram className="w-5 h-5 cursor-pointer hover:text-white" />
              <Linkedin className="w-5 h-5 cursor-pointer hover:text-white" />
            </div>
          </div>
          <div className="text-center mt-8 pt-8 border-t text-sm" style={{ borderColor: t.muted + "20", color: t.muted }}>
            © 2026 {c.brand.name}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */

export default function WebsitePage() {
  const { fetchPages } = useWebsiteStore();
  const [view, setView] = useState<"templates" | "preview" | "customize">("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showDeploy, setShowDeploy] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [domain, setDomain] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);

  useEffect(() => {
    fetchPages("org1");
  }, [fetchPages]);

  const handleSelectTemplate = (template: typeof TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setEditingContent(JSON.parse(JSON.stringify(template.content)));
    setView("preview");
  };

  const handleDeploy = () => {
    setDeploying(true);
    setTimeout(() => {
      setDeploying(false);
      setDeployed(true);
    }, 2500);
  };

  // Template Gallery
  if (view === "templates") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Ready to Deploy
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Choose Your Business Website</h1>
            <p className="text-lg text-[#888] max-w-2xl mx-auto">
              Fully designed websites with real content. Just customize your details and deploy in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <div key={template.id} className="group relative bg-[#111] border border-[#2a2a2a] rounded-2xl overflow-hidden hover:border-[#CDB49E]/50 transition-all">
                  <div className="relative h-48" style={{ background: template.preview }}>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      <div className="text-white/90 text-lg font-bold mb-1">{template.content.brand.name}</div>
                      <div className="text-white/60 text-xs">{template.content.brand.tagline}</div>
                    </div>
                    {template.popular && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500 text-[10px] font-bold text-black">POPULAR</div>
                    )}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                      <button onClick={() => handleSelectTemplate(template)} className="px-5 py-2.5 rounded-xl bg-[#CDB49E] text-black text-sm font-semibold hover:bg-[#d4c0ad]">
                        Use This Template
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
          </div>
        </div>
      </div>
    );
  }

  // Preview & Customize View
  if (selectedTemplate && (view === "preview" || view === "customize")) {
    const currentContent = editingContent || selectedTemplate.content;

    return (
      <div className="min-h-screen bg-[#0a0a0a] flex">
        {/* Sidebar */}
        <div className="w-80 bg-[#111] border-r border-[#222] flex flex-col">
          <div className="p-4 border-b border-[#222]">
            <button onClick={() => { setView("templates"); setSelectedTemplate(null); }} className="flex items-center gap-2 text-sm text-[#888] hover:text-white mb-4">
              <ChevronRight className="w-4 h-4 rotate-180" /> Back to Templates
            </button>
            <h2 className="text-lg font-semibold text-white">{selectedTemplate.content.brand.name}</h2>
            <p className="text-xs text-[#888]">{selectedTemplate.description}</p>
          </div>

          {/* Quick Edit */}
          <div className="flex-1 overflow-auto p-4 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-[#555] uppercase tracking-wider mb-3">Brand</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#666] mb-1 block">Business Name</label>
                  <input
                    type="text"
                    value={currentContent.brand.name}
                    onChange={(e) => setEditingContent({ ...currentContent, brand: { ...currentContent.brand, name: e.target.value } })}
                    className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#CDB49E]/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#666] mb-1 block">Tagline</label>
                  <input
                    type="text"
                    value={currentContent.brand.tagline}
                    onChange={(e) => setEditingContent({ ...currentContent, brand: { ...currentContent.brand, tagline: e.target.value } })}
                    className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#CDB49E]/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#555] uppercase tracking-wider mb-3">Hero Section</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#666] mb-1 block">Headline</label>
                  <input
                    type="text"
                    value={currentContent.hero.headline}
                    onChange={(e) => setEditingContent({ ...currentContent, hero: { ...currentContent.hero, headline: e.target.value } })}
                    className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#CDB49E]/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#666] mb-1 block">Subheadline</label>
                  <textarea
                    value={currentContent.hero.subheadline}
                    onChange={(e) => setEditingContent({ ...currentContent, hero: { ...currentContent.hero, subheadline: e.target.value } })}
                    rows={2}
                    className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#CDB49E]/50 focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#666] mb-1 block">Button Text</label>
                  <input
                    type="text"
                    value={currentContent.hero.cta}
                    onChange={(e) => setEditingContent({ ...currentContent, hero: { ...currentContent.hero, cta: e.target.value } })}
                    className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#CDB49E]/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#555] uppercase tracking-wider mb-3">Color Theme</h3>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTheme(t)}
                    className={cn("p-2 rounded-lg border transition-all", selectedTheme.id === t.id ? "border-[#CDB49E]" : "border-[#333] hover:border-[#444]")}
                  >
                    <div className="flex gap-1 mb-1">
                      {[t.colors.primary, t.colors.secondary, t.colors.accent].map((c, i) => (
                        <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <span className="text-[10px] text-[#888]">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Deploy Button */}
          <div className="p-4 border-t border-[#222]">
            <button onClick={() => setShowDeploy(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
              <Rocket className="w-4 h-4" />
              Deploy Website
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="h-14 bg-[#111] border-b border-[#222] flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white">Live Preview</span>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
              {[
                { id: "desktop" as const, icon: Monitor },
                { id: "tablet" as const, icon: Tablet },
                { id: "mobile" as const, icon: Smartphone },
              ].map((device) => (
                <button
                  key={device.id}
                  onClick={() => setDevicePreview(device.id)}
                  className={cn("p-2 rounded-md transition-colors", devicePreview === device.id ? "bg-[#CDB49E]/10 text-[#CDB49E]" : "text-[#555] hover:text-white")}
                >
                  <device.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Preview Canvas */}
          <div className="flex-1 overflow-auto bg-[#1a1a1a] p-4">
            <div className={cn(
              "mx-auto bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300",
              devicePreview === "desktop" && "max-w-full",
              devicePreview === "tablet" && "max-w-2xl",
              devicePreview === "mobile" && "max-w-sm"
            )}>
              <LiveWebsitePreview 
                template={{ ...selectedTemplate, content: currentContent }} 
                theme={selectedTheme} 
              />
            </div>
          </div>
        </div>

        {/* Deploy Modal */}
        {showDeploy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !deploying && setShowDeploy(false)} />
            <div className="relative bg-[#111] border border-[#2a2a2a] rounded-2xl w-full max-w-md p-6 shadow-2xl">
              {!deployed ? (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Deploy Your Website</h2>
                      <p className="text-xs text-[#888]">Choose your domain and go live</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-xs text-[#666] mb-1.5 block">Your Domain</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={domain}
                          onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                          placeholder="your-business"
                          className="flex-1 px-4 py-3 text-sm bg-[#1a1a1a] border border-[#333] rounded-xl text-white focus:border-emerald-500/50 focus:outline-none"
                        />
                        <span className="text-sm text-[#666]">.atlas.site</span>
                      </div>
                      {domain && <p className="text-xs text-emerald-400 mt-2">✓ https://{domain}.atlas.site is available</p>}
                    </div>

                    <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#222]">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-white">Includes</span>
                      </div>
                      <ul className="space-y-2 text-xs text-[#888]">
                        <li className="flex items-center gap-2"><Check className="w-3 h-3 text-emerald-400" /> Free SSL certificate</li>
                        <li className="flex items-center gap-2"><Check className="w-3 h-3 text-emerald-400" /> Global CDN for fast loading</li>
                        <li className="flex items-center gap-2"><Check className="w-3 h-3 text-emerald-400" /> SEO optimized</li>
                        <li className="flex items-center gap-2"><Check className="w-3 h-3 text-emerald-400" /> Analytics dashboard</li>
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={handleDeploy}
                    disabled={!domain || deploying}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deploying ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Deploying...</>
                    ) : (
                      <><Rocket className="w-4 h-4" /> Deploy Now</>
                    )}
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">Your Website is Live! 🎉</h2>
                  <p className="text-[#888] mb-6">Your business website is now online</p>
                  <a
                    href={`https://${domain}.atlas.site`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#CDB49E] text-black rounded-xl font-semibold hover:bg-[#d4c0ad] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit https://{domain}.atlas.site
                  </a>
                  <button
                    onClick={() => { setShowDeploy(false); setDeployed(false); }}
                    className="block w-full mt-4 text-sm text-[#888] hover:text-white"
                  >
                    Continue Editing
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
