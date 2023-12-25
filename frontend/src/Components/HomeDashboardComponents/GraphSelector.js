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

export default function GraphSelector({graphData, graphType}) {
  const selectGraph = () => {
    switch (graphType) {
      case "line":
        return;
      case "bar":
        return;
      case "pie":
        return;
      default:
        return <></>;
    }
  }

  return (
    <>
      {selectGraph()}
    </>
  );
}