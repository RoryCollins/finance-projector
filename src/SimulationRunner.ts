import _ from "underscore";
import { SimulationData, SimulationResults, StatisticalModel as StatisticalDistributionData } from "./interfaces";

function BoxMullerTransform(): number {
    const u1 = Math.random();
    const u2 = Math.random();

    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

    return z0;
}

export function GetNormallyDistributedRandomNumber(mean: number, standardDeviation: number): number {
    return BoxMullerTransform() * standardDeviation + mean
}

function FiftyNormallyDistributedRandomNumbers(mean: number, standardDeviation: number): Array<number> {
    return Array.from({ length: 50 }, () => GetNormallyDistributedRandomNumber(mean, standardDeviation));
}

export default class SimulationRunner {
    readonly age: number;
    readonly initialIsaValue: number;
    readonly annualIsaContribution: number;
    readonly initialPensionValue: number;
    readonly annualPensionContribution: number;
    readonly annualDrawdown: number;
    readonly distributionData: StatisticalDistributionData;
    readonly safeWithdrawalRate: number;

    constructor(
        { age, initialIsaValue, annualIsaContribution, initialPensionValue, annualPensionContribution, annualDrawdown, safeWithdrawalRate }: SimulationData,
        distributionData: StatisticalDistributionData) {
        this.age = age;
        this.initialIsaValue = initialIsaValue;
        this.annualIsaContribution = annualIsaContribution;
        this.initialPensionValue = initialPensionValue;
        this.annualPensionContribution = annualPensionContribution;
        this.annualDrawdown = annualDrawdown;
        this.safeWithdrawalRate = safeWithdrawalRate
        this.distributionData = distributionData;
    }

    Run = (): SimulationResults => {
        const s = this.OneThousandScenarios();
        const scenarios = s.map(it => it.vals);
        const medianRetirementAge = this.age + s.map(it => it.retirementAge).sort()[s.length * .5]
        const t = _.zip(...scenarios).map(it => it.sort((a, b) => a - b))
        const annualData = t.map((year, i) => {
            return {
                age: this.age+i,
                percentile90: year[year.length * .9],
                percentile10: year[year.length * .1],
                median: year[year.length * .5]
            }
        });
        return { annualData, medianRetirementAge };
    }

    private OneThousandScenarios = (): { vals: number[], retirementAge: number }[] => {
        return Array.from({ length: 1000 }, () => this.OneScenario())
    }

    private OneScenario = (): { vals: number[], retirementAge: number } => {
        const returns = FiftyNormallyDistributedRandomNumbers(this.distributionData.mean, this.distributionData.standardDeviation);
        const f = returns.reduce((acc: Array<{ value: number, retired: boolean }>, x: number) => {
            let { value, retired } = acc[acc.length - 1];
            return [...acc, this.progressYear(value, x, retired)]
        }, [{ value: this.initialIsaValue, retired: false }]);
        return { vals: f.map(it => it.value), retirementAge: f.findIndex(d => d.retired) };
    }

    private progressYear = (previousValue: number, interest: number, retired: boolean) => {
        if (previousValue >= this.annualDrawdown / this.safeWithdrawalRate) {
            retired = true;
        }

        var delta = retired ? -this.annualDrawdown : this.annualIsaContribution;

        return { value: (previousValue + delta) * interest, retired }
    }
}
