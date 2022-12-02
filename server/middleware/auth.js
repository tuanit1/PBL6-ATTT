const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization')
    const token = authHeader && authHeader.split(' ')[1]
    console.log(token)

    if (!token) return res.status(401)
        .json({
            success: false,
            message: "Don't have an allowance to access this domain!"
        })
    try {
        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log(decode)
        req.participants = decode.participants
        req.user_id = decode.user_id
        next()
    } catch (e) {
        if (e.name && e.name === 'TokenExpiredError') {
            return res
                .status(403)
                .json({
                    success: false,
                    message: 'Only member can access this domain!',
                    code: 'accessTokenExpired'
                })
        }
        return res
            .status(403)
            .json({
                success: false,
                message: 'Only member can access this domain!'
            })
    }

}

module.exports = verifyToken