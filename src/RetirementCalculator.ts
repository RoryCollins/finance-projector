import { EARLY_PENSION_AGE, SAFE_WITHDRAWAL_RATE, STATE_PENSION_AGE } from "./constants";
import { QueryDetails } from "./interfaces";
import { PortfolioState } from "./SimulationRunner";

const safeWithdrawalAmount = (portfolioValue: number): number => {
    return portfolioValue * SAFE_WITHDRAWAL_RATE;
}

export class RetirementCalculator {
    private targetAge: number
    private targetDrawdown: number
    private deferInCrash: boolean
    private deferUntilSwr: boolean

    constructor({ targetAge, targetDrawdown, deferInCrash }: QueryDetails) {
        this.targetAge = targetAge;
        this.targetDrawdown = targetDrawdown;
        this.deferInCrash = deferInCrash;
        this.deferUntilSwr = true;
    }

    updateRetirementState = (state: PortfolioState): PortfolioState => {
        if (state.retired) {
            return state;
        }
        if (state.age >= STATE_PENSION_AGE) {
            return { ...state, retired: true };
        }
        if (state.age >= this.targetAge) {
            if (this.deferInCrash && state.deferredRetirementCounter && state.interest < 1) {
                return { ...state, deferredRetirementCounter: state.deferredRetirementCounter + 1 }
            }
            if (this.deferUntilSwr && safeWithdrawalAmount(state.isaValue + state.pensionValue) < this.targetDrawdown) {
                return state.deferredRetirementCounter < 3
                    ? { ...state, deferredRetirementCounter: state.deferredRetirementCounter + 1 }
                    : { ...state, retired: true, annualDrawdown: safeWithdrawalAmount(state.isaValue + state.pensionValue)}
            }
            if (state.isaValue >= ((EARLY_PENSION_AGE - state.age) * this.targetDrawdown)) {
                return { ...state, retired: true };
            }
        }

        return state;
    }
}
