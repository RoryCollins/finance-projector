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
} from 'recharts';
import { SimulationResults } from './interfaces';

export default function Chart({chartData}: {chartData: SimulationResults}) {
    const data = chartData.annualData.map((x:any) => { return { age: x.age, percentiles: [x.percentile10, x.percentile90], median: x.median } })
    return (
        <div>
            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart
                    width={900}
                    height={400}
                    margin={{
                        left: 200,
                        right:200,
                    }}
                    data={data}>
                    <XAxis dataKey="age" name="Age"/>
                    <YAxis label={"Value"} />
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

                    
                    
                    <Tooltip/>
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}