// --- CONFIGURACIÓN Y ESTADO ---
const SUPABASE_URL = "https://qpuvmkpgdcsahewfuqre.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdXZta3BnZGNzYWhld2Z1cXJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjY0NzYsImV4cCI6MjA5MzQwMjQ3Nn0.U0SQh1xIWh9IV6Bk3jVFr3V-AraEZG8rg40niwi-3cY";

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let chart;
let secuencia = []; // Variable global para la lista

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
    cargarDatos();
    setInterval(cargarDatos, 5000);
});

// --- FUNCIONES DE COMANDO MQTT ---
async function enviarComando() {
    const input = document.getElementById("inputComando");
    const mensaje = input.value;
    if (!mensaje) return alert("Escribe un comando primero");

    try {
        const response = await fetch("/enviar-comando", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensaje })
        });
        if (response.ok) {
            alert("✅ Comando enviado");
            input.value = "";
        }
    } catch (error) {
        alert("Error de conexión");
    }
}

// --- LÓGICA DE SECUENCIA (CORREGIDA) ---
function agregarAlista() {
    const accion = document.getElementById("selectAccion").value;
    const valor = document.getElementById("inputValor").value;
    
    if (!valor) return alert("Por favor, ingresa un valor");

    // Agregar al array
    secuencia.push({ cmd: accion, val: parseInt(valor) });
    
    // Actualizar interfaz
    actualizarVista();
    
    // Limpiar input
    document.getElementById("inputValor").value = "";
}

function eliminarPaso(index) {
    secuencia.splice(index, 1);
    actualizarVista();
}

function actualizarVista() {
    const lista = document.getElementById("listaSecuencia");
    lista.innerHTML = "";
    
    secuencia.forEach((paso, index) => {
        const li = document.createElement("li");
        // Alineación estricta y elementos pequeños
        li.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:5px; background:white; margin-bottom:4px; border-bottom:1px solid #eee; font-size:14px;";
        
        li.innerHTML = `
            <span>${paso.cmd}: <b>${paso.val}</b></span> 
            <button onclick="eliminarPaso(${index})" 
                    style="color:red; background:#ffebeb; border:1px solid #ffcccc; padding:2px 8px; cursor:pointer; font-size:11px;">
                x
            </button>`;
        lista.appendChild(li);
    });
}

async function guardarYEnviar() {
    if (secuencia.length === 0) return alert("La secuencia está vacía");

    try {
        const response = await fetch("/enviar-comando", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensaje: JSON.stringify({ ruta: secuencia }) })
        });

        if (response.ok) {
            alert("✅ Secuencia enviada");
            secuencia = [];
            actualizarVista();
        }
    } catch (error) {
        alert("Error al enviar secuencia");
    }
}

// --- OTRAS FUNCIONES (CARGAR DATOS, GRÁFICA, LOGOUT) ---
// (MANTÉN TUS FUNCIONES EXISTENTES DE cargarDatos, dibujarGrafica y logout AQUÍ ABAJO)
