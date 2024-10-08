import { EARLY_PENSION_AGE, STATE_PENSION_AGE } from "./constants";
import { PortfolioState } from "./SimulationRunner";

export class RetirementCalculator {
    private targetAge: number
    private targetDrawdown: number

    constructor(targetAge: number, targetDrawdown: number) {
        this.targetAge = targetAge;
        this.targetDrawdown = targetDrawdown
    }

    updateRetirementState = (state: PortfolioState): PortfolioState => {
        if (state.retired) {
            return state;
        }
        if (state.age >= STATE_PENSION_AGE) {
            return { ...state, retired: true };
        }
        if (state.age >= this.targetAge) {
            if (state.isaValue >= ((EARLY_PENSION_AGE - state.age) * this.targetDrawdown)) {
                return { ...state, retired: true };
            }
        }

        return state;
    }
}
