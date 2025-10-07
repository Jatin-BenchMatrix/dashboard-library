export interface ChartDataPoint {
    [key: string]: any;
}
export interface IncidentTrendData extends ChartDataPoint {
    month: string;
    incidents: number;
    severity: number;
    resolved: number;
    pending: number;
}
export interface KRIBreachData extends ChartDataPoint {
    name: string;
    breaches: number;
    threshold: number;
    trend: 'up' | 'down' | 'stable';
}
export interface ControlEffectivenessData extends ChartDataPoint {
    control: string;
    score: number;
    target: number;
    lastReview: Date;
}
export interface LossEventData extends ChartDataPoint {
    type: string;
    amount: number;
    frequency: number;
    trend: 'up' | 'down' | 'stable';
}
export interface AuditAgingData extends ChartDataPoint {
    aging: string;
    findings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
}
export interface AppetiteUtilizationData extends ChartDataPoint {
    kpi: string;
    value: number;
    threshold: number;
    status: 'green' | 'amber' | 'red';
}
export interface RiskHeatmapData extends ChartDataPoint {
    likelihood: number;
    impact: number;
    riskScore: number;
    category: string;
    description: string;
}
export interface DatasetConfig {
    id: string;
    name: string;
    description: string;
    type: 'incident' | 'kri' | 'control' | 'loss' | 'audit' | 'appetite' | 'heatmap';
    fields: string[];
    refreshRate: 'realtime' | 'daily' | 'monthly';
    lastUpdated: Date;
}
export type ChartDataType = IncidentTrendData | KRIBreachData | ControlEffectivenessData | LossEventData | AuditAgingData | AppetiteUtilizationData | RiskHeatmapData;
