import * as i0 from '@angular/core';
import { signal, computed, effect, Injectable, inject, Component, Input } from '@angular/core';
import * as i1 from '@angular/common';
import { CommonModule } from '@angular/common';
import * as i2 from '@angular/forms';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import * as i1$1 from 'primeng/chart';
import { ChartModule } from 'primeng/chart';
import * as i5 from 'primeng/tabview';
import { TabViewModule } from 'primeng/tabview';
import * as i6 from 'primeng/card';
import { CardModule } from 'primeng/card';
import * as i7 from 'primeng/inputtext';
import { InputTextModule } from 'primeng/inputtext';
import * as i5$1 from 'primeng/dropdown';
import { DropdownModule } from 'primeng/dropdown';
import * as i8 from 'primeng/button';
import { ButtonModule } from 'primeng/button';
import * as i10 from 'primeng/inputswitch';
import { InputSwitchModule } from 'primeng/inputswitch';
import * as i9 from 'primeng/divider';
import { DividerModule } from 'primeng/divider';
import * as i7$3 from 'primeng/tooltip';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Subject, debounceTime, BehaviorSubject, combineLatest, of } from 'rxjs';
import * as i4 from 'primeng/api';
import * as i6$2 from 'primeng/dialog';
import { DialogModule } from 'primeng/dialog';
import { map, distinctUntilChanged, delay } from 'rxjs/operators';
import { moveItemInArray, transferArrayItem, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import * as i2$1 from 'primeng/progressbar';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputTextarea } from 'primeng/inputtextarea';
import * as i6$1 from 'primeng/multiselect';
import { MultiSelectModule } from 'primeng/multiselect';
import * as i7$1 from 'primeng/checkbox';
import { CheckboxModule } from 'primeng/checkbox';
import * as i7$2 from 'primeng/slider';
import { SliderModule } from 'primeng/slider';
import * as i3 from 'primeng/calendar';
import { CalendarModule } from 'primeng/calendar';

class LayoutService {
    _config = {
        preset: 'Aura',
        primary: 'noir',
        surface: null,
        darkTheme: false,
        menuMode: 'static'
    };
    _state = {
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        rightMenuActive: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false,
        sidebarActive: false,
        anchored: false,
        activeMenuItem: null,
        overlaySubmenuActive: false,
        rightMenuVisible: false,
        searchBarActive: false
    };
    layoutConfig = signal(this._config);
    layoutState = signal(this._state);
    configUpdate = new Subject();
    overlayOpen = new Subject();
    menuSource = new Subject();
    resetSource = new Subject();
    menuSource$ = this.menuSource.asObservable();
    resetSource$ = this.resetSource.asObservable();
    configUpdate$ = this.configUpdate.asObservable();
    overlayOpen$ = this.overlayOpen.asObservable();
    isSidebarActive = computed(() => this.layoutState().overlayMenuActive || this.layoutState().staticMenuMobileActive || this.layoutState().overlaySubmenuActive);
    isSidebarStateChanged = computed(() => {
        const layoutConfig = this.layoutConfig();
        return layoutConfig.menuMode === 'horizontal' || layoutConfig.menuMode === 'slim' || layoutConfig.menuMode === 'slim-plus';
    });
    isDarkTheme = computed(() => this.layoutConfig().darkTheme);
    isOverlay = computed(() => this.layoutConfig().menuMode === 'overlay');
    isSlim = computed(() => this.layoutConfig().menuMode === 'slim');
    isSlimPlus = computed(() => this.layoutConfig().menuMode === 'slim-plus');
    isHorizontal = computed(() => this.layoutConfig().menuMode === 'horizontal');
    transitionComplete = signal(false);
    logo = computed(() => (this.layoutConfig().darkTheme ? 'light' : 'dark'));
    rightMenuVisible = computed(() => this.layoutState().rightMenuActive);
    initialized = false;
    constructor() {
        effect(() => {
            const config = this.layoutConfig();
            if (config) {
                this.onConfigUpdate();
            }
        });
        effect(() => {
            const config = this.layoutConfig();
            if (!this.initialized || !config) {
                this.initialized = true;
                return;
            }
            this.handleDarkModeTransition(config);
        });
        effect(() => {
            this.isSidebarStateChanged() && this.reset();
        });
    }
    handleDarkModeTransition(config) {
        if (document.startViewTransition) {
            this.startViewTransition(config);
        }
        else {
            this.toggleDarkMode(config);
            this.onTransitionEnd();
        }
    }
    startViewTransition(config) {
        const transition = document.startViewTransition(() => {
            this.toggleDarkMode(config);
        });
        transition.ready
            .then(() => {
            this.onTransitionEnd();
        })
            .catch(() => { });
    }
    toggleDarkMode(config) {
        const _config = config || this.layoutConfig();
        if (_config.darkTheme) {
            document.documentElement.classList.add('app-dark');
        }
        else {
            document.documentElement.classList.remove('app-dark');
        }
    }
    onTransitionEnd() {
        this.transitionComplete.set(true);
        setTimeout(() => {
            this.transitionComplete.set(false);
        });
    }
    onMenuToggle() {
        if (this.isOverlay()) {
            this.layoutState.update((prev) => ({
                ...prev,
                overlayMenuActive: !this.layoutState().overlayMenuActive
            }));
            if (this.layoutState().overlayMenuActive) {
                this.overlayOpen.next(null);
            }
        }
        if (this.isDesktop()) {
            this.layoutState.update((prev) => ({
                ...prev,
                staticMenuDesktopInactive: !this.layoutState().staticMenuDesktopInactive
            }));
        }
        else {
            this.layoutState.update((prev) => ({
                ...prev,
                staticMenuMobileActive: !this.layoutState().staticMenuMobileActive
            }));
            if (this.layoutState().staticMenuMobileActive) {
                this.overlayOpen.next(null);
            }
        }
    }
    isDesktop() {
        return window.innerWidth > 991;
    }
    isMobile() {
        return !this.isDesktop();
    }
    onConfigUpdate() {
        this._config = { ...this.layoutConfig() };
        this.configUpdate.next(this.layoutConfig());
        this.toggleDarkMode();
    }
    onMenuStateChange(event) {
        this.menuSource.next(event);
    }
    reset() {
        this.resetSource.next(true);
    }
    onOverlaySubmenuOpen() {
        this.overlayOpen.next(null);
    }
    showProfileSidebar() {
        this.layoutState.update((prev) => ({
            ...prev,
            profileSidebarVisible: true
        }));
    }
    showConfigSidebar() {
        this.layoutState.update((prev) => ({
            ...prev,
            configSidebarVisible: true
        }));
    }
    hideConfigSidebar() {
        this.layoutState.update((prev) => ({
            ...prev,
            configSidebarVisible: false
        }));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: LayoutService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: LayoutService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: LayoutService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });

