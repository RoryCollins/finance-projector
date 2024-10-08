import _ from "underscore";
import { RiskAppetite, SimulationData, SimulationResults } from "./interfaces";
import { GetNormallyDistributedRandomNumber } from "./distribution";
import { RetirementCalculator } from "./RetirementCalculator";
import { EARLY_PENSION_AGE } from "./constants";

export interface PortfolioState {
    age: number,
    isaValue: number,
    pensionValue: number,
    interest: number,
    retired: boolean,
    deferredRetirementCounter: number,
    annualDrawdown: number,
    success: boolean,
}

export default class SimulationRunner {
    readonly age: number;
    readonly initialIsaValue: number;
    readonly annualIsaContribution: number;
    readonly initialPensionValue: number;
    readonly annualPensionContribution: number;
    readonly distributionData: RiskAppetite[];
    readonly retirementStrategy: RetirementCalculator;
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

        this.retirementStrategy = new RetirementCalculator(this.targetAge, this.annualDrawdown)
    }

    Run = (): SimulationResults => {
        const s = Array.from({ length: this.simulations }, () => this.OneScenario());
        const successRate = s.filter(it => it.success).length / this.simulations;
        const meanDrawdown = s.map(it => it.annualDrawdown).reduce((a, b) => a + b, 0) / s.length
        const scenarios = s.map(it => it.vals);
        const medianRetirementAge = this.age + s.map(it => it.retirementAge).sort()[s.length * .5]
        const t = _.zip(...scenarios).map(it => it.sort((a, b) => a - b))
        const annualData = t.map((year, i) => {
            return {
                age: this.age + i,
                percentile90: year[year.length * .9],
                percentile10: year[year.length * .1],
                median: year[year.length * .5]
            }
        });
        return { annualData, medianRetirementAge, successRate, drawdownAtRetirement: meanDrawdown };
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
        }

        const f = returns.reduce((acc: Array<PortfolioState>, interest: number) => {
            let nextPortfolioState = acc[acc.length - 1];
            return [...acc, this.progressYear({ ...nextPortfolioState, interest })]
        }, [initialPortfolioState]);

        return {
            vals: f.map(it => (it.isaValue + it.pensionValue)),
            retirementAge: f.findIndex(d => d.retired) - 1,
            success: f[f.length - 1].success,
            annualDrawdown: f[f.length - 1].annualDrawdown!,
        };
    }

    private getFiftyYearsOfReturns = (): number[] => {
        return Array.from({ length: 50 }, (_, k) => this.getReturnForAge(this.age + k));
    }

    private getReturnForAge = (age: number): number => {
        return this.distributionData
            .filter(ra => ra.age <= age)
            .at(-1)!.distribution
            .map(d => (d.percentage / 100) * (GetNormallyDistributedRandomNumber(d.model.mean, d.model.standardDeviation)))
            .reduce((sum, d) => sum + d, 0);
    }

    private progressYear = (state: PortfolioState): PortfolioState => {
        if (!state.success) return state;
        state = this.retirementStrategy.updateRetirementState(state);
        let {
            isaValue,
            pensionValue,
            interest,
            retired,
            age,
            deferredRetirementCounter,
            success,
            annualDrawdown
        } = state;

        let nextIsaValue: number;
        let nextPensionValue: number;

        if (!retired) {
            nextIsaValue = (isaValue + this.annualIsaContribution) * interest;
            nextPensionValue = (pensionValue + this.annualPensionContribution) * interest;
        } else {
            //TODO: I don't like this. A RetiredPortfolioState would be nicer...
            annualDrawdown = annualDrawdown!
            if (age < EARLY_PENSION_AGE) {
                success = isaValue >= annualDrawdown;
                nextIsaValue = (isaValue - annualDrawdown) * interest;
                nextPensionValue = pensionValue * interest;
            } else {
                success = (isaValue + pensionValue) >= annualDrawdown;
                if (pensionValue < annualDrawdown) {
                    let remainder = annualDrawdown - pensionValue;
                    nextPensionValue = 0;
                    nextIsaValue = (isaValue - remainder) * interest;
                } else {
                    nextPensionValue = (pensionValue - annualDrawdown) * interest;
                    nextIsaValue = isaValue * interest;
                }
            }
        }

        return {
            isaValue: nextIsaValue,
            pensionValue: nextPensionValue,
            retired,
            success,
            deferredRetirementCounter,
            age: age + 1,
            interest,
            annualDrawdown
        }
    }
}
