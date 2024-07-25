// Comprobar si el usuario está logueado
const usuario = JSON.parse(localStorage.getItem('login_success')) || false;
if (!usuario) {
    window.location.href = 'login.html';
}

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
let loadingFromLocalStorage = false;

// Función de logout
function configurarLogout() {
    const logout = document.getElementById("logout");
    if (logout) {
        logout.addEventListener("click", () => {
            Swal.fire({
                icon: "success",
                title: "¡Éxito!",
                text: "¡Esperamos que vuelvas pronto!",
            }).then(() => {
                localStorage.removeItem("login_success");
                console.log('Sesión cerrada. Estado de login_success:', localStorage.getItem('login_success'));
                window.location.href = 'login.html'; // Redirigir a la página de login
            });
        });
    } else {
        console.error("El elemento con el ID 'logout' no se encontró.");
    }
}

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

    saludoElement.textContent = `Hola ${nombre}, ${saludo}`;
}

// Función para manejar el inicio de sesión
function manejarInicioSesion() {
    const userData = JSON.parse(localStorage.getItem("login_success"));
    if (userData && userData.username) {
        actualizarSaludo(userData.username);
        cargarListaDeTareas();
        mostrarToastify(`Tareas pendientes: ${contarTareasPendientes()}`);
        mostrarToastify(`Tareas vencen en 10 días: ${contarTareasVencenEnDiezDias()}`);
    } else {
        window.location.href = "login.html";
    }
}
// Llamar a manejarInicioSesion al cargar la página o después de un inicio de sesión exitoso
window.onload = manejarInicioSesion;

// Función para mostrar toastify
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

// Función para cargar la lista de tareas desde localStorage
function cargarListaDeTareas() {
    const userData = JSON.parse(localStorage.getItem("login_success"));
    if (userData && userData.email) {
        const tareasGuardadas = localStorage.getItem(`tareas_${userData.email}`);
        if (tareasGuardadas) {
            LIST = JSON.parse(tareasGuardadas);
            id = LIST.length; // Actualiza el ID global
            cargarLista(LIST); // Carga las tareas en la interfaz
        } else {
            LIST = [];
            id = 0;
            console.log("No hay tareas guardadas para este usuario.");
        }
    }
}
function mostrarTareasEnLaInterfaz(tareas) {
    const listaTareasContainer = document.getElementById('lista-tareas');
    listaTareasContainer.innerHTML = ''; // Limpiar la lista existente
    tareas.forEach(tarea => {
        const tareaElemento = document.createElement('li');
        tareaElemento.textContent = tarea.nombre; // Ajusta esto según tu estructura de tarea
        listaTareasContainer.appendChild(tareaElemento);
    });
}

// Creación de fecha
const FECHA = new Date();
fecha.innerHTML = FECHA.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

// No permite agendar tareas con fecha anterior a la actual
function configurarFechaMinima() {
    const hoy = DateTime.local().toISODate();
    document.getElementById("date").min = hoy;
}
configurarFechaMinima();

