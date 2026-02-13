// Atlas Website Builder Pro - Component Exports

export { ImageLibrary } from "./image-library";
export type { default as ImageLibraryType } from "./image-library";

export { SEOSettingsPanel } from "./seo-settings";
export type { SEOSettings } from "./seo-settings";

export { StylePresetsPanel } from "./style-presets";
export type { StylePreset } from "./style-presets";

export { FormBuilder } from "./form-builder";
export type { FormField, FormConfig } from "./form-builder";

// New Components
export { IntegrationsPanel } from "./integrations-panel";
export type { Integration } from "./integrations-panel";

export { CodeInjectionPanel } from "./code-injection";
export type { CodeInjection } from "./code-injection";

export { PageSettingsPanel } from "./page-settings";
export type { PageSettings } from "./page-settings";

export { VersionHistoryPanel, useVersionHistory } from "./version-history";
export type { PageVersion } from "./version-history";

export { DomainSettingsPanel } from "./domain-settings";
export type { DomainConfig, DNSRecord } from "./domain-settings";

export { TemplatePreviewModal, TemplateCard, TEMPLATE_THUMBNAILS, TEMPLATE_FEATURES } from "./template-preview";
export type { TemplateInfo } from "./template-preview";

// New v3.1 Components - AI & Advanced Features
export { AIPanel } from "./ai-panel";
export type { default as AIPanelType } from "./ai-panel";

export { VariantsPanel, getVariantsForType, BUILT_IN_VARIANTS } from "./variants-panel";
export type { ComponentVariant, VariantCategory } from "./variants-panel";

export { ResponsiveEditor, ResponsivePreview, mergeResponsiveStyles, generateResponsiveCSS } from "./responsive-editor";
export type { Breakpoint, BreakpointStyles, ResponsiveConfig } from "./responsive-editor";

export { TemplateMarketplace } from "./template-marketplace";
export type { MarketplaceTemplate } from "./template-marketplace";

export { UndoStackPanel, useUndoStack, createInitialUndoState } from "./undo-stack";
export type { HistoryEntry, Branch, UndoStackState } from "./undo-stack";
