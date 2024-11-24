let nivelSeleccionado;
let palabrasSeleccionadas;
let tamano;
let matriz;
let palabrasColocadas = [];
let cantidadPalabrasHorizontales;
let cantidadPalabrasVerticales;
let palabraSeleccionada = null;

function iniciarJuego() {
    document.getElementById('inicio').style.display = 'none';
    document.getElementById('juego').style.display = 'block';
    nivelSeleccionado = parseInt(document.getElementById('nivel').value);

    if (nivelSeleccionado === 1) {
        cantidadPalabrasHorizontales = 5;
        cantidadPalabrasVerticales = 5;
    } else if (nivelSeleccionado === 2) {
        cantidadPalabrasHorizontales = 8;
        cantidadPalabrasVerticales = 8;
    } else if (nivelSeleccionado === 3) {
        cantidadPalabrasHorizontales = 12;
        cantidadPalabrasVerticales = 12;
    } else if (nivelSeleccionado === 4) {
        let totalPalabras = getRandomInt(16, 24);
        cantidadPalabrasHorizontales = Math.floor(totalPalabras / 2);
        cantidadPalabrasVerticales = totalPalabras - cantidadPalabrasHorizontales;
    }

    ajustarTamanoCuadricula();

    generarCrucigrama();
}

function ajustarTamanoCuadricula() {
    let longitudMaxima = palabrasYpistas.reduce((max, palabraObj) => Math.max(max, palabraObj.palabra.length), 0);
    tamano = Math.max(longitudMaxima + cantidadPalabrasHorizontales + cantidadPalabrasVerticales, 15);
    if (nivelSeleccionado === 4) {
        tamano = Math.max(30, longitudMaxima + cantidadPalabrasHorizontales + cantidadPalabrasVerticales);
    }
}


function generarCrucigrama() {
    matriz = [];
    for (let i = 0; i < tamano; i++) {
        matriz[i] = [];
        for (let j = 0; j < tamano; j++) {
            matriz[i][j] = '';
        }
    }
    palabrasColocadas = [];


    palabrasSeleccionadas = [...palabrasYpistas];
    mezclarArray(palabrasSeleccionadas);
    palabrasSeleccionadas.sort((a, b) => b.palabra.length - a.palabra.length);

    let palabrasHorizontales = palabrasSeleccionadas.slice(0, cantidadPalabrasHorizontales);
    let palabrasVerticales = palabrasSeleccionadas.slice(cantidadPalabrasHorizontales, cantidadPalabrasHorizontales + cantidadPalabrasVerticales);

    let palabraInicial = palabrasHorizontales.shift();
    let filaInicial = Math.floor(tamano / 2);
    let columnaInicial = Math.floor((tamano - palabraInicial.palabra.length) / 2);
    colocarPalabra(palabraInicial, filaInicial, columnaInicial, 'H');

    for (let palabraObj of palabrasHorizontales) {
        if (!colocarPalabraConCruce(palabraObj, 'H')) {
            if (!colocarPalabraAleatoria(palabraObj, 'H')) {
                console.log(`No se pudo colocar la palabra horizontal: ${palabraObj.palabra}`);
            }
        }
    }

    for (let palabraObj of palabrasVerticales) {
        if (!colocarPalabraConCruce(palabraObj, 'V')) {
            if (!colocarPalabraAleatoria(palabraObj, 'V')) {
                console.log(`No se pudo colocar la palabra vertical: ${palabraObj.palabra}`);
            }
        }
    }

    dibujarCrucigrama();
    mostrarPistas();
}

