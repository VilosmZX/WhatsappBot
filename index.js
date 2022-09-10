const { Client, LocalAuth, MessageMedia, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const AsciiTable = require('ascii-table');
const table = new AsciiTable();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
const { startWeb, io } = require('./web');

const client = new Client({
    authStrategy: new LocalAuth(),
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', async () => {
    prisma.$connect()
        .then(() => {
            console.log('Bot is online [DATABASE ONLINE]');
        })
        .catch(err => {
            console.error(err);
        })
});

client.on('ready', async () => {
    await startWeb(client);
})

client.on('disconnected', async () => {
    await prisma.$disconnect();
});

client.on('message_create', async (msg) => {
    const gc = await msg.getChat();
    
    if (gc.isGroup) {
        const data = {
            author: (await msg.getContact()),
            msg: msg.body,
            chat: (await msg.getChat()).name
        };
        await prisma.chatLog.create({
            data: {
                name: data.author?.pushname,
                msg: data.msg,
                number: data.author?.number,
                group: data.chat,
            }
        });
        io.sockets.emit('new_msg', data);
    }

    if (msg.body.startsWith('/')) {
        const command = msg.body.substring(1).split(' ')[0];
        const params = msg.body.split(' ').filter((param) => !param.startsWith('/'));
        if (!gc.isGroup) 
            return;
        
        if (command === 'savecode') {
            const code = params[0];
            prisma.code.create({
                data: {
                    value: code,
                }
            })
                .then(async (code) => {
                    await gc.sendMessage(`Kode: ${code.value}\nBerhasil Ditambahkan!`);
                })
                .catch(async (err) => {
                    await gc.sendMessage(`Kode ${code} sudah ada di dalam database!`);
                });

        } else if(command === 'codes') {
            const allCodes = await prisma.code.findMany();
            table.clearRows();
            table.setHeading('ID', 'Code');

            if (!allCodes.length)
                return await gc.sendMessage('| Belum ada Code |');

            allCodes.forEach((code) => {
                table.addRow(code.id, code.value);   
            });
            await gc.sendMessage(table.toString());
        } else if(command === 'clearcodes') {
            const { count } = await prisma.code.deleteMany({});
            await gc.sendMessage(`${count} code telah di hapus dari database!`);
        } else if(command === 'remove') {
            const id = parseInt(params[0]);
            if (!id) 
                return await gc.sendMessage('Masukan ID dari code!');
            prisma.code.delete({ where: { id } })
                .then(async (code) => {
                    await gc.sendMessage(`Kode: ${code.value}\nID: ${code.id}\nBerhasil dihapus!`);
                })
                .catch(async (err) => {
                    await gc.sendMessage(`Kode dengan ID ${id} tidak ditemukan!`)
                })
        } else if(command === 'update') {
            const id = parseInt(params[0]);
            const newCode = params[1];
            const oldCode = (await prisma.code.findUnique({ where: { id } })).value;

            prisma.code.update({
                where: {
                    id
                },
                data: {
                    value: newCode,
                }
            })
                .then(async (code) => {
                    await gc.sendMessage(`[${oldCode}] => [${code.value}]`);
                })  
                .catch(async (err) => {
                    await gc.sendMessage(`[${oldCode}] => [${oldCode}]`);
                });
        } else if(command === 'sticker') {
            if (!msg.hasMedia) 
                return await gc.sendMessage('Kirim foto!');
                    
            const media = await msg.downloadMedia();
            const author = (await msg.getContact()).name;
            await gc.sendMessage(media, { sendMediaAsSticker: true, stickerAuthor: author});
        } 
    }
});


client.initialize();
