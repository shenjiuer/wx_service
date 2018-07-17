const config = require('../config')
const crypto = require('crypto')
const xmlTool = require('../utils/xmlTool')
const answer = require('../utils/answer')
const getRawBody = require('raw-body')

const _config = async (query) => {
    let signature = query.signature
    let timestamp = query.timestamp
    let echostr = query.echostr
    let nonce = query.nonce
    // 字典排序
    let arr = [config.token, timestamp, nonce].sort()
    // sha1加密
    let str = arr.join('')
    let hashCode = crypto.createHash('sha1')
    let result = hashCode.update(str).digest('hex')
    if (result === signature) {
        return echostr
    } else {
        return ''
    }
}

const handleMessage = async (ctx) => {
    let xml = await getRawBody(ctx.req, {
        length: ctx.request.length,
        limit: '1mb',
        encoding: ctx.request.charset || 'utf-8'
    });
    let result = await xmlTool.parseXML(xml)
        console.log(result)

    let formatted = await xmlTool.formatMessage(result.xml)
    if (formatted.MsgType === 'text') {
        return answer.text(formatted)
    } else {
        return 'success'
    }
}

module.exports = {
    _config,
    handleMessage
}