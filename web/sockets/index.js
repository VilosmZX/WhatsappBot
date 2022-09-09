const { Server } = require("socket.io");
const { Client } = require("whatsapp-web.js");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const handleSocket = (io = new Server()) => {
    io.on('connection', (socket) => {
        console.log(`Connected ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`Disconnected ${socket.id}`);
        })

        socket.on('start', async () => {
            console.log('Start Triggered!');
            prisma.chatLog.findMany()
                .then((chats) => {
                    socket.emit('load_msg', chats);
                })
                .catch(err => console.error(err));
        })
    });
}

module.exports =  { handleSocket };


