const io = require("socket.io-client");
const socket = io('http://localhost:8080');
socket.on('test', r => {
    console.log(r)
})
message_nsp = io('http://localhost:8080/message');
message_nsp.on('message', data => {
    console.log(data)
})
participant_nsp = io('http://localhost:8080/participant')
participant_nsp.on('participant', data => {
    console.log(data)
})