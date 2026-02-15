"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  MoreVertical,
  Check,
  AlertCircle,
  Clock,
  Activity,
  Shield,
  Code,
  Book,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────── Types ─────────────────────── */

interface ApiKey {
  id: string;
  name: string;
  description?: string;
  keyPrefix: string;
  permissions: string[];
  rateLimit: number;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

/* ─────────────────────── Mock Data ─────────────────────── */

const mockApiKeys: ApiKey[] = [
  {
    id: "1",
    name: "Production API",
    description: "Main API key for production systems",
    keyPrefix: "atlas_abc123",
    permissions: ["read", "write"],
    rateLimit: 5000,
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: "2",
    name: "Development Key",
    description: "For local development and testing",
    keyPrefix: "atlas_dev456",
    permissions: ["read"],
    rateLimit: 1000,
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
];

/* ─────────────────────── Create Key Modal ─────────────────────── */

function CreateKeyModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (key: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<string[]>(["read"]);
  const [expiresIn, setExpiresIn] = useState<string>("never");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate mock key
    const mockKey = `atlas_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    setLoading(false);
    onCreated(mockKey);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-[#262626] rounded-xl shadow-2xl">
        <div className="p-6 border-b border-[#262626]">
          <h2 className="text-lg font-semibold text-[#FAFAFA]">Create API Key</h2>
          <p className="text-sm text-[#FAFAFA] mt-1">
            Generate a new API key for external access
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#FAFAFA] mb-2">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Production API"
              className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-[#FAFAFA] text-sm placeholder-[#273B3A] focus:outline-none focus:border-[#262626]/40"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#FAFAFA] mb-2">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this key used for?"
              className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-[#FAFAFA] text-sm placeholder-[#273B3A] focus:outline-none focus:border-[#262626]/40"
            />
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-[#FAFAFA] mb-2">
              Permissions
            </label>
            <div className="flex gap-3">
              {["read", "write", "delete"].map((perm) => (
                <label
                  key={perm}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes(perm)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPermissions([...permissions, perm]);
                      } else {
                        setPermissions(permissions.filter((p) => p !== perm));
                      }
                    }}
                    className="w-4 h-4 rounded border-[#262626] bg-[#0A0A0A] text-[#FAFAFA] focus:ring-[#CDB49E]/40"
                  />
                  <span className="text-sm text-[#cccccc] capitalize">{perm}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Expiration */}
          <div>
            <label className="block text-sm font-medium text-[#FAFAFA] mb-2">
              Expiration
            </label>
            <select
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#262626] rounded-lg text-[#FAFAFA] text-sm focus:outline-none focus:border-[#262626]/40"
            >
              <option value="never">Never</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-[#262626] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#FAFAFA] hover:text-[#FAFAFA] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#161616] text-[#0A0A0A] rounded-lg text-sm font-semibold hover:bg-[#161616] disabled:opacity-50 transition-all"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Key className="w-4 h-4" />
            )}
            Create Key
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Key Created Modal ─────────────────────── */

function KeyCreatedModal({
  apiKey,
  onClose,
}: {
  apiKey: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(true);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-[#262626] rounded-xl shadow-2xl">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold text-[#FAFAFA] text-center">
            API Key Created
          </h2>
          <p className="text-sm text-[#FAFAFA] text-center mt-2">
            Make sure to copy your API key now. You won't be able to see it again!
          </p>
        </div>

        <div className="px-6 pb-6">
          <div className="p-4 bg-[#0A0A0A] border border-[#262626] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#FAFAFA]">Your API Key</span>
              <button
                onClick={() => setShowKey(!showKey)}
                className="text-[#FAFAFA] hover:text-[#FAFAFA] transition-colors"
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <code className="block text-sm text-[#FAFAFA] font-mono break-all">
              {showKey ? apiKey : "•".repeat(apiKey.length)}
            </code>
          </div>

          <button
            onClick={handleCopy}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0A0A0A] text-[#FAFAFA] rounded-lg text-sm font-medium hover:bg-[#0A0A0A] transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy to Clipboard
              </>
            )}
          </button>

          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-400">
              Store this key securely. It provides access to your organization's data.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-[#262626]">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-[#161616] text-[#0A0A0A] rounded-lg text-sm font-semibold hover:bg-[#161616] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── API Key Row ─────────────────────── */

function ApiKeyRow({
  apiKey,
  onRevoke,
}: {
  apiKey: ApiKey;
  onRevoke: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const isExpired = apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date();

  return (
    <div className="flex items-center justify-between p-4 bg-[#0A0A0A] border border-[#262626] rounded-lg">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-[#0A0A0A] flex items-center justify-center">
          <Key className="w-5 h-5 text-[#FAFAFA]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-[#FAFAFA]">{apiKey.name}</p>
            {isExpired && (
              <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-medium rounded">
                Expired
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <code className="text-xs text-[#FAFAFA] font-mono">
              {apiKey.keyPrefix}...
            </code>
            <span className="text-xs text-[#FAFAFA]">•</span>
            <span className="text-xs text-[#FAFAFA]">
              {apiKey.permissions.join(", ")}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-[#FAFAFA]">
            {apiKey.lastUsedAt
              ? `Last used ${getRelativeTime(apiKey.lastUsedAt)}`
              : "Never used"}
          </p>
          <p className="text-[10px] text-[#FAFAFA] mt-0.5">
            Created {new Date(apiKey.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-[#FAFAFA] hover:text-[#FAFAFA] hover:bg-[#0A0A0A] rounded-lg transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-40 bg-[#0A0A0A] border border-[#262626] rounded-lg shadow-xl z-20 overflow-hidden">
                <button
                  onClick={() => {
                    onRevoke(apiKey.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Revoke Key
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Helper ─────────────────────── */

function getRelativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */

export default function ApiPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const handleKeyCreated = (key: string) => {
    setShowCreateModal(false);
    setNewKey(key);

    // Add mock key to list
    const newApiKey: ApiKey = {
      id: Date.now().toString(),
      name: "New API Key",
      keyPrefix: key.substring(0, 12),
      permissions: ["read"],
      rateLimit: 1000,
      createdAt: new Date().toISOString(),
    };
    setApiKeys([newApiKey, ...apiKeys]);
  };

  const handleRevoke = (id: string) => {
    if (confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      setApiKeys(apiKeys.filter((k) => k.id !== id));
    }
  };

  return (
    <div className="max-w-[1000px]">
      {/* Back link */}
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 text-sm text-[#FAFAFA] hover:text-[#FAFAFA] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Settings
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#FAFAFA]">
            API Keys
          </h1>
          <p className="text-[#FAFAFA] text-sm mt-1">
            Manage API keys for external integrations
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#161616] text-[#0A0A0A] rounded-lg text-sm font-semibold hover:bg-[#161616] transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Key
        </button>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <a
          href="/docs/api"
          className="p-4 bg-[#0A0A0A] border border-[#262626] rounded-xl hover:border-[#3a3a3a] transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0A0A0A] group-hover:bg-[#161616]/10 transition-colors">
              <Book className="w-4 h-4 text-[#FAFAFA] group-hover:text-[#FAFAFA]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#FAFAFA]">API Documentation</p>
              <p className="text-xs text-[#FAFAFA]">Learn how to use the API</p>
            </div>
          </div>
        </a>
        <a
          href="/docs/api/reference"
          className="p-4 bg-[#0A0A0A] border border-[#262626] rounded-xl hover:border-[#3a3a3a] transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0A0A0A] group-hover:bg-[#161616]/10 transition-colors">
              <Code className="w-4 h-4 text-[#FAFAFA] group-hover:text-[#FAFAFA]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#FAFAFA]">API Reference</p>
              <p className="text-xs text-[#FAFAFA]">Endpoints & schemas</p>
            </div>
          </div>
        </a>
        <a
          href="/settings/api/webhooks"
          className="p-4 bg-[#0A0A0A] border border-[#262626] rounded-xl hover:border-[#3a3a3a] transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0A0A0A] group-hover:bg-[#161616]/10 transition-colors">
              <Activity className="w-4 h-4 text-[#FAFAFA] group-hover:text-[#FAFAFA]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#FAFAFA]">Webhooks</p>
              <p className="text-xs text-[#FAFAFA]">Receive event notifications</p>
            </div>
          </div>
        </a>
      </div>

      {/* API Keys List */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#FAFAFA] mb-4">Your API Keys</h2>
        {apiKeys.length > 0 ? (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <ApiKeyRow key={key.id} apiKey={key} onRevoke={handleRevoke} />
            ))}
          </div>
        ) : (
          <div className="p-8 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center">
            <Key className="w-10 h-10 text-[#FAFAFA] mx-auto mb-3" />
            <p className="text-[#FAFAFA] text-sm">No API keys yet</p>
            <p className="text-[#FAFAFA] text-xs mt-1">
              Create an API key to start integrating
            </p>
          </div>
        )}
      </div>

      {/* Usage Info */}
      <div className="p-6 bg-[#0A0A0A] border border-[#262626] rounded-xl">
        <h3 className="text-sm font-semibold text-[#FAFAFA] mb-4">API Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-2xl font-bold text-[#FAFAFA]">1,247</p>
            <p className="text-xs text-[#FAFAFA] mt-1">Requests today</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#FAFAFA]">98.5%</p>
            <p className="text-xs text-[#FAFAFA] mt-1">Success rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#FAFAFA]">45ms</p>
            <p className="text-xs text-[#FAFAFA] mt-1">Avg response time</p>
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className="mt-6 p-4 bg-[#0A0A0A] border border-[#262626] rounded-xl flex items-start gap-3">
        <Shield className="w-5 h-5 text-[#FAFAFA] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-[#FAFAFA]">Keep your keys safe</p>
          <p className="text-xs text-[#FAFAFA] mt-1">
            Never share API keys in public repositories or client-side code. 
            Rotate keys regularly and revoke any that may have been compromised.
          </p>
        </div>
      </div>

      {/* Modals */}
      <CreateKeyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleKeyCreated}
      />

      {newKey && (
        <KeyCreatedModal
          apiKey={newKey}
          onClose={() => setNewKey(null)}
        />
      )}
    </div>
  );
}
