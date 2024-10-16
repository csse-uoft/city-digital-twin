import { Card, Stack, Typography, Select, Option } from "@mui/joy";

export default function PermanentIndicator({data, visibility}) {
  return (
    <Card sx={{ width:"300px" }}>
      <Stack direction="column">
        {/* <Stack id="headerIndicator" direction="row" alignItems="center" justifyContent="space-between"> */}
          <Typography sx={{fontWeight:600, fontFamily:"Inter, sans-serif", fontSize:"21px", textAlign:"center"}}>Perm. Indicator Title</Typography>
        {/* </Stack> */}
        <Typography sx={{fontFamily:"Inter, sans-serif", fontSize:"21px", textAlign:"center"}}>200</Typography>

        <Card sx={{ width:"100%", height:150, boxSizing:"border-box" }}>
          <Typography sx={{textAlign:"center"}}>Graph/Visualization</Typography>
        </Card>

        <Stack spacing={1} direction="row" alignItems="center" justifyContent="center" sx={{marginTop:1}}>
          <Typography level="body-sm" sx={{fontFamily:"Inter", textAlign:"center", marginTop:"8px"}}>Sort by: </Typography>
          <Select defaultValue="ward" size="sm" sx={{backgroundColor:"unset", border:"none", boxShadow:"none"}}>
            <Option value="ward">Ward</Option>
          </Select>
        </Stack>
        
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
  );
}