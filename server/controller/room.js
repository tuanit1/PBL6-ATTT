const Message = require(`../models/Message`)
const User = require("../models/User");
const Room = require("../models/Room");
const Participant = require("../models/Participant");

//1
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

    const {user_id} = req
    if (user_id !== userId) {
        return res
            .status(403)
            .json({
                success: false,
                message: "You can't access this domain!"
            })
    }

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

//2
const createRoomPrivate = async (req, res) => {
    const {userId, receiverId} = req.params

    const {user_id} = req
    if (user_id !== userId) {
        return res
            .status(403)
            .json({
                success: false,
                message: "You can't access this domain!"
            })
    }

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
            data: {
                _id: newRoom._id,
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

//3
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

//4
const getRoomById = async (req, res) => {
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

    try {
        let data = {}
        const user = await User.findOne({user_id: userId})
            .populate({
                path: 'participants',
            })

        if (!user) {
            return res
                .status(404)
                .json({
                    success: false,
                    message: "User is not existing!"
                })
        }
        let room = {room: null, message: null, participant: null}
        for (let p of user.participants) {
            // console.log(p)
            // console.log(p.room_id._id)
            // console.log(roomId)
            if (p.room_id._id.toString() === roomId.toString()) {
                const roomDB = await Room.findById(roomId).populate({
                    path: 'messages',
                    options: {
                        limit: 10,
                        sort: {"time": "desc"},
                        skip: 0,
                    }
                })
                if (!roomDB) {
                    return res
                        .status(404)
                        .json({
                            success: false,
                            message: "Room is not existing!"
                        })
                }
                data._id = roomDB._id
                data.name = roomDB.name
                data.image_ic = roomDB.image_ic
                data.type = roomDB.type
                room.room = data
                room.message = roomDB.messages[0]
                if (roomDB.type === 'private') {
                    for (let pt of roomDB.participants) {
                        let participant_save = {}
                        let joiner = await Participant.findById(pt).populate({
                            path: 'user_id',
                            select: 'user_id name age phone image'
                        })
                        if (joiner && joiner.user_id.user_id !== user.user_id) {
                            if (data.name === 'private')
                                data.name = joiner.nickname
                            participant_save._id = joiner._id
                            participant_save.nickname = joiner.nickname
                            participant_save.isAdmin = joiner.isAdmin
                            participant_save.timestamp = joiner.timestamp
                            participant_save.allowSendMSG = joiner.allowSendMSG
                            participant_save.allowSendFile = joiner.allowSendFile
                            participant_save.allowViewFile = joiner.allowViewFile
                            participant_save.user = joiner.user_id
                            participant_save.room_id = joiner.room_id
                            room.participant = participant_save
                        }
                    }
                } else {
                    room.participant = null
                }
                return res
                    .json({
                        success: true,
                        data: room
                    })
            }
        }
        return res
            .status(404)
            .json({
                success: false,
                message: "user not in the room or room is not exist!"
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

//5
const getRoomPrivateByUserId = async (req, res) => {

    const {userId} = req.params

    const {user_id} = req
    if (user_id !== userId) {
        return res
            .status(403)
            .json({
                success: false,
                message: "You can't access this domain!"
            })
    }

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
        let room = {room: null, message: null, participant: null}
        for (let p of participants) {
            if (p)
                if (p.room_id) {
                    let roomDB = await Room.findById(p.room_id)
                        .populate({
                            path: 'messages',
                            options: {
                                limit: 10,
                                sort: {"time": "desc"},
                                skip: 0,
                            }
                        })
                    if (roomDB) {
                        if (roomDB.type === 'private') {
                            room.room = {
                                room_id: roomDB._id,
                                name: roomDB.name,
                                image_ic: roomDB.image_ic,
                                type: roomDB.type
                            }
                            room.message = roomDB.messages[0]
                            if (!room.message)
                                room.message = null
                            for (let pt of roomDB.participants) {
                                let participant_save = {}
                                let joiner = await Participant.findById(pt).populate({
                                    path: 'user_id',
                                    select: 'user_id name age phone image'
                                })
                                if (joiner && joiner.user_id.user_id !== user.user_id) {
                                    participant_save._id = joiner._id
                                    participant_save.nickname = joiner.nickname
                                    participant_save.isAdmin = joiner.isAdmin
                                    participant_save.timestamp = joiner.timestamp
                                    participant_save.allowSendMSG = joiner.allowSendMSG
                                    participant_save.allowSendFile = joiner.allowSendFile
                                    participant_save.allowViewFile = joiner.allowViewFile
                                    participant_save.user = joiner.user_id
                                    participant_save.room_id = joiner.room_id
                                    room.participant = participant_save
                                }
                            }
                            data.push(room)
                        }
                    }
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

//6
const getRoomGroupByUserId = async (req, res) => {
    const {userId} = req.params

    const {user_id} = req
    if (user_id !== userId) {
        return res
            .status(403)
            .json({
                success: false,
                message: "You can't access this domain!"
            })
    }

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
            let room = {room: null, message: null, participant: null}
            if (p)
                if (p.room_id) {
                    let roomDB = await Room.findById(p.room_id)
                        .populate({
                            path: 'messages',
                            options: {
                                limit: 10,
                                sort: {"time": "desc"},
                                skip: 0,
                            }
                        })
                    if (roomDB) {
                        if (roomDB.type === 'group') {
                            room.room = {
                                _id: roomDB._id,
                                name: roomDB.name,
                                image_ic: roomDB.image_ic,
                                type: roomDB.type
                            }
                            room.message = roomDB.messages[0]
                            if (!room.message)
                                room.message = null
                            room.participant = null
                            // for (let pt of roomDB.participants) {
                            //     let participant_save = {}
                            //     let joiner = await Participant.findById(pt).populate('user_id')
                            //     if (joiner) {
                            //         participant_save._id = joiner._id
                            //         participant_save.nickname = joiner.nickname
                            //         participant_save.isAdmin = joiner.isAdmin
                            //         participant_save.timestamp = joiner.timestamp
                            //         participant_save.allowSendMSG = joiner.allowSendMSG
                            //         participant_save.allowSendFile = joiner.allowSendFile
                            //         participant_save.allowViewFile = joiner.allowViewFile
                            //         participant_save.user = joiner.user_id
                            //         participant_save.room_id = joiner.room_id
                            //         // room.userlist.push(await User.findById(joiner.user_id))
                            //         room.participantlist.push(participant_save)
                            //     }
                            // }
                            data.push(room)
                        }
                    }
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

//7
const getRoomPrivateByUsers = async (req, res) => {
    const {userId, partnerId} = req.params

    const {user_id} = req
    if (user_id !== userId) {
        return res
            .status(403)
            .json({
                success: false,
                message: "You can't access this domain!"
            })
    }

    const user = await User.findOne({user_id: userId})
    if (!user) {
        return res
            .status(404)
            .json({
                success: false,
                message: "User is not existing!"
            })

    }
    const partner = await User.findOne({user_id: partnerId})
    if (!partner) {
        return res
            .status(404)
            .json({
                success: false,
                message: "User is not existing!"
            })

    }
    try {
        let user_participants = []
        let partner_participants = []
        for (let p of user.participants) {
            let participant = await Participant.findById(p)
            user_participants.push(participant)
        }
        for (let p of partner.participants) {
            let participant = await Participant.findById(p)
            partner_participants.push(participant)
        }
        let room = {room: null, message: null, participant: null}
        for (let up of user_participants) {
            for (let pp of partner_participants) {
                if (up && pp)
                    if (up.room_id && pp.room_id)
                        if (up.room_id.toString() === pp.room_id.toString()) {
                            let roomDB = await Room.findById(up.room_id)
                                .populate({
                                    path: 'messages',
                                    options: {
                                        limit: 10,
                                        sort: {"time": "desc"},
                                        skip: 0,
                                    }
                                })
                            if (roomDB.type === 'private') {
                                room.room = {
                                    _id: roomDB._id,
                                    name: roomDB.name,
                                    image_ic: roomDB.image_ic,
                                    type: roomDB.type
                                }
                                room.message = roomDB.messages[0]
                                if (!room.message)
                                    room.message = null
                                for (let pt of roomDB.participants) {
                                    let participant_save = {}
                                    let joiner = await Participant.findById(pt).populate({
                                        path: 'user_id',
                                        select: 'user_id name age phone image'
                                    })
                                    if (joiner && joiner.user_id.user_id === partner.user_id) {
                                        participant_save._id = joiner._id
                                        participant_save.nickname = joiner.nickname
                                        participant_save.isAdmin = joiner.isAdmin
                                        participant_save.timestamp = joiner.timestamp
                                        participant_save.allowSendMSG = joiner.allowSendMSG
                                        participant_save.allowSendFile = joiner.allowSendFile
                                        participant_save.allowViewFile = joiner.allowViewFile
                                        participant_save.user = joiner.user_id
                                        participant_save.room_id = joiner.room_id
                                        // room.userlist.push(await User.findById(joiner.user_id))
                                        room.participant = participant_save
                                    }
                                }
                                return res
                                    .json({
                                        success: true,
                                        message: 'get private rooms successfull',
                                        data: room
                                    })
                            }
                        }
            }
        }
        return res
            .json({
                success: true,
                message: 'get private rooms successfull',
                data: room
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

//8
const getRoomByUserId = async (req, res) => {
    const {userId} = req.params

    const {user_id} = req
    if (user_id !== userId) {
        return res
            .status(403)
            .json({
                success: false,
                message: "You can't access this domain!"
            })
    }

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
            let room = {room: null, message: null, participant: null}
            if (p)
                if (p.room_id) {
                    let roomDB = await Room.findById(p.room_id)
                        .populate({
                            path: 'messages',
                            options: {
                                limit: 1,
                                sort: {"time": "desc"},
                                skip: 0,
                            }
                        })
                    if (roomDB) {
                        room.room = {
                            _id: roomDB._id,
                            name: roomDB.name,
                            image_ic: roomDB.image_ic,
                            type: roomDB.type
                        }
                        room.message = roomDB.messages[0]
                        if (!room.message)
                            room.message = null
                        if (roomDB.type === 'private') {
                            for (let pt of roomDB.participants) {
                                let participant_save = {}
                                let joiner = await Participant.findById(pt).populate('user_id')
                                if (joiner && joiner.user_id.user_id !== user.user_id) {
                                    participant_save._id = joiner._id
                                    participant_save.nickname = joiner.nickname
                                    participant_save.isAdmin = joiner.isAdmin
                                    participant_save.timestamp = joiner.timestamp
                                    participant_save.allowSendMSG = joiner.allowSendMSG
                                    participant_save.allowSendFile = joiner.allowSendFile
                                    participant_save.allowViewFile = joiner.allowViewFile
                                    participant_save.user = joiner.user_id
                                    participant_save.room_id = joiner.room_id
                                    room.participant = participant_save
                                }
                            }
                        } else {
                            room.participant = null
                        }
                        data.push(room)
                    }
                }
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

//9
const deleteRoom = async (req, res) => {
    try {
        const roomDeleteCondition = {
            _id: req.params.rid,
            user: req.userId
        }

        const {participants} = req
        for (let participant of participants) {
            let participantJWT = await Participant.findById(participant)
            if (participantJWT) {
                if (participantJWT.room_id.toString() === req.params.rid.toString()) {
                    if (participantJWT.isAdmin === true) {
                        const room = await Room.findById(roomDeleteCondition._id)
                        if (!room) {
                            return res
                                .status(401)
                                .json({
                                    success: false,
                                    message: "Room not found"
                                })
                        }

                        if (room.participants) {
                            room.participants.map(async (item) => {
                                let participant = await Participant.findOneAndDelete({
                                    _id: item._id.toString(),
                                    user: req.userId
                                })
                                if (participant.user_id) {
                                    const user = await User.findById(participant.user_id)
                                    if (user)
                                        user.participants = user.participants.filter(item => item._id.toString() !== participant._id.toString())
                                    user.save()
                                }
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

                        const deleteRoom = await Room.findOneAndDelete(roomDeleteCondition)
                        if (!deleteRoom)
                            return res
                                .status(401)
                                .json({
                                    success: false,
                                    message: "Room not exist"
                                })
                        res.json({success: true, data: deleteRoom})
                    } else {
                        return res
                            .status(403)
                            .json({
                                success: false,
                                message: "You're not allowed to do this!"
                            })
                    }
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
        return res.status(500).json({success: false, message: e});
    }
}

//10
const deleteAllRoom = async (req, res) => {
    try {
        const rooms = await Room.find({})
        if (!rooms) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "there is not any room"
                })
        }
        let deletedRooms = []
        for (let room of rooms) {
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
                    let participant = await Participant.findOneAndDelete({_id: item._id.toString(), user: req.userId})
                    if (participant.user_id) {
                        const user = await User.findById(participant.user_id)
                        if (user)
                            user.participants = user.participants.filter(item => item._id.toString() !== participant._id.toString())
                        user.save()
                    }
                })
            }
            const deleteRoom = await Room.findOneAndDelete({
                _id: room._id,
                user: req.userId
            })
            if (!deleteRoom)
                return res
                    .status(401)
                    .json({
                        success: false,
                        message: "Room not exist"
                    })
            deletedRooms.push(deleteRoom)
        }
        return res
            .json({
                success: true,
                data: deletedRooms
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

module.exports = {
    createRoomPublic,
    createRoomPrivate,
    getRoom,
    getRoomById,
    getRoomPrivateByUserId,
    getRoomGroupByUserId,
    getRoomPrivateByUsers,
    getRoomByUserId,
    deleteRoom,
    deleteAllRoom
};