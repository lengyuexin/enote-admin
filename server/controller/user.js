const { exec } = require('../db/mysql')
const axios = require('axios')
const { decrypt, genPassword } = require('../utils/util')
const jwt = require('jsonwebtoken');
const { TOKEN_SECRETKEY } = require('../config/secret')
const { SuccessModel, ErrorModel } = require('../model/resModel')



/**
 * 注册用户--ok
 * @param {*} name 
 * @param {*} password 
 */
const register = async function (name, password) {
    const sql = `insert into users (name, password,level) values ('${name}', '${password}', 'admin')`
    const res = await exec(sql);
    const jsonData = JSON.parse(JSON.stringify(res))
    return !!jsonData.affectedRows
}

/**
 * 检查用户名是否存在--ok
 * @param {string} name 
 */
const checkName = async function (name) {
    const sql = `select count(id) from users where name='${name}' and level='admin' `
    const res = await exec(sql);
    const jsonData = JSON.parse(JSON.stringify(res));
    return !!jsonData[0]["count(id)"]
}

/**
 * 腾讯地图api获取ip地址--ok
 */
const getIpInfo = async function () {

    const res = await axios.get('https://apis.map.qq.com/ws/location/v1/ip', {
        params: {
            key: 'MH2BZ-4WTK3-2D63K-YZRHP-HM537-HHBD3',
        }
    })

    if (res.data.status === 0) return res.data.result.ip
    return "ip获取失败"
}


/**
 * 登陆--ok
 * @param {*} name 
 * @param {*} password 
 */

const login = async function (name, password) {
    const isCheckPass = await checkName(name);
    if (!isCheckPass) return null;

    const sql = `select count(id) from users where name='${name}' and password='${password}'`
    const res = await exec(sql);
    const jsonData = JSON.parse(JSON.stringify(res));

    //账号密码匹配，打印登录用户ip-下发token
    if (jsonData[0]["count(id)"] !== 0) {
        const ip = await getIpInfo();
        console.log("登录用户ip:", ip);
        return { token: jwt.sign({ name }, TOKEN_SECRETKEY, { expiresIn: '7d' }) }   //7天过期时间
    }
    return null;
}

/**
 * 获取单个用户,可根据用户名查询单个用户--ok
 * @param {*} param 
 */
const getUser = async (param) => {
    const { name } = param
    const sql = `select * from users where name='${name}' `
    const res = await exec(sql);
    const jsonData = JSON.parse(JSON.stringify(res))
    return { data: jsonData[0] }
}



/**
 * 分页获取用户列表--todo
 * @param {*} param 
 */
const getUsers = async (param) => {
    const { current = 0, pageSize = 10, name, } = param
    let sql = `select SQL_CALC_FOUND_ROWS *  from users `
    if (name) {
        sql += `where name like '%${name}%' `
    }
    sql += `limit ${current * pageSize},${pageSize}`

    const list = JSON.parse(JSON.stringify(await exec(sql)))
    const res = await exec('select found_rows() as total');

    return {
        list: list,
        current: +current,
        pageSize: +pageSize,
        total: res[0].total
    }

}




/**
 * 当更新用户名或用户头像时，更新其它表中和用户相关连的信息
 * @param {*} user 
 */
const updateUserMessage = (user) => {
    const sql = `update messages set userIsAdmin=${user.isAdmin},userName='${user.name}',userAvatar='${user.avatar}' where userId=${user.id}`
    const sql2 = `update messages set targetUserIsAdmin=${user.isAdmin},targetUserName='${user.name}',targetUserAvatar='${user.avatar}' where targetUserId=${user.id}`
    const sql3 = `update chats set name='${user.name}',userAvatar='${user.avatar}' where userId=${user.id}`
    // 同步执行3个异步任务
    Promise.all([exec(sql), exec(sql2), exec(sql3)]).then(([res, res2, res3]) => {
        console.log(444, res)
        console.log(555, res2)
        console.log(666, res3)
    })
}

/**
 * 更新用户信息
 * @param {*} param 
 */
const updateUser = async (param, sessionId) => {
    const loginName = jwt.verify(sessionId, TOKEN_SECRETKEY).name
    if (param.name && loginName !== param.name) {
        //如果修改了用户名还要检查用户名是否已经存在
        const checkNameResult = await checkName(param.name)
        if (checkNameResult.data.num) {
            return new ErrorModel({
                message: '用户名已存在',
                httpCode: 400
            })
        }
    }
    let str = ''
    for (let [key, value] of Object.entries(param)) {
        if (value) {
            if (key === 'password') {
                //先解密前端加密的密码
                const originalText = decrypt(value)
                //然后再用另一种方式加密密码
                const ciphertext = genPassword(originalText)
                str += `,${key}='${ciphertext}'`
            } else {
                str += `,${key}='${value}'`
            }
        }
    }
    const sql = `update users set ${str.substring(1)} where name='${loginName}'`
    const res = await exec(sql)
    const res2 = await getUser({ name: param.name })
    if (res2.status === 0) {
        //更新用户的留言（头像、用户名）
        updateUserMessage(res2.data)
    }
    return new SuccessModel({
        data: {
            ...res2.data,
            token: jwt.sign({ name: param.name }, TOKEN_SECRETKEY, { expiresIn: '7d' })
        },
        message: '修改成功'
    })
}

const deleteUsers = async (param) => {
    const ids = param.ids
    if (!Array.isArray(ids)) {
        return new ErrorModel({
            message: '参数异常',
            httpCode: 400
        })
    }
    const sql = `delete from users where id in (${ids.join(',')})`
    const res = await exec(sql)
    return new SuccessModel({
        message: `成功删除${res.affectedRows}条数据`
    })
}

/**
 * 获取所有用户
 */
const getAllUsers = async () => {
    const sql = `select id,name,avatar,isAdmin from users order by registrationTime desc`
    const res = await exec(sql)
    return new SuccessModel({
        data: res
    })
}

module.exports = {
    register,
    checkName,
    getIpInfo,
    login,
    getUsers,
    getUser,
    updateUser,
    deleteUsers,
    getAllUsers
}