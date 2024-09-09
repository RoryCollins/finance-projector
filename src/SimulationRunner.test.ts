import { SimulationData, StatisticalModel } from "./interfaces";
import SimulationRunner, { GetNormallyDistributedRandomNumber } from "./SimulationRunner"

const NO_GROWTH : StatisticalModel = {mean: 1, standardDeviation: 0}
let A_Simulation : SimulationData = {
    age: 0,
    initialIsaValue: 0,
    initialPensionValue: 0,
    annualIsaContribution: 0,
    annualPensionContribution: 0,
    annualDrawdown: 0,
    safeWithdrawalRate: 0.04
}

it("Generates random numbers in a normal distribution", () => {
    const randomNumbers = Array.from({length: 10000}, () => GetNormallyDistributedRandomNumber(0, 1));

    const randomNumbersWithinOneStandardDeviation = randomNumbers.filter(i => i < 1.0 && i > -1).length;
    const randomNumbersWithinTwoStandardDeviations = randomNumbers.filter(i => i < 2.0 && i > -2).length;

    //Expect Approx. 68%, allow 2% for tolerance
    expect(randomNumbersWithinOneStandardDeviation).toBeGreaterThanOrEqual(6600);
    expect(randomNumbersWithinOneStandardDeviation).toBeLessThanOrEqual(7000);

    //Expect Approx. 95%, allow 2% for tolerance
    expect(randomNumbersWithinTwoStandardDeviations).toBeGreaterThanOrEqual(9300);
    expect(randomNumbersWithinTwoStandardDeviations).toBeLessThanOrEqual(9700);
});

it("A simulation with no growth, variance or contribution does not grow", () => {
    const initialValue = 10000;
    const runner = new SimulationRunner(
        {...A_Simulation, initialIsaValue: initialValue},
        NO_GROWTH);
    const results = runner.Run().annualData;
    expect(results[results.length-1].median).toEqual(initialValue)
});

it("A simulation with sufficient initialValue retires and draws down", () => {
    const runner = new SimulationRunner(
        {...A_Simulation, initialIsaValue: 1000000, annualDrawdown: 1000},
        NO_GROWTH);
    const results = runner.Run().annualData;
    expect(results[results.length-1].median).toEqual(950000)
});

it("A simulation reaches Safe Withdrawal Rate and draws down", () => {
    const drawdown = 50000;
    const swr = 0.04;
    const savingsTarget = drawdown / swr;
    const contribution = 50000
    const expectedRetirementAge = (savingsTarget / contribution) + 1

    const runner = new SimulationRunner(
        {...A_Simulation, annualIsaContribution: contribution, annualDrawdown: drawdown, safeWithdrawalRate: swr },
        NO_GROWTH);
    const {annualData, medianRetirementAge} = runner.Run();
    expect(annualData[annualData.length-1].median).toEqual(0);
    expect(medianRetirementAge).toEqual(expectedRetirementAge);
});

it("A portfolio with wealth stored in a pension cannot be accessed before the set age", () => {
    const runner = new SimulationRunner(
        {...A_Simulation, initialPensionValue: 1000000, annualDrawdown: 1000, age: 45},
        NO_GROWTH);
    const {medianRetirementAge} = runner.Run();
    expect(medianRetirementAge).toEqual(58);
});