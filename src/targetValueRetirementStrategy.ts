import { EARLY_PENSION_AGE, SAFE_WITHDRAWAL_RATE, STATE_PENSION_AGE } from "./constants";
import { RetirementStrategy } from "./RetirementStrategy";
import { PortfolioState } from "./SimulationRunner";


export class targetValueRetirementStrategy implements RetirementStrategy {
    readonly annualDrawdown: number;

    constructor(annualDrawdown: number) {
        this.annualDrawdown = annualDrawdown;
    }

    private targetFundsReached = (totalPotValue: number) => {
        return totalPotValue >= this.annualDrawdown / SAFE_WITHDRAWAL_RATE;
    };

    private sufficientIsa = (age: number, isaValue: number): boolean => {
        return isaValue >= ((EARLY_PENSION_AGE - age) * this.annualDrawdown);
    };

    isRetired(state: PortfolioState): PortfolioState {
        let { retired, age, isaValue, pensionValue, interest, deferredRetirementCounter } = state;
        if (retired || age === STATE_PENSION_AGE) {
            retired = true;
        }
        else if (this.targetFundsReached(isaValue + pensionValue)
            && this.sufficientIsa(age, isaValue)) {
            if (interest < 1 && deferredRetirementCounter < 3) {
                deferredRetirementCounter++;
            }
            else {
                retired = true;
            }
        }

        return {...state, retired, deferredRetirementCounter };

    }
}
