export interface SimulationData {
    age: number;
    initialIsaValue: number;
    initialPensionValue: number;
    annualIsaContribution: number;
    annualPensionContribution: number;
    annualDrawdown: number;
    safeWithdrawalRate: number;
}

export interface RiskAppetite {
    age: number;
    distribution: {
        model: StatisticalModel,
        percentage: number
    }[];
}

export interface StatisticalModel {
    mean: number;
    standardDeviation: number;
}

export interface SimulationResults {
    medianRetirementAge: number
    successRate: number;
    annualData : {
        age: number
        median: number
        percentile10: number
        percentile90: number
    }[];
}
