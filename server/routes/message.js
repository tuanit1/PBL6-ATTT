const express = require('express')
const router = express.Router()
const messageController = require('../controller/message');

const Message = require(`../models/Message`)
const User = require('../models/User')
const Room = require('../models/Room')
const Participant = require('../models/Participant')
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
module.exports = router