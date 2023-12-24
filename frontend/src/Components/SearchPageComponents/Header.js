import { Typography, Stack } from "@mui/material";
// import {ReactComponent as Logo} from "../LOGO-SoC-RGB.svg";
import InsertChartRoundedIcon from '@mui/icons-material/InsertChartRounded';

export function Header() {
  return (
    <div>
      <Stack direction="row" spacing={1} style={{borderBottomWidth:2, borderBottomStyle:"solid", borderColor:"#dddfe2", paddingBottom:5}}>
        {/* <Logo style={{height:60}}/> */}
        {/* <InsertChartRoundedIcon style={{paddingTop:6, fontSize:55, color:"navy"}} /> */}
        <Typography variant="h5" style={{paddingTop:7, paddingLeft:5, fontWeight:"bold", fontFamily:"Trade Gothic Next LT Pro Cn, sans-serif", fontSize:40}}>Search Indicators</Typography>
      </Stack>
    </div>
  );
}