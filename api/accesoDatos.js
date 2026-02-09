// Librería de acceso a datos

// Acceso a las funciones de lectura/escritura de ficheros en NodeJS en forma de promesas
// Las funciones a utilizar son:
// fs.readFile(RUTA_FICHERO) - Para leer el contenido de un fichero. Devuelve una promesa.
// fs.writeFile(RUTA_FICHERO, DATOS_EN_FORMATO_TEXTO) - Para escribir el contenido de un fichero. Devuelve una promesa.
import { promises as fs } from 'fs';

// Ruta del fichero de almacenamiento de datos
let ficheroDatos = "./datos.json";

// Para actualizar el fichero de datos en los tests
function cambiarFicheroDatos(nombre) {
    ficheroDatos = nombre;
}

// Debe devolver una promesa que cuando se resuelva devuelva el array de gastos del usuario
function obtenerGastosUsuario(usuario) {
    // Leemos el fichero
    return fs.readFile(ficheroDatos, { encoding: 'utf8' }).then(datosJson => {
	// Cuando se resuelve la promesa de lectura, se procesan los datos
	let datos = JSON.parse(datosJson);

	// Se devuelve el listado de gastos del usuario, si existe, o un array vacío si no
	return datos[usuario] || [];
    });
}

// Debe devolver una promesa. Cuando se resuelva se debe haber añadido un nuevo gasto al usuario
// y actualizado el fichero de datos
function anyadirGastoUsuario(usuario, gasto) {
    // Leemos el fichero
    return fs.readFile(ficheroDatos, { encoding: 'utf8' }).then(datosJson => {
	// Cuando se resuelve la promesa de lectura, se procesan los datos
	let datos = JSON.parse(datosJson);

	// Se comprueba si el usuario existe en el fichero de datos. Si no, se crea una entrada nueva
	datos[usuario] = datos[usuario] ? datos[usuario] : [];

	// Se añade el gasto al usuario indicado
	datos[usuario].push(gasto);

	// Se devuelve una promesa: cuando se resuelva se habrá completado la escritura del fichero
	return fs.writeFile(ficheroDatos, JSON.stringify(datos));
    });

}

// Debe devolver una promesa. Cuando se resuelva se debe haber modificado el gasto del usuario
// y actualizado el fichero de datos
function actualizarGastoUsuario(usuario, gastoId, nuevosDatos) {
    // Leemos el fichero
    return fs.readFile(ficheroDatos, { encoding: 'utf8' }).then(datosJson => {
	// Cuando se resuelve la promesa de lectura, se procesan los datos
	let datos = JSON.parse(datosJson);
	// Se comprueba si el usuario existe en el fichero de datos. Si no, se genera un error
	if (datos[usuario]) {
	    // Se busca el gasto a editar
	    let gasto = datos[usuario].filter(gasto => gasto.id == gastoId)[0];
	    if (gasto) {
		gasto.descripcion = nuevosDatos.descripcion;
		gasto.valor = nuevosDatos.valor;
		gasto.fecha = nuevosDatos.fecha;
		gasto.etiquetas = nuevosDatos.etiquetas;
	    } else {
		throw new Error("El gasto indicado no existe");
	    }
	} else {
	    throw new Error("El usuario no existe");
	}

	// Se devuelve una promesa: cuando se resuelva se habrá completado la escritura del fichero
	return fs.writeFile(ficheroDatos, JSON.stringify(datos));
    });
}

// Debe devolver una promesa. Cuando se resuelva se debe haber eliminado el gasto del usuario
// y actualizado el fichero de datos
function borrarGastoUsuario(usuario, gastoId) {
    // Leemos el fichero
    return fs.readFile(ficheroDatos, { encoding: 'utf8' }).then(datosJson => {
	// Cuando se resuelve la promesa de lectura, se procesan los datos
	let datos = JSON.parse(datosJson);
	// Se comprueba si el usuario existe en el fichero de datos. Si no, se genera un error
	if (datos[usuario]) {
	    // Se filtran los gastos y se elimina el no deseado
	    datos[usuario] = datos[usuario].filter(gasto => gasto.id != gastoId);
	} else {
	    throw new Error("El usuario no existe");
	}

	// Se devuelve una promesa: cuando se resuelva se habrá completado la escritura del fichero
	return fs.writeFile(ficheroDatos, JSON.stringify(datos));
    });
}

// Exportación de funciones
// Normalmente en NodeJS se utiliza el sistema CommonJS,
// pero se ha configurado el proyecto para que utilice módulos indicando
// 'type = module' en el archivo 'package.json'
export {
    obtenerGastosUsuario,
    anyadirGastoUsuario,
    actualizarGastoUsuario,
    borrarGastoUsuario,
    // Para poder utilizar uno distinto en los tests y no interferir con los datos reales
    cambiarFicheroDatos
}