function colocarPalabraConCruce(palabraObj, direccionPreferida) {
    let palabra = palabraObj.palabra.toUpperCase();

    let palabrasParaCruzar = palabrasColocadas.filter(p => p.direccion !== direccionPreferida);

    for (let palabraExistente of palabrasParaCruzar) {
        let letrasComunes = obtenerLetrasComunes(palabra, palabraExistente.palabra);

        for (let letra of letrasComunes) {
            let posicionesNueva = obtenerIndicesDeLetra(palabra, letra);
            let posicionesExistente = obtenerIndicesDeLetra(palabraExistente.palabra, letra);

            for (let posNueva of posicionesNueva) {
                for (let posExistente of posicionesExistente) {
                    let fila, columna, direccion;

                    direccion = direccionPreferida;

                    if (direccion === 'H') {
                        fila = palabraExistente.fila + posExistente;
                        columna = palabraExistente.columna - posNueva;
                    } else {
                        fila = palabraExistente.fila - posNueva;
                        columna = palabraExistente.columna + posExistente;
                    }

                    if (colocarSiCabe(palabra, fila, columna, direccion, palabraObj)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function colocarPalabraAleatoria(palabraObj, direccionPreferida) {
    let palabra = palabraObj.palabra.toUpperCase();
    let intentos = 0;
    let maxIntentos = 1000;

    while (intentos < maxIntentos) {
        let fila = getRandomInt(0, tamano - 1);
        let columna = getRandomInt(0, tamano - 1);
        let direccion = direccionPreferida;

        if (colocarSiCabe(palabra, fila, columna, direccion, palabraObj)) {
            return true;
        }

        intentos++;
    }

    intentos = 0;
    direccionPreferida = direccionPreferida === 'H' ? 'V' : 'H';

    while (intentos < maxIntentos) {
        let fila = getRandomInt(0, tamano - 1);
        let columna = getRandomInt(0, tamano - 1);
        let direccion = direccionPreferida;

        if (colocarSiCabe(palabra, fila, columna, direccion, palabraObj)) {
            return true;
        }

        intentos++;
    }

    return false;
}

function colocarPalabra(palabraObj, fila, columna, direccion) {
    let palabra = palabraObj.palabra.toUpperCase();

    if (!colocarSiCabe(palabra, fila, columna, direccion, palabraObj)) {
        return false;
    }
    return true;
}

function colocarSiCabe(palabra, fila, columna, direccion, palabraObj) {
    if (fila < 0 || columna < 0) return false;

    if (direccion === 'H') {
        if (columna + palabra.length > tamano) return false;
    } else {
        if (fila + palabra.length > tamano) return false;
    }

    
    for (let i = 0; i < palabra.length; i++) {
        let f = direccion === 'H' ? fila : fila + i;
        let c = direccion === 'H' ? columna + i : columna;

        if (f < 0 || c < 0 || f >= tamano || c >= tamano) return false;

        if (matriz[f][c] === '') continue;
        if (matriz[f][c] !== palabra[i]) return false;
    }

    
    if (direccion === 'H') {
       
        if (columna > 0 && matriz[fila][columna - 1] !== '') return false;
       
        if (columna + palabra.length < tamano && matriz[fila][columna + palabra.length] !== '') return false;
   
        for (let i = 0; i < palabra.length; i++) {
            let c = columna + i;
            if (matriz[fila][c] === '') {
                if (fila > 0 && matriz[fila - 1][c] !== '') return false;
                if (fila < tamano - 1 && matriz[fila + 1][c] !== '') return false;
            }
        }
    } else {

        if (fila > 0 && matriz[fila - 1][columna] !== '') return false;

        if (fila + palabra.length < tamano && matriz[fila + palabra.length][columna] !== '') return false;
 
        for (let i = 0; i < palabra.length; i++) {
            let f = fila + i;
            if (matriz[f][columna] === '') {
                if (columna > 0 && matriz[f][columna - 1] !== '') return false;
                if (columna < tamano - 1 && matriz[f][columna + 1] !== '') return false;
            }
        }
    }

    for (let i = 0; i < palabra.length; i++) {
        let f = direccion === 'H' ? fila : fila + i;
        let c = direccion === 'H' ? columna + i : columna;
        matriz[f][c] = palabra[i];
    }

    palabraObj.fila = fila;
    palabraObj.columna = columna;
    palabraObj.direccion = direccion;
    palabraObj.numero = palabrasColocadas.length + 1;
    palabrasColocadas.push(palabraObj);
    return true;
}

function obtenerLetrasComunes(palabra1, palabra2) {
    let letras1 = new Set(palabra1);
    let letras2 = new Set(palabra2);
    let comunes = [...letras1].filter(letra => letras2.has(letra));
    return comunes;
}

function obtenerIndicesDeLetra(palabra, letra) {
    let indices = [];
    for (let i = 0; i < palabra.length; i++) {
        if (palabra[i] === letra) {
            indices.push(i);
        }
    }
    return indices;
}

function dibujarCrucigrama() {
    let crucigramaDiv = document.getElementById('crucigrama');
    crucigramaDiv.innerHTML = '';
    for (let i = 0; i < tamano; i++) {
        let filaDiv = document.createElement('div');
        filaDiv.style.display = 'flex';
        for (let j = 0; j < tamano; j++) {
            let celdaDiv = document.createElement('div');
            celdaDiv.classList.add('celda');
            if (matriz[i][j] !== '') {
                let input = document.createElement('input');
                input.setAttribute('maxlength', '1');
                input.setAttribute('data-fila', i);
                input.setAttribute('data-columna', j);
                input.addEventListener('keydown', moverCursor);
                input.addEventListener('click', seleccionarPalabra);
                celdaDiv.appendChild(input);

                let palabra = obtenerPalabraEnPosicion(i, j);
                if (palabra && palabra.fila === i && palabra.columna === j) {
                    let numeroDiv = document.createElement('div');
                    numeroDiv.classList.add('numeroCelda');
                    numeroDiv.innerText = palabra.numero;
                    celdaDiv.appendChild(numeroDiv);
                }
            } else {
                celdaDiv.classList.add('celdaNegra');
            }
            filaDiv.appendChild(celdaDiv);
        }
        crucigramaDiv.appendChild(filaDiv);
    }
}

function seleccionarPalabra(event) {
    let fila = parseInt(event.target.getAttribute('data-fila'));
    let columna = parseInt(event.target.getAttribute('data-columna'));
    let palabra = obtenerPalabraEnPosicion(fila, columna);

    if (palabra) {
        palabraSeleccionada = palabra;
        resaltarPalabraSeleccionada();
    }
}

function resaltarPalabraSeleccionada() {
    let inputs = document.querySelectorAll('.celda input');
    inputs.forEach(input => input.parentElement.classList.remove('celdaSeleccionada'));

    if (!palabraSeleccionada) return;

    let { fila, columna, direccion, palabra } = palabraSeleccionada;
    for (let i = 0; i < palabra.length; i++) {
        let f = direccion === 'H' ? fila : fila + i;
        let c = direccion === 'H' ? columna + i : columna;
        let input = document.querySelector(`.celda input[data-fila="${f}"][data-columna="${c}"]`);
        if (input) {
            input.parentElement.classList.add('celdaSeleccionada');
        }
    }
}

function moverCursor(event) {
    if (!palabraSeleccionada) return;
    let { fila, columna, direccion, palabra } = palabraSeleccionada;
    let currentFila = parseInt(event.target.getAttribute('data-fila'));
    let currentColumna = parseInt(event.target.getAttribute('data-columna'));
    let index = direccion === 'H' ? currentColumna - columna : currentFila - fila;

    if (event.key.length === 1 && /^[a-zA-ZñÑ]$/.test(event.key)) {
        event.target.value = event.key.toUpperCase();
        index++;
        event.preventDefault();
    } else if (event.key === 'Backspace') {
        event.target.value = '';
        index--;
        event.preventDefault();
    } else if (event.key === 'ArrowRight' && direccion === 'H') {
        index++;
        event.preventDefault();
    } else if (event.key === 'ArrowLeft' && direccion === 'H') {
        index--;
        event.preventDefault();
    } else if (event.key === 'ArrowDown' && direccion === 'V') {
        index++;
        event.preventDefault();
    } else if (event.key === 'ArrowUp' && direccion === 'V') {
        index--;
        event.preventDefault();
    }

    if (index >= 0 && index < palabra.length) {
        let f = direccion === 'H' ? fila : fila + index;
        let c = direccion === 'H' ? columna + index : columna;
        let nextInput = document.querySelector(`.celda input[data-fila="${f}"][data-columna="${c}"]`);
        if (nextInput) {
            nextInput.focus();
        }
    }
}

function mostrarPistas() {
    let pistasDiv = document.getElementById('pistas');
    pistasDiv.innerHTML = '<h2>Pistas</h2>';

    let horizontales = palabrasColocadas.filter(p => p.direccion === 'H');
    let verticales = palabrasColocadas.filter(p => p.direccion === 'V');

    horizontales.sort((a, b) => a.numero - b.numero);
    verticales.sort((a, b) => a.numero - b.numero);

    let listaHorizontal = document.createElement('div');
    listaHorizontal.innerHTML = '<h3>Horizontales</h3>';
    for (let palabra of horizontales) {
        let pistaDiv = document.createElement('div');
        pistaDiv.classList.add('pista');
        pistaDiv.innerHTML = `<strong>${palabra.numero}</strong>: ${palabra.pista}`;
        listaHorizontal.appendChild(pistaDiv);
    }

    let listaVertical = document.createElement('div');
    listaVertical.innerHTML = '<h3>Verticales</h3>';
    for (let palabra of verticales) {
        let pistaDiv = document.createElement('div');
        pistaDiv.classList.add('pista');
        pistaDiv.innerHTML = `<strong>${palabra.numero}</strong>: ${palabra.pista}`;
        listaVertical.appendChild(pistaDiv);
    }

    pistasDiv.appendChild(listaHorizontal);
    pistasDiv.appendChild(listaVertical);
}

function verificarRespuestas() {
    let correctas = 0;
    let total = palabrasColocadas.length;

    for (let palabra of palabrasColocadas) {
        let { fila, columna, direccion, palabra: texto } = palabra;
        let esCorrecta = true;

        for (let i = 0; i < texto.length; i++) {
            let f = direccion === 'H' ? fila : fila + i;
            let c = direccion === 'H' ? columna + i : columna;
            let input = document.querySelector(`.celda input[data-fila="${f}"][data-columna="${c}"]`);
            if (input.value.toUpperCase() !== matriz[f][c]) {
                esCorrecta = false;
                
                input.parentElement.classList.remove('celdaPalabraCorrecta');
            }
        }

        if (esCorrecta) {
            correctas++;
            
            for (let i = 0; i < texto.length; i++) {
                let f = direccion === 'H' ? fila : fila + i;
                let c = direccion === 'H' ? columna + i : columna;
                let celda = document.querySelector(`.celda input[data-fila="${f}"][data-columna="${c}"]`).parentElement;
                celda.classList.add('celdaPalabraCorrecta');
                celda.classList.remove('celdaIncorrecta');
            }
        } else {
            for (let i = 0; i < texto.length; i++) {
                let f = direccion === 'H' ? fila : fila + i;
                let c = direccion === 'H' ? columna + i : columna;
                let celda = document.querySelector(`.celda input[data-fila="${f}"][data-columna="${c}"]`).parentElement;
                celda.classList.remove('celdaPalabraCorrecta');
  
            }
        }
    }

    let mensajeError = document.getElementById('mensajeError');
    let mensajeExito = document.getElementById('mensajeExito');
    if (correctas === total) {
        mensajeError.innerText = '';
        mensajeExito.innerText = '¡Felicidades! Has completado el crucigrama correctamente.';
    } else {
        mensajeExito.innerText = '';
        mensajeError.innerText = 'Algunas palabras son incorrectas o están incompletas.';
    }
}


function mostrarAreaContraseña() {
    document.getElementById('areaContraseña').style.display = 'block';
}


function verificarContraseña() {
    let contraseña = document.getElementById('inputContraseña').value;
    let errorContraseña = document.getElementById('errorContraseña');
    if (contraseña === '3269') { // Cambia '3269' por la contraseña deseada
        let inputs = document.querySelectorAll('.celda input');
        for (let input of inputs) {
            let fila = parseInt(input.getAttribute('data-fila'));
            let columna = parseInt(input.getAttribute('data-columna'));
            let letra = matriz[fila][columna];
            input.value = letra;
            input.parentElement.classList.remove('celdaIncorrecta');
            input.parentElement.classList.add('celdaCorrecta');
        }
        errorContraseña.innerText = '';
        document.getElementById('areaContraseña').style.display = 'none';
    } else {
        errorContraseña.innerText = 'Contraseña incorrecta.';
    }
}


function reiniciarJuego() {
    palabraSeleccionada = null;
    document.getElementById('juego').style.display = 'none';
    document.getElementById('inicio').style.display = 'block';
    document.getElementById('mensajeError').innerText = '';
    document.getElementById('mensajeExito').innerText = '';
    document.getElementById('areaContraseña').style.display = 'none';
    document.getElementById('inputContraseña').value = '';

   
    let celdas = document.querySelectorAll('.celda');
    celdas.forEach(celda => {
        celda.classList.remove('celdaPalabraCorrecta');
        celda.classList.remove('celdaPalabraIncorrecta');
        celda.classList.remove('celdaCorrecta');
        celda.classList.remove('celdaIncorrecta');
    });

   
    let inputs = document.querySelectorAll('.celda input');
    inputs.forEach(input => input.value = '');
}


function imprimirCrucigrama() {
    window.print();
}

function descargarComoPDF() {
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
    });

    const crucigramaElement = document.getElementById('crucigrama');
    const pistasElement = document.getElementById('pistas');

    html2canvas(crucigramaElement, { scale: 2 }).then(canvasCrucigrama => {
        const imgCrucigrama = canvasCrucigrama.toDataURL('image/png');
        const imgWidth = 595.28 - 40; // Ancho de A4 en pt menos márgenes
        const imgHeight = (canvasCrucigrama.height * imgWidth) / canvasCrucigrama.width;
        doc.addImage(imgCrucigrama, 'PNG', 20, 20, imgWidth, imgHeight); 
        doc.addPage();
        html2canvas(pistasElement, { scale: 2 }).then(canvasPistas => {
            const imgPistas = canvasPistas.toDataURL('image/png');
            const imgHeightPistas = (canvasPistas.height * imgWidth) / canvasPistas.width;
            doc.addImage(imgPistas, 'PNG', 20, 20, imgWidth, imgHeightPistas); 
            doc.save('crucigrama.pdf');
        });
    });
}

function obtenerPalabraEnPosicion(fila, columna) {
    for (let palabra of palabrasColocadas) {
        let { direccion, palabra: texto, fila: f, columna: c } = palabra;
        for (let i = 0; i < texto.length; i++) {
            let fi = direccion === 'H' ? f : f + i;
            let ci = direccion === 'H' ? c + i : c;
            if (fi === fila && ci === columna) {
                return palabra;
            }
        }
    }
    return null;
}


function mezclarArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = getRandomInt(0, i);
        [array[i], array[j]] = [array[j], array[i]];
    }
}


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
