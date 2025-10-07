import { type OnInit, type OnDestroy } from "@angular/core";
import { type ChartConfiguration, type ChartData, type ChartType } from "chart.js";
import { LayoutService } from "../service/layout.service";
import * as i0 from "@angular/core";
export interface SeriesCfg {
    id: string;
    label: string;
    field: string;
    type: "area" | "line" | "bar";
    yAxis: "left" | "right";
    fillOpacity?: number;
    color?: string;
}
export interface Band {
    id: string;
    value: number;
    label: string;
    dashed?: boolean;
}
export interface WidgetCfg {
    name: string;
    description: string;
    vizType: "line" | "bar" | "radar" | "pie" | "area";
    dataset: string;
    xField: string;
    series: SeriesCfg[];
    appetiteBands: Band[];
    stacked: boolean;
    showLegend: boolean;
    showGrid: boolean;
    showTooltip: boolean;
    drilldownEnabled: boolean;
    drilldownTarget?: string;
    refresh: "realtime" | "daily" | "monthly";
    roles: string[];
}
export declare class CreateWidgetComponent implements OnInit, OnDestroy {
    layoutService: LayoutService;
    widgetConfig: WidgetCfg;
    rolesInput: string;
    vizTypeOptions: any[];
    datasetOptions: any[];
    refreshOptions: any[];
    xAxisOptions: any[];
    seriesFieldOptions: any[];
    seriesTypeOptions: any[];
    yAxisOptions: any[];
    showPreview: boolean;
    chartData: ChartData;
    chartOptions: ChartConfiguration["options"];
    chartType: ChartType;
    sampleMonthlyData: {
        month: string;
        residualRisk: number;
        incidents: number;
    }[];
    seriesColors: string[];
    private subscription?;
    constructor();
    ngOnInit(): void;
    updateSeriesColors(): void;
    getDefaultConfig(): WidgetCfg;
    chartKey: number;
    updateChart(): void;
    getChartOptions(): ChartConfiguration["options"];
    addSeries(): void;
    removeSeries(id: string): void;
    addBand(): void;
    removeBand(id: string): void;
    onRolesChange(value: string): void;
    saveWidget(): void;
    hexToRgba(hex: string, alpha?: number): string;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CreateWidgetComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CreateWidgetComponent, "app-create-widget", never, {}, {}, never, never, true, never>;
}
