const express = require('express')
const router = express.Router()
const MessageController = require('../controller/message');
// @route Post api/message
// @desc Create message
function messageRouter(ioServer) {
    let messageController = new MessageController(ioServer)
    router.post('/:userId&:roomId', messageController.createMessage)

//get All
    router.get('/', messageController.getMessage)

//get Message by roomId
    router.get('/room/:roomId', messageController.getMessageByRoomId)

//get by pagination
    router.get('/page/:roomId&:page?&:step?', messageController.getMessageByRoomIdWithPagination );

//Delete Message
    router.delete('/:msgId', messageController.deleteMessage)

//Delete all Message
    router.delete('/', messageController.deleteAllMessage)

    return router;
}

module.exports = messageRouter