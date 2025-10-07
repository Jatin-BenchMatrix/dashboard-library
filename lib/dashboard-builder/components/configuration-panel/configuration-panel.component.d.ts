import { OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { WidgetConfig, SeriesConfig, AppetiteBand } from '../../models/widget.config';
import * as i0 from "@angular/core";
export declare class ConfigurationPanelComponent implements OnInit, OnDestroy {
    private dashboardService;
    private widgetService;
    private fb;
    selectedWidget: WidgetConfig | null;
    configForm: FormGroup;
    seriesList: SeriesConfig[];
    bandsList: AppetiteBand[];
    chartTypeOptions: {
        label: string;
        value: string;
    }[];
    datasetOptions: {
        label: string;
        value: string;
    }[];
    xFieldOptions: any[];
    seriesTypeOptions: {
        label: string;
        value: string;
    }[];
    yAxisOptions: {
        label: string;
        value: string;
    }[];
    roleOptions: {
        label: string;
        value: string;
    }[];
    refreshOptions: {
        label: string;
        value: string;
    }[];
    private subscriptions;
    ngOnInit(): void;
    ngOnDestroy(): void;
    private initializeForm;
    private loadWidgetConfiguration;
    private updateFieldOptions;
    onAddSeries(): void;
    onRemoveSeries(seriesId: string): void;
    onSeriesChange(seriesId: string, field: string, value: any): void;
    onAddBand(): void;
    onRemoveBand(bandId: string): void;
    onBandChange(bandId: string, field: string, value: any): void;
    private updateWidgetSeries;
    private updateWidgetBands;
    onSave(): void;
    onCancel(): void;
    onClose(): void;
    getFieldOptions(): {
        label: string;
        value: string;
    }[];
    trackBySeriesId(index: number, series: SeriesConfig): string;
    trackByBandId(index: number, band: AppetiteBand): string;
    private generateId;
    static ɵfac: i0.ɵɵFactoryDeclaration<ConfigurationPanelComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ConfigurationPanelComponent, "app-configuration-panel", never, {}, {}, never, never, true, never>;
}
