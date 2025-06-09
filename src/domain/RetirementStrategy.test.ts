import { StrategyQuery } from "./interfaces";
import { getRetirementStrategy, RetirementQuery } from "./RetirementStrategy";

const strategyQuery: StrategyQuery = {
    targetAge: 55,
    targetDrawdown: 20_000,
    deferInCrash: false,
    bridgeTheGap: false
}

const retirementQuery : RetirementQuery = {
    age: 36,
    isaValue: 60_000,
    pensionValue: 50_000,
    interest: 1,
    deferredRetirementCounter: 0,
    annualDrawdown: strategyQuery.targetDrawdown,
}

it("retires when age reached", () => {
    const portfolioAtTargetAge = {...retirementQuery, age: strategyQuery.targetAge, isaValue: 1_000_000};
    const strategy = getRetirementStrategy(strategyQuery);
    const {retired} = strategy.updateRetirementState(portfolioAtTargetAge);
    expect(retired).toBe(true)
});

it("does not retire when not at target age", () => {
    const strategy = getRetirementStrategy(strategyQuery);
    const {retired} = strategy.updateRetirementState(retirementQuery);
    expect(retired).toBe(false)
});

it("defers retirement when interest below 1", () => {
    const strategy = getRetirementStrategy({...strategyQuery, deferInCrash:true});
    const {retired, deferredRetirementCounter} = strategy.updateRetirementState({...retirementQuery, age: strategyQuery.targetAge, interest: 0.99});
    expect(retired).toBe(false)
    expect(deferredRetirementCounter).toBe(1)
});

it("force retirement when low interest deferral cap reached", () => {
    const strategy = getRetirementStrategy({...strategyQuery, deferInCrash:true});
    const {retired} = strategy.updateRetirementState({...retirementQuery, age: strategyQuery.targetAge, interest: 0.99, deferredRetirementCounter: 3});
    expect(retired).toBe(true);
});

it("Does not retire if ISA cannot bridge to minimum pension age", () => {
    const strategy = getRetirementStrategy({...strategyQuery,  bridgeTheGap:true});
    const {retired} = strategy.updateRetirementState({...retirementQuery, isaValue: 0, pensionValue: 1_000_000, age: strategyQuery.targetAge});
    expect(retired).toBe(false)
});