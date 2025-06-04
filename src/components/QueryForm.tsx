import { Container, TextField, InputAdornment, FormControlLabel, Switch, IconButton, Dialog, DialogTitle, DialogContent } from "@mui/material";
import { QueryDetails } from "../domain/interfaces";
import InfoIcon from '@mui/icons-material/Info';
import { useState } from "react";

enum displayDialog { SEQUENCE_RISK, SWR, NONE }

export const QueryForm = ({ onChange, data }: { onChange: any, data: QueryDetails }) => {
    const [state, setState] = useState<displayDialog>(displayDialog.NONE);
    const openSequenceRiskDialog = () => {
        setState(displayDialog.SEQUENCE_RISK)
    }

    const openSwrDialog = () => {
        setState(displayDialog.SWR)
    }

    const closeDialog = () => {
        setState(displayDialog.NONE);
    }

    const handleChange = (newState: QueryDetails) => {
        onChange(newState);
    }
    return <Container>
        <div>
            <TextField label="Annual Drawdown in Retirement" variant="outlined" type="number" value={data.targetDrawdown} slotProps={{
                input: {
                    startAdornment: <InputAdornment position="start">£</InputAdornment>,
                },
                htmlInput: { step: 1000 }
            }} onChange={(e) => handleChange({ ...data, targetDrawdown: parseInt(e.target.value) })} />
            <TextField label="Age" variant="outlined" type="number" value={data.targetAge} onChange={(e) => handleChange({ ...data, targetAge: parseInt(e.target.value) })} />
        </div>
        <div>
            <FormControlLabel control={<Switch checked={data.deferInCrash} />} label="Defer retirement (up to three years) in negative market" onChange={(_) => handleChange({ ...data, deferInCrash: !(data.deferInCrash) })} />
            <IconButton onClick={openSequenceRiskDialog}>
                <InfoIcon />
            </IconButton>
            <Dialog open={state === displayDialog.SEQUENCE_RISK} onClose={closeDialog}>
                <DialogTitle>Sequence of Returns Risk</DialogTitle>
                <DialogContent>The worst time to lose your savings is when you start to needing to live off them. You can't predict future returns, but at the very least you can avoid retiring when the chips are down</DialogContent>
            </Dialog>
        </div>
        <div>
            <FormControlLabel control={<Switch checked={data.deferUntilSwr} />} label="Defer retirement (up to three years) if drawdown is unsafe" onChange={(_) => handleChange({ ...data, deferUntilSwr: !(data.deferUntilSwr) })} />
            <IconButton onClick={openSwrDialog}>
                <InfoIcon />
            </IconButton>
            <Dialog open={state === displayDialog.SWR} onClose={closeDialog}>
                <DialogTitle>Safe Withdrawal Rate</DialogTitle>
                <DialogContent>A common rule-of-thumb for early retirement is that a retiree should be able to live on 4% of their portfolio at the point of retirement and then keep withdrawing that same amount (adjusted for inflation) every year afterwards. To be more conservative, this calculator uses a Safe Withdrawal Rate of 3.5%. <br /><br /> This toggle defers retirement up to three years, at which point if the target value is still not achieved, then the drawdown is recalculated.</DialogContent>
            </Dialog>
        </div>
    </Container>
}