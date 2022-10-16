const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RoomSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    image_ic: {
        type: String,
        require: false
    },
    type: {
        type: String,
        require: true
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

module.exports = mongoose.model('room', RoomSchema)