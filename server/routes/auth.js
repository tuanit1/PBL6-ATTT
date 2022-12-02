const express = require('express')
const router = express.Router()
const authController = require('../controller/auth')
const verifyToken = require('../middleware/auth')

// @route Post api/user
// @desc Create participant
router.post('/login/:user_id', authController.login)

router.post('/token', authController.rfToken)

router.put('/logout', verifyToken, authController.logout)
module.exports = router