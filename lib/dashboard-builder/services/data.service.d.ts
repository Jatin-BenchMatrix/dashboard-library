import { Observable } from 'rxjs';
import { CHART_COLORS } from '../data/sample-datasets';
import { ChartDataType, DatasetConfig } from '../models/chart.data';
import { GlobalFilters } from '../models/dashboard.layout';
import * as i0 from "@angular/core";
export declare class DataService {
    private dataCache;
    private lastRefresh;
    constructor();
    getData(datasetId: string, filters?: GlobalFilters): Observable<ChartDataType[]>;
    getDatasetConfig(datasetId: string): DatasetConfig | undefined;
    getAvailableDatasets(): Observable<DatasetConfig[]>;
    getChartColors(): typeof CHART_COLORS;
    refreshData(datasetId: string, filters?: GlobalFilters): Observable<ChartDataType[]>;
    getDataSummary(datasetId: string, filters?: GlobalFilters): Observable<{
        totalRecords: number;
        lastUpdated: Date;
        fields: string[];
        sampleData: ChartDataType[];
    }>;
    applyFilters(data: ChartDataType[], filters: GlobalFilters): ChartDataType[];
    exportData(datasetId: string, format: 'csv' | 'json' | 'excel', filters?: GlobalFilters): Observable<Blob>;
    private initializeCache;
    private fetchData;
    private getCacheKey;
    private filterByDateRange;
    private filterByBusinessUnit;
    private filterByRiskCategory;
    private filterBySeverity;
    private getDateFromItem;
    private getSeverityFromItem;
    private convertToCSV;
    private convertToJSON;
    private convertToExcel;
    private escapeCSVValue;
    static ɵfac: i0.ɵɵFactoryDeclaration<DataService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DataService>;
}
