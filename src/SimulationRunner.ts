import _ from "underscore";
import { RiskAppetite, SimulationData, SimulationResults } from "./interfaces";
import { GetNormallyDistributedRandomNumber } from "./distribution";
import { RetirementStrategy } from "./RetirementStrategy";
import { targetValueRetirementStrategy } from "./targetValueRetirementStrategy";

export const statePensionAge = 68;
export const earlyPensionAge = statePensionAge - 10;

export interface PortfolioState {
    age: number,
    isaValue: number,
    pensionValue: number,
    interest: number,
    retired: boolean,
    deferredRetirementCounter: number,
    success: boolean
}

export default class SimulationRunner {
    readonly age: number;
    readonly initialIsaValue: number;
    readonly annualIsaContribution: number;
    readonly initialPensionValue: number;
    readonly annualPensionContribution: number;
    readonly annualDrawdown: number;
    readonly distributionData: RiskAppetite[];
    readonly retirementStrategy: RetirementStrategy;

    constructor(
        { age, initialIsaValue, annualIsaContribution, initialPensionValue, annualPensionContribution, annualDrawdown, safeWithdrawalRate }: SimulationData,
        distributionData: RiskAppetite[],
        retirementStrategy: RetirementStrategy = new targetValueRetirementStrategy(annualDrawdown, safeWithdrawalRate)) {
        this.age = age;
        this.initialIsaValue = initialIsaValue;
        this.annualIsaContribution = annualIsaContribution;
        this.initialPensionValue = initialPensionValue;
        this.annualPensionContribution = annualPensionContribution;
        this.annualDrawdown = annualDrawdown;
        this.distributionData = distributionData;
        this.retirementStrategy = retirementStrategy;
    }

    Run = (): SimulationResults => {
        const s = this.OneThousandScenarios();
        const successRate = s.filter(it => it.success).length / 1000;
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
        return { annualData, medianRetirementAge, successRate };
    }

    private OneThousandScenarios = (): { vals: number[], retirementAge: number, success: boolean }[] => {
        return Array.from({ length: 1000 }, () => this.OneScenario())
    }

    private OneScenario = (): { vals: number[], retirementAge: number, success: boolean } => {

        const returns = this.getFiftyYearsOfReturns();

        const initialPortfolioState: PortfolioState = {
            age: this.age,
            isaValue: this.initialIsaValue,
            pensionValue: this.initialPensionValue,
            interest: 0,
            retired: false,
            deferredRetirementCounter: 0,
            success: true
        }

        const f = returns.reduce((acc: Array<PortfolioState>, interest: number) => {
            let nextPortfolioState = acc[acc.length - 1];
            return [...acc, this.progressYear({ ...nextPortfolioState, interest })]
        }, [initialPortfolioState]);

        return { vals: f.map(it => (it.isaValue + it.pensionValue)), retirementAge: f.findIndex(d => d.retired) - 1, success: f[f.length - 1].success };
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

        let { isaValue, pensionValue, interest, retired, age, deferredRetirementCounter, success } = state;
        ({ retired, deferredRetirementCounter } = this.retirementStrategy.isRetired(state));

        let nextIsaValue: number;
        let nextPensionValue: number;

        if (!retired) {
            nextIsaValue = (isaValue + this.annualIsaContribution) * interest;
            nextPensionValue = (pensionValue + this.annualPensionContribution) * interest;
        }
        else {
            if (age < earlyPensionAge) {
                success = isaValue >= this.annualDrawdown;
                nextIsaValue = (isaValue - this.annualDrawdown) * interest;
                nextPensionValue = pensionValue * interest;
            }
            else {
                success = (isaValue + pensionValue) >= this.annualDrawdown;
                if (pensionValue < this.annualDrawdown) {
                    let remainder = this.annualDrawdown - pensionValue;
                    nextPensionValue = 0;
                    nextIsaValue = (isaValue - remainder) * interest;
                }
                else {
                    nextPensionValue = (pensionValue - this.annualDrawdown) * interest;
                    nextIsaValue = isaValue * interest;
                }
            }
        }

        return { isaValue: nextIsaValue, pensionValue: nextPensionValue, retired, success, deferredRetirementCounter, age: age + 1, interest }
    }
}
