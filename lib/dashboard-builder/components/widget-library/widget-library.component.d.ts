import { OnInit, OnDestroy } from '@angular/core';
import { WidgetLibraryItem } from '../../templates/prebuilt-templates';
import * as i0 from "@angular/core";
export declare class WidgetLibraryComponent implements OnInit, OnDestroy {
    private dashboardService;
    widgets: WidgetLibraryItem[];
    filteredWidgets: WidgetLibraryItem[];
    searchQuery: string;
    selectedCategory: string;
    categoryOptions: {
        label: string;
        value: string;
    }[];
    private subscriptions;
    ngOnInit(): void;
    ngOnDestroy(): void;
    onSearchChange(): void;
    onCategoryChange(): void;
    private applyFilters;
    onWidgetClick(widget: WidgetLibraryItem): void;
    onAddWidget(widget: WidgetLibraryItem, event?: Event): void;
    onClose(): void;
    getCategoryLabel(categoryKey: string): string;
    trackByWidgetKey(index: number, widget: WidgetLibraryItem): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<WidgetLibraryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<WidgetLibraryComponent, "app-widget-library", never, {}, {}, never, never, true, never>;
}
