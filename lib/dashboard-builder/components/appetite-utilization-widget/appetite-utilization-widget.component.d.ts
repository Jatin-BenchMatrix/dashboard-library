import { OnInit, OnDestroy } from '@angular/core';
import { LayoutService } from '../../../service/layout.service';
import { DataService } from '../../services/data.service';
import { WidgetConfig } from '../../models/widget.config';
import * as i0 from "@angular/core";
export declare class AppetiteUtilizationWidgetComponent implements OnInit, OnDestroy {
    widgetConfig?: WidgetConfig;
    layoutService: LayoutService;
    dataService: DataService;
    utilizationData: any[];
    ngOnInit(): void;
    ngOnDestroy(): void;
    private loadData;
    getStatusClass(status: string): string;
    getProgressBarStyle(status: string): any;
    onConfigure(): void;
    onDuplicate(): void;
    onDelete(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<AppetiteUtilizationWidgetComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AppetiteUtilizationWidgetComponent, "app-appetite-utilization-widget", never, { "widgetConfig": { "alias": "widgetConfig"; "required": false; }; }, {}, never, never, true, never>;
}
