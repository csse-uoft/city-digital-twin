

// indicatorData

import { ThemeProvider } from "@emotion/react";
import MUIDataTable from "mui-datatables";

// [{name:NAME, data:DATA, coord:COORDS}]
function IndicatorTable({defaultTheme, selectedIndicators, mapPolygons, indicator, tableColumns, tableData}) {
  return (
    <ThemeProvider theme={defaultTheme}>
        <MUIDataTable
            title={selectedIndicators[mapPolygons[indicator].index]}
            columns={tableColumns[indicator]}
            data={tableData[indicator]}
            options={{
                filterType: 'checkbox'
            }}
            pagination
            />
    </ThemeProvider>
  );
}

export default IndicatorTable;