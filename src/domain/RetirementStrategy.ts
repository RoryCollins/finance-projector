import {EARLY_PENSION_AGE} from "./constants";
import {StrategyQuery} from "./interfaces";

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

abstract class DeferredRetirementStrategyDecorator implements RetirementStrategy {
    protected readonly strategy: RetirementStrategy;
    protected readonly maxDeferredRetirementCounter: number = 3;

    constructor(strategy: RetirementStrategy) {
        this.strategy = strategy;
    }

    updateRetirementState(portfolioState: RetirementQuery): RetirementResult {
        // Check the inner strategy first and return if strategy failed
        const innerState = this.strategy.updateRetirementState(portfolioState);
        if (!innerState.retired) {
            return innerState;
        }

        if (this.canRetire(portfolioState)){
            return {
                ...portfolioState,
                retired: true,
            }
        }

        return {
            retired: false,
            deferredRetirementCounter: portfolioState.deferredRetirementCounter + 1,
        }
    }

    abstract canRetire(state: RetirementQuery): boolean;

}

class DeferInCrashStrategyDecorator extends DeferredRetirementStrategyDecorator {
    canRetire(portfolioState: RetirementQuery): boolean {
        return this.maxDeferralReached(portfolioState.deferredRetirementCounter)
            || portfolioState.interest >= 1;
    }

    private maxDeferralReached(currentDeferralCounter: number): boolean {
        return currentDeferralCounter >= this.maxDeferredRetirementCounter;
    }
}

class BridgeTheGapStrategyDecorator extends DeferredRetirementStrategyDecorator {
    canRetire(portfolioState: RetirementQuery): boolean {
        if (portfolioState.age > EARLY_PENSION_AGE)
            return true;

        const capitalRequired = portfolioState.annualDrawdown * (EARLY_PENSION_AGE - portfolioState.age);
        return portfolioState.isaValue >= capitalRequired;
    }
}

class BasicRetirementStrategy implements RetirementStrategy {
    constructor(private readonly targetAge: number) {}

    updateRetirementState(portfolioState: RetirementQuery): RetirementResult {
        if (portfolioState.age >= this.targetAge) {
            return {
                retired: true,
                deferredRetirementCounter: portfolioState.deferredRetirementCounter,
            };
        }
        return {retired: false, deferredRetirementCounter: 0}
    }
}