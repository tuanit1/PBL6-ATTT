const express = require('express')
const router = express.Router()
const authController = require('../controller/auth')

// @route Post api/user
// @desc Create participant
router.post('/login/:user_id', authController.login)

router.post('/token', authController.rfToken)
module.exports = router