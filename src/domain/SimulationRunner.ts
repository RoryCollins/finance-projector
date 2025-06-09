import _ from "underscore";
import {RiskAppetite, SimulationData, SimulationResults} from "./interfaces";
import {GetNormallyDistributedRandomNumber} from "./distribution";
import {getRetirementStrategy, RetirementStrategy} from "./RetirementStrategy";
import {getInitialSimulationState, SimulationState } from "./SimulationState";

export interface PortfolioState {
    age: number,
    isaValue: number,
    pensionValue: number,
    interest: number, // TODO: should this be removed?
    retired: boolean,
    deferredRetirementCounter: number,
    annualDrawdown: number,
    success?: boolean, // TODO: should this be replaced with a SimulationState?
    targetAge: number, // TODO: should this be removed?
}

export default class SimulationRunner {
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
        const s = Array.from({length: this.simulations}, () => this.OneScenario());
        const successRate = s.filter(it => it.success).length / this.simulations;
        const scenarios = s.map(it => it.vals);
        const medianRetirementAge = s.map(it => it.retirementAge).sort()[s.length * .5]
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
            interest: 0,
            retired: false,
            deferredRetirementCounter: 0,
            success: true,
            annualDrawdown: this.annualDrawdown,
            targetAge: this.targetAge,
        }

        const initialG : SimulationState = getInitialSimulationState(
            this.retirementStrategy,
            this.annualIsaContribution,
            this.annualPensionContribution,
            initialPortfolioState
        );

        const g =  returns.reduce((acc: {state: SimulationState, totalNetworth: Array<number>}, interest: number) => {
            var newState = acc.state.progressYear(interest);
            return {state: newState, totalNetworth: [...acc.totalNetworth, newState.portfolioState.isaValue + newState.portfolioState.pensionValue]};
        }, {state: initialG, totalNetworth: [initialPortfolioState.pensionValue + initialPortfolioState.isaValue]});

        return {
            vals: g.totalNetworth,
            retirementAge: g.state.portfolioState.summary?.retirementAge!,
            success: g.state.portfolioState.summary?.success ?? true,
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