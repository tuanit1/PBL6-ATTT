const express = require('express')
const mongoose = require('mongoose')

const authRouter = require('./routes/auth')
const userRouter = require('./routes/user')
const participantRouter = require('./routes/participant')
const roomRouter = require('./routes/room')
const messageRouter = require('./routes/message')

const app = express()
const http = require('http')
const server = http.createServer(app);
const { Server } = require("socket.io");
const ioServer = new Server(server);
ioServer.on('connection', () => {
    console.log("message connect")
    ioServer.emit('test', 'hii')
})
const message_nsp = ioServer.of('/message')
message_nsp.on('connection', () => {
    console.log("message connect")
})
message_nsp.on('message', data => {
    console.log(data)
})
const participant_nsp = ioServer.of('/participant')
participant_nsp.on('connection', () => {
    console.log("participant connect")
})
participant_nsp.on('participant', data => {
    console.log(data)
})
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



app.use(express.json())

app.use('/api/auth/', authRouter)
app.use('/api/user', userRouter)
app.use('/api/participant', participantRouter(ioServer))
app.use('/api/room', roomRouter)
app.use('/api/message', messageRouter(ioServer))
app.get('/', (req, res) => res.send('Hello world'))



const PORT = 8080

server.listen(PORT, () => console.log(`Server on port ${PORT}`))