// Register the annotation plugin
Chart.register(annotationPlugin);
class CreateWidgetComponent {
    layoutService = inject(LayoutService);
    // --- Configuration State ---
    widgetConfig;
    rolesInput = "";
    // --- Select Options ---
    vizTypeOptions;
    datasetOptions;
    refreshOptions;
    xAxisOptions;
    seriesFieldOptions;
    seriesTypeOptions;
    yAxisOptions;
    // --- Preview State ---
    showPreview = true;
    // --- Chart.js Data and Options ---
    chartData = { labels: [], datasets: [] };
    chartOptions = {};
    chartType = "line";
    // --- Sample Data ---
    sampleMonthlyData = [
        { month: "Jan", residualRisk: 60, incidents: 12 },
        { month: "Feb", residualRisk: 35, incidents: 13 },
        { month: "Mar", residualRisk: 38, incidents: 12 },
        { month: "Apr", residualRisk: 55, incidents: 18 },
        { month: "May", residualRisk: 64, incidents: 17 },
        { month: "Jun", residualRisk: 48, incidents: 18 },
        { month: "Jul", residualRisk: 43, incidents: 19 },
        { month: "Aug", residualRisk: 42, incidents: 9 },
        { month: "Sep", residualRisk: 69, incidents: 15 },
        { month: "Oct", residualRisk: 38, incidents: 16 },
        { month: "Nov", residualRisk: 34, incidents: 12 },
        { month: "Dec", residualRisk: 47, incidents: 11 },
    ];
    seriesColors = [];
    subscription;
    constructor() {
        this.updateSeriesColors();
        this.widgetConfig = this.getDefaultConfig();
        this.rolesInput = this.widgetConfig.roles.join(", ");
        // Initialize select options
        this.vizTypeOptions = [
            { label: "Area Chart", value: "area" },
            { label: "Line Chart", value: "line" },
            { label: "Bar Chart", value: "bar" },
            { label: "Radar Chart", value: "radar" },
            { label: "Pie Chart", value: "pie" },
        ];
        this.datasetOptions = [{ label: "Sample: Monthly Risk & Incidents", value: "Sample: Monthly Risk & Incidents" }];
        this.refreshOptions = [
            { label: "Real-time", value: "realtime" },
            { label: "Daily", value: "daily" },
            { label: "Monthly", value: "monthly" },
        ];
        this.xAxisOptions = [
            { label: "Month", value: "month" },
            { label: "Date", value: "date" },
            { label: "Category", value: "category" },
        ];
        this.seriesFieldOptions = [
            { label: "Residual Risk", value: "residualRisk" },
            { label: "Incidents", value: "incidents" },
        ];
        this.seriesTypeOptions = [
            { label: "Area", value: "area" },
            { label: "Line", value: "line" },
            { label: "Bar", value: "bar" },
        ];
        this.yAxisOptions = [
            { label: "Left", value: "left" },
            { label: "Right", value: "right" },
        ];
    }
    ngOnInit() {
        this.updateChart();
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.updateChart();
        });
    }
    updateSeriesColors() {
        // Use CSS variables for theme colors for series colors, matching chart-widget
        const documentStyle = getComputedStyle(document.documentElement);
        this.seriesColors = [
            documentStyle.getPropertyValue('--p-primary-500').trim(),
            documentStyle.getPropertyValue('--p-primary-600').trim(),
            documentStyle.getPropertyValue('--p-indigo-400').trim(),
            documentStyle.getPropertyValue('--p-purple-400').trim()
        ].map(c => c || '#42A5F5'); // fallback
    }
    getDefaultConfig() {
        return {
            name: "",
            description: "",
            vizType: "area",
            dataset: "Sample: Monthly Risk & Incidents",
            xField: "month",
            series: [
                {
                    id: "s1",
                    label: "Residual Risk",
                    field: "residualRisk",
                    type: "area",
                    yAxis: "left",
                    fillOpacity: 0.3,
                },
                {
                    id: "s2",
                    label: "Incidents",
                    field: "incidents",
                    type: "area",
                    yAxis: "left",
                    fillOpacity: 0.5,
                },
            ],
            appetiteBands: [{ id: "b1", value: 80, label: "Amber", dashed: true }],
            stacked: false,
            showLegend: true,
            showGrid: true,
            showTooltip: true,
            drilldownEnabled: true,
            drilldownTarget: "Incident Log (by month)",
            refresh: "monthly",
            roles: ["Risk Manager", "Executive"],
        };
    }
    chartKey = 0;
    updateChart() {
        this.updateSeriesColors();
        // Update series colors dynamically on theme change
        this.widgetConfig.series.forEach((s, index) => {
            s.color = this.seriesColors[index % this.seriesColors.length];
        });
        let labels = [];
        let datasets = [];
        if (this.widgetConfig.vizType === "pie") {
            // For pie, use first series
            const s = this.widgetConfig.series[0];
            if (s) {
                labels = this.sampleMonthlyData.map((d) => d[this.widgetConfig.xField]);
                const data = this.sampleMonthlyData.map((d) => d[s.field]);
                datasets = [
                    {
                        data: data,
                        backgroundColor: this.seriesColors.slice(0, data.length),
                        hoverBackgroundColor: this.seriesColors.slice(0, data.length).map((c) => this.hexToRgba(c, 0.8)),
                    },
                ];
            }
        }
        else {
            labels = this.sampleMonthlyData.map((d) => d[this.widgetConfig.xField]);
            datasets = this.widgetConfig.series.map((s, index) => {
                const data = this.sampleMonthlyData.map((d) => d[s.field]);
                const isArea = (this.widgetConfig.vizType === "area" || this.widgetConfig.vizType === "line") && s.type === "area";
                return {
                    type: this.widgetConfig.vizType === "area" ? "line" : this.widgetConfig.vizType,
                    label: s.label,
                    data: data,
                    borderColor: s.color || this.seriesColors[index % this.seriesColors.length],
                    backgroundColor: this.hexToRgba(s.color || this.seriesColors[index % this.seriesColors.length], s.fillOpacity || (isArea ? 0.3 : 1)),
                    fill: isArea,
                    yAxisID: s.yAxis,
                    tension: 0.4, // For smooth lines in line/area charts
                };
            });
        }
        this.chartData = { labels, datasets };
        this.chartType = this.widgetConfig.vizType === "area" ? "line" : this.widgetConfig.vizType;
        this.chartOptions = this.getChartOptions();
        // Increment chartKey to force re-render on theme change
        this.chartKey++;
    }
    getChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = (documentStyle.getPropertyValue("--text-color") || "#495057").trim();
        const textColorSecondary = (documentStyle.getPropertyValue("--text-color-secondary") || textColor).trim();
        const surfaceBorder = (documentStyle.getPropertyValue("--surface-border") || "#ebedef").trim();
        const tooltipBg = (documentStyle.getPropertyValue("--surface-800") || "#1f2937").trim();
        const baseOptions = {
            maintainAspectRatio: false,
            aspectRatio: 1.2,
            plugins: {
                legend: {
                    display: this.widgetConfig.showLegend,
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        padding: 16,
                    },
                },
                tooltip: {
                    enabled: this.widgetConfig.showTooltip,
                    backgroundColor: tooltipBg,
                    titleColor: textColor,
                    bodyColor: textColorSecondary,
                    borderColor: surfaceBorder,
                    borderWidth: 1,
                    cornerRadius: 4,
                },
            },
        };
        if (this.widgetConfig.vizType === "pie") {
            return baseOptions;
        }
        else {
            const hasRightAxis = this.widgetConfig.series.some((s) => s.yAxis === "right");
            baseOptions.plugins.annotation = {
                annotations: this.widgetConfig.appetiteBands.map((band) => ({
                    type: "line",
                    yMin: band.value,
                    yMax: band.value,
                    borderColor: documentStyle.getPropertyValue('--p-orange-500').trim() || "#ff9900",
                    borderWidth: 2,
                    borderDash: band.dashed ? [6, 6] : [],
                    label: {
                        content: band.label,
                        display: true,
                        position: "end",
                        color: textColor,
                        backgroundColor: tooltipBg,
                    },
                })),
            };
            baseOptions.scales = {
                x: {
                    stacked: this.widgetConfig.stacked,
                    ticks: { color: textColorSecondary },
                    grid: {
                        color: surfaceBorder,
                        display: this.widgetConfig.showGrid,
                        drawBorder: false,
                    },
                },
                left: {
                    stacked: this.widgetConfig.stacked,
                    ticks: { color: textColorSecondary },
                    grid: {
                        color: surfaceBorder,
                        display: this.widgetConfig.showGrid,
                        drawBorder: false,
                    },
                },
                ...(hasRightAxis && {
                    right: {
                        type: "linear",
                        display: true,
                        position: "right",
                        ticks: { color: textColorSecondary },
                        grid: { drawOnChartArea: false },
                    },
                }),
            };
            return baseOptions;
        }
    }
    addSeries() {
        const n = this.widgetConfig.series.length + 1;
        this.widgetConfig.series.push({
            id: `s${Date.now()}`,
            label: `Series ${n}`,
            field: "incidents",
            type: "line",
            yAxis: "left",
            color: this.seriesColors[n % this.seriesColors.length],
        });
        this.updateChart();
    }
    removeSeries(id) {
        this.widgetConfig.series = this.widgetConfig.series.filter((s) => s.id !== id);
        this.updateChart();
    }
    addBand() {
        this.widgetConfig.appetiteBands.push({
            id: `b${Date.now()}`,
            value: 50,
            label: "New Band",
        });
        this.updateChart();
    }
    removeBand(id) {
        this.widgetConfig.appetiteBands = this.widgetConfig.appetiteBands.filter((b) => b.id !== id);
        this.updateChart();
    }
    onRolesChange(value) {
        this.rolesInput = value;
        this.widgetConfig.roles = value
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean);
    }
    saveWidget() {
        console.log("Saving Widget Configuration:", this.widgetConfig);
        alert("Widget configuration saved! Check the console for details.");
    }
    hexToRgba(hex, alpha = 1) {
        let r = 0, g = 0, b = 0;
        if (hex.length == 4) {
            r = Number.parseInt(hex[1] + hex[1], 16);
            g = Number.parseInt(hex[2] + hex[2], 16);
            b = Number.parseInt(hex[3] + hex[3], 16);
        }
        else if (hex.length == 7) {
            r = Number.parseInt(hex.substring(1, 3), 16);
            g = Number.parseInt(hex.substring(3, 5), 16);
            b = Number.parseInt(hex.substring(5, 7), 16);
        }
        return `rgba(${r},${g},${b},${alpha})`;
    }
    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: CreateWidgetComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.15", type: CreateWidgetComponent, isStandalone: true, selector: "app-create-widget", ngImport: i0, template: "<div class=\"w-full min-h-screen bg-surface\">\r\n  <!-- Header -->\r\n  <div class=\"sticky top-0 z-10 shadow-sm mb-4\">\r\n    <div class=\"flex justify-between items-center py-3\">\r\n      <!-- Left: Title -->\r\n      <div class=\"text-xl font-semibold\">Create New Widget</div>\r\n      <!-- Right: Buttons -->\r\n      <div class=\"flex items-center gap-2\">\r\n        <p-button\r\n          [label]=\"showPreview ? 'Hide Preview' : 'Show Preview'\"\r\n          [icon]=\"showPreview ? 'pi pi-eye-slash' : 'pi pi-eye'\"\r\n          styleClass=\"p-button-outlined\"\r\n          (onClick)=\"showPreview = !showPreview\">\r\n        </p-button>\r\n        <p-button label=\"Save Widget\" icon=\"pi pi-save\" (onClick)=\"saveWidget()\"></p-button>\r\n      </div>\r\n    </div>\r\n  </div>\r\n\r\n  <!-- Content -->\r\n  <div class=\"mx-auto max-w-full px-0 py-6 flex flex-col md:flex-row gap-8\">\r\n    <!-- Left: Config -->\r\n    <div class=\"w-full md:w-1/2 space-y-6 rounded-xl LeftConfig\">\r\n      <!-- Stepper-like tabs -->\r\n      <p-tabView (onChange)=\"updateChart()\" [scrollable]=\"true\" styleClass=\"tabview\">\r\n        <p-tabPanel header=\"1. Basics\">\r\n          <!-- Rounded card, consistent inner spacing -->\r\n          <p-card>\r\n            <ng-template pTemplate=\"header\">\r\n              <div class=\"pb-2\">\r\n                <h3 class=\"text-lg font-semibold\">Basics</h3>\r\n                <p class=\"text-xs text-muted-foreground\">Name, describe, and choose visualization type.</p>\r\n              </div>\r\n            </ng-template>\r\n            <div class=\"grid gap-4 md:grid-cols-2\">\r\n              <div>\r\n                <label for=\"widgetName\" class=\"block font-medium mb-2\">Widget Name</label>\r\n                <input id=\"widgetName\" type=\"text\" pInputText class=\"w-full\" [(ngModel)]=\"widgetConfig.name\" placeholder=\"Residual Risk & Incidents \u2014 12\u2011month trend\">\r\n              </div>\r\n              <div>\r\n                <label for=\"vizType\" class=\"block font-medium mb-2\">Visualization Type</label>\r\n                <p-dropdown id=\"vizType\" [options]=\"vizTypeOptions\" [(ngModel)]=\"widgetConfig.vizType\" optionLabel=\"label\" optionValue=\"value\" appendTo=\"body\" [autoDisplayFirst]=\"false\" [filter]=\"true\" styleClass=\"w-full\" [panelStyle]=\"{ 'max-height': '200px', 'overflow': 'auto', width:'100%' }\" (onChange)=\"updateChart()\"></p-dropdown>\r\n              </div>\r\n              <div>\r\n                <label for=\"description\" class=\"block font-medium mb-2\">Description</label>\r\n                <textarea id=\"description\" rows=\"3\" pInputText class=\"w-full\" [(ngModel)]=\"widgetConfig.description\" placeholder=\"Shows residual risk scores and incident counts over 12 months, with appetite threshold bands.\"></textarea>\r\n              </div>\r\n            </div>\r\n          </p-card>\r\n        </p-tabPanel>\r\n\r\n        <p-tabPanel header=\"2. Data Source\">\r\n          <p-card>\r\n            <ng-template pTemplate=\"header\">\r\n              <div class=\"pb-2\">\r\n                <h3 class=\"text-lg font-semibold\">Data Source</h3>\r\n                <p class=\"text-xs text-muted-foreground\">Pick a dataset and optional filters. This demo uses a sample monthly dataset.</p>\r\n              </div>\r\n            </ng-template>\r\n            <div class=\"grid gap-4 md:grid-cols-2\">\r\n              <div>\r\n                <label for=\"dataset\" class=\"block font-medium mb-2\">Dataset</label>\r\n                <p-dropdown id=\"dataset\" [options]=\"datasetOptions\" [(ngModel)]=\"widgetConfig.dataset\" appendTo=\"body\" [autoDisplayFirst]=\"false\" [filter]=\"true\" styleClass=\"w-full\" [panelStyle]=\"{ 'max-height': '200px', 'overflow': 'auto', width:'100%' }\" (onChange)=\"updateChart()\"></p-dropdown>\r\n              </div>\r\n              <div>\r\n                <label for=\"refresh\" class=\"block font-medium mb-2\">Refresh</label>\r\n                <p-dropdown id=\"refresh\" [options]=\"refreshOptions\" [(ngModel)]=\"widgetConfig.refresh\" appendTo=\"body\" [autoDisplayFirst]=\"false\" [filter]=\"true\" styleClass=\"w-full\" [panelStyle]=\"{ 'max-height': '200px', 'overflow': 'auto', width:'100%' }\"></p-dropdown>\r\n              </div>\r\n            </div>\r\n          </p-card>\r\n        </p-tabPanel>\r\n\r\n        <p-tabPanel header=\"3. Field Mapping\">\r\n          <p-card>\r\n            <ng-template pTemplate=\"header\">\r\n              <div class=\"pb-2\">\r\n                <h3 class=\"text-lg font-semibold\">Field Mapping</h3>\r\n                <p class=\"text-xs text-muted-foreground\">Map X axis and one or more series to numeric fields.</p>\r\n              </div>\r\n            </ng-template>\r\n            <div class=\"grid gap-4 md:grid-cols-3 items-end\">\r\n              <div>\r\n                <label for=\"xAxis\" class=\"block font-medium mb-2\">X\u2011Axis</label>\r\n                <p-dropdown id=\"xAxis\" [options]=\"xAxisOptions\" [(ngModel)]=\"widgetConfig.xField\" appendTo=\"body\" [autoDisplayFirst]=\"false\" [filter]=\"true\" styleClass=\"w-full\" [panelStyle]=\"{ 'max-height': '200px', 'overflow': 'auto', width:'100%' }\" (onChange)=\"updateChart()\"></p-dropdown>\r\n              </div>\r\n              <!-- Prevent label and switch collision by allowing wrap -->\r\n              <div class=\"flex items-center gap-3 flex-wrap\">\r\n                <p-inputSwitch [(ngModel)]=\"widgetConfig.stacked\" inputId=\"stackedSwitch\" (ngModelChange)=\"updateChart()\"></p-inputSwitch>\r\n                <label for=\"stackedSwitch\" class=\"whitespace-nowrap\">Stack Series</label>\r\n              </div>\r\n            </div>\r\n            <div class=\"my-3\"></div>\r\n            <div class=\"space-y-3\">\r\n              <!-- More room inside row, rounded, no harsh borders -->\r\n              <div *ngFor=\"let series of widgetConfig.series; let i = index\" class=\"grid md:grid-cols-6 gap-3 items-end rounded-xl p-3\">\r\n                <div class=\"md:col-span-2\">\r\n                  <label [for]=\"'s_label_' + i\" class=\"block font-medium mb-2\">Label</label>\r\n                  <input [id]=\"'s_label_' + i\" type=\"text\" pInputText class=\"w-full\" [(ngModel)]=\"series.label\" (ngModelChange)=\"updateChart()\">\r\n                </div>\r\n                <div>\r\n                  <label [for]=\"'s_field_' + i\" class=\"block font-medium mb-2\">Field</label>\r\n                  <p-dropdown [id]=\"'s_field_' + i\" [options]=\"seriesFieldOptions\" [(ngModel)]=\"series.field\" appendTo=\"body\" [autoDisplayFirst]=\"false\" [filter]=\"true\" styleClass=\"w-full\" [panelStyle]=\"{ 'max-height': '200px', 'overflow': 'auto', width:'100%' }\" (onChange)=\"updateChart()\"></p-dropdown>\r\n                </div>\r\n                <div>\r\n                  <label [for]=\"'s_type_' + i\" class=\"block font-medium mb-2\">Series Type</label>\r\n                  <p-dropdown [id]=\"'s_type_' + i\" [options]=\"seriesTypeOptions\" [(ngModel)]=\"series.type\" appendTo=\"body\" [autoDisplayFirst]=\"false\" [filter]=\"true\" styleClass=\"w-full\" [panelStyle]=\"{ 'max-height': '200px', 'overflow': 'auto', width:'100%' }\" [disabled]=\"widgetConfig.vizType !== 'area'\" (onChange)=\"updateChart()\"></p-dropdown>\r\n                </div>\r\n                <div>\r\n                  <label [for]=\"'s_yaxis_' + i\" class=\"block font-medium mb-2\">Y\u2011Axis</label>\r\n                  <p-dropdown [id]=\"'s_yaxis_' + i\" [options]=\"yAxisOptions\" [(ngModel)]=\"series.yAxis\" appendTo=\"body\" [autoDisplayFirst]=\"false\" [filter]=\"true\" styleClass=\"w-full\" [panelStyle]=\"{ 'max-height': '200px', 'overflow': 'auto', width:'100%' }\" (onChange)=\"updateChart()\"></p-dropdown>\r\n                </div>\r\n                <div class=\"flex items-center justify-end\">\r\n                  <p-button icon=\"pi pi-trash\" styleClass=\"p-button-danger p-button-text\" (onClick)=\"removeSeries(series.id)\"></p-button>\r\n                </div>\r\n              </div>\r\n              <p-button label=\"Add Series\" icon=\"pi pi-plus\" styleClass=\"p-button-outlined\" (onClick)=\"addSeries()\"></p-button>\r\n            </div>\r\n          </p-card>\r\n        </p-tabPanel>\r\n\r\n        <p-tabPanel header=\"4. Visualization\">\r\n          <p-card>\r\n            <ng-template pTemplate=\"header\">\r\n              <div class=\"pb-2\">\r\n                <h3 class=\"text-lg font-semibold\">Visualization Options</h3>\r\n                <p class=\"text-xs text-muted-foreground\">Grid, legend, labels, appetite bands & annotations.</p>\r\n              </div>\r\n            </ng-template>\r\n            <div class=\"grid gap-4 md:grid-cols-3\">\r\n              <div class=\"flex items-center gap-3 flex-wrap\">\r\n                <p-inputSwitch [(ngModel)]=\"widgetConfig.showGrid\" inputId=\"gridSwitch\" (ngModelChange)=\"updateChart()\"></p-inputSwitch>\r\n                <label for=\"gridSwitch\" class=\"whitespace-nowrap\">Show grid</label>\r\n              </div>\r\n              <div class=\"flex items-center gap-3 flex-wrap\">\r\n                <p-inputSwitch [(ngModel)]=\"widgetConfig.showLegend\" inputId=\"legendSwitch\" (ngModelChange)=\"updateChart()\"></p-inputSwitch>\r\n                <label for=\"legendSwitch\" class=\"whitespace-nowrap\">Show legend</label>\r\n              </div>\r\n              <div class=\"flex items-center gap-3 flex-wrap\">\r\n                <p-inputSwitch [(ngModel)]=\"widgetConfig.showTooltip\" inputId=\"tooltipSwitch\" (ngModelChange)=\"updateChart()\"></p-inputSwitch>\r\n                <label for=\"tooltipSwitch\" class=\"whitespace-nowrap\">Show tooltip</label>\r\n              </div>\r\n            </div>\r\n\r\n            <div class=\"my-4\"></div>\r\n            <div class=\"mb-2 font-medium\">Appetite Bands</div>\r\n            <div class=\"space-y-3\">\r\n              <div *ngFor=\"let band of widgetConfig.appetiteBands; let i = index\" class=\"grid md:grid-cols-5 gap-3 items-end rounded-xl p-3\">\r\n                <div>\r\n                  <label [for]=\"'b_val_' + i\" class=\"block font-medium mb-2\">Value</label>\r\n                  <input [id]=\"'b_val_' + i\" type=\"number\" pInputText class=\"w-full\" [(ngModel)]=\"band.value\" (ngModelChange)=\"updateChart()\">\r\n                </div>\r\n                <div class=\"md:col-span-2\">\r\n                  <label [for]=\"'b_label_' + i\" class=\"block font-medium mb-2\">Label</label>\r\n                  <input [id]=\"'b_label_' + i\" type=\"text\" pInputText class=\"w-full\" [(ngModel)]=\"band.label\" (ngModelChange)=\"updateChart()\">\r\n                </div>\r\n                <div class=\"flex items-center gap-3 flex-wrap\">\r\n                  <p-inputSwitch [(ngModel)]=\"band.dashed\" [inputId]=\"'b_dash_' + i\" (ngModelChange)=\"updateChart()\"></p-inputSwitch>\r\n                  <label [for]=\"'b_dash_' + i\" class=\"whitespace-nowrap\">Dashed</label>\r\n                </div>\r\n                <div class=\"flex items-center justify-end\">\r\n                  <p-button icon=\"pi pi-trash\" styleClass=\"p-button-danger p-button-text\" (onClick)=\"removeBand(band.id)\"></p-button>\r\n                </div>\r\n              </div>\r\n              <p-button label=\"Add Band\" icon=\"pi pi-plus\" styleClass=\"p-button-outlined\" (onClick)=\"addBand()\"></p-button>\r\n            </div>\r\n          </p-card>\r\n        </p-tabPanel>\r\n\r\n        <p-tabPanel header=\"5. Rules & Interactivity\">\r\n          <p-card>\r\n            <ng-template pTemplate=\"header\">\r\n              <div class=\"pb-2\">\r\n                <h3 class=\"text-lg font-semibold\">Rules & Interactivity</h3>\r\n                <p class=\"text-xs text-muted-foreground\">Configure drill\u2011downs and highlight rules.</p>\r\n              </div>\r\n            </ng-template>\r\n            <div class=\"grid gap-4 md:grid-cols-2 items-end\">\r\n              <div class=\"flex items-center gap-3 flex-wrap\">\r\n                <p-inputSwitch [(ngModel)]=\"widgetConfig.drilldownEnabled\" inputId=\"drillSwitch\"></p-inputSwitch>\r\n                <label for=\"drillSwitch\" class=\"whitespace-nowrap\">Enable drill\u2011down</label>\r\n              </div>\r\n              <div>\r\n                <label for=\"drillTarget\" class=\"block font-medium mb-2\">Drill\u2011down target</label>\r\n                <input id=\"drillTarget\" type=\"text\" pInputText class=\"w-full\" [(ngModel)]=\"widgetConfig.drilldownTarget\" [disabled]=\"!widgetConfig.drilldownEnabled\">\r\n              </div>\r\n            </div>\r\n            <p class=\"text-xs text-muted-foreground mt-2\">Tip: Users can click a month to open the linked incident log with filters applied.</p>\r\n          </p-card>\r\n        </p-tabPanel>\r\n\r\n        <p-tabPanel header=\"6. Security & Schedule\">\r\n          <p-card>\r\n            <ng-template pTemplate=\"header\">\r\n              <div class=\"pb-2\">\r\n                <h3 class=\"text-lg font-semibold\">Security & Schedule</h3>\r\n                <p class=\"text-xs text-muted-foreground\">Who can view this widget and how often it refreshes.</p>\r\n              </div>\r\n            </ng-template>\r\n            <div class=\"grid gap-4 md:grid-cols-3\">\r\n              <div>\r\n                <label for=\"roles\" class=\"block font-medium mb-2\">Roles</label>\r\n                <input id=\"roles\" type=\"text\" pInputText class=\"w-full\" [ngModel]=\"rolesInput\" (ngModelChange)=\"onRolesChange($event)\">\r\n              </div>\r\n              <div>\r\n                <label for=\"refresh\" class=\"block font-medium mb-2\">Refresh Frequency</label>\r\n                <p-dropdown id=\"refresh\" [options]=\"refreshOptions\" [(ngModel)]=\"widgetConfig.refresh\" appendTo=\"body\" [autoDisplayFirst]=\"false\" [filter]=\"true\" styleClass=\"w-full\" [panelStyle]=\"{ 'max-height': '200px', 'overflow': 'auto', width:'100%' }\"></p-dropdown>\r\n              </div>\r\n              <div class=\"flex items-end\">\r\n                <p-button label=\"Save Widget\" icon=\"pi pi-save\" styleClass=\"w-full\" (onClick)=\"saveWidget()\"></p-button>\r\n              </div>\r\n            </div>\r\n          </p-card>\r\n        </p-tabPanel>\r\n      </p-tabView>\r\n    </div>\r\n\r\n    <!-- Right: Live Preview -->\r\n    <div class=\"w-full md:w-1/2 sticky top-20 self-start RightPreview\" *ngIf=\"showPreview\">\r\n      <p-card>\r\n        <ng-template pTemplate=\"header\">\r\n          <div>\r\n            <h3 class=\"p-4 text-lg font-semibold\">Live Preview\r\n              <span class=\"text-xs text-surface-500\" *ngIf=\"widgetConfig.dataset?.includes('Sample')\">\r\n                (sample dataset)\r\n              </span>\r\n            </h3>\r\n          </div>\r\n        </ng-template>\r\n        <div>\r\n          <p-chart [type]=\"chartType\" [data]=\"chartData\" [options]=\"chartOptions\"></p-chart>\r\n        </div>\r\n      </p-card>\r\n    </div>\r\n  </div>\r\n</div>\r\n", styles: [":host ::ng-deep .p-card{border:none!important;border-radius:.75rem;box-shadow:none!important}.LeftConfig{display:flex;flex-direction:column;height:100%;overflow:hidden;margin-right:1rem}.RightPreview{display:flex;flex-direction:column;height:100%;overflow:hidden;margin-left:1rem}@media (max-width: 768px){.LeftConfig{margin-right:0;margin-bottom:1rem}.RightPreview{margin-left:0}}.LeftConfig,.RightPreview{border:1px solid var(--surface-border);border-radius:.75rem;box-shadow:0 2px 6px #00000014;background:var(--surface-bg)}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i2.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i2.NumberValueAccessor, selector: "input[type=number][formControlName],input[type=number][formControl],input[type=number][ngModel]" }, { kind: "directive", type: i2.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i2.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "ngmodule", type: ChartModule }, { kind: "component", type: i1$1.UIChart, selector: "p-chart", inputs: ["type", "plugins", "width", "height", "responsive", "ariaLabel", "ariaLabelledBy", "data", "options"], outputs: ["onDataSelect"] }, { kind: "directive", type: i4.PrimeTemplate, selector: "[pTemplate]", inputs: ["type", "pTemplate"] }, { kind: "ngmodule", type: TabViewModule }, { kind: "component", type: i5.TabView, selector: "p-tabView, p-tabview", inputs: ["style", "styleClass", "controlClose", "scrollable", "activeIndex", "selectOnFocus", "nextButtonAriaLabel", "prevButtonAriaLabel", "autoHideButtons", "tabindex"], outputs: ["onChange", "onClose", "activeIndexChange"] }, { kind: "component", type: i5.TabPanel, selector: "p-tabPanel, p-tabpanel", inputs: ["closable", "headerStyle", "headerStyleClass", "cache", "tooltip", "tooltipPosition", "tooltipPositionStyle", "tooltipStyleClass", "selected", "disabled", "header", "leftIcon", "rightIcon"] }, { kind: "ngmodule", type: CardModule }, { kind: "component", type: i6.Card, selector: "p-card", inputs: ["header", "subheader", "style", "styleClass"] }, { kind: "ngmodule", type: InputTextModule }, { kind: "directive", type: i7.InputText, selector: "[pInputText]", inputs: ["variant", "fluid", "pSize"] }, { kind: "ngmodule", type: DropdownModule }, { kind: "component", type: i5$1.Dropdown, selector: "p-dropdown", inputs: ["id", "scrollHeight", "filter", "name", "style", "panelStyle", "styleClass", "panelStyleClass", "readonly", "required", "editable", "appendTo", "tabindex", "placeholder", "loadingIcon", "filterPlaceholder", "filterLocale", "variant", "inputId", "dataKey", "filterBy", "filterFields", "autofocus", "resetFilterOnHide", "checkmark", "dropdownIcon", "loading", "optionLabel", "optionValue", "optionDisabled", "optionGroupLabel", "optionGroupChildren", "autoDisplayFirst", "group", "showClear", "emptyFilterMessage", "emptyMessage", "lazy", "virtualScroll", "virtualScrollItemSize", "virtualScrollOptions", "overlayOptions", "ariaFilterLabel", "ariaLabel", "ariaLabelledBy", "filterMatchMode", "maxlength", "tooltip", "tooltipPosition", "tooltipPositionStyle", "tooltipStyleClass", "focusOnHover", "selectOnFocus", "autoOptionFocus", "autofocusFilter", "fluid", "disabled", "itemSize", "autoZIndex", "baseZIndex", "showTransitionOptions", "hideTransitionOptions", "filterValue", "options"], outputs: ["onChange", "onFilter", "onFocus", "onBlur", "onClick", "onShow", "onHide", "onClear", "onLazyLoad"] }, { kind: "ngmodule", type: ButtonModule }, { kind: "component", type: i8.Button, selector: "p-button", inputs: ["type", "iconPos", "icon", "badge", "label", "disabled", "loading", "loadingIcon", "raised", "rounded", "text", "plain", "severity", "outlined", "link", "tabindex", "size", "variant", "style", "styleClass", "badgeClass", "badgeSeverity", "ariaLabel", "autofocus", "fluid", "buttonProps"], outputs: ["onClick", "onFocus", "onBlur"] }, { kind: "ngmodule", type: InputSwitchModule }, { kind: "component", type: i10.InputSwitch, selector: "p-inputSwitch, p-inputswitch", inputs: ["style", "styleClass", "tabindex", "inputId", "name", "disabled", "readonly", "trueValue", "falseValue", "ariaLabel", "ariaLabelledBy", "autofocus"], outputs: ["onChange"] }, { kind: "ngmodule", type: DividerModule }, { kind: "ngmodule", type: TooltipModule }, { kind: "ngmodule", type: ToolbarModule }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: CreateWidgetComponent, decorators: [{
            type: Component,
            args: [{ selector: "app-create-widget", standalone: true, imports: [
                        CommonModule,
                        FormsModule,
                        ChartModule,
                        TabViewModule,
                        CardModule,
                        InputTextModule,
                        DropdownModule,
                        ButtonModule,
                        InputSwitchModule,
                        DividerModule,
                        TooltipModule,
                        ToolbarModule,
                    ], template: "<div class=\"w-full min-h-screen bg-surface\">\r\n  <!-- Header -->\r\n  <div class=\"sticky top-0 z-10 shadow-sm mb-4\">\r\n    <div class=\"flex justify-between items-center py-3\">\r\n      <!-- Left: Title -->\r\n      <div class=\"text-xl font-semibold\">Create New Widget</div>\r\n      <!-- Right: Buttons -->\r\n      <div class=\"flex items-center gap-2\">\r\n        <p-button\r\n          [label]=\"showPreview ? 'Hide Preview' : 'Show Preview'\"\r\n          [icon]=\"showPreview ? 'pi pi-eye-slash' : 'pi pi-eye'\"\r\n          styleClass=\"p-button-outlined\"\r\n          (onClick)=\"showPreview = !showPreview\">\r\n        </p-button>\r\n        <p-button label=\"Save Widget\" icon=\"pi pi-save\" (onClick)=\"saveWidget()\"></p-button>\r\n      </div>\r\n    </div>\r\n  </div>\r\n\r\n  <!-- Content -->\r\n  <div class=\"mx-auto max-w-full px-0 py-6 flex flex-col md:flex-row gap-8\">\r\n    <!-- Left: Config -->\r\n    <div class=\"w-full md:w-1/2 space-y-6 rounded-xl LeftConfig\">\r\n      <!-- Stepper-like tabs -->\r\n      <p-tabView (onChange)=\"updateChart()\" [scrollable]=\"true\" styleClass=\"tabview\">\r\n        <p-tabPanel header=\"1. Basics\">\r\n          <!-- Rounded card, consistent inner spacing -->\r\n          <p-card>\r\n            <ng-template pTemplate=\"header\">\r\n              <div class=\"pb-2\">\r\n                <h3 class=\"text-lg font-semibold\">Basics</h3>\r\n                <p class=\"text-xs text-muted-foreground\">Name, describe, and choose visualization type.</p>\r\n              </div>\r\n            </ng-template>\r\n            <div class=\"grid gap-4 md:grid-cols-2\">\r\n              <div>\r\n                <label for=\"widgetName\" class=\"block font-medium mb-2\">Widget Name</label>\r\n                <input id=\"widgetName\" type=\"text\" pInputText class=\"w-full\" [(ngModel)]=\"widgetConfig.name\" placeholder=\"Residual Risk & Incidents \u2014 12\u2011month trend\">\r\n              </div>\r\n              <div>\r\n                <label for=\"vizType\" class=\"block font-medium mb-2\">Visualization Type</label>\r\n                <p-dropdown id=\"vizType\" [options]=\"vizTypeOptions\" [(ngModel)]=\"widgetConfig.vizType\" optionLabel=\"label\" optionValue=\"value\" appendTo=\"body\" [autoDisplayFirst]=\"false\" [filter]=\"true\" styleClass=\"w-full\" [panelStyle]=\"{ 'max-height': '200px', 'overflow': 'auto', width:'100%' }\" (onChange)=\"updateChart()\"></p-dropdown>\r\n              </div>\r\n              <div>\r\n                <label for=\"description\" class=\"block font-medium mb-2\">Description</label>\r\n                <textarea id=\"description\" rows=\"3\" pInputText class=\"w-full\" [(ngModel)]=\"widgetConfig.description\" placeholder=\"Shows residual risk scores and incident counts over 12 months, with appetite threshold bands.\"></textarea>\r\n              </div>\r\n            </div>\r\n          </p-card>\r\n        </p-tabPanel>\r\n\r\n        <p-tabPanel header=\"2. Data Source\">\r\n          <p-card>\r\n            <ng-template pTemplate=\"header\">\r\n              <div class=\"pb-2\">\r\n                <h3 class=\"text-lg font-semibold\">Data Source</h3>\r\n                <p class=\"text-xs text-muted-foreground\">Pick a dataset and optional filters. This demo uses a sample monthly dataset.</p>\r\n              </div>\r\n            </ng-template>\r\n            <div class=\"grid gap-4 md:grid-cols-2\">\r\n              <div>\r\n                <label for=\"dataset\" class=\"block font-medium mb-2\">Dataset</label>\r\n                <p-dropdown id=\"dataset\" [options]=\"datasetOptions\" [(ngModel)]=\"widgetConfig.dataset\" appendTo=\"body\" [autoDisplayFirst]=\"false\" [filter]=\"true\" styleClass=\"w-full\" [panelStyle]=\"{ 'max-height': '200px', 'overflow': 'auto', width:'100%' }\" (onChange)=\"updateChart()\"></p-dropdown>\r\n              </div>\r\n              <div>\r\n                <label for=\"refresh\" class=\"block font-medium mb-2\">Refresh</label>\r\n                <p-dropdown id=\"refresh\" [options]=\"refreshOptions\" [(ngModel)]=\"widgetConfig.refresh\" appendTo=\"body\" [autoDisplayFirst]=\"false\" [filter]=\"true\" styleClass=\"w-full\" [panelStyle]=\"{ 'max-height': '200px', 'overflow': 'auto', width:'100%' }\"></p-dropdown>\r\n              </div>\r\n            </div>\r\n          </p-card>\r\n        </p-tabPanel>\r\n\r\n        <p-tabPanel header=\"3. Field Mapping\">\r\n          <p-card>\r\n            <ng-template pTemplate=\"header\">\r\n              <div class=\"pb-2\">\r\n                <h3 class=\"text-lg font-semibold\">Field Mapping</h3>\r\n                <p class=\"text-xs text-muted-foreground\">Map X axis and one or more series to numeric fields.</p>\r\n              </div>\r\n            </ng-template>\r\n            <div class=\"grid gap-4 md:grid-cols-3 items-end\">\r\n              <div>\r\n                <label for=\"xAxis\" class=\"block font-medium mb-2\">X\u2011Axis</label>\r\n                <p-dropdown id=\"xAxis\" [options]=\"xAxisOptions\" [(ngModel)]=\"widgetConfig.xField\" appendTo=\"body\" [autoDisplayFirst]=\"false\" [filter]=\"true\" styleClass=\"w-full\" [panelStyle]=\"{ 'max-height': '200px', 'overflow': 'auto', width:'100%' }\" (onChange)=\"updateChart()\"></p-dropdown>\r\n              </div>\r\n              <!-- Prevent label and switch collision by allowing wrap -->\r\n              <div class=\"flex items-center gap-3 flex-wrap\">\r\n                <p-inputSwitch [(ngModel)]=\"widgetConfig.stacked\" inputId=\"stackedSwitch\" (ngModelChange)=\"updateChart()\"></p-inputSwitch>\r\n                <label for=\"stackedSwitch\" class=\"whitespace-nowrap\">Stack Series</label>\r\n              </div>\r\n            </div>\r\n            <div class=\"my-3\"></div>\r\n            <div class=\"space-y-3\">\r\n              <!-- More room inside row, rounded, no harsh borders -->\r\n              <div *ngFor=\"let series of widgetConfig.series; let i = index\" class=\"grid md:grid-cols-6 gap-3 items-end rounded-xl p-3\">\r\n                <div class=\"md:col-span-2\">\r\n                  <label [for]=\"'s_label_' + i\" class=\"block font-medium mb-2\">Label</label>\r\n                  <input [id]=\"'s_label_' + i\" type=\"text\" pInputText class=\"w-full\" [(ngModel)]=\"series.label\" (ngModelChange)=\"updateChart()\">\r\n                </div>\r\n                <div>\r\n                  <label [for]=\"'s_field_' + i\" class=\"block font-medium mb-2\">Field</label>\r\n                  <p-dropdown [id]=\"'s_field_' + i\" [options]=\"seriesFieldOptions\" [(ngModel)]=\"series.field\" appendTo=\"body\" [autoDisplayFirst]=\"false\" [filter]=\"true\" styleClass=\"w-full\" [panelStyle]=\"{ 'max-height': '200px', 'overflow': 'auto', width:'100%' }\" (onChange)=\"updateChart()\"></p-dropdown>\r\n                </div>\r\n                <div>\r\n                  <label [for]=\"'s_type_' + i\" class=\"block font-medium mb-2\">Series Type</label>\r\n                  <p-dropdown [id]=\"'s_type_' + i\" [options]=\"seriesTypeOptions\" [(ngModel)]=\"series.type\" appendTo=\"body\" [autoDisplayFirst]=\"false\" [filter]=\"true\" styleClass=\"w-full\" [panelStyle]=\"{ 'max-height': '200px', 'overflow': 'auto', width:'100%' }\" [disabled]=\"widgetConfig.vizType !== 'area'\" (onChange)=\"updateChart()\"></p-dropdown>\r\n                </div>\r\n                <div>\r\n                  <label [for]=\"'s_yaxis_' + i\" class=\"block font-medium mb-2\">Y\u2011Axis</label>\r\n                  <p-dropdown [id]=\"'s_yaxis_' + i\" [options]=\"yAxisOptions\" [(ngModel)]=\"series.yAxis\" appendTo=\"body\" [autoDisplayFirst]=\"false\" [filter]=\"true\" styleClass=\"w-full\" [panelStyle]=\"{ 'max-height': '200px', 'overflow': 'auto', width:'100%' }\" (onChange)=\"updateChart()\"></p-dropdown>\r\n                </div>\r\n                <div class=\"flex items-center justify-end\">\r\n                  <p-button icon=\"pi pi-trash\" styleClass=\"p-button-danger p-button-text\" (onClick)=\"removeSeries(series.id)\"></p-button>\r\n                </div>\r\n              </div>\r\n              <p-button label=\"Add Series\" icon=\"pi pi-plus\" styleClass=\"p-button-outlined\" (onClick)=\"addSeries()\"></p-button>\r\n            </div>\r\n          </p-card>\r\n        </p-tabPanel>\r\n\r\n        <p-tabPanel header=\"4. Visualization\">\r\n          <p-card>\r\n            <ng-template pTemplate=\"header\">\r\n              <div class=\"pb-2\">\r\n                <h3 class=\"text-lg font-semibold\">Visualization Options</h3>\r\n                <p class=\"text-xs text-muted-foreground\">Grid, legend, labels, appetite bands & annotations.</p>\r\n              </div>\r\n            </ng-template>\r\n            <div class=\"grid gap-4 md:grid-cols-3\">\r\n              <div class=\"flex items-center gap-3 flex-wrap\">\r\n                <p-inputSwitch [(ngModel)]=\"widgetConfig.showGrid\" inputId=\"gridSwitch\" (ngModelChange)=\"updateChart()\"></p-inputSwitch>\r\n                <label for=\"gridSwitch\" class=\"whitespace-nowrap\">Show grid</label>\r\n              </div>\r\n              <div class=\"flex items-center gap-3 flex-wrap\">\r\n                <p-inputSwitch [(ngModel)]=\"widgetConfig.showLegend\" inputId=\"legendSwitch\" (ngModelChange)=\"updateChart()\"></p-inputSwitch>\r\n                <label for=\"legendSwitch\" class=\"whitespace-nowrap\">Show legend</label>\r\n              </div>\r\n              <div class=\"flex items-center gap-3 flex-wrap\">\r\n                <p-inputSwitch [(ngModel)]=\"widgetConfig.showTooltip\" inputId=\"tooltipSwitch\" (ngModelChange)=\"updateChart()\"></p-inputSwitch>\r\n                <label for=\"tooltipSwitch\" class=\"whitespace-nowrap\">Show tooltip</label>\r\n              </div>\r\n            </div>\r\n\r\n            <div class=\"my-4\"></div>\r\n            <div class=\"mb-2 font-medium\">Appetite Bands</div>\r\n            <div class=\"space-y-3\">\r\n              <div *ngFor=\"let band of widgetConfig.appetiteBands; let i = index\" class=\"grid md:grid-cols-5 gap-3 items-end rounded-xl p-3\">\r\n                <div>\r\n                  <label [for]=\"'b_val_' + i\" class=\"block font-medium mb-2\">Value</label>\r\n                  <input [id]=\"'b_val_' + i\" type=\"number\" pInputText class=\"w-full\" [(ngModel)]=\"band.value\" (ngModelChange)=\"updateChart()\">\r\n                </div>\r\n                <div class=\"md:col-span-2\">\r\n                  <label [for]=\"'b_label_' + i\" class=\"block font-medium mb-2\">Label</label>\r\n                  <input [id]=\"'b_label_' + i\" type=\"text\" pInputText class=\"w-full\" [(ngModel)]=\"band.label\" (ngModelChange)=\"updateChart()\">\r\n                </div>\r\n                <div class=\"flex items-center gap-3 flex-wrap\">\r\n                  <p-inputSwitch [(ngModel)]=\"band.dashed\" [inputId]=\"'b_dash_' + i\" (ngModelChange)=\"updateChart()\"></p-inputSwitch>\r\n                  <label [for]=\"'b_dash_' + i\" class=\"whitespace-nowrap\">Dashed</label>\r\n                </div>\r\n                <div class=\"flex items-center justify-end\">\r\n                  <p-button icon=\"pi pi-trash\" styleClass=\"p-button-danger p-button-text\" (onClick)=\"removeBand(band.id)\"></p-button>\r\n                </div>\r\n              </div>\r\n              <p-button label=\"Add Band\" icon=\"pi pi-plus\" styleClass=\"p-button-outlined\" (onClick)=\"addBand()\"></p-button>\r\n            </div>\r\n          </p-card>\r\n        </p-tabPanel>\r\n\r\n        <p-tabPanel header=\"5. Rules & Interactivity\">\r\n          <p-card>\r\n            <ng-template pTemplate=\"header\">\r\n              <div class=\"pb-2\">\r\n                <h3 class=\"text-lg font-semibold\">Rules & Interactivity</h3>\r\n                <p class=\"text-xs text-muted-foreground\">Configure drill\u2011downs and highlight rules.</p>\r\n              </div>\r\n            </ng-template>\r\n            <div class=\"grid gap-4 md:grid-cols-2 items-end\">\r\n              <div class=\"flex items-center gap-3 flex-wrap\">\r\n                <p-inputSwitch [(ngModel)]=\"widgetConfig.drilldownEnabled\" inputId=\"drillSwitch\"></p-inputSwitch>\r\n                <label for=\"drillSwitch\" class=\"whitespace-nowrap\">Enable drill\u2011down</label>\r\n              </div>\r\n              <div>\r\n                <label for=\"drillTarget\" class=\"block font-medium mb-2\">Drill\u2011down target</label>\r\n                <input id=\"drillTarget\" type=\"text\" pInputText class=\"w-full\" [(ngModel)]=\"widgetConfig.drilldownTarget\" [disabled]=\"!widgetConfig.drilldownEnabled\">\r\n              </div>\r\n            </div>\r\n            <p class=\"text-xs text-muted-foreground mt-2\">Tip: Users can click a month to open the linked incident log with filters applied.</p>\r\n          </p-card>\r\n        </p-tabPanel>\r\n\r\n        <p-tabPanel header=\"6. Security & Schedule\">\r\n          <p-card>\r\n            <ng-template pTemplate=\"header\">\r\n              <div class=\"pb-2\">\r\n                <h3 class=\"text-lg font-semibold\">Security & Schedule</h3>\r\n                <p class=\"text-xs text-muted-foreground\">Who can view this widget and how often it refreshes.</p>\r\n              </div>\r\n            </ng-template>\r\n            <div class=\"grid gap-4 md:grid-cols-3\">\r\n              <div>\r\n                <label for=\"roles\" class=\"block font-medium mb-2\">Roles</label>\r\n                <input id=\"roles\" type=\"text\" pInputText class=\"w-full\" [ngModel]=\"rolesInput\" (ngModelChange)=\"onRolesChange($event)\">\r\n              </div>\r\n              <div>\r\n                <label for=\"refresh\" class=\"block font-medium mb-2\">Refresh Frequency</label>\r\n                <p-dropdown id=\"refresh\" [options]=\"refreshOptions\" [(ngModel)]=\"widgetConfig.refresh\" appendTo=\"body\" [autoDisplayFirst]=\"false\" [filter]=\"true\" styleClass=\"w-full\" [panelStyle]=\"{ 'max-height': '200px', 'overflow': 'auto', width:'100%' }\"></p-dropdown>\r\n              </div>\r\n              <div class=\"flex items-end\">\r\n                <p-button label=\"Save Widget\" icon=\"pi pi-save\" styleClass=\"w-full\" (onClick)=\"saveWidget()\"></p-button>\r\n              </div>\r\n            </div>\r\n          </p-card>\r\n        </p-tabPanel>\r\n      </p-tabView>\r\n    </div>\r\n\r\n    <!-- Right: Live Preview -->\r\n    <div class=\"w-full md:w-1/2 sticky top-20 self-start RightPreview\" *ngIf=\"showPreview\">\r\n      <p-card>\r\n        <ng-template pTemplate=\"header\">\r\n          <div>\r\n            <h3 class=\"p-4 text-lg font-semibold\">Live Preview\r\n              <span class=\"text-xs text-surface-500\" *ngIf=\"widgetConfig.dataset?.includes('Sample')\">\r\n                (sample dataset)\r\n              </span>\r\n            </h3>\r\n          </div>\r\n        </ng-template>\r\n        <div>\r\n          <p-chart [type]=\"chartType\" [data]=\"chartData\" [options]=\"chartOptions\"></p-chart>\r\n        </div>\r\n      </p-card>\r\n    </div>\r\n  </div>\r\n</div>\r\n", styles: [":host ::ng-deep .p-card{border:none!important;border-radius:.75rem;box-shadow:none!important}.LeftConfig{display:flex;flex-direction:column;height:100%;overflow:hidden;margin-right:1rem}.RightPreview{display:flex;flex-direction:column;height:100%;overflow:hidden;margin-left:1rem}@media (max-width: 768px){.LeftConfig{margin-right:0;margin-bottom:1rem}.RightPreview{margin-left:0}}.LeftConfig,.RightPreview{border:1px solid var(--surface-border);border-radius:.75rem;box-shadow:0 2px 6px #00000014;background:var(--surface-bg)}\n"] }]
        }], ctorParameters: () => [] });

const PREBUILT_TEMPLATES = [
    {
        id: 'orm-exec',
        name: 'Operational Risk – Executive',
        description: 'High-level operational risk dashboard for executive oversight',
        tags: ['Incidents', 'Heatmap', 'Appetite', 'Executive'],
        layout: ['IncidentTrend', 'RiskHeatmap', 'KRIBreaches', 'AppetiteUtilization'],
        category: 'executive',
        thumbnail: '/images/templates/orm-exec.png'
    },
    {
        id: 'rcsa-oversight',
        name: 'RCSA Oversight',
        description: 'Risk and Control Self-Assessment oversight dashboard',
        tags: ['Controls', 'Issues', 'RCSA'],
        layout: ['ControlEffectiveness', 'AuditAging', 'KRIBreaches', 'LossEvents'],
        category: 'operational',
        thumbnail: '/images/templates/rcsa-oversight.png'
    },
    {
        id: 'compliance-posture',
        name: 'Compliance Posture',
        description: 'Regulatory compliance monitoring and audit status',
        tags: ['Regulatory', 'Issues', 'Compliance'],
        layout: ['AuditAging', 'KRIBreaches', 'AppetiteUtilization', 'IncidentTrend'],
        category: 'compliance',
        thumbnail: '/images/templates/compliance-posture.png'
    },
    {
        id: 'cyber-kri',
        name: 'Cyber KRI & Incidents',
        description: 'Cybersecurity risk indicators and incident monitoring',
        tags: ['Cyber', 'KRI', 'Security'],
        layout: ['IncidentTrend', 'KRIBreaches', 'RiskHeatmap', 'ControlEffectiveness'],
        category: 'cyber',
        thumbnail: '/images/templates/cyber-kri.png'
    },
    {
        id: 'risk-appetite',
        name: 'Risk Appetite Monitoring',
        description: 'Comprehensive risk appetite utilization and breach monitoring',
        tags: ['Appetite', 'KRI', 'Monitoring'],
        layout: ['AppetiteUtilization', 'KRIBreaches', 'IncidentTrend', 'LossEvents'],
        category: 'executive',
        thumbnail: '/images/templates/risk-appetite.png'
    },
    {
        id: 'audit-management',
        name: 'Audit Management',
        description: 'Audit findings tracking and aging analysis',
        tags: ['Audit', 'Findings', 'Aging'],
        layout: ['AuditAging', 'ControlEffectiveness', 'IncidentTrend', 'AppetiteUtilization'],
        category: 'compliance',
        thumbnail: '/images/templates/audit-management.png'
    },
    {
        id: 'operational-losses',
        name: 'Operational Loss Analysis',
        description: 'Operational loss events analysis and trending',
        tags: ['Loss', 'Events', 'Basel'],
        layout: ['LossEvents', 'IncidentTrend', 'KRIBreaches', 'RiskHeatmap'],
        category: 'operational',
        thumbnail: '/images/templates/operational-losses.png'
    },
    {
        id: 'control-monitoring',
        name: 'Control Monitoring',
        description: 'Control effectiveness monitoring and improvement tracking',
        tags: ['Controls', 'Effectiveness', 'Monitoring'],
        layout: ['ControlEffectiveness', 'AuditAging', 'AppetiteUtilization', 'IncidentTrend'],
        category: 'operational',
        thumbnail: '/images/templates/control-monitoring.png'
    }
];
const WIDGET_LIBRARY = [
    {
        key: 'IncidentTrend',
        label: 'Incident Trend',
        description: 'Shows incident trends over time with severity indicators',
        category: 'charts',
        icon: 'pi pi-chart-line',
        defaultConfig: {
            type: 'area',
            dataset: 'incident-trend',
            xField: 'month',
            series: [
                { id: 's1', label: 'Incidents', field: 'incidents', type: 'area', yAxis: 'left', fillOpacity: 0.3 }
            ],
            showLegend: true,
            showGrid: true,
            showTooltip: true
        }
    },
    {
        key: 'RiskHeatmap',
        label: 'Risk Heatmap',
        description: '5x5 risk heatmap showing likelihood vs impact matrix',
        category: 'charts',
        icon: 'pi pi-th-large',
        defaultConfig: {
            type: 'heatmap',
            dataset: 'risk-heatmap',
            xField: 'likelihood',
            series: [
                { id: 's1', label: 'Risk Score', field: 'riskScore', type: 'bar', yAxis: 'left' }
            ],
            showLegend: false,
            showGrid: true,
            showTooltip: true
        }
    },
    {
        key: 'KRIBreaches',
        label: 'KRI Breaches',
        description: 'Key Risk Indicator breaches by risk type',
        category: 'charts',
        icon: 'pi pi-exclamation-triangle',
        defaultConfig: {
            type: 'bar',
            dataset: 'kri-breaches',
            xField: 'name',
            series: [
                { id: 's1', label: 'Breaches', field: 'breaches', type: 'bar', yAxis: 'left' }
            ],
            showLegend: true,
            showGrid: true,
            showTooltip: true
        }
    },
    {
        key: 'ControlEffectiveness',
        label: 'Control Effectiveness',
        description: 'Control effectiveness scores in radar chart format',
        category: 'charts',
        icon: 'pi pi-shield',
        defaultConfig: {
            type: 'radar',
            dataset: 'control-effectiveness',
            xField: 'control',
            series: [
                { id: 's1', label: 'Score', field: 'score', type: 'line', yAxis: 'left' }
            ],
            showLegend: true,
            showGrid: true,
            showTooltip: true
        }
    },
    {
        key: 'LossEvents',
        label: 'Loss Events by Category',
        description: 'Operational loss events by Basel category',
        category: 'charts',
        icon: 'pi pi-money-bill',
        defaultConfig: {
            type: 'bar',
            dataset: 'loss-events',
            xField: 'type',
            series: [
                { id: 's1', label: 'Amount (M)', field: 'amount', type: 'bar', yAxis: 'left' }
            ],
            showLegend: true,
            showGrid: true,
            showTooltip: true
        }
    },
    {
        key: 'AuditAging',
        label: 'Audit Findings – Aging',
        description: 'Audit findings aging analysis in pie chart format',
        category: 'charts',
        icon: 'pi pi-clock',
        defaultConfig: {
            type: 'pie',
            dataset: 'audit-aging',
            xField: 'aging',
            series: [
                { id: 's1', label: 'Findings', field: 'findings', type: 'bar', yAxis: 'left' }
            ],
            showLegend: true,
            showGrid: false,
            showTooltip: true
        }
    },
    {
        key: 'AppetiteUtilization',
        label: 'Risk Appetite Utilization',
        description: 'Risk appetite utilization across key KPIs',
        category: 'metrics',
        icon: 'pi pi-chart-pie',
        defaultConfig: {
            type: 'progress',
            dataset: 'appetite-utilization',
            xField: 'kpi',
            series: [
                { id: 's1', label: 'Utilization', field: 'value', type: 'bar', yAxis: 'left' }
            ],
            showLegend: false,
            showGrid: false,
            showTooltip: true
        }
    },
    {
        key: 'MetricCard',
        label: 'Metric Card',
        description: 'Single metric display with trend indicator',
        category: 'metrics',
        icon: 'pi pi-calculator',
        defaultConfig: {
            type: 'line',
            dataset: 'incident-trend',
            xField: 'month',
            series: [
                { id: 's1', label: 'Value', field: 'incidents', type: 'line', yAxis: 'left' }
            ],
            showLegend: false,
            showGrid: false,
            showTooltip: true
        }
    },
    {
        key: 'DataTable',
        label: 'Data Table',
        description: 'Tabular data display with sorting and filtering',
        category: 'tables',
        icon: 'pi pi-table',
        defaultConfig: {
            type: 'line',
            dataset: 'incident-trend',
            xField: 'month',
            series: [
                { id: 's1', label: 'Data', field: 'incidents', type: 'line', yAxis: 'left' }
            ],
            showLegend: false,
            showGrid: false,
            showTooltip: false
        }
    }
];
const TEMPLATE_CATEGORIES = [
    { key: 'executive', label: 'Executive', icon: 'pi pi-users' },
    { key: 'operational', label: 'Operational', icon: 'pi pi-cog' },
    { key: 'compliance', label: 'Compliance', icon: 'pi pi-shield' },
    { key: 'cyber', label: 'Cybersecurity', icon: 'pi pi-lock' }
];
const WIDGET_CATEGORIES = [
    { key: 'charts', label: 'Charts', icon: 'pi pi-chart-bar' },
    { key: 'metrics', label: 'Metrics', icon: 'pi pi-calculator' },
    { key: 'tables', label: 'Tables', icon: 'pi pi-table' },
    { key: 'maps', label: 'Maps', icon: 'pi pi-map' }
];

