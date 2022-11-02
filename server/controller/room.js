const Message = require(`../models/Message`)
const User = require("../models/User");
const Room = require("../models/Room");
const Participant = require("../models/Participant");
const {json} = require("express");

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
    //base64
    let name_code = Buffer.from(name).toString('base64')
    let image_ic_code = (image_ic) ? Buffer.from(image_ic).toString('base64') : Buffer.from('https://png.pngtree.com/element_our/png_detail/20181021/group-avatar-icon-design-vector-png_141882.jpg').toString('base64')
    let nickname_code = Buffer.from(user.name).toString('base64')
    try {
        const newRoom = new Room({
            name: name_code,
            type: "group",
            image_ic: image_ic_code
        })
        const newParticipant = new Participant({
            nickname: nickname_code,
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
        console.log(json({newParticipant}))
        res.json({
            success: true,
            message: 'Create participant successfully',
            data: {
                name: newRoom.name,
                type: newRoom.type,
                image_ic: newRoom.image_ic,
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
    const {userId, receiverId} = req.params
    //validate
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
    //base64
    let name_code = Buffer.from('private').toString('base64')
    let image_ic_code = Buffer.from('https://png.pngtree.com/element_our/png_detail/20181021/group-avatar-icon-design-vector-png_141882.jpg').toString('base64')
    let sender_code = Buffer.from(user.name).toString('base64')
    let receiver_code = Buffer.from(receiver.name).toString('base64')

    try {
        const newRoom = new Room({
            name: name_code,
            type: 'private',
            image_ic: image_ic_code
        })
        const sender = new Participant({
            nickname: sender_code,
            isAdmin: true,
            timestamp: Date.now(),
            user_id: user,
            room_id: newRoom
        })
        const receiver_participant = new Participant({
            nickname: receiver_code,
            isAdmin: true,
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
            data: {
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
    const user = await User.findOne({user_id: userId})
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
        let list_of_room = []
        let room = {room: null, messages: [null], user: null}
        for (let p of participants) {
            let roomDB = await Room.findById(p.room_id)
                .populate({
                    path: 'messages',
                    options: {
                        limit: 10,
                        sort: {created: -1},
                        skip: 0,
                    }
                })
            room.room = {
                room_id: roomDB._id,
                name: roomDB.name,
                image_ic: roomDB.image_ic,
                type: roomDB.type
            }
            room.messages = roomDB.messages
            if (roomDB.type === 'group') {
                room.user = null
            }
            else {
                for (let pt of roomDB.participants) {
                    let joiner = await Participant.findById(pt)
                    if (joiner.user_id.toString() !== user._id.toString()) {
                        room.user = await User.findById(joiner.user_id)
                    }
                }
            }
            console.log(room)
            list_of_room.push(room)
        }
        return res
            .json({
                success: true,
                data: list_of_room
            })
    } catch (e) {
        console.log(e)
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
                if (msg) {
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
        const deleteRoom = await Room.findOneAndDelete(roomDeleteCondition)
        if (!deleteRoom)
            return res
                .status(401)
                .json({
                    success: false,
                    message: "Room not exist"
                })
        res.json({success: true, data: deleteRoom})
    } catch (e) {
        return res.status(500).json({success: false, message: e});
    }
}

module.exports = {createRoomPublic, createRoomPrivate, getRoom, getRoomByUserId, deleteRoom};