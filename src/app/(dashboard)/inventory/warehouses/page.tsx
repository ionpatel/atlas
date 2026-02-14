'use client';

import { useState, useEffect } from 'react';
import { 
  Warehouse, Plus, Search, MoreHorizontal, MapPin,
  Package, ArrowRightLeft, Loader2, Trash2, Edit2,
  CheckCircle, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';

interface WarehouseData {
  id: string;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  province: string | null;
  is_default: boolean;
  is_active: boolean;
  product_count?: number;
  total_value?: number;
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formProvince, setFormProvince] = useState('');

  useEffect(() => {
    loadWarehouses();
  }, []);

  async function loadWarehouses() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name');

      if (error) throw error;
      setWarehouses(data || []);
    } catch (error) {
      console.error('Failed to load warehouses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createWarehouse() {
    if (!formName || !formCode) {
      toast.error('Name and code are required');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('warehouses')
        .insert({
          name: formName,
          code: formCode.toUpperCase(),
          address: formAddress || null,
          city: formCity || null,
          province: formProvince || null,
          is_default: warehouses.length === 0
        });

      if (error) throw error;

      toast.success('Warehouse created');
      setShowCreate(false);
      resetForm();
      loadWarehouses();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create warehouse');
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setFormName('');
    setFormCode('');
    setFormAddress('');
    setFormCity('');
    setFormProvince('');
  }

  async function setDefault(id: string) {
    try {
      // Remove default from all
      await supabase
        .from('warehouses')
        .update({ is_default: false })
        .neq('id', id);

      // Set new default
      const { error } = await supabase
        .from('warehouses')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      toast.success('Default warehouse updated');
      loadWarehouses();
    } catch (error) {
      toast.error('Failed to update');
    }
  }

  async function toggleActive(id: string, active: boolean) {
    try {
      const { error } = await supabase
        .from('warehouses')
        .update({ is_active: active })
        .eq('id', id);

      if (error) throw error;

      setWarehouses(prev => prev.map((w: any) =>
        w.id === id ? { ...w, is_active: active } : w
      ));
    } catch (error) {
      toast.error('Failed to update');
    }
  }

  async function deleteWarehouse(id: string) {
    if (!confirm('Delete this warehouse? Stock levels will be lost.')) return;

    try {
      const { error } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Warehouse deleted');
      loadWarehouses();
    } catch (error) {
      toast.error('Failed to delete');
    }
  }

  const filtered = warehouses.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.code.toLowerCase().includes(search.toLowerCase()) ||
    w.city?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#273B3A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/inventory" className="text-[#4A5654] hover:text-white">
              Inventory
            </Link>
            <span className="text-[#6B7876]">/</span>
            <span className="text-white">Warehouses</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Warehouses</h1>
          <p className="text-[#4A5654]">
            Manage multiple locations and track stock per warehouse
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/inventory/transfers">
            <Button variant="outline" className="border-[#D8CAC0]">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Stock Transfers
            </Button>
          </Link>
          <Button 
            className="bg-gradient-to-r from-[#273B3A] to-[#1E2E2D] text-[#E6D4C7]"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Warehouse
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-[#F0E6E0] border-[#D8CAC0]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#4A5654] mb-1">
              <Warehouse className="h-4 w-4" />
              <span className="text-sm">Total Warehouses</span>
            </div>
            <p className="text-2xl font-bold text-white">{warehouses.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#F0E6E0] border-[#D8CAC0]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#4A5654] mb-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Active</span>
            </div>
            <p className="text-2xl font-bold text-green-400">
              {warehouses.filter(w => w.is_active).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#F0E6E0] border-[#D8CAC0]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[#4A5654] mb-1">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">Cities</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {new Set(warehouses.map((w: any) => w.city).filter(Boolean)).size}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7876]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search warehouses..."
          className="pl-10 bg-[#F0E6E0] border-[#D8CAC0] text-white"
        />
      </div>

      {/* Warehouse Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <Card className="bg-[#F0E6E0] border-[#D8CAC0] border-dashed col-span-full">
            <CardContent className="p-8 text-center">
              <Warehouse className="h-12 w-12 mx-auto mb-4 text-[#6B7876]" />
              <p className="text-[#4A5654]">No warehouses found</p>
              <p className="text-sm text-[#6B7876]">Create your first warehouse to manage inventory locations</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((warehouse) => (
            <Card key={warehouse.id} className="bg-[#F0E6E0] border-[#D8CAC0]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#D8CAC0]">
                      <Building2 className="h-5 w-5 text-[#273B3A]" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{warehouse.name}</CardTitle>
                      <p className="text-xs text-[#6B7876]">{warehouse.code}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#F0E6E0] border-[#D8CAC0]">
                      <DropdownMenuItem>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {!warehouse.is_default && (
                        <DropdownMenuItem onClick={() => setDefault(warehouse.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Set as Default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-[#D8CAC0]" />
                      <DropdownMenuItem
                        onClick={() => deleteWarehouse(warehouse.id)}
                        className="text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {(warehouse.city || warehouse.province) && (
                  <div className="flex items-center gap-1 text-[#4A5654] text-sm mb-4">
                    <MapPin className="h-3 w-3" />
                    {[warehouse.city, warehouse.province].filter(Boolean).join(', ')}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-[#D8CAC0]">
                  <div className="flex items-center gap-2">
                    {warehouse.is_default && (
                      <Badge className="bg-[#273B3A]/20 text-[#273B3A]">Default</Badge>
                    )}
                    <Badge className={warehouse.is_active 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-neutral-500/20 text-neutral-400'
                    }>
                      {warehouse.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <Switch
                    checked={warehouse.is_active}
                    onCheckedChange={(checked) => toggleActive(warehouse.id, checked)}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#F0E6E0] border-[#D8CAC0]">
          <DialogHeader>
            <DialogTitle className="text-white">Add Warehouse</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Name *</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Main Warehouse"
                  className="bg-[#E6D4C7] border-[#D8CAC0] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Code *</Label>
                <Input
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="MAIN"
                  maxLength={10}
                  className="bg-[#E6D4C7] border-[#D8CAC0] text-white uppercase"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Address</Label>
              <Input
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="123 Industrial Blvd"
                className="bg-[#E6D4C7] border-[#D8CAC0] text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">City</Label>
                <Input
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  placeholder="Toronto"
                  className="bg-[#E6D4C7] border-[#D8CAC0] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Province</Label>
                <Input
                  value={formProvince}
                  onChange={(e) => setFormProvince(e.target.value)}
                  placeholder="ON"
                  className="bg-[#E6D4C7] border-[#D8CAC0] text-white"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button 
              onClick={createWarehouse}
              disabled={saving}
              className="bg-[#273B3A] text-[#E6D4C7]"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Warehouse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
