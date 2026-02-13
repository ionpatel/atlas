"use client";

import { useState } from "react";
import { 
  X, Globe, Check, AlertCircle, ExternalLink, Copy, RefreshCw,
  Shield, Clock, Plus, Trash2, CheckCircle2, XCircle, Loader2, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   DOMAIN SETTINGS PANEL
   Custom domain connection, DNS verification, SSL status
   ═══════════════════════════════════════════════════════════════════════════ */

export interface DomainConfig {
  id: string;
  domain: string;
  isPrimary: boolean;
  status: "pending" | "verifying" | "active" | "error";
  sslStatus: "pending" | "provisioning" | "active" | "error";
  verifiedAt?: string;
  errorMessage?: string;
  dnsRecords: DNSRecord[];
}

export interface DNSRecord {
  type: "A" | "CNAME" | "TXT";
  name: string;
  value: string;
  verified: boolean;
}

interface DomainSettingsPanelProps {
  domains: DomainConfig[];
  defaultDomain: string; // e.g., "your-site.atlas.app"
  onAddDomain: (domain: string) => Promise<DomainConfig | null>;
  onRemoveDomain: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onVerifyDomain: (id: string) => Promise<void>;
  onClose: () => void;
}

const STATUS_STYLES = {
  pending: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Pending Setup" },
  verifying: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Verifying..." },
  provisioning: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Provisioning..." },
  active: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Active" },
  error: { bg: "bg-red-500/10", text: "text-red-400", label: "Error" },
};

export function DomainSettingsPanel({
  domains,
  defaultDomain,
  onAddDomain,
  onRemoveDomain,
  onSetPrimary,
  onVerifyDomain,
  onClose,
}: DomainSettingsPanelProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;
    
    // Basic validation
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(newDomain.trim())) {
      setAddError("Please enter a valid domain (e.g., example.com)");
      return;
    }

    setIsAdding(true);
    setAddError(null);

    try {
      const result = await onAddDomain(newDomain.trim().toLowerCase());
      if (result) {
        setNewDomain("");
        setShowAddModal(false);
        setExpandedDomain(result.id);
      }
    } catch (err: any) {
      setAddError(err.message || "Failed to add domain");
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerify = async (id: string) => {
    setVerifying(id);
    try {
      await onVerifyDomain(id);
    } finally {
      setVerifying(null);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#333]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#CDB49E]/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-[#CDB49E]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Domain Settings</h2>
            <p className="text-xs text-[#666]">Connect custom domains to your website</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg text-[#666] hover:text-white hover:bg-[#222]">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Default Domain */}
        <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#333]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-[#666] block mb-1">Default Domain</span>
              <span className="text-sm font-medium text-white">{defaultDomain}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium flex items-center gap-1">
                <Shield className="w-3 h-3" />
                SSL Active
              </span>
              <a 
                href={`https://${defaultDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-[#666] hover:text-white hover:bg-[#222]"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Custom Domains */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Custom Domains</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-lg bg-[#CDB49E] text-black text-xs font-medium hover:bg-[#d4c0ad] flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Domain
            </button>
          </div>

          {domains.length === 0 ? (
            <div className="p-8 rounded-xl border-2 border-dashed border-[#333] text-center">
              <Globe className="w-10 h-10 text-[#333] mx-auto mb-3" />
              <p className="text-sm text-[#666] mb-1">No custom domains</p>
              <p className="text-xs text-[#555]">Add your own domain to brand your website</p>
            </div>
          ) : (
            <div className="space-y-2">
              {domains.map(domain => {
                const status = STATUS_STYLES[domain.status];
                const sslStatus = STATUS_STYLES[domain.sslStatus];
                const isExpanded = expandedDomain === domain.id;

                return (
                  <div 
                    key={domain.id}
                    className="rounded-xl border border-[#333] overflow-hidden"
                  >
                    {/* Domain Header */}
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#1a1a1a] transition-colors"
                      onClick={() => setExpandedDomain(isExpanded ? null : domain.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          domain.status === "active" ? "bg-emerald-500/10" : "bg-[#222]"
                        )}>
                          {domain.status === "active" 
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            : domain.status === "error"
                              ? <XCircle className="w-5 h-5 text-red-400" />
                              : <Globe className="w-5 h-5 text-[#666]" />
                          }
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{domain.domain}</span>
                            {domain.isPrimary && (
                              <span className="px-2 py-0.5 rounded bg-[#CDB49E]/10 text-[#CDB49E] text-[10px] font-medium">
                                Primary
                              </span>
                            )}
                          </div>
                          <span className={cn("text-xs", status.text)}>{status.label}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-medium flex items-center gap-1",
                          sslStatus.bg, sslStatus.text
                        )}>
                          <Shield className="w-3 h-3" />
                          SSL {domain.sslStatus === "active" ? "Active" : domain.sslStatus}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="p-4 pt-0 border-t border-[#222] mt-0">
                        {/* Error Message */}
                        {domain.errorMessage && (
                          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-4 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            <span className="text-xs text-red-400">{domain.errorMessage}</span>
                          </div>
                        )}

                        {/* DNS Records */}
                        {domain.status !== "active" && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs font-semibold text-[#888]">DNS Configuration</h4>
                              <button
                                onClick={() => handleVerify(domain.id)}
                                disabled={verifying === domain.id}
                                className="px-3 py-1 rounded-lg bg-[#222] text-xs text-white hover:bg-[#333] flex items-center gap-1 disabled:opacity-50"
                              >
                                {verifying === domain.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <RefreshCw className="w-3 h-3" />
                                )}
                                Verify DNS
                              </button>
                            </div>

                            <div className="space-y-2">
                              {domain.dnsRecords.map((record, i) => (
                                <div 
                                  key={i}
                                  className={cn(
                                    "p-3 rounded-lg border flex items-center justify-between",
                                    record.verified 
                                      ? "bg-emerald-500/5 border-emerald-500/20" 
                                      : "bg-[#0a0a0a] border-[#222]"
                                  )}
                                >
                                  <div className="flex items-center gap-4">
                                    <span className="px-2 py-1 rounded bg-[#222] text-[10px] font-mono text-[#888]">
                                      {record.type}
                                    </span>
                                    <div>
                                      <span className="text-xs text-[#666] block">Name</span>
                                      <span className="text-sm text-white font-mono">{record.name}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-[#666] block">Value</span>
                                      <span className="text-sm text-white font-mono">{record.value}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {record.verified ? (
                                      <Check className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                      <button
                                        onClick={() => handleCopy(record.value, `${domain.id}-${i}`)}
                                        className="p-1.5 rounded text-[#666] hover:text-white hover:bg-[#222]"
                                      >
                                        {copied === `${domain.id}-${i}` 
                                          ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                                          : <Copy className="w-3.5 h-3.5" />
                                        }
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 flex items-start gap-2">
                              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                              <div className="text-xs text-[#888]">
                                <p className="mb-1">Add these DNS records at your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)</p>
                                <p className="text-[#666]">DNS changes can take up to 48 hours to propagate.</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-[#222]">
                          <div className="flex items-center gap-2">
                            {!domain.isPrimary && domain.status === "active" && (
                              <button
                                onClick={() => onSetPrimary(domain.id)}
                                className="px-3 py-1.5 rounded-lg bg-[#222] text-xs text-white hover:bg-[#333]"
                              >
                                Set as Primary
                              </button>
                            )}
                            {domain.status === "active" && (
                              <a
                                href={`https://${domain.domain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-[#222] text-xs text-white hover:bg-[#333] flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Visit
                              </a>
                            )}
                          </div>
                          <button
                            onClick={() => onRemoveDomain(domain.id)}
                            className="px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 text-xs flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#222]">
          <h4 className="text-sm font-semibold text-white mb-2">Need help?</h4>
          <ul className="space-y-2 text-xs text-[#666]">
            <li className="flex items-start gap-2">
              <span className="text-[#CDB49E]">1.</span>
              Purchase a domain from a registrar (GoDaddy, Namecheap, Google Domains)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#CDB49E]">2.</span>
              Add the domain here and copy the DNS records shown
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#CDB49E]">3.</span>
              Add the DNS records in your registrar&apos;s DNS settings
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#CDB49E]">4.</span>
              Click &quot;Verify DNS&quot; once records are added (may take up to 48h)
            </li>
          </ul>
        </div>
      </div>

      {/* Add Domain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-[#111] rounded-2xl border border-[#333] w-[450px] shadow-2xl">
            <div className="p-4 border-b border-[#333] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Add Custom Domain</h3>
              <button 
                onClick={() => { setShowAddModal(false); setAddError(null); }} 
                className="p-2 rounded-lg text-[#666] hover:text-white hover:bg-[#222]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#888] mb-2">Domain Name</label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={e => { setNewDomain(e.target.value); setAddError(null); }}
                  placeholder="example.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#333] text-white placeholder:text-[#555] focus:border-[#CDB49E] focus:outline-none text-sm"
                  autoFocus
                />
                {addError && (
                  <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {addError}
                  </p>
                )}
              </div>

              <div className="p-3 rounded-lg bg-[#0a0a0a] border border-[#222] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#666] shrink-0 mt-0.5" />
                <p className="text-xs text-[#666]">
                  Enter your domain without &quot;https://&quot; or &quot;www&quot;. 
                  For example: <span className="text-white">mybusiness.com</span>
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-[#333] flex items-center justify-end gap-2">
              <button
                onClick={() => { setShowAddModal(false); setAddError(null); }}
                className="px-4 py-2 rounded-lg text-[#888] hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDomain}
                disabled={!newDomain.trim() || isAdding}
                className="px-4 py-2 rounded-lg bg-[#CDB49E] text-black font-medium text-sm hover:bg-[#d4c0ad] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isAdding && <Loader2 className="w-4 h-4 animate-spin" />}
                Add Domain
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
