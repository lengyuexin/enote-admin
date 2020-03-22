const { exec } = require('../db/mysql')

/**
 * 分页获取文章列表
 * @param {*} param 
 */
const getArticles = async (param) => {
    const { current = 0, pageSize = 10, title, } = param
    let sql = `select SQL_CALC_FOUND_ROWS *  from article `
    if (title) {
        sql += `where title like '%${title}%' `
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
 * 文章审核
 * @param {*} id 
 * @param {*} state 
 */

const passArticle = async (id, state) => {
    const sql = `update article set state='${state}' where id='${id}'`
    const res = JSON.parse(JSON.stringify(await exec(sql)))
    return !!res.changedRows
}







/**
 * deleteArticles 根据传递的id删除文章/可单可多
 * @param {*} ids 
 */
const deleteArticles = async (ids) => {
    const sql = `delete from article where id in (${ids.join(',')})`
    const res = await exec(sql)
    return !!res.affectedRows
}




module.exports = {
    getArticles,
    passArticle,
    deleteArticles,

}