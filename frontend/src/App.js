
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Main from './Components/Main';
import { Box, ThemeProvider, createTheme } from '@mui/material';
import '@fontsource/inter';

import {
  experimental_extendTheme as materialExtendTheme,
  Experimental_CssVarsProvider as MaterialCssVarsProvider,
  THEME_ID as MATERIAL_THEME_ID,
} from '@mui/material/styles';
import { CssVarsProvider as JoyCssVarsProvider } from '@mui/joy/styles';

function App() {
  // Creates the theme for the web app
  const theme = materialExtendTheme({
    palette: {
      primary: { main: "#B5A197" },
      secondary: { main: "#020301" },
      divider: { main: "#020301" },
      background: {
        default: "#FFFFFF",
        paper: "#F3F5F9",
      },
      text: {
        primary: "#020301",
      },
    },
    typography: {
      fontFamily: [
        'Inter',
        'sans-serif'
      ]
    }
  });
  return (
    <Box className="App" sx={{margin: '0px'}}>
      {/* Allows acces to the theme in every page within ThemeProvider */}
      <MaterialCssVarsProvider theme={{ [MATERIAL_THEME_ID]: theme }}>
        <JoyCssVarsProvider>
          <Main />
        </JoyCssVarsProvider>
      </MaterialCssVarsProvider>
      
      {/* <ThemeProvider theme={theme}>
        <Main />
      </ThemeProvider> */}
      
    </Box>
  );
}

export default App;

