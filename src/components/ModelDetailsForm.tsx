import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { ModelDetails } from "../interfaces";
import { Container } from "@mui/material";

export const ModelDetailsForm = ({ onChange, data }: { onChange: any, data: ModelDetails }) => {
    const rows: GridRowsProp = [
        {
            id: 1,
            name: "Stocks",
            mean: data.stocks.mean,
            standardDev: data.stocks.standardDeviation
        },
        {
            id: 2,
            name: "Bonds",
            mean: data.bonds.mean,
            standardDev: data.bonds.standardDeviation
        },
    ];
    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Asset Class' },
        { field: 'mean', headerName: 'Mean Return (%)', type: 'number', editable: true },
        { field: 'standardDev', headerName: 'Standard Deviation', type: 'number', editable: true },
    ]

    const processRow = (updatedRow: any) => {
        if (updatedRow.name === "Stocks") {
            handleChange({ ...data, stocks: { mean: updatedRow.mean, standardDeviation: updatedRow.standardDev } })
        }
        else {
            handleChange({ ...data, bonds: { mean: updatedRow.mean, standardDeviation: updatedRow.standardDev } })
        }
        return updatedRow;
    }

    const handleChange = (newState: ModelDetails) => {
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