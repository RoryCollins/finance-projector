import { PortfolioState } from "./SimulationRunner";

export abstract class RetirementStrategy {
    abstract isRetired(state: PortfolioState): { retired: boolean; deferredRetirementCounter: number; };
}
