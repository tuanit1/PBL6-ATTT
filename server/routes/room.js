const express = require('express')
const router = express.Router()
const roomController = require('../controller/room')

// @route Post api/user
// @desc Create user
router.post('/:userId', roomController.createRoomPublic)

router.post('/private/:userId&:receiverId', roomController.createRoomPrivate)

//get all room
router.get('/', roomController.getRoom)

//get room by user
router.get('/:userId', roomController.getRoomByUserId)

//delete room
router.delete('/:rid', roomController.deleteRoom)

module.exports = router