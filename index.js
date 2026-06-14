require('dotenv').config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const mqtt = require("mqtt");

const { createClient } = require('@supabase/supabase-js');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ========================================
// SUPABASE
// ========================================

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// ========================================
// MQTT
// ========================================

const mqttClient = mqtt.connect(
    "mqtts://e46fb974d55a4c96a5bd632a3617db64.s1.eu.hivemq.cloud:8883",
    {
        username: process.env.MQTT_USER,
        password: process.env.MQTT_PASS,
        rejectUnauthorized: false
    }
);

mqttClient.on("connect", () => {

    console.log("✅ Conectado a HiveMQ");

    mqttClient.subscribe("co2/datos");
});

// ========================================
// RECEPCION DE DATOS MQTT
// ========================================

mqttClient.on("message", async (topic, message) => {

    if (topic !== "co2/datos") return;

    try {

        const data = JSON.parse(message.toString());

        const {
            id_sensor135,
            lectura
        } = data;

        const { data: sensor } = await supabase
            .from("sensores_co2")
            .select("id_sensor135")
            .eq("id_sensor135", id_sensor135)
            .maybeSingle();

        if (!sensor) {

            console.log(
                "⚠️ Sensor no registrado:",
                id_sensor135
            );

            return;
        }

        const { error } = await supabase
            .from("datos_co2")
            .insert([
                {
                    id_sensor135,
                    lectura
                }
            ]);

        if (error) throw error;

        console.log(
            "✅ Lectura guardada:",
            id_sensor135,
            lectura
        );

    } catch (err) {

        console.error(
            "❌ Error MQTT:",
            err.message
        );
    }
});

// ========================================
// REGISTRO
// ========================================

app.post("/registro", async (req, res) => {

    const {
        usuario,
        contrasena,
        email,
        celular,
        id_sensor135
    } = req.body;


        console.log("ID recibido:", id_sensor135);

        const { data: sensor, error } = await supabase
            .from("sensores_co2")
            .select("*")
            .eq("id_sensor135", id_sensor135);
        
        console.log("Resultado:", sensor);
        console.log("Error:", error);



        const { data: sensores, error } = await supabase
        .from("sensores_co2")
        .select("*");
    
        console.log("Todos los sensores:", sensores);
    

    try {

        const { data: sensor } = await supabase
            .from("sensores_co2")
            .select("id_sensor135")
            .eq("id_sensor135", id_sensor135)
            .maybeSingle();

        if (!sensor) {

            return res.status(404).send(
                "⚠️ El sensor no existe."
            );
        }

        const { data: usuarioExistente } = await supabase
            .from("usuarios_co2")
            .select("usuario")
            .eq("usuario", usuario)
            .maybeSingle();

        if (usuarioExistente) {

            return res.status(400).send(
                "⚠️ Usuario ya registrado."
            );
        }

        const { error } = await supabase
            .from("usuarios_co2")
            .insert([
                {
                    usuario,
                    contrasena,
                    email,
                    celular,
                    id_sensor135
                }
            ]);

        if (error) throw error;

        res.send(
            "✅ Usuario registrado correctamente"
        );

    } catch (err) {

        console.error(err);

        res.status(500).send(
            "Error al registrar."
        );
    }
});

// ========================================
// LOGIN
// ========================================

app.post("/login", async (req, res) => {

    const {
        usuario,
        contrasena
    } = req.body;

    try {

        const { data, error } = await supabase
            .from("usuarios_co2")
            .select("*")
            .eq("usuario", usuario)
            .eq("contrasena", contrasena)
            .maybeSingle();

        if (error) throw error;

        if (!data) {

            return res.status(401).send(
                "Credenciales inválidas"
            );
        }

        res.json(data);

    } catch (err) {

        console.error(err);

        res.status(500).send(
            "Error al iniciar sesión"
        );
    }
});

// ========================================
// CONSULTAR DATOS DEL SENSOR
// ========================================

app.get("/datos/:id_sensor135", async (req, res) => {

    try {

        const { id_sensor135 } = req.params;

        const { data, error } = await supabase
            .from("datos_co2")
            .select("*")
            .eq("id_sensor135", id_sensor135)
            .order("fecha_hora", {
                ascending: false
            })
            .limit(100);

        if (error) throw error;

        res.json(data);

    } catch (err) {

        console.error(err);

        res.status(500).send(
            "Error obteniendo datos."
        );
    }
});

// ========================================
// PING
// ========================================

app.get("/ping", (req, res) => {

    res.send("pong");
});

// ========================================
// SERVIDOR
// ========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        "🚀 Servidor CO2 iniciado en puerto",
        PORT
    );
});
