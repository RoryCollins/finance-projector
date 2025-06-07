import { QueryDetails } from "./interfaces";
import { getRetirementStrategy } from "./RetirementStrategy";
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
    interest: 1,
    retired: false,
    deferredRetirementCounter: 0,
    success: false,
    annualDrawdown: query.targetDrawdown,
    targetAge: query.targetAge,
    targetDrawdown: query.targetDrawdown,
}

it("retires when age reached", () => {
    const portfolioAtTargetAge = {...state, age: query.targetAge, isaValue: 1_000_000};
    const strategy = getRetirementStrategy(query);
    const {retired} = strategy.updateRetirementState(portfolioAtTargetAge);
    expect(retired).toBe(true)
});

it("does not retire when not at target age", () => {
    const strategy = getRetirementStrategy(query);
    const {retired} = strategy.updateRetirementState(state);
    expect(retired).toBe(false)
});

it("defers retirement when interest below 1", () => {
    const strategy = getRetirementStrategy({...query, deferInCrash:true});
    const {retired, deferredRetirementCounter} = strategy.updateRetirementState({...state, age: query.targetAge, interest: 0.99});
    expect(retired).toBe(false)
    expect(deferredRetirementCounter).toBe(1)
});

it("force retirement when low interest deferral cap reached", () => {
    const strategy = getRetirementStrategy({...query, deferInCrash:true});
    const {retired} = strategy.updateRetirementState({...state, age: query.targetAge, interest: 0.99, deferredRetirementCounter: 3});
    expect(retired).toBe(true);
});

it("Does not retire if ISA cannot bridge to minimum pension age", () => {
    const strategy = getRetirementStrategy(query);
    const {retired} = strategy.updateRetirementState({...state, isaValue: 0, pensionValue: 1_000_000, age: query.targetAge});
    expect(retired).toBe(false)
});