import { SimulationData, StatisticalModel } from "./interfaces";
import SimulationRunner, { GetNormallyDistributedRandomNumber } from "./SimulationRunner"

const statePensionAge = 68;
const earlyPensionAge = statePensionAge - 10;
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
    const startingAgeToBypassPensionReq = 100
    const expectedRetirementAge = startingAgeToBypassPensionReq + (savingsTarget / contribution)

    const runner = new SimulationRunner(
        {...A_Simulation, age: startingAgeToBypassPensionReq, annualIsaContribution: contribution, annualDrawdown: drawdown, safeWithdrawalRate: swr },
        NO_GROWTH);
    const {annualData, medianRetirementAge} = runner.Run();
    expect(medianRetirementAge).toEqual(expectedRetirementAge);
    expect(annualData[annualData.length-1].median).toEqual(0);
});

it("Retires at 68 even if other conditions not met", () => {
    const runner = new SimulationRunner(
        {...A_Simulation, annualDrawdown: 100000, age: 35},
        NO_GROWTH);
    const {medianRetirementAge} = runner.Run();
    expect(medianRetirementAge).toEqual(statePensionAge);
});

it("A portfolio with wealth stored in a pension cannot be accessed before the set age", () => {
    const runner = new SimulationRunner(
        {...A_Simulation, initialPensionValue: 1000000, annualDrawdown: 1000, age: 45},
        NO_GROWTH);
    const {medianRetirementAge} = runner.Run();
    expect(medianRetirementAge).toEqual(earlyPensionAge);
});

it("Early retirement can only be reached when there is enough in ISA to last until pension access", () => {
    const annualDrawdown = 25000;
    const initialIsaValue = annualDrawdown * 4;

    const runner = new SimulationRunner(
        {...A_Simulation, initialIsaValue, initialPensionValue: 1000000, annualDrawdown, age: 45},
        NO_GROWTH);
    const {medianRetirementAge} = runner.Run();
    expect(medianRetirementAge).toEqual(earlyPensionAge-4);
});

it("Defers retirement for up to three years when the stock market returns are negative", () => {
    const runner = new SimulationRunner(
        {...A_Simulation, initialPensionValue: 1000000, annualDrawdown: 1000, age: 45},
        {mean: 0.99, standardDeviation:0});
    const {medianRetirementAge} = runner.Run();
    expect(medianRetirementAge).toEqual(earlyPensionAge+3);
});

it("Determines success rate of scenario", () => {
    const runner = new SimulationRunner(
        {...A_Simulation, initialPensionValue: 1000, annualDrawdown: 10000, age: 67},
        NO_GROWTH);
    const {successRate, medianRetirementAge} = runner.Run();
    expect(successRate).toEqual(0);
})