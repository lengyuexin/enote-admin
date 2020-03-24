const router = require('koa-router')()
const { uploadFile, uploadUsers } = require('../utils/upload')
const path = require('path')
const fs = require('fs')
const { success, fail } = require('../utils/util')



//上传图片接口
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

//上传excel接口
router.post('/uploadUsers', async (ctx) => {

	try {
		const uploadTargetPath = path.join(__dirname, '../public/upload-files')
		if (fs.existsSync(uploadTargetPath) === false) {
			fs.mkdirSync(uploadTargetPath)
		}
		const res = await uploadUsers(ctx, uploadTargetPath);

	

		success(ctx, 200, '请求成功', res)

	} catch (err) {
		fail(ctx, 500, "上传失败", err.message);
	}

})


module.exports = router
