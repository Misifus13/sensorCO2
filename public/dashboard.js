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
