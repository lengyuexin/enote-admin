const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
// const logger = require('koa-logger')
const cors = require('koa2-cors');
// const { TOKEN_SECRETKEY } = require('./config/secret')
// const jwt = require('koa-jwt')
const koaStatic = require('koa-static')

const index = require('./routes/index')
const user = require('./routes/user')
const article = require('./routes/article')


// error handler
onerror(app)

// middlewares
app.use(bodyparser({
	enableTypes: ['json', 'form', 'text']
}))
app.use(json())
// app.use(logger())//打印请求信息

app.use(views(__dirname + '/public/build'))



app.use(async (ctx, next) => {
	return await next().catch((err) => {
		if (err.status === 401) {
			ctx.status = 401;
		} else {
			throw err;
		}
	});
})

app.use(cors({ credentials: true })); //前端调试时解决跨域，上线不用跨域

//验证token登陆,unless是不需要验证的路由，每一项是匹配路由的正则
//const unPath = [/^\/$/, /public/, /checkName/, /register/, /getIpInfo/, /login/]
//const buildFiles = [/\.js$/, /\.css$/, /\.less$/, /\.ico/, /\.json$/, /static/]  //前端打包后不需要验证的资源
//app.use(jwt({ secret: TOKEN_SECRETKEY, cookie: 'sessionId' }).unless({ path: unPath.concat(buildFiles) }));


// routes
app.use(index.routes(), index.allowedMethods())
app.use(user.routes(), user.allowedMethods())
app.use(article.routes(), article.allowedMethods())


//一定要写在路由后面，写在前面就不会返回接口内容，而是直接返回首页了
app.use(koaStatic(__dirname, { maxage: 604800000 }))    //一周的缓存时间，单位ms
app.use(koaStatic(__dirname + '/public/build', { maxage: 604800000 }))
app.use(koaStatic(__dirname + '/public', { maxage: 604800000 }))

// error-handling
app.on('error', (err, ctx) => {
	console.error('server error', err, ctx)
});

module.exports = app
