import { EARLY_PENSION_AGE, SAFE_WITHDRAWAL_RATE, STATE_PENSION_AGE } from "./constants";
import { RiskAppetite, SimulationData, StatisticalModel } from "./interfaces";
import { RetirementStrategy } from "./RetirementStrategy";
import SimulationRunner, { PortfolioState } from "./SimulationRunner"
import targetAgeRetirementStrategy from "./targetAgeRetirementStrategy";
import { targetValueRetirementStrategy } from "./targetValueRetirementStrategy";

class NeverRetire implements RetirementStrategy {
    isRetired(state: PortfolioState): PortfolioState {
        return { ...state, retired: false };
    }
}

class TestSimulationRunner extends SimulationRunner {
    constructor(
        simulationData: SimulationData,
        retirementStrategy: RetirementStrategy = new targetValueRetirementStrategy(simulationData.query.targetDrawdown!),
        distributionData: RiskAppetite[] = [{ age: simulationData.personalDetails.age, distribution: [{ model: NO_GROWTH, percentage: 100 }] }]
    ) {
        super(simulationData, distributionData, retirementStrategy);
        this.simulations = 10;
    }
}

const NO_GROWTH: StatisticalModel = { mean: 1, standardDeviation: 0 }
const NEVER_RETIRE = new NeverRetire();

let A_Simulation: SimulationData = {
    personalDetails: {
        age: 0,
        initialIsa: 0,
        initialPension: 0,
        isaContribution: 0,
        pensionContribution: 0,
    },
    query: {
        targetDrawdown: 0,
        targetAge: 0
    }
}

it("A simulation with no growth, variance or contribution does not grow", () => {
    const initialValue = 10_000;
    const runner = new TestSimulationRunner({
        ...A_Simulation,
        personalDetails: { ...A_Simulation.personalDetails, initialIsa: initialValue }
    });
    const results = runner.Run().annualData;
    expect(results[results.length - 1].median).toEqual(initialValue)
});

it("A simulation reaches Safe Withdrawal Rate and draws down", () => {
    const age = 30
    const drawdown = 50_000;
    const savingsTarget = drawdown / SAFE_WITHDRAWAL_RATE;
    const contribution = 50_000
    const expectedRetirementAge = Math.ceil(age + (savingsTarget / contribution))

    const runner = new TestSimulationRunner({
        ...A_Simulation,
        personalDetails: { ...A_Simulation.personalDetails, isaContribution: contribution, age },
        query: { ...A_Simulation.query, targetDrawdown: drawdown }
    });
    const { medianRetirementAge } = runner.Run();
    expect(medianRetirementAge).toEqual(expectedRetirementAge);
});


it("A simulation reaches target age and draws down", () => {
    const age = 30;
    const targetAge = 55;
    const isaContribution = 50_000

    const runner = new TestSimulationRunner(
        {
            ...A_Simulation,
            personalDetails: { ...A_Simulation.personalDetails, isaContribution, age }
        },
        new targetAgeRetirementStrategy(55)
    );
    const { medianRetirementAge } = runner.Run();
    expect(medianRetirementAge).toEqual(targetAge)
});


it("Retires at 68 even if other conditions not met", () => {
    const runner = new TestSimulationRunner({
        ...A_Simulation,
        personalDetails: { ...A_Simulation.personalDetails, age: 35 },
        query: { ...A_Simulation.query, targetDrawdown: 100_000 }
    });
    const { medianRetirementAge } = runner.Run();
    expect(medianRetirementAge).toEqual(STATE_PENSION_AGE);
});

it("A portfolio with wealth stored in a pension cannot be accessed before the set age", () => {
    const runner = new TestSimulationRunner({
        ...A_Simulation,
        personalDetails: { ...A_Simulation.personalDetails, age: 45, initialPension: 1_000_000 },
        query: { ...A_Simulation.query, targetDrawdown: 1_000 }
    });
    const { medianRetirementAge } = runner.Run();
    expect(medianRetirementAge).toEqual(EARLY_PENSION_AGE);
});

it("Early retirement can only be reached when there is enough in ISA to last until pension access", () => {
    const targetDrawdown = 25000;
    const initialIsa = targetDrawdown * 4;

    const runner = new TestSimulationRunner({
        ...A_Simulation,
        personalDetails: { ...A_Simulation.personalDetails, age: 45, initialPension: 1_000_000, initialIsa },
        query: { ...A_Simulation.query, targetDrawdown }
    });
    const { medianRetirementAge } = runner.Run();
    expect(medianRetirementAge).toEqual(EARLY_PENSION_AGE - 4);
});

it("Defers retirement for up to three years when the stock market returns are negative", () => {
    const runner = new TestSimulationRunner(
        {
            ...A_Simulation,
            personalDetails: { ...A_Simulation.personalDetails, age: 45, initialPension: 1_000_000 },
            query: { ...A_Simulation.query, targetDrawdown: 1000 }
        },
        undefined,
        [{ age: 45, distribution: [{ model: { mean: 0.99, standardDeviation: 0 }, percentage: 100 }] }]);

    const { medianRetirementAge } = runner.Run();
    expect(medianRetirementAge).toEqual(EARLY_PENSION_AGE + 3);
});

it("Success rate is one with adequate savings", () => {
    const runner = new TestSimulationRunner({
        ...A_Simulation,
        personalDetails: { ...A_Simulation.personalDetails, age: 67, initialPension: 1_000_000 },
        query: { ...A_Simulation.query, targetDrawdown: 10_000 }
    });
    const { successRate } = runner.Run();
    expect(successRate).toEqual(1);
})

it("Success rate is zero when retiring early on no isa", () => {
    const runner = new TestSimulationRunner(
        {
            personalDetails: { ...A_Simulation.personalDetails, age: 30, pensionContribution: 24_000, initialPension: 30_000 },
            query: { targetDrawdown: 20_000 }
        },
        new targetAgeRetirementStrategy(55)
    );
    const { successRate } = runner.Run();
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
    const riskAppetite = [{
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
        }]
    const runner = new TestSimulationRunner(
        {
            ...A_Simulation,
            personalDetails: { ...A_Simulation.personalDetails, age: startingAge, initialPension: 1_000 },
        },
        NEVER_RETIRE,
        riskAppetite
    );
    const { annualData } = runner.Run();
    expect(annualData[annualData.length - 1].median).toEqual(2000)
});
