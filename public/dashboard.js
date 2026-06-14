const SUPABASE_URL =
"https://qpuvmkpgdcsahewfuqre.supabase.co";

const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdXZta3BnZGNzYWhld2Z1cXJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjY0NzYsImV4cCI6MjA5MzQwMjQ3Nn0.U0SQh1xIWh9IV6Bk3jVFr3V-AraEZG8rg40niwi-3cY";

const _supabase =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let chart;

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarDatos();

        setInterval(
            cargarDatos,
            5000
        );
    }
);

async function cargarDatos() {

    try {

        const idSensor =
            localStorage.getItem(
                "id_sensor135"
            );

        const { data, error } =
            await _supabase
                .from("datos_co2")
                .select("*")
                .eq(
                    "id_sensor135",
                    idSensor
                )
                .order(
                    "fecha_hora",
                    {
                        ascending:false
                    }
                )
                .limit(50);

        if (error) throw error;

        if (!data.length) return;

        const datos =
            [...data].reverse();

        const ultimo =
            datos[
                datos.length - 1
            ];

        document.getElementById(
            "currentCO2"
        ).innerText =
            ultimo.lectura.toFixed(0)
            + " ppm";

        document.getElementById(
            "sensorID"
        ).innerText =
            ultimo.id_sensor135;

        document.getElementById(
            "ultimaLectura"
        ).innerText =
            new Date(
                ultimo.fecha_hora
            ).toLocaleString();

        actualizarEstado(
            ultimo.lectura
        );

        dibujarGrafica(
            datos
        );

    }
    catch(err){

        console.error(err);
    }
}

function actualizarEstado(ppm){

    const estado =
        document.getElementById(
            "estadoAire"
        );

    if(ppm < 800){

        estado.innerText =
            "🟢 Aire Bueno";

        estado.style.color =
            "#16a34a";
    }

    else if(ppm < 1200){

        estado.innerText =
            "🟡 Aire Moderado";

        estado.style.color =
            "#ca8a04";
    }

    else{

        estado.innerText =
            "🔴 Aire Deficiente";

        estado.style.color =
            "#dc2626";
    }
}

function dibujarGrafica(datos){

    const labels =
        datos.map(d =>
            new Date(
                d.fecha_hora
            ).toLocaleTimeString()
        );

    const ppm =
        datos.map(
            d => d.lectura
        );

    const ctx =
        document
        .getElementById(
            "grafica"
        )
        .getContext("2d");

    if(chart){

        chart.data.labels =
            labels;

        chart.data.datasets[0].data =
            ppm;

        chart.update();

        return;
    }

    chart = new Chart(ctx, {

        type:"line",

        data:{

            labels,

            datasets:[{

                label:
                "CO₂ (ppm)",

                data:ppm,

                borderColor:
                "#16a34a",

                fill:false,

                tension:0.3
            }]
        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            animation:false
        }
    });
}

function logout(){

    localStorage.clear();

    window.location =
        "index.html";
}

async function enviarComando() {
    const input = document.getElementById("inputComando");
    const mensaje = input.value;

    if (!mensaje) {
        alert("Escribe un mensaje primero");
        return;
    }

    try {
        // Ajusta la URL si no estás en localhost:3000
        const response = await fetch("/enviar-comando", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensaje })
        });

        if (response.ok) {
            alert("✅ Mensaje enviado exitosamente");
            input.value = "";
        } else {
            alert("❌ Error al enviar el mensaje");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión con el servidor");
    }
}





let listaRuta = [];

function agregarComandoUI() {
    const accion = prompt("Escribe: AVANZA, RETROCEDE o GIRA");
    if (!accion) return;
    
    const valor = prompt("Escribe el valor (distancia o grados):");
    if (!valor) return;

    const comando = { cmd: accion.toUpperCase(), val: parseInt(valor) };
    listaRuta.push(comando);

    // Actualizar vista
    const li = document.createElement("li");
    li.style.padding = "5px";
    li.style.borderBottom = "1px solid #eee";
    li.textContent = `${comando.cmd}: ${comando.val}`;
    document.getElementById("listaComandos").appendChild(li);
}

function enviarRutaMQTT() {
    if (listaRuta.length === 0) return alert("Lista vacía");

    const payload = { ruta: listaRuta };
    
    // Aquí usas tu cliente MQTT (o tu función de publicación)
    // Supongamos que publicas en 'jhosimar/config'
    console.log("Enviando JSON:", JSON.stringify(payload));
    
    // publish("jhosimar/config", JSON.stringify(payload));
    
    // Limpiar lista después de enviar
    listaRuta = [];
    document.getElementById("listaComandos").innerHTML = "";
    alert("Ruta enviada correctamente");
}
