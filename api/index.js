// Módulo para crear APIs en NodeJS
import express from 'express';

// Módulo para habilitar peticiones CORS
import cors from 'cors';

// Módulo para generar ids únicos
import { v4 as uuidv4 } from 'uuid';

// Creamos la API
const app = express();

// Puerto de escucha
const port = 3000;

// Cargamos la librería de acceso a datos
import * as accesoDatos from './accesoDatos.js';

// Para procesar JSON
app.use(express.json()); // for parsing application/json

// Para habilitar CORS
app.use(cors());

// Obtener los gastos de un usuario (GET)
app.get('/:usuario', function (request, response, next) {
    var usuarioNombre = request.params.usuario;
    // Se llama a la función 'obtenerGastosUsuario', que devuelve una promesa
    accesoDatos.obtenerGastosUsuario(usuarioNombre).then(datos => {
	// La promesa devuelve los datos del usuario
	response.json(datos);
	next();
    });
});

// Añadir un gasto a un usuario (POST)
app.post('/:usuario', function (request, response, next) {
    var usuarioNombre = request.params.usuario;
    var datos = request.body;
    // Añadimos un 'id' para el nuevo gasto creado
    datos.id = uuidv4();
    // Se llama a la función 'anyadirGastoUsuario', que devuelve una promesa
    // Cuando se resuelve esa promesa el fichero se ha modificado con la nueva información
    accesoDatos.anyadirGastoUsuario(usuarioNombre, datos).then(() => {
	response.end("Gasto añadido con éxito");
	next();
    });
});

// Editar un gasto de un usuario (PUT)
app.put('/:usuario/:gastoId', function (request, response, next) {
    var usuarioNombre = request.params.usuario;
    var gastoId = request.params.gastoId;
    var datos = request.body;
    // Se llama a la función 'anyadirGastoUsuario', que devuelve una promesa
    // Cuando se resuelve esa promesa el fichero se ha modificado con la nueva información
    accesoDatos.actualizarGastoUsuario(usuarioNombre, gastoId, datos).then(() => {
	response.end("Gasto modificado con éxito");
	next();
    }).catch((error) => {
	// No se ha encontrado el usuario o el gasto
	response.status(404).end(`Error: ${error.message}`);
	next();
    });
});

// Borrar un gasto de un usuario (DELETE)
app.delete('/:usuario/:gastoId', function (request, response, next) {
    var usuarioNombre = request.params.usuario;
    var gastoId = request.params.gastoId;
    // Se llama a la función 'anyadirGastoUsuario', que devuelve una promesa
    // Cuando se resuelve esa promesa el fichero se ha modificado con la nueva información
    accesoDatos.borrarGastoUsuario(usuarioNombre, gastoId).then(() => {
	response.end("Gasto borrado con éxito");
	next();
    }).catch((error) => {
	// No se ha encontrado el usuario o el gasto
	response.status(404).end(`Error: ${error.message}`);
	next();
    });
});


// Puesta en marcha del servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
})

