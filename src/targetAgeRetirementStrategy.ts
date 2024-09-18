import { RetirementStrategy } from "./RetirementStrategy";
import { PortfolioState } from "./SimulationRunner";

export default class targetAgeRetirementStrategy implements RetirementStrategy {
    private readonly targetAge: number;

    constructor(targetAge: number) {
        this.targetAge = targetAge;
    }

    isRetired(state: PortfolioState): { retired: boolean; deferredRetirementCounter: number; } {
        return {retired: state.age === this.targetAge, deferredRetirementCounter: 0};
    }

}