import {EARLY_PENSION_AGE} from "./constants";
import {QueryDetails} from "./interfaces";
import {PortfolioState} from "./SimulationRunner";

export const getRetirementStrategy = (query: QueryDetails): RetirementStrategy => {
    let strategy: RetirementStrategy = new BasicRetirementStrategy();
    strategy = new BridgeTheGapStrategy(strategy);
    if (query.deferInCrash) {
        strategy = new DeferInCrashStrategy(strategy);
    }

    return strategy;
}

export interface RetirementStrategy {
    updateRetirementState: (portfolioState: PortfolioState) => PortfolioState;
}

abstract class DeferredRetirementStrategyDecorator implements RetirementStrategy {
    protected readonly strategy: RetirementStrategy;
    protected readonly maxDeferredRetirementCounter: number = 3;

    constructor(strategy: RetirementStrategy) {
        this.strategy = strategy;
    }

    updateRetirementState(portfolioState: PortfolioState): PortfolioState {
        if (portfolioState.age < portfolioState.targetAge) {
            return portfolioState;
        }

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
            ...portfolioState,
            deferredRetirementCounter: portfolioState.deferredRetirementCounter + 1,
        }
    }

    abstract canRetire(state: PortfolioState): boolean;

}

class DeferInCrashStrategy extends DeferredRetirementStrategyDecorator {
    canRetire(portfolioState: PortfolioState): boolean {
        return this.maxDeferralReached(portfolioState.deferredRetirementCounter)
            || portfolioState.interest >= 1;
    }

    private maxDeferralReached(currentDeferralCounter: number): boolean {
        return currentDeferralCounter >= this.maxDeferredRetirementCounter;
    }
}

class BridgeTheGapStrategy extends DeferredRetirementStrategyDecorator {
    canRetire(portfolioState: PortfolioState): boolean {
        if (portfolioState.age > EARLY_PENSION_AGE)
            return true;

        const capitalRequired = portfolioState.annualDrawdown * (EARLY_PENSION_AGE - portfolioState.age);
        return portfolioState.isaValue >= capitalRequired;
    }
}

class BasicRetirementStrategy implements RetirementStrategy {
    updateRetirementState = (portfolioState: PortfolioState): PortfolioState => {
        if (portfolioState.age >= portfolioState.targetAge){
            return {
                ...portfolioState,
                retired: true
            };
        }
        return portfolioState;
    }
}