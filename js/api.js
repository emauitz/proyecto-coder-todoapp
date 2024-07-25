// prueba api 1 DOLARES



//----------------------------------------------------------------
// API 2 FERIADOS

let container2 = document.getElementById("api2");

// Reemplaza 'año' con el año que quieres consultar, por ejemplo, 2024
const year = 2024;

fetch(`https://api.argentinadatos.com/v1/feriados/${year}`)
    .then(response => response.json())
    .then(data => {
        data.forEach(feriado => {
            const card = document.createElement("div");
            card.innerHTML = `<h3>Fecha: ${feriado.fecha}</h3>
                              <h3>Tipo: ${feriado.tipo}</h3>
                              <h3>Nombre: ${feriado.nombre}</h3>`;
            container2.appendChild(card); // Mueve esta línea dentro del bucle para agregar cada card
        });
    })
    .catch(error => {
        console.error('Error al recuperar los datos:', error);
    });
