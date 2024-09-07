export interface SimulationData {
    age: number;
    initialValue: number;
    annualContribution: number;
    annualDrawdown: number;
}

export interface StatisticalModel {
    mean: number;
    standardDeviation: number;
}
