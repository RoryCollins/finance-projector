import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

export default function Chart({chartData}: any) {
    const data = chartData.map((x:any, i:number) => { return { age: x.age, percentiles: [x.percentile10, x.percentile90], median: x.median } })
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
                    <Legend />
                    
                    
                    <Tooltip/>
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}