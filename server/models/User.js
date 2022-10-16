const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    user_id: {
        type: String,
        require: true,
        unique: true
    },
    name: {
        type: String,
        require: true
    },
    age: {
        type: Number,
        require: false
    },
    phone: {
        type: String,
        require: false
    },
    image: {
        type: String,
        require: false
    },
    messages: [{
        type: Schema.Types.ObjectId,
        ref: "message"
    }],
    participants: [{
        type: Schema.Types.ObjectId,
        ref: "participant"
    }]
})

module.exports = mongoose.model('user', UserSchema)