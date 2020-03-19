const path = require('path')
const fs = require('fs')
const Busboy = require('busboy')




/**
 * 上传文件    
 */


function uploadFile(ctx, uploadTargetPath) {
	let req = ctx.req
	let busboy = new Busboy({ headers: req.headers })



	return new Promise((resolve, reject) => {

		let result = {}

		// 解析请求文件事件
		busboy.on('file', function (fieldname, file, filename) {
			const reg = /\.(jpg|jpeg|webp|gif|GIF|WEBP|png|bmp|BMP|JPG|PNG|JPEG)$/
			const isPic = reg.test(filename)

			if (!isPic) {
				return resolve('文件格式非图片类型')
			}

			const saveTo = path.resolve(__dirname, `${uploadTargetPath}/${filename}`)

			// 文件保存到制定路径
			file.pipe(fs.createWriteStream(saveTo))

			// 文件写入事件结束
			file.on('end', function () {
				result = `/upload-files/${filename}`
			})
		})

		// 解析结束事件
		busboy.on('finish', function () {
			resolve(result)
		})

		// 解析错误事件
		busboy.on('error', function (err) {
			reject(err)
		})
		req.pipe(busboy)
	})

}


module.exports = uploadFile