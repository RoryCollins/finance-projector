import { useState } from 'react';
import './App.css';
import { TextField, Button, Box, InputAdornment, Select, MenuItem } from '@mui/material';
import SimulationRunner from './SimulationRunner';
import { SimulationResults } from './interfaces';
import { RetirementStrategy } from './RetirementStrategy';
import { targetValueRetirementStrategy } from './targetValueRetirementStrategy';
import targetAgeRetirementStrategy from './targetAgeRetirementStrategy';
import Results from "./components/Results";

interface StateData {
  simulationResults?: SimulationResults,
  age: number,
  initialIsa: number,
  initialPension: number,
  isaContribution: number,
  pensionContribution: number,
  annualDrawdown: number,
  safeWithdrawalRate: number,
  retirementStrategy: string,
  targetAge: number,
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
    safeWithdrawalRate: 3.5,
    retirementStrategy: "value",
    targetAge: 58,
  })

  const runSimulation = () => {

    const strategy: RetirementStrategy = data.retirementStrategy === "value"
      ? new targetValueRetirementStrategy(data.annualDrawdown, data.safeWithdrawalRate / 100)
      : new targetAgeRetirementStrategy(data.targetAge);

    const runner = new SimulationRunner({
      age: data.age,
      initialIsaValue: data.initialIsa,
      initialPensionValue: data.initialPension,
      annualIsaContribution: data.isaContribution,
      annualPensionContribution: data.pensionContribution,
      annualDrawdown: data.annualDrawdown,
      safeWithdrawalRate: data.safeWithdrawalRate / 100,
      targetAge: data.targetAge
    }, [{ age: data.age, distribution: [{ model: { mean: 1.06, standardDeviation: 0.15 }, percentage: 100 }] }],
      strategy);
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

        <Box>
          <div>
            <Select value={data.retirementStrategy} onChange={(e) => setData({ ...data, retirementStrategy: e.target.value })} >
              <MenuItem value="age">Find Retirement Allowance</MenuItem>
              <MenuItem value="value">Find Retirement Age</MenuItem>
            </Select>
          </div>
          {data.retirementStrategy === "value"
            ? <div>
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
            : <div>
              <TextField label="Age" variant="outlined" type="number" value={data.targetAge} onChange={(e) => setData({ ...data, targetAge: parseInt(e.target.value) })} />
            </div>
          }
        </Box>

      </Box>
      <Button onClick={runSimulation} variant="outlined">Run Simulation</Button>
      <Results results={data.simulationResults}/>
    </div>
  );
}


export default App;
