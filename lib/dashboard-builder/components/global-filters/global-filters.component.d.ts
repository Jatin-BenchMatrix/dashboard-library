import { OnInit, OnDestroy } from '@angular/core';
import { GlobalFilters } from '../../models/dashboard.layout';
import * as i0 from "@angular/core";
export declare class GlobalFiltersComponent implements OnInit, OnDestroy {
    private dashboardService;
    filters: GlobalFilters;
    customStartDate: Date | null;
    customEndDate: Date | null;
    dateRangeOptions: {
        label: string;
        value: string;
    }[];
    businessUnitOptions: {
        label: string;
        value: string;
    }[];
    riskCategoryOptions: {
        label: string;
        value: string;
    }[];
    private subscriptions;
    ngOnInit(): void;
    ngOnDestroy(): void;
    onDateRangeChange(value: string): void;
    onCustomDateChange(): void;
    onFilterChange(): void;
    onResetFilters(): void;
    onApplyFilters(): void;
    onClose(): void;
    private updateCustomDates;
    static ɵfac: i0.ɵɵFactoryDeclaration<GlobalFiltersComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<GlobalFiltersComponent, "app-global-filters", never, {}, {}, never, never, true, never>;
}
