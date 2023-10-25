
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Main from './Components/Main';
import { Box, ThemeProvider, createTheme } from '@mui/material';

function App() {
  // Creates the theme for the web app
  const theme = createTheme({
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
        'Noto Sans',
        'sans-serif'
      ]
    }
  });
  return (
    <Box className="App" sx={{margin: '0px'}}>
      {/* Allows acces to the theme in every page within ThemeProvider */}
      <ThemeProvider theme={theme}>
        <Main />
      </ThemeProvider>
      
    </Box>
  );
}

export default App;

