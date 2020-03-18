import { json } from '../utils/ajax'
// 虽然用户信息放在localStorage也可以全局使用，但是如果放在localStorage中，用户信息改变时页面不会实时更新
export const SET_USER = 'SET_USER'
export function setUser(user) {
    return {
        type: SET_USER,
        user
    }
}

//异步action，从后台获取用户信息,更新用户信息
export function getUser(param) {

    return async function (dispatch) {
        const res = await json.get('/user/getUser', param);
        dispatch(setUser(res.data || {}))
    }
}








