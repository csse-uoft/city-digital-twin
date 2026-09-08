export const chartCategoryParameterReducer = (state,action) => {
    let newState = {...state}
    switch (action.type) {
        case "SET_PARAMETERS":
            newState = {...newState, [action.payload.id]: action.payload.state}
            return newState
        

        default:
            return {...state}
    }
}

export const chartSubtypeParameterReducer = (state,action) => {
    let newState = {...state}
    switch (action.type) {
        case "SET_PARAMETERS":
            newState = {...newState, [action.payload.id]: action.payload.state}
            return newState
        

        default:
            return {...state}
    }
}

export const chartParameterReducer = (state,action) => {
    let newState = {...state}
    switch (action.type) {
        case "SET_PARAMETERS":
            newState = {...newState, [action.payload.id]: action.payload.state}
            return newState
        

        default:
            return {...state}
    }
}

export const chartEditParameterReducer = (state,action) => {
    let newState = {...state}
    switch (action.type) {
        case "SET_PARAMETERS":
            newState = {...newState, [action.payload.id]: action.payload.state}
            return newState
        

        default:
            return {...state}
    }
}

export const chartDetails = (state,action) => {
    let newState = {...state}
    switch (action.type) {
        case "SET_DETAILS":
            newState = {}
            newState.currentCityURI = action.payload.currentCityURI
            newState.currentAreaURI = action.payload.currentAreaURI
            newState.currentAreaName = action.payload.currentAreaName
            return newState
        
        default:
            return {...state}
    }
}