const mongoose = require('mongoose')
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
    email : {
        type: String,
        required: true,
        unique: true
    },
    name: {
        fullName: {
            type: String,
            required: true
        },
        nickName: {
            type: String,
            required: true
        }
    },
    password: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('User', userSchema)