import { SimulationResults } from "../domain/interfaces";
import { Card, CardContent, Container, createTheme, ThemeProvider } from "@mui/material";
import Grid from "@mui/material/Grid2";
import Chart from "./Chart";

const theme = createTheme({
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: "#edf1f5",
                    height: 190,
                    width: 180
                }
            }
        }
    }
})

export default function Results({ results }: { results?: SimulationResults }) {
    if (results === undefined) { return <></> }
    return (
        <Container>
            <ThemeProvider theme={theme}>
                <Grid container
                    spacing={3}
                    alignItems={"center"}
                    justifyContent="center">
                    <Card>
                        <CardContent>
                            <h2>Success<br />Rate</h2><br />
                            <b>{(results.successRate * 100).toFixed(1)}%</b>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <h2>Annual Drawdown</h2><br />
                            <b>£{(results.drawdownAtRetirement).toFixed(2)}</b>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <h2>Retirement Age</h2><br />
                            <b>{results.medianRetirementAge}</b>
                        </CardContent>
                    </Card>
                </Grid>
            </ThemeProvider>
            <br />
            <Chart chartData={results} />
        </Container>
    )
}