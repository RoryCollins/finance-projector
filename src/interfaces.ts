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