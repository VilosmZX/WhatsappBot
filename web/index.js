const express = require('express');
const { Client } = require('whatsapp-web.js');
const app = express();
const http = require('http');
const socket = http.createServer(app);
const { Server } = require('socket.io');
const { handleSocket } = require('./sockets');

const io = new Server(socket); 

const startWeb = async (client) => {
    app.set('view engine', 'ejs');
    app.use(express.static('public'));
    
    handleSocket(io);
    
    app.get('/', async (req, res) => {
        const context = {
            chats: (await client.getChats()).filter((chat) => chat.isGroup)
        };
        res.render('home', context);
    });

    app.get('/chatlog', async (req, res) => {
        res.render('chatlog');
    })

    socket.listen(8080, () => {
        console.log('Web is online!')
    });
}

module.exports = { startWeb, io }