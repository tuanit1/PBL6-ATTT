require('dotenv').config()
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateTokens = payload => {
    // console.log(payload.user_id)
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '30m'
    })

    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '1h'
    })
    return {accessToken, refreshToken}
}

const updateRefreshToken = async (user_id, refreshToken) => {
    let users = await User.find()
    users = users.map(async user => {
        if (user.user_id === user_id) {
            user = {
                user_id: user.user_id,
                name: user.name,
                age: user.age,
                phone: user.phone,
                image: user.image,
                messages: user.messages,
                participants: user.participants,
                refreshToken: refreshToken
            }
            let updatedUser = await User.findOneAndUpdate(
                {user_id: user_id},
                user,
                {new: true})
            // console.log(user)
            return user
        }
        return user
    })
}

const login = async (req, res) => {
    const { user_id } = req.params
    try {
        const user = await User.findOne({user_id: user_id})
        if (!user) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "User not found!"
                })
        }

        const tokens = generateTokens({
            user_id: user.user_id,
            participants: user.participants
        })
        updateRefreshToken(user_id, tokens.refreshToken)

        // console.log(user.refreshToken)

        return res
            .json({
                success: true,
                data: tokens
            })
    } catch (e) {
        return res
            .status(505)
            .json({
                success: false,
                message: "" + e
            })
    }
}

const rfToken = async (req, res) => {
    const {refreshToken} = req.body
    if (!refreshToken)
        return res
            .status(401)
            .json({
                success: false,
                message: "fill token!"
            })
    console.log(refreshToken)
    try {
        const user = await User.findOne({refreshToken: refreshToken})
        // console.log(user)
        if (!user) {
            return res
                .status(403)
                .json({
                    success: false,
                    message: "Token not found!",
                    code: "refreshTokenInvalid"
                })
        }
        // console.log(user.user_id)
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const tokens = generateTokens({
            user_id: user.user_id,
            participants: user.participants
        })
        updateRefreshToken(user.user_id, tokens.refreshToken)
        return res
            .json({
                success: true,
                data: tokens
            })

    } catch (e) {
        if (e.name && e.name === 'TokenExpiredError') {
            return res
                .status(403)
                .json({
                    success: false,
                    message: 'Your Token is expired!',
                    code: 'refreshTokenExpired'
                })
        }
        return res
            .status(403)
            .json({
                success: false,
                message: 'Invalid Token!'
            })
    }
}

const logout = async (req, res) => {
    try {
        const user = await User.findOne({user_id: req.user_id})
        updateRefreshToken(user.user_id, null)
        return res
            .json({
                success: true,
                data: user
            })
    } catch (e) {
        console.log(e)
        return res
            .status(500)
            .json({
                success: false,
                message: "Internal server"
            })
    }
}

const check = async (req, res) => {
    const {token} = req.body
    if (!token)
        return res
            .status(401)
            .json({
                success: false,
                message: "fill token!"
            })
    console.log(token)
    try {
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
        return res
            .json({
                success: true,
                message: "Token available!",
                data: token,
                code: "available"
            })
    } catch (e) {
        if (e.name && e.name === 'TokenExpiredError') {
            return res
                .status(403)
                .json({
                    success: false,
                    message: 'Only member can access this domain!',
                    code: 'expired'
                })
        }
        return res
            .status(500)
            .json({
                success: false,
                message: ''+e
            })
    }
}

module.exports = {login, rfToken, logout, check}