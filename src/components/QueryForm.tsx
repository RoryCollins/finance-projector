import { Container, TextField, InputAdornment } from "@mui/material";
import { QueryDetails } from "../interfaces";

export const QueryForm = ({ onChange, data }: { onChange: any, data: QueryDetails }) => {
    const handleChange = (newState: QueryDetails) => {
        onChange(newState);
    }
    return <Container>
        <TextField label="Annual Drawdown" variant="outlined" type="number" value={data.targetDrawdown} slotProps={{
            input: {
                startAdornment: <InputAdornment position="start">£</InputAdornment>,
            },
            htmlInput: { step: 1000 }
        }} onChange={(e) => handleChange({ ...data, targetDrawdown: parseInt(e.target.value) })} />
        <TextField label="Age" variant="outlined" type="number" value={data.targetAge} onChange={(e) => handleChange({ ...data, targetAge: parseInt(e.target.value) })} />
    </Container>
}