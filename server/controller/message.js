const Message = require(`../models/Message`)
const User = require("../models/User");
const Room = require("../models/Room");
const Participant = require("../models/Participant");

const createMessage = async (req, res) => {
    types = ['text', 'img', 'file']
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

    const {userId, roomId} = req.params

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
    console.log(1)
    console.log({user_id: user._id, room_id: roomId})
    const participant = await Participant.findOne({user_id: user._id, room_id: roomId})
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
        await newMessage.save()
        user.messages.push(newMessage._id)
        await user.save()
        room.messages.push(newMessage._id)
        await room.save()
        res.json({
            success: true,
            message: 'Create message successfully',
            user: user.name,
            room: room.name,
            text: newMessage.message,
            type: newMessage.type,
            time: newMessage.time,
        })
    } catch (e) {
        return res
            .status(500)
            .json({
                success: false,
                message: '' + e
            })
    }
}

const getMessage = async (req, res) => {
    try {
        const allMessage = await Message.find({})
        res.json({success: true, allMessage})
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
}

const getMessageByRoomId = async (req, res) => {
    const {roomId} = req.params
    const room = await Room.findById(roomId)
    if (!room)
        return res
            .status(404)
            .json({
                success: false,
                message: "room not found"
            })
    try {
        const allMessage = await Message.find({room_id: roomId})
        res.json({success: true, allMessage})
    } catch (e) {
        res.status(500).json({success: false, message: e})
    }
}

const getMessageByRoomIdWithPagination = async (req, res) => {
    let perPage = 2
    const page = (typeof req.params.page === 'undefined') ? 1 : req.params.page
    const roomId = req.params.roomId
    const room = await Room.findById(roomId)
    if (!room)
        return res
            .status(404)
            .json({
                success: false,
                message: "room not found"
            })
    try {
        const messages = await Message
            .find({room_id: roomId})
            .skip((perPage * page) - perPage)
            .limit(perPage)
        res.json({success: true, messages})
    } catch (e) {
        console.log(e)
        res.status(500).json({success: false, message: e})
    }
}

const deleteMessage = async (req, res) => {
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
        if (!user)
            return res
                .status(404)
                .json({
                    success: false,
                    message: "user not found"
                })
        user.messages = user.messages.filter(item => item._id.toString() !== msg._id.toString())
        user.save()
    }
    if (msg.room_id) {
        const room = await Room.findById(msg.room_id)
        if (!room)
            return res
                .status(404)
                .json({
                    success: false,
                    message: "room not found"
                })
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
            deleteMessage: deleteMsg
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

module.exports = { createMessage, getMessage, getMessageByRoomId, getMessageByRoomIdWithPagination, deleteMessage };