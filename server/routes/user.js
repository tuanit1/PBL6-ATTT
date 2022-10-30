const express = require('express')
const router = express.Router()
const userController = require('../controller/user')

// @route Post api/user
// @desc Create user
router.post('/', userController.createUser)

//get all user
router.get('/', userController.getUser)

//delete user
router.delete('/:uid', userController.deleteUser)

module.exports = router