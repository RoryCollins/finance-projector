import { StatisticalModel } from "./interfaces";
import SimulationRunner, { GetNormallyDistributedRandomNumber } from "./SimulationRunner"

const NO_GROWTH : StatisticalModel = {mean: 1, standardDeviation: 0}

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
        { age: 36, initialValue, annualContribution: 0, annualDrawdown: 0 },
        NO_GROWTH);
    const results = runner.Run();
    expect(results[results.length-1].median).toEqual(initialValue)
});

it("A simulation with sufficient initialValue retires and draws down", () => {
    const runner = new SimulationRunner(
        { age: 36, initialValue: 1000000, annualContribution: 0, annualDrawdown: 1000 },
        NO_GROWTH);
    const results = runner.Run();
    expect(results[results.length-1].median).toEqual(950000)
});

it("A simulation reaches retirement and draws down", () => {
    const drawdown = 50000

    const runner = new SimulationRunner(
        { age: 36, initialValue: 0, annualContribution: drawdown, annualDrawdown: drawdown },
        NO_GROWTH);
    const results = runner.Run();
    console.log(results);
    expect(results[results.length-1].median).toEqual(0)
});