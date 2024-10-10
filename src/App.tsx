import { useState } from 'react';
import './App.css';
import { Accordion, AccordionDetails, AccordionSummary, Button, Container, Stack, Typography } from '@mui/material';

import SimulationRunner from './SimulationRunner';
import { ModelDetails, PersonalDetails, QueryDetails, RiskAppetite, RiskAppetiteView, SimulationResults, StatisticalModel } from './interfaces';
import Results from "./components/Results";
import { PersonalDetailsForm } from "./components/PersonalDetailsForm";
import { QueryForm } from './components/QueryForm';
import { ModelDetailsForm } from './components/ModelDetailsForm';
import { RiskAppetiteForm } from './components/RiskAppetiteForm';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface StateData {
  simulationResults?: SimulationResults,
  personalDetails: PersonalDetails,
  model: ModelDetails[],
  riskAppetite: RiskAppetiteView[]
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
      deferInCrash: true,
      deferUntilSwr: true,
    },
    model: [
      { name: "Stocks", model: { mean: 7, standardDeviation: 20 } },
      { name: "Bonds", model: { mean: 3, standardDeviation: 6 } },
    ],
    riskAppetite: [
      {
        age: 30,
        distribution: [
          { modelName: "Stocks", percentage: 80 },
          { modelName: "Bonds", percentage: 20 },
        ]
      },
      {
        age: 50,
        distribution: [
          { modelName: "Stocks", percentage: 60 },
          { modelName: "Bonds", percentage: 40 },
        ]
      },
    ]
  })

  const runSimulation = () => {
    let riskAppetite: RiskAppetite[] = []


    data.riskAppetite.forEach((ra) => {
      let ds: { model: StatisticalModel, percentage: number }[] = []
      ra.distribution.forEach((d) => {
        const theModel = data.model.find(m => m.name == d.modelName)!.model
        ds = ds.concat({ model: { mean: 1 + theModel.mean / 100, standardDeviation: theModel.standardDeviation / 100 }, percentage: d.percentage })
      })
      riskAppetite = riskAppetite.concat({ age: ra.age, distribution: ds })
    })

    const runner = new SimulationRunner(
      {
        personalDetails: data.personalDetails,
        query: data.queryDetails
      },
      riskAppetite,
    );
    const simulationResults = runner.Run();
    setData({ ...data, simulationResults });
  };

  return (
    <div className="App">
      <header className='App-header'>
        <h1>Finance Projector</h1>
      </header>
      <Container>
        <Stack spacing={2} maxWidth={1000}>
          <Container
            component="form"
            sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
            noValidate
            autoComplete="off"
          >
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography>Your Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <PersonalDetailsForm data={data.personalDetails} onChange={(newState: PersonalDetails) => setData({ ...data, personalDetails: newState })} />
                <QueryForm data={data.queryDetails} onChange={(newState: QueryDetails) => setData({ ...data, queryDetails: newState })} />
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography>Nerd Zone</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ModelDetailsForm data={data.model} onChange={(newState: ModelDetails[]) => setData({ ...data, model: newState })} />
                <RiskAppetiteForm data={data.riskAppetite} onChange={(newState: RiskAppetiteView[]) => setData({ ...data, riskAppetite: newState })} />
              </AccordionDetails>
            </Accordion>

          </Container>
          <Button onClick={runSimulation} variant="outlined">Run Simulation</Button>
          <Results results={data.simulationResults} />
        </Stack>
      </Container>
    </div>
  );
}


export default App;
