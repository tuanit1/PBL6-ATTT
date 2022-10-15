const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ParticipantSchema = new Schema({
    nickname: {
        type: String,
        require: true
    },
    isAdmin: {
        type: Boolean,
        require: false
    },
    timestamp: {
        type: Date,
        require: true
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

module.exports = mongoose.model('participant', ParticipantSchema)