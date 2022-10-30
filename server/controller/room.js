const Message = require(`../models/Message`)
const User = require("../models/User");
const Room = require("../models/Room");
const Participant = require("../models/Participant");

const createRoomPublic = async (req, res) => {
    const {name, image_ic} = req.body

    if (!name)
        return res
            .status(400)
            .json({
                success: false,
                message: "name is require!"
            })

    const {userId} = req.params
    const user = await User.findOne({user_id: userId})
    if (!user)
        return res
            .status(400)
            .json({
                success: false,
                message: "User is not existed!"
            })
    try {
        const newRoom = new Room({
            name: name,
            type: "group",
            image_ic: image_ic | 'https://png.pngtree.com/element_our/png_detail/20181021/group-avatar-icon-design-vector-png_141882.jpg'
        })
        const newParticipant = new Participant({
            nickname: user.name,
            isAdmin: true,
            timestamp: Date.now(),
            user_id: user,
            room_id: newRoom
        })
        newRoom.participants.push(newParticipant)
        user.participants.push(newParticipant)
        await newRoom.save()
        await user.save()
        await newParticipant.save()

        res.json({
            success: true,
            message: 'Create participant successfully',
            data: {
                name: newRoom.name,
                type: newRoom.type,
                image_ic: newRoom.image_ic,
                newParticipant
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

const createRoomPrivate = async (req, res) => {
    const {userId,receiverId} = req.params
    const user = await User.findOne({user_id: userId})
    if (!user)
        return res
            .status(400)
            .json({
                success: false,
                message: "User is not existed!"
            })
    const receiver = await User.findOne({user_id: receiverId})
    if (!receiver)
        return res
            .status(400)
            .json({
                success: false,
                message: "reciever is not existed!"
            })
    try {
        const newRoom = new Room({
            name: 'private',
            type: 'private',
            image_ic: 'https://png.pngtree.com/element_our/png_detail/20181021/group-avatar-icon-design-vector-png_141882.jpg'
        })
        const sender = new Participant({
            nickname: user.name,
            isAdmin: true,
            timestamp: Date.now(),
            user_id: user,
            room_id: newRoom
        })
        const receiver_participant = new Participant({
            nickname: receiver.name,
            isAdmin: false,
            timestamp: Date.now(),
            user_id: receiver,
            room_id: newRoom
        })
        newRoom.participants.push(sender)
        newRoom.participants.push(receiver_participant)
        user.participants.push(sender)
        receiver.participants.push(receiver_participant)
        await newRoom.save()
        await user.save()
        await receiver.save()
        await sender.save()
        await receiver_participant.save()
        res.json({
            success: true,
            message: 'Create participant successfully',
            data : {
                name: newRoom.name,
                type: newRoom.type,
                image_ic: newRoom.image_ic,
            }
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

const getRoom = async (req, res) => {
    try {
        const allRoom = await Room.find({})
        return res
            .json({
                success: true,
                data: allRoom
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

const getRoomByUserId = async (req, res) => {
    const {userId} = req.params
    const user = await User.findOne({user_id:userId})
    if (!user) {
        return res
            .status(404)
            .json({
                success: false,
                message: "User is not existing!"
            })
    }
    try {
        let participants = []
        for (let p of user.participants) {
            let participant = await Participant.findById(p)
            participants.push(participant)
        }
        let rooms = []
        for (let p of participants) {
            let room = await Room.findById(p.room_id)
                .populate({
                    path: 'messages',
                    options: {
                        limit: 10,
                        sort: {created: -1},
                        skip: 0
                    }
                })
            rooms.push(room)
        }
        return res
            .json({
                success: true,
                data: rooms
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

const deleteRoom = async (req, res) => {
    try {
        const roomDeleteCondition = {
            _id: req.params.rid,
            user: req.userId
        }
        const room = await Room.findById(roomDeleteCondition._id)
        if (!room) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "Room not found"
                })
        }
        if (room.messages) {
            room.messages.map(async (item) => {
                let msg = await Message.findById(item._id.toString())
                if (msg){
                    msg.room_id = undefined
                    msg.save()
                }
            })
        }
        if (room.participants) {
            room.participants.map(async (item) => {
                let participant = await Participant.findById(item._id.toString())
                if (participant) {
                    participant.room_id = undefined
                    participant.save()
                }
            })
        }
        const deleteRoom =await Room.findOneAndDelete(roomDeleteCondition)
        if (!deleteRoom)
            return res
                .status(401)
                .json({
                    success: false,
                    message: "Room not exist"
                })
        res.json({success: true, data: deleteRoom})
    } catch (e) {
        return res.status(500).json({ success: false, message: e });
    }
}

module.exports = { createRoomPublic, createRoomPrivate, getRoom, getRoomByUserId, deleteRoom };