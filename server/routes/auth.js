const express = require('express')
const router = express.Router()
const authController = require('../controller/auth')
const verifyToken = require('../middleware/auth')

// @route Post api/user
// @desc Create participant
router.post('/login/:user_id', authController.login)

router.post('/token', authController.rfToken)

router.put('/logout', verifyToken, authController.logout)

router.get('/check', authController.check)

router.get('/health', (req, res) => {
    console.log("tesst")
    return res.json({
        success: true
    })
})
module.exports = router