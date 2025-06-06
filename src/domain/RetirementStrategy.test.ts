import { SAFE_WITHDRAWAL_RATE } from "./constants";
import { QueryDetails } from "./interfaces";
import { RetirementStrategy } from "./RetirementStrategy";
import { PortfolioState } from "./SimulationRunner";

const query: QueryDetails = {
    targetAge: 55,
    targetDrawdown: 20_000,
    deferInCrash: false,
    deferUntilSwr: false,
}

const state: PortfolioState = {
    age: 36,
    isaValue: 60_000,
    pensionValue: 50_000,
    interest: 1,
    retired: false,
    deferredRetirementCounter: 0,
    success: false,
    annualDrawdown: query.targetDrawdown
}

it("retires when age reached", () => {
    const portfolioAtTargetAge = {...state, age: query.targetAge, isaValue: 1_000_000};
    const strategy = new RetirementStrategy(query);
    const {retired} = strategy.updateRetirementState(portfolioAtTargetAge);
    expect(retired).toBe(true)
});

it("does not retire when not at target age", () => {
    const strategy = new RetirementStrategy(query);
    const {retired} = strategy.updateRetirementState(state);
    expect(retired).toBe(false)
});

it("defers retirement when interest below 1", () => {
    const strategy = new RetirementStrategy({...query, deferInCrash:true});
    const {retired, deferredRetirementCounter} = strategy.updateRetirementState({...state, age: query.targetAge, interest: 0.99});
    expect(retired).toBe(false)
    expect(deferredRetirementCounter).toBe(1)
});

it("Does not retire if ISA cannot bridge to minimum pension age", () => {
    const strategy = new RetirementStrategy(query);
    const {retired} = strategy.updateRetirementState({...state, isaValue: 0, pensionValue: 1_000_000, age: query.targetAge});
    expect(retired).toBe(false)
});

it("defers retirement when swr is not met", () => {
    const strategy = new RetirementStrategy({...query, deferUntilSwr:true});
    const {retired, deferredRetirementCounter} = strategy.updateRetirementState({...state, age: query.targetAge});
    expect(retired).toBe(false)
    expect(deferredRetirementCounter).toBe(1)
})

it("reduces drawdown when swr is still not met 3 years after targetAge", () => {
    const strategy = new RetirementStrategy({...query, deferUntilSwr:true});
    const {retired, annualDrawdown} = strategy.updateRetirementState({...state, age: query.targetAge, deferredRetirementCounter: 3});
    expect(retired).toBe(true)
    expect(annualDrawdown).toBe((state.isaValue + state.pensionValue) * SAFE_WITHDRAWAL_RATE)
})