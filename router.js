const Router = require('koa-router')
const router = new Router()
const home = require('./controller/home')
const authorize = require('./controller/authorize')

router.get('/home', home.index)
router.get('/authorize', authorize.config)
router.post('/authorize', authorize.handleMessage)

module.exports = router