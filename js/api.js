// prueba api 1 

const Container1 = document.getElementById('api1');

fetch('https://api.argentinadatos.com/v1/cotizaciones/dolares')
    .then(response => response.json())
    .then(data => {
        data.forEach(cotizacion => {
            const fecha = new Date(cotizacion.fecha);
            if (fecha.getFullYear() === 2024 && fecha.getMonth() === 6) {
                const cotizacionDiv = document.createElement("div");
                cotizacionDiv.innerHTML = `<h3>Casa: ${cotizacion.casa}</h3>
                                       <p>Compra: ${cotizacion.compra} ARS</p>
                                       <p>Venta: ${cotizacion.venta} ARS</p>
                                       <p>Fecha: ${cotizacion.fecha}</p>`;
                Container1.appendChild(cotizacionDiv);
            }
        });
    })
    .catch(error => {
        console.error('Error al recuperar los datos:', error);
    });

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
            container2.appendChild(card);
        });
    })
    .catch(error => {
        console.error('Error al recuperar los datos:', error);
    });
