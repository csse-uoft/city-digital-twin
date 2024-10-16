import { Card, Stack, Typography } from "@mui/joy";

export default function TopBarIndicator({data, visibility}) {

  return (
    <Card sx={{ maxWidth: 500, margin:"auto" }}>
      <Stack id="headerIndicator" direction="row" alignItems="center" justifyContent="space-between">
        <Typography sx={{fontWeight:600, fontFamily:"Inter, sans-serif", fontSize:"16px"}}>Top Bar Indicator Title</Typography>
        <Typography sx={{fontFamily:"Inter, sans-serif", fontSize:"16px"}}>200</Typography>
      </Stack>
    </Card>
  );
}