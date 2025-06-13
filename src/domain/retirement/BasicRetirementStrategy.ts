import {RetirementQuery, RetirementResult, RetirementStrategy} from "./RetirementStrategy";

export class BasicRetirementStrategy implements RetirementStrategy {
    constructor(private readonly targetAge: number) {
    }

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