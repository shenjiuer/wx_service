const authorize = require('../service/authorize')

const config = async (ctx) => {
    let query = ctx.query
    let result = await authorize._config(query)
    ctx.body = result
}

const handleMessage = async (ctx) => {  
    let message = await authorize.handleMessage(ctx)
    ctx.body = message
}

module.exports = {
    config,
    handleMessage
}