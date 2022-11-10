module.exports = class IoClass {
    constructor(ioServer) {
        this.io = ioServer
        this.namespace = this.io.of("/message")
    }

    test () {
        this.namespace.emit("hi","everyone")
    }
}
