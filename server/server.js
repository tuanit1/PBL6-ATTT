const express = require('express')
const mongoose = require('mongoose')

const userRouter = require('./routes/user')
const participantRouter = require('./routes/participant')
const roomRouter = require('./routes/room')
const messageRouter = require('./routes/message')
//database
const connectDB = async () => {
    try {
        await mongoose.connect(
            // process.env.DATABASE
            'mongodb+srv://PBLDev:LYuON9k9HH5Wlyzf@pbl6-attt.frxvwgv.mongodb.net/?retryWrites=true&w=majority'
        )
        console.log("MongoDB connected")
    } catch (error) {
        console.log(error.message)
        process.exit(1)
    }
}
connectDB()

const app = express()
app.use(express.json())

app.use('/api/user', userRouter)
app.use('/api/participant', participantRouter)
app.use('/api/room', roomRouter)
app.use('/api/message', messageRouter)
app.get('/', (req, res) => res.send('Hello world'))



const PORT = 8080

app.listen(PORT, () => console.log(`Server on port ${PORT}`))