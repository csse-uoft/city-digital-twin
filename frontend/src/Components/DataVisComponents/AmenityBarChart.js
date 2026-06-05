import { BarChart, Legend, XAxis, YAxis, CartesianGrid, Tooltip, Bar, ResponsiveContainer } from 'recharts';
// import { RechartsDevtools } from '@recharts/devtools';
import { useState, useEffect } from 'react'



const transformDataForBar = (amenityData) => {
  
  return Object.keys(amenityData).map((name) => ({
    ...amenityData[name],  // copy all fields
    name: name             // add name field
  }))
};

const AmenityBarChart = ({amenityData}) => {
  const data = transformDataForBar(amenityData)
  const [keys, setKeys]  = useState(() => {
    const objs = Object.values(amenityData)
    if (objs.length > 0) {
      const dataKeys = Object.keys(objs[0])
      return dataKeys
    } else {
      return []
    }
    
    
  })
  
  return(
    <ResponsiveContainer width="90%" height={500}>
      <BarChart
      data={data} >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis width={60} domain={[0, 1]} />
        <Tooltip />
        <Legend />
        {/* <RechartsDevtools /> */}
        {/* {keys?.map((key) => (
          <Bar dataKey={key} radius={[10, 10, 0, 0]}  />
        ))} */}
        <Bar dataKey="Health" fill="#EF4444" radius={[10, 10, 0, 0]} />
        <Bar dataKey="Retail & services" fill="#FB923C" radius={[10, 10, 0, 0]} />
        <Bar dataKey="Education & childcare" fill="#3B82F6" radius={[10, 10, 0, 0]} />
        <Bar dataKey="Spiritual" fill="#A855F7" radius={[10, 10, 0, 0]} />
        <Bar dataKey="Cultural" fill="#92400E" radius={[10, 10, 0, 0]} />
        <Bar dataKey="Communal" fill="#EC4899" radius={[10, 10, 0, 0]} />
        <Bar dataKey="Recreational" fill="#22C55E" radius={[10, 10, 0, 0]} />
    </BarChart>
    </ResponsiveContainer>
  )
}

export default AmenityBarChart