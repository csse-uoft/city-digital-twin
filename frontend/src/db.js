// db.js
import { Dexie } from "dexie"

export const db = new Dexie("URDCDashboardCache")
db.version(1).stores({
  amenityData: "areaInstanceId, cityURI, data, timestamp", // Primary key and indexed props
  amenityCategories: "cityURI, data, coordinates, timestamp",
  walkabilityData: "areaInstanceId, cityURI, data, timestamp, areaName"
})


export default db