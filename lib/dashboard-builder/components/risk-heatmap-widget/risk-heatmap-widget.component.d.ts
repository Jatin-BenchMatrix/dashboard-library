import { OnInit, OnDestroy } from '@angular/core';
import { LayoutService } from '../../../service/layout.service';
import { DataService } from '../../services/data.service';
import { WidgetConfig } from '../../models/widget.config';
import * as i0 from "@angular/core";
export declare class RiskHeatmapWidgetComponent implements OnInit, OnDestroy {
    widgetConfig?: WidgetConfig;
    layoutService: LayoutService;
    dataService: DataService;
    heatmapData: any[];
    ngOnInit(): void;
    ngOnDestroy(): void;
    private loadData;
    getRiskClass(riskScore: number): string;
    onCellClick(cell: any): void;
    onConfigure(): void;
    onDuplicate(): void;
    onDelete(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<RiskHeatmapWidgetComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<RiskHeatmapWidgetComponent, "app-risk-heatmap-widget", never, { "widgetConfig": { "alias": "widgetConfig"; "required": false; }; }, {}, never, never, true, never>;
}
