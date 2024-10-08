import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { ModelDetails } from "../interfaces";
import { Container } from "@mui/material";

export const ModelDetailsForm = ({ onChange, data }: { onChange: any, data: ModelDetails }) => {
    const rows: GridRowsProp = [
        {
            id: 1,
            name: "stocks",
            mean: data.stocks.mean,
            standardDev: data.stocks.standardDeviation
        },
        {
            id: 2,
            name: "bonds",
            mean: data.bonds.mean,
            standardDev: data.bonds.standardDeviation
        },
    ];
    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Name' },
        { field: 'mean', headerName: 'Mean', type: 'number', editable: true },
        { field: 'standardDev', headerName: 'Standard Deviation', type: 'number', editable: true },
    ]
    const handleChange = (newState: ModelDetails) => {
        onChange(newState);
    }

    return <Container>
        <DataGrid rows={rows} columns={columns} hideFooter={true} processRowUpdate={(updatedRow) => {
            if(updatedRow.name === "stocks"){
                handleChange({...data, stocks: {mean: updatedRow.mean, standardDeviation: updatedRow.standardDev} })
            }
            else{
                handleChange({...data, bonds: {mean: updatedRow.mean, standardDeviation: updatedRow.standardDev} })
            }
            return updatedRow;
        }} onProcessRowUpdateError={(e) => console.log(e)} disableRowSelectionOnClick/>
    </Container>
}