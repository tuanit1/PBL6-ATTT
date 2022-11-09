const User = require("../models/User");
const Room = require("../models/Room");
const Participant = require("../models/Participant");

const createParticipant = async (req, res) => {
    const {userId, roomId} = req.params
    const user = await User.findOne({user_id: userId})
    if (!user)
        return res
            .status(400)
            .json({
                success: false,
                message: "User is not existed!"
            })
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
        res.json({
            success: true,
            message: 'Create room successfully',
            data: {
                _id: newParticipant._id,
                user: user,
                room_id: room._id,
                nickname: newParticipant.nickname,
                isAdmin: newParticipant.isAdmin,
                timestamp: newParticipant.timestamp,
                allowSendMSG: newParticipant.allowSendMSG,
                allowSendFile: newParticipant.allowSendFile,
                allowViewFile: newParticipant.allowViewFile,
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

const getParticipant = async (req, res) => {
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

const getParticipantById = async (req, res) => {
    try {
        const {participantId} = req.params
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

const updateParticipant = async (req, res) => {
    const {participantId} = req.params
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
        const participantUpdateCondition = {_id: req.params.participantId}
        updatedParticipant = await Participant.findOneAndUpdate(
            participantUpdateCondition,
            updatedParticipant,
            {new: true}
        )
        if (!updatedParticipant)
            return res
                .status(401)
                .json({success: false, message: "Participant not found"})
        res.json({
            success: true,
            message: "Updated!",
            data: updatedParticipant
        })
    } catch (e) {
        return res.status(500).json({success: false, message: "" + e});
    }
}

const deleteParticipant = async (req, res) => {
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
        res.json({success: true, data: deleteParticipant})
    } catch (e) {
        return res.status(500).json({success: false, message: e});
    }
}

const deleteAllParticipant = async (req, res) => {
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
                data: deletedParticipants
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

module.exports = {createParticipant, getParticipant, getParticipantById, updateParticipant, deleteParticipant, deleteAllParticipant};