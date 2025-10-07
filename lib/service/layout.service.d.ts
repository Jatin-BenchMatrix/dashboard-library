import { Signal, WritableSignal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import * as i0 from "@angular/core";
export type MenuMode = 'static' | 'overlay' | 'horizontal' | 'slim' | 'slim-plus' | 'reveal' | 'drawer';
export interface LayoutConfig {
    preset: string;
    primary: string;
    surface: string | undefined | null;
    darkTheme: boolean;
    menuMode: MenuMode;
}
export interface LayoutState {
    staticMenuDesktopInactive: boolean;
    overlayMenuActive: boolean;
    configSidebarVisible: boolean;
    staticMenuMobileActive: boolean;
    menuHoverActive: boolean;
    rightMenuActive: boolean;
    sidebarActive: boolean;
    activeMenuItem: any;
    overlaySubmenuActive: boolean;
    anchored: boolean;
    rightMenuVisible: boolean;
    searchBarActive: boolean;
}
export interface MenuChangeEvent {
    key: string;
    routeEvent?: boolean;
}
export interface TabCloseEvent {
    tab: MenuItem;
    index: number;
}
export declare class LayoutService {
    _config: LayoutConfig;
    _state: LayoutState;
    layoutConfig: WritableSignal<LayoutConfig>;
    layoutState: WritableSignal<LayoutState>;
    private configUpdate;
    private overlayOpen;
    private menuSource;
    private resetSource;
    menuSource$: import("rxjs").Observable<MenuChangeEvent>;
    resetSource$: import("rxjs").Observable<unknown>;
    configUpdate$: import("rxjs").Observable<LayoutConfig>;
    overlayOpen$: import("rxjs").Observable<any>;
    isSidebarActive: Signal<boolean>;
    isSidebarStateChanged: Signal<boolean>;
    isDarkTheme: Signal<boolean>;
    isOverlay: Signal<boolean>;
    isSlim: Signal<boolean>;
    isSlimPlus: Signal<boolean>;
    isHorizontal: Signal<boolean>;
    transitionComplete: WritableSignal<boolean>;
    logo: Signal<"light" | "dark">;
    rightMenuVisible: Signal<boolean>;
    private initialized;
    constructor();
    private handleDarkModeTransition;
    private startViewTransition;
    toggleDarkMode(config?: LayoutConfig): void;
    private onTransitionEnd;
    onMenuToggle(): void;
    isDesktop(): boolean;
    isMobile(): boolean;
    onConfigUpdate(): void;
    onMenuStateChange(event: MenuChangeEvent): void;
    reset(): void;
    onOverlaySubmenuOpen(): void;
    showProfileSidebar(): void;
    showConfigSidebar(): void;
    hideConfigSidebar(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<LayoutService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<LayoutService>;
}
