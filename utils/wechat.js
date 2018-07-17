const http = require('./http')
const config = require('../config')
const accessTokenModel = require('../models/accessToken')

const setAccessToken = async (query, param) => {
    let data = new Promise((resolve, reject) => {
        accessTokenModel.update(query, param, {upsert: true}, (err, docs) => {
            if (err) {
                console.log(err)
            } else{
                resolve(docs)
            }
        })
    }).then((data) => {
        return data
    })
    return data
}

const getAccessToken = async (query) => {
    let data = new Promise((resolve, reject) => {
        accessTokenModel.find(query, (err, docs) => {
            if (err) {
                console.log(err)
            } else{
                resolve(docs)
            }
        })
    }).then((data) => {
        return data
    })
    return data
}

const askAccessToken = async () => {
    let https_options = {
        hostname: 'api.weixin.qq.com',
        path: '/cgi-bin/token?grant_type=client_credential&appid=%APPID%&secret=%APPSECRET%',
        method: 'get'
    }
    https_options.path = https_options.path.replace('%APPID%', config.appid).replace('%APPSECRET%', config.appsecret)
    let result = await http.doHttps(https_options)
    let resultJson = JSON.parse(result)
    let now = new Date().getTime()
    let expires_in = now + (resultJson.expires_in - 20) * 1000
    await setAccessToken({accessToken_id: 1}, {$set: {access_token: resultJson.access_token, expires_in: expires_in}})
}

const queryAccessToken = async () => {
    let now = new Date().getTime()
    let db = await getAccessToken({accessToken_id: 1})
    if (db[0].expires_in > now) {
        // 过期重新请求
        await askAccessToken()
        let newdb = await getAccessToken({accessToken_id: 1})
        return newdb[0].access_token
    } else {
        return db[0].access_token
    }
}

module.exports = {
    queryAccessToken
}