import { OnInit, OnDestroy } from '@angular/core';
import { LayoutService } from '../../../service/layout.service';
import { DataService } from '../../services/data.service';
import { WidgetConfig } from '../../models/widget.config';
import * as i0 from "@angular/core";
export declare class KriBreachesWidgetComponent implements OnInit, OnDestroy {
    widgetConfig?: WidgetConfig;
    chartHeight: number;
    layoutService: LayoutService;
    dataService: DataService;
    chartData: any;
    chartOptions: any;
    private subscription?;
    ngOnInit(): void;
    ngOnDestroy(): void;
    private initializeChart;
    private loadData;
    private processDataForChart;
    private updateChartOptions;
    onConfigure(): void;
    onDuplicate(): void;
    onDelete(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<KriBreachesWidgetComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<KriBreachesWidgetComponent, "app-kri-breaches-widget", never, { "widgetConfig": { "alias": "widgetConfig"; "required": false; }; "chartHeight": { "alias": "chartHeight"; "required": false; }; }, {}, never, never, true, never>;
}
