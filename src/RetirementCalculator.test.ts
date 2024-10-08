import { SAFE_WITHDRAWAL_RATE } from "./constants";
import { RetirementCalculator } from "./RetirementCalculator";
import { PortfolioState } from "./SimulationRunner";

const state: PortfolioState = {
    age: 36,
    isaValue: 60_000,
    pensionValue: 50_000,
    interest: 0,
    retired: false,
    deferredRetirementCounter: 0,
    success: false,
    annualDrawdown: 20_000
}

it("retires when age reached", () => {
    const targetAge = 55;
    const portfolioAtTargetAge = {...state, age: targetAge, isaValue: 1_000_000};
    const strategy = new RetirementCalculator(targetAge, state.annualDrawdown);
    const {retired} = strategy.updateRetirementState(portfolioAtTargetAge);
    expect(retired).toBe(true)
});

it("does not retire when not at target age", () => {
    const targetAge = 55;
    const strategy = new RetirementCalculator(targetAge, state.annualDrawdown);
    const {retired} = strategy.updateRetirementState(state);
    expect(retired).toBe(false)
});

it("Does not retire if ISA cannot bridge to minimum pension age", () => {
    const targetAge = 55;
    const strategy = new RetirementCalculator(targetAge, state.annualDrawdown);
    const {retired} = strategy.updateRetirementState({...state, isaValue: 0, pensionValue: 1_000_000, age: targetAge});
    expect(retired).toBe(false)
});

// it("works out annual drawdown allowance", () => {
//     const targetAge = 55;
//     const expectedDrawdown = (state.isaValue + state.pensionValue) * SAFE_WITHDRAWAL_RATE;
//     const portfolioAtTargetAge = {...state, age: targetAge};
//     const strategy = new targetAgeRetirementStrategy(targetAge);
//     const {annualDrawdown} = strategy.isRetired(portfolioAtTargetAge);
//     expect(annualDrawdown).toBe(expectedDrawdown);
// });