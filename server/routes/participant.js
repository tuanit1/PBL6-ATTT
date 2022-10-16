const express = require('express')
const router = express.Router()

const Room = require('../models/Room')
const User = require('../models/User')
const Participant = require('../models/Participant')
// @route Post api/user
// @desc Create user
router.post('/:userId&:roomId', async (req, res) => {


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
    try {
        const newParticipant = new Participant({
            nickname: user.name,
            isAdmin: false,
            timestamp: Date.now(),
            user_id: user,
            room_id: room
        })
        room.participants.push(newParticipant)
        user.participants.push(newParticipant)
        // await room.save()
        // await user.save()
        // await newParticipant.save()
        res.json({
            success: true,
            message: 'Create room successfully',
            user: user.name,
            room: room.name,
            nickname: newParticipant.nickname,
            isAdmin: newParticipant.isAdmin,
            timestamp: newParticipant.timestamp,
        })
    } catch (e) {
        return res
            .status(500)
            .json({
                success: false,
                message: '' + e
            })
    }
})

module.exports = router