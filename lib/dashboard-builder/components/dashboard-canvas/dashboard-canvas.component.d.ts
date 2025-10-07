import { OnInit, OnDestroy } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { WidgetConfig } from '../../models/widget.config';
import * as i0 from "@angular/core";
export declare class DashboardCanvasComponent implements OnInit, OnDestroy {
    private dashboardService;
    private widgetService;
    widgets: WidgetConfig[];
    selectedWidgetId: string | null;
    isDragging: boolean;
    private subscriptions;
    ngOnInit(): void;
    ngOnDestroy(): void;
    onWidgetDrop(event: CdkDragDrop<WidgetConfig[]>): void;
    onEmptyStateDrop(event: CdkDragDrop<WidgetConfig[]>): void;
    onWidgetClick(widget: WidgetConfig, index: number): void;
    onConfigureWidget(widget: WidgetConfig, event: Event): void;
    onDuplicateWidget(widget: WidgetConfig, event: Event): void;
    onDeleteWidget(widget: WidgetConfig, event: Event): void;
    onAddWidget(): void;
    onSaveLayout(): void;
    trackByWidgetId(index: number, widget: WidgetConfig): string;
    getGridClasses(): string;
    getWidgetItemClasses(widget: WidgetConfig, index: number): string;
    getGridSize(): 'sm' | 'md' | 'lg';
    static ɵfac: i0.ɵɵFactoryDeclaration<DashboardCanvasComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DashboardCanvasComponent, "app-dashboard-canvas", never, {}, {}, never, never, true, never>;
}
