import { create } from "zustand";

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
  title: string;
  slug: string;
  is_published: boolean;
  is_homepage: boolean;
  blocks: PageBlock[];
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
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
  error: string | null;

  // Page actions
  fetchPages: (orgId: string) => Promise<void>;
  createPage: (page: Partial<WebsitePage>) => WebsitePage;
  updatePage: (pageId: string, data: Partial<WebsitePage>) => void;
  deletePage: (pageId: string) => void;
  setCurrentPage: (pageId: string | null) => void;
  publishPage: (pageId: string, publish: boolean) => void;

  // Block actions
  addBlock: (pageId: string, type: BlockType, afterBlockId?: string) => void;
  updateBlock: (pageId: string, blockId: string, data: Partial<PageBlock>) => void;
  deleteBlock: (pageId: string, blockId: string) => void;
  moveBlock: (pageId: string, blockId: string, newOrder: number) => void;
  selectBlock: (blockId: string | null) => void;
  duplicateBlock: (pageId: string, blockId: string) => void;

  // Settings actions
  updateSettings: (settings: Partial<WebsiteSettings>) => void;

  // UI state
  setDragging: (isDragging: boolean) => void;
  togglePreview: () => void;
}

const defaultSettings: WebsiteSettings = {
  org_id: "org1",
  site_name: "Atlas Business",
  tagline: "Your trusted partner in excellence",
  primary_color: "#CDB49E",
  secondary_color: "#111111",
  font_heading: "Inter",
  font_body: "Inter",
  social: {},
};

const defaultBlocks: Record<BlockType, Partial<PageBlock>> = {
  hero: {
    type: "hero",
    content: {
      headline: "Welcome to Our Business",
      subheadline: "Delivering excellence since 2024",
      buttonText: "Get Started",
      buttonLink: "/contact",
      backgroundImage: "",
    },
    settings: {
      alignment: "center",
      height: "full",
      overlay: true,
    },
  },
  features: {
    type: "features",
    content: {
      title: "Our Features",
      subtitle: "Why choose us",
      features: [
        { icon: "⚡", title: "Fast", description: "Lightning quick service" },
        { icon: "🛡️", title: "Secure", description: "Your data is safe" },
        { icon: "💎", title: "Quality", description: "Premium experience" },
      ],
    },
    settings: {
      columns: 3,
      style: "cards",
    },
  },
  pricing: {
    type: "pricing",
    content: {
      title: "Pricing Plans",
      subtitle: "Choose the plan that fits your needs",
      plans: [
        { name: "Starter", price: 29, features: ["Feature 1", "Feature 2"], popular: false },
        { name: "Pro", price: 79, features: ["Feature 1", "Feature 2", "Feature 3"], popular: true },
        { name: "Enterprise", price: 199, features: ["All features", "Priority support"], popular: false },
      ],
    },
    settings: {
      currency: "CAD",
      period: "month",
    },
  },
  testimonials: {
    type: "testimonials",
    content: {
      title: "What Our Customers Say",
      testimonials: [
        { name: "John Doe", role: "CEO", company: "Tech Corp", quote: "Amazing service!", avatar: "" },
        { name: "Jane Smith", role: "Manager", company: "Retail Inc", quote: "Highly recommended!", avatar: "" },
      ],
    },
    settings: {
      style: "carousel",
    },
  },
  cta: {
    type: "cta",
    content: {
      title: "Ready to Get Started?",
      description: "Join thousands of satisfied customers today.",
      buttonText: "Contact Us",
      buttonLink: "/contact",
    },
    settings: {
      style: "banner",
      background: "primary",
    },
  },
  gallery: {
    type: "gallery",
    content: {
      title: "Gallery",
      images: [],
    },
    settings: {
      columns: 4,
      lightbox: true,
    },
  },
  contact: {
    type: "contact",
    content: {
      title: "Get in Touch",
      email: "hello@example.com",
      phone: "+1 (555) 123-4567",
      address: "123 Business St, Toronto, ON",
      showMap: true,
      showForm: true,
    },
    settings: {
      layout: "split",
    },
  },
  text: {
    type: "text",
    content: {
      title: "About Us",
      body: "Add your content here...",
    },
    settings: {
      width: "medium",
    },
  },
  products: {
    type: "products",
    content: {
      title: "Our Products",
      subtitle: "Browse our collection",
      productIds: [],
      showPrices: true,
    },
    settings: {
      columns: 4,
      limit: 8,
    },
  },
  team: {
    type: "team",
    content: {
      title: "Meet Our Team",
      members: [
        { name: "John Doe", role: "CEO", image: "", bio: "Founder and visionary" },
        { name: "Jane Smith", role: "CTO", image: "", bio: "Tech lead" },
      ],
    },
    settings: {
      columns: 4,
      showBio: true,
    },
  },
};

