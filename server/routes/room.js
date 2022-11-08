const express = require('express')
const router = express.Router()
const roomController = require('../controller/room')

// @route Post api/user
// @desc Create user
router.post('/:userId', roomController.createRoomPublic)

router.post('/private/:userId&:receiverId', roomController.createRoomPrivate)

//get all room
router.get('/', roomController.getRoom)

//get room by id user and room
router.get('/:userId&:roomId', roomController.getRoomById)

//get private room by user
router.get('/private/:userId', roomController.getRoomPrivateByUserId)

//get public room by user
router.get('/group/:userId', roomController.getRoomGroupByUserId)

//get private room by 2 user
router.get('/check/:userId&:partnerId', roomController.getRoomPrivateByUsers)

//get room by user
router.get('/:userId', roomController.getRoomByUserId)

//delete room
router.delete('/:rid', roomController.deleteRoom)

//delete all room
router.delete('/', roomController.deleteAllRoom)

module.exports = router