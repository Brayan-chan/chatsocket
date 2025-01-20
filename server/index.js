import express from "express";
import logger from "morgan";
import { Server } from 'socket.io';
import  { createServer } from 'node:http';

const port = process.env.PORT ?? 3000;

const app = express();
app.use(logger('dev'));

// Se crea un servidor con el paquete http de Node.js
const server = createServer(app);

// Se crea una instancia de Socket.io y se le pasa el servidor creado
const io = new Server(server);

// Se define el evento 'connection' que se ejecuta cuando un cliente se conecta al servidor
io.on('connection', () => {
    console.log('a user has connected');
});

app.get('/', (req, res) => {
    // Ejemplo para servir una respuesta HTML
    //res.send('<h1>Hello World</h1>')

    // Ejemplo para servir un archivo HTML
    // Se utiliza current working directory (cwd) para obtener la ruta absoluta del archivo
    res.sendFile(process.cwd() + '/client/index.html')
});

server.listen(port, () => {
    console.log(`Server started on port ${port}`);
})

/*app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});*/