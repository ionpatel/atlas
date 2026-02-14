"use client";

import { useState, useMemo } from "react";
import {
  FileText, Plus, Search, Filter, X, Folder, FolderOpen, File, Image, FileSpreadsheet,
  FileArchive, Star, StarOff, Download, Share2, Trash2, Eye, Clock, Upload,
  Grid, List, ChevronRight, ArrowLeft, MoreHorizontal, Link2, Copy, Check,
  HardDrive, AlertCircle, Settings, History, ExternalLink,
} from "lucide-react";
import { useDocumentsStore } from "@/stores/documents-store";
import { Modal } from "@/components/ui/modal";
import { useToastStore } from "@/components/ui/toast";
import { formatDate, cn } from "@/lib/utils";
import type { Document, DocumentFolder, DocumentVersion } from "@/types";

// File icons by type
function getFileIcon(fileType?: string) {
  if (!fileType) return FileText;
  if (fileType.startsWith("image/")) return Image;
  if (fileType.includes("spreadsheet") || fileType.includes("excel")) return FileSpreadsheet;
  if (fileType.includes("zip") || fileType.includes("archive")) return FileArchive;
  return FileText;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function StorageIndicator({ used, total }: { used: number; total: number }) {
  const percentage = (used / total) * 100;
  const usedGB = (used / (1024 * 1024 * 1024)).toFixed(2);
  const totalGB = (total / (1024 * 1024 * 1024)).toFixed(0);

  return (
    <div className="p-4 bg-[#F0E6E0] border border-[#D8CAC0] rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-[#273B3A]" />
          <span className="text-sm font-medium text-[#1A2726]">Storage</span>
        </div>
        <span className="text-xs text-[#6B7876]">{usedGB} GB / {totalGB} GB</span>
      </div>
      <div className="h-2 bg-[#E6D4C7] rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            percentage > 90 ? "bg-red-500" : percentage > 75 ? "bg-amber-500" : "bg-[#273B3A]"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function BreadcrumbNav({
  path,
  onNavigate,
}: {
  path: DocumentFolder[];
  onNavigate: (folderId: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <button
        onClick={() => onNavigate(null)}
        className="px-2 py-1 rounded hover:bg-[#F0E6E0] text-[#6B7876] hover:text-[#1A2726] transition-colors"
      >
        Documents
      </button>
      {path.map((folder, i) => (
        <div key={folder.id} className="flex items-center gap-1.5">
          <ChevronRight className="w-4 h-4 text-[#D8CAC0]" />
          <button
            onClick={() => onNavigate(folder.id)}
            className={cn(
              "px-2 py-1 rounded transition-colors",
              i === path.length - 1
                ? "text-[#1A2726] font-medium"
                : "text-[#6B7876] hover:text-[#1A2726] hover:bg-[#F0E6E0]"
            )}
          >
            {folder.name}
          </button>
        </div>
      ))}
    </div>
  );
}

function FolderCard({
  folder,
  onClick,
}: {
  folder: DocumentFolder;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 bg-[#F0E6E0] border border-[#D8CAC0] rounded-xl hover:border-[#273B3A]/50 transition-all text-left group"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${folder.color || "#273B3A"}20` }}
      >
        <span style={{ color: folder.color || "#273B3A" }}><Folder className="w-5 h-5" /></span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1A2726] truncate">{folder.name}</p>
        {folder.description && (
          <p className="text-xs text-[#6B7876] truncate">{folder.description}</p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-[#D8CAC0] group-hover:text-[#273B3A] transition-colors" />
    </button>
  );
}

function DocumentCard({
  document,
  viewMode,
  isSelected,
  onSelect,
  onClick,
  onStar,
}: {
  document: Document;
  viewMode: "grid" | "list";
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
  onStar: () => void;
}) {
  const FileIcon = getFileIcon(document.file_type);

  if (viewMode === "list") {
    return (
      <div
        className={cn(
          "flex items-center gap-4 p-4 border-b border-[#D8CAC0]/50 hover:bg-[#E6D4C7]/50 transition-colors cursor-pointer",
          isSelected && "bg-[#273B3A]/10"
        )}
        onClick={onClick}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="w-4 h-4 rounded border-[#D8CAC0] bg-[#E6D4C7] text-[#273B3A] focus:ring-[#273B3A]/30"
        />
        <div className="w-10 h-10 rounded-lg bg-[#273B3A]/10 flex items-center justify-center flex-shrink-0">
          <FileIcon className="w-5 h-5 text-[#273B3A]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-[#1A2726] truncate">{document.name}</p>
            {document.is_starred && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-[#6B7876]">{formatFileSize(document.file_size)}</span>
            <span className="text-xs text-[#6B7876]">v{document.version}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#6B7876]">{formatDate(document.updated_at)}</p>
          <p className="text-xs text-[#6B7876]">{document.uploader_name}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStar();
            }}
            className="p-2 rounded-lg text-[#6B7876] hover:text-amber-400 hover:bg-amber-500/10"
          >
            {document.is_starred ? (
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            ) : (
              <StarOff className="w-4 h-4" />
            )}
          </button>
          <button className="p-2 rounded-lg text-[#6B7876] hover:text-[#273B3A] hover:bg-[#273B3A]/10">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-[#6B7876] hover:text-[#273B3A] hover:bg-[#273B3A]/10">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-4 bg-[#F0E6E0] border rounded-xl cursor-pointer transition-all group",
        isSelected
          ? "border-[#273B3A] bg-[#273B3A]/10"
          : "border-[#D8CAC0] hover:border-[#273B3A]/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-lg bg-[#273B3A]/10 flex items-center justify-center">
          <FileIcon className="w-6 h-6 text-[#273B3A]" />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStar();
            }}
            className="p-1.5 rounded-lg text-[#6B7876] hover:text-amber-400 hover:bg-amber-500/10"
          >
            {document.is_starred ? (
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ) : (
              <StarOff className="w-3.5 h-3.5" />
            )}
          </button>
          <button className="p-1.5 rounded-lg text-[#6B7876] hover:text-[#273B3A] hover:bg-[#273B3A]/10">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <p className="text-sm font-medium text-[#1A2726] truncate mb-1">{document.name}</p>
      <div className="flex items-center gap-2 text-xs text-[#6B7876]">
        <span>{formatFileSize(document.file_size)}</span>
        <span>•</span>
        <span>{formatDate(document.updated_at)}</span>
      </div>
      {document.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {document.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 bg-[#E6D4C7] text-[10px] text-[#6B7876] rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentPreviewModal({
  document,
  open,
  onClose,
}: {
  document: Document;
  open: boolean;
  onClose: () => void;
}) {
  const { getVersions, getSharesByDocument, createShareLink, toggleStar } = useDocumentsStore();
  const addToast = useToastStore((s) => s.addToast);
  const versions = getVersions(document.id);
  const shares = getSharesByDocument(document.id);
  const [activeTab, setActiveTab] = useState<"preview" | "versions" | "sharing">("preview");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  const FileIcon = getFileIcon(document.file_type);

  const handleCreateShare = () => {
    const share = createShareLink(document.id, "view", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
    const link = `https://atlas.app/share/${share.share_token}`;
    setShareLink(link);
    addToast("Share link created");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast("Link copied to clipboard");
  };

  return (
    <Modal open={open} onClose={onClose} title={document.name} size="xl">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[#E6D4C7] rounded-lg">
          {(["preview", "versions", "sharing"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === tab
                  ? "bg-[#273B3A] text-[#E6D4C7]"
                  : "text-[#4A5654] hover:text-[#1A2726]"
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Preview Tab */}
        {activeTab === "preview" && (
          <div className="space-y-6">
            {/* File preview placeholder */}
            <div className="aspect-video bg-[#E6D4C7] rounded-xl flex flex-col items-center justify-center border border-[#D8CAC0]">
              <FileIcon className="w-16 h-16 text-[#D8CAC0] mb-4" />
              <p className="text-sm text-[#6B7876]">Preview not available</p>
              <button className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#273B3A] text-[#E6D4C7] rounded-lg text-sm font-medium">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>

            {/* File details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#E6D4C7] rounded-lg">
                <p className="text-xs text-[#6B7876] mb-1">File Type</p>
                <p className="text-sm text-[#1A2726]">{document.file_type || "Unknown"}</p>
              </div>
              <div className="p-4 bg-[#E6D4C7] rounded-lg">
                <p className="text-xs text-[#6B7876] mb-1">File Size</p>
                <p className="text-sm text-[#1A2726]">{formatFileSize(document.file_size)}</p>
              </div>
              <div className="p-4 bg-[#E6D4C7] rounded-lg">
                <p className="text-xs text-[#6B7876] mb-1">Uploaded By</p>
                <p className="text-sm text-[#1A2726]">{document.uploader_name || "Unknown"}</p>
              </div>
              <div className="p-4 bg-[#E6D4C7] rounded-lg">
                <p className="text-xs text-[#6B7876] mb-1">Last Modified</p>
                <p className="text-sm text-[#1A2726]">{formatDate(document.updated_at)}</p>
              </div>
            </div>

            {document.description && (
              <div>
                <p className="text-xs text-[#6B7876] mb-2">Description</p>
                <p className="text-sm text-[#4A5654]">{document.description}</p>
              </div>
            )}

            {document.tags.length > 0 && (
              <div>
                <p className="text-xs text-[#6B7876] mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-[#273B3A]/10 text-[#273B3A] text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Versions Tab */}
        {activeTab === "versions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#6B7876]">
                Current version: <span className="text-[#1A2726] font-medium">v{document.version}</span>
              </p>
              <button className="text-xs text-[#273B3A] hover:text-[#7DD3FC]">
                Upload New Version
              </button>
            </div>

            {versions.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 mx-auto mb-3 text-[#D8CAC0]" />
                <p className="text-sm text-[#6B7876]">No previous versions</p>
              </div>
            ) : (
              <div className="space-y-2">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-4 bg-[#E6D4C7] rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#F0E6E0] flex items-center justify-center">
                        <span className="text-sm font-medium text-[#273B3A]">v{version.version}</span>
                      </div>
                      <div>
                        <p className="text-sm text-[#1A2726]">
                          {version.notes || `Version ${version.version}`}
                        </p>
                        <p className="text-xs text-[#6B7876]">
                          {version.uploader_name} • {formatDate(version.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#6B7876]">{formatFileSize(version.file_size)}</span>
                      <button className="p-2 rounded-lg text-[#6B7876] hover:text-[#273B3A] hover:bg-[#273B3A]/10">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sharing Tab */}
        {activeTab === "sharing" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-[#1A2726] mb-3">Create Share Link</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  placeholder="Click 'Generate' to create a share link"
                  className="flex-1 px-4 py-2.5 bg-[#E6D4C7] border border-[#D8CAC0] rounded-lg text-sm text-[#1A2726]"
                />
                {shareLink ? (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#273B3A] text-[#E6D4C7] rounded-lg text-sm font-medium"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                ) : (
                  <button
                    onClick={handleCreateShare}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#273B3A] text-[#E6D4C7] rounded-lg text-sm font-medium"
                  >
                    <Link2 className="w-4 h-4" />
                    Generate
                  </button>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-[#1A2726] mb-3">Active Share Links</h4>
              {shares.length === 0 ? (
                <div className="text-center py-8 bg-[#E6D4C7] rounded-lg">
                  <Link2 className="w-12 h-12 mx-auto mb-3 text-[#D8CAC0]" />
                  <p className="text-sm text-[#6B7876]">No active share links</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {shares.map((share) => (
                    <div
                      key={share.id}
                      className="flex items-center justify-between p-4 bg-[#E6D4C7] rounded-lg"
                    >
                      <div>
                        <p className="text-sm text-[#1A2726] font-mono">
                          ...{share.share_token.slice(-8)}
                        </p>
                        <p className="text-xs text-[#6B7876]">
                          {share.expires_at ? `Expires ${formatDate(share.expires_at)}` : "Never expires"}
                          {" • "}{share.download_count} downloads
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-[#F0E6E0] text-xs text-[#4A5654] rounded">
                          {share.permissions}
                        </span>
                        <button className="p-2 rounded-lg text-[#6B7876] hover:text-red-400 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function UploadModal({
  open,
  onClose,
  folderId,
}: {
  open: boolean;
  onClose: () => void;
  folderId: string | null;
}) {
  const { addDocument } = useDocumentsStore();
  const addToast = useToastStore((s) => s.addToast);
  const [dragging, setDragging] = useState(false);

  const handleUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const doc: Document = {
        id: crypto.randomUUID(),
        org_id: "org1",
        folder_id: folderId || undefined,
        name: file.name,
        file_url: URL.createObjectURL(file),
        file_type: file.type,
        file_size: file.size,
        version: 1,
        tags: [],
        is_starred: false,
        uploader_name: "Current User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      addDocument(doc);
    });

    addToast(`${files.length} file(s) uploaded`);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Upload Documents" size="md">
      <div className="space-y-6">
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-12 text-center transition-all",
            dragging
              ? "border-[#273B3A] bg-[#273B3A]/10"
              : "border-[#D8CAC0] hover:border-[#273B3A]/50"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleUpload(e.dataTransfer.files);
          }}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-[#D8CAC0]" />
          <p className="text-sm text-[#1A2726] mb-2">
            Drag and drop files here
          </p>
          <p className="text-xs text-[#6B7876] mb-4">or</p>
          <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#273B3A] text-[#E6D4C7] rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#7DD3FC]">
            <Upload className="w-4 h-4" />
            Browse Files
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>
        </div>

        <div className="p-4 bg-[#E6D4C7] rounded-lg">
          <p className="text-xs text-[#6B7876]">
            <strong className="text-[#4A5654]">Supported formats:</strong> PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, ZIP
          </p>
          <p className="text-xs text-[#6B7876] mt-1">
            <strong className="text-[#4A5654]">Max file size:</strong> 100 MB per file
          </p>
        </div>
      </div>
    </Modal>
  );
}

function NewFolderModal({
  open,
  onClose,
  parentId,
}: {
  open: boolean;
  onClose: () => void;
  parentId: string | null;
}) {
  const { addFolder } = useDocumentsStore();
  const addToast = useToastStore((s) => s.addToast);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#273B3A");

  const colors = ["#273B3A", "#34D399", "#A78BFA", "#F472B6", "#FBBF24", "#F87171"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const folder: DocumentFolder = {
      id: crypto.randomUUID(),
      org_id: "org1",
      parent_id: parentId || undefined,
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      permissions: { view: "all", edit: "admin" },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addFolder(folder);
    addToast("Folder created");
    onClose();
    setName("");
    setDescription("");
  };

  return (
    <Modal open={open} onClose={onClose} title="New Folder" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#6B7876] mb-1.5">Folder Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#E6D4C7] border border-[#D8CAC0] rounded-lg text-sm text-[#1A2726] focus:outline-none focus:border-[#273B3A]/50"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#6B7876] mb-1.5">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#E6D4C7] border border-[#D8CAC0] rounded-lg text-sm text-[#1A2726] focus:outline-none focus:border-[#273B3A]/50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#6B7876] mb-2">Color</label>
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "w-8 h-8 rounded-lg transition-all",
                  color === c && "ring-2 ring-offset-2 ring-offset-[#F0E6E0] ring-white/30"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-[#D8CAC0]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#4A5654] hover:text-[#1A2726]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#273B3A] text-[#E6D4C7] rounded-lg text-sm font-semibold hover:bg-[#7DD3FC]"
          >
            Create Folder
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function DocumentsPage() {
  const {
    currentFolderId,
    searchQuery,
    viewMode,
    selectedDocuments,
    setCurrentFolder,
    setSearchQuery,
    setViewMode,
    selectDocument,
    clearSelection,
    toggleStar,
    deleteDocument,
    getCurrentFolderPath,
    getSubfolders,
    getDocumentsInFolder,
    filteredDocuments,
    getStorageStats,
  } = useDocumentsStore();

  const addToast = useToastStore((s) => s.addToast);
  const folderPath = getCurrentFolderPath();
  const subfolders = getSubfolders(currentFolderId);
  const documents = searchQuery ? filteredDocuments() : getDocumentsInFolder(currentFolderId);
  const stats = getStorageStats();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newFolderModalOpen, setNewFolderModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleBulkDelete = () => {
    selectedDocuments.forEach((id) => deleteDocument(id));
    clearSelection();
    addToast(`${selectedDocuments.length} document(s) deleted`, "info");
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1A2726]">
            Documents
          </h1>
          <p className="text-[#6B7876] text-sm mt-1">
            Manage your files and folders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNewFolderModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#D8CAC0] rounded-lg text-sm font-medium text-[#4A5654] hover:text-[#1A2726] hover:bg-[#F0E6E0]"
          >
            <Folder className="w-4 h-4" />
            New Folder
          </button>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#273B3A] text-[#E6D4C7] rounded-lg text-sm font-semibold hover:bg-[#7DD3FC]"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 space-y-4">
          <StorageIndicator used={stats.used} total={stats.total} />

          {/* Quick Access */}
          <div className="p-4 bg-[#F0E6E0] border border-[#D8CAC0] rounded-xl">
            <h3 className="text-xs font-semibold text-[#6B7876] uppercase tracking-wider mb-3">
              Quick Access
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setCurrentFolder(null);
                  setSearchQuery("");
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  currentFolderId === null && !searchQuery
                    ? "bg-[#273B3A]/10 text-[#273B3A]"
                    : "text-[#4A5654] hover:text-[#1A2726] hover:bg-[#E6D4C7]"
                )}
              >
                <FolderOpen className="w-4 h-4" />
                All Documents
              </button>
              <button
                onClick={() => {
                  setSearchQuery("is:starred");
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#4A5654] hover:text-[#1A2726] hover:bg-[#E6D4C7]"
              >
                <Star className="w-4 h-4" />
                Starred
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Breadcrumb & Actions */}
          <div className="flex items-center justify-between">
            <BreadcrumbNav path={folderPath} onNavigate={setCurrentFolder} />
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2.5 bg-[#F0E6E0] border border-[#D8CAC0] rounded-lg px-3 py-2 focus-within:border-[#273B3A]/40 transition-colors">
                <Search className="w-4 h-4 text-[#6B7876]" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-48 text-[#1A2726] placeholder:text-[#6B7876]"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-[#6B7876] hover:text-[#1A2726]">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex border border-[#D8CAC0] rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "grid"
                      ? "bg-[#273B3A]/10 text-[#273B3A]"
                      : "text-[#6B7876] hover:text-[#1A2726] hover:bg-[#F0E6E0]"
                  )}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "list"
                      ? "bg-[#273B3A]/10 text-[#273B3A]"
                      : "text-[#6B7876] hover:text-[#1A2726] hover:bg-[#F0E6E0]"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedDocuments.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-[#273B3A]/10 border border-[#273B3A]/30 rounded-lg">
              <span className="text-sm text-[#273B3A]">
                {selectedDocuments.length} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearSelection}
                  className="px-3 py-1.5 text-sm text-[#4A5654] hover:text-[#1A2726]"
                >
                  Clear
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Folders */}
          {!searchQuery && subfolders.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-[#6B7876] uppercase tracking-wider mb-3">
                Folders
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {subfolders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    onClick={() => setCurrentFolder(folder.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          <div>
            {!searchQuery && (
              <h3 className="text-xs font-semibold text-[#6B7876] uppercase tracking-wider mb-3">
                Files
              </h3>
            )}

            {documents.length === 0 ? (
              <div className="text-center py-16 bg-[#F0E6E0] border border-[#D8CAC0] rounded-xl">
                <FileText className="w-12 h-12 mx-auto mb-4 text-[#D8CAC0]" />
                <p className="text-sm text-[#6B7876] mb-4">
                  {searchQuery ? "No documents found" : "No documents in this folder"}
                </p>
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#273B3A] text-[#E6D4C7] rounded-lg text-sm font-semibold"
                >
                  <Upload className="w-4 h-4" />
                  Upload Files
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    viewMode="grid"
                    isSelected={selectedDocuments.includes(doc.id)}
                    onSelect={() => selectDocument(doc.id)}
                    onClick={() => setSelectedDocument(doc)}
                    onStar={() => toggleStar(doc.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-[#F0E6E0] border border-[#D8CAC0] rounded-xl overflow-hidden">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    viewMode="list"
                    isSelected={selectedDocuments.includes(doc.id)}
                    onSelect={() => selectDocument(doc.id)}
                    onClick={() => setSelectedDocument(doc)}
                    onStar={() => toggleStar(doc.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        folderId={currentFolderId}
      />
      <NewFolderModal
        open={newFolderModalOpen}
        onClose={() => setNewFolderModalOpen(false)}
        parentId={currentFolderId}
      />
      {selectedDocument && (
        <DocumentPreviewModal
          document={selectedDocument}
          open={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
}
