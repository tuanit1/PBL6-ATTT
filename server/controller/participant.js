const User = require("../models/User");
const Room = require("../models/Room");
const Participant = require("../models/Participant");

class ParticipantController {
    constructor(ioServer) {
        this.ioServer = ioServer;
        this.socket = this.ioServer.of("/participant")
    }
    createParticipant = async (req, res) => {
        const { userId, roomId } = req.params
        const user = await User.findOne({ user_id: userId })
        if (!user)
            return res
                .status(400)
                .json({
                    success: false,
                    message: "User is not existed!"
                })
        let data = {}
        data._id = user._id
        data.user_id = user.user_id
        data.name = user.name
        data.age = user.age
        data.phone = user.phone
        const room = await Room.findById(roomId)
        if (!room)
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Room is not existed!"
                })
        if (room.type === 'private')
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Can not add member to private room!"
                })
        try {
            const newParticipant = new Participant({
                nickname: user.name,
                isAdmin: false,
                timestamp: Date.now(),
                allowSendMSG: true,
                allowSendFile: true,
                allowViewFile: true,
                user_id: user,
                room_id: room
            })
            room.participants.push(newParticipant)
            user.participants.push(newParticipant)
            await room.save()
            await user.save()
            await newParticipant.save()

            //socket
            let participant_socket = {}
            participant_socket._id = newParticipant._id
            participant_socket.nickname = newParticipant.nickname
            participant_socket.isAdmin = newParticipant.isAdmin
            participant_socket.timestamp = newParticipant.timestamp
            participant_socket.allowSendMSG = newParticipant.allowSendMSG
            participant_socket.allowSendFile = newParticipant.allowSendFile
            participant_socket.allowViewFile = newParticipant.allowViewFile
            participant_socket.user_id = newParticipant.user_id._id
            participant_socket.room_id = newParticipant.room_id._id
            participant_socket.action = 'add'

            let dtUser = {}
            let user = await User.findById(participant_socket.user_id)
            if (user) {
                dtUser.user_id = user.user_id
                dtUser.name = user.name
                dtUser.age = user.age
                dtUser.phone = user.phone
                dtUser.image = user.image
                participant_socket.user = dtUser
            }

            this.socket.emit('participant', participant_socket)
            res.json({
                success: true,
                message: 'Create room successfully',
                data: {
                    _id: newParticipant._id,
                    user: data,
                    room_id: room._id,
                    nickname: newParticipant.nickname,
                    isAdmin: newParticipant.isAdmin,
                    timestamp: newParticipant.timestamp,
                    allowSendMSG: newParticipant.allowSendMSG,
                    allowSendFile: newParticipant.allowSendFile,
                    allowViewFile: newParticipant.allowViewFile,
                },
                action: "create"
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

    getParticipant = async (req, res) => {
        try {
            const allParticipant = await Participant.find({})
            return res
                .json({
                    success: true,
                    data: allParticipant
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

    getParticipantById = async (req, res) => {
        try {
            const { participantId } = req.params
            const participant = await Participant.findById(participantId)
            if (!participant) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message: "participant is not existed!"
                    })
            }
            return res
                .json({
                    success: true,
                    data: participant
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

    getParticipantsByRoomId = async (req, res) => {
        const { rid } = req.params
        try {
            const room = await Room.findById(rid)
            if (!room) {
                return res.status(404).json({
                    success: false,
                    message: "Room Not Found!"
                })
            }

            let datas = []
            for (let p of room.participants) {
                let participant = await Participant.findById(p)
                if (participant) {
                    let data = {}
                    data._id = participant._id
                    data.isAdmin = participant.isAdmin
                    data.timestamp = participant.timestamp
                    data.allowSendMSG = participant.allowSendMSG
                    data.allowSendFile = participant.allowSendFile
                    data.allowViewFile = participant.allowViewFile
                    data.room_id = participant.room_id
                    let dtUser = {}
                    let user = await User.findById(participant.user_id)
                    if (user) {
                        dtUser.user_id = user.user_id
                        dtUser.name = user.name
                        dtUser.age = user.age
                        dtUser.phone = user.phone
                        dtUser.image = user.image
                        data.user = dtUser
                    }
                    datas.push(data)
                }
            }
            return res
                .json({
                    success: true,
                    data: datas
                })
        } catch (e) {
            console.log(e)
            return res.status(500).json({
                success: false,
                message: "Internal Server"
            })
        }
    }

    updateParticipant = async (req, res) => {
        const { participantId } = req.params
        console.log(participantId)
        const participant = await Participant.findById(participantId)
        if (!participant)
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Participant is not existed!"
                })
        const {
            nickname,
            isAdmin,
            allowSendMSG,
            allowSendFile,
            allowViewFile,
        } = req.body
        try {
            let updatedParticipant = {
                nickname,
                isAdmin,
                timestamp: Date.now(),
                allowSendMSG,
                allowSendFile,
                allowViewFile,
            }
            const participantUpdateCondition = { _id: req.params.participantId }
            updatedParticipant = await Participant.findOneAndUpdate(
                participantUpdateCondition,
                updatedParticipant,
                { new: true }
            )
            if (!updatedParticipant)
                return res
                    .status(401)
                    .json({ success: false, message: "Participant not found" })
            //socket
            let participant_socket = {}
            participant_socket._id = participantId
            participant_socket.nickname = updatedParticipant.nickname
            participant_socket.isAdmin = updatedParticipant.isAdmin
            participant_socket.timestamp = updatedParticipant.timestamp
            participant_socket.allowSendMSG = updatedParticipant.allowSendMSG
            participant_socket.allowSendFile = updatedParticipant.allowSendFile
            participant_socket.allowViewFile = updatedParticipant.allowViewFile
            participant_socket.user_id = updatedParticipant.user_id
            participant_socket.room_id = updatedParticipant.room_id
            participant_socket.action = 'update'

            let dtUser = {}
            let user = await User.findById(participant_socket.user_id)
            if (user) {
                dtUser.user_id = user.user_id
                dtUser.name = user.name
                dtUser.age = user.age
                dtUser.phone = user.phone
                dtUser.image = user.image
                participant_socket.user = dtUser
            }

            console.log(participant_socket)
            this.socket.emit('participant', participant_socket)
            return res.json({
                success: true,
                message: "Updated!",
                action: "update"
            })
        } catch (e) {
            console.log(e)
            return res.status(500).json({ success: false, message: "" + e });
        }
    }

    deleteParticipant = async (req, res) => {
        try {
            const participantDeleteCondition = {
                _id: req.params.participantId,
                user: req.userId
            }
            const participant = await Participant.findById(participantDeleteCondition._id)
            if (!participant) {
                return res
                    .status(401)
                    .json({
                        success: false,
                        message: "Participant not found"
                    })
            }
            if (participant.user_id) {
                const user = await User.findById(participant.user_id)
                if (user) {
                    user.participants = user.participants.filter(item => item._id.toString() !== participant._id.toString())
                    user.save()
                }
            }
            if (participant.room_id) {
                const room = await Room.findById(participant.room_id)
                if (room) {
                    room.participants = room.participants.filter(item => item._id.toString() !== participant._id.toString())
                    room.save()
                }
            }
            const deleteParticipant = await Participant.findOneAndDelete(participantDeleteCondition)
            if (!deleteParticipant)
                return res
                    .status(401)
                    .json({
                        success: false,
                        message: "Room not exist"
                    })
            //socket
            let participant_socket = {}
            participant_socket._id = req.params.participantId
            participant_socket.nickname = deleteParticipant.nickname
            participant_socket.isAdmin = deleteParticipant.isAdmin
            participant_socket.timestamp = deleteParticipant.timestamp
            participant_socket.allowSendMSG = deleteParticipant.allowSendMSG
            participant_socket.allowSendFile = deleteParticipant.allowSendFile
            participant_socket.allowViewFile = deleteParticipant.allowViewFile
            participant_socket.user_id = deleteParticipant.user_id
            participant_socket.room_id = deleteParticipant.room_id
            participant_socket.action = 'delete'

            let dtUser = {}
            let user = await User.findById(participant_socket.user_id)
            if (user) {
                dtUser.user_id = user.user_id
                dtUser.name = user.name
                dtUser.age = user.age
                dtUser.phone = user.phone
                dtUser.image = user.image
                participant_socket.user = dtUser
            }
            this.socket.emit('participant', participant_socket)

            res.json({ success: true, data: deleteParticipant, action: "delete" })
        } catch (e) {
            return res.status(500).json({ success: false, message: e });
        }
    }

    deleteAllParticipant = async (req, res) => {
        try {
            const participants = await Participant.find({})
            let deletedParticipants = []
            for (let participant of participants) {
                const participantDeleteCondition = {
                    _id: participants._id,
                    user: req.userId
                }
                if (participant.user_id) {
                    const user = await User.findById(participant.user_id)
                    if (user) {
                        user.participants = user.participants.filter(item => item._id.toString() !== participant._id.toString())
                        user.save()
                    }
                }
                if (participant.room_id) {
                    const room = await Room.findById(participant.room_id)
                    if (room) {
                        room.participants = room.participants.filter(item => item._id.toString() !== participant._id.toString())
                        room.save()
                    }
                }
                const deleteParticipant = await Participant.findOneAndDelete(participantDeleteCondition)
                if (!deleteParticipant)
                    return res
                        .status(401)
                        .json({
                            success: false,
                            message: "Room not exist"
                        })
                deletedParticipants.push(deleteParticipant)
            }

            return res
                .json({
                    success: true,
                    data: deletedParticipants,
                    action: "deleteAll"
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
}
// const createParticipant = async (req, res) => {
//     const {userId, roomId} = req.params
//     const user = await User.findOne({user_id: userId})
//     if (!user)
//         return res
//             .status(400)
//             .json({
//                 success: false,
//                 message: "User is not existed!"
//             })
//     let data = {}
//     data._id = user._id
//     data.user_id = user.user_id
//     data.name = user.name
//     data.age = user.age
//     data.phone = user.phone
//     const room = await Room.findById(roomId)
//     if (!room)
//         return res
//             .status(400)
//             .json({
//                 success: false,
//                 message: "Room is not existed!"
//             })
//     if (room.type === 'private')
//         return res
//             .status(400)
//             .json({
//                 success: false,
//                 message: "Can not add member to private room!"
//             })
//     try {
//         const newParticipant = new Participant({
//             nickname: user.name,
//             isAdmin: false,
//             timestamp: Date.now(),
//             allowSendMSG: true,
//             allowSendFile: true,
//             allowViewFile: true,
//             user_id: user,
//             room_id: room
//         })
//         room.participants.push(newParticipant)
//         user.participants.push(newParticipant)
//         await room.save()
//         await user.save()
//         await newParticipant.save()
//         res.json({
//             success: true,
//             message: 'Create room successfully',
//             data: {
//                 _id: newParticipant._id,
//                 user: data,
//                 room_id: room._id,
//                 nickname: newParticipant.nickname,
//                 isAdmin: newParticipant.isAdmin,
//                 timestamp: newParticipant.timestamp,
//                 allowSendMSG: newParticipant.allowSendMSG,
//                 allowSendFile: newParticipant.allowSendFile,
//                 allowViewFile: newParticipant.allowViewFile,
//             }
//         })
//     } catch (e) {
//         return res
//             .status(500)
//             .json({
//                 success: false,
//                 message: '' + e
//             })
//     }
// }
//
// const getParticipant = async (req, res) => {
//     try {
//         const allParticipant = await Participant.find({})
//         return res
//             .json({
//                 success: true,
//                 data: allParticipant
//             })
//     } catch (e) {
//         return res
//             .status(500)
//             .json({
//                 success: false,
//                 message: e
//             })
//     }
// }
//
// const getParticipantById = async (req, res) => {
//     try {
//         const {participantId} = req.params
//         const participant = await Participant.findById(participantId)
//         if (!participant) {
//             return res
//                 .status(400)
//                 .json({
//                     success: false,
//                     message: "participant is not existed!"
//                 })
//         }
//         return res
//             .json({
//                 success: true,
//                 data: participant
//             })
//     } catch (e) {
//         console.log(e)
//         return res
//             .status(500)
//             .json({
//                 success: false,
//                 message: e
//             })
//     }
// }
//
// const getParticipantsByRoomId = async (req, res) => {
//     const {rid} = req.params
//     try {
//         const room = await Room.findById(rid)
//         if (!room) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Room Not Found!"
//             })
//         }
//
//         let datas = []
//         for (let p of room.participants) {
//             let participant = await Participant.findById(p)
//             if (participant) {
//                 let data = {}
//                 data._id = participant._id
//                 data.isAdmin = participant.isAdmin
//                 data.timestamp = participant.timestamp
//                 data.allowSendMSG = participant.allowSendMSG
//                 data.allowSendFile = participant.allowSendFile
//                 data.allowViewFile = participant.allowViewFile
//                 data.room_id = participant.room_id
//                 let dtUser = {}
//                 let user = await User.findById(participant.user_id)
//                 if (user) {
//                     dtUser.user_id = user.user_id
//                     dtUser.name = user.name
//                     dtUser.age = user.age
//                     dtUser.phone = user.phone
//                     dtUser.image = user.image
//                     dtUser.messages = user.messages
//                     data.user = dtUser
//                 }
//                 datas.push(data)
//             }
//         }
//         return res
//             .json({
//                 success: true,
//                 data: datas
//             })
//     } catch (e) {
//         console.log(e)
//         return res.status(500).json({
//             success: false,
//             message: "Internal Server"
//         })
//     }
// }
//
// const updateParticipant = async (req, res) => {
//     const {participantId} = req.params
//     console.log(participantId)
//     const participant = await Participant.findById(participantId)
//     if (!participant)
//         return res
//             .status(400)
//             .json({
//                 success: false,
//                 message: "Participant is not existed!"
//             })
//     const {
//         nickname,
//         isAdmin,
//         allowSendMSG,
//         allowSendFile,
//         allowViewFile,
//     } = req.body
//     try {
//         let updatedParticipant = {
//             nickname,
//             isAdmin,
//             timestamp: Date.now(),
//             allowSendMSG,
//             allowSendFile,
//             allowViewFile,
//         }
//         const participantUpdateCondition = {_id: req.params.participantId}
//         updatedParticipant = await Participant.findOneAndUpdate(
//             participantUpdateCondition,
//             updatedParticipant,
//             {new: true}
//         )
//         if (!updatedParticipant)
//             return res
//                 .status(401)
//                 .json({success: false, message: "Participant not found"})
//         res.json({
//             success: true,
//             message: "Updated!",
//             data: updatedParticipant
//         })
//     } catch (e) {
//         return res.status(500).json({success: false, message: "" + e});
//     }
// }
//
// const deleteParticipant = async (req, res) => {
//     try {
//         const participantDeleteCondition = {
//             _id: req.params.participantId,
//             user: req.userId
//         }
//         const participant = await Participant.findById(participantDeleteCondition._id)
//         if (!participant) {
//             return res
//                 .status(401)
//                 .json({
//                     success: false,
//                     message: "Participant not found"
//                 })
//         }
//         if (participant.user_id) {
//             const user = await User.findById(participant.user_id)
//             if (user) {
//                 user.participants = user.participants.filter(item => item._id.toString() !== participant._id.toString())
//                 user.save()
//             }
//         }
//         if (participant.room_id) {
//             const room = await Room.findById(participant.room_id)
//             if (room) {
//                 room.participants = room.participants.filter(item => item._id.toString() !== participant._id.toString())
//                 room.save()
//             }
//         }
//         const deleteParticipant = await Participant.findOneAndDelete(participantDeleteCondition)
//         if (!deleteParticipant)
//             return res
//                 .status(401)
//                 .json({
//                     success: false,
//                     message: "Room not exist"
//                 })
//         res.json({success: true, data: deleteParticipant})
//     } catch (e) {
//         return res.status(500).json({success: false, message: e});
//     }
// }
//
// const deleteAllParticipant = async (req, res) => {
//     try {
//         const participants = await Participant.find({})
//         let deletedParticipants = []
//         for (let participant of participants) {
//             const participantDeleteCondition = {
//                 _id: participants._id,
//                 user: req.userId
//             }
//             if (participant.user_id) {
//                 const user = await User.findById(participant.user_id)
//                 if (user) {
//                     user.participants = user.participants.filter(item => item._id.toString() !== participant._id.toString())
//                     user.save()
//                 }
//             }
//             if (participant.room_id) {
//                 const room = await Room.findById(participant.room_id)
//                 if (room) {
//                     room.participants = room.participants.filter(item => item._id.toString() !== participant._id.toString())
//                     room.save()
//                 }
//             }
//             const deleteParticipant = await Participant.findOneAndDelete(participantDeleteCondition)
//             if (!deleteParticipant)
//                 return res
//                     .status(401)
//                     .json({
//                         success: false,
//                         message: "Room not exist"
//                     })
//             deletedParticipants.push(deleteParticipant)
//         }
//         return res
//             .json({
//                 success: true,
//                 data: deletedParticipants
//             })
//     } catch (e) {
//         return res
//             .status(500)
//             .json({
//                 success: false,
//                 message: e
//             })
//     }
// }

module.exports = ParticipantController
// module.exports = {
//     createParticipant,
//     getParticipant,
//     getParticipantById,
//     getParticipantsByRoomId,
//     updateParticipant,
//     deleteParticipant,
//     deleteAllParticipant
// };