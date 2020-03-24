const path = require('path')
const fs = require('fs')
const Busboy = require('busboy')
const xlsx = require('node-xlsx');
const { register } = require('../controller/user')


/**
 * 上传图片  
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


/**
 * 上传excel 
 */

function uploadUsers(ctx, uploadTargetPath) {
	let req = ctx.req
	let busboy = new Busboy({ headers: req.headers })

	return new Promise((resolve, reject) => {

		let result = {}

		// 解析请求文件事件
		busboy.on('file', function (fieldname, file, filename) {
			const reg = /\.(xls|xlsx)$/
			const isExcel = reg.test(filename)

			if (!isExcel) {
				return resolve('文件格式非excel类型')
			}

			const saveTo = path.resolve(__dirname, `${uploadTargetPath}/${filename}`)

			// 文件保存到制定路径
			file.pipe(fs.createWriteStream(saveTo))



			// 文件写入事件结束
			file.on('end', function () {

				//读取并解析excel
				// const sheets = xlsx.parse(saveTo)

				// console.log(sheets)


				// sheets[0].data.shift();
				// const arr = sheets[0].data;
				// const list = arr.map(item => {
				// 	const obj = {};
				// 	obj.name = item[0];
				// 	obj.password = item[1];
				// 	obj.phone = item[2];
				// 	obj.sign = item[3];
				// 	return obj
				// });

				// list.forEach(item => {
				// 	register(item.name, item.password, item.phone, ctx);
				// })



				result = `${filename}`
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



module.exports = {
	uploadFile,
	uploadUsers
}