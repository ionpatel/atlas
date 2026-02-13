"use client";

import { useState, useCallback } from "react";
import {
  Sparkles, Wand2, Image as ImageIcon, FileText, RefreshCw, Copy, Check,
  Loader2, ChevronDown, ChevronUp, Lightbulb, MessageSquare, Zap, Target,
  PenTool, Layout, Palette, Type, X, ArrowRight, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   AI PANEL - AI Copy Generator & Image Suggestions
   ═══════════════════════════════════════════════════════════════════════════ */

// Types
interface AIGenerationRequest {
  type: "headline" | "tagline" | "paragraph" | "cta" | "testimonial" | "faq" | "feature";
  context?: string;
  tone?: "professional" | "casual" | "bold" | "friendly" | "luxury" | "minimal";
  industry?: string;
  targetAudience?: string;
}

interface AIImageSuggestion {
  query: string;
  category: string;
  description: string;
  unsplashUrl: string;
}

interface AIGeneratedContent {
  id: string;
  type: string;
  content: string;
  timestamp: number;
}

// Content generation templates (simulated AI - can be replaced with actual API)
const CONTENT_TEMPLATES: Record<string, Record<string, string[]>> = {
  headline: {
    professional: [
      "Transform Your Business with Enterprise Solutions",
      "Driving Innovation Through Excellence",
      "Your Success Is Our Mission",
      "Leading the Future of {industry}",
      "Where Quality Meets Performance",
    ],
    casual: [
      "Let's Build Something Amazing Together",
      "Simple Tools, Big Results",
      "Work Smarter, Not Harder",
      "Your Next Big Thing Starts Here",
      "We Make {industry} Easy",
    ],
    bold: [
      "Disrupt. Dominate. Deliver.",
      "The Future Belongs to the Bold",
      "No Limits. No Compromises.",
      "Redefine What's Possible",
      "Break Through Every Barrier",
    ],
    friendly: [
      "Welcome to Your New Favorite {industry} Partner",
      "We're Here to Help You Shine",
      "Together, We Achieve More",
      "Your Success Story Starts Here",
      "Let's Make Great Things Happen",
    ],
    luxury: [
      "Crafted for Those Who Demand Excellence",
      "Where Sophistication Meets Innovation",
      "Experience the Art of Perfection",
      "Elevate Your Standards",
      "Uncompromising Quality, Timeless Design",
    ],
    minimal: [
      "Simply Better",
      "Less Noise. More Value.",
      "Focus on What Matters",
      "Clean. Simple. Powerful.",
      "Essential Excellence",
    ],
  },
  tagline: {
    professional: [
      "Trusted by industry leaders worldwide",
      "Delivering results that matter",
      "Excellence in every detail",
      "Your partner in sustainable growth",
    ],
    casual: [
      "Making life a little easier",
      "Good vibes, great results",
      "Built with love and coffee",
      "Keeping it real since day one",
    ],
    bold: [
      "Join the revolution",
      "Built for the ambitious",
      "For those who dare",
      "Challenge everything",
    ],
    friendly: [
      "We've got your back",
      "Because you deserve the best",
      "Here when you need us",
      "Your success is our success",
    ],
    luxury: [
      "Crafted for connoisseurs",
      "Where elegance meets innovation",
      "For the discerning few",
      "Timeless by design",
    ],
    minimal: [
      "Simple works",
      "Do more with less",
      "Clarity in complexity",
      "Essence over excess",
    ],
  },
  paragraph: {
    professional: [
      "We provide comprehensive solutions designed to meet the unique challenges of modern businesses. Our team of experts brings decades of combined experience to help you achieve your goals efficiently and effectively.",
      "With a proven track record of success across diverse industries, we understand what it takes to drive meaningful results. Our data-driven approach ensures every decision is backed by insights and expertise.",
    ],
    casual: [
      "We're a team of passionate creators who believe in making tools that just work. No complicated setups, no confusing menus—just the features you need to get things done.",
      "Life's too short for bad software. That's why we've built something that actually makes sense. Real solutions for real people, designed with care and a healthy dose of common sense.",
    ],
    bold: [
      "We don't follow trends—we set them. Our revolutionary approach has redefined industry standards and continues to push the boundaries of what's possible.",
      "Mediocrity is not in our vocabulary. Every product we create, every service we offer, is designed to exceed expectations and deliver extraordinary results.",
    ],
    friendly: [
      "Think of us as your extended team. We're here to support you every step of the way, celebrating your wins and working through challenges together. That's what partners do.",
      "We believe in the power of genuine connections. Behind every email, every support ticket, there's a real person who genuinely cares about your success.",
    ],
    luxury: [
      "Each element is meticulously crafted using only the finest materials and techniques. Our artisans bring generations of expertise to every piece, ensuring an unparalleled level of quality.",
      "We believe true luxury lies in the details. From the initial concept to the final delivery, every touchpoint reflects our unwavering commitment to excellence.",
    ],
    minimal: [
      "We focus on what matters. Clean design, intuitive interfaces, and powerful functionality—nothing more, nothing less. Simplicity is our superpower.",
      "In a world of complexity, we choose clarity. Our philosophy: strip away the unnecessary and perfect what remains.",
    ],
  },
  cta: {
    professional: [
      "Schedule a Consultation",
      "Get Your Free Assessment",
      "Request a Demo",
      "Start Your Trial",
      "Contact Our Team",
    ],
    casual: [
      "Let's Do This",
      "Jump In",
      "Get Started Free",
      "Try It Out",
      "See For Yourself",
    ],
    bold: [
      "Join the Movement",
      "Claim Your Spot",
      "Take the Leap",
      "Make It Happen",
      "Start Dominating",
    ],
    friendly: [
      "Let's Chat",
      "We're Here to Help",
      "Say Hello",
      "Start Your Journey",
      "Come On In",
    ],
    luxury: [
      "Inquire Now",
      "Begin Your Experience",
      "Discover More",
      "Book Your Appointment",
      "Request Private Access",
    ],
    minimal: [
      "Begin",
      "Explore",
      "Learn More",
      "Get Access",
      "Start Now",
    ],
  },
  testimonial: {
    professional: [
      "Working with this team has transformed our operations. The ROI we've seen has exceeded all expectations, and their professional approach makes collaboration seamless.",
      "In my 20 years in {industry}, I've never encountered such a dedicated partner. They understand our business and consistently deliver beyond what we ask for.",
    ],
    casual: [
      "Honestly, I wish I'd found these guys sooner! Everything just works, and their support team is actually helpful. Game changer for our small business.",
      "No BS, no hidden fees, no complicated setup. Just a solid product that does exactly what it promises. Finally!",
    ],
    bold: [
      "They didn't just meet our goals—they completely redefined what we thought was possible. Our competitors are still trying to catch up.",
      "If you're serious about dominating your market, stop looking elsewhere. This is the team that will get you there.",
    ],
    friendly: [
      "From day one, it felt like working with old friends. They genuinely care about your success, and it shows in everything they do.",
      "I was nervous about making the switch, but the whole team made it so easy. They're patient, helpful, and always available when you need them.",
    ],
    luxury: [
      "The attention to detail is extraordinary. Every interaction reflects their commitment to excellence—it's clear why they're the choice of discerning clients.",
      "In a world of compromises, they deliver perfection. The quality of craftsmanship and service is simply unmatched.",
    ],
    minimal: [
      "Simple, elegant, effective. Exactly what we needed.",
      "Less complexity, more results. Perfect.",
    ],
  },
  faq: {
    professional: [
      "Our enterprise solutions include 24/7 dedicated support, custom integrations, and comprehensive training for your team.",
      "We offer flexible pricing tiers designed to scale with your business needs. Contact us for a customized quote.",
    ],
    casual: [
      "No worries! Our free plan includes all the basics you need to get started. Upgrade anytime if you need more features.",
      "Totally! You can cancel anytime, no questions asked. We make it easy because we're confident you'll want to stay.",
    ],
    bold: [
      "Absolutely. We're so confident in our product that we offer an unconditional 60-day money-back guarantee.",
      "Yes—we're the only ones offering this level of power at this price point. Check the competition if you don't believe us.",
    ],
    friendly: [
      "Great question! Our team is here 7 days a week to help you out. Just drop us a message and we'll get back to you ASAP.",
      "Of course! We love helping new users get set up. Book a free onboarding call and we'll walk you through everything.",
    ],
    luxury: [
      "Each piece comes with a certificate of authenticity and our lifetime quality guarantee. Our concierge team is available for any questions.",
      "We offer exclusive previews and priority access to our most valued clients. Contact your personal advisor for details.",
    ],
    minimal: [
      "Yes. Simple pricing, no hidden fees.",
      "Included. Everything you need, nothing you don't.",
    ],
  },
  feature: {
    professional: [
      "Advanced analytics dashboard with real-time insights and custom reporting capabilities.",
      "Enterprise-grade security with SOC 2 compliance and end-to-end encryption.",
      "Seamless API integrations with 200+ popular business tools and platforms.",
    ],
    casual: [
      "One-click setup that actually works—no IT degree required.",
      "Smart notifications that keep you in the loop without overwhelming your inbox.",
      "Sync across all your devices automatically. Start on your phone, finish on your laptop.",
    ],
    bold: [
      "AI-powered automation that handles tasks 10x faster than manual processes.",
      "Unlimited scalability—grow from startup to enterprise without switching platforms.",
      "Revolutionary interface that competitors are already trying to copy.",
    ],
    friendly: [
      "Built-in tutorials that make learning fun (really, we promise!).",
      "24/7 live chat with actual humans who actually care about your questions.",
      "Community forums where you can connect with other users and share tips.",
    ],
    luxury: [
      "Hand-finished details using traditional artisan techniques passed down through generations.",
      "Exclusive materials sourced from the world's finest suppliers.",
      "Personalized concierge service for all your needs and inquiries.",
    ],
    minimal: [
      "One dashboard. All your data.",
      "Instant sync. Zero config.",
      "Fast. Reliable. Done.",
    ],
  },
};

// Image suggestion categories
const IMAGE_CATEGORIES = [
  { id: "business", label: "Business", queries: ["modern office", "team meeting", "professional workspace", "corporate building"] },
  { id: "technology", label: "Technology", queries: ["laptop on desk", "digital interface", "futuristic tech", "coding on screen"] },
  { id: "lifestyle", label: "Lifestyle", queries: ["happy people", "outdoor adventure", "urban lifestyle", "cozy interior"] },
  { id: "fitness", label: "Fitness", queries: ["gym workout", "running athlete", "yoga practice", "fitness equipment"] },
  { id: "food", label: "Food & Drink", queries: ["gourmet food", "coffee shop", "healthy meal", "restaurant interior"] },
  { id: "nature", label: "Nature", queries: ["mountain landscape", "ocean waves", "forest path", "sunset sky"] },
  { id: "abstract", label: "Abstract", queries: ["geometric shapes", "gradient colors", "minimal texture", "light rays"] },
  { id: "architecture", label: "Architecture", queries: ["modern building", "interior design", "urban architecture", "minimal space"] },
];

const INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "E-commerce", "Education", 
  "Real Estate", "Fitness", "Restaurant", "Creative Agency", "Consulting",
  "SaaS", "Non-profit", "Travel", "Fashion", "Manufacturing"
];

