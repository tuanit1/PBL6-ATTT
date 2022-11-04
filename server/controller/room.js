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
    try {
        let image_s = (!image_ic) ? '' : image_ic

        const newRoom = new Room({
            name: name,
            type: "group",
            image_ic: image_s,
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
                _id: newRoom._id,
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

const getRoomPrivateByUserId = async (req, res) => {
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
        let data = []
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
            if (roomDB.type === 'private') {
                room.room = {
                    room_id: roomDB._id,
                    name: roomDB.name,
                    image_ic: roomDB.image_ic,
                    type: roomDB.type
                }
                room.messages = roomDB.messages
                for (let pt of roomDB.participants) {
                    let joiner = await Participant.findById(pt)
                    if (joiner.user_id.toString() !== user._id.toString()) {
                        room.user = await User.findById(joiner.user_id)
                    }
                }
                data.push(room)
            }
        }
        return res
            .json({
                success: true,
                message: 'get private rooms successfull',
                data: data
            })
    } catch (e) {

    }
}

const getRoomGroupByUserId = async (req, res) => {
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
        let data = []
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
            if (roomDB.type === 'group') {
                room.user = null
                room.room = {
                    room_id: roomDB._id,
                    name: roomDB.name,
                    image_ic: roomDB.image_ic,
                    type: roomDB.type
                }
                room.messages = roomDB.messages
                data.push(room)
            }
        }
        return res
            .json({
                success: true,
                message: 'get public rooms successfull',
                data: data
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
        let data = []
        for (let p of participants) {
            let room = {room: null, messages: [null], user: null}
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
            data.push(room)
        }
        return res
            .json({
                success: true,
                message: 'get rooms successfull',
                data: data
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

module.exports = {createRoomPublic, createRoomPrivate, getRoom, getRoomPrivateByUserId, getRoomGroupByUserId, getRoomByUserId, deleteRoom};