import { QueryDetails } from "./interfaces";
import { RetirementCalculator } from "./RetirementCalculator";
import { PortfolioState } from "./SimulationRunner";

const query: QueryDetails = {
    targetAge: 55,
    targetDrawdown: 20_000,
    deferInCrash: false,
}

const state: PortfolioState = {
    age: 36,
    isaValue: 60_000,
    pensionValue: 50_000,
    interest: 0,
    retired: false,
    deferredRetirementCounter: 0,
    success: false,
    annualDrawdown: query.targetDrawdown
}

it("retires when age reached", () => {
    const targetAge = 55;
    const portfolioAtTargetAge = {...state, age: targetAge, isaValue: 1_000_000};
    const strategy = new RetirementCalculator(query);
    const {retired} = strategy.updateRetirementState(portfolioAtTargetAge);
    expect(retired).toBe(true)
});

it("does not retire when not at target age", () => {
    const strategy = new RetirementCalculator(query);
    const {retired} = strategy.updateRetirementState(state);
    expect(retired).toBe(false)
});

it("Does not retire if ISA cannot bridge to minimum pension age", () => {
    const strategy = new RetirementCalculator(query);
    const {retired} = strategy.updateRetirementState({...state, isaValue: 0, pensionValue: 1_000_000, age: query.targetAge});
    expect(retired).toBe(false)
});