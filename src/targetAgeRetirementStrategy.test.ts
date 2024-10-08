import { SAFE_WITHDRAWAL_RATE } from "./constants";
import {PortfolioState} from "./SimulationRunner";
import targetAgeRetirementStrategy from "./targetAgeRetirementStrategy";

const state: PortfolioState = {
    age: 36,
    isaValue: 50_000,
    pensionValue: 50_000,
    interest: 0,
    retired: false,
    deferredRetirementCounter: 0,
    success: false,
    annualDrawdown: 30_000
}

it("retires when age reached", () => {
    const targetAge = 55;
    const portfolioAtTargetAge = {...state, age: targetAge};
    const strategy = new targetAgeRetirementStrategy(targetAge);
    const {retired} = strategy.isRetired(portfolioAtTargetAge);
    expect(retired).toBe(true)
});

it("does not retire when not at target age", () => {
    const targetAge = 55;
    const strategy = new targetAgeRetirementStrategy(targetAge);
    const {retired} = strategy.isRetired(state);
    expect(retired).toBe(false)
});

it("works out annual drawdown allowance", () => {
    const targetAge = 55;
    const expectedDrawdown = (state.isaValue + state.pensionValue) * SAFE_WITHDRAWAL_RATE;
    const portfolioAtTargetAge = {...state, age: targetAge};
    const strategy = new targetAgeRetirementStrategy(targetAge);
    const {annualDrawdown} = strategy.isRetired(portfolioAtTargetAge);
    expect(annualDrawdown).toBe(expectedDrawdown);
});