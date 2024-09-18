import { EARLY_PENSION_AGE, STATE_PENSION_AGE } from "./constants";
import { RetirementStrategy } from "./RetirementStrategy";
import { PortfolioState } from "./SimulationRunner";


export class targetValueRetirementStrategy implements RetirementStrategy {
    readonly annualDrawdown: number;
    readonly safeWithdrawalRate: number;

    constructor(annualDrawdown: number, safeWithdrawalRate: number) {
        this.annualDrawdown = annualDrawdown;
        this.safeWithdrawalRate = safeWithdrawalRate;
    }

    private targetFundsReached = (totalPotValue: number) => {
        return totalPotValue >= this.annualDrawdown / this.safeWithdrawalRate;
    };

    private sufficientIsa = (age: number, isaValue: number): boolean => {
        return isaValue >= ((EARLY_PENSION_AGE - age) * this.annualDrawdown);
    };

    isRetired(state: PortfolioState): { retired: boolean; deferredRetirementCounter: number; } {
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

        return { retired, deferredRetirementCounter };

    }
}
