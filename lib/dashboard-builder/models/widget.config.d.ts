export interface SeriesConfig {
    id: string;
    label: string;
    field: string;
    type: 'area' | 'line' | 'bar';
    yAxis: 'left' | 'right';
    fillOpacity?: number;
    color?: string;
}
export interface AppetiteBand {
    id: string;
    value: number;
    label: string;
    dashed?: boolean;
    color?: string;
}
export interface WidgetConfig {
    id: string;
    name: string;
    description: string;
    type: 'area' | 'line' | 'bar' | 'radar' | 'pie' | 'doughnut' | 'polarArea' | 'heatmap' | 'progress';
    dataset: string;
    xField: string;
    series: SeriesConfig[];
    appetiteBands: AppetiteBand[];
    stacked: boolean;
    showLegend: boolean;
    showGrid: boolean;
    showTooltip: boolean;
    drilldownEnabled: boolean;
    drilldownTarget?: string;
    refresh: 'realtime' | 'daily' | 'monthly';
    roles: string[];
    position: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    style?: {
        backgroundColor?: string;
        borderColor?: string;
        borderRadius?: string;
    };
}
export interface DashboardLayout {
    id: string;
    name: string;
    description: string;
    widgets: WidgetConfig[];
    filters: GlobalFilters;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    isTemplate: boolean;
    tags: string[];
}
export interface GlobalFilters {
    dateRange: 'MTD' | 'QTD' | 'YTD' | '12M' | 'custom';
    customStartDate?: Date;
    customEndDate?: Date;
    businessUnit: string;
    riskCategory: string;
    severity: number;
    autoRefresh: boolean;
    refreshInterval: number;
}
export interface PrebuiltTemplate {
    id: string;
    name: string;
    description: string;
    tags: string[];
    layout: string[];
    category: 'executive' | 'operational' | 'compliance' | 'cyber';
    thumbnail?: string;
}
export interface WidgetLibraryItem {
    key: string;
    label: string;
    description: string;
    category: 'charts' | 'metrics' | 'tables' | 'maps';
    icon: string;
    defaultConfig: Partial<WidgetConfig>;
}
