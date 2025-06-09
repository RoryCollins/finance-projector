export interface SimulationData {
    personalDetails: PersonalDetails,
    query: StrategyQuery,
}

export interface RiskAppetiteView {
    age: number;
    distribution: {
        modelName: string,
        percentage: number
    }[];
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

export interface StrategyQuery {
    targetAge: number,
    targetDrawdown: number,
    deferInCrash: boolean,
    bridgeTheGap: boolean,
}

export interface ModelDetails {
    name: string,
    model: StatisticalModel
}

export interface PortfolioState {
    age: number,
    isaValue: number,
    pensionValue: number,
    deferredRetirementCounter: number,
    annualDrawdown: number,
    netWorthHistory: number[],
    summary?: Summary,
}

interface Summary {
    retirementAge: number;
    isaAtRetirement: number;
    pensionAtRetirement: number;
    success: boolean;
}