const mockPages: WebsitePage[] = [
  {
    id: "page-home",
    org_id: "org1",
    title: "Home",
    slug: "/",
    is_published: true,
    is_homepage: true,
    blocks: [
      { id: "block-1", type: "hero", order: 0, ...defaultBlocks.hero },
      { id: "block-2", type: "features", order: 1, ...defaultBlocks.features },
      { id: "block-3", type: "cta", order: 2, ...defaultBlocks.cta },
    ] as PageBlock[],
    seo: { title: "Home - Atlas Business" },
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "page-about",
    org_id: "org1",
    title: "About Us",
    slug: "/about",
    is_published: true,
    is_homepage: false,
    blocks: [
      { id: "block-4", type: "text", order: 0, ...defaultBlocks.text },
      { id: "block-5", type: "team", order: 1, ...defaultBlocks.team },
    ] as PageBlock[],
    seo: { title: "About Us - Atlas Business" },
    created_at: "2026-01-02T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
  },
  {
    id: "page-pricing",
    org_id: "org1",
    title: "Pricing",
    slug: "/pricing",
    is_published: false,
    is_homepage: false,
    blocks: [
      { id: "block-6", type: "pricing", order: 0, ...defaultBlocks.pricing },
      { id: "block-7", type: "testimonials", order: 1, ...defaultBlocks.testimonials },
    ] as PageBlock[],
    seo: { title: "Pricing - Atlas Business" },
    created_at: "2026-01-03T00:00:00Z",
    updated_at: "2026-01-03T00:00:00Z",
  },
];

export const useWebsiteStore = create<WebsiteState>((set, get) => ({
  pages: mockPages,
  settings: defaultSettings,
  currentPage: null,
  selectedBlock: null,
  isDragging: false,
  previewMode: false,
  loading: false,
  error: null,

  fetchPages: async (orgId) => {
    set({ loading: true });
    // In production, fetch from Supabase
    setTimeout(() => {
      set({ pages: mockPages, loading: false });
    }, 500);
  },

  createPage: (pageData) => {
    const newPage: WebsitePage = {
      id: `page-${Date.now()}`,
      org_id: "org1",
      title: pageData.title || "New Page",
      slug: pageData.slug || `/page-${Date.now()}`,
      is_published: false,
      is_homepage: false,
      blocks: [],
      seo: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...pageData,
    };

    set((state) => ({
      pages: [...state.pages, newPage],
      currentPage: newPage,
    }));

    return newPage;
  },

  updatePage: (pageId, data) => {
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === pageId ? { ...p, ...data, updated_at: new Date().toISOString() } : p
      ),
      currentPage:
        state.currentPage?.id === pageId
          ? { ...state.currentPage, ...data, updated_at: new Date().toISOString() }
          : state.currentPage,
    }));
  },

  deletePage: (pageId) => {
    set((state) => ({
      pages: state.pages.filter((p) => p.id !== pageId),
      currentPage: state.currentPage?.id === pageId ? null : state.currentPage,
    }));
  },

  setCurrentPage: (pageId) => {
    if (!pageId) {
      set({ currentPage: null, selectedBlock: null });
      return;
    }
    const page = get().pages.find((p) => p.id === pageId);
    set({ currentPage: page || null, selectedBlock: null });
  },

  publishPage: (pageId, publish) => {
    get().updatePage(pageId, { is_published: publish });
  },

  addBlock: (pageId, type, afterBlockId) => {
    const page = get().pages.find((p) => p.id === pageId);
    if (!page) return;

    const newBlock: PageBlock = {
      id: `block-${Date.now()}`,
      type,
      order: page.blocks.length,
      settings: defaultBlocks[type]?.settings || {},
      content: defaultBlocks[type]?.content || {},
    };

    if (afterBlockId) {
      const afterIndex = page.blocks.findIndex((b) => b.id === afterBlockId);
      newBlock.order = afterIndex + 1;
    }

    const updatedBlocks = [...page.blocks, newBlock].sort((a, b) => a.order - b.order);

    get().updatePage(pageId, { blocks: updatedBlocks });
    set({ selectedBlock: newBlock.id });
  },

  updateBlock: (pageId, blockId, data) => {
    const page = get().pages.find((p) => p.id === pageId);
    if (!page) return;

    const updatedBlocks = page.blocks.map((b) =>
      b.id === blockId ? { ...b, ...data } : b
    );

    get().updatePage(pageId, { blocks: updatedBlocks });
  },

  deleteBlock: (pageId, blockId) => {
    const page = get().pages.find((p) => p.id === pageId);
    if (!page) return;

    const updatedBlocks = page.blocks.filter((b) => b.id !== blockId);
    get().updatePage(pageId, { blocks: updatedBlocks });
    
    if (get().selectedBlock === blockId) {
      set({ selectedBlock: null });
    }
  },

  moveBlock: (pageId, blockId, newOrder) => {
    const page = get().pages.find((p) => p.id === pageId);
    if (!page) return;

    const updatedBlocks = page.blocks.map((b) => {
      if (b.id === blockId) return { ...b, order: newOrder };
      return b;
    }).sort((a, b) => a.order - b.order);

    get().updatePage(pageId, { blocks: updatedBlocks });
  },

  selectBlock: (blockId) => {
    set({ selectedBlock: blockId });
  },

  duplicateBlock: (pageId, blockId) => {
    const page = get().pages.find((p) => p.id === pageId);
    if (!page) return;

    const block = page.blocks.find((b) => b.id === blockId);
    if (!block) return;

    const newBlock: PageBlock = {
      ...block,
      id: `block-${Date.now()}`,
      order: block.order + 0.5,
    };

    const updatedBlocks = [...page.blocks, newBlock]
      .sort((a, b) => a.order - b.order)
      .map((b, i) => ({ ...b, order: i }));

    get().updatePage(pageId, { blocks: updatedBlocks });
    set({ selectedBlock: newBlock.id });
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  setDragging: (isDragging) => {
    set({ isDragging });
  },

  togglePreview: () => {
    set((state) => ({ previewMode: !state.previewMode }));
  },
}));
