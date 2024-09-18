import { PortfolioState } from "./SimulationRunner";
import targetAgeRetirementStrategy from "./targetAgeRetirementStrategy";

const state: PortfolioState = {
    age: 36,
    isaValue: 0,
    pensionValue: 0,
    interest: 0,
    retired: false,
    deferredRetirementCounter: 0,
    success: false
}

it("retires when age reached", () => {
    const targetAge = 55;
    const portfolioAtTargetAge = {...state, age: targetAge};
    const strategy = new targetAgeRetirementStrategy(targetAge);
    const { retired } = strategy.isRetired(portfolioAtTargetAge);
    expect(retired).toBe(true)
});

it("does not retire when not at target age", () => {
    const targetAge = 55;
    const strategy = new targetAgeRetirementStrategy(targetAge);
    const {retired} = strategy.isRetired(state);
    expect(retired).toBe(false)
});