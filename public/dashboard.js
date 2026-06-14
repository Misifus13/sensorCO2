const SUPABASE_URL = "https://qpuvmkpgdcsahewfuqre.supabase.co";
const SUPABASE_KEY = "TU_KEY";

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let chart;

// INIT
document.addEventListener("DOMContentLoaded", () => {
    cargarDatos();
    setInterval(cargarDatos, 5000);
});

// =========================
// ENVÍO MQTT SIMPLIFICADO
// =========================
async function enviarEstado(estado) {

    try {
        const response = await fetch("/enviar-comando", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensaje: estado })
        });

        if (response.ok) {
            document.getElementById("historialEnvios").innerText =
                "Último comando: " + estado;

        } else {
            alert("Error al enviar comando");
        }

    } catch (err) {
        console.error(err);
        alert("Error de conexión");
    }
}

// =========================
// SUPABASE DATA
// =========================
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

// =========================
// ESTADO AIRE
// =========================
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

// =========================
// GRÁFICA
// =========================
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

// =========================
// LOGOUT
// =========================
function logout() {
    localStorage.clear();
    window.location = "index.html";
}
