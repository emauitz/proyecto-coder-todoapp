// Constantes y variables
const fecha = document.querySelector('#fecha');
const lista = document.querySelector('#lista');
const input = document.querySelector('#input');
const fechaLimiteInput = document.getElementById("date");
const horaLimiteInput = document.getElementById("time");
const tipoTareaInput = document.getElementById("desplegable");
const botonEnter = document.querySelector('#boton-enter');
const aviso = document.querySelector('#aviso');
const check = 'fa-check-circle';
const uncheck = 'fa-circle';
const lineThrough = 'line-through';
let id;
let LIST = [];
var DateTime = luxon.DateTime;
const ahora = DateTime.now();

// Saludo se alimenta del nombre de usuario en el login y de la hora del día en que se ingrese
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
        // Probar si SweetAlert se está ejecutando
        console.log('Mostrando SweetAlert');
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No escribiste tu nombre de usuario!",
        })
    }
};

//funcion para mostrar toastify
function mostrarToastify(mensaje, tipo = "info") {
    Toastify({
        text: mensaje,
        duration: 2000,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        backgroundColor: tipo === "error" ? "linear-gradient(to right, #ff5f6d, #ffc371)" : "linear-gradient(to right, #00b09b, #96c93d)",
    }).showToast();
}

// Función para contar tareas pendientes
function contarTareasPendientes() {
    return LIST.filter(tarea => !tarea.realizado && !tarea.eliminado).length;
}

// Función para contar tareas que vencen en 10 días
function contarTareasVencenEnDiezDias() {
    const ahora = DateTime.now();
    const diezDiasDespues = ahora.plus({ days: 10 });
    return LIST.filter(tarea => {
        const fechaLimite = DateTime.fromISO(tarea.fechaLimite);
        return fechaLimite <= diezDiasDespues && !tarea.realizado && !tarea.eliminado;
    }).length;
}

// Evento de login
loginButton.onclick = function() {
    const username = document.getElementById("username").value;

    if (username) {
        modal.style.display = "none";
        document.body.classList.remove("modal-open"); // Habilitar la interacción con el resto de la página
        actualizarSaludo(username);

        // Mostrar Toastify con la cantidad de tareas pendientes
        const tareasPendientes = contarTareasPendientes();
        mostrarToastify(`Tienes ${tareasPendientes} tareas pendientes.`);

        // Mostrar Toastify con la cantidad de tareas que vencen en 10 días
        const tareasVencenEnDiezDias = contarTareasVencenEnDiezDias();
        mostrarToastify(`Tienes ${tareasVencenEnDiezDias} tareas que vencen en los próximos 10 días.`);
    } else {
        mostrarToastify(`No hay tareas proximas a vencer`);
    }
};


// Creación de fecha
const FECHA = new Date();
fecha.innerHTML = FECHA.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

// Función agregar tarea
function agregarTarea(tarea, id, fechaLimite, horaLimite, tipoTarea, realizado, eliminado) {
    if (eliminado) { return; }
    const REALIZADO = realizado ? check : uncheck;
    const LINE = realizado ? lineThrough : '';
    const elemento = `
        <li class="elemento" id="elemento_${id}">
        <div class="tarea">
            <i class="far ${REALIZADO} co" data="realizado" id="${id}"></i>
            <p class="text ${LINE}">${tarea}</p>
            <p class="fecha-limite">${fechaLimite}</p>
            <p class="hora-limite">${horaLimite}</p>
            <p class="tipo-tarea">${tipoTarea.charAt(0).toUpperCase() + tipoTarea.slice(1)}</p>
            <i class="fas fa-trash de" data="eliminado" id="${id}"></i>
        </div>
        
        <div class="contenido-expandido">
            <div class="botones_subtareas">
                <button class="agregar-subtarea">+</button>
                <button class="eliminar-subtarea">-</button>
            </div>
        </div>
        <div class="barra-progreso-container">
            <div class="barra-progreso">
                <div class="progreso"></div>
                <div class="porcentaje">0%</div>
            </div>   
        </div>
    </li>
    `;
    lista.insertAdjacentHTML("beforeend", elemento);

    // Asignar eventos a los botones de subtareas
    asignarEventosSubtareas(document.querySelector(`#elemento_${id}`));
    mostrarToastify("Tarea agregada exitosamente.");
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
        const elementoPadre = element.parentNode.parentNode;
        elementoPadre.parentNode.removeChild(elementoPadre); // Eliminar el elemento LI
        LIST[element.id].eliminado = true;
        localStorage.setItem('TODO', JSON.stringify(LIST));
    } else {
        Swal.fire({
            title: "Estas seguro?",
            text: "La tarea que intentas eliminar no fue completada!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "SI, eliminar!"
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Eliminada!",
                    text: "Tu tarea fue eliminada.",
                    icon: "success"
                });
            const elementoPadre = element.parentNode.parentNode;
            elementoPadre.parentNode.removeChild(elementoPadre); // Eliminar el elemento LI
            LIST[element.id].eliminado = true;
            localStorage.setItem('TODO', JSON.stringify(LIST));
            }
        });
    }
}

