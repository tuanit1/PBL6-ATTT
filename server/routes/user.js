const express = require('express')
const router = express.Router()
const userController = require('../controller/user')

// @route Post api/user
// @desc Create user
router.post('/', userController.createUser)

//get all user
router.get('/', userController.getUser)

//get user by id
router.get('/:uid', userController.getUserById)

//update user
router.put('/:uid', userController.updateUser)

//delete user
router.delete('/:uid', userController.deleteUser)

//delete all user
router.delete('/', userController.deleteAllUser)

module.exports = router