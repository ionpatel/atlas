"use client";

import { useState } from "react";
import { X, Code, AlertTriangle, Check, Eye, EyeOff, Info, FileCode, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   CODE INJECTION PANEL
   Add custom scripts to head and body of the website
   ═══════════════════════════════════════════════════════════════════════════ */

export interface CodeInjection {
  headStart: string;    // Right after <head>
  headEnd: string;      // Before </head>
  bodyStart: string;    // Right after <body>
  bodyEnd: string;      // Before </body>
  customCSS: string;    // Custom CSS styles
  enabled: boolean;
}

interface CodeInjectionPanelProps {
  code: CodeInjection;
  onChange: (code: CodeInjection) => void;
  onClose: () => void;
}

const DEFAULT_CODE: CodeInjection = {
  headStart: "",
  headEnd: "",
  bodyStart: "",
  bodyEnd: "",
  customCSS: "",
  enabled: true,
};

const INJECTION_POINTS = [
  {
    id: "headStart" as const,
    label: "Head Start",
    description: "Inserted right after <head>",
    placeholder: "<!-- Meta tags, preconnects, etc. -->\n<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">",
    icon: "🔼",
    language: "html",
  },
  {
    id: "headEnd" as const,
    label: "Head End",
    description: "Inserted before </head>",
    placeholder: "<!-- Tracking scripts, stylesheets -->\n<script src=\"https://example.com/tracking.js\"></script>",
    icon: "🔽",
    language: "html",
  },
  {
    id: "bodyStart" as const,
    label: "Body Start",
    description: "Inserted right after <body>",
    placeholder: "<!-- GTM noscript, body-level scripts -->\n<noscript><iframe src=\"...\"></iframe></noscript>",
    icon: "📄",
    language: "html",
  },
  {
    id: "bodyEnd" as const,
    label: "Body End",
    description: "Inserted before </body>",
    placeholder: "<!-- Analytics, chat widgets, deferred scripts -->\n<script>console.log('Page loaded');</script>",
    icon: "📋",
    language: "html",
  },
  {
    id: "customCSS" as const,
    label: "Custom CSS",
    description: "Added to page <style> tag",
    placeholder: "/* Custom styles */\n.my-class {\n  color: #CDB49E;\n}",
    icon: "🎨",
    language: "css",
  },
];

const SNIPPETS = [
  {
    name: "Cookie Consent Banner",
    category: "Legal",
    target: "bodyEnd" as const,
    code: `<!-- Cookie Consent by Osano -->
<script src="https://cdn.cookieconsent.com/cookieconsent.js"></script>
<script>
window.addEventListener('load', function() {
  window.cookieconsent.initialise({
    "palette": {
      "popup": { "background": "#111", "text": "#fff" },
      "button": { "background": "#CDB49E", "text": "#111" }
    },
    "content": {
      "message": "We use cookies to enhance your experience.",
      "dismiss": "Got it!",
      "link": "Learn more"
    }
  });
});
</script>`,
  },
  {
    name: "Schema.org Markup",
    category: "SEO",
    target: "headEnd" as const,
    code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company Name",
  "url": "https://yourwebsite.com",
  "logo": "https://yourwebsite.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-234-567-8900",
    "contactType": "customer service"
  }
}
</script>`,
  },
  {
    name: "Custom Font",
    category: "Design",
    target: "headStart" as const,
    code: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">`,
  },
  {
    name: "Page Load Animation",
    category: "Design",
    target: "customCSS" as const,
    code: `/* Fade in animation on page load */
body {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}`,
  },
  {
    name: "Back to Top Button",
    category: "UI",
    target: "bodyEnd" as const,
    code: `<style>
  .back-to-top {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: #CDB49E;
    color: #111;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 999;
  }
  .back-to-top.visible { opacity: 1; }
</style>
<button class="back-to-top" onclick="window.scrollTo({top:0,behavior:'smooth'})">↑</button>
<script>
  window.addEventListener('scroll', function() {
    const btn = document.querySelector('.back-to-top');
    btn.classList.toggle('visible', window.scrollY > 300);
  });
</script>`,
  },
  {
    name: "Hotjar Tracking",
    category: "Analytics",
    target: "headEnd" as const,
    code: `<!-- Hotjar Tracking Code -->
<script>
  (function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:YOUR_HOTJAR_ID,hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>`,
  },
];

