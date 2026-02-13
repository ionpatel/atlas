"use client";

import { useEffect, useState } from "react";
import { useWebsiteStore, BlockType } from "@/stores/website-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Globe,
  Plus,
  Settings,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  GripVertical,
  Layout,
  Type,
  Image,
  Users,
  DollarSign,
  MessageSquare,
  Mail,
  Grid,
  Star,
  Zap,
  ChevronRight,
  ExternalLink,
  Palette,
  FileText,
  Home,
} from "lucide-react";

const blockIcons: Record<BlockType, any> = {
  hero: Zap,
  features: Grid,
  pricing: DollarSign,
  testimonials: MessageSquare,
  cta: Star,
  gallery: Image,
  contact: Mail,
  text: Type,
  products: Layout,
  team: Users,
};

const blockLabels: Record<BlockType, string> = {
  hero: "Hero Section",
  features: "Features",
  pricing: "Pricing Table",
  testimonials: "Testimonials",
  cta: "Call to Action",
  gallery: "Gallery",
  contact: "Contact Form",
  text: "Text Block",
  products: "Products",
  team: "Team Members",
};

export default function WebsitePage() {
  const {
    pages,
    settings,
    currentPage,
    selectedBlock,
    previewMode,
    fetchPages,
    createPage,
    updatePage,
    deletePage,
    setCurrentPage,
    publishPage,
    addBlock,
    updateBlock,
    deleteBlock,
    selectBlock,
    duplicateBlock,
    togglePreview,
  } = useWebsiteStore();

  const [showNewPage, setShowNewPage] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");

  useEffect(() => {
    fetchPages("org1");
  }, []);

  const handleCreatePage = () => {
    if (!newPageTitle.trim()) return;
    createPage({
      title: newPageTitle,
      slug: `/${newPageTitle.toLowerCase().replace(/\s+/g, "-")}`,
    });
    setNewPageTitle("");
    setShowNewPage(false);
  };

  const handleAddBlock = (type: BlockType) => {
    if (currentPage) {
      addBlock(currentPage.id, type);
      setShowAddBlock(false);
    }
  };

  const currentBlock = currentPage?.blocks.find((b) => b.id === selectedBlock);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left Sidebar - Pages */}
      <div className="w-64 bg-[#111] border-r border-[#222] flex flex-col">
        <div className="p-4 border-b border-[#222]">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#CDB49E]" />
              Pages
            </h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowNewPage(true)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(page.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-left mb-1 transition-colors ${
                currentPage?.id === page.id
                  ? "bg-[#CDB49E]/10 border border-[#CDB49E]/30"
                  : "hover:bg-[#1a1a1a]"
              }`}
            >
              <div className="flex items-center gap-2">
                {page.is_homepage ? (
                  <Home className="h-4 w-4 text-[#CDB49E]" />
                ) : (
                  <FileText className="h-4 w-4 text-gray-500" />
                )}
                <span className="text-white text-sm">{page.title}</span>
              </div>
              <div className="flex items-center gap-1">
                {page.is_published ? (
                  <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                    Live
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs border-gray-500/30 text-gray-500">
                    Draft
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-[#222]">
          <Button
            variant="outline"
            className="w-full border-[#333] text-gray-400 hover:text-white"
            onClick={() => setShowSettings(true)}
          >
            <Palette className="h-4 w-4 mr-2" />
            Site Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {currentPage ? (
          <>
            {/* Toolbar */}
            <div className="h-14 bg-[#111] border-b border-[#222] flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <h1 className="font-semibold text-white">{currentPage.title}</h1>
                <span className="text-sm text-gray-500">{currentPage.slug}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePreview}
                  className={previewMode ? "text-[#CDB49E]" : "text-gray-400"}
                >
                  {previewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {previewMode ? "Edit" : "Preview"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Site
                </Button>
                <Button
                  size="sm"
                  onClick={() => publishPage(currentPage.id, !currentPage.is_published)}
                  className={
                    currentPage.is_published
                      ? "bg-gray-600 hover:bg-gray-700"
                      : "bg-green-600 hover:bg-green-700"
                  }
                >
                  {currentPage.is_published ? "Unpublish" : "Publish"}
                </Button>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-auto p-8 bg-[#0a0a0a]">
              <div className="max-w-4xl mx-auto">
                {currentPage.blocks.length === 0 ? (
                  <div className="border-2 border-dashed border-[#333] rounded-xl p-12 text-center">
                    <Layout className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      Start Building Your Page
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Add blocks to create your page layout
                    </p>
                    <Button
                      onClick={() => setShowAddBlock(true)}
                      className="bg-[#CDB49E] hover:bg-[#b9a089] text-black"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Block
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentPage.blocks
                      .sort((a, b) => a.order - b.order)
                      .map((block) => {
                        const Icon = blockIcons[block.type];
                        const isSelected = selectedBlock === block.id;

                        return (
                          <div
                            key={block.id}
                            onClick={() => selectBlock(block.id)}
                            className={`group relative border rounded-lg transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#CDB49E] bg-[#CDB49E]/5"
                                : "border-[#222] hover:border-[#444] bg-[#111]"
                            }`}
                          >
                            {/* Block Preview */}
                            <div className="p-6">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                                  <Icon className="h-5 w-5 text-[#CDB49E]" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-white">
                                    {blockLabels[block.type]}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {block.content?.title || block.content?.headline || "No title"}
                                  </p>
                                </div>
                              </div>

                              {/* Block Content Preview */}
                              {block.type === "hero" && (
                                <div className="bg-gradient-to-r from-[#1a1a1a] to-[#222] rounded-lg p-8 text-center">
                                  <h2 className="text-2xl font-bold text-white mb-2">
                                    {block.content?.headline}
                                  </h2>
                                  <p className="text-gray-400 mb-4">
                                    {block.content?.subheadline}
                                  </p>
                                  <div className="inline-block px-4 py-2 bg-[#CDB49E] text-black rounded-lg text-sm font-medium">
                                    {block.content?.buttonText}
                                  </div>
                                </div>
                              )}

                              {block.type === "features" && (
                                <div className="grid grid-cols-3 gap-4">
                                  {block.content?.features?.slice(0, 3).map((f: any, i: number) => (
                                    <div key={i} className="bg-[#1a1a1a] rounded-lg p-4 text-center">
                                      <span className="text-2xl mb-2 block">{f.icon}</span>
                                      <h5 className="text-white font-medium text-sm">{f.title}</h5>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {block.type === "pricing" && (
                                <div className="flex gap-4 justify-center">
                                  {block.content?.plans?.slice(0, 3).map((p: any, i: number) => (
                                    <div
                                      key={i}
                                      className={`flex-1 max-w-[150px] rounded-lg p-4 text-center ${
                                        p.popular ? "bg-[#CDB49E]/10 border border-[#CDB49E]/30" : "bg-[#1a1a1a]"
                                      }`}
                                    >
                                      <h5 className="text-white font-medium text-sm">{p.name}</h5>
                                      <p className="text-[#CDB49E] font-bold text-xl mt-2">${p.price}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {block.type === "cta" && (
                                <div className="bg-[#CDB49E]/10 rounded-lg p-6 text-center">
                                  <h3 className="text-white font-semibold">{block.content?.title}</h3>
                                  <p className="text-gray-400 text-sm mt-1">{block.content?.description}</p>
                                </div>
                              )}

                              {block.type === "text" && (
                                <div className="bg-[#1a1a1a] rounded-lg p-6">
                                  <h3 className="text-white font-semibold mb-2">{block.content?.title}</h3>
                                  <p className="text-gray-400 text-sm">{block.content?.body?.slice(0, 100)}...</p>
                                </div>
                              )}
                            </div>

                            {/* Block Actions */}
                            {isSelected && !previewMode && (
                              <div className="absolute -top-3 right-4 flex items-center gap-1 bg-[#111] border border-[#333] rounded-lg p-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                                >
                                  <GripVertical className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    duplicateBlock(currentPage.id, block.id);
                                  }}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteBlock(currentPage.id, block.id);
                                  }}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}

                            {/* Add Block Button (between blocks) */}
                            {!previewMode && (
                              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAddBlock(true);
                                  }}
                                  className="h-8 border-[#333] bg-[#111] text-gray-400 hover:text-white hover:border-[#CDB49E]"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add Block
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}

                    {/* Add Block at End */}
                    {!previewMode && (
                      <Button
                        variant="outline"
                        onClick={() => setShowAddBlock(true)}
                        className="w-full h-16 border-dashed border-[#333] text-gray-500 hover:text-white hover:border-[#CDB49E]"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Block
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Globe className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Website Builder
              </h2>
              <p className="text-gray-500 mb-6">
                Select a page to start editing or create a new one
              </p>
              <Button
                onClick={() => setShowNewPage(true)}
                className="bg-[#CDB49E] hover:bg-[#b9a089] text-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Page
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Block Settings */}
      {selectedBlock && currentBlock && !previewMode && (
        <div className="w-80 bg-[#111] border-l border-[#222] p-4 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">
              {blockLabels[currentBlock.type]}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => selectBlock(null)}
              className="h-8 w-8 p-0 text-gray-400"
            >
              ×
            </Button>
          </div>

          <div className="space-y-4">
            {/* Content Fields */}
            {currentBlock.content?.headline !== undefined && (
              <div>
                <label className="text-sm text-gray-400">Headline</label>
                <Input
                  value={currentBlock.content.headline}
                  onChange={(e) =>
                    updateBlock(currentPage!.id, currentBlock.id, {
                      content: { ...currentBlock.content, headline: e.target.value },
                    })
                  }
                  className="mt-1 bg-[#1a1a1a] border-[#333] text-white"
                />
              </div>
            )}

            {currentBlock.content?.subheadline !== undefined && (
              <div>
                <label className="text-sm text-gray-400">Subheadline</label>
                <Input
                  value={currentBlock.content.subheadline}
                  onChange={(e) =>
                    updateBlock(currentPage!.id, currentBlock.id, {
                      content: { ...currentBlock.content, subheadline: e.target.value },
                    })
                  }
                  className="mt-1 bg-[#1a1a1a] border-[#333] text-white"
                />
              </div>
            )}

            {currentBlock.content?.title !== undefined && (
              <div>
                <label className="text-sm text-gray-400">Title</label>
                <Input
                  value={currentBlock.content.title}
                  onChange={(e) =>
                    updateBlock(currentPage!.id, currentBlock.id, {
                      content: { ...currentBlock.content, title: e.target.value },
                    })
                  }
                  className="mt-1 bg-[#1a1a1a] border-[#333] text-white"
                />
              </div>
            )}

            {currentBlock.content?.buttonText !== undefined && (
              <div>
                <label className="text-sm text-gray-400">Button Text</label>
                <Input
                  value={currentBlock.content.buttonText}
                  onChange={(e) =>
                    updateBlock(currentPage!.id, currentBlock.id, {
                      content: { ...currentBlock.content, buttonText: e.target.value },
                    })
                  }
                  className="mt-1 bg-[#1a1a1a] border-[#333] text-white"
                />
              </div>
            )}

            {currentBlock.content?.description !== undefined && (
              <div>
                <label className="text-sm text-gray-400">Description</label>
                <textarea
                  value={currentBlock.content.description}
                  onChange={(e) =>
                    updateBlock(currentPage!.id, currentBlock.id, {
                      content: { ...currentBlock.content, description: e.target.value },
                    })
                  }
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#333] text-white rounded-md p-2 text-sm"
                  rows={3}
                />
              </div>
            )}

            {currentBlock.content?.body !== undefined && (
              <div>
                <label className="text-sm text-gray-400">Content</label>
                <textarea
                  value={currentBlock.content.body}
                  onChange={(e) =>
                    updateBlock(currentPage!.id, currentBlock.id, {
                      content: { ...currentBlock.content, body: e.target.value },
                    })
                  }
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#333] text-white rounded-md p-2 text-sm"
                  rows={6}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Page Dialog */}
      <Dialog open={showNewPage} onOpenChange={setShowNewPage}>
        <DialogContent className="bg-[#111] border-[#333] text-white">
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm text-gray-400">Page Title</label>
            <Input
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              placeholder="e.g., About Us"
              className="mt-1 bg-[#1a1a1a] border-[#333] text-white"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowNewPage(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreatePage}
              className="bg-[#CDB49E] hover:bg-[#b9a089] text-black"
            >
              Create Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Block Dialog */}
      <Dialog open={showAddBlock} onOpenChange={setShowAddBlock}>
        <DialogContent className="bg-[#111] border-[#333] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Block</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 py-4">
            {(Object.keys(blockLabels) as BlockType[]).map((type) => {
              const Icon = blockIcons[type];
              return (
                <button
                  key={type}
                  onClick={() => handleAddBlock(type)}
                  className="flex items-center gap-3 p-4 rounded-lg bg-[#1a1a1a] hover:bg-[#222] border border-[#333] hover:border-[#CDB49E] transition-colors text-left"
                >
                  <div className="h-10 w-10 rounded-lg bg-[#222] flex items-center justify-center">
                    <Icon className="h-5 w-5 text-[#CDB49E]" />
                  </div>
                  <span className="text-white text-sm font-medium">
                    {blockLabels[type]}
                  </span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Site Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#111] border-[#333] text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Site Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-gray-400">Site Name</label>
              <Input
                value={settings.site_name}
                className="mt-1 bg-[#1a1a1a] border-[#333] text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Tagline</label>
              <Input
                value={settings.tagline}
                className="mt-1 bg-[#1a1a1a] border-[#333] text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Primary Color</label>
                <div className="mt-1 flex items-center gap-2">
                  <div
                    className="h-10 w-10 rounded border border-[#333]"
                    style={{ backgroundColor: settings.primary_color }}
                  />
                  <Input
                    value={settings.primary_color}
                    className="bg-[#1a1a1a] border-[#333] text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Secondary Color</label>
                <div className="mt-1 flex items-center gap-2">
                  <div
                    className="h-10 w-10 rounded border border-[#333]"
                    style={{ backgroundColor: settings.secondary_color }}
                  />
                  <Input
                    value={settings.secondary_color}
                    className="bg-[#1a1a1a] border-[#333] text-white"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowSettings(false)}
              className="bg-[#CDB49E] hover:bg-[#b9a089] text-black"
            >
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
