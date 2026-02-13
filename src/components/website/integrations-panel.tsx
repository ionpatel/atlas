"use client";

import { useState } from "react";
import { 
  X, BarChart3, MessageSquare, Code, Check, ExternalLink, 
  AlertCircle, Copy, Eye, EyeOff, Plus, Trash2, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   INTEGRATIONS PANEL
   Google Analytics, Facebook Pixel, Chat Widgets (Intercom, Crisp, etc.)
   ═══════════════════════════════════════════════════════════════════════════ */

export interface Integration {
  id: string;
  type: "google_analytics" | "facebook_pixel" | "google_tag_manager" | "intercom" | "crisp" | "tawk" | "drift" | "hubspot" | "custom";
  name: string;
  enabled: boolean;
  config: Record<string, string>;
}

interface IntegrationsPanelProps {
  integrations: Integration[];
  onChange: (integrations: Integration[]) => void;
  onClose: () => void;
}

interface IntegrationTypeInfo {
  type: Integration["type"];
  name: string;
  icon: string;
  description: string;
  fields: { key: string; label: string; placeholder: string }[];
  docs: string;
}

const INTEGRATION_TYPES: { analytics: IntegrationTypeInfo[]; chat: IntegrationTypeInfo[] } = {
  analytics: [
    { 
      type: "google_analytics", 
      name: "Google Analytics", 
      icon: "📊",
      description: "Track website traffic and user behavior",
      fields: [{ key: "measurementId", label: "Measurement ID", placeholder: "G-XXXXXXXXXX" }],
      docs: "https://analytics.google.com/",
    },
    { 
      type: "google_tag_manager", 
      name: "Google Tag Manager", 
      icon: "🏷️",
      description: "Manage all your tags in one place",
      fields: [{ key: "containerId", label: "Container ID", placeholder: "GTM-XXXXXXX" }],
      docs: "https://tagmanager.google.com/",
    },
    { 
      type: "facebook_pixel", 
      name: "Facebook Pixel", 
      icon: "📘",
      description: "Track conversions from Facebook ads",
      fields: [{ key: "pixelId", label: "Pixel ID", placeholder: "123456789012345" }],
      docs: "https://business.facebook.com/events_manager",
    },
  ],
  chat: [
    { 
      type: "intercom", 
      name: "Intercom", 
      icon: "💬",
      description: "Customer messaging platform",
      fields: [{ key: "appId", label: "App ID", placeholder: "abc123xyz" }],
      docs: "https://app.intercom.com/",
    },
    { 
      type: "crisp", 
      name: "Crisp", 
      icon: "🗨️",
      description: "All-in-one customer messaging",
      fields: [{ key: "websiteId", label: "Website ID", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" }],
      docs: "https://app.crisp.chat/",
    },
    { 
      type: "tawk", 
      name: "Tawk.to", 
      icon: "💭",
      description: "Free live chat software",
      fields: [
        { key: "propertyId", label: "Property ID", placeholder: "xxxxxxxxxxxxxxxxxxxxxxxx" },
        { key: "widgetId", label: "Widget ID", placeholder: "xxxxxxxxxx" },
      ],
      docs: "https://dashboard.tawk.to/",
    },
    { 
      type: "drift", 
      name: "Drift", 
      icon: "🌊",
      description: "Conversational marketing platform",
      fields: [{ key: "accountId", label: "Account ID", placeholder: "xxxxxx" }],
      docs: "https://app.drift.com/",
    },
    { 
      type: "hubspot", 
      name: "HubSpot Chat", 
      icon: "🧡",
      description: "Free live chat for HubSpot",
      fields: [{ key: "portalId", label: "Portal ID", placeholder: "12345678" }],
      docs: "https://app.hubspot.com/",
    },
  ],
};

function generateSnippet(integration: Integration): string {
  switch (integration.type) {
    case "google_analytics":
      return `<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${integration.config.measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${integration.config.measurementId}');
</script>`;

    case "google_tag_manager":
      return `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${integration.config.containerId}');</script>`;

    case "facebook_pixel":
      return `<!-- Facebook Pixel -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${integration.config.pixelId}');
  fbq('track', 'PageView');
</script>`;

    case "intercom":
      return `<!-- Intercom -->
<script>
  window.intercomSettings = { api_base: "https://api-iam.intercom.io", app_id: "${integration.config.appId}" };
  (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${integration.config.appId}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
</script>`;

    case "crisp":
      return `<!-- Crisp -->
<script type="text/javascript">
  window.$crisp=[];window.CRISP_WEBSITE_ID="${integration.config.websiteId}";
  (function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";
  s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();
</script>`;

    case "tawk":
      return `<!-- Tawk.to -->
<script type="text/javascript">
  var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
  (function(){
    var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
    s1.async=true;
    s1.src='https://embed.tawk.to/${integration.config.propertyId}/${integration.config.widgetId}';
    s1.charset='UTF-8';
    s1.setAttribute('crossorigin','*');
    s0.parentNode.insertBefore(s1,s0);
  })();
</script>`;

    case "drift":
      return `<!-- Drift -->
<script>
  !function() {
    var t = window.driftt = window.drift = window.driftt || [];
    if (!t.init) {
      if (t.invoked) return void (window.console && console.error && console.error("Drift snippet included twice."));
      t.invoked = !0, t.methods = [ "identify", "config", "track", "reset", "debug", "show", "ping", "page", "hide", "off", "on" ], 
      t.factory = function(e) {
        return function() {
          var n = Array.prototype.slice.call(arguments);
          return n.unshift(e), t.push(n), t;
        };
      }, t.methods.forEach(function(e) {
        t[e] = t.factory(e);
      }), t.load = function(t) {
        var e = 3e5, n = Math.ceil(new Date() / e) * e, o = document.createElement("script");
        o.type = "text/javascript", o.async = !0, o.crossorigin = "anonymous", o.src = "https://js.driftt.com/include/" + n + "/" + t + ".js";
        var i = document.getElementsByTagName("script")[0];
        i.parentNode.insertBefore(o, i);
      };
    }
  }();
  drift.SNIPPET_VERSION = '0.3.1';
  drift.load('${integration.config.accountId}');
</script>`;

    case "hubspot":
      return `<!-- HubSpot -->
<script type="text/javascript" id="hs-script-loader" async defer src="//js.hs-scripts.com/${integration.config.portalId}.js"></script>`;

    default:
      return "<!-- Custom integration -->";
  }
}

export function IntegrationsPanel({ integrations, onChange, onClose }: IntegrationsPanelProps) {
  const [activeTab, setActiveTab] = useState<"analytics" | "chat" | "custom">("analytics");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSnippet, setShowSnippet] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAddIntegration = (type: Integration["type"]) => {
    const existing = integrations.find(i => i.type === type);
    if (existing) {
      setEditingId(existing.id);
      return;
    }

    const allTypes = [...INTEGRATION_TYPES.analytics, ...INTEGRATION_TYPES.chat];
    const typeInfo = allTypes.find(t => t.type === type);
    
    const newIntegration: Integration = {
      id: `int-${Date.now()}`,
      type,
      name: typeInfo?.name || "Custom",
      enabled: false,
      config: {},
    };
    
    onChange([...integrations, newIntegration]);
    setEditingId(newIntegration.id);
  };

  const handleUpdateIntegration = (id: string, updates: Partial<Integration>) => {
    onChange(integrations.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const handleDeleteIntegration = (id: string) => {
    onChange(integrations.filter(i => i.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleCopySnippet = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderIntegrationCard = (typeInfo: IntegrationTypeInfo) => {
    const existing = integrations.find(i => i.type === typeInfo.type);
    const isConfigured = existing && Object.keys(existing.config).length > 0;
    
    return (
      <div 
        key={typeInfo.type}
        className={cn(
          "p-4 rounded-xl border transition-all cursor-pointer",
          existing?.enabled 
            ? "bg-emerald-500/10 border-emerald-500/30" 
            : isConfigured 
              ? "bg-[#1a1a1a] border-amber-500/30"
              : "bg-[#1a1a1a] border-[#333] hover:border-[#444]"
        )}
        onClick={() => handleAddIntegration(typeInfo.type)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{typeInfo.icon}</span>
            <div>
              <h4 className="font-medium text-white">{typeInfo.name}</h4>
              <p className="text-xs text-[#666] mt-0.5">{typeInfo.description}</p>
            </div>
          </div>
          {existing?.enabled && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-medium">
              Active
            </span>
          )}
          {isConfigured && !existing?.enabled && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-medium">
              Configured
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleAddIntegration(typeInfo.type); }}
            className="px-3 py-1.5 rounded-lg bg-[#222] text-xs text-white hover:bg-[#333]"
          >
            {existing ? "Configure" : "Set Up"}
          </button>
          <a 
            href={typeInfo.docs} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="p-1.5 rounded-lg text-[#666] hover:text-white hover:bg-[#222]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  };

  const editingIntegration = editingId ? integrations.find(i => i.id === editingId) : null;
  const allTypes = [...INTEGRATION_TYPES.analytics, ...INTEGRATION_TYPES.chat];
  const editingTypeInfo = editingIntegration 
    ? allTypes.find(t => t.type === editingIntegration.type)
    : null;

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#333]">
        <div>
          <h2 className="text-lg font-semibold text-white">Integrations</h2>
          <p className="text-xs text-[#666] mt-0.5">Connect analytics, chat widgets, and tracking</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg text-[#666] hover:text-white hover:bg-[#222]">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#333]">
        {[
          { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
          { id: "chat" as const, label: "Chat Widgets", icon: MessageSquare },
          { id: "custom" as const, label: "Custom Code", icon: Code },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2",
              activeTab === tab.id 
                ? "text-[#CDB49E] border-[#CDB49E]" 
                : "text-[#666] border-transparent hover:text-white"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "analytics" && (
          <div className="space-y-3">
            {INTEGRATION_TYPES.analytics.map(renderIntegrationCard)}
          </div>
        )}

        {activeTab === "chat" && (
          <div className="space-y-3">
            {INTEGRATION_TYPES.chat.map(renderIntegrationCard)}
          </div>
        )}

        {activeTab === "custom" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-white font-medium">Custom Code Injection</p>
                  <p className="text-xs text-[#888] mt-1">
                    Add custom scripts to your website&apos;s head or body. Use the Code Injection panel for full control.
                  </p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="w-full p-4 rounded-xl border border-dashed border-[#444] text-[#666] hover:text-white hover:border-[#CDB49E] transition-colors flex items-center justify-center gap-2"
            >
              <Code className="w-5 h-5" />
              Open Code Injection Panel
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingIntegration && editingTypeInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-[#111] rounded-2xl border border-[#333] w-[500px] shadow-2xl">
            <div className="p-4 border-b border-[#333] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{editingTypeInfo.icon}</span>
                <div>
                  <h3 className="font-semibold text-white">{editingTypeInfo.name}</h3>
                  <p className="text-xs text-[#666]">{editingTypeInfo.description}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingId(null)} 
                className="p-2 rounded-lg text-[#666] hover:text-white hover:bg-[#222]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Config Fields */}
              {editingTypeInfo.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-[#888] mb-2">{field.label}</label>
                  <input
                    type="text"
                    value={editingIntegration.config[field.key] || ""}
                    onChange={e => handleUpdateIntegration(editingIntegration.id, {
                      config: { ...editingIntegration.config, [field.key]: e.target.value }
                    })}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#333] text-white placeholder:text-[#555] focus:border-[#CDB49E] focus:outline-none text-sm font-mono"
                  />
                </div>
              ))}

              {/* Enable Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a] border border-[#222]">
                <span className="text-sm text-white">Enable Integration</span>
                <button
                  onClick={() => handleUpdateIntegration(editingIntegration.id, { 
                    enabled: !editingIntegration.enabled 
                  })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    editingIntegration.enabled ? "bg-emerald-500" : "bg-[#333]"
                  )}
                >
                  <span className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                    editingIntegration.enabled ? "left-7" : "left-1"
                  )} />
                </button>
              </div>

              {/* Show Snippet */}
              {editingIntegration.enabled && Object.keys(editingIntegration.config).some(k => editingIntegration.config[k]) && (
                <div>
                  <button
                    onClick={() => setShowSnippet(showSnippet === editingIntegration.id ? null : editingIntegration.id)}
                    className="flex items-center gap-2 text-xs text-[#CDB49E] hover:underline"
                  >
                    {showSnippet === editingIntegration.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showSnippet === editingIntegration.id ? "Hide" : "View"} Generated Code
                  </button>
                  
                  {showSnippet === editingIntegration.id && (
                    <div className="mt-2 relative">
                      <pre className="p-3 rounded-lg bg-[#0a0a0a] border border-[#222] text-xs text-[#888] overflow-x-auto font-mono max-h-40">
                        {generateSnippet(editingIntegration)}
                      </pre>
                      <button
                        onClick={() => handleCopySnippet(generateSnippet(editingIntegration))}
                        className="absolute top-2 right-2 p-1.5 rounded bg-[#222] text-[#888] hover:text-white"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#333] flex items-center justify-between">
              <button
                onClick={() => handleDeleteIntegration(editingIntegration.id)}
                className="px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="px-4 py-2 rounded-lg bg-[#CDB49E] text-black font-medium text-sm hover:bg-[#d4c0ad]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