// Incident Trend Data - 12 months
const INCIDENT_TREND_DATA = [
    { month: 'Jan', incidents: 42, severity: 3.2, resolved: 38, pending: 4 },
    { month: 'Feb', incidents: 35, severity: 2.8, resolved: 32, pending: 3 },
    { month: 'Mar', incidents: 58, severity: 3.5, resolved: 52, pending: 6 },
    { month: 'Apr', incidents: 49, severity: 3.1, resolved: 44, pending: 5 },
    { month: 'May', incidents: 61, severity: 3.8, resolved: 55, pending: 6 },
    { month: 'Jun', incidents: 39, severity: 2.9, resolved: 35, pending: 4 },
    { month: 'Jul', incidents: 45, severity: 3.3, resolved: 40, pending: 5 },
    { month: 'Aug', incidents: 53, severity: 3.6, resolved: 47, pending: 6 },
    { month: 'Sep', incidents: 38, severity: 2.7, resolved: 34, pending: 4 },
    { month: 'Oct', incidents: 41, severity: 3.0, resolved: 37, pending: 4 },
    { month: 'Nov', incidents: 36, severity: 2.8, resolved: 32, pending: 4 },
    { month: 'Dec', incidents: 47, severity: 3.4, resolved: 42, pending: 5 }
];
// KRI Breaches by Risk Type
const KRI_BREACH_DATA = [
    { name: 'Credit', breaches: 6, threshold: 5, trend: 'up' },
    { name: 'Liquidity', breaches: 3, threshold: 4, trend: 'down' },
    { name: 'Market', breaches: 4, threshold: 6, trend: 'stable' },
    { name: 'Operational', breaches: 9, threshold: 7, trend: 'up' },
    { name: 'Cyber', breaches: 7, threshold: 5, trend: 'up' },
    { name: 'Compliance', breaches: 2, threshold: 3, trend: 'down' },
    { name: 'Reputation', breaches: 1, threshold: 2, trend: 'stable' }
];
// Control Effectiveness Scores
const CONTROL_EFFECTIVENESS_DATA = [
    { control: 'Segregation of Duties', score: 82, target: 85, lastReview: new Date('2024-01-15') },
    { control: 'Trade Limits', score: 74, target: 80, lastReview: new Date('2024-01-10') },
    { control: 'Dual Authorization', score: 91, target: 90, lastReview: new Date('2024-01-20') },
    { control: 'Access Reviews', score: 68, target: 75, lastReview: new Date('2024-01-05') },
    { control: 'Vulnerability Patching', score: 77, target: 85, lastReview: new Date('2024-01-12') },
    { control: 'Data Encryption', score: 89, target: 90, lastReview: new Date('2024-01-18') },
    { control: 'Backup Procedures', score: 95, target: 95, lastReview: new Date('2024-01-22') },
    { control: 'Incident Response', score: 71, target: 80, lastReview: new Date('2024-01-08') }
];
// Loss Events by Basel Category (in millions)
const LOSS_EVENT_DATA = [
    { type: 'External Fraud', amount: 12.4, frequency: 8, trend: 'up' },
    { type: 'Clients, Products & Practices', amount: 7.9, frequency: 12, trend: 'stable' },
    { type: 'Execution & Delivery', amount: 15.6, frequency: 15, trend: 'up' },
    { type: 'Business Disruption & System Failures', amount: 5.2, frequency: 6, trend: 'down' },
    { type: 'Damage to Physical Assets', amount: 2.1, frequency: 3, trend: 'stable' },
    { type: 'Internal Fraud', amount: 8.7, frequency: 4, trend: 'up' },
    { type: 'Employment Practices', amount: 3.4, frequency: 7, trend: 'down' }
];
// Audit Findings Aging
const AUDIT_AGING_DATA = [
    { aging: '<30d', findings: 14, critical: 2, high: 4, medium: 6, low: 2 },
    { aging: '30–60d', findings: 11, critical: 1, high: 3, medium: 5, low: 2 },
    { aging: '60–90d', findings: 7, critical: 0, high: 2, medium: 3, low: 2 },
    { aging: '>90d', findings: 4, critical: 1, high: 1, medium: 1, low: 1 }
];
// Risk Appetite Utilization
const APPETITE_UTILIZATION_DATA = [
    { kpi: 'Incident Severity Index', value: 0.62, threshold: 0.7, status: 'green' },
    { kpi: 'Loss vs. Appetite', value: 0.51, threshold: 0.6, status: 'green' },
    { kpi: 'Open Audit Issues', value: 0.73, threshold: 0.8, status: 'amber' },
    { kpi: 'Control Weakness Density', value: 0.47, threshold: 0.5, status: 'green' },
    { kpi: 'KRI Breach Rate', value: 0.68, threshold: 0.75, status: 'green' },
    { kpi: 'Risk Coverage Ratio', value: 0.82, threshold: 0.9, status: 'amber' }
];
// Risk Heatmap Data (5x5 grid)
const RISK_HEATMAP_DATA = [
    { likelihood: 1, impact: 1, riskScore: 0.1, category: 'Low', description: 'Minor operational issues' },
    { likelihood: 2, impact: 1, riskScore: 0.2, category: 'Low', description: 'Routine maintenance' },
    { likelihood: 3, impact: 1, riskScore: 0.3, category: 'Low', description: 'Standard procedures' },
    { likelihood: 4, impact: 1, riskScore: 0.4, category: 'Low', description: 'Regular monitoring' },
    { likelihood: 5, impact: 1, riskScore: 0.5, category: 'Medium', description: 'Frequent minor issues' },
    { likelihood: 1, impact: 2, riskScore: 0.2, category: 'Low', description: 'Minor system glitches' },
    { likelihood: 2, impact: 2, riskScore: 0.4, category: 'Low', description: 'Small process delays' },
    { likelihood: 3, impact: 2, riskScore: 0.6, category: 'Medium', description: 'Moderate disruptions' },
    { likelihood: 4, impact: 2, riskScore: 0.8, category: 'Medium', description: 'Regular service issues' },
    { likelihood: 5, impact: 2, riskScore: 1.0, category: 'High', description: 'Frequent service problems' },
    { likelihood: 1, impact: 3, riskScore: 0.3, category: 'Low', description: 'Occasional delays' },
    { likelihood: 2, impact: 3, riskScore: 0.6, category: 'Medium', description: 'Periodic disruptions' },
    { likelihood: 3, impact: 3, riskScore: 0.9, category: 'Medium', description: 'Regular operational issues' },
    { likelihood: 4, impact: 3, riskScore: 1.2, category: 'High', description: 'Frequent operational problems' },
    { likelihood: 5, impact: 3, riskScore: 1.5, category: 'High', description: 'Constant operational issues' },
    { likelihood: 1, impact: 4, riskScore: 0.4, category: 'Medium', description: 'Rare major incidents' },
    { likelihood: 2, impact: 4, riskScore: 0.8, category: 'Medium', description: 'Occasional major issues' },
    { likelihood: 3, impact: 4, riskScore: 1.2, category: 'High', description: 'Regular major problems' },
    { likelihood: 4, impact: 4, riskScore: 1.6, category: 'High', description: 'Frequent major issues' },
    { likelihood: 5, impact: 4, riskScore: 2.0, category: 'Critical', description: 'Constant major problems' },
    { likelihood: 1, impact: 5, riskScore: 0.5, category: 'Medium', description: 'Rare catastrophic events' },
    { likelihood: 2, impact: 5, riskScore: 1.0, category: 'High', description: 'Occasional catastrophic events' },
    { likelihood: 3, impact: 5, riskScore: 1.5, category: 'High', description: 'Regular catastrophic events' },
    { likelihood: 4, impact: 5, riskScore: 2.0, category: 'Critical', description: 'Frequent catastrophic events' },
    { likelihood: 5, impact: 5, riskScore: 2.5, category: 'Critical', description: 'Constant catastrophic events' }
];
// Dataset Configurations
const DATASET_CONFIGS = [
    {
        id: 'incident-trend',
        name: 'Incident Trend Data',
        description: 'Monthly incident data with severity and resolution metrics',
        type: 'incident',
        fields: ['month', 'incidents', 'severity', 'resolved', 'pending'],
        refreshRate: 'monthly',
        lastUpdated: new Date()
    },
    {
        id: 'kri-breaches',
        name: 'KRI Breach Data',
        description: 'Key Risk Indicator breach data by risk type',
        type: 'kri',
        fields: ['name', 'breaches', 'threshold', 'trend'],
        refreshRate: 'daily',
        lastUpdated: new Date()
    },
    {
        id: 'control-effectiveness',
        name: 'Control Effectiveness',
        description: 'Control effectiveness scores and targets',
        type: 'control',
        fields: ['control', 'score', 'target', 'lastReview'],
        refreshRate: 'monthly',
        lastUpdated: new Date()
    },
    {
        id: 'loss-events',
        name: 'Loss Events by Category',
        description: 'Operational loss events by Basel category',
        type: 'loss',
        fields: ['type', 'amount', 'frequency', 'trend'],
        refreshRate: 'monthly',
        lastUpdated: new Date()
    },
    {
        id: 'audit-aging',
        name: 'Audit Findings Aging',
        description: 'Audit findings by aging category and severity',
        type: 'audit',
        fields: ['aging', 'findings', 'critical', 'high', 'medium', 'low'],
        refreshRate: 'monthly',
        lastUpdated: new Date()
    },
    {
        id: 'appetite-utilization',
        name: 'Risk Appetite Utilization',
        description: 'Risk appetite utilization across key KPIs',
        type: 'appetite',
        fields: ['kpi', 'value', 'threshold', 'status'],
        refreshRate: 'daily',
        lastUpdated: new Date()
    },
    {
        id: 'risk-heatmap',
        name: 'Risk Heatmap Data',
        description: 'Risk assessment data for heatmap visualization',
        type: 'heatmap',
        fields: ['likelihood', 'impact', 'riskScore', 'category', 'description'],
        refreshRate: 'monthly',
        lastUpdated: new Date()
    }
];
// Color palettes for charts
const CHART_COLORS = {
    primary: ['#6366f1', '#22c55e', '#f97316', '#06b6d4', '#ef4444', '#a855f7'],
    risk: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'],
    status: {
        green: '#22c55e',
        amber: '#f97316',
        red: '#ef4444',
        blue: '#3b82f6',
        purple: '#8b5cf6'
    },
    heatmap: {
        low: '#22c55e',
        medium: '#eab308',
        high: '#f97316',
        critical: '#ef4444'
    }
};

