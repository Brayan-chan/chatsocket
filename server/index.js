import express from "express";
import logger from "morgan";
import dotenv from 'dotenv';
import { createClient } from "@libsql/client";
import { Server } from 'socket.io';
import  { createServer } from 'node:http';

dotenv.config();
const port = process.env.PORT ?? 3000;

const app = express();
app.use(logger('dev'));

// Se crea un servidor con el paquete http de Node.js
const server = createServer(app);

// Se crea una instancia de Socket.io y se le pasa el servidor creado
const io = new Server(server, {
    connectionStateRecovery: {}
});

const db = createClient({
    url: "libsql://desired-spirit-brayan-chan.turso.io",
    authToken: process.env.DB_TOKEN
});

await db.execute(
    `CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        user TEXT,
        color TEXT
    )`
)

// Se define el evento 'connection' que se ejecuta cuando un cliente se conecta al servidor
io.on('connection', async (socket) => {
    console.log('a user has connected');

    // Se define el evento 'disconnect' que se ejecuta cuando un cliente se desconecta del servidor
    socket.on('disconnect', () => {
        console.log('user has disconnected');
    });
    
    // Se define el evento 'chat message' que se ejecuta cuando un cliente emite un mensaje
    socket.on('chat message', async (msg, color) => {
        let result;
        let username = socket.handshake.auth.username ?? 'Anonymous';

        try {
            result = await db.execute({
                sql: 'INSERT INTO messages (content, user, color) VALUES (:msg, :username, :color)',
                // Evitar el SQL Injection
                args: { msg, username, color }
            });
        } catch (e) {
            console.error(e);
            return;
        }

        // Se emite el mensaje a todos los clientes conectados con el id del mensaje
        io.emit('chat message', msg, result.lastInsertRowid.toString(), username, color);
    });

    if (!socket.recovered) {
        try {
            const results = await db.execute({
                sql: 'SELECT id, content, user, color FROM messages WHERE id > ?',
                args: [socket.handshake.auth.serverOffset ?? 0]
            });

            results.rows.forEach(row => {
                socket.emit('chat message', row.content, row.id.toString(), row.user, row.color);
            });
        } catch (e) {
            console.error(e);
            return;
        }
    }
});

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/client/index.html');
});

server.listen(port, () => {
    console.log(`Server started on port ${port}`);
});