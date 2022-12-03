const express = require('express')
const router = express.Router()
const userController = require('../controller/user')
const verifyToken = require('../middleware/auth')

// @route Post api/user
// @desc Create user
router.post('/', userController.createUser)

//get all user
router.get('/', verifyToken, userController.getUser)

//get user by id
router.get('/:uid', verifyToken, userController.getUserById)

//update user
router.put('/:uid', userController.updateUser)

//delete user
router.delete('/:uid', userController.deleteUser)

//delete all user
router.delete('/', verifyToken, userController.deleteAllUser)

//get user_id by id
router.get('/userid/:user_id', verifyToken, userController.getUser_idBy_id)

module.exports = router