export function CodeInjectionPanel({ code, onChange, onClose }: CodeInjectionPanelProps) {
  const [activeTab, setActiveTab] = useState<keyof CodeInjection>("headEnd");
  const [showPreview, setShowPreview] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const currentCode = code || DEFAULT_CODE;

  const handleChange = (key: keyof CodeInjection, value: string | boolean) => {
    onChange({ ...currentCode, [key]: value });
  };

  const handleInsertSnippet = (snippet: typeof SNIPPETS[0]) => {
    const currentValue = currentCode[snippet.target] || "";
    const newValue = currentValue ? `${currentValue}\n\n${snippet.code}` : snippet.code;
    handleChange(snippet.target, newValue);
    setActiveTab(snippet.target);
    setShowSnippets(false);
  };

  const activePoint = INJECTION_POINTS.find(p => p.id === activeTab)!;
  const hasCode = Object.entries(currentCode)
    .filter(([k]) => k !== "enabled")
    .some(([_, v]) => v && typeof v === "string" && v.trim());

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#333]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#CDB49E]/10 flex items-center justify-center">
            <Code className="w-5 h-5 text-[#CDB49E]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Code Injection</h2>
            <p className="text-xs text-[#666]">Add custom scripts and styles to your website</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSnippets(!showSnippets)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors",
              showSnippets ? "bg-[#CDB49E]/10 text-[#CDB49E]" : "text-[#888] hover:text-white hover:bg-[#222]"
            )}
          >
            <FileCode className="w-4 h-4" />
            Snippets
          </button>
          <button onClick={onClose} className="p-2 rounded-lg text-[#666] hover:text-white hover:bg-[#222]">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Warning */}
      {hasCode && (
        <div className="mx-4 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-400">Be careful with custom code</p>
            <p className="text-xs text-[#888] mt-0.5">
              Invalid scripts can break your website. Test thoroughly before publishing.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#333] mt-4 px-4 overflow-x-auto">
        {INJECTION_POINTS.map(point => (
          <button
            key={point.id}
            onClick={() => setActiveTab(point.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
              activeTab === point.id 
                ? "text-[#CDB49E] border-[#CDB49E]" 
                : "text-[#666] border-transparent hover:text-white"
            )}
          >
            <span>{point.icon}</span>
            {point.label}
            {currentCode[point.id] && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{activePoint.icon}</span>
              <div>
                <span className="text-sm font-medium text-white">{activePoint.label}</span>
                <span className="text-xs text-[#666] ml-2">{activePoint.description}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={cn(
                  "p-2 rounded-lg text-sm flex items-center gap-1",
                  showPreview ? "bg-[#CDB49E]/10 text-[#CDB49E]" : "text-[#666] hover:text-white"
                )}
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex-1 relative">
            <textarea
              value={currentCode[activeTab] as string || ""}
              onChange={e => handleChange(activeTab, e.target.value)}
              placeholder={activePoint.placeholder}
              className={cn(
                "w-full h-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#333] text-white placeholder:text-[#444] focus:border-[#CDB49E] focus:outline-none resize-none font-mono text-sm",
                activePoint.language === "css" ? "text-emerald-400" : "text-blue-400"
              )}
              spellCheck={false}
            />
            
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-[#222] text-[10px] text-[#666] uppercase">
                {activePoint.language}
              </span>
            </div>
          </div>
        </div>

        {/* Snippets Panel */}
        {showSnippets && (
          <div className="w-80 border-l border-[#333] p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#CDB49E]" />
              Quick Snippets
            </h3>
            <div className="space-y-2">
              {SNIPPETS.map((snippet, i) => (
                <button
                  key={i}
                  onClick={() => handleInsertSnippet(snippet)}
                  className="w-full p-3 rounded-lg bg-[#1a1a1a] border border-[#222] hover:border-[#444] text-left transition-colors group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white group-hover:text-[#CDB49E]">
                      {snippet.name}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#222] text-[10px] text-[#666]">
                      {snippet.category}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#555]">
                    Inserts into: {INJECTION_POINTS.find(p => p.id === snippet.target)?.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#333] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleChange("enabled", !currentCode.enabled)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
              currentCode.enabled 
                ? "bg-emerald-500/10 text-emerald-400" 
                : "bg-[#222] text-[#666]"
            )}
          >
            {currentCode.enabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {currentCode.enabled ? "Enabled" : "Disabled"}
          </button>
          
          <div className="flex items-center gap-1 text-xs text-[#555]">
            <Info className="w-3 h-3" />
            Code is injected when site is published
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange(DEFAULT_CODE)}
            className="px-3 py-2 rounded-lg text-[#888] hover:text-white text-sm"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#CDB49E] text-black font-medium text-sm hover:bg-[#d4c0ad]"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
