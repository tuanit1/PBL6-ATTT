const express = require('express')
const router = express.Router()
const roomController = require('../controller/room')

// @route Post api/user
// @desc Create user
router.post('/:userId', roomController.createRoomPublic)

router.post('/private/:userId&:receiverId', roomController.createRoomPrivate)

//get all room
router.get('/', roomController.getRoom)

//get private room by user
router.get('/private/:userId', roomController.getRoomPrivateByUserId)

//get public room by user
router.get('/group/:userId', roomController.getRoomGroupByUserId)

//delete room
router.delete('/:rid', roomController.deleteRoom)

module.exports = router