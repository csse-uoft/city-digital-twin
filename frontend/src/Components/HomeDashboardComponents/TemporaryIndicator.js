import { IconButton, Card, Stack, Typography } from "@mui/joy";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export default function TemporaryIndicator({data, visibility}) {
  return (
    <>
      <Card sx={{ width:"300px" }}>
          <Stack direction="column">
            <Stack id="headerIndicator" direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{fontWeight:600, fontFamily:"Inter, sans-serif", fontSize:"21px"}}>Temp. Indicator Title</Typography>
              <Stack spacing={1} direction="row">
                <Typography sx={{fontFamily:"Inter, sans-serif", fontSize:"21px"}}>200</Typography>
                <IconButton variant="outlined" color="danger" size="sm">
                  <CloseRoundedIcon />
                </IconButton>
              </Stack>
            </Stack>
            <Card sx={{ width:"100%", height:150, boxSizing:"border-box" }}>
              <Typography sx={{textAlign:"center"}}>Graph/Visualization</Typography>
            </Card>
            <Typography level="body-sm" sx={{fontFamily:"Inter", textAlign:"center", marginTop:"8px"}}>Sort By: <strong>Ward</strong></Typography>
            <Stack id="subdividedValues" direction="column" sx={{ overflowY:"scroll", maxHeight:"105px"}}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography level="body-md" sx={{fontFamily:"Inter", fontWeight:600 }}>Area 1</Typography>
                <Typography level="body-md" sx={{fontFamily:"Inter"}}>100</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography level="body-md" sx={{fontFamily:"Inter", fontWeight:600 }}>Area 2</Typography>
                <Typography level="body-md" sx={{fontFamily:"Inter"}}>100</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography level="body-md" sx={{fontFamily:"Inter", fontWeight:600 }}>Area 3</Typography>
                <Typography level="body-md" sx={{fontFamily:"Inter"}}>100</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography level="body-md" sx={{fontFamily:"Inter", fontWeight:600 }}>Area 4</Typography>
                <Typography level="body-md" sx={{fontFamily:"Inter"}}>100</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography level="body-md" sx={{fontFamily:"Inter", fontWeight:600 }}>Area 5</Typography>
                <Typography level="body-md" sx={{fontFamily:"Inter"}}>100</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography level="body-md" sx={{fontFamily:"Inter", fontWeight:600 }}>Area 6</Typography>
                <Typography level="body-md" sx={{fontFamily:"Inter"}}>100</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography level="body-md" sx={{fontFamily:"Inter", fontWeight:600 }}>Area 7</Typography>
                <Typography level="body-md" sx={{fontFamily:"Inter"}}>100</Typography>
              </Stack>
            </Stack>
          </Stack>
      </Card>
    </>
  );
}