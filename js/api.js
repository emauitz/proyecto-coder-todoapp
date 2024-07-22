const apiKey = '815e1ba73ed9acb56f3fbd5553d80dc9';
// URL para la API
const url = `https://api.weatherstack.com/current?access_key=${apiKey}&query=New York`;

// Función async para obtener los datos
async function obtenerClima() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();  // Transformar la respuesta a JSON
        console.log(data);  // Muestra los datos en consola para verificar
        mostrarClima(data);  // Llama a la función para mostrar los datos
    } catch (error) {
        console.error('Error:', error);
    }
}

// Llama a la función para ejecutar la solicitud
obtenerClima();

// Función para mostrar los datos en el HTML
function mostrarClima(data) {
    // Verifica que los datos contengan la propiedad 'current'
    if (data && data.current) {
        const card = document.createElement("div");
        card.className = "weather-card";
        card.innerHTML = `<h3>Consulta: ${data.request.query}</h3>
                          <h3>Temperatura: ${data.current.temperature} °C</h3>
                          <h3>Condición: ${data.current.weather_descriptions[0]}</h3>
                          <img src="${data.current.weather_icons[0]}" alt="Weather icon">
                        `;
        // Añadir el div al contenedor
        document.getElementById("api1").appendChild(card);
    } else {
        console.error('No se ha obtenido datos del clima');
    }
}
// NO FUNCIONA HAY Q VERIFICAR LA DOCUMENTACION 


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
