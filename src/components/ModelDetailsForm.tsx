import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
// import { ModelDetails } from "../interfaces";
import { Container } from "@mui/material";
import { ModelDetails, StatisticalModel } from "../interfaces";

export const ModelDetailsForm = ({ onChange, data }: { onChange: any, data: ModelDetails[] }) => {
    const stocks = data.find(d => d.name == "Stocks")!.model;
    const bonds = data.find(d => d.name == "Bonds")!.model;
    const rows: GridRowsProp = [
        {
            id: 1,
            name: "Stocks",
            mean: stocks.mean,
            standardDev: stocks.standardDeviation
        },
        {
            id: 2,
            name: "Bonds",
            mean: bonds.mean,
            standardDev: bonds.standardDeviation
        },
    ];
    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Asset Class' },
        { field: 'mean', headerName: 'Mean Return (%)', type: 'number', editable: true },
        { field: 'standardDev', headerName: 'Standard Deviation', type: 'number', editable: true },
    ]

    const processRow = (updatedRow: any) => {
        const oldRow = data.find(it => it.name == updatedRow.name)!;
        const remaining = data.filter(it => it.name != updatedRow.name);

        handleChange([...remaining, {name: oldRow.name, model: {mean: updatedRow.mean, standardDeviation: updatedRow.standardDev}}])

        return updatedRow;
    }

    const handleChange = (newState: ModelDetails[]) => {
        onChange(newState);
    }

    return (
        <Container maxWidth="sm" >
            <DataGrid
                sx={{
                    "& .MuiDataGrid-columnHeaderTitle": {
                        whiteSpace: "normal",
                        lineHeight: "normal"
                    },
                    "& .MuiDataGrid-columnHeader": {
                        // Forced to use important since overriding inline styles
                        height: "70px !important"
                    },
                    "& .MuiDataGrid-columnHeaders": {
                        // Forced to use important since overriding inline styles
                        maxHeight: "168px !important"
                    }
                }}
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