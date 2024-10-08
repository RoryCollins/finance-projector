import { targetValueRetirementStrategy } from "./targetValueRetirementStrategy";
import { PortfolioState } from "./SimulationRunner";
import { EARLY_PENSION_AGE, SAFE_WITHDRAWAL_RATE } from "./constants";

const portfolio: PortfolioState = {
    age: 30,
    isaValue: 100_000,
    pensionValue: 100_000,
    interest: 1,
    retired: false,
    deferredRetirementCounter: 0,
    success: false,
    annualDrawdown: 30_000
}

it("retires when threshold reached", () => {
    const drawdown = 1000;
    const swrStrategy = new targetValueRetirementStrategy(drawdown);
    const requiredTotalValue = (drawdown / SAFE_WITHDRAWAL_RATE)
    const requiredIsaValue = (EARLY_PENSION_AGE - portfolio.age) * drawdown
    const requiredPensionValue = Math.max(0, requiredTotalValue-requiredIsaValue);

    let {retired} = swrStrategy.isRetired({
        ...portfolio, 
        isaValue: requiredIsaValue, 
        pensionValue: requiredPensionValue
    });
    expect(retired).toBe(true);
})

// it("does not retire when pension is not reached", () => {
//     const drawdown = 1000;
//     const swrStrategy = new targetValueRetirementStrategy(drawdown);
//     const requiredTotalValue = (drawdown / SAFE_WITHDRAWAL_RATE)
//     const requiredIsaValue = (EARLY_PENSION_AGE - portfolio.age) * drawdown
//     const requiredPensionValue = Math.max(0, requiredTotalValue-requiredIsaValue) - 1;

//     let {retired} = swrStrategy.isRetired({
//         ...portfolio, 
//         isaValue: requiredIsaValue, 
//         pensionValue: requiredPensionValue
//     });
//     expect(retired).toBe(false);
// })

// it("does not retire when isa is not reached", () => {
//     const drawdown = 1000;
//     const swrStrategy = new targetValueRetirementStrategy(drawdown);
//     const requiredTotalValue = (drawdown / SAFE_WITHDRAWAL_RATE)
//     const requiredIsaValue = ((EARLY_PENSION_AGE - portfolio.age) * drawdown) - 1
//     const requiredPensionValue = Math.max(0, requiredTotalValue-requiredIsaValue);

//     let {retired} = swrStrategy.isRetired({
//         ...portfolio, 
//         isaValue: requiredIsaValue, 
//         pensionValue: requiredPensionValue
//     });
//     expect(retired).toBe(false);
// })

it("defers retirement in bad years", () =>{
    const drawdown = 1000;
    const swrStrategy = new targetValueRetirementStrategy(drawdown);

    let {retired, deferredRetirementCounter} = swrStrategy.isRetired({
        ...portfolio,
        interest: 0.99
    });
    expect(retired).toBe(false);
    expect(deferredRetirementCounter).toBe(1);
});

it("does not defer retirement beyond three years", () =>{
    const drawdown = 1000;
    const swrStrategy = new targetValueRetirementStrategy(drawdown);

    let {retired} = swrStrategy.isRetired({
        ...portfolio,
        interest: 0.99,
        deferredRetirementCounter: 3
    });
    expect(retired).toBe(true);
});