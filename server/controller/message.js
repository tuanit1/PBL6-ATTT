const Message = require(`../models/Message`)
const User = require("../models/User");
const Room = require("../models/Room");
const Participant = require("../models/Participant");

// const ioSocket = require('./IoClass')
// const socket = new ioSocket(ioServer)

class MessageController {
    constructor(ioServer) {
        this.ioServer = ioServer;
        this.socket = this.ioServer.of("/message")
    }

    createMessage = async (req, res) => {
        const {userId, roomId} = req.params

        const {user_id} = req
        if (user_id !== userId) {
            return res
                .status(403)
                .json({
                    success: false,
                    message: "You can't access this domain!"
                })
        }

        let types = ['text', 'image', 'file']
        const {message, type} = req.body

        if (!message)
            return res
                .status(400)
                .json({
                    success: false,
                    message: "message is require!"
                })
        if (!type || !types.includes(type))
            return res
                .status(400)
                .json({
                    success: false,
                    message: "choose the type!"
                })


        const user = await User.findOne({user_id: userId})
        if (!user) {
            return res
                .status(404)
                .json({
                    success: false,
                    message: "User is not existing!"
                })
        }
        const room = await Room.findById(roomId)
        if (!room)
            return res
                .status(404)
                .json({
                    success: false,
                    message: "Room is not existing!"
                })
        const participant = await Participant.findOne({
            user_id: user._id, room_id: roomId
        })
            .populate({
                path: 'user_id',
                select: 'user_id name age phone image'
            })
        if (!participant)
            return res
                .status(404)
                .json({
                    success: false,
                    message: "User is not in Room"
                })
        try {
            const newMessage = new Message({
                message: message,
                time: Date.now(),
                type,
                user_id: user,
                room_id: room
            })
            // await newMessage.save()
            user.messages.push(newMessage._id)
            // await user.save()
            room.messages.push(newMessage._id)
            // await room.save()

            //socket
            let message_socket = {}
            message_socket._id = newMessage._id
            message_socket.message = newMessage.message
            message_socket.type = newMessage.type
            message_socket.time = newMessage.time
            message_socket.user_id = user._id
            message_socket.room_id = room._id

            let data = {}
            data.message = message_socket
            if (participant) {
                let participant_save = {}
                participant_save._id = participant._id
                participant_save.nickname = participant.nickname
                participant_save.isAdmin = participant.isAdmin
                participant_save.timestamp = participant.timestamp
                participant_save.allowSendMSG = participant.allowSendMSG
                participant_save.allowSendFile = participant.allowSendFile
                participant_save.allowViewFile = participant.allowViewFile
                participant_save.user = participant.user_id
                participant_save.room_id = participant.room_id
                data.participant = participant_save
            }
            console.log(data)
            this.socket.emit('message', data)
            res.json({
                success: true,
                message: 'Create message successfully',
                data: {
                    _id: newMessage._id,
                    user: user.name,
                    room: room.name,
                    text: newMessage.message,
                    type: newMessage.type,
                    time: newMessage.time,
                }
            })
        } catch (e) {
            console.log(e)
            return res
                .status(500)
                .json({
                    success: false,
                    message: '' + e
                })
        }
    }

    getMessage = async (req, res) => {
        try {
            const allMessage = await Message.find({})
            res.json({success: true, data: allMessage})
        } catch (e) {
            res.status(500).json({success: false, message: e})
        }
    }

    getMessageByRoomId = async (req, res) => {
        const {roomId} = req.params

        try {
            const {participants} = req
            for (let participant of participants) {
                let participantJWT = await Participant.findById(participant)
                if (participantJWT) {
                    if (participantJWT.room_id.toString() === roomId.toString()) {
                        const room = await Room.findById(roomId)
                        if (!room)
                            return res
                                .status(404)
                                .json({
                                    success: false,
                                    message: "room not found"
                                })
                        const allMessage = await Message.find({room_id: roomId})
                        res.json({success: true, data: allMessage})
                    }
                }
            }
            return res
                .status(403)
                .json({
                    success: false,
                    message: "You can't access this domain!"
                })
        } catch (e) {
            res.status(500).json({success: false, message: e})
        }


    }

