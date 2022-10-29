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
    allowSendMSG: {
        type: Boolean,
        require: false,
        default: true
    },
    allowSendFile: {
        type: Boolean,
        require: false,
        default: true
    },
    allowViewFile: {
        type: Boolean,
        require: false,
        default: true
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