const router = require('koa-router')()
const {
	register, checkName,
	getIpInfo, login,
	getUsers, getUser,
	updateUser, deleteUsers,
	checkPhone ,updateUserPwd,updateUserAvatar} = require('../controller/user')

router.prefix('/user');

const { success, fail } = require("../utils/util")



//管理员注册
router.post('/register', async function (ctx) {

	try {
		const { name, password, phone,level } = ctx.request.body
		const res = await register(name, password, phone,level, ctx);

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

//手机号校验
router.get('/checkPhone', async function (ctx) {

	try {
		const { phone } = ctx.query
		const isPass = await checkPhone(phone);
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



//获取全部用户数据
router.get('/getUsers', async function (ctx) {

	try {
		const res = await getUsers(ctx.query)
		success(ctx, 200, '请求成功', res);
	} catch (err) {
		fail(ctx, 500, "请求失败" + err.message);
	}

})

//根据用户名查询用户
router.get('/getUser', async function (ctx) {

	try {
		const res = await getUser(ctx.query);
		success(ctx, 200, '请求成功', res.data);
	} catch (err) {
		fail(ctx, 500, "请求失败" + err.message);
	}
})


//更新用户-除密码外其他信息
router.post('/update', async function (ctx) {
	try {
		const { name, phone, sign } = ctx.request.body
		const res = await updateUser(name, phone, sign)
		success(ctx, 200, '请求成功', res);
	} catch (err) {
		fail(ctx, 500, "请求失败" + err.message);
	}
})

//更新用户密码
router.post('/updatePwd', async function (ctx) {
	try {
		const { name, password } = ctx.request.body
		const res = await updateUserPwd(name, password)
		success(ctx, 200, '请求成功', res);
	} catch (err) {
		fail(ctx, 500, "请求失败" + err.message);
	}
})

//更新用户头像
router.post('/updateAvatar', async function (ctx) {
	try {
		const { name, avatar } = ctx.request.body
		const res = await updateUserAvatar(name, avatar)
		success(ctx, 200, '请求成功', res);
	} catch (err) {
		fail(ctx, 500, "请求失败" + err.message);
	}
})

//删除用户
router.post('/delete', async function (ctx) {
	try {
		const { ids } = ctx.request.body;
		const res = await deleteUsers(ids)
		success(ctx, 200, '请求成功', res);
	} catch (err) {
		fail(ctx, 500, "请求失败" + err.message);
	}
})

module.exports = router
