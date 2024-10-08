import { SAFE_WITHDRAWAL_RATE } from "./constants";
import { RetirementStrategy } from "./RetirementStrategy";
import { PortfolioState } from "./SimulationRunner";

export default class targetAgeRetirementStrategy implements RetirementStrategy {
    private readonly targetAge: number;

    constructor(targetAge: number) {
        this.targetAge = targetAge;
    }

    isRetired(state: PortfolioState): PortfolioState {
        if (state.retired) {
            return state;
        }
        const retired = state.age === this.targetAge;
        const annualDrawdown = retired
            ? (state.isaValue + state.pensionValue) * SAFE_WITHDRAWAL_RATE
            : state.annualDrawdown;
        return { ...state, retired, annualDrawdown };
    }

}