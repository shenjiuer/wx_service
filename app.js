const Koa = require('koa')
const app = new Koa()
const router = require('./router')
const config = require('./config')
const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect(config.database, () => {
    console.log('=== success connect ===')
})

app.use(router.routes())
   .use(router.allowedMethods())

app.listen(8888)