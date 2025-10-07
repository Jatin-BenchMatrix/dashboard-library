import { OnInit } from '@angular/core';
import { WidgetConfig } from '../../models/widget.config';
import * as i0 from "@angular/core";
export declare class WidgetRendererComponent implements OnInit {
    widgetConfig?: WidgetConfig;
    isDragging: boolean;
    isSelected: boolean;
    gridSize: 'sm' | 'md' | 'lg';
    ngOnInit(): void;
    isPredefinedWidget(): boolean;
    getWidgetClasses(): string;
    getChartHeight(): number;
    static ɵfac: i0.ɵɵFactoryDeclaration<WidgetRendererComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<WidgetRendererComponent, "app-widget-renderer", never, { "widgetConfig": { "alias": "widgetConfig"; "required": false; }; "isDragging": { "alias": "isDragging"; "required": false; }; "isSelected": { "alias": "isSelected"; "required": false; }; "gridSize": { "alias": "gridSize"; "required": false; }; }, {}, never, never, true, never>;
}
