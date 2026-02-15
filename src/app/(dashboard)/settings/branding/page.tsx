'use client';

import { useState } from 'react';
import { 
  Palette, Upload, Type, Eye, Save, Loader2, 
  Sun, Moon, RefreshCw, Globe, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface BrandingConfig {
  companyName: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
  darkMode: boolean;
  hideAtlasBranding: boolean;
  customDomain: string;
  emailFromName: string;
  emailFromDomain: string;
}

const COLOR_PRESETS = [
  { name: 'Gold', primary: '#CDB49E', accent: 'rgba(156,74,41,0.15)' },
  { name: 'Blue', primary: '#3B82F6', accent: '#1E40AF' },
  { name: 'Green', primary: '#10B981', accent: '#065F46' },
  { name: 'Purple', primary: '#8B5CF6', accent: '#5B21B6' },
  { name: 'Red', primary: '#EF4444', accent: '#991B1B' },
  { name: 'Orange', primary: '#F97316', accent: '#9A3412' },
];

const FONT_OPTIONS = [
  { value: 'inter', label: 'Inter (Default)' },
  { value: 'plus-jakarta', label: 'Plus Jakarta Sans' },
  { value: 'dm-sans', label: 'DM Sans' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'manrope', label: 'Manrope' },
];

export default function BrandingPage() {
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<BrandingConfig>({
    companyName: 'Atlas Demo',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#CDB49E',
    accentColor: 'rgba(156,74,41,0.15)',
    fontFamily: 'inter',
    borderRadius: 'md',
    darkMode: true,
    hideAtlasBranding: false,
    customDomain: '',
    emailFromName: 'Atlas ERP',
    emailFromDomain: 'atlas-erp.com'
  });

  function updateConfig<K extends keyof BrandingConfig>(key: K, value: BrandingConfig[K]) {
    setConfig(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Branding settings saved');
    setSaving(false);
  }

  function applyColorPreset(preset: typeof COLOR_PRESETS[0]) {
    updateConfig('primaryColor', preset.primary);
    updateConfig('accentColor', preset.accent);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Branding</h1>
          <p className="text-[#6B7280] mt-1">
            Customize the look and feel of your Atlas workspace
          </p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-white hover:bg-[#F1F3F5]/90 text-black"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="appearance">
        <TabsList className="bg-[#F1F3F5]">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="domain">Custom Domain</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6 mt-6">
          {/* Colors */}
          <Card className="bg-white border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="h-5 w-5 text-[#111827]" />
                Colors
              </CardTitle>
              <CardDescription className="text-[#6B7280]">
                Choose your brand colors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color presets */}
              <div>
                <Label className="text-white mb-3 block">Quick Presets</Label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyColorPreset(preset)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#D1D5DB] hover:border-[#D1D5DB] transition-colors"
                    >
                      <div 
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <span className="text-sm text-white">{preset.name}</span>
                      {config.primaryColor === preset.primary && (
                        <Check className="h-3 w-3 text-green-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom colors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary" className="text-white">Primary Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-10 h-10 rounded-lg border border-[#D1D5DB]"
                      style={{ backgroundColor: config.primaryColor }}
                    />
                    <Input
                      id="primary"
                      type="text"
                      value={config.primaryColor}
                      onChange={(e) => updateConfig('primaryColor', e.target.value)}
                      className="bg-[#F1F3F5] border-[#D1D5DB] text-white font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent" className="text-white">Accent Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-10 h-10 rounded-lg border border-[#D1D5DB]"
                      style={{ backgroundColor: config.accentColor }}
                    />
                    <Input
                      id="accent"
                      type="text"
                      value={config.accentColor}
                      onChange={(e) => updateConfig('accentColor', e.target.value)}
                      className="bg-[#F1F3F5] border-[#D1D5DB] text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card className="bg-white border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Type className="h-5 w-5 text-[#111827]" />
                Typography
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Font Family</Label>
                <Select 
                  value={config.fontFamily} 
                  onValueChange={(v) => updateConfig('fontFamily', v)}
                >
                  <SelectTrigger className="bg-[#F1F3F5] border-[#D1D5DB] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#F1F3F5] border-[#D1D5DB]">
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Border Radius</Label>
                <Select 
                  value={config.borderRadius} 
                  onValueChange={(v) => updateConfig('borderRadius', v)}
                >
                  <SelectTrigger className="bg-[#F1F3F5] border-[#D1D5DB] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#F1F3F5] border-[#D1D5DB]">
                    <SelectItem value="none">Sharp (0px)</SelectItem>
                    <SelectItem value="sm">Small (4px)</SelectItem>
                    <SelectItem value="md">Medium (8px)</SelectItem>
                    <SelectItem value="lg">Large (12px)</SelectItem>
                    <SelectItem value="xl">Extra Large (16px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Theme */}
          <Card className="bg-white border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {config.darkMode ? <Moon className="h-5 w-5 text-[#111827]" /> : <Sun className="h-5 w-5 text-[#111827]" />}
                Theme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Dark Mode</p>
                  <p className="text-sm text-[#6B7280]">Use dark theme throughout the app</p>
                </div>
                <Switch
                  checked={config.darkMode}
                  onCheckedChange={(v) => updateConfig('darkMode', v)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="identity" className="space-y-6 mt-6">
          {/* Logo & Favicon */}
          <Card className="bg-white border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-white">Logo & Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-white">Company Name</Label>
                <Input
                  id="companyName"
                  value={config.companyName}
                  onChange={(e) => updateConfig('companyName', e.target.value)}
                  className="bg-[#F1F3F5] border-[#D1D5DB] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white">Logo</Label>
                  <div className="border-2 border-dashed border-[#D1D5DB] rounded-lg p-8 text-center hover:border-[#D1D5DB] transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-[#9CA3AF]" />
                    <p className="text-sm text-[#6B7280]">Click to upload</p>
                    <p className="text-xs text-[#9CA3AF] mt-1">PNG, SVG up to 1MB</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Favicon</Label>
                  <div className="border-2 border-dashed border-[#D1D5DB] rounded-lg p-8 text-center hover:border-[#D1D5DB] transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-[#9CA3AF]" />
                    <p className="text-sm text-[#6B7280]">Click to upload</p>
                    <p className="text-xs text-[#9CA3AF] mt-1">32x32 or 64x64 PNG</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div>
                  <p className="text-white font-medium">Hide Atlas Branding</p>
                  <p className="text-sm text-amber-400">Remove "Powered by Atlas" footer (Pro plan)</p>
                </div>
                <Switch
                  checked={config.hideAtlasBranding}
                  onCheckedChange={(v) => updateConfig('hideAtlasBranding', v)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain" className="space-y-6 mt-6">
          <Card className="bg-white border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#111827]" />
                Custom Domain
              </CardTitle>
              <CardDescription className="text-[#6B7280]">
                Use your own domain for Atlas (Enterprise plan)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain" className="text-white">Domain</Label>
                <Input
                  id="domain"
                  value={config.customDomain}
                  onChange={(e) => updateConfig('customDomain', e.target.value)}
                  placeholder="erp.yourcompany.com"
                  className="bg-[#F1F3F5] border-[#D1D5DB] text-white"
                />
              </div>

              <div className="p-4 bg-white rounded-lg space-y-2">
                <p className="text-sm font-medium text-white">DNS Configuration</p>
                <p className="text-sm text-[#6B7280]">
                  Add a CNAME record pointing to:
                </p>
                <code className="text-sm text-[#111827] bg-white px-3 py-2 rounded block">
                  atlas-erp.vercel.app
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="space-y-6 mt-6">
          <Card className="bg-white border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-white">Email Branding</CardTitle>
              <CardDescription className="text-[#6B7280]">
                Customize how emails appear to your customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromName" className="text-white">From Name</Label>
                  <Input
                    id="fromName"
                    value={config.emailFromName}
                    onChange={(e) => updateConfig('emailFromName', e.target.value)}
                    className="bg-[#F1F3F5] border-[#D1D5DB] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromDomain" className="text-white">From Domain</Label>
                  <Input
                    id="fromDomain"
                    value={config.emailFromDomain}
                    onChange={(e) => updateConfig('emailFromDomain', e.target.value)}
                    className="bg-[#F1F3F5] border-[#D1D5DB] text-white"
                  />
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg">
                <p className="text-sm text-[#6B7280] mb-2">Preview:</p>
                <p className="text-white">
                  {config.emailFromName} &lt;noreply@{config.emailFromDomain}&gt;
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
