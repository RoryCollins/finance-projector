import { RetirementStrategy } from "./RetirementStrategy";
import { PortfolioState } from "./SimulationRunner";

export default class targetAgeRetirementStrategy implements RetirementStrategy {
    private readonly targetAge: number;

    constructor(targetAge: number) {
        this.targetAge = targetAge;
    }

    isRetired(state: PortfolioState): PortfolioState {
        const retired = state.age === this.targetAge;
        const annualDrawdown = retired ? (state.isaValue + state.pensionValue) * .085 : state.annualDrawdown;
        return {...state, retired, annualDrawdown};
    }

}