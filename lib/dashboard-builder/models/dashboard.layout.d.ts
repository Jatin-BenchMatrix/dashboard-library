import { WidgetConfig, GlobalFilters, PrebuiltTemplate } from './widget.config';
export type { WidgetConfig, GlobalFilters, PrebuiltTemplate };
export interface DashboardState {
    mode: 'prebuilt' | 'builder' | 'library';
    activeLayout: string[];
    selectedWidget?: WidgetConfig;
    isEditing: boolean;
    leftPanelOpen: boolean;
    showAddWidget: boolean;
    searchQuery: string;
}
export interface GridPosition {
    x: number;
    y: number;
    w: number;
    h: number;
}
export interface DashboardTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    widgets: WidgetConfig[];
    layout: GridLayout;
    filters: GlobalFilters;
    isPublic: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    thumbnail?: string;
}
export interface GridLayout {
    columns: number;
    rows: number;
    breakpoints: {
        lg: number;
        md: number;
        sm: number;
        xs: number;
    };
    margin: [number, number];
    containerPadding: [number, number];
}
export interface DashboardConfig {
    id: string;
    name: string;
    description: string;
    layout: GridLayout;
    widgets: WidgetConfig[];
    filters: GlobalFilters;
    theme: 'light' | 'dark';
    autoRefresh: boolean;
    refreshInterval: number;
    permissions: {
        canEdit: string[];
        canView: string[];
        canShare: string[];
    };
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    version: number;
}
export interface WidgetPosition {
    widgetId: string;
    position: GridPosition;
    zIndex: number;
    visible: boolean;
}
export interface DashboardSnapshot {
    id: string;
    dashboardId: string;
    name: string;
    description: string;
    widgets: WidgetConfig[];
    layout: GridLayout;
    filters: GlobalFilters;
    createdAt: Date;
    createdBy: string;
    version: number;
}
export declare const DEFAULT_GRID_LAYOUT: GridLayout;
export declare const DEFAULT_FILTERS: GlobalFilters;
