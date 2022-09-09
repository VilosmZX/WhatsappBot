const { Server } = require("socket.io");
const { Client } = require("whatsapp-web.js");

const handleSocket = (io = new Server()) => {
    io.on('connection', (socket) => {
        console.log(`Connected ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`Disconnected ${socket.id}`);
        })
    });
}

module.exports =  { handleSocket };


