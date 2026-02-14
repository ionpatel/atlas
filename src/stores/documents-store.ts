import { create } from "zustand";
import type { Document, DocumentFolder, DocumentVersion, DocumentShare } from "@/types";

// Mock folders
const mockFolders: DocumentFolder[] = [
  {
    id: "f1",
    org_id: "org1",
    name: "Contracts",
    description: "All contract documents",
    color: "#38BDF8",
    icon: "FileText",
    permissions: { view: "all", edit: "admin" },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "f2",
    org_id: "org1",
    name: "Invoices",
    description: "Invoice PDFs and receipts",
    color: "#34D399",
    icon: "Receipt",
    permissions: { view: "all", edit: "manager" },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "f3",
    org_id: "org1",
    name: "HR Documents",
    description: "Employee documents and policies",
    color: "#A78BFA",
    icon: "Users",
    permissions: { view: "manager", edit: "admin" },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "f4",
    org_id: "org1",
    parent_id: "f3",
    name: "Policies",
    description: "Company policies",
    color: "#A78BFA",
    permissions: { view: "all", edit: "admin" },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "f5",
    org_id: "org1",
    parent_id: "f3",
    name: "Onboarding",
    description: "New employee onboarding materials",
    color: "#A78BFA",
    permissions: { view: "manager", edit: "admin" },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "f6",
    org_id: "org1",
    name: "Marketing",
    description: "Marketing materials and brand assets",
    color: "#F472B6",
    icon: "Megaphone",
    permissions: { view: "all", edit: "all" },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "f7",
    org_id: "org1",
    name: "Reports",
    description: "Financial and analytics reports",
    color: "#FBBF24",
    icon: "BarChart",
    permissions: { view: "manager", edit: "admin" },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// Mock documents
const mockDocuments: Document[] = [
  {
    id: "d1",
    org_id: "org1",
    folder_id: "f1",
    name: "Software Development Agreement - Acme Inc.pdf",
    description: "Signed contract for development services",
    file_url: "/documents/contract-acme.pdf",
    file_type: "application/pdf",
    file_size: 245000,
    version: 2,
    tags: ["contract", "signed", "2024"],
    category: "Contracts",
    is_starred: true,
    uploader_name: "John Smith",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-20T14:00:00Z",
  },
  {
    id: "d2",
    org_id: "org1",
    folder_id: "f1",
    name: "NDA - Partner Corp.pdf",
    file_url: "/documents/nda-partner.pdf",
    file_type: "application/pdf",
    file_size: 128000,
    version: 1,
    tags: ["nda", "legal"],
    category: "Legal",
    is_starred: false,
    uploader_name: "Sarah Wilson",
    created_at: "2024-01-10T09:00:00Z",
    updated_at: "2024-01-10T09:00:00Z",
  },
  {
    id: "d3",
    org_id: "org1",
    folder_id: "f2",
    name: "Invoice-2024-001.pdf",
    file_url: "/documents/inv-001.pdf",
    file_type: "application/pdf",
    file_size: 85000,
    version: 1,
    tags: ["invoice", "2024", "q1"],
    is_starred: false,
    uploader_name: "Mike Chen",
    created_at: "2024-01-05T11:30:00Z",
    updated_at: "2024-01-05T11:30:00Z",
  },
  {
    id: "d4",
    org_id: "org1",
    folder_id: "f4",
    name: "Employee Handbook 2024.pdf",
    description: "Updated company policies and procedures",
    file_url: "/documents/handbook-2024.pdf",
    file_type: "application/pdf",
    file_size: 1250000,
    version: 3,
    tags: ["hr", "policy", "handbook"],
    is_starred: true,
    uploader_name: "HR Team",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
  },
  {
    id: "d5",
    org_id: "org1",
    folder_id: "f6",
    name: "Brand Guidelines.pdf",
    description: "Official brand style guide",
    file_url: "/documents/brand-guidelines.pdf",
    file_type: "application/pdf",
    file_size: 5200000,
    version: 2,
    tags: ["brand", "design", "guidelines"],
    is_starred: true,
    uploader_name: "Design Team",
    created_at: "2023-06-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "d6",
    org_id: "org1",
    folder_id: "f6",
    name: "Logo Pack.zip",
    description: "All logo variations and formats",
    file_url: "/documents/logo-pack.zip",
    file_type: "application/zip",
    file_size: 15800000,
    version: 1,
    tags: ["brand", "logo", "assets"],
    is_starred: false,
    uploader_name: "Design Team",
    created_at: "2023-06-15T00:00:00Z",
    updated_at: "2023-06-15T00:00:00Z",
  },
  {
    id: "d7",
    org_id: "org1",
    folder_id: "f7",
    name: "Q4 2023 Financial Report.xlsx",
    file_url: "/documents/q4-2023-report.xlsx",
    file_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    file_size: 485000,
    version: 1,
    tags: ["finance", "report", "2023", "q4"],
    is_starred: false,
    uploader_name: "Finance Team",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "d8",
    org_id: "org1",
    folder_id: undefined,
    name: "Meeting Notes - Board.docx",
    description: "Notes from Q1 board meeting",
    file_url: "/documents/board-notes.docx",
    file_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    file_size: 45000,
    version: 1,
    tags: ["meeting", "board"],
    is_starred: false,
    uploader_name: "Executive Assistant",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
  },
  {
    id: "d9",
    org_id: "org1",
    folder_id: "f6",
    name: "Product Screenshot.png",
    file_url: "/documents/product-screenshot.png",
    file_type: "image/png",
    file_size: 2100000,
    version: 1,
    tags: ["product", "screenshot"],
    is_starred: false,
    uploader_name: "Product Team",
    created_at: "2024-02-05T00:00:00Z",
    updated_at: "2024-02-05T00:00:00Z",
  },
];

const mockVersions: Record<string, DocumentVersion[]> = {
  d1: [
    {
      id: "v1",
      document_id: "d1",
      version: 1,
      file_url: "/documents/contract-acme-v1.pdf",
      file_size: 240000,
      notes: "Initial draft",
      uploader_name: "John Smith",
      created_at: "2024-01-15T10:30:00Z",
    },
    {
      id: "v2",
      document_id: "d1",
      version: 2,
      file_url: "/documents/contract-acme.pdf",
      file_size: 245000,
      notes: "Signed version with amendments",
      uploader_name: "John Smith",
      created_at: "2024-01-20T14:00:00Z",
    },
  ],
  d4: [
    {
      id: "v3",
      document_id: "d4",
      version: 1,
      file_url: "/documents/handbook-2024-v1.pdf",
      file_size: 1100000,
      notes: "Initial 2024 version",
      uploader_name: "HR Team",
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "v4",
      document_id: "d4",
      version: 2,
      file_url: "/documents/handbook-2024-v2.pdf",
      file_size: 1200000,
      notes: "Added remote work policy",
      uploader_name: "HR Team",
      created_at: "2024-01-15T00:00:00Z",
    },
    {
      id: "v5",
      document_id: "d4",
      version: 3,
      file_url: "/documents/handbook-2024.pdf",
      file_size: 1250000,
      notes: "Updated benefits section",
      uploader_name: "HR Team",
      created_at: "2024-02-01T00:00:00Z",
    },
  ],
};

const mockShares: DocumentShare[] = [
  {
    id: "sh1",
    document_id: "d5",
    share_token: "abc123xyz",
    permissions: "view",
    expires_at: "2024-03-01T00:00:00Z",
    download_count: 5,
    created_at: "2024-02-01T00:00:00Z",
  },
];

interface DocumentsState {
  folders: DocumentFolder[];
  documents: Document[];
  versions: Record<string, DocumentVersion[]>;
  shares: DocumentShare[];
  currentFolderId: string | null;
  searchQuery: string;
  viewMode: "grid" | "list";
  sortBy: "name" | "date" | "size";
  sortOrder: "asc" | "desc";
  selectedDocuments: string[];

  // Actions
  setCurrentFolder: (folderId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: "grid" | "list") => void;
  setSortBy: (sort: "name" | "date" | "size") => void;
  toggleSortOrder: () => void;
  selectDocument: (id: string) => void;
  clearSelection: () => void;
  
  addFolder: (folder: DocumentFolder) => void;
  updateFolder: (id: string, updates: Partial<DocumentFolder>) => void;
  deleteFolder: (id: string) => void;
  
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  toggleStar: (id: string) => void;
  
  createShareLink: (documentId: string, permissions: string, expiresAt?: string) => DocumentShare;
  revokeShareLink: (shareId: string) => void;

  // Selectors
  getCurrentFolderPath: () => DocumentFolder[];
  getSubfolders: (parentId: string | null) => DocumentFolder[];
  getDocumentsInFolder: (folderId: string | null) => Document[];
  filteredDocuments: () => Document[];
  getDocumentById: (id: string) => Document | undefined;
  getVersions: (documentId: string) => DocumentVersion[];
  getSharesByDocument: (documentId: string) => DocumentShare[];
  getStorageStats: () => { used: number; total: number; byType: Record<string, number> };
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  folders: mockFolders,
  documents: mockDocuments,
  versions: mockVersions,
  shares: mockShares,
  currentFolderId: null,
  searchQuery: "",
  viewMode: "grid",
  sortBy: "date",
  sortOrder: "desc",
  selectedDocuments: [],

  setCurrentFolder: (folderId) => set({ currentFolderId: folderId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortBy: (sort) => set({ sortBy: sort }),
  toggleSortOrder: () => set((s) => ({ sortOrder: s.sortOrder === "asc" ? "desc" : "asc" })),
  
  selectDocument: (id) =>
    set((s) => ({
      selectedDocuments: s.selectedDocuments.includes(id)
        ? s.selectedDocuments.filter((d) => d !== id)
        : [...s.selectedDocuments, id],
    })),
  clearSelection: () => set({ selectedDocuments: [] }),

  addFolder: (folder) =>
    set((s) => ({ folders: [...s.folders, folder] })),

  updateFolder: (id, updates) =>
    set((s) => ({
      folders: s.folders.map((f) =>
        f.id === id ? { ...f, ...updates, updated_at: new Date().toISOString() } : f
      ),
    })),

  deleteFolder: (id) =>
    set((s) => ({
      folders: s.folders.filter((f) => f.id !== id),
      documents: s.documents.map((d) =>
        d.folder_id === id ? { ...d, folder_id: undefined } : d
      ),
    })),

  addDocument: (document) =>
    set((s) => ({ documents: [...s.documents, document] })),

  updateDocument: (id, updates) =>
    set((s) => ({
      documents: s.documents.map((d) =>
        d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d
      ),
    })),

  deleteDocument: (id) =>
    set((s) => ({
      documents: s.documents.filter((d) => d.id !== id),
      selectedDocuments: s.selectedDocuments.filter((d) => d !== id),
    })),

  toggleStar: (id) =>
    set((s) => ({
      documents: s.documents.map((d) =>
        d.id === id ? { ...d, is_starred: !d.is_starred } : d
      ),
    })),

  createShareLink: (documentId, permissions, expiresAt) => {
    const share: DocumentShare = {
      id: crypto.randomUUID(),
      document_id: documentId,
      share_token: crypto.randomUUID().replace(/-/g, "").slice(0, 16),
      permissions: permissions as "view" | "download" | "edit",
      expires_at: expiresAt,
      download_count: 0,
      created_at: new Date().toISOString(),
    };
    set((s) => ({ shares: [...s.shares, share] }));
    return share;
  },

  revokeShareLink: (shareId) =>
    set((s) => ({ shares: s.shares.filter((sh) => sh.id !== shareId) })),

  getCurrentFolderPath: () => {
    const { folders, currentFolderId } = get();
    const path: DocumentFolder[] = [];
    let current = folders.find((f) => f.id === currentFolderId);
    
    while (current) {
      path.unshift(current);
      current = folders.find((f) => f.id === current?.parent_id);
    }
    
    return path;
  },

  getSubfolders: (parentId) => {
    const { folders } = get();
    return folders
      .filter((f) => f.parent_id === parentId || (parentId === null && !f.parent_id))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  getDocumentsInFolder: (folderId) => {
    const { documents, sortBy, sortOrder } = get();
    let docs = documents.filter((d) => d.folder_id === folderId);

    docs.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "date":
          cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case "size":
          cmp = a.file_size - b.file_size;
          break;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return docs;
  },

  filteredDocuments: () => {
    const { documents, searchQuery, sortBy, sortOrder } = get();
    let filtered = documents;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "date":
          cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case "size":
          cmp = a.file_size - b.file_size;
          break;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return filtered;
  },

  getDocumentById: (id) => get().documents.find((d) => d.id === id),

  getVersions: (documentId) => get().versions[documentId] || [],

  getSharesByDocument: (documentId) =>
    get().shares.filter((s) => s.document_id === documentId),

  getStorageStats: () => {
    const { documents } = get();
    const used = documents.reduce((sum, d) => sum + d.file_size, 0);
    const total = 10 * 1024 * 1024 * 1024; // 10 GB limit
    
    const byType: Record<string, number> = {};
    documents.forEach((d) => {
      const type = d.file_type?.split("/")[0] || "other";
      byType[type] = (byType[type] || 0) + d.file_size;
    });

    return { used, total, byType };
  },
}));
