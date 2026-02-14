'use client';

import { useState } from 'react';
import { 
  Plug, Search, ExternalLink, Check, Clock, 
  AlertCircle, RefreshCw, Settings, Loader2, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { INTEGRATIONS, Integration } from '@/lib/integrations';
import { toast } from 'sonner';

const categoryLabels = {
  accounting: 'Accounting',
  ecommerce: 'E-commerce',
  automation: 'Automation',
  payments: 'Payments'
};

const statusConfig = {
  available: { label: 'Available', class: 'bg-green-500/20 text-green-400', icon: Check },
  coming_soon: { label: 'Coming Soon', class: 'bg-neutral-500/20 text-neutral-400', icon: Clock },
  connected: { label: 'Connected', class: 'bg-blue-500/20 text-blue-400', icon: Check }
};

export default function IntegrationsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [connecting, setConnecting] = useState(false);

  const filteredIntegrations = INTEGRATIONS.filter(int => {
    const matchesSearch = int.name.toLowerCase().includes(search.toLowerCase()) ||
                          int.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || int.category === category;
    return matchesSearch && matchesCategory;
  });

  const connectedIntegrations = INTEGRATIONS.filter(int => int.status === 'connected');

  async function handleConnect(integration: Integration) {
    setConnecting(true);
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success(`Connected to ${integration.name}!`);
    setConnecting(false);
    setSelectedIntegration(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Integrations</h1>
        <p className="text-neutral-400 mt-1">
          Connect Atlas with your favorite tools and services
        </p>
      </div>

      {/* Connected integrations */}
      {connectedIntegrations.length > 0 && (
        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Check className="h-5 w-5 text-green-400" />
              Connected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedIntegrations.map((integration) => (
                <div 
                  key={integration.id}
                  className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg border border-neutral-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                      <img 
                        src={integration.icon} 
                        alt={integration.name}
                        className="w-6 h-6"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-white font-medium">{integration.name}</p>
                      <p className="text-xs text-green-400">Connected</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search integrations..."
            className="pl-10 bg-neutral-900 border-neutral-800 text-white"
          />
        </div>
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="bg-neutral-800">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="accounting">Accounting</TabsTrigger>
            <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Integrations grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map((integration) => {
          const status = statusConfig[integration.status];
          const StatusIcon = status.icon;

          return (
            <Card 
              key={integration.id}
              className="bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer"
              onClick={() => setSelectedIntegration(integration)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                    <Plug className="h-6 w-6 text-neutral-600" />
                  </div>
                  <Badge className={status.class}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-1">
                  {integration.name}
                </h3>
                <p className="text-sm text-neutral-400 mb-4">
                  {integration.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {integration.features.slice(0, 2).map((feature, i) => (
                    <Badge key={i} variant="outline" className="border-neutral-700 text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {integration.features.length > 2 && (
                    <Badge variant="outline" className="border-neutral-700 text-xs">
                      +{integration.features.length - 2} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12 text-neutral-500">
          <Plug className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No integrations found</p>
          <p className="text-sm">Try a different search term</p>
        </div>
      )}

      {/* Integration detail dialog */}
      <Dialog open={!!selectedIntegration} onOpenChange={() => setSelectedIntegration(null)}>
        {selectedIntegration && (
          <DialogContent className="bg-neutral-900 border-neutral-800 max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center">
                  <Plug className="h-7 w-7 text-neutral-600" />
                </div>
                <div>
                  <DialogTitle className="text-white text-xl">
                    {selectedIntegration.name}
                  </DialogTitle>
                  <DialogDescription className="text-neutral-400">
                    {categoryLabels[selectedIntegration.category]}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <p className="text-neutral-300">
                {selectedIntegration.description}
              </p>

              <div>
                <h4 className="text-sm font-medium text-white mb-2">Features</h4>
                <ul className="space-y-2">
                  {selectedIntegration.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-neutral-400">
                      <Check className="h-4 w-4 text-[#9C4A29]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {selectedIntegration.status === 'coming_soon' && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-sm text-amber-400">
                    This integration is coming soon. Join the waitlist to be notified when it's available.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                Cancel
              </Button>
              {selectedIntegration.status === 'available' ? (
                <Button 
                  onClick={() => handleConnect(selectedIntegration)}
                  disabled={connecting}
                  className="bg-[#9C4A29] hover:bg-[#9C4A29]/90 text-black"
                >
                  {connecting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Connect
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              ) : selectedIntegration.status === 'coming_soon' ? (
                <Button className="bg-[#9C4A29] hover:bg-[#9C4A29]/90 text-black">
                  Join Waitlist
                </Button>
              ) : (
                <Button variant="outline" className="border-neutral-700">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
