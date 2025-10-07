import { Observable } from 'rxjs';
import { WidgetConfig, SeriesConfig, AppetiteBand } from '../models/widget.config';
import { ChartDataType } from '../models/chart.data';
import { DashboardService } from './dashboard.service';
import * as i0 from "@angular/core";
export declare class WidgetService {
    private dashboardService;
    private selectedWidgetSubject;
    private isConfiguringSubject;
    selectedWidget$: Observable<WidgetConfig | null>;
    isConfiguring$: Observable<boolean>;
    constructor(dashboardService: DashboardService);
    selectWidget(widget: WidgetConfig | null): void;
    startConfiguration(widget: WidgetConfig): void;
    stopConfiguration(): void;
    updateWidgetName(widgetId: string, name: string): void;
    updateWidgetDescription(widgetId: string, description: string): void;
    updateWidgetType(widgetId: string, type: WidgetConfig['type']): void;
    updateWidgetDataset(widgetId: string, dataset: string): void;
    updateWidgetXField(widgetId: string, xField: string): void;
    addSeries(widgetId: string, series: Omit<SeriesConfig, 'id'>): void;
    updateSeries(widgetId: string, seriesId: string, updates: Partial<SeriesConfig>): void;
    removeSeries(widgetId: string, seriesId: string): void;
    addAppetiteBand(widgetId: string, band: Omit<AppetiteBand, 'id'>): void;
    updateAppetiteBand(widgetId: string, bandId: string, updates: Partial<AppetiteBand>): void;
    removeAppetiteBand(widgetId: string, bandId: string): void;
    updateDisplayOptions(widgetId: string, options: {
        showLegend?: boolean;
        showGrid?: boolean;
        showTooltip?: boolean;
        stacked?: boolean;
    }): void;
    updateDrilldownConfig(widgetId: string, enabled: boolean, target?: string): void;
    updateSecuritySettings(widgetId: string, roles: string[]): void;
    updateRefreshSettings(widgetId: string, refresh: 'realtime' | 'daily' | 'monthly'): void;
    updateWidgetPosition(widgetId: string, position: {
        x: number;
        y: number;
        w: number;
        h: number;
    }): void;
    updateWidgetStyle(widgetId: string, style: {
        backgroundColor?: string;
        borderColor?: string;
        borderRadius?: string;
    }): void;
    processDataForWidget(widget: WidgetConfig): ChartDataType[];
    getAvailableFields(dataset: string): string[];
    getFieldType(field: string, dataset: string): 'string' | 'number' | 'date' | 'boolean';
    validateWidgetConfig(widget: WidgetConfig): {
        isValid: boolean;
        errors: string[];
    };
    private getWidgetById;
    private generateSeriesId;
    private generateBandId;
    getSupportedChartTypes(): {
        value: string;
        label: string;
        description: string;
    }[];
    getSupportedYAxisOptions(): {
        value: string;
        label: string;
    }[];
    getSupportedSeriesTypes(): {
        value: string;
        label: string;
        description: string;
    }[];
    static ɵfac: i0.ɵɵFactoryDeclaration<WidgetService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<WidgetService>;
}
