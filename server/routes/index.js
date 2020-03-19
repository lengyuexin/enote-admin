const router = require('koa-router')()
const uploadFile = require('../utils/upload')
const path = require('path')
const fs = require('fs')
const { success, fail } = require('../utils/util')



//上传接口
router.post('/upload', async (ctx) => {

	try {

		const uploadTargetPath = path.join(__dirname, '../public/upload-files')

		if (fs.existsSync(uploadTargetPath) === false) {
			fs.mkdirSync(uploadTargetPath)
		}
		const res = await uploadFile(ctx, uploadTargetPath)
		success(ctx, 200, '请求成功', res)

	} catch (err) {
		fail(ctx, 500, "上传失败", err.message);
	}


})


module.exports = router
