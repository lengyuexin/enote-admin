const { exec } = require('../db/mysql')
const axios = require('axios')

const jwt = require('jsonwebtoken');
const { TOKEN_SECRETKEY } = require('../config/secret')




/**
 * 注册用户
 * @param {*} name 
 * @param {*} password 
 * @param {*} phone 
 */
const register = async function (name, password, phone, level = 'admin') {


    const sql = `insert into users (name, password,phone,level) values
     ('${name}', '${password}','${phone}', '${level}')`;
    const res = await exec(sql);
    const jsonData = JSON.parse(JSON.stringify(res))
    return !!jsonData.affectedRows
}

/**
 * 检查用户名是否存在
 * @param {string} name 
 */
const checkName = async function (name) {
    const sql = `select count(id) from users where name='${name}'  `
    const res = await exec(sql);
    const jsonData = JSON.parse(JSON.stringify(res));
    return !!jsonData[0]["count(id)"]
}


/**
 * 检查手机号是否存在
 * @param {string} phone 
 */
const checkPhone = async function (phone) {
    const sql = `select count(id) from users where phone='${phone}' `
    const res = await exec(sql);
    const jsonData = JSON.parse(JSON.stringify(res));
    return !!jsonData[0]["count(id)"]
}





/**
 * 腾讯地图api获取ip地址
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
 * 登陆
 * @param {*} name 
 * @param {*} password 
 */

const login = async function (name, password) {
    const isCheckPass = await checkName(name);
    if (!isCheckPass) return null;

    const sql = `select count(id) from users 
    where name='${name}' and password='${password}' and level='admin'`
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
 * 获取单个用户,可根据用户名查询单个用户
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
 * 分页获取用户列表
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
 * 更新用户其他信息
 * @param {*} name 
 * @param {*} phone 
 * @param {*} sign 
 */
const updateUser = async (name, phone, sign) => {
    const sql = `update users set name='${name}',phone='${phone}',sign='${sign}' where name='${name}'`
    const res = JSON.parse(JSON.stringify(await exec(sql)))
    return !!res.changedRows
}
/**
 * 更新用户密码
 * @param {*} name 
 * @param {*} password 
 */

const updateUserPwd = async (name, password) => {
    const sql = `update users set password='${password}' where name='${name}'`
    const res = JSON.parse(JSON.stringify(await exec(sql)))
    return !!res.changedRows
}

/**
 * 更新用户头像
 * @param {*} name 
 * @param {*} avatar 
 */

const updateUserAvatar = async (name, avatar) => {
    const sql = `update users set avatar='${avatar}' where name='${name}'`
    const res = JSON.parse(JSON.stringify(await exec(sql)))
    return !!res.changedRows
}




/**
 * deleteUsers 根据传递的id删除用户/可单可多
 * @param {*} ids 
 */
const deleteUsers = async (ids) => {
    const sql = `delete from users where id in (${ids.join(',')})`
    const res = await exec(sql)
    return !!res.affectedRows
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
    checkPhone,
    updateUserPwd,
    updateUserAvatar,
}