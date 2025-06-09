import { Container, TextField, InputAdornment, FormControlLabel, Switch, IconButton, Dialog, DialogTitle, DialogContent } from "@mui/material";
import { StrategyQuery } from "../domain/interfaces";
import InfoIcon from '@mui/icons-material/Info';
import { useState } from "react";

enum displayDialog { SEQUENCE_RISK, BRIDGE, NONE }

export const QueryForm = ({ onChange, data }: { onChange: any, data: StrategyQuery }) => {
    const [state, setState] = useState<displayDialog>(displayDialog.NONE);
    const openSequenceRiskDialog = () => {
        setState(displayDialog.SEQUENCE_RISK);
    }

    const openIsaBridgeDialog = () => {
        setState(displayDialog.BRIDGE);
    }

    const closeDialog = () => {
        setState(displayDialog.NONE);
    }

    const handleChange = (newState: StrategyQuery) => {
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
            <FormControlLabel control={<Switch checked={data.bridgeTheGap} />} label="Defer retirement if ISA cannot support the gap to early pension age" onChange={(_) => handleChange({ ...data, bridgeTheGap: !(data.bridgeTheGap) })} />
            <IconButton onClick={openIsaBridgeDialog}>
                <InfoIcon />
            </IconButton>
            <Dialog open={state === displayDialog.BRIDGE} onClose={closeDialog}>
                <DialogTitle>Bridging the Gap</DialogTitle>
                <DialogContent>Defer retirement until you have enough in your non-pension funds to support you until your pension becomes accessible.</DialogContent>
            </Dialog>
        </div>
    </Container>
}