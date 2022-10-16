const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MessageSchema = new Schema({
    message: {
        type: String,
        require: true
    },
    time: {
        type: Date,
        require: true
    },
    type: {
        type: String,
        enum: ['text','img','video']
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    room_id: {
        type: Schema.Types.ObjectId,
        ref: "room"
    }
})

module.exports = mongoose.model('message', MessageSchema)