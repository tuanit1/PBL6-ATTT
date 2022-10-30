const User = require('../models/User')
const Message = require("../models/Message");
const Participant = require("../models/Participant");

const createUser = async (req, res) => {
    const {user_id, name, age, phone, image} = req.body


    if (!user_id)
        return res
            .status(400)
            .json({
                success: false,
                message: "user_id is require!"
            })
    const user = await User.findOne({user_id: user_id})
    if (user){
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
    if (phone)
        if (phone.length !== 10)
            return res
                .status(400)
                .json({
                    success: false,
                    message: "phone must be 10 numbers"
                })
    try {
        const newUser = new User({
            user_id: user_id,
            name: name,
            age: age | 0,
            phone: phone | '0000000000',
            image: image | 'https://thuthuatnhanh.com/wp-content/uploads/2020/09/avatar-trang-cuc-doc.jpg'
        })
        console.log(newUser.user_id)
        await newUser.save()
        res.json({
            success: true,
            message: 'Create user successfully',
            data: {
                id: newUser.user_id,
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

const deleteUser = async (req, res) => {
    try {
        userDeleteCondition = {
            _id: req.params.uid,
            user: req.userId
        }
        const user = await User.findOne({user_id:roomDeleteCondition._id})
        if (!user) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "User not found"
                })
        }
        if (user.messages) {
            user.messages.map(async (item) => {
                let msg = await Message.findById(item._id.toString())
                if (msg){
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
        const deleteUser =await User.findOneAndDelete(userDeleteCondition)
        if (!deleteUser)
            return res
                .status(401)
                .json({
                    success: false,
                    message: "User not exist"
                })
        res.json({success: true, data: deleteUser})
    } catch (e) {
        return res.status(500).json({ success: false, message: "" + e });
    }
}

module.exports = { createUser, getUser, deleteUser }