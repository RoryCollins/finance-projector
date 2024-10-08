export interface SimulationData {
    personalDetails: PersonalDetails,
    query: QueryDetails,
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
    drawdownAtRetirement: number;
    annualData : {
        age: number
        median: number
        percentile10: number
        percentile90: number
    }[];
}

export interface PersonalDetails {
  age: number,
  initialIsa: number,
  initialPension: number,
  isaContribution: number,
  pensionContribution: number,
}

export interface QueryDetails {
    targetAge: number,
    targetDrawdown: number,
    deferInCrash: boolean,
}

export interface ModelDetails {
    stocks: StatisticalModel,
    bonds: StatisticalModel
}