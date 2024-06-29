//Se incluye un login sencillo y queda pendiente la Gestion de usuarios 

// Constantes y variables
const fecha = document.querySelector('#fecha');
const lista = document.querySelector('#lista');
const input = document.querySelector('#input');
const fechaLimiteInput = document.getElementById("date");
const tipoTareaInput = document.getElementById("desplegable");
const botonEnter = document.querySelector('#boton-enter');
const aviso = document.querySelector('#aviso');
const check = 'fa-check-circle';
const uncheck = 'fa-circle';
const lineThrough = 'line-through';
let id;
let LIST = [];

//saludo se alimenta del nombre de usuario en el login y de la hora del dia en que se ingrese
function actualizarSaludo(nombre) {
    const saludoElement = document.getElementById("saludo");
    const ahora = new Date();
    const hora = ahora.getHours();
    let saludo;

    if (hora >= 6 && hora < 12) {
        saludo = "buenos días";
    } else if (hora >= 12 && hora < 18) {
        saludo = "buenas tardes";
    } else {
        saludo = "buenas noches";
    }

    saludoElement.textContent = `Hola ${nombre} ${saludo}`;
}

const modal = document.getElementById("loginModal");
const loginButton = document.getElementById("loginButton");

// Deshabilitar la interacción con el resto de la página
document.body.classList.add("modal-open");

loginButton.onclick = function() {
    const username = document.getElementById("username").value;
    if (username) {
        modal.style.display = "none";
        document.body.classList.remove("modal-open"); // Habilitar la interacción con el resto de la página
        actualizarSaludo(username);
    } else {
        alert("Por favor, ingrese su nombre de usuario.");
    }
};

// Creación de fecha
const FECHA = new Date();
fecha.innerHTML = FECHA.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

// Función agregar tarea
function agregarTarea(tarea, id, fechaLimite, tipoTarea, realizado, eliminado) {
    if (eliminado) { return; }
    const REALIZADO = realizado ? check : uncheck;
    const LINE = realizado ? lineThrough : '';
    const elemento = `
        <li class="elemento" id="elemento_${id}">
            <i class="far ${REALIZADO} co" data="realizado" id="${id}"></i>
            <p class="text ${LINE}">${tarea}</p>
            <p class="fecha-limite">${fechaLimite}</p>
            <p class="tipo-tarea">${tipoTarea.charAt(0).toUpperCase() + tipoTarea.slice(1)}</p>
            <i class="fas fa-trash de" data="eliminado" id="${id}"></i>
        </li>
    `;
    lista.insertAdjacentHTML("beforeend", elemento);
}

// Función tarea realizada
function tareaRealizada(element) {
    element.classList.toggle(check);
    element.classList.toggle(uncheck);
    element.parentNode.querySelector('.text').classList.toggle(lineThrough);
    LIST[element.id].realizado = LIST[element.id].realizado ? false : true;
    localStorage.setItem('TODO', JSON.stringify(LIST));
}

// Función tarea eliminada
function tareaEliminada(element) {
    const tareaTexto = element.parentNode.querySelector('.text');
    if (tareaTexto.classList.contains(lineThrough)) {
        element.parentNode.parentNode.removeChild(element.parentNode);
        LIST[element.id].eliminado = true;
        localStorage.setItem('TODO', JSON.stringify(LIST));
    } else {
        aviso.textContent = 'La tarea debe ser completada para poder eliminarla.';
        aviso.classList.remove('oculto');
        setTimeout(() => {
            aviso.classList.add('oculto');
        }, 3000);
    }
}

// Escucha el botón del mouse para agregar una nueva tarea
botonEnter.addEventListener('click', () => {
    const tarea = input.value;
    const fechaLimite = fechaLimiteInput.value;
    const tipoTarea = tipoTareaInput.value;

    if (tarea && fechaLimite && tipoTarea) {
        agregarTarea(tarea, id, fechaLimite, tipoTarea, false, false);
        LIST.push({
            nombre: tarea,
            id: id,
            fechaLimite: fechaLimite,
            tipoTarea: tipoTarea,
            realizado: false,
            eliminado: false
        });
        localStorage.setItem('TODO', JSON.stringify(LIST));
        input.value = '';
        fechaLimiteInput.value = '';
        tipoTareaInput.value = '';
        id++;
    } else {
        aviso.textContent = 'Por favor, completa todos los campos.';
        aviso.classList.remove('oculto');
        setTimeout(() => {
            aviso.classList.add('oculto');
        }, 3000);
    }
});

// Escucha el Enter para agregar una nueva tarea
document.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        const tarea = input.value;
        const fechaLimite = fechaLimiteInput.value;
        const tipoTarea = tipoTareaInput.value;

        if (tarea && fechaLimite && tipoTarea) {
            agregarTarea(tarea, id, fechaLimite, tipoTarea, false, false);
            LIST.push({
                nombre: tarea,
                id: id,
                fechaLimite: fechaLimite,
                tipoTarea: tipoTarea,
                realizado: false,
                eliminado: false
            });
            localStorage.setItem('TODO', JSON.stringify(LIST));
            input.value = '';
            fechaLimiteInput.value = '';
            tipoTareaInput.value = '';
            id++;
        } else {
            aviso.textContent = 'Por favor, completa todos los campos.';
            aviso.classList.remove('oculto');
            setTimeout(() => {
                aviso.classList.add('oculto');
            }, 3000);
        }
    }
});

// Eventos botones de tarea eliminada y check
lista.addEventListener('click', function(event) {
    const element = event.target;
    const elementData = element.getAttribute('data');
    if (elementData === 'realizado') {
        tareaRealizada(element);
    } else if (elementData === 'eliminado') {
        tareaEliminada(element);
    }
});

// Local storage get item
let data = localStorage.getItem('TODO');
if (data) {
    LIST = JSON.parse(data);
    id = LIST.length;
    cargarLista(LIST);
} else {
    LIST = [];
    id = 0;
}

function cargarLista(DATA) {
    DATA.forEach(function(i) {
        agregarTarea(i.nombre, i.id, i.fechaLimite, i.tipoTarea, i.realizado, i.eliminado);
    });
}


