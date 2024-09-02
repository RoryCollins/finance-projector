import _ from 'underscore';

function BoxMullerTransform(): number {
    const u1 = Math.random();
    const u2 = Math.random();

    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

    return z0;
}


function GetNormallyDistributedRandomNumber(mean: number, standardDeviation: number): number {
    return BoxMullerTransform() * standardDeviation + mean
}

function FiftyNormallyDistributedRandomNumbers(): Array<number> {
    return Array.from({ length: 50 }, () => GetNormallyDistributedRandomNumber(1.06, .15));
}

function OneScenario() {
    const returns = FiftyNormallyDistributedRandomNumbers();
    return returns.reduce((acc: Array<number>, x: number) => [...acc, acc[acc.length - 1] * (x)], [1000]);
}

function OneThousandScenarios() {
    return Array.from({ length: 1000 }, () => OneScenario())
}

function percentiles() {
    var scenarios = OneThousandScenarios();
    const t = _.zip(...scenarios).map(it => it.sort((a,b)=>a-b))
    console.log("length=" + t.length)
    return t.map(year => {
        return {
            percentile90: year[year.length * .9],
            percentile10: year[year.length * .1],
            median: year[year.length * .5]
        }
    });
}

export { percentiles }