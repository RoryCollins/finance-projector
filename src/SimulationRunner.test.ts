import {EARLY_PENSION_AGE, STATE_PENSION_AGE} from "./constants";
import {SimulationData, StatisticalModel} from "./interfaces";
import {RetirementStrategy} from "./RetirementStrategy";
import SimulationRunner, {PortfolioState} from "./SimulationRunner"
import targetAgeRetirementStrategy from "./targetAgeRetirementStrategy";
import {targetValueRetirementStrategy} from "./targetValueRetirementStrategy";

class NeverRetire implements RetirementStrategy {
    isRetired(state: PortfolioState): PortfolioState {
        return {...state, retired: false};
    }
}

const NO_GROWTH: StatisticalModel = {mean: 1, standardDeviation: 0}
const NEVER_RETIRE = new NeverRetire();

let A_Simulation: SimulationData = {
    age: 0,
    initialIsaValue: 0,
    initialPensionValue: 0,
    annualIsaContribution: 0,
    annualPensionContribution: 0,
    annualDrawdown: 0,
    safeWithdrawalRate: 0.04
}

it("A simulation with no growth, variance or contribution does not grow", () => {
    const initialValue = 10000;
    const runner = new SimulationRunner(
        {...A_Simulation, initialIsaValue: initialValue},
        [{age: A_Simulation.age, distribution: [{model: NO_GROWTH, percentage: 100}]}]);
    const results = runner.Run().annualData;
    expect(results[results.length - 1].median).toEqual(initialValue)
});

it("A simulation reaches Safe Withdrawal Rate and draws down", () => {
    const age = 30
    const drawdown = 50000;
    const swr = 0.04;
    const savingsTarget = drawdown / swr;
    const contribution = 50000
    const expectedRetirementAge = age + (savingsTarget / contribution)

    const runner = new SimulationRunner(
        {...A_Simulation, annualIsaContribution: contribution, annualDrawdown: drawdown, safeWithdrawalRate: swr, age},
        [{age: A_Simulation.age, distribution: [{model: NO_GROWTH, percentage: 100}]}]);
    const {annualData, medianRetirementAge} = runner.Run();
    expect(medianRetirementAge).toEqual(expectedRetirementAge);
    expect(annualData[annualData.length - 1].median).toEqual(0);
});


it("A simulation reaches target age and draws down", () => {
    const age = 30;
    const targetAge = 55;
    const contribution = 50000

    const runner = new SimulationRunner(
        {...A_Simulation, annualIsaContribution: contribution, age},
        [{age: A_Simulation.age, distribution: [{model: NO_GROWTH, percentage: 100}]}],
        new targetAgeRetirementStrategy(55)
    );
    const {medianRetirementAge} = runner.Run();
    expect(medianRetirementAge).toEqual(targetAge)
});


it("Retires at 68 even if other conditions not met", () => {
    const runner = new SimulationRunner(
        {...A_Simulation, annualDrawdown: 100000, age: 35},
        [{age: A_Simulation.age, distribution: [{model: NO_GROWTH, percentage: 100}]}]);
    const {medianRetirementAge} = runner.Run();
    expect(medianRetirementAge).toEqual(STATE_PENSION_AGE);
});

it("A portfolio with wealth stored in a pension cannot be accessed before the set age", () => {
    const runner = new SimulationRunner(
        {...A_Simulation, initialPensionValue: 1000000, annualDrawdown: 1000, age: 45},
        [{age: A_Simulation.age, distribution: [{model: NO_GROWTH, percentage: 100}]}]);
    const {medianRetirementAge} = runner.Run();
    expect(medianRetirementAge).toEqual(EARLY_PENSION_AGE);
});

it("Early retirement can only be reached when there is enough in ISA to last until pension access", () => {
    const annualDrawdown = 25000;
    const initialIsaValue = annualDrawdown * 4;

    const runner = new SimulationRunner(
        {...A_Simulation, initialIsaValue, initialPensionValue: 1000000, annualDrawdown, age: 45},
        [{age: 45, distribution: [{model: NO_GROWTH, percentage: 100}]}]);
    const {medianRetirementAge} = runner.Run();
    expect(medianRetirementAge).toEqual(EARLY_PENSION_AGE - 4);
});

it("Defers retirement for up to three years when the stock market returns are negative", () => {
    const runner = new SimulationRunner(
        {...A_Simulation, initialPensionValue: 1000000, annualDrawdown: 1000, age: 45},
        [{age: 45, distribution: [{model: {mean: 0.99, standardDeviation: 0}, percentage: 100}]}]);
    const {medianRetirementAge} = runner.Run();
    expect(medianRetirementAge).toEqual(EARLY_PENSION_AGE + 3);
});

it("Determines success rate of scenario", () => {
    const runner = new SimulationRunner(
        {...A_Simulation, initialPensionValue: 1000, annualDrawdown: 10000, age: 67},
        [{age: 67, distribution: [{model: NO_GROWTH, percentage: 100}]}],
        new targetValueRetirementStrategy(10000, .035),
        1);
    const {successRate} = runner.Run();
    expect(successRate).toEqual(0);
})

it("Success rate is zero when retiring early on no isa", () => {
    const simulation: SimulationData = {
        age: 30,
        annualDrawdown: 20000,
        annualIsaContribution: 0,
        annualPensionContribution: 24000,
        initialIsaValue: 0,
        initialPensionValue: 30000,
        safeWithdrawalRate: 0.035,
    }
    const runner = new SimulationRunner(
        simulation,
        [{age: 30, distribution: [{model: NO_GROWTH, percentage: 100}]}],
        new targetAgeRetirementStrategy(55),
        1
    );
    const {successRate} = runner.Run();
    expect(successRate).toEqual(0);
})

it("Risk appetite affects returns", () => {
    const startingAge = 36;
    const statisticalModelA: StatisticalModel = {
        mean: 2,
        standardDeviation: 0
    }
    const statisticalModelB: StatisticalModel = {
        mean: 1,
        standardDeviation: 0
    }
    const runner = new SimulationRunner(
        {...A_Simulation, initialPensionValue: 1000, age: startingAge},
        [{
            age: startingAge,
            distribution: [{
                model: statisticalModelA,
                percentage: 100
            }]
        },
            {
                age: startingAge + 1,
                distribution: [{
                    model: statisticalModelB,
                    percentage: 100
                }]
            }],
        NEVER_RETIRE);
    const {annualData} = runner.Run();
    expect(annualData[annualData.length - 1].median).toEqual(2000)
});
