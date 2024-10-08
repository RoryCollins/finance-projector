import { EARLY_PENSION_AGE, STATE_PENSION_AGE } from "./constants";
import { QueryDetails } from "./interfaces";
import { PortfolioState } from "./SimulationRunner";

export class RetirementCalculator {
    private targetAge: number
    private targetDrawdown: number
    private deferInCrash: boolean

    constructor({ targetAge, targetDrawdown, deferInCrash }: QueryDetails) {
        this.targetAge = targetAge;
        this.targetDrawdown = targetDrawdown;
        this.deferInCrash = deferInCrash;
    }

    updateRetirementState = (state: PortfolioState): PortfolioState => {
        if (state.retired) {
            return state;
        }
        if (state.age >= STATE_PENSION_AGE) {
            return { ...state, retired: true };
        }
        if (state.age >= this.targetAge) {
            if (this.deferInCrash && state.interest < 1 && state.deferredRetirementCounter < 3) {
                return { ...state, deferredRetirementCounter: state.deferredRetirementCounter + 1 }
            }
            if (state.isaValue >= ((EARLY_PENSION_AGE - state.age) * this.targetDrawdown)) {
                return { ...state, retired: true };
            }
        }

        return state;
    }
}
