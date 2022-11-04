const express = require('express')
const router = express.Router()
const messageController = require('../controller/message');

// @route Post api/message
// @desc Create message
router.post('/:userId&:roomId', messageController.createMessage)

//get All
router.get('/', messageController.getMessage)

//get Message by roomId
router.get('/room/:roomId', messageController.getMessageByRoomId)

//get by pagination
router.get('/page/:page?&:roomId', messageController.getMessageByRoomIdWithPagination );

//Delete Message
router.delete('/:msgId', messageController.deleteMessage)

//Delete all Message
router.delete('/', messageController.deleteAllMessage)
module.exports = router