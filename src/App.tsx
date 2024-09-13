import { useState } from 'react';
import './App.css';
import Chart from './Chart';
import { TextField, Button, Box, Card, Step, InputAdornment } from '@mui/material';
import SimulationRunner from './SimulationRunner';
import { SimulationResults } from './interfaces';
// import { ChartData } from './interfaces';

interface StateData {
  simulationResults?: SimulationResults,
  age: number,
  initialIsa: number,
  initialPension: number,
  isaContribution: number,
  pensionContribution: number,
  annualDrawdown: number,
  safeWithdrawalRate: number,
}

function App() {
  const [data, setData] = useState<StateData>({
    simulationResults: undefined,
    age: 30,
    annualDrawdown: 20000,
    initialIsa: 10000,
    initialPension: 30_000,
    isaContribution: 5_000,
    pensionContribution: 12_000,
    safeWithdrawalRate: 3.5
  })

  const runSimulation = () => {
    const runner = new SimulationRunner({
      age: data.age,
      initialIsaValue: data.initialIsa,
      initialPensionValue: data.initialPension,
      annualIsaContribution: data.isaContribution,
      annualPensionContribution: data.pensionContribution,
      annualDrawdown: data.annualDrawdown,
      safeWithdrawalRate: data.safeWithdrawalRate / 100
    }, [{ age: data.age, distribution: [{ model: { mean: 1.06, standardDeviation: 0.15 }, percentage: 100 }] }]);
    const simulationResults = runner.Run();
    setData({ ...data, simulationResults });
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
          <TextField label="Age" variant="outlined" type="number" value={data.age} onChange={(e) => setData({ ...data, age: parseInt(e.target.value) })} />
        </div>
        <div>
          <TextField label="ISA value" variant="outlined" value={data.initialIsa} type="number" slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">£</InputAdornment>,
            },
            htmlInput: { step: 1000 }
          }} onChange={(e) => setData({ ...data, initialIsa: parseInt(e.target.value) })} />
          <TextField label="Annual ISA Contribution" variant="outlined" type="number" value={data.isaContribution} slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">£</InputAdornment>,
            },
            htmlInput: { step: 1000 }
          }} onChange={(e) => setData({ ...data, isaContribution: parseInt(e.target.value) })} />
        </div>
        <div>
          <TextField label="Pension value" variant="outlined" type="number" value={data.initialPension} slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">£</InputAdornment>,
            },
            htmlInput: { step: 1000 }
          }} onChange={(e) => setData({ ...data, initialPension: parseInt(e.target.value) })} />
          <TextField label="Annual Pension Contribution" variant="outlined" type="number" value={data.pensionContribution} slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">£</InputAdornment>,
            },
            htmlInput: { step: 1000 }
          }} onChange={(e) => setData({ ...data, pensionContribution: parseInt(e.target.value) })} />
        </div>
        <div>
          <TextField label="Annual Drawdown" variant="outlined" type="number" value={data.annualDrawdown} slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">£</InputAdornment>,
            },
            htmlInput: { step: 1000 }
          }} onChange={(e) => setData({ ...data, annualDrawdown: parseInt(e.target.value) })} />
          <TextField label="Safe Withdrawal Rate (%)" variant="outlined" type="number" value={data.safeWithdrawalRate} slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">%</InputAdornment>,
            },
            htmlInput: { step: 0.1 }
          }} onChange={(e) => setData({ ...data, safeWithdrawalRate: parseFloat(e.target.value) })} />
        </div>
      </Box>
      <Button onClick={runSimulation} variant="outlined">Run Simulation</Button>
      <p></p>
      {data.simulationResults
        ? <>
          <Card></Card>
          <h2>Success Rate: {(data.simulationResults.successRate * 100).toFixed(1)}%</h2>
          <Chart chartData={data.simulationResults} />
        </>
        : <h1>No Graph Data</h1>}
    </div>
  );
}


export default App;
