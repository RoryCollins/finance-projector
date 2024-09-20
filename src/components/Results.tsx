import {SimulationResults} from "../interfaces";
import {Card, CardContent, Container} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Chart from "./Chart";

export default function Results({results}: { results?: SimulationResults }) {
    if(results === undefined) {return <></>}
    return (
        <Container maxWidth="lg">
            <Grid container spacing={3}>
                <Grid size={3}>
                    <Card sx={{maxWidth: 250}}>
                        <CardContent>
                            <h2>Success Rate</h2><br/>
                            <b>{(results.successRate * 100).toFixed(1)}%</b>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={3}>
                    <Card sx={{maxWidth: 250}}>
                        <CardContent>
                            <h2>Annual Drawdown</h2><br/>
                            <b>£{(results.drawdownAtRetirement).toFixed(2)}</b>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={3}>
                    <Card sx={{maxWidth: 250}}>
                        <CardContent>
                            <h2>Retirement Age</h2><br/>
                            <b>{results.medianRetirementAge}</b>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <br/>
            <Chart chartData={results}/>
        </Container>
    )
}