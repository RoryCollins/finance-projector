import {DeferredRetirementStrategyDecoratorTemplate} from "./DeferredRetirementStrategyDecoratorTemplate";
import {EARLY_PENSION_AGE} from "../constants";
import {RetirementQuery} from "./RetirementStrategy";

export class BridgeTheGapStrategyDecorator extends DeferredRetirementStrategyDecoratorTemplate {
    canRetire(portfolioState: RetirementQuery): boolean {
        if (portfolioState.age > EARLY_PENSION_AGE)
            return true;

        //TODO: this is overly simplified, negative returns may lead to failure.
        const capitalRequired = portfolioState.annualDrawdown * (EARLY_PENSION_AGE - portfolioState.age);
        return portfolioState.isaValue >= capitalRequired;
    }
}