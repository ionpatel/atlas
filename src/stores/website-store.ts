import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

export type BlockType =
  | "hero"
  | "features"
  | "pricing"
  | "testimonials"
  | "cta"
  | "gallery"
  | "contact"
  | "text"
  | "products"
  | "team";

export interface PageBlock {
  id: string;
  type: BlockType;
  order: number;
  settings: Record<string, any>;
  content: Record<string, any>;
}

export interface WebsitePage {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  template?: string;
  elements: any[];
  settings?: Record<string, any>;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WebsiteSettings {
  org_id: string;
  site_name: string;
  tagline: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  font_heading: string;
  font_body: string;
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  analytics_id?: string;
  custom_css?: string;
  custom_head?: string;
}

interface WebsiteState {
  pages: WebsitePage[];
  settings: WebsiteSettings;
  currentPage: WebsitePage | null;
  selectedBlock: string | null;
  isDragging: boolean;
  previewMode: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastSaved: Date | null;

  // Supabase-backed page actions
  fetchPages: (orgId: string) => Promise<void>;
  createPage: (orgId: string, page: Partial<WebsitePage>) => Promise<WebsitePage | null>;
  updatePage: (pageId: string, data: Partial<WebsitePage>) => Promise<void>;
  savePage: (page: WebsitePage) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;
  setCurrentPage: (pageId: string | null) => void;
  publishPage: (pageId: string, publish: boolean) => Promise<void>;

  // Local state actions (for quick editing)
  updatePageLocal: (pageId: string, data: Partial<WebsitePage>) => void;
  selectBlock: (blockId: string | null) => void;
  setDragging: (isDragging: boolean) => void;
  togglePreview: () => void;
  updateSettings: (settings: Partial<WebsiteSettings>) => void;
}

const defaultSettings: WebsiteSettings = {
  org_id: "",
  site_name: "Atlas Business",
  tagline: "Your trusted partner in excellence",
  primary_color: "#CDB49E",
  secondary_color: "#111111",
  font_heading: "Inter",
  font_body: "Inter",
  social: {},
};

export const useWebsiteStore = create<WebsiteState>((set, get) => ({
  pages: [],
  settings: defaultSettings,
  currentPage: null,
  selectedBlock: null,
  isDragging: false,
  previewMode: false,
  loading: false,
  saving: false,
  error: null,
  lastSaved: null,

  fetchPages: async (orgId) => {
    set({ loading: true, error: null });
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("website_pages")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      set({ 
        pages: data || [], 
        loading: false,
        settings: { ...defaultSettings, org_id: orgId }
      });
    } catch (err: any) {
      console.error("Error fetching website pages:", err);
      set({ 
        error: err.message || "Failed to fetch pages", 
        loading: false,
        pages: [] 
      });
    }
  },

  createPage: async (orgId, pageData) => {
    set({ saving: true, error: null });

    const newPage: Partial<WebsitePage> = {
      org_id: orgId,
      name: pageData.name || "Untitled Page",
      slug: pageData.slug || "/",
      template: pageData.template,
      elements: pageData.elements || [],
      settings: pageData.settings || {},
      is_published: false,
    };

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("website_pages")
        .insert(newPage)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        pages: [...state.pages, data],
        currentPage: data,
        saving: false,
        lastSaved: new Date(),
      }));

      return data;
    } catch (err: any) {
      console.error("Error creating page:", err);
      set({ error: err.message || "Failed to create page", saving: false });
      return null;
    }
  },

  updatePage: async (pageId, data) => {
    set({ saving: true, error: null });

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("website_pages")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pageId);

      if (error) throw error;

      set((state) => ({
        pages: state.pages.map((p) =>
          p.id === pageId ? { ...p, ...data, updated_at: new Date().toISOString() } : p
        ),
        currentPage:
          state.currentPage?.id === pageId
            ? { ...state.currentPage, ...data, updated_at: new Date().toISOString() }
            : state.currentPage,
        saving: false,
        lastSaved: new Date(),
      }));
    } catch (err: any) {
      console.error("Error updating page:", err);
      set({ error: err.message || "Failed to update page", saving: false });
    }
  },

  savePage: async (page) => {
    set({ saving: true, error: null });

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("website_pages")
        .upsert({
          id: page.id,
          org_id: page.org_id,
          name: page.name,
          slug: page.slug,
          template: page.template,
          elements: page.elements,
          settings: page.settings,
          is_published: page.is_published,
          published_at: page.published_at,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      set({ saving: false, lastSaved: new Date() });
    } catch (err: any) {
      console.error("Error saving page:", err);
      set({ error: err.message || "Failed to save page", saving: false });
    }
  },

  deletePage: async (pageId) => {
    set({ saving: true, error: null });

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("website_pages")
        .delete()
        .eq("id", pageId);

      if (error) throw error;

      set((state) => ({
        pages: state.pages.filter((p) => p.id !== pageId),
        currentPage: state.currentPage?.id === pageId ? null : state.currentPage,
        saving: false,
      }));
    } catch (err: any) {
      console.error("Error deleting page:", err);
      set({ error: err.message || "Failed to delete page", saving: false });
    }
  },

  setCurrentPage: (pageId) => {
    if (!pageId) {
      set({ currentPage: null, selectedBlock: null });
      return;
    }
    const page = get().pages.find((p) => p.id === pageId);
    set({ currentPage: page || null, selectedBlock: null });
  },

  publishPage: async (pageId, publish) => {
    await get().updatePage(pageId, { 
      is_published: publish,
      published_at: publish ? new Date().toISOString() : undefined,
    });
  },

  // Local state updates (for quick editing without hitting DB)
  updatePageLocal: (pageId, data) => {
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === pageId ? { ...p, ...data } : p
      ),
      currentPage:
        state.currentPage?.id === pageId
          ? { ...state.currentPage, ...data }
          : state.currentPage,
    }));
  },

  selectBlock: (blockId) => {
    set({ selectedBlock: blockId });
  },

  setDragging: (isDragging) => {
    set({ isDragging });
  },

  togglePreview: () => {
    set((state) => ({ previewMode: !state.previewMode }));
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },
}));
