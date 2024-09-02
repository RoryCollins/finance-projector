import React from 'react';
import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    DefaultLegendContent,
    ResponsiveContainer,
} from 'recharts';
import { percentiles } from './mathstuff';

export default function Chart() {
    const data = percentiles().map((x, i) => { return { age: i, percentiles: [x.percentile10, x.percentile90], median: x.median } })
    console.log(data);
    return (
        // <ResponsiveContainer width="100%" height="100%">
            <div>
                <ComposedChart
                    width={900}
                    height={400}
                    data={data}>
                    <XAxis dataKey="age" />
                    <YAxis width={100} />
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
                    <Tooltip/>
                </ComposedChart>
            </div>
        // </ResponsiveContainer>
    );
}