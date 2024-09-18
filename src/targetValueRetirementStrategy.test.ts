import { targetValueRetirementStrategy } from "./targetValueRetirementStrategy";
import { PortfolioState } from "./SimulationRunner";

const portfolio: PortfolioState = {
    age: 30,
    isaValue: 100000,
    pensionValue: 100000,
    interest: 1,
    retired: false,
    deferredRetirementCounter: 0,
    success: false
}

it("retires when threshold reached", () => {
    const drawdown = 1000;
    const swrStrategy = new targetValueRetirementStrategy(drawdown, 0.035);
    const requiredTotalValue = (drawdown / .035)
    const requiredIsaValue = (58 - portfolio.age) * drawdown
    const requiredPensionValue = Math.max(0, requiredTotalValue-requiredIsaValue);

    let {retired} = swrStrategy.isRetired({
        ...portfolio, 
        isaValue: requiredIsaValue, 
        pensionValue: requiredPensionValue
    });
    expect(retired).toBe(true);
})

it("does not retire when pension is not reached", () => {
    const drawdown = 1000;
    const swrStrategy = new targetValueRetirementStrategy(drawdown, 0.035);
    const requiredTotalValue = (drawdown / .035)
    const requiredIsaValue = (58 - portfolio.age) * drawdown
    const requiredPensionValue = Math.max(0, requiredTotalValue-requiredIsaValue) - 1;

    let {retired} = swrStrategy.isRetired({
        ...portfolio, 
        isaValue: requiredIsaValue, 
        pensionValue: requiredPensionValue
    });
    expect(retired).toBe(false);
})

it("does not retire when isa is not reached", () => {
    const drawdown = 1000;
    const swrStrategy = new targetValueRetirementStrategy(drawdown, 0.035);
    const requiredTotalValue = (drawdown / .035)
    const requiredIsaValue = ((58 - portfolio.age) * drawdown) - 1
    const requiredPensionValue = Math.max(0, requiredTotalValue-requiredIsaValue);

    let {retired} = swrStrategy.isRetired({
        ...portfolio, 
        isaValue: requiredIsaValue, 
        pensionValue: requiredPensionValue
    });
    expect(retired).toBe(false);
})

it("defers retirement in bad years", () =>{
    const drawdown = 1000;
    const swrStrategy = new targetValueRetirementStrategy(drawdown, 0.035);

    let {retired, deferredRetirementCounter} = swrStrategy.isRetired({
        ...portfolio,
        interest: 0.99
    });
    expect(retired).toBe(false);
    expect(deferredRetirementCounter).toBe(1);
});

it("does not defer retirement beyond three years", () =>{
    const drawdown = 1000;
    const swrStrategy = new targetValueRetirementStrategy(drawdown, 0.035);

    let {retired, deferredRetirementCounter} = swrStrategy.isRetired({
        ...portfolio,
        interest: 0.99,
        deferredRetirementCounter: 3
    });
    expect(retired).toBe(true);
});