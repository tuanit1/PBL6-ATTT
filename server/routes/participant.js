const express = require('express')
const router = express.Router()
const participantController = require('../controller/participant')

// @route Post api/user
// @desc Create participant
router.post('/:userId&:roomId', participantController.createParticipant)

// get all Participant
router.get('/', participantController.getParticipant)

// update participant
router.put('/:participantId', participantController.updateParticipant)

// delete participant
router.delete('/:participantId', participantController.deleteParticipant)

// delete all participant
router.delete('/', participantController.deleteAllParticipant)
module.exports = router