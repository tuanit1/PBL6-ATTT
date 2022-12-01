const express = require('express')
const router = express.Router()
const participantController = require('../controller/participant')
const verifyToken = require('../middleware/auth')

// @route Post api/user
// @desc Create participant
router.post('/:userId&:roomId', verifyToken, participantController.createParticipant)

// get all Participant
router.get('/', verifyToken, participantController.getParticipant)

// get all Participant by ID
router.get('/:participantId', verifyToken, participantController.getParticipantById)

// update participant
router.put('/:participantId', verifyToken, participantController.updateParticipant)

// delete participant
router.delete('/:participantId', verifyToken, participantController.deleteParticipant)

// delete all participant
router.delete('/', verifyToken, participantController.deleteAllParticipant)
module.exports = router