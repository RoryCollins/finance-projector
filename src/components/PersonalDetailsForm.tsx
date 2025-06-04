import { TextField, InputAdornment, Container } from "@mui/material"
import { ReactEventHandler } from "react"
import { PersonalDetails } from "../domain/interfaces"

export const PersonalDetailsForm = ({ onChange, data }: { onChange: any, data: PersonalDetails }) => {
    const handleChange = (newState: PersonalDetails) => {
        onChange(newState);
    }
    return <Container>
        <div>
            <TextField label="Age" variant="outlined" type="number" value={data.age} onChange={(e) => handleChange({ ...data, age: parseInt(e.target.value) })} />
        </div>
        <div>
            <TextField label="ISA value" variant="outlined" value={data.initialIsa} type="number" slotProps={{
                input: {
                    startAdornment: <InputAdornment position="start">£</InputAdornment>,
                },
                htmlInput: { step: 1000 }
            }} onChange={(e) => handleChange({ ...data, initialIsa: parseInt(e.target.value) })} />
            <TextField label="Annual ISA Contribution" variant="outlined" type="number" value={data.isaContribution} slotProps={{
                input: {
                    startAdornment: <InputAdornment position="start">£</InputAdornment>,
                },
                htmlInput: { step: 1000 }
            }} onChange={(e) => handleChange({ ...data, isaContribution: parseInt(e.target.value) })} />
        </div>
        <div>
            <TextField label="Pension value" variant="outlined" type="number" value={data.initialPension} slotProps={{
                input: {
                    startAdornment: <InputAdornment position="start">£</InputAdornment>,
                },
                htmlInput: { step: 1000 }
            }} onChange={(e) => handleChange({ ...data, initialPension: parseInt(e.target.value) })} />
            <TextField label="Annual Pension Contribution" variant="outlined" type="number" value={data.pensionContribution} slotProps={{
                input: {
                    startAdornment: <InputAdornment position="start">£</InputAdornment>,
                },
                htmlInput: { step: 1000 }
            }} onChange={(e) => handleChange({ ...data, pensionContribution: parseInt(e.target.value) })} />
        </div>
    </Container>
}