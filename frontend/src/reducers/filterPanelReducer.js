export const filterPanelReducer = (state,action) => {
    let newState = {...state}
    switch (action.type) {
        case "SET_FILTER":
            newState = {...newState, [action.payload.id]: action.payload.state}
            return newState
        

        default:
            return {...state}
    }
}