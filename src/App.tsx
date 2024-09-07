import { useState } from 'react';
import './App.css';
import Chart from './Chart';
import ChartData from './ChartData';
import { TextField, Button, Box } from '@mui/material';
import SimulationRunner from './SimulationRunner';

interface StateData {
  chartData : ChartData[],
  age: number,
  initialIsa: number,
  initialPension: number,
  isaContribution: number,
  pensionContribution: number,
  annualDrawdown: number,
}

function App() {
  const [data, setData] = useState<StateData>({
    chartData: [],
    age: 0,
    annualDrawdown: 0,
    initialIsa: 0,
    initialPension: 0,
    isaContribution: 0,
    pensionContribution: 0
  })

  const generateData = () => {
    const runner = new SimulationRunner({
      age: data.age, 
      initialValue: data.initialIsa + data.initialPension,
      annualContribution: data.isaContribution + data.pensionContribution,
      annualDrawdown: data.annualDrawdown
    }, {mean:1.06, standardDeviation: 0.15})
    const results = runner.Run();
    setData({...data, chartData: results.map((x, i) => { return { age: data.age + i, percentile10: x.percentile10, percentile90: x.percentile90, median: x.median } })})
    console.log("Age is " + data.age)
  };

  return (
    <div className="App">
      <Box
        component="form"
        sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
        noValidate
        autoComplete="off"
      >
        <div>
          <TextField id="age" label="Age" variant="outlined" type="number" onChange={(e) => setData({...data, age:parseInt(e.target.value)})} />
        </div>
        <div>
          <TextField id="isa-initial" label="ISA value" variant="outlined" type="number" onChange={(e) => setData({...data, initialIsa:parseInt(e.target.value)})} />
          <TextField id="isa-contribution" label="Annual ISA Contribution" variant="outlined" type="number" onChange={(e) => setData({...data, isaContribution:parseInt(e.target.value)})}/>
        </div>
        <div>
          <TextField id="pension-initial" label="Pension value" variant="outlined" type="number" onChange={(e) => setData({...data, initialPension:parseInt(e.target.value)})}/>
          <TextField id="pension-contribution" label="Annual Pension Contribution" variant="outlined" type="number" onChange={(e) => setData({...data, pensionContribution:parseInt(e.target.value)})}/>
        </div>
        <div>
          <TextField id="drawdown" label="Annual Drawdown" variant="outlined" type="number" onChange={(e) => setData({...data, annualDrawdown:parseInt(e.target.value)})}/>
        </div>
      </Box>
      <Button onClick={generateData}>Generate Data</Button>
      <p></p>
      {data.chartData.length > 0
        ? <Chart chartData={data.chartData} />
        : <h1>No Graph Data</h1>}
    </div>
  );
}


export default App;
