import { useState } from 'react';
import './App.css';
import Chart from './Chart';
import { TextField, Button, Box } from '@mui/material';
import SimulationRunner from './SimulationRunner';
import { SimulationResults } from './interfaces';
// import { ChartData } from './interfaces';

interface StateData {
  simulationResults? : SimulationResults,
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
    age: 0,
    annualDrawdown: 0,
    initialIsa: 0,
    initialPension: 0,
    isaContribution: 0,
    pensionContribution: 0,
    safeWithdrawalRate: 0
  })

  const generateData = () => {
    const runner = new SimulationRunner({
      age: data.age, 
      initialIsaValue: data.initialIsa,
      initialPensionValue: data.initialPension,
      annualIsaContribution: data.isaContribution,
      annualPensionContribution: data.pensionContribution,
      annualDrawdown: data.annualDrawdown,
      safeWithdrawalRate: data.safeWithdrawalRate / 100
    }, {mean:1.06, standardDeviation: 0.15})
    const simulationResults = runner.Run();
    setData({...data, simulationResults});
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
          <TextField id="swr" label="Safe Withdrawal Rate (%)" variant="outlined" type="number" onChange={(e) => setData({...data, safeWithdrawalRate:parseFloat(e.target.value)})}/>
        </div>
      </Box>
      <Button onClick={generateData}>Generate Data</Button>
      <p></p>
      {data.simulationResults
        ? <Chart chartData={data.simulationResults} />
        : <h1>No Graph Data</h1>}
    </div>
  );
}


export default App;
