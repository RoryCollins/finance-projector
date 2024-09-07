import _ from "underscore";
import { SimulationData, StatisticalModel } from "./interfaces";

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

export interface SimulationResults{

}

export default class SimulationRunner {
    readonly age: number;
    readonly initialValue: number;
    readonly annualContribution: number;
    readonly annualDrawdown: number;
    readonly statisticalData: StatisticalModel;

    constructor(
        { age, initialValue, annualContribution, annualDrawdown }: SimulationData,
        statisticalModel: StatisticalModel) {
        this.age = age;
        this.initialValue = initialValue;
        this.annualContribution = annualContribution;
        this.annualDrawdown = annualDrawdown;

        this.statisticalData = statisticalModel;
    }

    Run = () => {
        var scenarios = this.OneThousandScenarios();
        const t = _.zip(...scenarios).map(it => it.sort((a, b) => a - b))
        return t.map(year => {
            return {
                percentile90: year[year.length * .9],
                percentile10: year[year.length * .1],
                median: year[year.length * .5]
            }
        });
    }

    private OneThousandScenarios = () : number[][] => {
        return Array.from({ length: 1000 }, () => this.OneScenario())
    }

    private OneScenario = (): number[] => {
        const returns = FiftyNormallyDistributedRandomNumbers(this.statisticalData.mean, this.statisticalData.standardDeviation);
        const f =  returns.reduce((acc: Array<{value: number, retired: boolean}>, x: number) => {
            let {value, retired} = acc[acc.length-1];
            return [...acc, this.progressYear(value, x, retired)]
            }, [{value: this.initialValue, retired: false}]);
        return f.map(it => it.value);
    }

    private progressYear = (previousValue: number, interest: number, retired: boolean) => {
        if(previousValue >= this.annualDrawdown * 25){
            retired = true;
        }

        var delta = retired ? -this.annualDrawdown : this.annualContribution;

        return {value:(previousValue + delta) * interest, retired}
    }
}
