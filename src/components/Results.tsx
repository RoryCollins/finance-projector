import { SimulationResults } from "../interfaces";
import { Card, CardContent, Container } from "@mui/material";
import Grid from "@mui/material/Grid2";
import Chart from "./Chart";
import "./Results.css"

export default function Results({ results }: { results?: SimulationResults }) {
    if (results === undefined) { return <></> }
    return (
        <Container>
            <Grid container
                spacing={3}
                alignItems={"center"}
                justifyContent="center">
                <Card sx={{ width: 180, height: 190 }} >
                    <CardContent>
                        <h2>Success<br/>Rate</h2><br />
                        <b>{(results.successRate * 100).toFixed(1)}%</b>
                    </CardContent>
                </Card>
                <Card sx={{ width: 180, height: 190 }}>
                    <CardContent>
                        <h2>Annual Drawdown</h2><br />
                        <b>£{(results.drawdownAtRetirement).toFixed(2)}</b>
                    </CardContent>
                </Card>
                <Card sx={{ width: 180, height: 190 }}>
                    <CardContent>
                        <h2>Retirement Age</h2><br />
                        <b>{results.medianRetirementAge}</b>
                    </CardContent>
                </Card>
            </Grid>
            <br />
            <Chart chartData={results} />
        </Container>
    )
}