class DashboardService {
    stateSubject = new BehaviorSubject({
        mode: 'prebuilt',
        activeLayout: [],
        selectedWidget: undefined,
        isEditing: false,
        leftPanelOpen: true,
        showAddWidget: false,
        searchQuery: ''
    });
    widgetsSubject = new BehaviorSubject([]);
    filtersSubject = new BehaviorSubject({
        dateRange: 'MTD',
        businessUnit: 'All',
        riskCategory: 'All',
        severity: 1,
        autoRefresh: true,
        refreshInterval: 60
    });
    // Observables
    state$ = this.stateSubject.asObservable();
    widgets$ = this.widgetsSubject.asObservable();
    filters$ = this.filtersSubject.asObservable();
    // Computed observables
    mode$ = this.state$.pipe(map(state => state.mode), distinctUntilChanged());
    activeLayout$ = this.state$.pipe(map(state => state.activeLayout), distinctUntilChanged());
    selectedWidget$ = this.state$.pipe(map(state => state.selectedWidget), distinctUntilChanged());
    isEditing$ = this.state$.pipe(map(state => state.isEditing), distinctUntilChanged());
    leftPanelOpen$ = this.state$.pipe(map(state => state.leftPanelOpen), distinctUntilChanged());
    showAddWidget$ = this.state$.pipe(map(state => state.showAddWidget), distinctUntilChanged());
    searchQuery$ = this.state$.pipe(map(state => state.searchQuery), distinctUntilChanged());
    filteredTemplates$ = combineLatest([
        this.state$,
        this.searchQuery$
    ]).pipe(map(([state, searchQuery]) => {
        if (!searchQuery)
            return PREBUILT_TEMPLATES;
        const query = searchQuery.toLowerCase();
        return PREBUILT_TEMPLATES.filter(template => template.name.toLowerCase().includes(query) ||
            template.description.toLowerCase().includes(query) ||
            template.tags.some(tag => tag.toLowerCase().includes(query)));
    }));
    filteredWidgets$ = combineLatest([
        this.state$,
        this.searchQuery$
    ]).pipe(map(([state, searchQuery]) => {
        if (!searchQuery)
            return WIDGET_LIBRARY;
        const query = searchQuery.toLowerCase();
        return WIDGET_LIBRARY.filter(widget => widget.label.toLowerCase().includes(query) ||
            widget.description.toLowerCase().includes(query) ||
            widget.category.toLowerCase().includes(query));
    }));
    constructor() {
        this.initializeDefaultLayout();
    }
    // State management methods
    setMode(mode) {
        this.updateState({ mode });
    }
    setActiveLayout(layout) {
        this.updateState({ activeLayout: layout });
    }
    setSelectedWidget(widget) {
        this.updateState({ selectedWidget: widget });
    }
    setIsEditing(editing) {
        this.updateState({ isEditing: editing });
    }
    setLeftPanelOpen(open) {
        this.updateState({ leftPanelOpen: open });
    }
    setShowAddWidget(show) {
        this.updateState({ showAddWidget: show });
    }
    setSearchQuery(query) {
        this.updateState({ searchQuery: query });
    }
    // Widget management methods
    addWidget(widgetKey) {
        const widgetTemplate = WIDGET_LIBRARY.find(w => w.key === widgetKey);
        if (!widgetTemplate)
            return;
        const newWidget = {
            id: this.generateWidgetId(),
            name: widgetTemplate.label,
            description: widgetTemplate.description,
            type: widgetTemplate.defaultConfig.type || 'line',
            dataset: widgetTemplate.defaultConfig.dataset || 'incident-trend',
            xField: widgetTemplate.defaultConfig.xField || 'month',
            series: widgetTemplate.defaultConfig.series || [],
            appetiteBands: [],
            stacked: false,
            showLegend: widgetTemplate.defaultConfig.showLegend || true,
            showGrid: widgetTemplate.defaultConfig.showGrid || true,
            showTooltip: widgetTemplate.defaultConfig.showTooltip || true,
            drilldownEnabled: false,
            refresh: 'monthly',
            roles: ['Risk Manager'],
            position: this.calculateNextPosition(),
            ...widgetTemplate.defaultConfig
        };
        const currentWidgets = this.widgetsSubject.value;
        this.widgetsSubject.next([...currentWidgets, newWidget]);
        this.updateActiveLayout();
    }
    removeWidget(widgetId) {
        const currentWidgets = this.widgetsSubject.value;
        const updatedWidgets = currentWidgets.filter(w => w.id !== widgetId);
        this.widgetsSubject.next(updatedWidgets);
        this.updateActiveLayout();
    }
    updateWidget(widgetId, updates) {
        const currentWidgets = this.widgetsSubject.value;
        const updatedWidgets = currentWidgets.map(w => w.id === widgetId ? { ...w, ...updates } : w);
        this.widgetsSubject.next(updatedWidgets);
    }
    duplicateWidget(widgetId) {
        const currentWidgets = this.widgetsSubject.value;
        const widgetToDuplicate = currentWidgets.find(w => w.id === widgetId);
        if (!widgetToDuplicate)
            return;
        const duplicatedWidget = {
            ...widgetToDuplicate,
            id: this.generateWidgetId(),
            name: `${widgetToDuplicate.name} (Copy)`,
            position: this.calculateNextPosition()
        };
        this.widgetsSubject.next([...currentWidgets, duplicatedWidget]);
        this.updateActiveLayout();
    }
    reorderWidgets(fromIndex, toIndex) {
        const currentWidgets = this.widgetsSubject.value;
        const reorderedWidgets = [...currentWidgets];
        const [movedWidget] = reorderedWidgets.splice(fromIndex, 1);
        reorderedWidgets.splice(toIndex, 0, movedWidget);
        this.widgetsSubject.next(reorderedWidgets);
        this.updateActiveLayout();
    }
    // Template management methods
    applyTemplate(templateId) {
        const template = PREBUILT_TEMPLATES.find(t => t.id === templateId);
        if (!template)
            return;
        this.setActiveLayout(template.layout);
        this.setMode('builder');
        this.loadTemplateWidgets(template.layout);
    }
    saveAsTemplate(name, description, tags) {
        const currentWidgets = this.widgetsSubject.value;
        const currentFilters = this.filtersSubject.value;
        const template = {
            id: this.generateId(),
            name,
            description,
            layout: {
                columns: 12,
                rows: 8,
                breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480 },
                margin: [16, 16],
                containerPadding: [16, 16]
            },
            widgets: currentWidgets,
            filters: currentFilters,
            theme: 'light',
            autoRefresh: true,
            refreshInterval: 60,
            permissions: {
                canEdit: ['Risk Manager'],
                canView: ['Risk Manager', 'Executive'],
                canShare: ['Risk Manager']
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'Current User',
            version: 1
        };
        // In a real app, this would save to a backend service
        console.log('Saving template:', template);
    }
    // Filter management methods
    updateFilters(filters) {
        const currentFilters = this.filtersSubject.value;
        this.filtersSubject.next({ ...currentFilters, ...filters });
    }
    resetFilters() {
        this.filtersSubject.next({
            dateRange: 'MTD',
            businessUnit: 'All',
            riskCategory: 'All',
            severity: 1,
            autoRefresh: true,
            refreshInterval: 60
        });
    }
    // Data methods
    getDataForDataset(datasetId) {
        switch (datasetId) {
            case 'incident-trend':
                return INCIDENT_TREND_DATA;
            case 'kri-breaches':
                return KRI_BREACH_DATA;
            case 'control-effectiveness':
                return CONTROL_EFFECTIVENESS_DATA;
            case 'loss-events':
                return LOSS_EVENT_DATA;
            case 'audit-aging':
                return AUDIT_AGING_DATA;
            case 'appetite-utilization':
                return APPETITE_UTILIZATION_DATA;
            case 'risk-heatmap':
                return RISK_HEATMAP_DATA;
            default:
                return [];
        }
    }
    // Private helper methods
    updateState(updates) {
        const currentState = this.stateSubject.value;
        this.stateSubject.next({ ...currentState, ...updates });
    }
    initializeDefaultLayout() {
        const defaultLayout = ['IncidentTrend', 'RiskHeatmap', 'KRIBreaches', 'ControlEffectiveness', 'LossEvents', 'AuditAging', 'AppetiteUtilization'];
        this.setActiveLayout(defaultLayout);
        this.loadTemplateWidgets(defaultLayout);
    }
    loadTemplateWidgets(layout) {
        const widgets = layout.map((widgetKey, index) => {
            const template = WIDGET_LIBRARY.find(w => w.key === widgetKey);
            if (!template)
                return null;
            return {
                id: this.generateWidgetId(),
                name: template.label,
                description: template.description,
                type: template.defaultConfig.type || 'line',
                dataset: template.defaultConfig.dataset || 'incident-trend',
                xField: template.defaultConfig.xField || 'month',
                series: template.defaultConfig.series || [],
                appetiteBands: [],
                stacked: false,
                showLegend: template.defaultConfig.showLegend || true,
                showGrid: template.defaultConfig.showGrid || true,
                showTooltip: template.defaultConfig.showTooltip || true,
                drilldownEnabled: false,
                refresh: 'monthly',
                roles: ['Risk Manager'],
                position: this.calculatePosition(index),
                ...template.defaultConfig
            };
        }).filter(Boolean);
        this.widgetsSubject.next(widgets);
    }
    updateActiveLayout() {
        const currentWidgets = this.widgetsSubject.value;
        const layout = currentWidgets.map(w => w.name.replace(/\s+/g, ''));
        this.setActiveLayout(layout);
    }
    calculatePosition(index) {
        const cols = 12;
        const rows = 8;
        const widgetHeight = 2;
        const widgetWidth = 3;
        const x = (index % (cols / widgetWidth)) * widgetWidth;
        const y = Math.floor(index / (cols / widgetWidth)) * widgetHeight;
        return { x, y, w: widgetWidth, h: widgetHeight };
    }
    calculateNextPosition() {
        const currentWidgets = this.widgetsSubject.value;
        const maxY = Math.max(...currentWidgets.map(w => w.position.y + w.position.h), 0);
        return { x: 0, y: maxY, w: 3, h: 2 };
    }
    generateWidgetId() {
        return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateId() {
        return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: DashboardService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: DashboardService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: DashboardService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });

class WidgetService {
    dashboardService;
    selectedWidgetSubject = new BehaviorSubject(null);
    isConfiguringSubject = new BehaviorSubject(false);
    selectedWidget$ = this.selectedWidgetSubject.asObservable();
    isConfiguring$ = this.isConfiguringSubject.asObservable();
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    // Widget selection and configuration
    selectWidget(widget) {
        this.selectedWidgetSubject.next(widget);
    }
    startConfiguration(widget) {
        this.selectWidget(widget);
        this.isConfiguringSubject.next(true);
    }
    stopConfiguration() {
        this.isConfiguringSubject.next(false);
        this.selectWidget(null);
    }
    // Widget configuration methods
    updateWidgetName(widgetId, name) {
        this.dashboardService.updateWidget(widgetId, { name });
    }
    updateWidgetDescription(widgetId, description) {
        this.dashboardService.updateWidget(widgetId, { description });
    }
    updateWidgetType(widgetId, type) {
        this.dashboardService.updateWidget(widgetId, { type });
    }
    updateWidgetDataset(widgetId, dataset) {
        this.dashboardService.updateWidget(widgetId, { dataset });
    }
    updateWidgetXField(widgetId, xField) {
        this.dashboardService.updateWidget(widgetId, { xField });
    }
    // Series management
    addSeries(widgetId, series) {
        const widget = this.getWidgetById(widgetId);
        if (!widget)
            return;
        const newSeries = {
            id: this.generateSeriesId(),
            ...series
        };
        const updatedSeries = [...widget.series, newSeries];
        this.dashboardService.updateWidget(widgetId, { series: updatedSeries });
    }
    updateSeries(widgetId, seriesId, updates) {
        const widget = this.getWidgetById(widgetId);
        if (!widget)
            return;
        const updatedSeries = widget.series.map(s => s.id === seriesId ? { ...s, ...updates } : s);
        this.dashboardService.updateWidget(widgetId, { series: updatedSeries });
    }
    removeSeries(widgetId, seriesId) {
        const widget = this.getWidgetById(widgetId);
        if (!widget)
            return;
        const updatedSeries = widget.series.filter(s => s.id !== seriesId);
        this.dashboardService.updateWidget(widgetId, { series: updatedSeries });
    }
    // Appetite bands management
    addAppetiteBand(widgetId, band) {
        const widget = this.getWidgetById(widgetId);
        if (!widget)
            return;
        const newBand = {
            id: this.generateBandId(),
            ...band
        };
        const updatedBands = [...widget.appetiteBands, newBand];
        this.dashboardService.updateWidget(widgetId, { appetiteBands: updatedBands });
    }
    updateAppetiteBand(widgetId, bandId, updates) {
        const widget = this.getWidgetById(widgetId);
        if (!widget)
            return;
        const updatedBands = widget.appetiteBands.map(b => b.id === bandId ? { ...b, ...updates } : b);
        this.dashboardService.updateWidget(widgetId, { appetiteBands: updatedBands });
    }
    removeAppetiteBand(widgetId, bandId) {
        const widget = this.getWidgetById(widgetId);
        if (!widget)
            return;
        const updatedBands = widget.appetiteBands.filter(b => b.id !== bandId);
        this.dashboardService.updateWidget(widgetId, { appetiteBands: updatedBands });
    }
    // Display options
    updateDisplayOptions(widgetId, options) {
        this.dashboardService.updateWidget(widgetId, options);
    }
    // Drill-down configuration
    updateDrilldownConfig(widgetId, enabled, target) {
        this.dashboardService.updateWidget(widgetId, {
            drilldownEnabled: enabled,
            drilldownTarget: target
        });
    }
    // Security and refresh settings
    updateSecuritySettings(widgetId, roles) {
        this.dashboardService.updateWidget(widgetId, { roles });
    }
    updateRefreshSettings(widgetId, refresh) {
        this.dashboardService.updateWidget(widgetId, { refresh });
    }
    // Position and size
    updateWidgetPosition(widgetId, position) {
        this.dashboardService.updateWidget(widgetId, { position });
    }
    // Style settings
    updateWidgetStyle(widgetId, style) {
        this.dashboardService.updateWidget(widgetId, { style });
    }
    // Data processing methods
    processDataForWidget(widget) {
        const rawData = this.dashboardService.getDataForDataset(widget.dataset);
        // Apply filters if needed
        // This is where you would apply global filters, date ranges, etc.
        return rawData;
    }
    getAvailableFields(dataset) {
        const data = this.dashboardService.getDataForDataset(dataset);
        if (data.length === 0)
            return [];
        return Object.keys(data[0]);
    }
    getFieldType(field, dataset) {
        const data = this.dashboardService.getDataForDataset(dataset);
        if (data.length === 0)
            return 'string';
        const sampleValue = data[0][field];
        if (typeof sampleValue === 'number')
            return 'number';
        if (typeof sampleValue === 'boolean')
            return 'boolean';
        if (sampleValue instanceof Date)
            return 'date';
        return 'string';
    }
    // Validation methods
    validateWidgetConfig(widget) {
        const errors = [];
        if (!widget.name.trim()) {
            errors.push('Widget name is required');
        }
        if (!widget.dataset) {
            errors.push('Dataset is required');
        }
        if (!widget.xField) {
            errors.push('X-axis field is required');
        }
        if (widget.series.length === 0) {
            errors.push('At least one data series is required');
        }
        if (widget.type === 'pie' && widget.series.length > 1) {
            errors.push('Pie charts can only have one data series');
        }
        if (widget.type === 'radar' && widget.series.length > 1) {
            errors.push('Radar charts can only have one data series');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    // Helper methods
    getWidgetById(widgetId) {
        // This would typically come from the dashboard service
        // For now, we'll return null and let the service handle it
        return null;
    }
    generateSeriesId() {
        return `series_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateBandId() {
        return `band_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    // Chart type specific methods
    getSupportedChartTypes() {
        return [
            { value: 'line', label: 'Line Chart', description: 'Shows trends over time' },
            { value: 'area', label: 'Area Chart', description: 'Shows trends with filled areas' },
            { value: 'bar', label: 'Bar Chart', description: 'Compares values across categories' },
            { value: 'pie', label: 'Pie Chart', description: 'Shows parts of a whole' },
            { value: 'radar', label: 'Radar Chart', description: 'Shows multiple metrics in a circular format' },
            { value: 'heatmap', label: 'Heatmap', description: 'Shows data density in a grid' },
            { value: 'progress', label: 'Progress Bars', description: 'Shows progress towards goals' }
        ];
    }
    getSupportedYAxisOptions() {
        return [
            { value: 'left', label: 'Left Axis' },
            { value: 'right', label: 'Right Axis' }
        ];
    }
    getSupportedSeriesTypes() {
        return [
            { value: 'line', label: 'Line', description: 'Connected data points' },
            { value: 'area', label: 'Area', description: 'Filled area under the line' },
            { value: 'bar', label: 'Bar', description: 'Vertical bars' }
        ];
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: WidgetService, deps: [{ token: DashboardService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: WidgetService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: WidgetService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: DashboardService }] });

class DataService {
    dataCache = new Map();
    lastRefresh = new Map();
    constructor() {
        this.initializeCache();
    }
    // Get data for a specific dataset
    getData(datasetId, filters) {
        const cacheKey = this.getCacheKey(datasetId, filters);
        if (this.dataCache.has(cacheKey)) {
            return of(this.dataCache.get(cacheKey)).pipe(delay(100));
        }
        return this.fetchData(datasetId, filters).pipe(map(data => {
            this.dataCache.set(cacheKey, data);
            this.lastRefresh.set(datasetId, new Date());
            return data;
        }));
    }
    // Get dataset configuration
    getDatasetConfig(datasetId) {
        return DATASET_CONFIGS.find(config => config.id === datasetId);
    }
    // Get all available datasets
    getAvailableDatasets() {
        return of(DATASET_CONFIGS).pipe(delay(50));
    }
    // Get chart colors
    getChartColors() {
        return CHART_COLORS;
    }
    // Refresh data for a dataset
    refreshData(datasetId, filters) {
        const cacheKey = this.getCacheKey(datasetId, filters);
        this.dataCache.delete(cacheKey);
        return this.getData(datasetId, filters);
    }
    // Get data summary for a dataset
    getDataSummary(datasetId, filters) {
        return this.getData(datasetId, filters).pipe(map(data => ({
            totalRecords: data.length,
            lastUpdated: this.lastRefresh.get(datasetId) || new Date(),
            fields: data.length > 0 ? Object.keys(data[0]) : [],
            sampleData: data.slice(0, 5)
        })));
    }
    // Apply filters to data
    applyFilters(data, filters) {
        let filteredData = [...data];
        // Apply date range filter
        if (filters.dateRange !== 'custom' && filters.dateRange !== 'MTD') {
            filteredData = this.filterByDateRange(filteredData, filters.dateRange);
        }
        // Apply business unit filter
        if (filters.businessUnit !== 'All') {
            filteredData = this.filterByBusinessUnit(filteredData, filters.businessUnit);
        }
        // Apply risk category filter
        if (filters.riskCategory !== 'All') {
            filteredData = this.filterByRiskCategory(filteredData, filters.riskCategory);
        }
        // Apply severity filter
        if (filters.severity > 1) {
            filteredData = this.filterBySeverity(filteredData, filters.severity);
        }
        return filteredData;
    }
    // Export data
    exportData(datasetId, format, filters) {
        return this.getData(datasetId, filters).pipe(map(data => {
            switch (format) {
                case 'csv':
                    return this.convertToCSV(data);
                case 'json':
                    return this.convertToJSON(data);
                case 'excel':
                    return this.convertToExcel(data);
                default:
                    throw new Error('Unsupported export format');
            }
        }));
    }
    // Private methods
    initializeCache() {
        // Pre-load some commonly used datasets
        this.dataCache.set('incident-trend', INCIDENT_TREND_DATA);
        this.dataCache.set('kri-breaches', KRI_BREACH_DATA);
        this.dataCache.set('control-effectiveness', CONTROL_EFFECTIVENESS_DATA);
        this.dataCache.set('loss-events', LOSS_EVENT_DATA);
        this.dataCache.set('audit-aging', AUDIT_AGING_DATA);
        this.dataCache.set('appetite-utilization', APPETITE_UTILIZATION_DATA);
        this.dataCache.set('risk-heatmap', RISK_HEATMAP_DATA);
    }
    fetchData(datasetId, filters) {
        let data = [];
        switch (datasetId) {
            case 'incident-trend':
                data = INCIDENT_TREND_DATA;
                break;
            case 'kri-breaches':
                data = KRI_BREACH_DATA;
                break;
            case 'control-effectiveness':
                data = CONTROL_EFFECTIVENESS_DATA;
                break;
            case 'loss-events':
                data = LOSS_EVENT_DATA;
                break;
            case 'audit-aging':
                data = AUDIT_AGING_DATA;
                break;
            case 'appetite-utilization':
                data = APPETITE_UTILIZATION_DATA;
                break;
            case 'risk-heatmap':
                data = RISK_HEATMAP_DATA;
                break;
            default:
                data = [];
        }
        // Apply filters if provided
        if (filters) {
            data = this.applyFilters(data, filters);
        }
        return of(data).pipe(delay(200)); // Simulate API call
    }
    getCacheKey(datasetId, filters) {
        if (!filters)
            return datasetId;
        return `${datasetId}_${JSON.stringify(filters)}`;
    }
    filterByDateRange(data, dateRange) {
        const now = new Date();
        let startDate;
        switch (dateRange) {
            case 'QTD':
                startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                break;
            case 'YTD':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case '12M':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            default:
                return data;
        }
        return data.filter(item => {
            const itemDate = this.getDateFromItem(item);
            return itemDate >= startDate && itemDate <= now;
        });
    }
    filterByBusinessUnit(data, businessUnit) {
        // This would filter based on business unit field if it exists
        // For now, return all data
        return data;
    }
    filterByRiskCategory(data, riskCategory) {
        // This would filter based on risk category field if it exists
        // For now, return all data
        return data;
    }
    filterBySeverity(data, severity) {
        return data.filter(item => {
            const itemSeverity = this.getSeverityFromItem(item);
            return itemSeverity >= severity;
        });
    }
    getDateFromItem(item) {
        // Try to find a date field in the item
        for (const [key, value] of Object.entries(item)) {
            if (value instanceof Date) {
                return value;
            }
            if (key.toLowerCase().includes('date') && typeof value === 'string') {
                return new Date(value);
            }
        }
        return new Date();
    }
    getSeverityFromItem(item) {
        // Try to find a severity field in the item
        for (const [key, value] of Object.entries(item)) {
            if (key.toLowerCase().includes('severity') && typeof value === 'number') {
                return value;
            }
        }
        return 1; // Default severity
    }
    convertToCSV(data) {
        if (data.length === 0)
            return new Blob([''], { type: 'text/csv' });
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => this.escapeCSVValue(row[header])).join(','))
        ].join('\n');
        return new Blob([csvContent], { type: 'text/csv' });
    }
    convertToJSON(data) {
        const jsonContent = JSON.stringify(data, null, 2);
        return new Blob([jsonContent], { type: 'application/json' });
    }
    convertToExcel(data) {
        // This would require a library like xlsx
        // For now, return CSV as Excel
        return this.convertToCSV(data);
    }
    escapeCSVValue(value) {
        if (value === null || value === undefined)
            return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: DataService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: DataService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: DataService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });

class ChartWidgetComponent {
    widgetConfig;
    chartHeight = 300;
    layoutService = inject(LayoutService);
    dataService = inject(DataService);
    chartData = {};
    chartOptions = {};
    chartType = 'line';
    rawData = [];
    subscription;
    ngOnInit() {
        this.initializeChart();
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.updateTheme();
        });
    }
    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
    initializeChart() {
        if (!this.widgetConfig)
            return;
        this.chartType = this.getChartType();
        this.loadData();
        this.updateChartOptions();
    }
    updateTheme() {
        if (this.rawData && this.rawData.length > 0) {
            this.chartData = this.processDataForChart(this.rawData);
        }
        this.updateChartOptions();
    }
    loadData() {
        this.dataService.getData(this.widgetConfig.dataset).subscribe(data => {
            this.rawData = data;
            this.chartData = this.processDataForChart(data);
        });
    }
    processDataForChart(data) {
        if (!data || data.length === 0) {
            return { labels: [], datasets: [] };
        }
        const documentStyle = getComputedStyle(document.documentElement);
        // Max 4 unique theme colors, then repeat
        const themeColors = [
            documentStyle.getPropertyValue('--p-primary-500'),
            documentStyle.getPropertyValue('--p-primary-200'),
            documentStyle.getPropertyValue('--p-indigo-400'),
            documentStyle.getPropertyValue('--p-purple-400')
        ].map(c => c.trim());
        const labels = data.map(item => item[this.widgetConfig.xField]);
        // Handle pie/doughnut/polar differently (multiple slices per dataset)
        if (['pie', 'doughnut', 'polarArea'].includes(this.chartType)) {
            return {
                labels,
                datasets: [
                    {
                        data: this.widgetConfig.series.map(s => data.map(item => item[s.field])).flat(),
                        backgroundColor: themeColors.slice(0, labels.length),
                        hoverBackgroundColor: themeColors.slice(0, labels.length)
                    }
                ]
            };
        }
        // Line, bar, radar → multiple datasets, each gets distinct color
        const datasets = this.widgetConfig.series.map((series, index) => {
            const color = themeColors[index % themeColors.length];
            let backgroundColor = color;
            if (series.type === 'area') {
                backgroundColor = this.hexToRgba(color, 0.3);
            }
            return {
                label: series.label,
                data: data.map(item => item[series.field]),
                borderColor: color,
                backgroundColor,
                fill: series.type === 'area',
                tension: 0.4,
                yAxisID: series.yAxis
            };
        });
        return { labels, datasets };
    }
    updateChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: this.widgetConfig.showLegend,
                    position: 'top',
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    enabled: this.widgetConfig.showTooltip,
                    backgroundColor: documentStyle.getPropertyValue('--surface-800'),
                    titleColor: textColor,
                    bodyColor: textColorSecondary,
                    borderColor: surfaceBorder,
                    borderWidth: 1,
                    cornerRadius: 4,
                    displayColors: true
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: this.widgetConfig.showGrid,
                        color: surfaceBorder,
                        drawBorder: false
                    },
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: 500
                        }
                    }
                },
                y: {
                    display: true,
                    grid: {
                        display: this.widgetConfig.showGrid,
                        color: surfaceBorder,
                        drawBorder: false
                    },
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: 500
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        };
        if (this.widgetConfig.appetiteBands.length > 0) {
            this.addAppetiteBands();
        }
    }
    addAppetiteBands() {
        if (!this.chartOptions.scales)
            return;
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        this.widgetConfig.appetiteBands.forEach(band => {
            if (!this.chartOptions.scales.y.plugins) {
                this.chartOptions.scales.y.plugins = {};
            }
            if (!this.chartOptions.scales.y.plugins.annotation) {
                this.chartOptions.scales.y.plugins.annotation = {
                    annotations: {}
                };
            }
            const annotationId = `band_${band.id}`;
            this.chartOptions.scales.y.plugins.annotation.annotations[annotationId] = {
                type: 'line',
                yMin: band.value,
                yMax: band.value,
                borderColor: band.color || '#ff9900',
                borderWidth: 2,
                borderDash: band.dashed ? [5, 5] : [],
                label: {
                    content: band.label,
                    enabled: true,
                    position: 'end',
                    backgroundColor: documentStyle.getPropertyValue('--surface-800'),
                    color: textColor
                }
            };
        });
    }
    getChartType() {
        switch (this.widgetConfig.type) {
            case 'area':
                return 'line';
            case 'line':
                return 'line';
            case 'bar':
                return 'bar';
            case 'pie':
                return 'pie';
            case 'radar':
                return 'radar';
            case 'polarArea':
                return 'polarArea';
            case 'doughnut':
                return 'doughnut';
            default:
                return 'line';
        }
    }
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    onConfigure() {
        console.log('Configure widget:', this.widgetConfig.id);
    }
    onDuplicate() {
        console.log('Duplicate widget:', this.widgetConfig.id);
    }
    onDelete() {
        console.log('Delete widget:', this.widgetConfig.id);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: ChartWidgetComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.15", type: ChartWidgetComponent, isStandalone: true, selector: "app-chart-widget", inputs: { widgetConfig: "widgetConfig", chartHeight: "chartHeight" }, ngImport: i0, template: `
    <div class="card h-full" [ngClass]="widgetConfig.style">
      <div class="card-header flex justify-content-between align-items-center">
        <div>
          <h5 class="m-0">{{ widgetConfig.name }}</h5>
          <p class="text-sm text-surface-500 m-0">{{ widgetConfig.description }}</p>
        </div>
        <div class="flex gap-2">
          <button 
            pButton 
            type="button" 
            icon="pi pi-cog" 
            class="p-button-text p-button-sm"
            (click)="onConfigure()"
            pTooltip="Configure Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-copy" 
            class="p-button-text p-button-sm"
            (click)="onDuplicate()"
            pTooltip="Duplicate Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-trash" 
            class="p-button-text p-button-sm p-button-danger"
            (click)="onDelete()"
            pTooltip="Delete Widget">
          </button>
        </div>
      </div>
      <div class="card-content">
        <div class="chart-container" [style.height.px]="chartHeight">
          <p-chart 
            [type]="chartType" 
            [data]="chartData" 
            [options]="chartOptions"
            [height]="chartHeight.toString()">
          </p-chart>
        </div>
      </div>
    </div>
  `, isInline: true, styles: [".chart-container{position:relative;width:100%}.card{transition:all .3s ease}.card:hover{box-shadow:0 4px 12px #0000001a}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "ngmodule", type: ChartModule }, { kind: "component", type: i1$1.UIChart, selector: "p-chart", inputs: ["type", "plugins", "width", "height", "responsive", "ariaLabel", "ariaLabelledBy", "data", "options"], outputs: ["onDataSelect"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: ChartWidgetComponent, decorators: [{
            type: Component,
            args: [{ selector: 'app-chart-widget', standalone: true, imports: [CommonModule, ChartModule], template: `
    <div class="card h-full" [ngClass]="widgetConfig.style">
      <div class="card-header flex justify-content-between align-items-center">
        <div>
          <h5 class="m-0">{{ widgetConfig.name }}</h5>
          <p class="text-sm text-surface-500 m-0">{{ widgetConfig.description }}</p>
        </div>
        <div class="flex gap-2">
          <button 
            pButton 
            type="button" 
            icon="pi pi-cog" 
            class="p-button-text p-button-sm"
            (click)="onConfigure()"
            pTooltip="Configure Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-copy" 
            class="p-button-text p-button-sm"
            (click)="onDuplicate()"
            pTooltip="Duplicate Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-trash" 
            class="p-button-text p-button-sm p-button-danger"
            (click)="onDelete()"
            pTooltip="Delete Widget">
          </button>
        </div>
      </div>
      <div class="card-content">
        <div class="chart-container" [style.height.px]="chartHeight">
          <p-chart 
            [type]="chartType" 
            [data]="chartData" 
            [options]="chartOptions"
            [height]="chartHeight.toString()">
          </p-chart>
        </div>
      </div>
    </div>
  `, styles: [".chart-container{position:relative;width:100%}.card{transition:all .3s ease}.card:hover{box-shadow:0 4px 12px #0000001a}\n"] }]
        }], propDecorators: { widgetConfig: [{
                type: Input
            }], chartHeight: [{
                type: Input
            }] } });

class IncidentTrendWidgetComponent {
    widgetConfig;
    chartHeight = 300;
    layoutService = inject(LayoutService);
    dataService = inject(DataService);
    chartData = {};
    chartOptions = {};
    subscription;
    ngOnInit() {
        this.initializeChart();
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.updateChartOptions();
        });
    }
    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
    initializeChart() {
        this.loadData();
        this.updateChartOptions();
    }
    loadData() {
        this.dataService.getData('incident-trend').subscribe(data => {
            this.chartData = this.processDataForChart(data);
        });
    }
    processDataForChart(data) {
        const labels = data.map(item => item.month);
        const datasets = [
            {
                label: 'Incidents',
                data: data.map(item => item.incidents),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y'
            },
            {
                label: 'Severity',
                data: data.map(item => item.severity),
                borderColor: '#f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                fill: false,
                tension: 0.4,
                yAxisID: 'y1'
            }
        ];
        return { labels, datasets };
    }
    updateChartOptions() {
        const isDark = this.layoutService.layoutConfig().darkTheme;
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: isDark ? '#ffffff' : '#333333',
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: isDark ? '#2d3748' : '#ffffff',
                    titleColor: isDark ? '#ffffff' : '#333333',
                    bodyColor: isDark ? '#ffffff' : '#333333',
                    borderColor: isDark ? '#4a5568' : '#e2e8f0',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: true,
                        color: isDark ? '#4a5568' : '#e2e8f0'
                    },
                    ticks: {
                        color: isDark ? '#a0aec0' : '#718096'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: {
                        display: true,
                        color: isDark ? '#4a5568' : '#e2e8f0'
                    },
                    ticks: {
                        color: isDark ? '#a0aec0' : '#718096'
                    },
                    title: {
                        display: true,
                        text: 'Incidents',
                        color: isDark ? '#a0aec0' : '#718096'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        color: isDark ? '#a0aec0' : '#718096'
                    },
                    title: {
                        display: true,
                        text: 'Severity',
                        color: isDark ? '#a0aec0' : '#718096'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        };
    }
    onConfigure() {
        console.log('Configure incident trend widget');
    }
    onDuplicate() {
        console.log('Duplicate incident trend widget');
    }
    onDelete() {
        console.log('Delete incident trend widget');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: IncidentTrendWidgetComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.15", type: IncidentTrendWidgetComponent, isStandalone: true, selector: "app-incident-trend-widget", inputs: { widgetConfig: "widgetConfig", chartHeight: "chartHeight" }, ngImport: i0, template: `
    <div class="card h-full">
      <div class="card-header flex justify-content-between align-items-center">
        <div>
          <h5 class="m-0">Incident Trend</h5>
          <p class="text-sm text-surface-500 m-0">12-month view</p>
        </div>
        <div class="flex gap-2">
          <button 
            pButton 
            type="button" 
            icon="pi pi-cog" 
            class="p-button-text p-button-sm"
            (click)="onConfigure()"
            pTooltip="Configure Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-copy" 
            class="p-button-text p-button-sm"
            (click)="onDuplicate()"
            pTooltip="Duplicate Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-trash" 
            class="p-button-text p-button-sm p-button-danger"
            (click)="onDelete()"
            pTooltip="Delete Widget">
          </button>
        </div>
      </div>
      <div class="card-content">
        <div class="chart-container" [style.height.px]="chartHeight">
          <p-chart 
            type="line" 
            [data]="chartData" 
            [options]="chartOptions"
            [height]="chartHeight.toString()">
          </p-chart>
        </div>
      </div>
    </div>
  `, isInline: true, styles: [".chart-container{position:relative;width:100%}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "ngmodule", type: ChartModule }, { kind: "component", type: i1$1.UIChart, selector: "p-chart", inputs: ["type", "plugins", "width", "height", "responsive", "ariaLabel", "ariaLabelledBy", "data", "options"], outputs: ["onDataSelect"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: IncidentTrendWidgetComponent, decorators: [{
            type: Component,
            args: [{ selector: 'app-incident-trend-widget', standalone: true, imports: [CommonModule, ChartModule], template: `
    <div class="card h-full">
      <div class="card-header flex justify-content-between align-items-center">
        <div>
          <h5 class="m-0">Incident Trend</h5>
          <p class="text-sm text-surface-500 m-0">12-month view</p>
        </div>
        <div class="flex gap-2">
          <button 
            pButton 
            type="button" 
            icon="pi pi-cog" 
            class="p-button-text p-button-sm"
            (click)="onConfigure()"
            pTooltip="Configure Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-copy" 
            class="p-button-text p-button-sm"
            (click)="onDuplicate()"
            pTooltip="Duplicate Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-trash" 
            class="p-button-text p-button-sm p-button-danger"
            (click)="onDelete()"
            pTooltip="Delete Widget">
          </button>
        </div>
      </div>
      <div class="card-content">
        <div class="chart-container" [style.height.px]="chartHeight">
          <p-chart 
            type="line" 
            [data]="chartData" 
            [options]="chartOptions"
            [height]="chartHeight.toString()">
          </p-chart>
        </div>
      </div>
    </div>
  `, styles: [".chart-container{position:relative;width:100%}\n"] }]
        }], propDecorators: { widgetConfig: [{
                type: Input
            }], chartHeight: [{
                type: Input
            }] } });

class KriBreachesWidgetComponent {
    widgetConfig;
    chartHeight = 300;
    layoutService = inject(LayoutService);
    dataService = inject(DataService);
    chartData = {};
    chartOptions = {};
    subscription;
    ngOnInit() {
        this.initializeChart();
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.updateChartOptions();
        });
    }
    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
    initializeChart() {
        this.loadData();
        this.updateChartOptions();
    }
    loadData() {
        this.dataService.getData('kri-breaches').subscribe(data => {
            this.chartData = this.processDataForChart(data);
        });
    }
    processDataForChart(data) {
        const labels = data.map(item => item.name);
        const datasets = [
            {
                label: 'Breaches',
                data: data.map(item => item.breaches),
                backgroundColor: data.map((item, index) => {
                    const colors = ['#22c55e', '#f97316', '#06b6d4', '#ef4444', '#a855f7', '#8b5cf6', '#ec4899'];
                    return colors[index % colors.length];
                }),
                borderColor: data.map((item, index) => {
                    const colors = ['#16a34a', '#ea580c', '#0891b2', '#dc2626', '#9333ea', '#7c3aed', '#db2777'];
                    return colors[index % colors.length];
                }),
                borderWidth: 1,
                borderRadius: 6,
                borderSkipped: false
            },
            {
                label: 'Threshold',
                data: data.map(item => item.threshold),
                type: 'line',
                borderColor: '#ef4444',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                pointHoverRadius: 4
            }
        ];
        return { labels, datasets };
    }
    updateChartOptions() {
        const isDark = this.layoutService.layoutConfig().darkTheme;
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: isDark ? '#ffffff' : '#333333',
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: isDark ? '#2d3748' : '#ffffff',
                    titleColor: isDark ? '#ffffff' : '#333333',
                    bodyColor: isDark ? '#ffffff' : '#333333',
                    borderColor: isDark ? '#4a5568' : '#e2e8f0',
                    borderWidth: 1,
                    callbacks: {
                        afterLabel: (context) => {
                            const dataIndex = context.dataIndex;
                            const data = this.chartData.datasets[0].data[dataIndex];
                            const threshold = this.chartData.datasets[1].data[dataIndex];
                            const trend = context.raw.trend || 'stable';
                            return [
                                `Threshold: ${threshold}`,
                                `Trend: ${trend}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: true,
                        color: isDark ? '#4a5568' : '#e2e8f0'
                    },
                    ticks: {
                        color: isDark ? '#a0aec0' : '#718096',
                        maxRotation: 45
                    }
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: isDark ? '#4a5568' : '#e2e8f0'
                    },
                    ticks: {
                        color: isDark ? '#a0aec0' : '#718096'
                    },
                    title: {
                        display: true,
                        text: 'Number of Breaches',
                        color: isDark ? '#a0aec0' : '#718096'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        };
    }
    onConfigure() {
        console.log('Configure KRI breaches widget');
    }
    onDuplicate() {
        console.log('Duplicate KRI breaches widget');
    }
    onDelete() {
        console.log('Delete KRI breaches widget');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: KriBreachesWidgetComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.15", type: KriBreachesWidgetComponent, isStandalone: true, selector: "app-kri-breaches-widget", inputs: { widgetConfig: "widgetConfig", chartHeight: "chartHeight" }, ngImport: i0, template: `
    <div class="card h-full">
      <div class="card-header flex justify-content-between align-items-center">
        <div>
          <h5 class="m-0">KRI Breaches by Risk Type</h5>
          <p class="text-sm text-surface-500 m-0">MTD</p>
        </div>
        <div class="flex gap-2">
          <button 
            pButton 
            type="button" 
            icon="pi pi-cog" 
            class="p-button-text p-button-sm"
            (click)="onConfigure()"
            pTooltip="Configure Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-copy" 
            class="p-button-text p-button-sm"
            (click)="onDuplicate()"
            pTooltip="Duplicate Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-trash" 
            class="p-button-text p-button-sm p-button-danger"
            (click)="onDelete()"
            pTooltip="Delete Widget">
          </button>
        </div>
      </div>
      <div class="card-content">
        <div class="chart-container" [style.height.px]="chartHeight">
          <p-chart 
            type="bar" 
            [data]="chartData" 
            [options]="chartOptions"
            [height]="chartHeight.toString()">
          </p-chart>
        </div>
      </div>
    </div>
  `, isInline: true, styles: [".chart-container{position:relative;width:100%}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "ngmodule", type: ChartModule }, { kind: "component", type: i1$1.UIChart, selector: "p-chart", inputs: ["type", "plugins", "width", "height", "responsive", "ariaLabel", "ariaLabelledBy", "data", "options"], outputs: ["onDataSelect"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: KriBreachesWidgetComponent, decorators: [{
            type: Component,
            args: [{ selector: 'app-kri-breaches-widget', standalone: true, imports: [CommonModule, ChartModule], template: `
    <div class="card h-full">
      <div class="card-header flex justify-content-between align-items-center">
        <div>
          <h5 class="m-0">KRI Breaches by Risk Type</h5>
          <p class="text-sm text-surface-500 m-0">MTD</p>
        </div>
        <div class="flex gap-2">
          <button 
            pButton 
            type="button" 
            icon="pi pi-cog" 
            class="p-button-text p-button-sm"
            (click)="onConfigure()"
            pTooltip="Configure Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-copy" 
            class="p-button-text p-button-sm"
            (click)="onDuplicate()"
            pTooltip="Duplicate Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-trash" 
            class="p-button-text p-button-sm p-button-danger"
            (click)="onDelete()"
            pTooltip="Delete Widget">
          </button>
        </div>
      </div>
      <div class="card-content">
        <div class="chart-container" [style.height.px]="chartHeight">
          <p-chart 
            type="bar" 
            [data]="chartData" 
            [options]="chartOptions"
            [height]="chartHeight.toString()">
          </p-chart>
        </div>
      </div>
    </div>
  `, styles: [".chart-container{position:relative;width:100%}\n"] }]
        }], propDecorators: { widgetConfig: [{
                type: Input
            }], chartHeight: [{
                type: Input
            }] } });

class AuditAgingWidgetComponent {
    widgetConfig;
    chartHeight = 300;
    layoutService = inject(LayoutService);
    dataService = inject(DataService);
    chartData = {};
    chartOptions = {};
    legendData = [];
    subscription;
    ngOnInit() {
        this.initializeChart();
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.updateChartOptions();
        });
    }
    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
    initializeChart() {
        this.loadData();
        this.updateChartOptions();
    }
    loadData() {
        this.dataService.getData('audit-aging').subscribe(data => {
            this.chartData = this.processDataForChart(data);
            this.legendData = this.createLegendData(data);
        });
    }
    processDataForChart(data) {
        const labels = data.map(item => item.aging);
        const datasets = [
            {
                data: data.map(item => item.findings),
                backgroundColor: [
                    '#22c55e',
                    '#eab308',
                    '#f97316',
                    '#ef4444'
                ],
                borderColor: [
                    '#16a34a',
                    '#ca8a04',
                    '#ea580c',
                    '#dc2626'
                ],
                borderWidth: 2,
                hoverOffset: 4
            }
        ];
        return { labels, datasets };
    }
    createLegendData(data) {
        const colors = ['#22c55e', '#eab308', '#f97316', '#ef4444'];
        return data.map((item, index) => ({
            label: item.aging,
            value: item.findings,
            color: colors[index]
        }));
    }
    updateChartOptions() {
        const isDark = this.layoutService.layoutConfig().darkTheme;
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: isDark ? '#2d3748' : '#ffffff',
                    titleColor: isDark ? '#ffffff' : '#333333',
                    bodyColor: isDark ? '#ffffff' : '#333333',
                    borderColor: isDark ? '#4a5568' : '#e2e8f0',
                    borderWidth: 1,
                    callbacks: {
                        label: (context) => {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            interaction: {
                intersect: false
            }
        };
    }
    onConfigure() {
        console.log('Configure audit aging widget');
    }
    onDuplicate() {
        console.log('Duplicate audit aging widget');
    }
    onDelete() {
        console.log('Delete audit aging widget');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: AuditAgingWidgetComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.15", type: AuditAgingWidgetComponent, isStandalone: true, selector: "app-audit-aging-widget", inputs: { widgetConfig: "widgetConfig", chartHeight: "chartHeight" }, ngImport: i0, template: `
    <div class="card h-full">
      <div class="card-header flex justify-content-between align-items-center">
        <div>
          <h5 class="m-0">Audit Findings – Aging</h5>
          <p class="text-sm text-surface-500 m-0">Open items</p>
        </div>
        <div class="flex gap-2">
          <button 
            pButton 
            type="button" 
            icon="pi pi-cog" 
            class="p-button-text p-button-sm"
            (click)="onConfigure()"
            pTooltip="Configure Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-copy" 
            class="p-button-text p-button-sm"
            (click)="onDuplicate()"
            pTooltip="Duplicate Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-trash" 
            class="p-button-text p-button-sm p-button-danger"
            (click)="onDelete()"
            pTooltip="Delete Widget">
          </button>
        </div>
      </div>
      <div class="card-content">
        <div class="chart-container" [style.height.px]="chartHeight">
          <p-chart 
            type="pie" 
            [data]="chartData" 
            [options]="chartOptions"
            [height]="chartHeight.toString()">
          </p-chart>
        </div>
        <div class="mt-4">
          <div class="flex justify-content-between align-items-center mb-2" *ngFor="let item of legendData">
            <div class="flex align-items-center">
              <div class="w-3 h-3 rounded-circle mr-2" [style.background-color]="item.color"></div>
              <span class="text-sm">{{ item.label }}</span>
            </div>
            <span class="text-sm font-semibold">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>
  `, isInline: true, styles: [".chart-container{position:relative;width:100%}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "ngmodule", type: ChartModule }, { kind: "component", type: i1$1.UIChart, selector: "p-chart", inputs: ["type", "plugins", "width", "height", "responsive", "ariaLabel", "ariaLabelledBy", "data", "options"], outputs: ["onDataSelect"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: AuditAgingWidgetComponent, decorators: [{
            type: Component,
            args: [{ selector: 'app-audit-aging-widget', standalone: true, imports: [CommonModule, ChartModule], template: `
    <div class="card h-full">
      <div class="card-header flex justify-content-between align-items-center">
        <div>
          <h5 class="m-0">Audit Findings – Aging</h5>
          <p class="text-sm text-surface-500 m-0">Open items</p>
        </div>
        <div class="flex gap-2">
          <button 
            pButton 
            type="button" 
            icon="pi pi-cog" 
            class="p-button-text p-button-sm"
            (click)="onConfigure()"
            pTooltip="Configure Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-copy" 
            class="p-button-text p-button-sm"
            (click)="onDuplicate()"
            pTooltip="Duplicate Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-trash" 
            class="p-button-text p-button-sm p-button-danger"
            (click)="onDelete()"
            pTooltip="Delete Widget">
          </button>
        </div>
      </div>
      <div class="card-content">
        <div class="chart-container" [style.height.px]="chartHeight">
          <p-chart 
            type="pie" 
            [data]="chartData" 
            [options]="chartOptions"
            [height]="chartHeight.toString()">
          </p-chart>
        </div>
        <div class="mt-4">
          <div class="flex justify-content-between align-items-center mb-2" *ngFor="let item of legendData">
            <div class="flex align-items-center">
              <div class="w-3 h-3 rounded-circle mr-2" [style.background-color]="item.color"></div>
              <span class="text-sm">{{ item.label }}</span>
            </div>
            <span class="text-sm font-semibold">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>
  `, styles: [".chart-container{position:relative;width:100%}\n"] }]
        }], propDecorators: { widgetConfig: [{
                type: Input
            }], chartHeight: [{
                type: Input
            }] } });

class AppetiteUtilizationWidgetComponent {
    widgetConfig;
    layoutService = inject(LayoutService);
    dataService = inject(DataService);
    utilizationData = [];
    ngOnInit() {
        this.loadData();
    }
    ngOnDestroy() {
        // Cleanup if needed
    }
    loadData() {
        this.dataService.getData('appetite-utilization').subscribe(data => {
            this.utilizationData = data;
        });
    }
    getStatusClass(status) {
        switch (status) {
            case 'green':
                return 'status-green';
            case 'amber':
                return 'status-amber';
            case 'red':
                return 'status-red';
            default:
                return '';
        }
    }
    getProgressBarStyle(status) {
        const baseStyle = {
            height: '8px',
            borderRadius: '4px'
        };
        switch (status) {
            case 'green':
                return {
                    ...baseStyle,
                    '--p-progressbar-background': '#dcfce7',
                    '--p-progressbar-value-background': '#22c55e'
                };
            case 'amber':
                return {
                    ...baseStyle,
                    '--p-progressbar-background': '#fed7aa',
                    '--p-progressbar-value-background': '#f97316'
                };
            case 'red':
                return {
                    ...baseStyle,
                    '--p-progressbar-background': '#fecaca',
                    '--p-progressbar-value-background': '#ef4444'
                };
            default:
                return baseStyle;
        }
    }
    onConfigure() {
        console.log('Configure appetite utilization widget');
    }
    onDuplicate() {
        console.log('Duplicate appetite utilization widget');
    }
    onDelete() {
        console.log('Delete appetite utilization widget');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: AppetiteUtilizationWidgetComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.15", type: AppetiteUtilizationWidgetComponent, isStandalone: true, selector: "app-appetite-utilization-widget", inputs: { widgetConfig: "widgetConfig" }, ngImport: i0, template: `
    <div class="card h-full">
      <div class="card-header flex justify-content-between align-items-center">
        <div>
          <h5 class="m-0">Risk Appetite Utilization</h5>
          <p class="text-sm text-surface-500 m-0">Across key KPIs</p>
        </div>
        <div class="flex gap-2">
          <button 
            pButton 
            type="button" 
            icon="pi pi-cog" 
            class="p-button-text p-button-sm"
            (click)="onConfigure()"
            pTooltip="Configure Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-copy" 
            class="p-button-text p-button-sm"
            (click)="onDuplicate()"
            pTooltip="Duplicate Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-trash" 
            class="p-button-text p-button-sm p-button-danger"
            (click)="onDelete()"
            pTooltip="Delete Widget">
          </button>
        </div>
      </div>
      <div class="card-content">
        <div class="space-y-4">
          <div *ngFor="let item of utilizationData" class="utilization-item">
            <div class="flex justify-content-between align-items-center mb-2">
              <span class="text-sm font-medium" [title]="item.kpi">{{ item.kpi }}</span>
              <span class="text-sm font-semibold" [ngClass]="getStatusClass(item.status)">
                {{ (item.value * 100) | number:'1.0-0' }}%
              </span>
            </div>
            <p-progressBar 
              [value]="item.value * 100" 
              [showValue]="false"
              [style]="getProgressBarStyle(item.status)">
            </p-progressBar>
            <div class="flex justify-content-between text-xs text-surface-500 mt-1">
              <span>Threshold: {{ (item.threshold * 100) | number:'1.0-0' }}%</span>
              <span [ngClass]="getStatusClass(item.status)">{{ item.status | titlecase }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `, isInline: true, styles: [".utilization-item{padding:.75rem 0;border-bottom:1px solid var(--surface-200)}.utilization-item:last-child{border-bottom:none}.status-green{color:#22c55e}.status-amber{color:#f97316}.status-red{color:#ef4444}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "pipe", type: i1.DecimalPipe, name: "number" }, { kind: "pipe", type: i1.TitleCasePipe, name: "titlecase" }, { kind: "ngmodule", type: ProgressBarModule }, { kind: "component", type: i2$1.ProgressBar, selector: "p-progressBar, p-progressbar, p-progress-bar", inputs: ["value", "showValue", "styleClass", "valueStyleClass", "style", "unit", "mode", "color"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: AppetiteUtilizationWidgetComponent, decorators: [{
            type: Component,
            args: [{ selector: 'app-appetite-utilization-widget', standalone: true, imports: [CommonModule, ProgressBarModule], template: `
    <div class="card h-full">
      <div class="card-header flex justify-content-between align-items-center">
        <div>
          <h5 class="m-0">Risk Appetite Utilization</h5>
          <p class="text-sm text-surface-500 m-0">Across key KPIs</p>
        </div>
        <div class="flex gap-2">
          <button 
            pButton 
            type="button" 
            icon="pi pi-cog" 
            class="p-button-text p-button-sm"
            (click)="onConfigure()"
            pTooltip="Configure Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-copy" 
            class="p-button-text p-button-sm"
            (click)="onDuplicate()"
            pTooltip="Duplicate Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-trash" 
            class="p-button-text p-button-sm p-button-danger"
            (click)="onDelete()"
            pTooltip="Delete Widget">
          </button>
        </div>
      </div>
      <div class="card-content">
        <div class="space-y-4">
          <div *ngFor="let item of utilizationData" class="utilization-item">
            <div class="flex justify-content-between align-items-center mb-2">
              <span class="text-sm font-medium" [title]="item.kpi">{{ item.kpi }}</span>
              <span class="text-sm font-semibold" [ngClass]="getStatusClass(item.status)">
                {{ (item.value * 100) | number:'1.0-0' }}%
              </span>
            </div>
            <p-progressBar 
              [value]="item.value * 100" 
              [showValue]="false"
              [style]="getProgressBarStyle(item.status)">
            </p-progressBar>
            <div class="flex justify-content-between text-xs text-surface-500 mt-1">
              <span>Threshold: {{ (item.threshold * 100) | number:'1.0-0' }}%</span>
              <span [ngClass]="getStatusClass(item.status)">{{ item.status | titlecase }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `, styles: [".utilization-item{padding:.75rem 0;border-bottom:1px solid var(--surface-200)}.utilization-item:last-child{border-bottom:none}.status-green{color:#22c55e}.status-amber{color:#f97316}.status-red{color:#ef4444}\n"] }]
        }], propDecorators: { widgetConfig: [{
                type: Input
            }] } });

class RiskHeatmapWidgetComponent {
    widgetConfig;
    layoutService = inject(LayoutService);
    dataService = inject(DataService);
    heatmapData = [];
    ngOnInit() {
        this.loadData();
    }
    ngOnDestroy() {
        // Cleanup if needed
    }
    loadData() {
        this.dataService.getData('risk-heatmap').subscribe(data => {
            this.heatmapData = data;
        });
    }
    getRiskClass(riskScore) {
        if (riskScore >= 2.0)
            return 'risk-critical';
        if (riskScore >= 1.5)
            return 'risk-high';
        if (riskScore >= 1.0)
            return 'risk-medium';
        return 'risk-low';
    }
    onCellClick(cell) {
        console.log('Heatmap cell clicked:', cell);
        // Emit event or show details
    }
    onConfigure() {
        console.log('Configure risk heatmap widget');
    }
    onDuplicate() {
        console.log('Duplicate risk heatmap widget');
    }
    onDelete() {
        console.log('Delete risk heatmap widget');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: RiskHeatmapWidgetComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.15", type: RiskHeatmapWidgetComponent, isStandalone: true, selector: "app-risk-heatmap-widget", inputs: { widgetConfig: "widgetConfig" }, ngImport: i0, template: `
    <div class="card h-full">
      <div class="card-header flex justify-content-between align-items-center">
        <div>
          <h5 class="m-0">Risk Heatmap</h5>
          <p class="text-sm text-surface-500 m-0">Residual risk view</p>
        </div>
        <div class="flex gap-2">
          <button 
            pButton 
            type="button" 
            icon="pi pi-cog" 
            class="p-button-text p-button-sm"
            (click)="onConfigure()"
            pTooltip="Configure Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-copy" 
            class="p-button-text p-button-sm"
            (click)="onDuplicate()"
            pTooltip="Duplicate Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-trash" 
            class="p-button-text p-button-sm p-button-danger"
            (click)="onDelete()"
            pTooltip="Delete Widget">
          </button>
        </div>
      </div>
      <div class="card-content">
        <div class="heatmap-container">
          <div class="grid grid-cols-6 gap-2 items-center">
            <div class="text-xs text-surface-500 rotate-[-90deg] origin-left col-span-1 h-full flex items-center justify-center">
              Likelihood →
            </div>
            <div class="col-span-5">
              <div class="grid grid-cols-5 gap-2">
                <div 
                  *ngFor="let cell of heatmapData; let i = index" 
                  class="h-10 rounded-md flex items-center justify-center text-[10px] text-white font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                  [ngClass]="getRiskClass(cell.riskScore)"
                  [title]="cell.description"
                  (click)="onCellClick(cell)">
                  {{ cell.likelihood }}:{{ cell.impact }}
                </div>
              </div>
              <div class="flex justify-between mt-2 text-[10px] text-surface-500">
                <span *ngFor="let i of [1,2,3,4,5]">Impact {{ i }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-4">
          <div class="flex justify-center gap-4 text-xs">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded bg-green-500"></div>
              <span>Low</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded bg-yellow-400"></div>
              <span>Medium</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded bg-orange-500"></div>
              <span>High</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded bg-red-500"></div>
              <span>Critical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `, isInline: true, styles: [".heatmap-container{position:relative;width:100%}.risk-low{background-color:#22c55e}.risk-medium{background-color:#eab308}.risk-high{background-color:#f97316}.risk-critical{background-color:#ef4444}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: RiskHeatmapWidgetComponent, decorators: [{
            type: Component,
            args: [{ selector: 'app-risk-heatmap-widget', standalone: true, imports: [CommonModule], template: `
    <div class="card h-full">
      <div class="card-header flex justify-content-between align-items-center">
        <div>
          <h5 class="m-0">Risk Heatmap</h5>
          <p class="text-sm text-surface-500 m-0">Residual risk view</p>
        </div>
        <div class="flex gap-2">
          <button 
            pButton 
            type="button" 
            icon="pi pi-cog" 
            class="p-button-text p-button-sm"
            (click)="onConfigure()"
            pTooltip="Configure Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-copy" 
            class="p-button-text p-button-sm"
            (click)="onDuplicate()"
            pTooltip="Duplicate Widget">
          </button>
          <button 
            pButton 
            type="button" 
            icon="pi pi-trash" 
            class="p-button-text p-button-sm p-button-danger"
            (click)="onDelete()"
            pTooltip="Delete Widget">
          </button>
        </div>
      </div>
      <div class="card-content">
        <div class="heatmap-container">
          <div class="grid grid-cols-6 gap-2 items-center">
            <div class="text-xs text-surface-500 rotate-[-90deg] origin-left col-span-1 h-full flex items-center justify-center">
              Likelihood →
            </div>
            <div class="col-span-5">
              <div class="grid grid-cols-5 gap-2">
                <div 
                  *ngFor="let cell of heatmapData; let i = index" 
                  class="h-10 rounded-md flex items-center justify-center text-[10px] text-white font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                  [ngClass]="getRiskClass(cell.riskScore)"
                  [title]="cell.description"
                  (click)="onCellClick(cell)">
                  {{ cell.likelihood }}:{{ cell.impact }}
                </div>
              </div>
              <div class="flex justify-between mt-2 text-[10px] text-surface-500">
                <span *ngFor="let i of [1,2,3,4,5]">Impact {{ i }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-4">
          <div class="flex justify-center gap-4 text-xs">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded bg-green-500"></div>
              <span>Low</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded bg-yellow-400"></div>
              <span>Medium</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded bg-orange-500"></div>
              <span>High</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded bg-red-500"></div>
              <span>Critical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `, styles: [".heatmap-container{position:relative;width:100%}.risk-low{background-color:#22c55e}.risk-medium{background-color:#eab308}.risk-high{background-color:#f97316}.risk-critical{background-color:#ef4444}\n"] }]
        }], propDecorators: { widgetConfig: [{
                type: Input
            }] } });

class WidgetRendererComponent {
    widgetConfig;
    isDragging = false;
    isSelected = false;
    gridSize = 'md';
    ngOnInit() {
        // Component initialization
    }
    isPredefinedWidget() {
        if (!this.widgetConfig)
            return false;
        const predefinedWidgets = [
            'IncidentTrend',
            'KRIBreaches',
            'ControlEffectiveness',
            'AuditAging',
            'AppetiteUtilization',
            'RiskHeatmap'
        ];
        return predefinedWidgets.includes(this.widgetConfig.name);
    }
    getWidgetClasses() {
        const classes = ['widget-container'];
        if (this.isDragging) {
            classes.push('widget-dragging');
        }
        if (this.isSelected) {
            classes.push('widget-selected');
        }
        return classes.join(' ');
    }
    getChartHeight() {
        switch (this.gridSize) {
            case 'sm':
                return 200;
            case 'md':
                return 300;
            case 'lg':
                return 400;
            default:
                return 300;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: WidgetRendererComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.15", type: WidgetRendererComponent, isStandalone: true, selector: "app-widget-renderer", inputs: { widgetConfig: "widgetConfig", isDragging: "isDragging", isSelected: "isSelected", gridSize: "gridSize" }, ngImport: i0, template: `
    <div class="widget-container" [ngClass]="getWidgetClasses()">
      <!-- Incident Trend Widget -->
      <app-incident-trend-widget 
        *ngIf="widgetConfig?.name === 'IncidentTrend'"
        [widgetConfig]="widgetConfig"
        [chartHeight]="getChartHeight()">
      </app-incident-trend-widget>

      <!-- KRI Breaches Widget -->
      <app-kri-breaches-widget 
        *ngIf="widgetConfig?.name === 'KRIBreaches'"
        [widgetConfig]="widgetConfig"
        [chartHeight]="getChartHeight()">
      </app-kri-breaches-widget>


      <!-- Audit Aging Widget -->
      <app-audit-aging-widget 
        *ngIf="widgetConfig?.name === 'AuditAging'"
        [widgetConfig]="widgetConfig"
        [chartHeight]="getChartHeight()">
      </app-audit-aging-widget>

      <!-- Appetite Utilization Widget -->
      <app-appetite-utilization-widget 
        *ngIf="widgetConfig?.name === 'AppetiteUtilization'"
        [widgetConfig]="widgetConfig">
      </app-appetite-utilization-widget>

      <!-- Risk Heatmap Widget -->
      <app-risk-heatmap-widget 
        *ngIf="widgetConfig?.name === 'RiskHeatmap'"
        [widgetConfig]="widgetConfig">
      </app-risk-heatmap-widget>

      <!-- Generic Chart Widget for other types -->
      <app-chart-widget 
        *ngIf="!isPredefinedWidget() && widgetConfig"
        [widgetConfig]="widgetConfig"
        [chartHeight]="getChartHeight()">
      </app-chart-widget>

      <!-- Widget not found -->
      <div 
        *ngIf="!widgetConfig" 
        class="card h-full flex align-items-center justify-content-center text-surface-500">
        <div class="text-center">
          <i class="pi pi-exclamation-triangle text-2xl mb-2"></i>
          <p>Widget configuration not found</p>
        </div>
      </div>
    </div>
  `, isInline: true, styles: [".widget-container{width:100%;height:100%}.widget-dragging{opacity:.5;transform:rotate(5deg)}.widget-selected{border:2px solid var(--primary-color);border-radius:8px}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: ChartWidgetComponent, selector: "app-chart-widget", inputs: ["widgetConfig", "chartHeight"] }, { kind: "component", type: IncidentTrendWidgetComponent, selector: "app-incident-trend-widget", inputs: ["widgetConfig", "chartHeight"] }, { kind: "component", type: KriBreachesWidgetComponent, selector: "app-kri-breaches-widget", inputs: ["widgetConfig", "chartHeight"] }, { kind: "component", type: AuditAgingWidgetComponent, selector: "app-audit-aging-widget", inputs: ["widgetConfig", "chartHeight"] }, { kind: "component", type: AppetiteUtilizationWidgetComponent, selector: "app-appetite-utilization-widget", inputs: ["widgetConfig"] }, { kind: "component", type: RiskHeatmapWidgetComponent, selector: "app-risk-heatmap-widget", inputs: ["widgetConfig"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: WidgetRendererComponent, decorators: [{
            type: Component,
            args: [{ selector: 'app-widget-renderer', standalone: true, imports: [
                        CommonModule,
                        ChartWidgetComponent,
                        IncidentTrendWidgetComponent,
                        KriBreachesWidgetComponent,
                        AuditAgingWidgetComponent,
                        AppetiteUtilizationWidgetComponent,
                        RiskHeatmapWidgetComponent
                    ], template: `
    <div class="widget-container" [ngClass]="getWidgetClasses()">
      <!-- Incident Trend Widget -->
      <app-incident-trend-widget 
        *ngIf="widgetConfig?.name === 'IncidentTrend'"
        [widgetConfig]="widgetConfig"
        [chartHeight]="getChartHeight()">
      </app-incident-trend-widget>

      <!-- KRI Breaches Widget -->
      <app-kri-breaches-widget 
        *ngIf="widgetConfig?.name === 'KRIBreaches'"
        [widgetConfig]="widgetConfig"
        [chartHeight]="getChartHeight()">
      </app-kri-breaches-widget>


      <!-- Audit Aging Widget -->
      <app-audit-aging-widget 
        *ngIf="widgetConfig?.name === 'AuditAging'"
        [widgetConfig]="widgetConfig"
        [chartHeight]="getChartHeight()">
      </app-audit-aging-widget>

      <!-- Appetite Utilization Widget -->
      <app-appetite-utilization-widget 
        *ngIf="widgetConfig?.name === 'AppetiteUtilization'"
        [widgetConfig]="widgetConfig">
      </app-appetite-utilization-widget>

      <!-- Risk Heatmap Widget -->
      <app-risk-heatmap-widget 
        *ngIf="widgetConfig?.name === 'RiskHeatmap'"
        [widgetConfig]="widgetConfig">
      </app-risk-heatmap-widget>

      <!-- Generic Chart Widget for other types -->
      <app-chart-widget 
        *ngIf="!isPredefinedWidget() && widgetConfig"
        [widgetConfig]="widgetConfig"
        [chartHeight]="getChartHeight()">
      </app-chart-widget>

      <!-- Widget not found -->
      <div 
        *ngIf="!widgetConfig" 
        class="card h-full flex align-items-center justify-content-center text-surface-500">
        <div class="text-center">
          <i class="pi pi-exclamation-triangle text-2xl mb-2"></i>
          <p>Widget configuration not found</p>
        </div>
      </div>
    </div>
  `, styles: [".widget-container{width:100%;height:100%}.widget-dragging{opacity:.5;transform:rotate(5deg)}.widget-selected{border:2px solid var(--primary-color);border-radius:8px}\n"] }]
        }], propDecorators: { widgetConfig: [{
                type: Input
            }], isDragging: [{
                type: Input
            }], isSelected: [{
                type: Input
            }], gridSize: [{
                type: Input
            }] } });

class DashboardCanvasComponent {
    dashboardService = inject(DashboardService);
    widgetService = inject(WidgetService);
    widgets = [];
    selectedWidgetId = null;
    isDragging = false;
    subscriptions = [];
    ngOnInit() {
        this.subscriptions.push(this.dashboardService.widgets$.subscribe(widgets => {
            this.widgets = widgets;
        }));
    }
    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
    onWidgetDrop(event) {
        if (event.previousContainer === event.container) {
            // Reordering within the same container
            moveItemInArray(this.widgets, event.previousIndex, event.currentIndex);
            this.dashboardService.reorderWidgets(event.previousIndex, event.currentIndex);
        }
        else {
            // Moving from library to canvas
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
        }
    }
    onEmptyStateDrop(event) {
        // Handle dropping on empty state
        if (event.previousContainer !== event.container) {
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
        }
    }
    onWidgetClick(widget, index) {
        this.selectedWidgetId = widget.id;
        this.widgetService.selectWidget(widget);
    }
    onConfigureWidget(widget, event) {
        event.stopPropagation();
        this.widgetService.startConfiguration(widget);
    }
    onDuplicateWidget(widget, event) {
        event.stopPropagation();
        this.dashboardService.duplicateWidget(widget.id);
    }
    onDeleteWidget(widget, event) {
        event.stopPropagation();
        this.dashboardService.removeWidget(widget.id);
        if (this.selectedWidgetId === widget.id) {
            this.selectedWidgetId = null;
        }
    }
    onAddWidget() {
        this.dashboardService.setShowAddWidget(true);
    }
    onSaveLayout() {
        // Implement save functionality
        console.log('Saving layout...');
    }
    trackByWidgetId(index, widget) {
        return widget.id;
    }
    getGridClasses() {
        const classes = ['widget-grid'];
        // Add responsive classes based on screen size
        if (window.innerWidth < 768) {
            classes.push('compact');
        }
        else if (window.innerWidth > 1200) {
            classes.push('spacious');
        }
        return classes.join(' ');
    }
    getWidgetItemClasses(widget, index) {
        const classes = ['widget-item'];
        if (this.selectedWidgetId === widget.id) {
            classes.push('selected');
        }
        return classes.join(' ');
    }
    getGridSize() {
        if (window.innerWidth < 768)
            return 'sm';
        if (window.innerWidth > 1200)
            return 'lg';
        return 'md';
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: DashboardCanvasComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.15", type: DashboardCanvasComponent, isStandalone: true, selector: "app-dashboard-canvas", ngImport: i0, template: `
    <div class="dashboard-canvas">
      <!-- Canvas Header -->
      <div class="canvas-header mb-4">
        <div class="flex justify-content-between align-items-center">
          <div>
            <h3 class="m-0">Dashboard Canvas</h3>
            <p class="text-sm text-surface-500 m-0">Drag to reorder • Click to configure • Add more widgets</p>
          </div>
          <div class="flex gap-2 ml-2">
            <button 
              pButton 
              type="button" 
              label="Add Widget" 
              icon="pi pi-plus" 
              class="p-button-outlined"
              (click)="onAddWidget()">
            </button>
            <button 
              pButton 
              type="button" 
              label="Save Layout" 
              icon="pi pi-save" 
              class="p-button"
              (click)="onSaveLayout()">
            </button>
          </div>
        </div>
      </div>

      <!-- Widget Grid -->
      <div 
        cdkDropList
        (cdkDropListDropped)="onWidgetDrop($event)"
        class="widget-grid"
        [ngClass]="getGridClasses()">
        
        <div 
          *ngFor="let widget of widgets; let i = index; trackBy: trackByWidgetId"
          cdkDrag
          [cdkDragData]="widget"
          class="widget-item"
          [ngClass]="getWidgetItemClasses(widget, i)"
          (click)="onWidgetClick(widget, i)">
          
          <div class="widget-drag-handle" cdkDragHandle>
            <i class="pi pi-grip-vertical"></i>
          </div>
          
          <div class="widget-content">
            <app-widget-renderer 
              [widgetConfig]="widget"
              [isSelected]="selectedWidgetId === widget.id"
              [gridSize]="getGridSize()">
            </app-widget-renderer>
          </div>
          
          <!-- Widget Actions -->
          <div class="widget-actions" *ngIf="selectedWidgetId === widget.id">
            <button 
              pButton 
              type="button" 
              icon="pi pi-cog" 
              class="p-button-text p-button-sm"
              (click)="onConfigureWidget(widget, $event)"
              pTooltip="Configure">
            </button>
            <button 
              pButton 
              type="button" 
              icon="pi pi-copy" 
              class="p-button-text p-button-sm"
              (click)="onDuplicateWidget(widget, $event)"
              pTooltip="Duplicate">
            </button>
            <button 
              pButton 
              type="button" 
              icon="pi pi-trash" 
              class="p-button-text p-button-sm p-button-danger"
              (click)="onDeleteWidget(widget, $event)"
              pTooltip="Delete">
            </button>
          </div>
        </div>
        
        <!-- Empty State -->
        <div 
          *ngIf="widgets.length === 0" 
          class="empty-state"
          cdkDropList
          (cdkDropListDropped)="onEmptyStateDrop($event)">
          <div class="text-center p-6">
            <i class="pi pi-plus-circle text-4xl text-surface-400 mb-3"></i>
            <h4 class="text-surface-600 mb-2">No widgets yet</h4>
            <p class="text-surface-500 mb-4">Drag widgets from the library or click "Add Widget" to get started</p>
            <button 
              pButton 
              type="button" 
              label="Add Your First Widget" 
              icon="pi pi-plus" 
              class="p-button-outlined"
              (click)="onAddWidget()">
            </button>
          </div>
        </div>
      </div>
    </div>
  `, isInline: true, styles: [".dashboard-canvas{width:100%;min-height:600px}.canvas-header{padding:1rem 0;border-bottom:1px solid var(--surface-200)}.widget-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1rem;padding:1rem 0}.widget-grid.compact{grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:.75rem}.widget-grid.spacious{grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:1.5rem}.widget-item{position:relative;min-height:200px;border:2px solid transparent;border-radius:8px;transition:all .3s ease;cursor:pointer}.widget-item:hover{border-color:var(--primary-color);box-shadow:0 4px 12px #0000001a}.widget-item.selected{border-color:var(--primary-color);box-shadow:0 0 0 2px rgba(var(--primary-color-rgb),.2)}.widget-item.cdk-drag-preview{box-shadow:0 8px 24px #0003;transform:rotate(2deg)}.widget-item.cdk-drag-placeholder{opacity:.3;background:var(--surface-100);border:2px dashed var(--surface-300)}.widget-drag-handle{position:absolute;top:.5rem;right:.5rem;z-index:10;opacity:0;transition:opacity .3s ease;cursor:grab}.widget-item:hover .widget-drag-handle{opacity:1}.widget-content{height:100%}.widget-actions{position:absolute;top:.5rem;right:.5rem;z-index:10;display:flex;gap:.25rem;opacity:0;transition:opacity .3s ease}.widget-item.selected .widget-actions{opacity:1}.empty-state{grid-column:1 / -1;min-height:400px;border:2px dashed var(--surface-300);border-radius:8px;display:flex;align-items:center;justify-content:center}.empty-state.cdk-drop-list-dragging{border-color:var(--primary-color);background:rgba(var(--primary-color-rgb),.05)}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: CdkDrag, selector: "[cdkDrag]", inputs: ["cdkDragData", "cdkDragLockAxis", "cdkDragRootElement", "cdkDragBoundary", "cdkDragStartDelay", "cdkDragFreeDragPosition", "cdkDragDisabled", "cdkDragConstrainPosition", "cdkDragPreviewClass", "cdkDragPreviewContainer", "cdkDragScale"], outputs: ["cdkDragStarted", "cdkDragReleased", "cdkDragEnded", "cdkDragEntered", "cdkDragExited", "cdkDragDropped", "cdkDragMoved"], exportAs: ["cdkDrag"] }, { kind: "directive", type: CdkDropList, selector: "[cdkDropList], cdk-drop-list", inputs: ["cdkDropListConnectedTo", "cdkDropListData", "cdkDropListOrientation", "id", "cdkDropListLockAxis", "cdkDropListDisabled", "cdkDropListSortingDisabled", "cdkDropListEnterPredicate", "cdkDropListSortPredicate", "cdkDropListAutoScrollDisabled", "cdkDropListAutoScrollStep", "cdkDropListElementContainer"], outputs: ["cdkDropListDropped", "cdkDropListEntered", "cdkDropListExited", "cdkDropListSorted"], exportAs: ["cdkDropList"] }, { kind: "component", type: WidgetRendererComponent, selector: "app-widget-renderer", inputs: ["widgetConfig", "isDragging", "isSelected", "gridSize"] }, { kind: "ngmodule", type: ButtonModule }, { kind: "directive", type: i8.ButtonDirective, selector: "[pButton]", inputs: ["iconPos", "loadingIcon", "loading", "severity", "raised", "rounded", "text", "outlined", "size", "plain", "fluid", "label", "icon", "buttonProps"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: DashboardCanvasComponent, decorators: [{
            type: Component,
            args: [{ selector: 'app-dashboard-canvas', standalone: true, imports: [CommonModule, CdkDrag, CdkDropList, WidgetRendererComponent, ButtonModule], template: `
    <div class="dashboard-canvas">
      <!-- Canvas Header -->
      <div class="canvas-header mb-4">
        <div class="flex justify-content-between align-items-center">
          <div>
            <h3 class="m-0">Dashboard Canvas</h3>
            <p class="text-sm text-surface-500 m-0">Drag to reorder • Click to configure • Add more widgets</p>
          </div>
          <div class="flex gap-2 ml-2">
            <button 
              pButton 
              type="button" 
              label="Add Widget" 
              icon="pi pi-plus" 
              class="p-button-outlined"
              (click)="onAddWidget()">
            </button>
            <button 
              pButton 
              type="button" 
              label="Save Layout" 
              icon="pi pi-save" 
              class="p-button"
              (click)="onSaveLayout()">
            </button>
          </div>
        </div>
      </div>

      <!-- Widget Grid -->
      <div 
        cdkDropList
        (cdkDropListDropped)="onWidgetDrop($event)"
        class="widget-grid"
        [ngClass]="getGridClasses()">
        
        <div 
          *ngFor="let widget of widgets; let i = index; trackBy: trackByWidgetId"
          cdkDrag
          [cdkDragData]="widget"
          class="widget-item"
          [ngClass]="getWidgetItemClasses(widget, i)"
          (click)="onWidgetClick(widget, i)">
          
          <div class="widget-drag-handle" cdkDragHandle>
            <i class="pi pi-grip-vertical"></i>
          </div>
          
          <div class="widget-content">
            <app-widget-renderer 
              [widgetConfig]="widget"
              [isSelected]="selectedWidgetId === widget.id"
              [gridSize]="getGridSize()">
            </app-widget-renderer>
          </div>
          
          <!-- Widget Actions -->
          <div class="widget-actions" *ngIf="selectedWidgetId === widget.id">
            <button 
              pButton 
              type="button" 
              icon="pi pi-cog" 
              class="p-button-text p-button-sm"
              (click)="onConfigureWidget(widget, $event)"
              pTooltip="Configure">
            </button>
            <button 
              pButton 
              type="button" 
              icon="pi pi-copy" 
              class="p-button-text p-button-sm"
              (click)="onDuplicateWidget(widget, $event)"
              pTooltip="Duplicate">
            </button>
            <button 
              pButton 
              type="button" 
              icon="pi pi-trash" 
              class="p-button-text p-button-sm p-button-danger"
              (click)="onDeleteWidget(widget, $event)"
              pTooltip="Delete">
            </button>
          </div>
        </div>
        
        <!-- Empty State -->
        <div 
          *ngIf="widgets.length === 0" 
          class="empty-state"
          cdkDropList
          (cdkDropListDropped)="onEmptyStateDrop($event)">
          <div class="text-center p-6">
            <i class="pi pi-plus-circle text-4xl text-surface-400 mb-3"></i>
            <h4 class="text-surface-600 mb-2">No widgets yet</h4>
            <p class="text-surface-500 mb-4">Drag widgets from the library or click "Add Widget" to get started</p>
            <button 
              pButton 
              type="button" 
              label="Add Your First Widget" 
              icon="pi pi-plus" 
              class="p-button-outlined"
              (click)="onAddWidget()">
            </button>
          </div>
        </div>
      </div>
    </div>
  `, styles: [".dashboard-canvas{width:100%;min-height:600px}.canvas-header{padding:1rem 0;border-bottom:1px solid var(--surface-200)}.widget-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1rem;padding:1rem 0}.widget-grid.compact{grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:.75rem}.widget-grid.spacious{grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:1.5rem}.widget-item{position:relative;min-height:200px;border:2px solid transparent;border-radius:8px;transition:all .3s ease;cursor:pointer}.widget-item:hover{border-color:var(--primary-color);box-shadow:0 4px 12px #0000001a}.widget-item.selected{border-color:var(--primary-color);box-shadow:0 0 0 2px rgba(var(--primary-color-rgb),.2)}.widget-item.cdk-drag-preview{box-shadow:0 8px 24px #0003;transform:rotate(2deg)}.widget-item.cdk-drag-placeholder{opacity:.3;background:var(--surface-100);border:2px dashed var(--surface-300)}.widget-drag-handle{position:absolute;top:.5rem;right:.5rem;z-index:10;opacity:0;transition:opacity .3s ease;cursor:grab}.widget-item:hover .widget-drag-handle{opacity:1}.widget-content{height:100%}.widget-actions{position:absolute;top:.5rem;right:.5rem;z-index:10;display:flex;gap:.25rem;opacity:0;transition:opacity .3s ease}.widget-item.selected .widget-actions{opacity:1}.empty-state{grid-column:1 / -1;min-height:400px;border:2px dashed var(--surface-300);border-radius:8px;display:flex;align-items:center;justify-content:center}.empty-state.cdk-drop-list-dragging{border-color:var(--primary-color);background:rgba(var(--primary-color-rgb),.05)}\n"] }]
        }] });

class WidgetLibraryComponent {
    dashboardService = inject(DashboardService);
    widgets = [];
    filteredWidgets = [];
    searchQuery = '';
    selectedCategory = '';
    categoryOptions = [
        { label: 'All Categories', value: '' },
        ...WIDGET_CATEGORIES.map(cat => ({ label: cat.label, value: cat.key }))
    ];
    subscriptions = [];
    ngOnInit() {
        this.subscriptions.push(this.dashboardService.filteredWidgets$.subscribe(widgets => {
            this.widgets = widgets;
            this.applyFilters();
        }));
    }
    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
    onSearchChange() {
        this.dashboardService.setSearchQuery(this.searchQuery);
    }
    onCategoryChange() {
        this.applyFilters();
    }
    applyFilters() {
        let filtered = [...this.widgets];
        if (this.selectedCategory) {
            filtered = filtered.filter(widget => widget.category === this.selectedCategory);
        }
        this.filteredWidgets = filtered;
    }
    onWidgetClick(widget) {
        this.onAddWidget(widget);
    }
    onAddWidget(widget, event) {
        if (event) {
            event.stopPropagation();
        }
        this.dashboardService.addWidget(widget.key);
    }
    onClose() {
        this.dashboardService.setShowAddWidget(false);
    }
    getCategoryLabel(categoryKey) {
        const category = WIDGET_CATEGORIES.find(cat => cat.key === categoryKey);
        return category ? category.label : categoryKey;
    }
    trackByWidgetKey(index, widget) {
        return widget.key;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: WidgetLibraryComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.15", type: WidgetLibraryComponent, isStandalone: true, selector: "app-widget-library", ngImport: i0, template: `
    <div class="widget-library">
      <!-- Library Header -->
      <div class="library-header mb-4">
        <div class="flex justify-content-between align-items-center mb-3">
          <h4 class="m-0">Widget Library</h4>
          <button 
            pButton 
            type="button" 
            icon="pi pi-times" 
            class="p-button-text p-button-sm"
            (click)="onClose()"
            pTooltip="Close Library">
          </button>
        </div>
        
        <!-- Search and Filter -->
        <div class="flex gap-3 mb-4">
          <div class="flex-1">
            <input 
              type="text" 
              pInputText 
              placeholder="Search widgets..." 
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()"
              class="w-full">
          </div>
          <p-dropdown 
            [options]="categoryOptions" 
            [(ngModel)]="selectedCategory"
            (ngModelChange)="onCategoryChange()"
            placeholder="All Categories"
            [showClear]="true"
            styleClass="w-12rem">
          </p-dropdown>
        </div>
      </div>

      <!-- Widget Grid -->
      <div class="widget-grid">
        <div 
          *ngFor="let widget of filteredWidgets; trackBy: trackByWidgetKey"
          cdkDrag
          [cdkDragData]="widget"
          class="widget-card"
          (click)="onWidgetClick(widget)">
          
          <div class="widget-card-header">
            <div class="flex align-items-center gap-2">
              <i [class]="widget.icon" class="text-primary"></i>
              <h6 class="m-0">{{ widget.label }}</h6>
            </div>
            <span class="widget-category">{{ getCategoryLabel(widget.category) }}</span>
          </div>
          
          <div class="widget-card-content">
            <p class="text-sm text-surface-600 mb-3">{{ widget.description }}</p>
            
            <div class="widget-preview" *ngIf="widget.key === 'IncidentTrend'">
              <div class="preview-chart">
                <div class="chart-line"></div>
                <div class="chart-line"></div>
                <div class="chart-line"></div>
              </div>
            </div>
            
            <div class="widget-preview" *ngIf="widget.key === 'KRIBreaches'">
              <div class="preview-bars">
                <div class="bar" style="height: 60%"></div>
                <div class="bar" style="height: 40%"></div>
                <div class="bar" style="height: 80%"></div>
                <div class="bar" style="height: 30%"></div>
              </div>
            </div>
            
            <div class="widget-preview" *ngIf="widget.key === 'ControlEffectiveness'">
              <div class="preview-radar">
                <div class="radar-center"></div>
                <div class="radar-point" style="top: 20%; left: 30%"></div>
                <div class="radar-point" style="top: 40%; left: 70%"></div>
                <div class="radar-point" style="top: 60%; left: 50%"></div>
              </div>
            </div>
            
            <div class="widget-preview" *ngIf="widget.key === 'AuditAging'">
              <div class="preview-pie">
                <div class="pie-slice" style="--rotation: 0deg; --percentage: 25%"></div>
                <div class="pie-slice" style="--rotation: 90deg; --percentage: 35%"></div>
                <div class="pie-slice" style="--rotation: 180deg; --percentage: 25%"></div>
                <div class="pie-slice" style="--rotation: 270deg; --percentage: 15%"></div>
              </div>
            </div>
            
            <div class="widget-preview" *ngIf="widget.key === 'AppetiteUtilization'">
              <div class="preview-progress">
                <div class="progress-item">
                  <div class="progress-bar" style="width: 60%"></div>
                </div>
                <div class="progress-item">
                  <div class="progress-bar" style="width: 80%"></div>
                </div>
                <div class="progress-item">
                  <div class="progress-bar" style="width: 45%"></div>
                </div>
              </div>
            </div>
            
            <div class="widget-preview" *ngIf="widget.key === 'RiskHeatmap'">
              <div class="preview-heatmap">
                <div class="heatmap-cell low"></div>
                <div class="heatmap-cell medium"></div>
                <div class="heatmap-cell high"></div>
                <div class="heatmap-cell critical"></div>
                <div class="heatmap-cell low"></div>
                <div class="heatmap-cell medium"></div>
                <div class="heatmap-cell high"></div>
                <div class="heatmap-cell critical"></div>
                <div class="heatmap-cell low"></div>
                <div class="heatmap-cell medium"></div>
                <div class="heatmap-cell high"></div>
                <div class="heatmap-cell critical"></div>
              </div>
            </div>
          </div>
          
          <div class="widget-card-footer">
            <button 
              pButton 
              type="button" 
              label="Add to Dashboard" 
              icon="pi pi-plus" 
              class="p-button-sm p-button-outlined w-full"
              (click)="onAddWidget(widget, $event)">
            </button>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div *ngIf="filteredWidgets.length === 0" class="empty-state">
        <i class="pi pi-search text-4xl text-surface-400 mb-3"></i>
        <h5 class="text-surface-600 mb-2">No widgets found</h5>
        <p class="text-surface-500">Try adjusting your search or filter criteria</p>
      </div>
    </div>
  `, isInline: true, styles: [".widget-library{height:100%;overflow-y:auto}.library-header{position:sticky;top:0;background:var(--surface-0);z-index:10;padding:1rem 0;border-bottom:1px solid var(--surface-200)}.widget-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;padding:1rem 0}.widget-card{border:1px solid var(--surface-200);border-radius:8px;padding:1rem;background:var(--surface-0);transition:all .3s ease;cursor:pointer}.widget-card:hover{border-color:var(--primary-color);box-shadow:0 4px 12px #0000001a;transform:translateY(-2px)}.widget-card.cdk-drag-preview{box-shadow:0 8px 24px #0003;transform:rotate(2deg)}.widget-card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem}.widget-category{font-size:.75rem;color:var(--surface-500);background:var(--surface-100);padding:.25rem .5rem;border-radius:4px}.widget-card-content{margin-bottom:1rem}.widget-preview{height:80px;background:var(--surface-50);border-radius:4px;margin:.5rem 0;position:relative;overflow:hidden}.preview-chart{height:100%;display:flex;align-items:end;padding:.5rem;gap:.25rem}.chart-line{flex:1;background:linear-gradient(to top,var(--primary-color),transparent);border-radius:2px;height:60%;animation:chartPulse 2s ease-in-out infinite}.chart-line:nth-child(2){height:40%;animation-delay:.5s}.chart-line:nth-child(3){height:80%;animation-delay:1s}.preview-bars{height:100%;display:flex;align-items:end;padding:.5rem;gap:.25rem}.bar{flex:1;background:var(--primary-color);border-radius:2px;animation:barGrow 1.5s ease-out}.preview-radar{height:100%;position:relative;display:flex;align-items:center;justify-content:center}.radar-center{width:40px;height:40px;border:2px solid var(--primary-color);border-radius:50%;position:relative}.radar-point{position:absolute;width:6px;height:6px;background:var(--primary-color);border-radius:50%}.preview-pie{height:100%;position:relative;display:flex;align-items:center;justify-content:center}.pie-slice{position:absolute;width:30px;height:30px;border-radius:50%;background:conic-gradient(var(--primary-color) 0deg var(--percentage),var(--surface-200) var(--percentage) 360deg);transform:rotate(var(--rotation))}.preview-progress{height:100%;padding:.5rem;display:flex;flex-direction:column;gap:.5rem}.progress-item{height:8px;background:var(--surface-200);border-radius:4px;overflow:hidden}.progress-bar{height:100%;background:var(--primary-color);border-radius:4px;animation:progressFill 2s ease-out}.preview-heatmap{height:100%;display:grid;grid-template-columns:repeat(4,1fr);gap:2px;padding:.5rem}.heatmap-cell{border-radius:2px}.heatmap-cell.low{background:#22c55e}.heatmap-cell.medium{background:#eab308}.heatmap-cell.high{background:#f97316}.heatmap-cell.critical{background:#ef4444}.widget-card-footer{margin-top:auto}.empty-state{text-align:center;padding:3rem 1rem}@keyframes chartPulse{0%,to{opacity:.7}50%{opacity:1}}@keyframes barGrow{0%{height:0}to{height:var(--height)}}@keyframes progressFill{0%{width:0}to{width:var(--width)}}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: CdkDrag, selector: "[cdkDrag]", inputs: ["cdkDragData", "cdkDragLockAxis", "cdkDragRootElement", "cdkDragBoundary", "cdkDragStartDelay", "cdkDragFreeDragPosition", "cdkDragDisabled", "cdkDragConstrainPosition", "cdkDragPreviewClass", "cdkDragPreviewContainer", "cdkDragScale"], outputs: ["cdkDragStarted", "cdkDragReleased", "cdkDragEnded", "cdkDragEntered", "cdkDragExited", "cdkDragDropped", "cdkDragMoved"], exportAs: ["cdkDrag"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i2.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i2.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i2.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "ngmodule", type: InputTextModule }, { kind: "directive", type: i7.InputText, selector: "[pInputText]", inputs: ["variant", "fluid", "pSize"] }, { kind: "ngmodule", type: DropdownModule }, { kind: "component", type: i5$1.Dropdown, selector: "p-dropdown", inputs: ["id", "scrollHeight", "filter", "name", "style", "panelStyle", "styleClass", "panelStyleClass", "readonly", "required", "editable", "appendTo", "tabindex", "placeholder", "loadingIcon", "filterPlaceholder", "filterLocale", "variant", "inputId", "dataKey", "filterBy", "filterFields", "autofocus", "resetFilterOnHide", "checkmark", "dropdownIcon", "loading", "optionLabel", "optionValue", "optionDisabled", "optionGroupLabel", "optionGroupChildren", "autoDisplayFirst", "group", "showClear", "emptyFilterMessage", "emptyMessage", "lazy", "virtualScroll", "virtualScrollItemSize", "virtualScrollOptions", "overlayOptions", "ariaFilterLabel", "ariaLabel", "ariaLabelledBy", "filterMatchMode", "maxlength", "tooltip", "tooltipPosition", "tooltipPositionStyle", "tooltipStyleClass", "focusOnHover", "selectOnFocus", "autoOptionFocus", "autofocusFilter", "fluid", "disabled", "itemSize", "autoZIndex", "baseZIndex", "showTransitionOptions", "hideTransitionOptions", "filterValue", "options"], outputs: ["onChange", "onFilter", "onFocus", "onBlur", "onClick", "onShow", "onHide", "onClear", "onLazyLoad"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: WidgetLibraryComponent, decorators: [{
            type: Component,
            args: [{ selector: 'app-widget-library', standalone: true, imports: [CommonModule, CdkDrag, FormsModule, InputTextModule, DropdownModule], template: `
    <div class="widget-library">
      <!-- Library Header -->
      <div class="library-header mb-4">
        <div class="flex justify-content-between align-items-center mb-3">
          <h4 class="m-0">Widget Library</h4>
          <button 
            pButton 
            type="button" 
            icon="pi pi-times" 
            class="p-button-text p-button-sm"
            (click)="onClose()"
            pTooltip="Close Library">
          </button>
        </div>
        
        <!-- Search and Filter -->
        <div class="flex gap-3 mb-4">
          <div class="flex-1">
            <input 
              type="text" 
              pInputText 
              placeholder="Search widgets..." 
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()"
              class="w-full">
          </div>
          <p-dropdown 
            [options]="categoryOptions" 
            [(ngModel)]="selectedCategory"
            (ngModelChange)="onCategoryChange()"
            placeholder="All Categories"
            [showClear]="true"
            styleClass="w-12rem">
          </p-dropdown>
        </div>
      </div>

      <!-- Widget Grid -->
      <div class="widget-grid">
        <div 
          *ngFor="let widget of filteredWidgets; trackBy: trackByWidgetKey"
          cdkDrag
          [cdkDragData]="widget"
          class="widget-card"
          (click)="onWidgetClick(widget)">
          
          <div class="widget-card-header">
            <div class="flex align-items-center gap-2">
              <i [class]="widget.icon" class="text-primary"></i>
              <h6 class="m-0">{{ widget.label }}</h6>
            </div>
            <span class="widget-category">{{ getCategoryLabel(widget.category) }}</span>
          </div>
          
          <div class="widget-card-content">
            <p class="text-sm text-surface-600 mb-3">{{ widget.description }}</p>
            
            <div class="widget-preview" *ngIf="widget.key === 'IncidentTrend'">
              <div class="preview-chart">
                <div class="chart-line"></div>
                <div class="chart-line"></div>
                <div class="chart-line"></div>
              </div>
            </div>
            
            <div class="widget-preview" *ngIf="widget.key === 'KRIBreaches'">
              <div class="preview-bars">
                <div class="bar" style="height: 60%"></div>
                <div class="bar" style="height: 40%"></div>
                <div class="bar" style="height: 80%"></div>
                <div class="bar" style="height: 30%"></div>
              </div>
            </div>
            
            <div class="widget-preview" *ngIf="widget.key === 'ControlEffectiveness'">
              <div class="preview-radar">
                <div class="radar-center"></div>
                <div class="radar-point" style="top: 20%; left: 30%"></div>
                <div class="radar-point" style="top: 40%; left: 70%"></div>
                <div class="radar-point" style="top: 60%; left: 50%"></div>
              </div>
            </div>
            
            <div class="widget-preview" *ngIf="widget.key === 'AuditAging'">
              <div class="preview-pie">
                <div class="pie-slice" style="--rotation: 0deg; --percentage: 25%"></div>
                <div class="pie-slice" style="--rotation: 90deg; --percentage: 35%"></div>
                <div class="pie-slice" style="--rotation: 180deg; --percentage: 25%"></div>
                <div class="pie-slice" style="--rotation: 270deg; --percentage: 15%"></div>
              </div>
            </div>
            
            <div class="widget-preview" *ngIf="widget.key === 'AppetiteUtilization'">
              <div class="preview-progress">
                <div class="progress-item">
                  <div class="progress-bar" style="width: 60%"></div>
                </div>
                <div class="progress-item">
                  <div class="progress-bar" style="width: 80%"></div>
                </div>
                <div class="progress-item">
                  <div class="progress-bar" style="width: 45%"></div>
                </div>
              </div>
            </div>
            
            <div class="widget-preview" *ngIf="widget.key === 'RiskHeatmap'">
              <div class="preview-heatmap">
                <div class="heatmap-cell low"></div>
                <div class="heatmap-cell medium"></div>
                <div class="heatmap-cell high"></div>
                <div class="heatmap-cell critical"></div>
                <div class="heatmap-cell low"></div>
                <div class="heatmap-cell medium"></div>
                <div class="heatmap-cell high"></div>
                <div class="heatmap-cell critical"></div>
                <div class="heatmap-cell low"></div>
                <div class="heatmap-cell medium"></div>
                <div class="heatmap-cell high"></div>
                <div class="heatmap-cell critical"></div>
              </div>
            </div>
          </div>
          
          <div class="widget-card-footer">
            <button 
              pButton 
              type="button" 
              label="Add to Dashboard" 
              icon="pi pi-plus" 
              class="p-button-sm p-button-outlined w-full"
              (click)="onAddWidget(widget, $event)">
            </button>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div *ngIf="filteredWidgets.length === 0" class="empty-state">
        <i class="pi pi-search text-4xl text-surface-400 mb-3"></i>
        <h5 class="text-surface-600 mb-2">No widgets found</h5>
        <p class="text-surface-500">Try adjusting your search or filter criteria</p>
      </div>
    </div>
  `, styles: [".widget-library{height:100%;overflow-y:auto}.library-header{position:sticky;top:0;background:var(--surface-0);z-index:10;padding:1rem 0;border-bottom:1px solid var(--surface-200)}.widget-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;padding:1rem 0}.widget-card{border:1px solid var(--surface-200);border-radius:8px;padding:1rem;background:var(--surface-0);transition:all .3s ease;cursor:pointer}.widget-card:hover{border-color:var(--primary-color);box-shadow:0 4px 12px #0000001a;transform:translateY(-2px)}.widget-card.cdk-drag-preview{box-shadow:0 8px 24px #0003;transform:rotate(2deg)}.widget-card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem}.widget-category{font-size:.75rem;color:var(--surface-500);background:var(--surface-100);padding:.25rem .5rem;border-radius:4px}.widget-card-content{margin-bottom:1rem}.widget-preview{height:80px;background:var(--surface-50);border-radius:4px;margin:.5rem 0;position:relative;overflow:hidden}.preview-chart{height:100%;display:flex;align-items:end;padding:.5rem;gap:.25rem}.chart-line{flex:1;background:linear-gradient(to top,var(--primary-color),transparent);border-radius:2px;height:60%;animation:chartPulse 2s ease-in-out infinite}.chart-line:nth-child(2){height:40%;animation-delay:.5s}.chart-line:nth-child(3){height:80%;animation-delay:1s}.preview-bars{height:100%;display:flex;align-items:end;padding:.5rem;gap:.25rem}.bar{flex:1;background:var(--primary-color);border-radius:2px;animation:barGrow 1.5s ease-out}.preview-radar{height:100%;position:relative;display:flex;align-items:center;justify-content:center}.radar-center{width:40px;height:40px;border:2px solid var(--primary-color);border-radius:50%;position:relative}.radar-point{position:absolute;width:6px;height:6px;background:var(--primary-color);border-radius:50%}.preview-pie{height:100%;position:relative;display:flex;align-items:center;justify-content:center}.pie-slice{position:absolute;width:30px;height:30px;border-radius:50%;background:conic-gradient(var(--primary-color) 0deg var(--percentage),var(--surface-200) var(--percentage) 360deg);transform:rotate(var(--rotation))}.preview-progress{height:100%;padding:.5rem;display:flex;flex-direction:column;gap:.5rem}.progress-item{height:8px;background:var(--surface-200);border-radius:4px;overflow:hidden}.progress-bar{height:100%;background:var(--primary-color);border-radius:4px;animation:progressFill 2s ease-out}.preview-heatmap{height:100%;display:grid;grid-template-columns:repeat(4,1fr);gap:2px;padding:.5rem}.heatmap-cell{border-radius:2px}.heatmap-cell.low{background:#22c55e}.heatmap-cell.medium{background:#eab308}.heatmap-cell.high{background:#f97316}.heatmap-cell.critical{background:#ef4444}.widget-card-footer{margin-top:auto}.empty-state{text-align:center;padding:3rem 1rem}@keyframes chartPulse{0%,to{opacity:.7}50%{opacity:1}}@keyframes barGrow{0%{height:0}to{height:var(--height)}}@keyframes progressFill{0%{width:0}to{width:var(--width)}}\n"] }]
        }] });

class ConfigurationPanelComponent {
    dashboardService = inject(DashboardService);
    widgetService = inject(WidgetService);
    fb = inject(FormBuilder);
    selectedWidget = null;
    configForm;
    seriesList = [];
    bandsList = [];
    // Options for dropdowns
    chartTypeOptions = [
        { label: 'Line Chart', value: 'line' },
        { label: 'Area Chart', value: 'area' },
        { label: 'Bar Chart', value: 'bar' },
        { label: 'Pie Chart', value: 'pie' },
        { label: 'Radar Chart', value: 'radar' },
        { label: 'Heatmap', value: 'heatmap' },
        { label: 'Progress Bars', value: 'progress' }
    ];
    datasetOptions = [
        { label: 'Incident Trend', value: 'incident-trend' },
        { label: 'KRI Breaches', value: 'kri-breaches' },
        { label: 'Control Effectiveness', value: 'control-effectiveness' },
        { label: 'Loss Events', value: 'loss-events' },
        { label: 'Audit Aging', value: 'audit-aging' },
        { label: 'Appetite Utilization', value: 'appetite-utilization' },
        { label: 'Risk Heatmap', value: 'risk-heatmap' }
    ];
    xFieldOptions = [];
    seriesTypeOptions = [
        { label: 'Line', value: 'line' },
        { label: 'Area', value: 'area' },
        { label: 'Bar', value: 'bar' }
    ];
    yAxisOptions = [
        { label: 'Left Axis', value: 'left' },
        { label: 'Right Axis', value: 'right' }
    ];
    roleOptions = [
        { label: 'Risk Manager', value: 'Risk Manager' },
        { label: 'Executive', value: 'Executive' },
        { label: 'Compliance Officer', value: 'Compliance Officer' },
        { label: 'Auditor', value: 'Auditor' },
        { label: 'Analyst', value: 'Analyst' }
    ];
    refreshOptions = [
        { label: 'Real-time', value: 'realtime' },
        { label: 'Daily', value: 'daily' },
        { label: 'Monthly', value: 'monthly' }
    ];
    subscriptions = [];
    ngOnInit() {
        this.initializeForm();
        this.subscriptions.push(this.widgetService.selectedWidget$.subscribe(widget => {
            this.selectedWidget = widget;
            if (widget) {
                this.loadWidgetConfiguration(widget);
            }
        }));
    }
    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
    initializeForm() {
        this.configForm = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            type: ['line', Validators.required],
            dataset: ['incident-trend', Validators.required],
            xField: ['', Validators.required],
            showLegend: [true],
            showGrid: [true],
            showTooltip: [true],
            stacked: [false],
            roles: [[]],
            refresh: ['monthly']
        });
    }
    loadWidgetConfiguration(widget) {
        this.configForm.patchValue({
            name: widget.name,
            description: widget.description,
            type: widget.type,
            dataset: widget.dataset,
            xField: widget.xField,
            showLegend: widget.showLegend,
            showGrid: widget.showGrid,
            showTooltip: widget.showTooltip,
            stacked: widget.stacked,
            roles: widget.roles,
            refresh: widget.refresh
        });
        this.seriesList = [...widget.series];
        this.bandsList = [...widget.appetiteBands];
        this.updateFieldOptions();
    }
    updateFieldOptions() {
        const dataset = this.configForm.get('dataset')?.value;
        if (dataset) {
            this.xFieldOptions = this.widgetService.getAvailableFields(dataset).map(field => ({
                label: field,
                value: field
            }));
        }
    }
    onAddSeries() {
        const newSeries = {
            id: this.generateId(),
            label: `Series ${this.seriesList.length + 1}`,
            field: 'value',
            type: 'line',
            yAxis: 'left'
        };
        this.seriesList.push(newSeries);
        this.updateWidgetSeries();
    }
    onRemoveSeries(seriesId) {
        this.seriesList = this.seriesList.filter(s => s.id !== seriesId);
        this.updateWidgetSeries();
    }
    onSeriesChange(seriesId, field, value) {
        const series = this.seriesList.find(s => s.id === seriesId);
        if (series) {
            series[field] = value;
            this.updateWidgetSeries();
        }
    }
    onAddBand() {
        const newBand = {
            id: this.generateId(),
            value: 50,
            label: `Band ${this.bandsList.length + 1}`,
            dashed: false
        };
        this.bandsList.push(newBand);
        this.updateWidgetBands();
    }
    onRemoveBand(bandId) {
        this.bandsList = this.bandsList.filter(b => b.id !== bandId);
        this.updateWidgetBands();
    }
    onBandChange(bandId, field, value) {
        const band = this.bandsList.find(b => b.id === bandId);
        if (band) {
            band[field] = value;
            this.updateWidgetBands();
        }
    }
    updateWidgetSeries() {
        if (this.selectedWidget) {
            this.dashboardService.updateWidget(this.selectedWidget.id, { series: this.seriesList });
        }
    }
    updateWidgetBands() {
        if (this.selectedWidget) {
            this.dashboardService.updateWidget(this.selectedWidget.id, { appetiteBands: this.bandsList });
        }
    }
    onSave() {
        if (this.configForm.valid && this.selectedWidget) {
            const formValue = this.configForm.value;
            this.dashboardService.updateWidget(this.selectedWidget.id, {
                name: formValue.name,
                description: formValue.description,
                type: formValue.type,
                dataset: formValue.dataset,
                xField: formValue.xField,
                showLegend: formValue.showLegend,
                showGrid: formValue.showGrid,
                showTooltip: formValue.showTooltip,
                stacked: formValue.stacked,
                roles: formValue.roles,
                refresh: formValue.refresh
            });
            this.onClose();
        }
    }
    onCancel() {
        this.onClose();
    }
    onClose() {
        this.widgetService.stopConfiguration();
    }
    getFieldOptions() {
        const dataset = this.configForm.get('dataset')?.value;
        if (dataset) {
            return this.widgetService.getAvailableFields(dataset).map(field => ({
                label: field,
                value: field
            }));
        }
        return [];
    }
    trackBySeriesId(index, series) {
        return series.id;
    }
    trackByBandId(index, band) {
        return band.id;
    }
    generateId() {
        return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: ConfigurationPanelComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.15", type: ConfigurationPanelComponent, isStandalone: true, selector: "app-configuration-panel", ngImport: i0, template: `
    <div class="configuration-panel" *ngIf="selectedWidget">
      <!-- Panel Header -->
      <div class="panel-header">
        <h4 class="m-0">Configure Widget</h4>
        <button 
          pButton 
          type="button" 
          icon="pi pi-times" 
          class="close-btn p-button-text p-button-sm"
          (click)="onClose()"
          pTooltip="Close Configuration">
        </button>
        <p class="text-sm text-surface-500 m-0 mt-1">{{ selectedWidget.name }}</p>
      </div>

      <!-- Configuration Form -->
      <div class="panel-content">
        <form [formGroup]="configForm" (ngSubmit)="onSave()">
          <p-tabView>
            <!-- Basic Settings -->
            <p-tabPanel header="Basic">
              <div class="form-grid">
                <div class="field">
                  <label for="name">Widget Name</label>
                  <input 
                    type="text" 
                    id="name"
                    pInputText 
                    formControlName="name"
                    placeholder="Enter widget name">
                </div>
                
                <div class="field">
                  <label for="description">Description</label>
                  <textarea 
                    id="description"
                    pInputTextarea 
                    formControlName="description"
                    placeholder="Enter widget description"
                    rows="3">
                  </textarea>
                </div>
                
                <div class="field">
                  <label for="type">Chart Type</label>
                  <p-dropdown 
                    id="type"
                    [options]="chartTypeOptions" 
                    formControlName="type"
                    placeholder="Select chart type">
                  </p-dropdown>
                </div>
                
                <div class="field">
                  <label for="dataset">Data Source</label>
                  <p-dropdown 
                    id="dataset"
                    [options]="datasetOptions" 
                    formControlName="dataset"
                    placeholder="Select dataset">
                  </p-dropdown>
                </div>
              </div>
            </p-tabPanel>

            <!-- Data Configuration -->
            <p-tabPanel header="Data">
              <div class="form-section">
                <h5>X-Axis Configuration</h5>
                <div class="field">
                  <label for="xField">X-Axis Field</label>
                  <p-dropdown 
                    id="xField"
                    [options]="xFieldOptions" 
                    formControlName="xField"
                    placeholder="Select X-axis field">
                  </p-dropdown>
                </div>
              </div>

              <p-divider></p-divider>

              <div class="form-section">
                <div class="flex justify-content-between align-items-center mb-3">
                  <h5>Data Series</h5>
                  <button 
                    pButton 
                    type="button" 
                    label="Add Series" 
                    icon="pi pi-plus" 
                    class="p-button-outlined p-button-sm"
                    (click)="onAddSeries()">
                  </button>
                </div>
                
                <div class="series-list">
                  <div 
                    *ngFor="let series of seriesList; let i = index; trackBy: trackBySeriesId"
                    class="series-item">
                    <div class="series-header">
                      <h6>Series {{ i + 1 }}</h6>
                      <button 
                        pButton 
                        type="button" 
                        icon="pi pi-trash" 
                        class="p-button-text p-button-sm p-button-danger"
                        (click)="onRemoveSeries(series.id)">
                      </button>
                    </div>
                    
                    <div class="form-grid">
                      <div class="field">
                        <label>Label</label>
                        <input 
                          type="text" 
                          pInputText 
                          [(ngModel)]="series.label"
                          (ngModelChange)="onSeriesChange(series.id, 'label', $event)"
                          placeholder="Series label">
                      </div>
                      
                      <div class="field">
                        <label>Field</label>
                        <p-dropdown 
                          [options]="getFieldOptions()" 
                          [(ngModel)]="series.field"
                          (ngModelChange)="onSeriesChange(series.id, 'field', $event)"
                          placeholder="Select field">
                        </p-dropdown>
                      </div>
                      
                      <div class="field">
                        <label>Type</label>
                        <p-dropdown 
                          [options]="seriesTypeOptions" 
                          [(ngModel)]="series.type"
                          (ngModelChange)="onSeriesChange(series.id, 'type', $event)"
                          placeholder="Select type">
                        </p-dropdown>
                      </div>
                      
                      <div class="field">
                        <label>Y-Axis</label>
                        <p-dropdown 
                          [options]="yAxisOptions" 
                          [(ngModel)]="series.yAxis"
                          (ngModelChange)="onSeriesChange(series.id, 'yAxis', $event)"
                          placeholder="Select Y-axis">
                        </p-dropdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </p-tabPanel>

            <!-- Display Options -->
            <p-tabPanel header="Display">
              <div class="form-section">
                <h5>Chart Options</h5>
                <div class="form-grid">
                  <div class="field-checkbox">
                    <p-checkbox 
                      formControlName="showLegend" 
                      inputId="showLegend">
                    </p-checkbox>
                    <label for="showLegend">Show Legend</label>
                  </div>
                  
                  <div class="field-checkbox">
                    <p-checkbox 
                      formControlName="showGrid" 
                      inputId="showGrid">
                    </p-checkbox>
                    <label for="showGrid">Show Grid</label>
                  </div>
                  
                  <div class="field-checkbox">
                    <p-checkbox 
                      formControlName="showTooltip" 
                      inputId="showTooltip">
                    </p-checkbox>
                    <label for="showTooltip">Show Tooltip</label>
                  </div>
                  
                  <div class="field-checkbox">
                    <p-checkbox 
                      formControlName="stacked" 
                      inputId="stacked">
                    </p-checkbox>
                    <label for="stacked">Stack Series</label>
                  </div>
                </div>
              </div>

              <p-divider></p-divider>

              <div class="form-section">
                <div class="flex justify-content-between align-items-center mb-3">
                  <h5>Appetite Bands</h5>
                  <button 
                    pButton 
                    type="button" 
                    label="Add Band" 
                    icon="pi pi-plus" 
                    class="p-button-outlined p-button-sm"
                    (click)="onAddBand()">
                  </button>
                </div>
                
                <div class="bands-list">
                  <div 
                    *ngFor="let band of bandsList; let i = index; trackBy: trackByBandId"
                    class="band-item">
                    <div class="band-header">
                      <h6>Band {{ i + 1 }}</h6>
                      <button 
                        pButton 
                        type="button" 
                        icon="pi pi-trash" 
                        class="p-button-text p-button-sm p-button-danger"
                        (click)="onRemoveBand(band.id)">
                      </button>
                    </div>
                    
                    <div class="form-grid">
                      <div class="field">
                        <label>Value</label>
                        <input 
                          type="number" 
                          pInputText 
                          [(ngModel)]="band.value"
                          (ngModelChange)="onBandChange(band.id, 'value', $event)"
                          placeholder="Band value">
                      </div>
                      
                      <div class="field">
                        <label>Label</label>
                        <input 
                          type="text" 
                          pInputText 
                          [(ngModel)]="band.label"
                          (ngModelChange)="onBandChange(band.id, 'label', $event)"
                          placeholder="Band label">
                      </div>
                      
                      <div class="field-checkbox">
                        <p-checkbox 
                          [(ngModel)]="band.dashed"
                          (ngModelChange)="onBandChange(band.id, 'dashed', $event)"
                          inputId="dashed{{ i }}">
                        </p-checkbox>
                        <label for="dashed{{ i }}">Dashed Line</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </p-tabPanel>

            <!-- Security & Refresh -->
            <p-tabPanel header="Security">
              <div class="form-section">
                <h5>Access Control</h5>
                <div class="field">
                  <label for="roles">Allowed Roles</label>
                  <p-multiSelect 
                    id="roles"
                    [options]="roleOptions" 
                    formControlName="roles"
                    placeholder="Select roles">
                  </p-multiSelect>
                </div>
              </div>

              <p-divider></p-divider>

              <div class="form-section">
                <h5>Refresh Settings</h5>
                <div class="field">
                  <label for="refresh">Refresh Frequency</label>
                  <p-dropdown 
                    id="refresh"
                    [options]="refreshOptions" 
                    formControlName="refresh"
                    placeholder="Select refresh frequency">
                  </p-dropdown>
                </div>
              </div>
            </p-tabPanel>
          </p-tabView>

          <!-- Form Actions -->
          <div class="form-actions">
            <button 
              pButton 
              type="button" 
              label="Cancel" 
              class="p-button-outlined"
              (click)="onCancel()">
            </button>
            <button 
              pButton 
              type="submit" 
              label="Save Changes" 
              class="p-button"
              [disabled]="!configForm.valid">
            </button>
          </div>
        </form>
      </div>
    </div>
  `, isInline: true, styles: [".configuration-panel{height:100%;display:flex;flex-direction:column;background:var(--surface-0);border-left:1px solid var(--surface-200)}.panel-header{position:relative;padding:1rem;border-bottom:1px solid var(--surface-200);background:var(--surface-50)}.panel-header h4{margin:0}.close-btn{position:absolute;top:.75rem;right:.75rem}.panel-content{flex:1;overflow-y:auto;padding:1rem}.form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem;margin-bottom:1rem}.form-section{margin-bottom:2rem}.field{display:flex;flex-direction:column;gap:.5rem}.field-checkbox{display:flex;align-items:center;gap:.5rem}.field label{font-weight:500;color:var(--text-color)}.series-list,.bands-list{display:flex;flex-direction:column;gap:1rem}.series-item,.band-item{border:1px solid var(--surface-200);border-radius:8px;padding:1rem;background:var(--surface-50)}.series-header,.band-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}.series-header h6,.band-header h6{margin:0;color:var(--text-color)}.form-actions{display:flex;justify-content:flex-end;gap:1rem;padding:1rem;border-top:1px solid var(--surface-200);background:var(--surface-50)}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i2.ɵNgNoValidate, selector: "form:not([ngNoForm]):not([ngNativeValidate])" }, { kind: "directive", type: i2.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i2.NumberValueAccessor, selector: "input[type=number][formControlName],input[type=number][formControl],input[type=number][ngModel]" }, { kind: "directive", type: i2.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i2.NgControlStatusGroup, selector: "[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]" }, { kind: "directive", type: i2.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "ngmodule", type: ReactiveFormsModule }, { kind: "directive", type: i2.FormGroupDirective, selector: "[formGroup]", inputs: ["formGroup"], outputs: ["ngSubmit"], exportAs: ["ngForm"] }, { kind: "directive", type: i2.FormControlName, selector: "[formControlName]", inputs: ["formControlName", "disabled", "ngModel"], outputs: ["ngModelChange"] }, { kind: "ngmodule", type: TabViewModule }, { kind: "component", type: i5.TabView, selector: "p-tabView, p-tabview", inputs: ["style", "styleClass", "controlClose", "scrollable", "activeIndex", "selectOnFocus", "nextButtonAriaLabel", "prevButtonAriaLabel", "autoHideButtons", "tabindex"], outputs: ["onChange", "onClose", "activeIndexChange"] }, { kind: "component", type: i5.TabPanel, selector: "p-tabPanel, p-tabpanel", inputs: ["closable", "headerStyle", "headerStyleClass", "cache", "tooltip", "tooltipPosition", "tooltipPositionStyle", "tooltipStyleClass", "selected", "disabled", "header", "leftIcon", "rightIcon"] }, { kind: "ngmodule", type: InputTextModule }, { kind: "directive", type: i7.InputText, selector: "[pInputText]", inputs: ["variant", "fluid", "pSize"] }, { kind: "directive", type: InputTextarea, selector: "[pInputTextarea]", inputs: ["autoResize", "variant", "fluid"], outputs: ["onResize"] }, { kind: "ngmodule", type: DropdownModule }, { kind: "component", type: i5$1.Dropdown, selector: "p-dropdown", inputs: ["id", "scrollHeight", "filter", "name", "style", "panelStyle", "styleClass", "panelStyleClass", "readonly", "required", "editable", "appendTo", "tabindex", "placeholder", "loadingIcon", "filterPlaceholder", "filterLocale", "variant", "inputId", "dataKey", "filterBy", "filterFields", "autofocus", "resetFilterOnHide", "checkmark", "dropdownIcon", "loading", "optionLabel", "optionValue", "optionDisabled", "optionGroupLabel", "optionGroupChildren", "autoDisplayFirst", "group", "showClear", "emptyFilterMessage", "emptyMessage", "lazy", "virtualScroll", "virtualScrollItemSize", "virtualScrollOptions", "overlayOptions", "ariaFilterLabel", "ariaLabel", "ariaLabelledBy", "filterMatchMode", "maxlength", "tooltip", "tooltipPosition", "tooltipPositionStyle", "tooltipStyleClass", "focusOnHover", "selectOnFocus", "autoOptionFocus", "autofocusFilter", "fluid", "disabled", "itemSize", "autoZIndex", "baseZIndex", "showTransitionOptions", "hideTransitionOptions", "filterValue", "options"], outputs: ["onChange", "onFilter", "onFocus", "onBlur", "onClick", "onShow", "onHide", "onClear", "onLazyLoad"] }, { kind: "ngmodule", type: MultiSelectModule }, { kind: "component", type: i6$1.MultiSelect, selector: "p-multiSelect, p-multiselect, p-multi-select", inputs: ["id", "ariaLabel", "style", "styleClass", "panelStyle", "panelStyleClass", "inputId", "disabled", "fluid", "readonly", "group", "filter", "filterPlaceHolder", "filterLocale", "overlayVisible", "tabindex", "variant", "appendTo", "dataKey", "name", "ariaLabelledBy", "displaySelectedLabel", "maxSelectedLabels", "selectionLimit", "selectedItemsLabel", "showToggleAll", "emptyFilterMessage", "emptyMessage", "resetFilterOnHide", "dropdownIcon", "chipIcon", "optionLabel", "optionValue", "optionDisabled", "optionGroupLabel", "optionGroupChildren", "showHeader", "filterBy", "scrollHeight", "lazy", "virtualScroll", "loading", "virtualScrollItemSize", "loadingIcon", "virtualScrollOptions", "overlayOptions", "ariaFilterLabel", "filterMatchMode", "tooltip", "tooltipPosition", "tooltipPositionStyle", "tooltipStyleClass", "autofocusFilter", "display", "autocomplete", "size", "showClear", "autofocus", "autoZIndex", "baseZIndex", "showTransitionOptions", "hideTransitionOptions", "defaultLabel", "placeholder", "options", "filterValue", "itemSize", "selectAll", "focusOnHover", "filterFields", "selectOnFocus", "autoOptionFocus", "highlightOnSelect"], outputs: ["onChange", "onFilter", "onFocus", "onBlur", "onClick", "onClear", "onPanelShow", "onPanelHide", "onLazyLoad", "onRemove", "onSelectAllChange"] }, { kind: "ngmodule", type: CheckboxModule }, { kind: "component", type: i7$1.Checkbox, selector: "p-checkbox, p-checkBox, p-check-box", inputs: ["value", "name", "disabled", "binary", "ariaLabelledBy", "ariaLabel", "tabindex", "inputId", "style", "inputStyle", "styleClass", "inputClass", "indeterminate", "size", "formControl", "checkboxIcon", "readonly", "required", "autofocus", "trueValue", "falseValue", "variant"], outputs: ["onChange", "onFocus", "onBlur"] }, { kind: "ngmodule", type: SliderModule }, { kind: "ngmodule", type: ButtonModule }, { kind: "directive", type: i8.ButtonDirective, selector: "[pButton]", inputs: ["iconPos", "loadingIcon", "loading", "severity", "raised", "rounded", "text", "outlined", "size", "plain", "fluid", "label", "icon", "buttonProps"] }, { kind: "ngmodule", type: CardModule }, { kind: "ngmodule", type: DividerModule }, { kind: "component", type: i9.Divider, selector: "p-divider", inputs: ["style", "styleClass", "layout", "type", "align"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: ConfigurationPanelComponent, decorators: [{
            type: Component,
            args: [{ selector: 'app-configuration-panel', standalone: true, imports: [
                        CommonModule,
                        FormsModule,
                        ReactiveFormsModule,
                        TabViewModule,
                        InputTextModule,
                        InputTextarea,
                        DropdownModule,
                        MultiSelectModule,
                        CheckboxModule,
                        SliderModule,
                        ButtonModule,
                        CardModule,
                        DividerModule
                    ], template: `
    <div class="configuration-panel" *ngIf="selectedWidget">
      <!-- Panel Header -->
      <div class="panel-header">
        <h4 class="m-0">Configure Widget</h4>
        <button 
          pButton 
          type="button" 
          icon="pi pi-times" 
          class="close-btn p-button-text p-button-sm"
          (click)="onClose()"
          pTooltip="Close Configuration">
        </button>
        <p class="text-sm text-surface-500 m-0 mt-1">{{ selectedWidget.name }}</p>
      </div>

      <!-- Configuration Form -->
      <div class="panel-content">
        <form [formGroup]="configForm" (ngSubmit)="onSave()">
          <p-tabView>
            <!-- Basic Settings -->
            <p-tabPanel header="Basic">
              <div class="form-grid">
                <div class="field">
                  <label for="name">Widget Name</label>
                  <input 
                    type="text" 
                    id="name"
                    pInputText 
                    formControlName="name"
                    placeholder="Enter widget name">
                </div>
                
                <div class="field">
                  <label for="description">Description</label>
                  <textarea 
                    id="description"
                    pInputTextarea 
                    formControlName="description"
                    placeholder="Enter widget description"
                    rows="3">
                  </textarea>
                </div>
                
                <div class="field">
                  <label for="type">Chart Type</label>
                  <p-dropdown 
                    id="type"
                    [options]="chartTypeOptions" 
                    formControlName="type"
                    placeholder="Select chart type">
                  </p-dropdown>
                </div>
                
                <div class="field">
                  <label for="dataset">Data Source</label>
                  <p-dropdown 
                    id="dataset"
                    [options]="datasetOptions" 
                    formControlName="dataset"
                    placeholder="Select dataset">
                  </p-dropdown>
                </div>
              </div>
            </p-tabPanel>

            <!-- Data Configuration -->
            <p-tabPanel header="Data">
              <div class="form-section">
                <h5>X-Axis Configuration</h5>
                <div class="field">
                  <label for="xField">X-Axis Field</label>
                  <p-dropdown 
                    id="xField"
                    [options]="xFieldOptions" 
                    formControlName="xField"
                    placeholder="Select X-axis field">
                  </p-dropdown>
                </div>
              </div>

              <p-divider></p-divider>

              <div class="form-section">
                <div class="flex justify-content-between align-items-center mb-3">
                  <h5>Data Series</h5>
                  <button 
                    pButton 
                    type="button" 
                    label="Add Series" 
                    icon="pi pi-plus" 
                    class="p-button-outlined p-button-sm"
                    (click)="onAddSeries()">
                  </button>
                </div>
                
                <div class="series-list">
                  <div 
                    *ngFor="let series of seriesList; let i = index; trackBy: trackBySeriesId"
                    class="series-item">
                    <div class="series-header">
                      <h6>Series {{ i + 1 }}</h6>
                      <button 
                        pButton 
                        type="button" 
                        icon="pi pi-trash" 
                        class="p-button-text p-button-sm p-button-danger"
                        (click)="onRemoveSeries(series.id)">
                      </button>
                    </div>
                    
                    <div class="form-grid">
                      <div class="field">
                        <label>Label</label>
                        <input 
                          type="text" 
                          pInputText 
                          [(ngModel)]="series.label"
                          (ngModelChange)="onSeriesChange(series.id, 'label', $event)"
                          placeholder="Series label">
                      </div>
                      
                      <div class="field">
                        <label>Field</label>
                        <p-dropdown 
                          [options]="getFieldOptions()" 
                          [(ngModel)]="series.field"
                          (ngModelChange)="onSeriesChange(series.id, 'field', $event)"
                          placeholder="Select field">
                        </p-dropdown>
                      </div>
                      
                      <div class="field">
                        <label>Type</label>
                        <p-dropdown 
                          [options]="seriesTypeOptions" 
                          [(ngModel)]="series.type"
                          (ngModelChange)="onSeriesChange(series.id, 'type', $event)"
                          placeholder="Select type">
                        </p-dropdown>
                      </div>
                      
                      <div class="field">
                        <label>Y-Axis</label>
                        <p-dropdown 
                          [options]="yAxisOptions" 
                          [(ngModel)]="series.yAxis"
                          (ngModelChange)="onSeriesChange(series.id, 'yAxis', $event)"
                          placeholder="Select Y-axis">
                        </p-dropdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </p-tabPanel>

            <!-- Display Options -->
            <p-tabPanel header="Display">
              <div class="form-section">
                <h5>Chart Options</h5>
                <div class="form-grid">
                  <div class="field-checkbox">
                    <p-checkbox 
                      formControlName="showLegend" 
                      inputId="showLegend">
                    </p-checkbox>
                    <label for="showLegend">Show Legend</label>
                  </div>
                  
                  <div class="field-checkbox">
                    <p-checkbox 
                      formControlName="showGrid" 
                      inputId="showGrid">
                    </p-checkbox>
                    <label for="showGrid">Show Grid</label>
                  </div>
                  
                  <div class="field-checkbox">
                    <p-checkbox 
                      formControlName="showTooltip" 
                      inputId="showTooltip">
                    </p-checkbox>
                    <label for="showTooltip">Show Tooltip</label>
                  </div>
                  
                  <div class="field-checkbox">
                    <p-checkbox 
                      formControlName="stacked" 
                      inputId="stacked">
                    </p-checkbox>
                    <label for="stacked">Stack Series</label>
                  </div>
                </div>
              </div>

              <p-divider></p-divider>

              <div class="form-section">
                <div class="flex justify-content-between align-items-center mb-3">
                  <h5>Appetite Bands</h5>
                  <button 
                    pButton 
                    type="button" 
                    label="Add Band" 
                    icon="pi pi-plus" 
                    class="p-button-outlined p-button-sm"
                    (click)="onAddBand()">
                  </button>
                </div>
                
                <div class="bands-list">
                  <div 
                    *ngFor="let band of bandsList; let i = index; trackBy: trackByBandId"
                    class="band-item">
                    <div class="band-header">
                      <h6>Band {{ i + 1 }}</h6>
                      <button 
                        pButton 
                        type="button" 
                        icon="pi pi-trash" 
                        class="p-button-text p-button-sm p-button-danger"
                        (click)="onRemoveBand(band.id)">
                      </button>
                    </div>
                    
                    <div class="form-grid">
                      <div class="field">
                        <label>Value</label>
                        <input 
                          type="number" 
                          pInputText 
                          [(ngModel)]="band.value"
                          (ngModelChange)="onBandChange(band.id, 'value', $event)"
                          placeholder="Band value">
                      </div>
                      
                      <div class="field">
                        <label>Label</label>
                        <input 
                          type="text" 
                          pInputText 
                          [(ngModel)]="band.label"
                          (ngModelChange)="onBandChange(band.id, 'label', $event)"
                          placeholder="Band label">
                      </div>
                      
                      <div class="field-checkbox">
                        <p-checkbox 
                          [(ngModel)]="band.dashed"
                          (ngModelChange)="onBandChange(band.id, 'dashed', $event)"
                          inputId="dashed{{ i }}">
                        </p-checkbox>
                        <label for="dashed{{ i }}">Dashed Line</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </p-tabPanel>

            <!-- Security & Refresh -->
            <p-tabPanel header="Security">
              <div class="form-section">
                <h5>Access Control</h5>
                <div class="field">
                  <label for="roles">Allowed Roles</label>
                  <p-multiSelect 
                    id="roles"
                    [options]="roleOptions" 
                    formControlName="roles"
                    placeholder="Select roles">
                  </p-multiSelect>
                </div>
              </div>

              <p-divider></p-divider>

              <div class="form-section">
                <h5>Refresh Settings</h5>
                <div class="field">
                  <label for="refresh">Refresh Frequency</label>
                  <p-dropdown 
                    id="refresh"
                    [options]="refreshOptions" 
                    formControlName="refresh"
                    placeholder="Select refresh frequency">
                  </p-dropdown>
                </div>
              </div>
            </p-tabPanel>
          </p-tabView>

          <!-- Form Actions -->
          <div class="form-actions">
            <button 
              pButton 
              type="button" 
              label="Cancel" 
              class="p-button-outlined"
              (click)="onCancel()">
            </button>
            <button 
              pButton 
              type="submit" 
              label="Save Changes" 
              class="p-button"
              [disabled]="!configForm.valid">
            </button>
          </div>
        </form>
      </div>
    </div>
  `, styles: [".configuration-panel{height:100%;display:flex;flex-direction:column;background:var(--surface-0);border-left:1px solid var(--surface-200)}.panel-header{position:relative;padding:1rem;border-bottom:1px solid var(--surface-200);background:var(--surface-50)}.panel-header h4{margin:0}.close-btn{position:absolute;top:.75rem;right:.75rem}.panel-content{flex:1;overflow-y:auto;padding:1rem}.form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem;margin-bottom:1rem}.form-section{margin-bottom:2rem}.field{display:flex;flex-direction:column;gap:.5rem}.field-checkbox{display:flex;align-items:center;gap:.5rem}.field label{font-weight:500;color:var(--text-color)}.series-list,.bands-list{display:flex;flex-direction:column;gap:1rem}.series-item,.band-item{border:1px solid var(--surface-200);border-radius:8px;padding:1rem;background:var(--surface-50)}.series-header,.band-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}.series-header h6,.band-header h6{margin:0;color:var(--text-color)}.form-actions{display:flex;justify-content:flex-end;gap:1rem;padding:1rem;border-top:1px solid var(--surface-200);background:var(--surface-50)}\n"] }]
        }] });

class GlobalFiltersComponent {
    dashboardService = inject(DashboardService);
    filters = {
        dateRange: 'MTD',
        businessUnit: 'All',
        riskCategory: 'All',
        severity: 1,
        autoRefresh: true,
        refreshInterval: 60
    };
    customStartDate = null;
    customEndDate = null;
    dateRangeOptions = [
        { label: 'MTD', value: 'MTD' },
        { label: 'QTD', value: 'QTD' },
        { label: 'YTD', value: 'YTD' },
        { label: '12M', value: '12M' },
        { label: 'Custom', value: 'custom' }
    ];
    businessUnitOptions = [
        { label: 'All', value: 'All' },
        { label: 'Retail Banking', value: 'Retail Banking' },
        { label: 'Corporate Banking', value: 'Corporate Banking' },
        { label: 'Treasury', value: 'Treasury' },
        { label: 'Operations', value: 'Operations' },
        { label: 'IT & InfoSec', value: 'IT & InfoSec' }
    ];
    riskCategoryOptions = [
        { label: 'All', value: 'All' },
        { label: 'Basel L2', value: 'Basel L2' },
        { label: 'Cyber', value: 'Cyber' },
        { label: 'Compliance', value: 'Compliance' },
        { label: 'Operational', value: 'Operational' }
    ];
    subscriptions = [];
    ngOnInit() {
        this.subscriptions.push(this.dashboardService.filters$.subscribe(filters => {
            this.filters = { ...filters };
            this.updateCustomDates();
        }));
    }
    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
    onDateRangeChange(value) {
        this.filters.dateRange = value;
        this.onFilterChange();
    }
    onCustomDateChange() {
        if (this.customStartDate && this.customEndDate) {
            this.filters.customStartDate = this.customStartDate;
            this.filters.customEndDate = this.customEndDate;
            this.onFilterChange();
        }
    }
    onFilterChange() {
        this.dashboardService.updateFilters(this.filters);
    }
    onResetFilters() {
        this.filters = {
            dateRange: 'MTD',
            businessUnit: 'All',
            riskCategory: 'All',
            severity: 1,
            autoRefresh: true,
            refreshInterval: 60
        };
        this.customStartDate = null;
        this.customEndDate = null;
        this.onFilterChange();
    }
    onApplyFilters() {
        this.dashboardService.updateFilters(this.filters);
        this.onClose();
    }
    onClose() {
        this.dashboardService.setLeftPanelOpen(false);
    }
    updateCustomDates() {
        if (this.filters.customStartDate) {
            this.customStartDate = this.filters.customStartDate;
        }
        if (this.filters.customEndDate) {
            this.customEndDate = this.filters.customEndDate;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: GlobalFiltersComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.15", type: GlobalFiltersComponent, isStandalone: true, selector: "app-global-filters", ngImport: i0, template: `
    <div class="global-filters">
      <p-card>
        <ng-template pTemplate="header">
        <div class="filter-header">
        <!--
          <div class="flex items-center gap-2">
            <i class="pi pi-filter text-primary"></i>
            <h5 class="m-0">Global Filters</h5>
          </div>
        -->
          <button 
            pButton 
            type="button" 
            icon="pi pi-times" 
            class="close-btn p-button-text p-button-sm"
            (click)="onClose()"
            pTooltip="Close Filters">
          </button>
        </div>
      </ng-template>

        
        <div class="p-3">
          <!-- Date Range -->
          <div class="filter-section">
            <h6 class="mb-3">Date Range</h6>
            <div class="grid grid-cols-2 gap-2 mb-3">
              <button 
                *ngFor="let period of dateRangeOptions"
                pButton 
                type="button" 
                [label]="period.label"
                [class]="filters.dateRange === period.value ? 'p-button' : 'p-button-outlined'"
                (click)="onDateRangeChange(period.value)"
                class="p-button-sm">
              </button>
            </div>
            
            <div class="flex align-items-center gap-2 text-sm text-surface-500" *ngIf="filters.dateRange === 'custom'">
              <i class="pi pi-calendar"></i>
              <span>Custom Range</span>
            </div>
            
            <div class="custom-date-range" *ngIf="filters.dateRange === 'custom'">
              <div class="field">
                <label>Start Date</label>
                <p-calendar 
                  [(ngModel)]="customStartDate"
                  (ngModelChange)="onCustomDateChange()"
                  placeholder="Select start date"
                  [showIcon]="true">
                </p-calendar>
              </div>
              <div class="field">
                <label>End Date</label>
                <p-calendar 
                  [(ngModel)]="customEndDate"
                  (ngModelChange)="onCustomDateChange()"
                  placeholder="Select end date"
                  [showIcon]="true">
                </p-calendar>
              </div>
            </div>
          </div>

          <p-divider></p-divider>

          <!-- Business Unit -->
          <div class="filter-section">
            <h6 class="mb-3">Business Unit</h6>
            <div class="field">
              <p-dropdown 
                [options]="businessUnitOptions" 
                [(ngModel)]="filters.businessUnit"
                (ngModelChange)="onFilterChange()"
                placeholder="Select business unit">
              </p-dropdown>
            </div>
          </div>

          <p-divider></p-divider>

          <!-- Risk Category -->
          <div class="filter-section">
            <h6 class="mb-3">Risk Category</h6>
            <div class="field">
              <p-dropdown 
                [options]="riskCategoryOptions" 
                [(ngModel)]="filters.riskCategory"
                (ngModelChange)="onFilterChange()"
                placeholder="Select risk category">
              </p-dropdown>
            </div>
          </div>

          <p-divider></p-divider>

          <!-- Severity Filter -->
          <div class="filter-section">
            <h6 class="mb-3">Minimum Severity</h6>
            <div class="field">
              <label>Severity ≥ {{ filters.severity }}</label>
              <p-slider 
                [(ngModel)]="filters.severity"
                (ngModelChange)="onFilterChange()"
                [min]="1" 
                [max]="5" 
                [step]="1"
>
              </p-slider>
            </div>
          </div>

          <p-divider></p-divider>

          <!-- Auto Refresh -->
          <div class="filter-section">
            <div class="flex justify-content-between align-items-center">
              <div>
                <h6 class="m-0">Auto Refresh</h6>
                <p class="text-sm text-surface-500 m-0">Refresh data automatically</p>
              </div>
              <p-checkbox 
                [(ngModel)]="filters.autoRefresh"
                (ngModelChange)="onFilterChange()"
                inputId="autoRefresh">
              </p-checkbox>
            </div>
            
            <div class="field mt-3" *ngIf="filters.autoRefresh">
              <label>Refresh Interval (minutes)</label>
              <p-slider 
                [(ngModel)]="filters.refreshInterval"
                (ngModelChange)="onFilterChange()"
                [min]="5" 
                [max]="120" 
                [step]="5"
>
              </p-slider>
            </div>
          </div>

          <p-divider></p-divider>

          <!-- Filter Actions -->
          <div class="filter-actions">
            <button 
              pButton 
              type="button" 
              label="Reset Filters" 
              icon="pi pi-refresh" 
              class="p-button-outlined p-button-sm w-full mb-2"
              (click)="onResetFilters()">
            </button>
            <button 
              pButton 
              type="button" 
              label="Apply Filters" 
              icon="pi pi-check" 
              class="p-button p-button-sm w-full"
              (click)="onApplyFilters()">
            </button>
          </div>
        </div>
      </p-card>
    </div>
  `, isInline: true, styles: [".global-filters{height:100%;overflow-y:auto}.filter-section{margin-bottom:1.5rem}.filter-section h6{color:var(--text-color);font-weight:600}.field{display:flex;flex-direction:column;gap:.5rem}.field label{font-weight:500;color:var(--text-color);font-size:.875rem}.custom-date-range{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1rem}.filter-actions{margin-top:1rem}.grid{display:grid}.grid-cols-2{grid-template-columns:repeat(2,1fr)}.gap-2{gap:.5rem}.mb-3{margin-bottom:.75rem}.mt-3{margin-top:.75rem}.w-full{width:100%}.filter-header{position:relative;padding:.75rem 1rem}.close-btn{position:absolute;top:.5rem;right:.5rem}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i2.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i2.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "ngmodule", type: CalendarModule }, { kind: "component", type: i3.Calendar, selector: "p-calendar", inputs: ["iconDisplay", "style", "styleClass", "inputStyle", "inputId", "name", "inputStyleClass", "placeholder", "ariaLabelledBy", "ariaLabel", "iconAriaLabel", "disabled", "dateFormat", "multipleSeparator", "rangeSeparator", "inline", "showOtherMonths", "selectOtherMonths", "showIcon", "fluid", "icon", "appendTo", "readonlyInput", "shortYearCutoff", "monthNavigator", "yearNavigator", "hourFormat", "timeOnly", "stepHour", "stepMinute", "stepSecond", "showSeconds", "required", "showOnFocus", "showWeek", "startWeekFromFirstDayOfYear", "showClear", "dataType", "selectionMode", "maxDateCount", "showButtonBar", "todayButtonStyleClass", "clearButtonStyleClass", "autofocus", "autoZIndex", "baseZIndex", "panelStyleClass", "panelStyle", "keepInvalid", "hideOnDateTimeSelect", "touchUI", "timeSeparator", "focusTrap", "showTransitionOptions", "hideTransitionOptions", "tabindex", "variant", "minDate", "maxDate", "disabledDates", "disabledDays", "yearRange", "showTime", "responsiveOptions", "numberOfMonths", "firstDayOfWeek", "locale", "view", "defaultDate"], outputs: ["onFocus", "onBlur", "onClose", "onSelect", "onClear", "onInput", "onTodayClick", "onClearClick", "onMonthChange", "onYearChange", "onClickOutside", "onShow"] }, { kind: "directive", type: i4.PrimeTemplate, selector: "[pTemplate]", inputs: ["type", "pTemplate"] }, { kind: "ngmodule", type: DropdownModule }, { kind: "component", type: i5$1.Dropdown, selector: "p-dropdown", inputs: ["id", "scrollHeight", "filter", "name", "style", "panelStyle", "styleClass", "panelStyleClass", "readonly", "required", "editable", "appendTo", "tabindex", "placeholder", "loadingIcon", "filterPlaceholder", "filterLocale", "variant", "inputId", "dataKey", "filterBy", "filterFields", "autofocus", "resetFilterOnHide", "checkmark", "dropdownIcon", "loading", "optionLabel", "optionValue", "optionDisabled", "optionGroupLabel", "optionGroupChildren", "autoDisplayFirst", "group", "showClear", "emptyFilterMessage", "emptyMessage", "lazy", "virtualScroll", "virtualScrollItemSize", "virtualScrollOptions", "overlayOptions", "ariaFilterLabel", "ariaLabel", "ariaLabelledBy", "filterMatchMode", "maxlength", "tooltip", "tooltipPosition", "tooltipPositionStyle", "tooltipStyleClass", "focusOnHover", "selectOnFocus", "autoOptionFocus", "autofocusFilter", "fluid", "disabled", "itemSize", "autoZIndex", "baseZIndex", "showTransitionOptions", "hideTransitionOptions", "filterValue", "options"], outputs: ["onChange", "onFilter", "onFocus", "onBlur", "onClick", "onShow", "onHide", "onClear", "onLazyLoad"] }, { kind: "ngmodule", type: CheckboxModule }, { kind: "component", type: i7$1.Checkbox, selector: "p-checkbox, p-checkBox, p-check-box", inputs: ["value", "name", "disabled", "binary", "ariaLabelledBy", "ariaLabel", "tabindex", "inputId", "style", "inputStyle", "styleClass", "inputClass", "indeterminate", "size", "formControl", "checkboxIcon", "readonly", "required", "autofocus", "trueValue", "falseValue", "variant"], outputs: ["onChange", "onFocus", "onBlur"] }, { kind: "ngmodule", type: SliderModule }, { kind: "component", type: i7$2.Slider, selector: "p-slider", inputs: ["animate", "disabled", "min", "max", "orientation", "step", "range", "style", "styleClass", "ariaLabel", "ariaLabelledBy", "tabindex", "autofocus"], outputs: ["onChange", "onSlideEnd"] }, { kind: "ngmodule", type: ButtonModule }, { kind: "directive", type: i8.ButtonDirective, selector: "[pButton]", inputs: ["iconPos", "loadingIcon", "loading", "severity", "raised", "rounded", "text", "outlined", "size", "plain", "fluid", "label", "icon", "buttonProps"] }, { kind: "ngmodule", type: CardModule }, { kind: "component", type: i6.Card, selector: "p-card", inputs: ["header", "subheader", "style", "styleClass"] }, { kind: "ngmodule", type: DividerModule }, { kind: "component", type: i9.Divider, selector: "p-divider", inputs: ["style", "styleClass", "layout", "type", "align"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: GlobalFiltersComponent, decorators: [{
            type: Component,
            args: [{ selector: 'app-global-filters', standalone: true, imports: [
                        CommonModule,
                        FormsModule,
                        CalendarModule,
                        DropdownModule,
                        CheckboxModule,
                        SliderModule,
                        ButtonModule,
                        CardModule,
                        DividerModule
                    ], template: `
    <div class="global-filters">
      <p-card>
        <ng-template pTemplate="header">
        <div class="filter-header">
        <!--
          <div class="flex items-center gap-2">
            <i class="pi pi-filter text-primary"></i>
            <h5 class="m-0">Global Filters</h5>
          </div>
        -->
          <button 
            pButton 
            type="button" 
            icon="pi pi-times" 
            class="close-btn p-button-text p-button-sm"
            (click)="onClose()"
            pTooltip="Close Filters">
          </button>
        </div>
      </ng-template>

        
        <div class="p-3">
          <!-- Date Range -->
          <div class="filter-section">
            <h6 class="mb-3">Date Range</h6>
            <div class="grid grid-cols-2 gap-2 mb-3">
              <button 
                *ngFor="let period of dateRangeOptions"
                pButton 
                type="button" 
                [label]="period.label"
                [class]="filters.dateRange === period.value ? 'p-button' : 'p-button-outlined'"
                (click)="onDateRangeChange(period.value)"
                class="p-button-sm">
              </button>
            </div>
            
            <div class="flex align-items-center gap-2 text-sm text-surface-500" *ngIf="filters.dateRange === 'custom'">
              <i class="pi pi-calendar"></i>
              <span>Custom Range</span>
            </div>
            
            <div class="custom-date-range" *ngIf="filters.dateRange === 'custom'">
              <div class="field">
                <label>Start Date</label>
                <p-calendar 
                  [(ngModel)]="customStartDate"
                  (ngModelChange)="onCustomDateChange()"
                  placeholder="Select start date"
                  [showIcon]="true">
                </p-calendar>
              </div>
              <div class="field">
                <label>End Date</label>
                <p-calendar 
                  [(ngModel)]="customEndDate"
                  (ngModelChange)="onCustomDateChange()"
                  placeholder="Select end date"
                  [showIcon]="true">
                </p-calendar>
              </div>
            </div>
          </div>

          <p-divider></p-divider>

          <!-- Business Unit -->
          <div class="filter-section">
            <h6 class="mb-3">Business Unit</h6>
            <div class="field">
              <p-dropdown 
                [options]="businessUnitOptions" 
                [(ngModel)]="filters.businessUnit"
                (ngModelChange)="onFilterChange()"
                placeholder="Select business unit">
              </p-dropdown>
            </div>
          </div>

          <p-divider></p-divider>

          <!-- Risk Category -->
          <div class="filter-section">
            <h6 class="mb-3">Risk Category</h6>
            <div class="field">
              <p-dropdown 
                [options]="riskCategoryOptions" 
                [(ngModel)]="filters.riskCategory"
                (ngModelChange)="onFilterChange()"
                placeholder="Select risk category">
              </p-dropdown>
            </div>
          </div>

          <p-divider></p-divider>

          <!-- Severity Filter -->
          <div class="filter-section">
            <h6 class="mb-3">Minimum Severity</h6>
            <div class="field">
              <label>Severity ≥ {{ filters.severity }}</label>
              <p-slider 
                [(ngModel)]="filters.severity"
                (ngModelChange)="onFilterChange()"
                [min]="1" 
                [max]="5" 
                [step]="1"
>
              </p-slider>
            </div>
          </div>

          <p-divider></p-divider>

          <!-- Auto Refresh -->
          <div class="filter-section">
            <div class="flex justify-content-between align-items-center">
              <div>
                <h6 class="m-0">Auto Refresh</h6>
                <p class="text-sm text-surface-500 m-0">Refresh data automatically</p>
              </div>
              <p-checkbox 
                [(ngModel)]="filters.autoRefresh"
                (ngModelChange)="onFilterChange()"
                inputId="autoRefresh">
              </p-checkbox>
            </div>
            
            <div class="field mt-3" *ngIf="filters.autoRefresh">
              <label>Refresh Interval (minutes)</label>
              <p-slider 
                [(ngModel)]="filters.refreshInterval"
                (ngModelChange)="onFilterChange()"
                [min]="5" 
                [max]="120" 
                [step]="5"
>
              </p-slider>
            </div>
          </div>

          <p-divider></p-divider>

          <!-- Filter Actions -->
          <div class="filter-actions">
            <button 
              pButton 
              type="button" 
              label="Reset Filters" 
              icon="pi pi-refresh" 
              class="p-button-outlined p-button-sm w-full mb-2"
              (click)="onResetFilters()">
            </button>
            <button 
              pButton 
              type="button" 
              label="Apply Filters" 
              icon="pi pi-check" 
              class="p-button p-button-sm w-full"
              (click)="onApplyFilters()">
            </button>
          </div>
        </div>
      </p-card>
    </div>
  `, styles: [".global-filters{height:100%;overflow-y:auto}.filter-section{margin-bottom:1.5rem}.filter-section h6{color:var(--text-color);font-weight:600}.field{display:flex;flex-direction:column;gap:.5rem}.field label{font-weight:500;color:var(--text-color);font-size:.875rem}.custom-date-range{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1rem}.filter-actions{margin-top:1rem}.grid{display:grid}.grid-cols-2{grid-template-columns:repeat(2,1fr)}.gap-2{gap:.5rem}.mb-3{margin-bottom:.75rem}.mt-3{margin-top:.75rem}.w-full{width:100%}.filter-header{position:relative;padding:.75rem 1rem}.close-btn{position:absolute;top:.5rem;right:.5rem}\n"] }]
        }] });

class DashboardBuilderComponent {
    dashboardService = inject(DashboardService);
    widgetService = inject(WidgetService);
    // State
    mode = 'prebuilt';
    leftPanelOpen = true;
    isConfiguring = false;
    showAddWidget = false;
    showSaveTemplate = false;
    searchQuery = '';
    // Template data
    filteredTemplates = PREBUILT_TEMPLATES;
    templateName = '';
    templateDescription = '';
    templateTags = '';
    subscriptions = [];
    ngOnInit() {
        this.subscriptions.push(this.dashboardService.mode$.subscribe(mode => {
            this.mode = mode;
        }), this.dashboardService.leftPanelOpen$.subscribe(open => {
            this.leftPanelOpen = open;
        }), this.dashboardService.showAddWidget$.subscribe(show => {
            this.showAddWidget = show;
        }), this.dashboardService.filteredTemplates$.subscribe(templates => {
            this.filteredTemplates = templates;
        }), this.widgetService.isConfiguring$.subscribe(configuring => {
            this.isConfiguring = configuring;
        }));
    }
    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
    onModeChange(mode) {
        this.dashboardService.setMode(mode);
    }
    onSearchChange() {
        this.dashboardService.setSearchQuery(this.searchQuery);
    }
    onApplyTemplate(template, event) {
        if (event) {
            event.stopPropagation();
        }
        this.dashboardService.applyTemplate(template.id);
    }
    onShare() {
        console.log('Share dashboard');
    }
    onExport() {
        console.log('Export dashboard');
    }
    onSaveTemplate() {
        this.showSaveTemplate = true;
    }
    onCancelSaveTemplate() {
        this.showSaveTemplate = false;
        this.templateName = '';
        this.templateDescription = '';
        this.templateTags = '';
    }
    onConfirmSaveTemplate() {
        if (this.templateName.trim()) {
            const tags = this.templateTags.split(',').map(tag => tag.trim()).filter(Boolean);
            this.dashboardService.saveAsTemplate(this.templateName, this.templateDescription, tags);
            this.onCancelSaveTemplate();
        }
    }
    onToggleFilters() {
        this.dashboardService.setLeftPanelOpen(!this.leftPanelOpen);
    }
    getCenterContentClasses() {
        const classes = ['center-content'];
        if (this.leftPanelOpen) {
            classes.push('with-left-sidebar');
        }
        if (this.isConfiguring) {
            classes.push('with-right-sidebar');
        }
        return classes.join(' ');
    }
    trackByTemplateId(index, template) {
        return template.id;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: DashboardBuilderComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "19.2.15", type: DashboardBuilderComponent, isStandalone: true, selector: "app-dashboard-builder", ngImport: i0, template: `
    <div class="dashboard-builder">
      <!-- Top Navigation -->
      <div class="top-nav">
        <div class="nav-content">
          <div class="nav-left">
            <div class="flex align-items-center gap-3">
              <i class="pi pi-chart-line text-primary text-xl"></i>
              <h2 class="m-0">GRC – Unified Dashboard</h2>
            </div>
            
            <!-- Search -->
            <div class="search-container">
              <input 
                type="text" 
                pInputText 
                placeholder="Search templates, widgets, metrics…" 
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange()"
                class="search-input">
              <i class="pi pi-search search-icon"></i>
            </div>
          </div>
          
          <div class="nav-right">
            <button 
              pButton 
              type="button" 
              label="Share" 
              icon="pi pi-share-alt" 
              class="p-button-outlined"
              (click)="onShare()">
            </button>
            <button 
              pButton 
              type="button" 
              label="Export" 
              icon="pi pi-download" 
              class="p-button-outlined"
              (click)="onExport()">
            </button>
            <button 
              pButton 
              type="button" 
              label="Save as Template" 
              icon="pi pi-save" 
              class="p-button"
              (click)="onSaveTemplate()">
            </button>
          </div>
        </div>
        
        <!-- Mode Tabs -->
        <div class="mode-tabs">
          <div class="tab-buttons">
            <button 
              pButton 
              type="button" 
              [class]="mode === 'prebuilt' ? 'p-button' : 'p-button-outlined'"
              (click)="onModeChange('prebuilt')"
              class="tab-button">
              <i class="pi pi-th-large mr-2"></i>
              Pre-built Dashboards
            </button>
            <button 
              pButton 
              type="button" 
              [class]="mode === 'builder' ? 'p-button' : 'p-button-outlined'"
              (click)="onModeChange('builder')"
              class="tab-button">
              <i class="pi pi-cog mr-2"></i>
              Dashboard Builder
            </button>
            <button 
              pButton 
              type="button" 
              [class]="mode === 'library' ? 'p-button' : 'p-button-outlined'"
              (click)="onModeChange('library')"
              class="tab-button">
              <i class="pi pi-list mr-2"></i>
              Widget Library
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Left Sidebar -->
        <div class="left-sidebar" *ngIf="leftPanelOpen">
          <div class="filters-header">
            <button 
              pButton 
              type="button" 
              icon="pi pi-times" 
              class="p-button-text p-button-sm"
              (click)="onToggleFilters()"
              pTooltip="Close Filters">
            </button>
            <span class="filters-title">Global Filters</span>
          </div>
          <app-global-filters></app-global-filters>
        </div>

        <div class="filters-header1">
          <button 
            *ngIf="!leftPanelOpen" 
            class="p-button-text p-button-sm" 
            pButton 
            icon="pi pi-filter" 
            pTooltip="Open Filters"
            (click)="onToggleFilters()">
          </button>
          <span *ngIf="!leftPanelOpen" class="filters-title">Global Filters</span>
        </div>

        <!-- Center Content -->
        <div class="center-content" [ngClass]="getCenterContentClasses()">
          <!-- Pre-built Templates -->
          <div *ngIf="mode === 'prebuilt'" class="templates-view">
            <div class="templates-grid">
              <div 
                *ngFor="let template of filteredTemplates; trackBy: trackByTemplateId"
                class="template-card"
                (click)="onApplyTemplate(template)">
                <div class="template-header">
                  <h5 class="m-0">{{ template.name }}</h5>
                  <div class="template-category">{{ template.category | titlecase }}</div>
                </div>
                <div class="template-content">
                  <p class="text-sm text-surface-600 mb-3">{{ template.description }}</p>
                  <div class="template-tags">
                    <span 
                      *ngFor="let tag of template.tags" 
                      class="template-tag">
                      {{ tag }}
                    </span>
                  </div>
                </div>
                <div class="template-footer">
                  <button 
                    pButton 
                    type="button" 
                    label="Use Template" 
                    icon="pi pi-plus" 
                    class="p-button p-button-sm w-full"
                    (click)="onApplyTemplate(template, $event)">
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Dashboard Builder -->
          <div *ngIf="mode === 'builder'" class="builder-view">
            <app-dashboard-canvas></app-dashboard-canvas>
          </div>

          <!-- Widget Library -->
          <div *ngIf="mode === 'library'" class="library-view">
            <app-widget-library></app-widget-library>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="right-sidebar" *ngIf="isConfiguring">
          <app-configuration-panel></app-configuration-panel>
        </div>
      </div>

      <!-- Add Widget Dialog -->
      <p-dialog 
        header="Add Widget" 
        [(visible)]="showAddWidget" 
        [modal]="true" 
        [style]="{ width: '800px' }"
        [closable]="true">
        <app-widget-library></app-widget-library>
      </p-dialog>

      <!-- Save Template Dialog -->
      <p-dialog 
        header="Save as Template" 
        [(visible)]="showSaveTemplate" 
        [modal]="true" 
        [style]="{ width: '500px' }"
        [closable]="true">
        <div class="save-template-form">
          <div class="field">
            <label for="templateName">Template Name</label>
            <input 
              type="text" 
              id="templateName"
              pInputText 
              [(ngModel)]="templateName"
              placeholder="Enter template name">
          </div>
          <div class="field">
            <label for="templateDescription">Description</label>
            <textarea 
              id="templateDescription"
              pInputText 
              [(ngModel)]="templateDescription"
              placeholder="Enter template description"
              rows="3">
            </textarea>
          </div>
          <div class="field">
            <label for="templateTags">Tags</label>
            <input 
              type="text" 
              id="templateTags"
              pInputText 
              [(ngModel)]="templateTags"
              placeholder="Enter tags (comma separated)">
          </div>
        </div>
        <ng-template pTemplate="footer">
          <button 
            pButton 
            type="button" 
            label="Cancel" 
            class="p-button-outlined"
            (click)="onCancelSaveTemplate()">
          </button>
          <button 
            pButton 
            type="button" 
            label="Save Template" 
            class="p-button"
            (click)="onConfirmSaveTemplate()">
          </button>
        </ng-template>
      </p-dialog>
    </div>
  `, isInline: true, styles: [".dashboard-builder{display:flex;flex-direction:column;background:var(--surface-50)}.top-nav{background:var(--surface-0);border-bottom:1px solid var(--surface-200);z-index:10}.nav-content{display:flex;justify-content:space-between;align-items:center;padding:1rem 2rem}.nav-left{display:flex;align-items:center;gap:2rem}.search-container{position:relative;width:400px}.search-input{width:100%;padding-right:2.5rem}.search-icon{position:absolute;right:.75rem;top:50%;transform:translateY(-50%);color:var(--surface-500)}.nav-right{display:flex;gap:.75rem}.mode-tabs{padding:0 2rem 1rem}.tab-buttons{display:flex;gap:.5rem}.tab-button{flex:1;max-width:200px}.main-content{flex:1;display:flex;overflow:hidden}.left-sidebar{width:300px;background:var(--surface-0);border-right:1px solid var(--surface-200);display:flex;flex-direction:column}.filters-header{display:flex;align-items:center;gap:.5rem;padding-bottom:1rem;padding-left:1.3rem;border-bottom:1px solid var(--surface-200);background:var(--surface-50)}.filters-header1{position:absolute;align-items:center;gap:.5rem;padding-bottom:1rem;padding-left:1.3rem;border-bottom:1px solid var(--surface-200);background:var(--surface-50)}.filters-title{font-weight:600;font-size:.95rem}.center-content{flex:1;overflow-y:auto;padding:2rem}.center-content.with-left-sidebar{margin-left:0}.center-content.with-right-sidebar{margin-right:0}.right-sidebar{width:400px;background:var(--surface-0);border-left:1px solid var(--surface-200);overflow-y:auto}.templates-view{height:100%}.templates-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(350px,1fr));gap:1.5rem}.template-card{background:var(--surface-0);border:1px solid var(--surface-200);border-radius:12px;padding:1.5rem;cursor:pointer;transition:all .3s ease}.template-card:hover{border-color:var(--primary-color);box-shadow:0 8px 24px #0000001a;transform:translateY(-2px)}.template-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}.template-category{font-size:.75rem;color:var(--surface-500);background:var(--surface-100);padding:.25rem .5rem;border-radius:4px}.template-tags{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem}.template-tag{font-size:.75rem;color:var(--primary-color);background:rgba(var(--primary-color-rgb),.1);padding:.25rem .5rem;border-radius:4px}.template-footer{margin-top:auto}.builder-view,.library-view{height:100%}.save-template-form{display:flex;flex-direction:column;gap:1rem}.field{display:flex;flex-direction:column;gap:.5rem}.field label{font-weight:500;color:var(--text-color)}.w-full{width:100%}.mr-2{margin-right:.5rem}.mb-3{margin-bottom:.75rem}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "pipe", type: i1.TitleCasePipe, name: "titlecase" }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i2.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i2.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i2.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "ngmodule", type: ButtonModule }, { kind: "directive", type: i8.ButtonDirective, selector: "[pButton]", inputs: ["iconPos", "loadingIcon", "loading", "severity", "raised", "rounded", "text", "outlined", "size", "plain", "fluid", "label", "icon", "buttonProps"] }, { kind: "directive", type: i4.PrimeTemplate, selector: "[pTemplate]", inputs: ["type", "pTemplate"] }, { kind: "ngmodule", type: InputTextModule }, { kind: "directive", type: i7.InputText, selector: "[pInputText]", inputs: ["variant", "fluid", "pSize"] }, { kind: "ngmodule", type: DropdownModule }, { kind: "ngmodule", type: DialogModule }, { kind: "component", type: i6$2.Dialog, selector: "p-dialog", inputs: ["header", "draggable", "resizable", "positionLeft", "positionTop", "contentStyle", "contentStyleClass", "modal", "closeOnEscape", "dismissableMask", "rtl", "closable", "responsive", "appendTo", "breakpoints", "styleClass", "maskStyleClass", "maskStyle", "showHeader", "breakpoint", "blockScroll", "autoZIndex", "baseZIndex", "minX", "minY", "focusOnShow", "maximizable", "keepInViewport", "focusTrap", "transitionOptions", "closeIcon", "closeAriaLabel", "closeTabindex", "minimizeIcon", "maximizeIcon", "closeButtonProps", "maximizeButtonProps", "visible", "style", "position", "role", "content", "contentTemplate", "footerTemplate", "closeIconTemplate", "maximizeIconTemplate", "minimizeIconTemplate", "headlessTemplate"], outputs: ["onShow", "onHide", "visibleChange", "onResizeInit", "onResizeEnd", "onDragEnd", "onMaximize"] }, { kind: "ngmodule", type: TabViewModule }, { kind: "ngmodule", type: CardModule }, { kind: "ngmodule", type: DividerModule }, { kind: "ngmodule", type: TooltipModule }, { kind: "directive", type: i7$3.Tooltip, selector: "[pTooltip]", inputs: ["tooltipPosition", "tooltipEvent", "appendTo", "positionStyle", "tooltipStyleClass", "tooltipZIndex", "escape", "showDelay", "hideDelay", "life", "positionTop", "positionLeft", "autoHide", "fitContent", "hideOnEscape", "pTooltip", "tooltipDisabled", "tooltipOptions"] }, { kind: "component", type: DashboardCanvasComponent, selector: "app-dashboard-canvas" }, { kind: "component", type: WidgetLibraryComponent, selector: "app-widget-library" }, { kind: "component", type: ConfigurationPanelComponent, selector: "app-configuration-panel" }, { kind: "component", type: GlobalFiltersComponent, selector: "app-global-filters" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.15", ngImport: i0, type: DashboardBuilderComponent, decorators: [{
            type: Component,
            args: [{ selector: 'app-dashboard-builder', standalone: true, imports: [
                        CommonModule,
                        FormsModule,
                        ButtonModule,
                        InputTextModule,
                        DropdownModule,
                        DialogModule,
                        TabViewModule,
                        CardModule,
                        DividerModule,
                        TooltipModule,
                        DashboardCanvasComponent,
                        WidgetLibraryComponent,
                        ConfigurationPanelComponent,
                        GlobalFiltersComponent
                    ], template: `
    <div class="dashboard-builder">
      <!-- Top Navigation -->
      <div class="top-nav">
        <div class="nav-content">
          <div class="nav-left">
            <div class="flex align-items-center gap-3">
              <i class="pi pi-chart-line text-primary text-xl"></i>
              <h2 class="m-0">GRC – Unified Dashboard</h2>
            </div>
            
            <!-- Search -->
            <div class="search-container">
              <input 
                type="text" 
                pInputText 
                placeholder="Search templates, widgets, metrics…" 
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange()"
                class="search-input">
              <i class="pi pi-search search-icon"></i>
            </div>
          </div>
          
          <div class="nav-right">
            <button 
              pButton 
              type="button" 
              label="Share" 
              icon="pi pi-share-alt" 
              class="p-button-outlined"
              (click)="onShare()">
            </button>
            <button 
              pButton 
              type="button" 
              label="Export" 
              icon="pi pi-download" 
              class="p-button-outlined"
              (click)="onExport()">
            </button>
            <button 
              pButton 
              type="button" 
              label="Save as Template" 
              icon="pi pi-save" 
              class="p-button"
              (click)="onSaveTemplate()">
            </button>
          </div>
        </div>
        
        <!-- Mode Tabs -->
        <div class="mode-tabs">
          <div class="tab-buttons">
            <button 
              pButton 
              type="button" 
              [class]="mode === 'prebuilt' ? 'p-button' : 'p-button-outlined'"
              (click)="onModeChange('prebuilt')"
              class="tab-button">
              <i class="pi pi-th-large mr-2"></i>
              Pre-built Dashboards
            </button>
            <button 
              pButton 
              type="button" 
              [class]="mode === 'builder' ? 'p-button' : 'p-button-outlined'"
              (click)="onModeChange('builder')"
              class="tab-button">
              <i class="pi pi-cog mr-2"></i>
              Dashboard Builder
            </button>
            <button 
              pButton 
              type="button" 
              [class]="mode === 'library' ? 'p-button' : 'p-button-outlined'"
              (click)="onModeChange('library')"
              class="tab-button">
              <i class="pi pi-list mr-2"></i>
              Widget Library
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Left Sidebar -->
        <div class="left-sidebar" *ngIf="leftPanelOpen">
          <div class="filters-header">
            <button 
              pButton 
              type="button" 
              icon="pi pi-times" 
              class="p-button-text p-button-sm"
              (click)="onToggleFilters()"
              pTooltip="Close Filters">
            </button>
            <span class="filters-title">Global Filters</span>
          </div>
          <app-global-filters></app-global-filters>
        </div>

        <div class="filters-header1">
          <button 
            *ngIf="!leftPanelOpen" 
            class="p-button-text p-button-sm" 
            pButton 
            icon="pi pi-filter" 
            pTooltip="Open Filters"
            (click)="onToggleFilters()">
          </button>
          <span *ngIf="!leftPanelOpen" class="filters-title">Global Filters</span>
        </div>

        <!-- Center Content -->
        <div class="center-content" [ngClass]="getCenterContentClasses()">
          <!-- Pre-built Templates -->
          <div *ngIf="mode === 'prebuilt'" class="templates-view">
            <div class="templates-grid">
              <div 
                *ngFor="let template of filteredTemplates; trackBy: trackByTemplateId"
                class="template-card"
                (click)="onApplyTemplate(template)">
                <div class="template-header">
                  <h5 class="m-0">{{ template.name }}</h5>
                  <div class="template-category">{{ template.category | titlecase }}</div>
                </div>
                <div class="template-content">
                  <p class="text-sm text-surface-600 mb-3">{{ template.description }}</p>
                  <div class="template-tags">
                    <span 
                      *ngFor="let tag of template.tags" 
                      class="template-tag">
                      {{ tag }}
                    </span>
                  </div>
                </div>
                <div class="template-footer">
                  <button 
                    pButton 
                    type="button" 
                    label="Use Template" 
                    icon="pi pi-plus" 
                    class="p-button p-button-sm w-full"
                    (click)="onApplyTemplate(template, $event)">
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Dashboard Builder -->
          <div *ngIf="mode === 'builder'" class="builder-view">
            <app-dashboard-canvas></app-dashboard-canvas>
          </div>

          <!-- Widget Library -->
          <div *ngIf="mode === 'library'" class="library-view">
            <app-widget-library></app-widget-library>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="right-sidebar" *ngIf="isConfiguring">
          <app-configuration-panel></app-configuration-panel>
        </div>
      </div>

      <!-- Add Widget Dialog -->
      <p-dialog 
        header="Add Widget" 
        [(visible)]="showAddWidget" 
        [modal]="true" 
        [style]="{ width: '800px' }"
        [closable]="true">
        <app-widget-library></app-widget-library>
      </p-dialog>

      <!-- Save Template Dialog -->
      <p-dialog 
        header="Save as Template" 
        [(visible)]="showSaveTemplate" 
        [modal]="true" 
        [style]="{ width: '500px' }"
        [closable]="true">
        <div class="save-template-form">
          <div class="field">
            <label for="templateName">Template Name</label>
            <input 
              type="text" 
              id="templateName"
              pInputText 
              [(ngModel)]="templateName"
              placeholder="Enter template name">
          </div>
          <div class="field">
            <label for="templateDescription">Description</label>
            <textarea 
              id="templateDescription"
              pInputText 
              [(ngModel)]="templateDescription"
              placeholder="Enter template description"
              rows="3">
            </textarea>
          </div>
          <div class="field">
            <label for="templateTags">Tags</label>
            <input 
              type="text" 
              id="templateTags"
              pInputText 
              [(ngModel)]="templateTags"
              placeholder="Enter tags (comma separated)">
          </div>
        </div>
        <ng-template pTemplate="footer">
          <button 
            pButton 
            type="button" 
            label="Cancel" 
            class="p-button-outlined"
            (click)="onCancelSaveTemplate()">
          </button>
          <button 
            pButton 
            type="button" 
            label="Save Template" 
            class="p-button"
            (click)="onConfirmSaveTemplate()">
          </button>
        </ng-template>
      </p-dialog>
    </div>
  `, styles: [".dashboard-builder{display:flex;flex-direction:column;background:var(--surface-50)}.top-nav{background:var(--surface-0);border-bottom:1px solid var(--surface-200);z-index:10}.nav-content{display:flex;justify-content:space-between;align-items:center;padding:1rem 2rem}.nav-left{display:flex;align-items:center;gap:2rem}.search-container{position:relative;width:400px}.search-input{width:100%;padding-right:2.5rem}.search-icon{position:absolute;right:.75rem;top:50%;transform:translateY(-50%);color:var(--surface-500)}.nav-right{display:flex;gap:.75rem}.mode-tabs{padding:0 2rem 1rem}.tab-buttons{display:flex;gap:.5rem}.tab-button{flex:1;max-width:200px}.main-content{flex:1;display:flex;overflow:hidden}.left-sidebar{width:300px;background:var(--surface-0);border-right:1px solid var(--surface-200);display:flex;flex-direction:column}.filters-header{display:flex;align-items:center;gap:.5rem;padding-bottom:1rem;padding-left:1.3rem;border-bottom:1px solid var(--surface-200);background:var(--surface-50)}.filters-header1{position:absolute;align-items:center;gap:.5rem;padding-bottom:1rem;padding-left:1.3rem;border-bottom:1px solid var(--surface-200);background:var(--surface-50)}.filters-title{font-weight:600;font-size:.95rem}.center-content{flex:1;overflow-y:auto;padding:2rem}.center-content.with-left-sidebar{margin-left:0}.center-content.with-right-sidebar{margin-right:0}.right-sidebar{width:400px;background:var(--surface-0);border-left:1px solid var(--surface-200);overflow-y:auto}.templates-view{height:100%}.templates-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(350px,1fr));gap:1.5rem}.template-card{background:var(--surface-0);border:1px solid var(--surface-200);border-radius:12px;padding:1.5rem;cursor:pointer;transition:all .3s ease}.template-card:hover{border-color:var(--primary-color);box-shadow:0 8px 24px #0000001a;transform:translateY(-2px)}.template-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}.template-category{font-size:.75rem;color:var(--surface-500);background:var(--surface-100);padding:.25rem .5rem;border-radius:4px}.template-tags{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem}.template-tag{font-size:.75rem;color:var(--primary-color);background:rgba(var(--primary-color-rgb),.1);padding:.25rem .5rem;border-radius:4px}.template-footer{margin-top:auto}.builder-view,.library-view{height:100%}.save-template-form{display:flex;flex-direction:column;gap:1rem}.field{display:flex;flex-direction:column;gap:.5rem}.field label{font-weight:500;color:var(--text-color)}.w-full{width:100%}.mr-2{margin-right:.5rem}.mb-3{margin-bottom:.75rem}\n"] }]
        }] });

const DEFAULT_GRID_LAYOUT = {
    columns: 12,
    rows: 8,
    breakpoints: {
        lg: 1200,
        md: 996,
        sm: 768,
        xs: 480
    },
    margin: [16, 16],
    containerPadding: [16, 16]
};
const DEFAULT_FILTERS = {
    dateRange: 'MTD',
    businessUnit: 'All',
    riskCategory: 'All',
    severity: 1,
    autoRefresh: true,
    refreshInterval: 60
};

/*
 * Public API Surface of create-widget library
 */

/**
 * Generated bundle index. Do not edit.
 */

export { APPETITE_UTILIZATION_DATA, AUDIT_AGING_DATA, CHART_COLORS, CONTROL_EFFECTIVENESS_DATA, CreateWidgetComponent, DATASET_CONFIGS, DEFAULT_FILTERS, DEFAULT_GRID_LAYOUT, DashboardBuilderComponent, DashboardService, DataService, INCIDENT_TREND_DATA, KRI_BREACH_DATA, LOSS_EVENT_DATA, PREBUILT_TEMPLATES, RISK_HEATMAP_DATA, TEMPLATE_CATEGORIES, WIDGET_CATEGORIES, WIDGET_LIBRARY, WidgetService };
//# sourceMappingURL=dashboard-library.mjs.map
