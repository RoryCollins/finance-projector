import _ from "underscore";
import { SimulationData, SimulationResults, StatisticalModel as StatisticalDistributionData } from "./interfaces";

const statePensionAge = 68;
const earlyPensionAge = statePensionAge - 10;

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
                age: this.age + i,
                percentile90: year[year.length * .9],
                percentile10: year[year.length * .1],
                median: year[year.length * .5]
            }
        });
        return { annualData, medianRetirementAge };
    }

    private OneThousandScenarios = (): { vals: number[], retirementAge: number }[] => {
        return Array.from({ length: 10 }, () => this.OneScenario())
    }

    private OneScenario = (): { vals: number[], retirementAge: number } => {
        const returns = FiftyNormallyDistributedRandomNumbers(this.distributionData.mean, this.distributionData.standardDeviation);
        const f = returns.reduce((acc: Array<{ isaValue: number, pensionValue: number, retired: boolean, deferredRetirementCounter: number }>, x: number, i: number) => {
            let { isaValue, pensionValue, retired, deferredRetirementCounter } = acc[acc.length - 1];
            return [...acc, this.progressYear(isaValue, pensionValue, x, retired, this.age + i, deferredRetirementCounter)]
        }, [{ isaValue: this.initialIsaValue, pensionValue: this.initialPensionValue, retired: false, deferredRetirementCounter: 0 }]);
        return { vals: f.map(it => (it.isaValue + it.pensionValue)), retirementAge: f.findIndex(d => d.retired) - 1 };
    }

    private progressYear = (currentIsaValue: number, currentPensionValue: number, interest: number, retired: boolean, age: number, deferredRetirementCounter: number) => {
        if (!retired && this.targetFundsReached(currentIsaValue + currentPensionValue) && this.sufficientIsa(age, currentIsaValue)) {
            if(interest < 1 && deferredRetirementCounter < 3){
                deferredRetirementCounter++;
            }
            else{
                retired = true;
            }
        }

        if (age === statePensionAge) {
            retired = true;
        }

        let nextIsaValue: number;
        let nextPensionValue: number;
        let success: boolean;

        if (retired && age < earlyPensionAge) {
            success = currentIsaValue >= this.annualDrawdown;
            nextIsaValue = (currentIsaValue - this.annualDrawdown) * interest;
            nextPensionValue = currentPensionValue * interest;
        }
        else if (retired) {
            success = (currentIsaValue + currentPensionValue) >= this.annualDrawdown;
            if (currentPensionValue < this.annualDrawdown) {
                let remainder = this.annualDrawdown - currentPensionValue;
                nextPensionValue = 0;
                nextIsaValue = (currentIsaValue - remainder) * interest;
            }
            else {
                nextPensionValue = (currentPensionValue - this.annualDrawdown) * interest;
                nextIsaValue = currentIsaValue * interest;
            }
        }
        else {
            success = true;
            nextIsaValue = (currentIsaValue + this.annualIsaContribution) * interest;
            nextPensionValue = (currentPensionValue + this.annualPensionContribution) * interest;
        }

        return { isaValue: nextIsaValue, pensionValue: nextPensionValue, retired, success, deferredRetirementCounter }
    }

    private targetFundsReached = (totalPotValue: number) => {
        return totalPotValue >= this.annualDrawdown / this.safeWithdrawalRate
    }

    private sufficientIsa = (age: number, isaValue: number): boolean => {
        return isaValue >= ((earlyPensionAge - age) * this.annualDrawdown)
    }
}
