const express = require('express')
const router = express.Router()
const roomController = require('../controller/room')
const verifyToken = require('../middleware/auth')

// @route Post api/user
// @desc Create user
router.post('/:userId', verifyToken, roomController.createRoomPublic)

router.post('/private/:userId&:receiverId', verifyToken, roomController.createRoomPrivate)

//get all room
router.get('/', verifyToken, roomController.getRoom)

//get room by id user and room
router.get('/:userId&:roomId', verifyToken, roomController.getRoomById)

//get private room by user
router.get('/private/:userId', verifyToken, roomController.getRoomPrivateByUserId)

//get public room by user
router.get('/group/:userId', verifyToken, roomController.getRoomGroupByUserId)

//get private room by 2 user
router.get('/check/:userId&:partnerId', verifyToken, roomController.getRoomPrivateByUsers)

//get room by user
router.get('/:userId', verifyToken, roomController.getRoomByUserId)

//delete room
router.delete('/:rid', verifyToken, roomController.deleteRoom)

//delete all room
router.delete('/', verifyToken, roomController.deleteAllRoom)

module.exports = router