import {RetirementQuery} from "./RetirementStrategy";
import {DeferredRetirementStrategyDecoratorTemplate} from "./DeferredRetirementStrategyDecoratorTemplate";

export class DeferInCrashStrategyDecorator extends DeferredRetirementStrategyDecoratorTemplate {
    canRetire(portfolioState: RetirementQuery): boolean {
        return this.maxDeferralReached(portfolioState.deferredRetirementCounter)
            || portfolioState.interest >= 1;
    }

    private maxDeferralReached(currentDeferralCounter: number): boolean {
        return currentDeferralCounter >= this.maxDeferredRetirementCounter;
    }
}