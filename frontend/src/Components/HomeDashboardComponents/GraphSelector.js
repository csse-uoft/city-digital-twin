import {
  AreaChart, 
  Area,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts";
import { Stack, Select, Option } from "@mui/joy";

export default function GraphSelector({graphData, graphType, setGraphType}) {
  const selectGraph = () => {
    switch (graphType) {
      case "line":
        return (
          <LineChart>

          </LineChart>
        );
      case "bar":
        return (
          <BarChart>
            
          </BarChart>
        );
      case "pie":
        return (
          <PieChart>

          </PieChart>
        );
      case "area":
        return (
          <AreaChart>
          
          </AreaChart>
        );
      default:
        return <></>;
    }
  }

  return (
    <>
      <Stack direction="column" spacing={1}>
        <Stack direction="row" justifyContent="space-between">
          <Select 
            defaultValue={graphType} 
            onChange={(_, newValue) => {
              setGraphType(newValue);
            }}
          >
            <Option value="line">Line</Option>
            <Option value="bar">Bar</Option>
            <Option value="pie">Pie</Option>
            <Option value="area">Area</Option>
          </Select>
        </Stack>
        {selectGraph()}
      </Stack>
    </>
  );
}