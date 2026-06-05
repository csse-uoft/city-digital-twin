import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const transformDataForRadar = (amenityData) => {
  const amenityTypes = new Set(); //a list of all the types of amenities (health, education, spritual, etc)

  // Get all possible amenity types across neighborhoods
  Object.values(amenityData).forEach((amenities) => { //array of values for all fields. Each value is it's own object that categorizes the amenities for a neighborhood by types
    Object.keys(amenities).forEach((type) => amenityTypes.add(type));
  });

  // Transform to a list of { amenityType, Neighborhood1: val, Neighborhood2: val, ... }
  const radarData = [...amenityTypes].map((type) => {
    const entry = { amenity: type };
    Object.entries(amenityData).forEach(([neighborhood, amenities]) => {
      entry[neighborhood] = parseFloat(amenities[type]) || 0; // this number is a walkability score
    });
    return entry;
  });

  return radarData;
};

const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"];

const AmenityRadarChart = ({ amenityData }) => {
  const data = transformDataForRadar(amenityData);
  const neighborhoodNames = Object.keys(amenityData);

  return (
    <ResponsiveContainer width="90%" height={500}>
      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="amenity" />
        <PolarRadiusAxis angle={30} domain={[0, 1]} tick={{fontSize:2}}/>
        <Tooltip />
        <Legend />
        {neighborhoodNames.map((name, i) => (
          <Radar
            key={name}
            name={name}
            dataKey={name}
            stroke={colors[i % colors.length]}
            fill={colors[i % colors.length]}
            fillOpacity={0.6}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default AmenityRadarChart;