// Escucha el botón del mouse para agregar una nueva tarea
botonEnter.addEventListener('click', () => {
    const tarea = input.value;
    const fechaLimite = fechaLimiteInput.value;
    const horaLimite = horaLimiteInput.value;
    const tipoTarea = tipoTareaInput.value;
    if (tarea && fechaLimite && horaLimite && tipoTarea) {
        console.log('Agregando tarea...');
        agregarTarea(tarea, id, fechaLimite, horaLimite, tipoTarea, false, false);
        LIST.push({
            nombre: tarea,
            id: id,
            fechaLimite: fechaLimite,
            horaLimite: horaLimite,
            tipoTarea: tipoTarea,
            realizado: false,
            eliminado: false
        });
        localStorage.setItem('TODO', JSON.stringify(LIST));
        input.value = '';
        fechaLimiteInput.value = '';
        horaLimiteInput.value = '';
        tipoTareaInput.value = '';
        id++;
    } else {
        mostrarToastify('Por favor, completa todos los campos.')
    }
});

// Escucha el Enter para agregar una nueva tarea
document.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        const tarea = input.value;
        const fechaLimite = fechaLimiteInput.value;
        const horaLimite = horaLimiteInput.value;
        const tipoTarea = tipoTareaInput.value;

        if (tarea && fechaLimite && horaLimite && tipoTarea) {
            agregarTarea(tarea, id, fechaLimite, horaLimite, tipoTarea, false, false);
            LIST.push({
                nombre: tarea,
                id: id,
                fechaLimite: fechaLimite,
                horaLimite: horaLimite,
                tipoTarea: tipoTarea,
                realizado: false,
                eliminado: false
            });
            localStorage.setItem('TODO', JSON.stringify(LIST));
            input.value = '';
            fechaLimiteInput.value = '';
            horaLimiteInput.value = '';
            tipoTareaInput.value = '';
            id++;
        } else {
            mostrarToastify('Por favor, completa todos los campos.')
        }
    }
});

// Eventos botones de tarea eliminada y check
lista.addEventListener('click', function(event) {
    const element = event.target;
    const elementData = element.getAttribute('data');
    if (elementData === 'realizado') {
        tareaRealizada(element);
        mostrarToastify('Tarea completada');
    } else if (elementData === 'eliminado') {
        tareaEliminada(element);
        mostrarToastify('Tarea eliminada');
    }
});

//----SUBTAREAS----
// Función para actualizar la barra de progreso de las subtareas
function actualizarBarraProgreso(li) {
    const checkboxes = li.querySelectorAll('.subtarea input[type="checkbox"]');
    const completados = li.querySelectorAll('.subtarea input[type="checkbox"]:checked');
    const progreso = li.querySelector('.progreso');
    const porcentajeElem = li.querySelector('.porcentaje');
    const porcentaje = checkboxes.length ? (completados.length / checkboxes.length) * 100 : 0;
    progreso.style.width = `${porcentaje}%`;
    porcentajeElem.textContent = `${Math.round(porcentaje)}%`;
    mostrarToastify('ha habido cambios en la tarea');
}

// Asignar eventos de subtareas a un elemento específico
function asignarEventosSubtareas(li) {
    const agregarSubtareaBtn = li.querySelector('.agregar-subtarea');
    const eliminarSubtareaBtn = li.querySelector('.eliminar-subtarea');

    agregarSubtareaBtn.addEventListener('click', function () {
        // Crear elemento de subtarea
        const subtarea = document.createElement('div');
        subtarea.classList.add('subtarea');
        subtarea.innerHTML = `<input type="checkbox"><input type="text" class="subtarea-input">`;

        // Agregar subtarea al contenido expandido
        li.querySelector('.contenido-expandido').appendChild(subtarea);

        // Asignar evento de cambio al checkbox de la nueva subtarea
        subtarea.querySelector('input[type="checkbox"]').addEventListener('change', function () {
            actualizarBarraProgreso(li);
        });
        
        // Actualizar la barra de progreso después de agregar la subtarea
        actualizarBarraProgreso(li);
    });
    
    eliminarSubtareaBtn.addEventListener('click', function () {
        // Eliminar la última subtarea del contenido expandido
        const contenidoExpandido = li.querySelector('.contenido-expandido');
        if (contenidoExpandido.children.length > 0) {
            contenidoExpandido.lastChild.remove();
            
            // Actualizar la barra de progreso después de eliminar la subtarea
            actualizarBarraProgreso(li);
        }
    });
}


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
        agregarTarea(i.nombre, i.id, i.fechaLimite, i.horaLimite, i.tipoTarea, i.realizado, i.eliminado);
    });
}
