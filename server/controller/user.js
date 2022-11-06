const User = require('../models/User')
const Message = require("../models/Message");
const Participant = require("../models/Participant");

const createUser = async (req, res) => {
    const {user_id, name, age, phone, image} = req.body
    //simple validate
    if (!user_id)
        return res
            .status(400)
            .json({
                success: false,
                message: "user_id is require!"
            })
    const user = await User.findOne({user_id: user_id})
    if (user) {
        return res
            .status(400)
            .json({
                success: false,
                message: "User have already existed!"
            })
    }
    if (!name)
        return res
            .status(400)
            .json({
                success: false,
                message: "name is require!"
            })
    // if (phone)
    //     if (phone.length !== 10)
    //         return res
    //             .status(400)
    //             .json({
    //                 success: false,
    //                 message: "phone must be 10 numbers"
    //             })
    try {
        let age_s = (!age) ? 0 : age
        let image_s = (!image) ? '' : image
        let phone_s = (!phone) ? '' : phone
        const newUser = new User({
            user_id: user_id,
            name: name,
            age: age_s,
            phone: phone_s,
            image: image_s
        })
        await newUser.save()
        res.json({
            success: true,
            message: 'Create user successfully',
            data: {
                _id: newUser.user_id,
                name: newUser.name,
                age: newUser.age,
                phone: newUser.phone,
                image: newUser.image,
            }
        })
    } catch (e) {
        return res
            .status(500)
            .json({
                success: false,
                message: '' + e
            })
    }
}

const getUser = async (req, res) => {
    try {
        const allUser = await User.find({})
        return res
            .json({
                success: true,
                data: allUser
            })
    } catch (e) {
        return res
            .status(500)
            .json({
                success: false,
                message: e
            })
    }
}

const getUserById = async (req, res) => {
    const {uid} = req.params
    console.log(uid)
    const user = await User.findOne({user_id: uid})
    if (!user) {
        return res
            .status(400)
            .json({
                success: false,
                message: "User not found!"
            })
    }
    try {
        return res
            .json({
                success: true,
                data: user
            })
    } catch (e) {
        return res
            .status(500)
            .json({
                success: false,
                message: e
            })
    }
}

const deleteUser = async (req, res) => {
    try {
        const user = await User.findOne({user_id: req.params.uid})
        if (!user) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "User not found"
                })
        }
        let userDeleteCondition = {
            _id: user._id,
            user: req.userId
        }
        if (user.messages) {
            user.messages.map(async (item) => {
                let msg = await Message.findById(item._id.toString())
                if (msg) {
                    msg.user_id = undefined
                    msg.save()
                }
            })
        }
        if (user.participants) {
            user.participants.map(async (item) => {
                let participant = await Participant.findById(item._id.toString())
                if (participant) {
                    participant.user_id = undefined
                    participant.save()
                }
            })
        }
        const deleteUser = await User.findOneAndDelete(userDeleteCondition)
        if (!deleteUser)
            return res
                .status(401)
                .json({
                    success: false,
                    message: "User not exist"
                })
        res.json({success: true, data: deleteUser})
    } catch (e) {
        return res.status(500).json({success: false, message: "" + e});
    }
}

const deleteAllUser = async (req, res) => {
    try {
        const users = await User.find({})
        let deletedUsers = []
        for (let user of users) {
            let userDeleteCondition = {
                _id: user._id,
                user: req.userId
            }
            if (user.messages) {
                user.messages.map(async (item) => {
                    let msg = await Message.findById(item._id.toString())
                    if (msg) {
                        msg.user_id = undefined
                        msg.save()
                    }
                })
            }
            if (user.participants) {
                user.participants.map(async (item) => {
                    let participant = await Participant.findById(item._id.toString())
                    if (participant) {
                        participant.user_id = undefined
                        participant.save()
                    }
                })
            }
            const deleteUser = await User.findOneAndDelete(userDeleteCondition)
            if (!deleteUser)
                return res
                    .status(401)
                    .json({
                        success: false,
                        message: "User not exist"
                    })
            deletedUsers.push(deleteUser)
        }
        return res
            .json({
                success: true,
                data: deletedUsers
            })
    } catch (e) {
        return res
            .status(500)
            .json({
                success: false,
                message: e
            })
    }
}

module.exports = {createUser, getUser, getUserById, deleteUser, deleteAllUser}