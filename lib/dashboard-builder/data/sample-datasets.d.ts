import { IncidentTrendData, KRIBreachData, ControlEffectivenessData, LossEventData, AuditAgingData, AppetiteUtilizationData, RiskHeatmapData, DatasetConfig } from '../models/chart.data';
export declare const INCIDENT_TREND_DATA: IncidentTrendData[];
export declare const KRI_BREACH_DATA: KRIBreachData[];
export declare const CONTROL_EFFECTIVENESS_DATA: ControlEffectivenessData[];
export declare const LOSS_EVENT_DATA: LossEventData[];
export declare const AUDIT_AGING_DATA: AuditAgingData[];
export declare const APPETITE_UTILIZATION_DATA: AppetiteUtilizationData[];
export declare const RISK_HEATMAP_DATA: RiskHeatmapData[];
export declare const DATASET_CONFIGS: DatasetConfig[];
export declare const CHART_COLORS: {
    primary: string[];
    risk: string[];
    status: {
        green: string;
        amber: string;
        red: string;
        blue: string;
        purple: string;
    };
    heatmap: {
        low: string;
        medium: string;
        high: string;
        critical: string;
    };
};
