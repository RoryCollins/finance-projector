import _ from "underscore";
import {PortfolioState, RiskAppetite, SimulationData, SimulationResults} from "./interfaces";
import {GetNormallyDistributedRandomNumber} from "./distribution";
import {getRetirementStrategy, RetirementStrategy} from "./retirement/RetirementStrategy";
import {NonRetiredSimulationState, SimulationState} from "./SimulationState";

export class SimulationRunner {
    readonly age: number;
    readonly initialIsaValue: number;
    readonly annualIsaContribution: number;
    readonly initialPensionValue: number;
    readonly annualPensionContribution: number;
    readonly distributionData: RiskAppetite[];
    readonly retirementStrategy: RetirementStrategy;
    readonly targetAge: number;
    readonly annualDrawdown: number;
    protected simulations: number;

    constructor(
        {
            personalDetails,
            query
        }: SimulationData,
        distributionData: RiskAppetite[],
    ) {
        this.age = personalDetails.age;
        this.initialIsaValue = personalDetails.initialIsa;
        this.annualIsaContribution = personalDetails.isaContribution;
        this.initialPensionValue = personalDetails.initialPension;
        this.annualPensionContribution = personalDetails.pensionContribution;
        this.annualDrawdown = query.targetDrawdown;
        this.targetAge = query.targetAge;
        this.distributionData = distributionData;
        this.simulations = 1_000;

        this.retirementStrategy = getRetirementStrategy(query)
    }

    Run = (): SimulationResults => {
        const rawResults = Array.from({length: this.simulations}, () => this.OneScenario());
        const successRate = rawResults.filter(it => it.success).length / this.simulations;
        const scenarios = rawResults.map(it => it.vals);
        const medianRetirementAge = rawResults.map(it => it.retirementAge).sort()[rawResults.length * .5]
        const t = _.zip(...scenarios).map(it => it.sort((a, b) => a - b))
        const annualData = t.map((year, i) => {
            return {
                age: this.age + i,
                percentile90: year[year.length * .9],
                percentile10: year[year.length * .1],
                median: year[year.length * .5]
            }
        });
        return {annualData, medianRetirementAge, successRate, drawdownAtRetirement: this.annualDrawdown};
    }

    private OneScenario = (): { vals: number[], retirementAge: number, success: boolean, annualDrawdown: number } => {

        const returns = this.getFiftyYearsOfReturns();

        const initialPortfolioState: PortfolioState = {
            age: this.age,
            isaValue: this.initialIsaValue,
            pensionValue: this.initialPensionValue,
            deferredRetirementCounter: 0,
            annualDrawdown: this.annualDrawdown,
            netWorthHistory: []
        }

        const initialSimulationState: SimulationState = new NonRetiredSimulationState(
            this.retirementStrategy,
            this.annualIsaContribution,
            this.annualPensionContribution,
            initialPortfolioState
        );

        const finalState = returns.reduce((acc: SimulationState, interest: number) => {
            return acc.progressYear(interest);
        }, initialSimulationState).portfolioState;

        return {
            vals: finalState.netWorthHistory,
            retirementAge: finalState.summary?.retirementAge!,
            success: finalState.summary?.success!,
            annualDrawdown: this.annualDrawdown
        }
    }

    private getFiftyYearsOfReturns = (): number[] => {
        return Array.from({length: 50}, (_, k) => this.getReturnForAge(this.age + k));
    }

    private getReturnForAge = (age: number): number => {
        return this.distributionData
            .filter(ra => ra.age <= age)
            .at(-1)!.distribution
            .map(d => (d.percentage / 100) * (GetNormallyDistributedRandomNumber(d.model.mean, d.model.standardDeviation)))
            .reduce((sum, d) => sum + d, 0);
    }
}