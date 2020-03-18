const router = require('koa-router')()
const {
	register, checkName,
	getIpInfo, login,
	getUsers, getUser,
	updateUser, deleteUsers,
	getAllUsers } = require('../controller/user')

router.prefix('/user');

const { success, fail } = require("../utils/util")



//管理员注册
router.post('/register', async function (ctx) {

	try {
		const { name, password } = ctx.request.body
		const res = await register(name, password, ctx);

		if (res) {
			success(ctx, 200, '请求成功', true)
		} else {
			success(ctx, 200, '请求成功', false)
		}

	} catch (err) {
		fail(ctx, 500, "注册失败", err.message);
	}



})

//管理员登录
router.post('/login', async function (ctx) {
	try {
		const { name, password } = ctx.request.body
		const res = await login(name, password, ctx);

		if (res) {
			success(ctx, 200, '登录成功', res.token)
		} else {
			success(ctx, 200, '登录失败', 0)
		}

	} catch (err) {
		fail(ctx, 500, "登录失败" + err.message);
	}
})


//用户名校验
router.get('/checkName', async function (ctx) {

	try {
		const { name } = ctx.query
		const isPass = await checkName(name);
		success(ctx, 200, "请求成功", isPass)

	} catch (err) {
		fail(ctx, 500, "请求失败" + err.message);
	}

})



//获取ip详情
router.get('/getIpInfo', async function (ctx) {

	try {
		const res = await getIpInfo(ctx)
		success(ctx, res.httpCode, message = 'ip获取成功', data = "")

	} catch (err) {
		fail(ctx, 500, "ip获取失败" + err.message);
	}

})




router.get('/getUsers', async function (ctx) {
	
	try {
		const res = await getUsers(ctx.query)
		success(ctx, 200, '请求成功', res);
	} catch (err) {
		fail(ctx, 500, "请求失败" + err.message);
	}

})

router.get('/getUser', async function (ctx) {

	try {
		const res = await getUser(ctx.query);
		success(ctx, 200, '请求成功', res.data);
	} catch (err) {
		fail(ctx, 500, "请求失败" + err.message);
	}
})

router.post('/update', async function (ctx, next) {
	const sessionId = ctx.cookies.get('sessionId')
	const res = await updateUser(ctx.request.body, sessionId)

})

router.post('/delete', async function (ctx, next) {
	const res = await deleteUsers(ctx.request.body)

})

router.get('/getAllUsers', async function (ctx, next) {
	const res = await getAllUsers()

})

module.exports = router
