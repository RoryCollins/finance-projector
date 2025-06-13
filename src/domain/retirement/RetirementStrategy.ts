import {StrategyQuery} from "../interfaces";
import {DeferInCrashStrategyDecorator} from "./DeferInCrashStrategyDecorator";
import {BridgeTheGapStrategyDecorator} from "./BridgeTheGapStrategyDecorator";
import {BasicRetirementStrategy} from "./BasicRetirementStrategy";

export const getRetirementStrategy = (query: StrategyQuery): RetirementStrategy => {
    let strategy: RetirementStrategy = new BasicRetirementStrategy(query.targetAge);
    if (query.bridgeTheGap){
        strategy = new BridgeTheGapStrategyDecorator(strategy);
    }
    if (query.deferInCrash) {
        strategy = new DeferInCrashStrategyDecorator(strategy);
    }

    return strategy;
}

export interface RetirementQuery {
    age: number;
    isaValue: number;
    pensionValue: number;
    deferredRetirementCounter: number;
    annualDrawdown: number;
    interest: number;
}

export interface RetirementResult {
    retired: boolean;
    deferredRetirementCounter: number;
}

export interface RetirementStrategy {
    updateRetirementState: (portfolioState: RetirementQuery) => RetirementResult;
}