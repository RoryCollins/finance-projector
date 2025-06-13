import {RetirementQuery, RetirementResult, RetirementStrategy} from "./RetirementStrategy";

export abstract class DeferredRetirementStrategyDecoratorTemplate implements RetirementStrategy {
    protected readonly strategy: RetirementStrategy;
    protected readonly maxDeferredRetirementCounter: number = 3;

    constructor(strategy: RetirementStrategy) {
        this.strategy = strategy;
    }

    updateRetirementState(portfolioState: RetirementQuery): RetirementResult {
        const innerState = this.strategy.updateRetirementState(portfolioState);
        if (!innerState.retired) {
            return innerState;
        }

        if (this.canRetire(portfolioState)) {
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