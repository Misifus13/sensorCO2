// =======================
// CONFIG SUPABASE
// =======================
const SUPABASE_URL = "https://qpuvmkpgdcsahewfuqre.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdXZta3BnZGNzYWhld2Z1cXJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjY0NzYsImV4cCI6MjA5MzQwMjQ3Nn0.U0SQh1xIWh9IV6Bk3jVFr3V-AraEZG8rg40niwi-3cY";



const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =======================
// VARIABLES
// =======================
let chart;
let secuencia = [];
let ultimoEnvio = [];

// =======================
// INICIO
// =======================
document.addEventListener("DOMContentLoaded", () => {
    cargarDatos();
    setInterval(cargarDatos, 5000);
});

// =======================
// MQTT: INICIO / STOP
// =======================
function enviarEstado(estado) {
    fetch("/enviar-comando", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: estado })
    })
    .then(res => {
        if (!res.ok) {
            alert("Error al enviar comando");
        }
        // Eliminamos la línea que actualizaba #historialEnvios aquí
        // para que no afecte a la lista de la secuencia de movimiento
    })
    .catch(err => {
        console.error(err);
        alert("Error de conexión");
    });
}

// =======================
// SECUENCIA
// =======================
function agregarAlista() {

    const accion = document.getElementById("selectAccion").value;
    const valor = document.getElementById("inputValor").value;

    if (!valor) return alert("Ingresa un valor");

    secuencia.push({ cmd: accion, val: parseInt(valor) });

    actualizarVista();

    document.getElementById("inputValor").value = "";
}

function eliminarPaso(i) {
    secuencia.splice(i, 1);
    actualizarVista();
}

function actualizarVista() {

    const lista = document.getElementById("listaSecuencia");
    lista.innerHTML = "";

    secuencia.forEach((p, i) => {

        const li = document.createElement("li");
        li.style.cssText = "display:flex;justify-content:space-between;padding:5px";

        li.innerHTML = `
            <span>${p.cmd}: <b>${p.val}</b></span>
            <<button class="btn-delete" onclick="eliminarPaso(${i})">x</button>
        `;

        lista.appendChild(li);
    });
}

function guardarYEnviar() {
    if (secuencia.length === 0) return alert("Lista vacía");

    // Guardamos la referencia para el historial
    const secuenciaActual = [...secuencia];

    fetch("/enviar-comando", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: JSON.stringify({ ruta: secuencia }) })
    })
    .then(res => {
        if (res.ok) {
            // Actualizamos el historial SOLO con la secuencia de movimientos
            document.getElementById("historialEnvios").innerHTML = 
                secuenciaActual.map(p => `${p.cmd}(${p.val})`).join(" → ");

            // Limpiamos la lista visual y el array
            secuencia = [];
            actualizarVista();
        } else {
            alert("Error al enviar la secuencia");
        }
    });
}

// =======================
// SUPABASE
// =======================
async function cargarDatos() {

    try {

        const idSensor = localStorage.getItem("id_sensor135");

        const { data } = await _supabase
            .from("datos_co2")
            .select("*")
            .eq("id_sensor135", idSensor)
            .order("fecha_hora", { ascending: false })
            .limit(50);

        if (!data || data.length === 0) return;

        const datos = [...data].reverse();
        const ultimo = datos[datos.length - 1];

        document.getElementById("currentCO2").innerText =
            Math.round(ultimo.lectura) + " ppm";

        document.getElementById("sensorID").innerText =
            ultimo.id_sensor135;

        document.getElementById("ultimaLectura").innerText =
            new Date(ultimo.fecha_hora).toLocaleString();

        actualizarEstado(ultimo.lectura);
        dibujarGrafica(datos);

    } catch (err) {
        console.error(err);
    }
}

// =======================
// ESTADO AIRE
// =======================
function actualizarEstado(ppm) {

    const estado = document.getElementById("estadoAire");

    if (ppm < 800) {
        estado.innerText = "🟢 Aire Bueno";
        estado.style.color = "#16a34a";

    } else if (ppm < 1200) {
        estado.innerText = "🟡 Aire Moderado";
        estado.style.color = "#ca8a04";

    } else {
        estado.innerText = "🔴 Aire Deficiente";
        estado.style.color = "#dc2626";
    }
}

// =======================
// GRAFICA
// =======================
function dibujarGrafica(datos) {

    const labels = datos.map(d =>
        new Date(d.fecha_hora).toLocaleTimeString()
    );

    const ppm = datos.map(d => d.lectura);

    const ctx = document.getElementById("grafica").getContext("2d");

    if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = ppm;
        chart.update();
        return;
    }

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "CO₂ (ppm)",
                data: ppm,
                borderColor: "#16a34a",
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// =======================
// LOGOUT
// =======================
function logout() {
    localStorage.clear();
    window.location = "index.html";
}
