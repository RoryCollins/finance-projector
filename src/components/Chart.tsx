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
import { SimulationResults } from '../interfaces';

const numericFormatter = (n: number | number[]) : string => {
    if(Array.isArray(n)){
        return numericFormatter(n[0]) + " - " + numericFormatter(n[1]);
    }
    if (Math.abs(n) > 1_000_000) return "£" + (n/1_000_000).toFixed(1)  + "m";
    else if (Math.abs(n) > 1_000) return "£" + (n/1_000).toFixed(0) + "k";
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