    getMessageByRoomIdWithPagination = async (req, res) => {
        const perPage = (typeof req.params.step === 'undefined') ? 10 : req.params.step
        const page = (typeof req.params.page === 'undefined') ? 1 : req.params.page
        const roomId = req.params.roomId
        try {
            const {participants} = req
            for (let participant of participants) {
                let participantJWT = await Participant.findById(participant)
                if (participantJWT) {
                    if (participantJWT.room_id.toString() === roomId.toString()) {
                        const room = await Room.findById(roomId)
                        if (!room)
                            return res
                                .status(404)
                                .json({
                                    success: false,
                                    message: "room not found"
                                })
                        const datas = []
                        let count_message = await Message.countDocuments({room_id: roomId})
                        if (count_message === 0) {
                            return res
                                .json({
                                    success: true,
                                    data: datas
                                })
                        }
                        let limit = perPage
                        if (count_message - perPage * page - perPage < 0) {
                            limit = count_message - perPage * page
                            if (limit <= 0) {
                                return res
                                    .json({
                                        success: true,
                                        data: datas
                                    })
                            }

                        }
                        // console.log({
                        //     count_message: count_message,
                        //     perPage: perPage,
                        //     page: page,
                        //     skip: count_message - (perPage * page) - limit,
                        //     limit: limit,
                        // })
                        const messages = await Message
                            .find({room_id: roomId})
                            .sort({'time': "asc"})
                            .skip(count_message - (perPage * page) - limit)
                            .limit(limit)
                        for (let message of messages) {
                            if (message) {
                                let data = {}
                                data.message = message
                                const participant = await Participant.findOne({
                                    user_id: message.user_id,
                                    room_id: message.room_id
                                })
                                    .populate({
                                        path: 'user_id',
                                        select: 'user_id name age phone image'
                                    })
                                if (participant) {

                                    let participant_save = {}
                                    participant_save._id = participant._id
                                    participant_save.nickname = participant.nickname
                                    participant_save.isAdmin = participant.isAdmin
                                    participant_save.timestamp = participant.timestamp
                                    participant_save.allowSendMSG = participant.allowSendMSG
                                    participant_save.allowSendFile = participant.allowSendFile
                                    participant_save.allowViewFile = participant.allowViewFile
                                    participant_save.user = participant.user_id
                                    participant_save.room_id = participant.room_id
                                    data.participant = participant_save
                                }
                                datas.push(data)
                            }
                        }
                        return res.json({success: true, data: datas})
                    }
                }
            }
            return res
                .status(403)
                .json({
                    success: false,
                    message: "You can't access this domain!"
                })
        } catch (e) {
            console.log(e)
            return res.status(500).json({success: false, message: ""+e})
        }
    }

    deleteMessage = async (req, res) => {
        const msgDeleteCondition = {
            _id: req.params.msgId,
            user: req.userId
        }
        const msg = await Message.findById(req.params.msgId)
        if (!msg)
            return res
                .status(404)
                .json({
                    success: false,
                    message: "message not found"
                })
        if (msg.user_id) {
            const user = await User.findById(msg.user_id)
            if (user)
                user.messages = user.messages.filter(item => item._id.toString() !== msg._id.toString())
            user.save()
        }

        const {user_id} = req
        if (user_id !== msg.user_id) {
            return res
                .status(403)
                .json({
                    success: false,
                    message: "You can't access this domain!"
                })
        }

        if (msg.room_id) {
            const room = await Room.findById(msg.room_id)
            if (room)
                room.messages = room.messages.filter(item => item._id.toString() !== msg._id.toString())
            room.save()
        }
        try {
            const deleteMsg = await Message.findOneAndDelete(msgDeleteCondition)
            if (!deleteMsg) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        message: "Msg not found!"
                    })
            }
            res.json({
                success: true,
                message: "Deleted!",
                data: deleteMsg
            })
        } catch (e) {
            return res
                .status(500)
                .json({
                    success: false,
                    message: e
                })
        }
    }

    deleteAllMessage = async (req, res) => {
        try {
            const messages = await Message.find({})
            let deletedMessages = []
            for (let message of messages) {
                const msgDeleteCondition = {
                    _id: message._id,
                    user: req.userId
                }
                if (message.user_id) {
                    const user = await User.findById(msg.user_id)
                    if (user)
                        user.messages = user.messages.filter(item => item._id.toString() !== msg._id.toString())
                    user.save()
                }
                if (message.room_id) {
                    const room = await Room.findById(msg.room_id)
                    if (room)
                        room.messages = room.messages.filter(item => item._id.toString() !== msg._id.toString())
                    room.save()
                }
                const deleteMsg = await Message.findOneAndDelete(msgDeleteCondition)
                if (!deleteMsg) {
                    return res
                        .status(401)
                        .json({
                            success: false,
                            message: "message not found!"
                        })
                }
                deletedMessages.push(deleteMsg)
            }
            res.json({success: true, data: deletedMessages})
        } catch (e) {
            res.status(500).json({success: false, message: e})
        }
    }
}

module.exports = MessageController;
// module.exports = { createMessage, getMessage, getMessageByRoomId, getMessageByRoomIdWithPagination, deleteMessage, deleteAllMessage };