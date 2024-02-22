

// indicatorData

import { ThemeProvider } from "@emotion/react";
import MUIDataTable from "mui-datatables";
import {
  experimental_extendTheme as materialExtendTheme,
  Experimental_CssVarsProvider as MaterialCssVarsProvider,
  THEME_ID as MATERIAL_THEME_ID,
} from '@mui/material/styles';

// [{name:NAME, data:DATA, coord:COORDS}]
function IndicatorTable({selectedIndicators, mapPolygons, indicator, tableColumns, tableData}) {
  // const defaultTheme = createTheme();
  const theme = materialExtendTheme();
  return (
    <ThemeProvider theme={theme}>
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