
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { Container } from "@mui/material";
import { ModelDetails, RiskAppetiteView } from "../interfaces";

export const RiskAppetiteForm = ({ onChange, data }: { onChange: any, data: RiskAppetiteView[] }) => {
    const rows: GridRowsProp = data.map((it, i) => { return {
        id: i,
        age: it.age,
        stocks: it.distribution.find(d => d.modelName == "Stocks")!.percentage,
        bonds: it.distribution.find(d => d.modelName == "Bonds")!.percentage
    }});
    const columns: GridColDef[] = [
        { field: 'age', headerName: 'Age', type: 'number', editable: true },
        { field: 'stocks', headerName: 'Stocks', type: 'number', editable: true },
        { field: 'bonds', headerName: 'Bonds', type: 'number', editable: true },
    ]

    const processRow = (updatedRow: any) => {
        // const oldRow = data.find(it => it.name == updatedRow.name)!;
        // const remaining = data.filter(it => it.name != updatedRow.name);

        // handleChange([...remaining, {name: oldRow.name, model: {mean: updatedRow.mean, standardDeviation: updatedRow.standardDev}}])

        return updatedRow;
    }

    const handleChange = (newState: RiskAppetiteView[]) => {
        onChange(newState);
    }

    return (
        <Container maxWidth="sm" >
            <DataGrid
                rows={rows}
                columns={columns}
                hideFooter={true}
                processRowUpdate={processRow}
                onProcessRowUpdateError={(e) => console.log(e)}
                disableColumnFilter
                disableColumnSorting
                disableColumnMenu
                disableRowSelectionOnClick />
        </Container>
    )
}