// Función para agregar una tarea a la lista y guardarla en localStorage
function agregarTarea(tarea, id, fechaLimite, horaLimite, tipoTarea, realizado, eliminado) {
    if (eliminado) { return; }
    const REALIZADO = realizado ? check : uncheck;
    const LINE = realizado ? lineThrough : '';
    const elemento = `
        <li class="elemento animate__animated animate__slideInDown" id="elemento_${id}">
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

    // Guardar tarea en localStorage para el usuario actual
    const userData = JSON.parse(localStorage.getItem("login_success"));
    if (userData && userData.email) {
        const tareasGuardadas = localStorage.getItem(`tareas_${userData.email}`);
        const listaDeTareas = tareasGuardadas ? JSON.parse(tareasGuardadas) : [];
        const tareaIndex = listaDeTareas.findIndex(t => t.id === id);

        if (tareaIndex === -1) {
            listaDeTareas.push({
                nombre: tarea,
                id: id,
                fechaLimite: fechaLimite,
                horaLimite: horaLimite,
                tipoTarea: tipoTarea,
                realizado: realizado,
                eliminado: eliminado
            });
        } else {
            listaDeTareas[tareaIndex] = {
                nombre: tarea,
                id: id,
                fechaLimite: fechaLimite,
                horaLimite: horaLimite,
                tipoTarea: tipoTarea,
                realizado: realizado,
                eliminado: eliminado
            };
        }

        try {
            localStorage.setItem(`tareas_${userData.email}`, JSON.stringify(listaDeTareas));
        } catch (error) {
            console.error("Error al guardar en localStorage:", error);
        }
    }
}

// Función tarea realizada
function tareaRealizada(element) {
    element.classList.toggle(check);
    element.classList.toggle(uncheck);
    element.parentNode.querySelector('.text').classList.toggle(lineThrough);
    LIST[element.id].realizado = LIST[element.id].realizado ? false : true;
    
}

// Función tarea eliminada
function tareaEliminada(element) {
    const tareaTexto = element.parentNode.querySelector('.text');
    if (tareaTexto.classList.contains(lineThrough)) {
        const elementoPadre = element.parentNode.parentNode;
        elementoPadre.remove();
        LIST[element.id].eliminado = true;

        // Actualizar en localStorage
        const userData = JSON.parse(localStorage.getItem("login_success"));
        if (userData && userData.id) {
            const tareasGuardadas = localStorage.getItem(`tareas_${userData.email}`);
            if (tareasGuardadas) {
                const listaDeTareas = JSON.parse(tareasGuardadas);
                const tareaIndex = listaDeTareas.findIndex(t => t.id === element.id);
                if (tareaIndex !== -1) {
                    listaDeTareas[tareaIndex].eliminado = true;
                    localStorage.setItem(`tareas_${userData.email}`, JSON.stringify(listaDeTareas));
                }
            }
        }
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
                elementoPadre.remove();
                LIST[element.id].eliminado = true;

                // Actualizar en localStorage
                const userData = JSON.parse(localStorage.getItem("login_success"));
                if (userData && userData.id) {
                    const tareasGuardadas = localStorage.getItem(`tareas_${userData.id}`);
                    if (tareasGuardadas) {
                        const listaDeTareas = JSON.parse(tareasGuardadas);
                        const tareaIndex = listaDeTareas.findIndex(t => t.id === element.id);
                        if (tareaIndex !== -1) {
                            listaDeTareas[tareaIndex].eliminado = true;
                            localStorage.setItem(`tareas_${userData.email}`, JSON.stringify(listaDeTareas));
                        }
                    }
                }
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
document.addEventListener('keyup', function (event) {
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
lista.addEventListener('click', function (event) {
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

    // Obtener el porcentaje anterior
    const porcentajeAnterior = parseFloat(porcentajeElem.textContent);

    // Calcular el nuevo porcentaje
    const porcentaje = checkboxes.length ? (completados.length / checkboxes.length) * 100 : 0;

    // Actualizar la barra de progreso y el elemento de porcentaje
    progreso.style.width = `${porcentaje}%`;
    porcentajeElem.textContent = `${Math.round(porcentaje)}%`;

    // Mostrar Toastify si el porcentaje cambia
    if (porcentajeAnterior !== Math.round(porcentaje)) {
        mostrarToastify("Hubo cambios en las subtareas.");
    }
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
        mostrarToastify('se ha sumado una subtarea');
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
            mostrarToastify('se ha eliminado una subtarea');
            // Actualizar la barra de progreso después de eliminar la subtarea
            actualizarBarraProgreso(li);
        }
    });
}

// Llamar a cargarLista con la lista de tareas del localStorage
let data = localStorage.getItem('tareas_${userData.email}');
if (data) {
    LIST = JSON.parse(data);
    id = LIST.length;
    cargarLista(LIST);
} else {
    LIST = [];
    id = 0;
}

// Función para cargar la lista de tareas en la interfaz
function cargarLista(lista) {
    loadingFromLocalStorage = true;
    try {
        // Filtrar las tareas eliminadas
        const tareasActivas = lista.filter(tarea => !tarea.eliminado);

        tareasActivas.forEach(function (i) {
            // Agregar tarea al DOM
            agregarTarea(i.nombre, i.id, i.fechaLimite, i.horaLimite, i.tipoTarea, i.realizado, i.eliminado);

            // Obtener el elemento de la tarea recién añadida
            const tareaElemento = document.getElementById(`elemento_${i.id}`);
            if (tareaElemento) {
                // Asignar eventos a los botones de subtareas
                asignarEventosSubtareas(tareaElemento);
            }
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar las tareas',
            text: 'Hubo un problema al cargar las tareas. Por favor, vuelve a iniciar sesión.',
            showConfirmButton: true,
            allowOutsideClick: false,
            willClose: () => {
                configurarLogout(); 
            }
        });
    } finally {
        loadingFromLocalStorage = false;
    }
}


// Inicializar las configuraciones
configurarLogout();
cargarLista(LIST);