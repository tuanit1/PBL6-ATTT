const express = require('express')
const router = express.Router()
const MessageController = require('../controller/message');
const verifyToken = require('../middleware/auth')
// @route Post api/message
// @desc Create message
function messageRouter(ioServer) {
    let messageController = new MessageController(ioServer)
    router.post('/:userId&:roomId', verifyToken, messageController.createMessage)

//get All
    router.get('/', verifyToken, messageController.getMessage)

//get Message by roomId
    router.get('/room/:roomId', verifyToken, messageController.getMessageByRoomId)

//get by pagination
    router.get('/page/:roomId&:page?&:step?', verifyToken, messageController.getMessageByRoomIdWithPagination );

//Delete Message
    router.delete('/:msgId', verifyToken, messageController.deleteMessage)

//Delete all Message
    router.delete('/', verifyToken, messageController.deleteAllMessage)

    return router;
}

module.exports = messageRouter