export function AIPanel({
  onInsertContent,
  onInsertImage,
  selectedElementType,
}: {
  onInsertContent?: (content: string) => void;
  onInsertImage?: (url: string) => void;
  selectedElementType?: string;
}) {
  const [activeTab, setActiveTab] = useState<"copy" | "images">("copy");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<AIGeneratedContent[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Copy generator state
  const [contentType, setContentType] = useState<AIGenerationRequest["type"]>("headline");
  const [tone, setTone] = useState<AIGenerationRequest["tone"]>("professional");
  const [industry, setIndustry] = useState("Technology");
  const [customPrompt, setCustomPrompt] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Image suggestions state
  const [imageCategory, setImageCategory] = useState("business");
  const [imageSuggestions, setImageSuggestions] = useState<AIImageSuggestion[]>([]);
  const [customImageQuery, setCustomImageQuery] = useState("");

  // Generate AI copy
  const generateContent = useCallback(async () => {
    setIsGenerating(true);
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    
    const templates = CONTENT_TEMPLATES[contentType]?.[tone!] || CONTENT_TEMPLATES.headline.professional;
    const numResults = 3;
    const results: AIGeneratedContent[] = [];
    
    for (let i = 0; i < numResults; i++) {
      let content = templates[Math.floor(Math.random() * templates.length)];
      // Replace {industry} placeholder
      content = content.replace(/\{industry\}/g, industry.toLowerCase());
      
      results.push({
        id: `gen-${Date.now()}-${i}`,
        type: contentType,
        content,
        timestamp: Date.now(),
      });
    }
    
    setGeneratedContent(results);
    setIsGenerating(false);
  }, [contentType, tone, industry]);

  // Generate image suggestions
  const generateImageSuggestions = useCallback(async () => {
    setIsGenerating(true);
    
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 300));
    
    const category = IMAGE_CATEGORIES.find(c => c.id === imageCategory);
    const queries = customImageQuery 
      ? [customImageQuery] 
      : category?.queries || ["modern minimal"];
    
    const suggestions: AIImageSuggestion[] = queries.map((query, i) => ({
      query,
      category: category?.label || "Custom",
      description: `High-quality ${query} image`,
      unsplashUrl: `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}&sig=${Date.now() + i}`,
    }));
    
    setImageSuggestions(suggestions);
    setIsGenerating(false);
  }, [imageCategory, customImageQuery]);

  // Copy to clipboard
  const copyContent = useCallback((id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  // Content type options
  const contentTypes = [
    { id: "headline", label: "Headline", icon: Type },
    { id: "tagline", label: "Tagline", icon: MessageSquare },
    { id: "paragraph", label: "Paragraph", icon: FileText },
    { id: "cta", label: "CTA Button", icon: Target },
    { id: "testimonial", label: "Testimonial", icon: Star },
    { id: "faq", label: "FAQ Answer", icon: Lightbulb },
    { id: "feature", label: "Feature Text", icon: Zap },
  ];

  const tones = [
    { id: "professional", label: "Professional", color: "bg-blue-500" },
    { id: "casual", label: "Casual", color: "bg-green-500" },
    { id: "bold", label: "Bold", color: "bg-red-500" },
    { id: "friendly", label: "Friendly", color: "bg-yellow-500" },
    { id: "luxury", label: "Luxury", color: "bg-purple-500" },
    { id: "minimal", label: "Minimal", color: "bg-gray-500" },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="p-4 border-b border-[#222]">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
            <p className="text-[10px] text-[#666]">Generate content & find images</p>
          </div>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 bg-[#1a1a1a] rounded-lg">
          <button
            onClick={() => setActiveTab("copy")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium transition-colors",
              activeTab === "copy" 
                ? "bg-[#CDB49E] text-black" 
                : "text-[#888] hover:text-white"
            )}
          >
            <PenTool className="w-3.5 h-3.5" />
            Copy Generator
          </button>
          <button
            onClick={() => setActiveTab("images")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium transition-colors",
              activeTab === "images" 
                ? "bg-[#CDB49E] text-black" 
                : "text-[#888] hover:text-white"
            )}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Image Ideas
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {activeTab === "copy" ? (
          <>
            {/* Content Type Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#888]">Content Type</label>
              <div className="grid grid-cols-2 gap-2">
                {contentTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setContentType(type.id as AIGenerationRequest["type"])}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left",
                        contentType === type.id
                          ? "border-[#CDB49E] bg-[#CDB49E]/10 text-[#CDB49E]"
                          : "border-[#333] text-[#888] hover:border-[#555] hover:text-white"
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-xs">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tone Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#888]">Tone</label>
              <div className="grid grid-cols-3 gap-2">
                {tones.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id as AIGenerationRequest["tone"])}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border transition-all",
                      tone === t.id
                        ? "border-[#CDB49E] bg-[#CDB49E]/10"
                        : "border-[#333] hover:border-[#555]"
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full", t.color)} />
                    <span className={cn(
                      "text-[10px]",
                      tone === t.id ? "text-[#CDB49E]" : "text-[#888]"
                    )}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Options */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs text-[#666] hover:text-[#CDB49E]"
            >
              {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              Advanced Options
            </button>

            {showAdvanced && (
              <div className="space-y-3 p-3 bg-[#111] rounded-lg border border-[#222]">
                <div>
                  <label className="text-xs text-[#888] mb-1.5 block">Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#888] mb-1.5 block">Custom Context (optional)</label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Add any specific context or requirements..."
                    className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white resize-none h-20"
                  />
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateContent}
              disabled={isGenerating}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all",
                isGenerating
                  ? "bg-[#333] text-[#666] cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Content
                </>
              )}
            </button>

            {/* Results */}
            {generatedContent.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#888]">Generated Content</span>
                  <button
                    onClick={generateContent}
                    className="flex items-center gap-1 text-[10px] text-[#666] hover:text-[#CDB49E]"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate
                  </button>
                </div>
                
                {generatedContent.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#111] rounded-lg border border-[#222] group"
                  >
                    <p className="text-sm text-white mb-3">{item.content}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyContent(item.id, item.content)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors",
                          copiedId === item.id
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-[#1a1a1a] text-[#888] hover:text-white"
                        )}
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy
                          </>
                        )}
                      </button>
                      {onInsertContent && (
                        <button
                          onClick={() => onInsertContent(item.content)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-[#CDB49E]/10 text-[#CDB49E] hover:bg-[#CDB49E]/20"
                        >
                          <ArrowRight className="w-3 h-3" />
                          Insert
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Images Tab */
          <>
            {/* Category Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#888]">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {IMAGE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setImageCategory(cat.id);
                      setCustomImageQuery("");
                    }}
                    className={cn(
                      "p-2.5 rounded-lg border text-xs transition-all",
                      imageCategory === cat.id
                        ? "border-[#CDB49E] bg-[#CDB49E]/10 text-[#CDB49E]"
                        : "border-[#333] text-[#888] hover:border-[#555] hover:text-white"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Search */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#888]">Custom Search (optional)</label>
              <input
                type="text"
                value={customImageQuery}
                onChange={(e) => setCustomImageQuery(e.target.value)}
                placeholder="e.g., 'team collaboration', 'modern office'"
                className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#333] rounded-lg text-white"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={generateImageSuggestions}
              disabled={isGenerating}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all",
                isGenerating
                  ? "bg-[#333] text-[#666] cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Finding Images...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  Get Suggestions
                </>
              )}
            </button>

            {/* Image Results */}
            {imageSuggestions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#888]">Suggested Images</span>
                  <button
                    onClick={generateImageSuggestions}
                    className="flex items-center gap-1 text-[10px] text-[#666] hover:text-[#CDB49E]"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {imageSuggestions.map((img, i) => (
                    <div
                      key={i}
                      className="relative group overflow-hidden rounded-lg border border-[#333] hover:border-[#CDB49E] transition-colors"
                    >
                      <img
                        src={img.unsplashUrl}
                        alt={img.description}
                        className="w-full aspect-[4/3] object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <p className="text-[10px] text-white/80 mb-1.5 truncate">{img.query}</p>
                          {onInsertImage && (
                            <button
                              onClick={() => onInsertImage(img.unsplashUrl)}
                              className="w-full flex items-center justify-center gap-1 py-1.5 rounded text-[10px] bg-[#CDB49E] text-black font-medium"
                            >
                              <ArrowRight className="w-3 h-3" />
                              Use Image
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <p className="text-[10px] text-[#555] text-center">
                  Images from Unsplash • Free for commercial use
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Tips */}
      <div className="p-3 border-t border-[#222] bg-[#111]/50">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-[#CDB49E] shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#666]">
            {activeTab === "copy" 
              ? "Tip: Select an element first, then generate content that matches its type."
              : "Tip: Use custom search for more specific image results."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AIPanel;
