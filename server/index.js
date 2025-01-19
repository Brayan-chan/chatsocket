import express from "express";
import logger from "morgan";

const port = process.env.PORT ?? 3000;

const app = express();
app.use(logger('dev'));

app.get('/', (req, res) => {
    // Ejemplo para servir una respuesta HTML
    //res.send('<h1>Hello World</h1>')

    // Ejemplo para servir un archivo HTML
    // Se utiliza current working directory (cwd) para obtener la ruta absoluta del archivo
    res.sendFile(process.cwd() + '/client/index.html')
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});