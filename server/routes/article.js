const router = require('koa-router')()
const { success, fail } = require('../utils/util')
const { getArticles, passArticle, deleteArticles } = require('../controller/article')
const fs = require("fs")
const path = require("path")
router.prefix('/article');


//获取全部文章数据
router.get('/getArticles', async function (ctx) {

	try {
		const res = await getArticles(ctx.query)
		success(ctx, 200, '请求成功', res);
	} catch (err) {
		fail(ctx, 500, "请求失败" + err.message);
	}

})


//文章审核
router.post('/passArticle', async function (ctx) {
	try {
		const { id, state } = ctx.request.body
		const res = await passArticle(id, state)
		success(ctx, 200, '请求成功', res);
	} catch (err) {
		fail(ctx, 500, "请求失败" + err.message);
	}
})

//文章同步至enote首页
router.post('/syncHome', async function (ctx) {
	try {
		 const { record } = ctx.request.body
		const { title, id, author, md } = record
		const filename = `${title}_${id}_${author}.md`;
		const enotePath = path.resolve(__dirname, `../../../dev-enote/source/_posts/test/${filename}`);
		fs.writeFileSync(enotePath, md.trimStart())
		success(ctx, 200, '请求成功', "数据已同步至首页");
	} catch (err) {
		fail(ctx, 500, "请求失败" + err.message);
	}
})


//删除文章
router.post('/delete', async function (ctx) {
	try {
		const { ids } = ctx.request.body;
		const res = await deleteArticles(ids)
		success(ctx, 200, '请求成功', res);
	} catch (err) {
		fail(ctx, 500, "请求失败" + err.message);
	}
})

module.exports = router
