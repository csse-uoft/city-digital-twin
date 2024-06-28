/**
 * CURRENTLY UNUSED
 * UNFINISHED
 * State type example:
 * { AutoTheftCrime2016: { 
 *      URL: "http://ontology.eil.utoronto.ca/CKGN/Crime#AutoTheftCrimeRate2016",
 *      data: { http://ontology.eil.utoronto.ca/Toronto/Toronto#neighborhood75: {2015: 65, 2016: 71},
 *              http://ontology.eil.utoronto.ca/Toronto/Toronto#neighborhood75: {2015: 45, 2016: 61} },
 *      unit: ["NONE"], 
 *      selected: true,
 *      selectedForComp: false, 
 *      years: { start: 2015, end: 2016 } }
 *  }
 */
export const indicatorReducer = (state, action) => {
    switch (action.type) {
      case "SET_URLS":
        return {...action.payload};
      default:
        return {...state};
    }
  }