const mongoose = require('mongoose')
const Schema = mongoose.Schema
const autoIncrement = require('mongoose-sequence')(mongoose)

const AccessTokenSchema = new Schema({
    access_token: {
        type: String
    },
    expires_in: {
        type: Number
    }
})

AccessTokenSchema.plugin(autoIncrement, {inc_field: 'accessToken_id'})
module.exports = mongoose.model('accessToken', AccessTokenSchema)