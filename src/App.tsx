import { useState } from 'react';
import './App.css';
import { Button, Container } from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';

import SimulationRunner from './SimulationRunner';
import { PersonalDetails, QueryDetails, SimulationResults } from './interfaces';
import { RetirementStrategy } from './RetirementStrategy';
import { targetValueRetirementStrategy } from './targetValueRetirementStrategy';
import targetAgeRetirementStrategy from './targetAgeRetirementStrategy';
import Results from "./components/Results";
import { PersonalDetailsForm } from "./components/PersonalDetailsForm";
import { QueryForm } from './components/QueryForm';

interface StateData {
  simulationResults?: SimulationResults,
  personalDetails: PersonalDetails,
  queryDetails: QueryDetails
}

const rows: GridRowsProp = [
  {
    id: 1,
    name: "stocks",
    mean: 7,
    standardDev: 20
  },
  {
    id: 2,
    name: "bonds",
    mean: 3,
    standardDev: 5
  },
];

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name' },
  { field: 'mean', headerName: 'Mean', type: 'number', editable: true },
  { field: 'standardDev', headerName: 'Standard Deviation', type: 'number', editable: true },
]

function App() {
  const [data, setData] = useState<StateData>({
    simulationResults: undefined,
    personalDetails: {
      age: 30,
      initialIsa: 10_000,
      initialPension: 30_000,
      isaContribution: 5_000,
      pensionContribution: 12_000,
    },
    queryDetails: {
      targetAge: undefined,
      targetDrawdown: undefined
    }
  })

  const runSimulation = () => {
    const strategy: RetirementStrategy = Number.isNaN(data.queryDetails.targetAge)
      ? new targetValueRetirementStrategy(data.queryDetails.targetDrawdown!)
      : new targetAgeRetirementStrategy(data.queryDetails.targetAge!);

    const runner = new SimulationRunner({
      personalDetails: data.personalDetails,
      query: data.queryDetails
    }, [{ age: data.personalDetails.age, distribution: [{ model: { mean: 1.06, standardDeviation: 0.15 }, percentage: 100 }] }],
      strategy);
    const simulationResults = runner.Run();
    setData({ ...data, simulationResults });
  };

  return (
    <div className="App">
      <Container
        component="form"
        sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
        noValidate
        autoComplete="off"
      >

        <PersonalDetailsForm data={data.personalDetails} onChange={(newState: PersonalDetails) => setData({ ...data, personalDetails: newState })} />
        
        <QueryForm data={data.queryDetails} onChange={(newState:QueryDetails) => setData({ ...data, queryDetails: newState})} />

        <Container>
          <DataGrid rows={rows} columns={columns} hideFooter={true} />
        </Container>

      </Container>
      <Button onClick={runSimulation} variant="outlined">Run Simulation</Button>
      <Results results={data.simulationResults} />
    </div>
  );
}


export default App;
