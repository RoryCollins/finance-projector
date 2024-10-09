import { useState } from 'react';
import './App.css';
import { Button, Container, Stack } from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';

import SimulationRunner from './SimulationRunner';
import { ModelDetails, PersonalDetails, QueryDetails, RiskAppetite, SimulationResults } from './interfaces';
import Results from "./components/Results";
import { PersonalDetailsForm } from "./components/PersonalDetailsForm";
import { QueryForm } from './components/QueryForm';
import { ModelDetailsForm } from './components/ModelDetailsForm';

interface StateData {
  simulationResults?: SimulationResults,
  personalDetails: PersonalDetails,
  model: ModelDetails,
  queryDetails: QueryDetails
}



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
      targetAge: 58,
      targetDrawdown: 20_000,
      deferInCrash: true
    },
    model: {
      stocks: { mean: 7, standardDeviation: 20 },
      bonds: { mean: 3, standardDeviation: 6 }
    }
  })

  const runSimulation = () => {

    const riskAppetite: RiskAppetite = {
      age: data.personalDetails.age,
      distribution: [
        {
          model: { mean: 1 + (data.model.stocks.mean / 100), standardDeviation: (data.model.stocks.standardDeviation / 100) },
          percentage: 80
        },
        {
          model: { mean: 1 + (data.model.bonds.mean / 100), standardDeviation: (data.model.bonds.standardDeviation / 100) },
          percentage: 20
        },
      ]
    }


    const runner = new SimulationRunner(
      {
        personalDetails: data.personalDetails,
        query: data.queryDetails
      },
      [riskAppetite],
    );
    const simulationResults = runner.Run();
    setData({ ...data, simulationResults });
  };

  return (
    <div className="App">
      <Container>
        <Stack spacing={2} maxWidth={1000}>
          <Container
            component="form"
            sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
            noValidate
            autoComplete="off"
          >
            <PersonalDetailsForm data={data.personalDetails} onChange={(newState: PersonalDetails) => setData({ ...data, personalDetails: newState })} />
            <QueryForm data={data.queryDetails} onChange={(newState: QueryDetails) => setData({ ...data, queryDetails: newState })} />
            <ModelDetailsForm data={data.model} onChange={(newState: ModelDetails) => setData({ ...data, model: newState })} />

          </Container>
          <Button onClick={runSimulation} variant="outlined">Run Simulation</Button>
          <Results results={data.simulationResults} />
        </Stack>
      </Container>
    </div>
  );
}


export default App;
