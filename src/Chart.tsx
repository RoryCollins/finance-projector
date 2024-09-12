import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
    CartesianGrid,
} from 'recharts';
import { SimulationResults } from './interfaces';

const roundTo = (n: number, p: number) => {
    return Math.round(n/p) * p
}


const numericFormatter = (n: number | number[]) : string => {
    if(Array.isArray(n)){
        return numericFormatter(n[0]) + " - " + numericFormatter(n[1]);
    }
    if (n > 1_000_000) return "£" + roundTo(n/1_000_000, 0.1)  + "m";
    else if (n > 1_000) return "£" + roundTo(n/1_000, 1) + "k";
    else return "£" + n
}

export default function Chart({ chartData }: { chartData: SimulationResults }) {
    const data = chartData.annualData.map((x: any) => { return { age: x.age, percentiles: [x.percentile10, x.percentile90], median: x.median } })
    return (
        <div>
            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart
                    width={900}
                    height={400}
                    margin={{
                        left: 200,
                        right: 200,
                    }}
                    data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" name="Age" />
                    <YAxis tickFormatter={numericFormatter} />
                    <Area
                        type="monotone"
                        dataKey="percentiles"
                        stroke="none"
                        fill="#cccccc"
                        connectNulls
                        dot={false}
                        activeDot={false}
                    />
                    <Line type="natural" dataKey="median" stroke="#ff00ff" dot={false} connectNulls />
                    <ReferenceLine x={chartData.medianRetirementAge} stroke='blue' width={2} />
                    <Legend />
                    <Tooltip formatter={numericFormatter} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}