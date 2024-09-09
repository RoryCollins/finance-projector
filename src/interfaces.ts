export interface SimulationData {
    age: number;
    initialIsaValue: number;
    initialPensionValue: number;
    annualIsaContribution: number;
    annualPensionContribution: number;
    annualDrawdown: number;
    safeWithdrawalRate: number;
}

export interface StatisticalModel {
    mean: number;
    standardDeviation: number;
}

export interface SimulationResults {
    medianRetirementAge: number
    annualData : {
        age: number
        median: number
        percentile10: number
        percentile90: number
    }[]
}

// export interface ChartData{
//     age: number
//     percentile10: number
//     percentile90: number
//     median: number
// }