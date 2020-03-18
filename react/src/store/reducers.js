import { SET_USER, } from './actions'

/**
 * 用户信息
 * @param {*} state 
 * @param {*} action 
 */
const defaultState = {
    user: {

    }
}

function user(state = defaultState, action) {
    switch (action.type) {
        case SET_USER: {
            return {...state,user:action.user}
        }
        default:
            return state
    }
}



export default user 