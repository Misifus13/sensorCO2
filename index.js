// =========================================
// REGISTRO USUARIOS CO2
// =========================================

app.post("/registro", async (req, res) => {
    const {
        usuario,
        contrasena,
        email,
        celular,
        id_sensor135
    } = req.body;

    try {

        // Verificar si existe el sensor
        const { data: sensor, error: errorSensor } = await supabase
            .from('sensores_co2')
            .select('id_sensor135')
            .eq('id_sensor135', id_sensor135)
            .maybeSingle();

        if (errorSensor) throw errorSensor;

        if (!sensor) {
            return res.status(404).send(
                "⚠️ El ID del sensor no existe."
            );
        }

        // Verificar si usuario ya existe
        const { data: usuarioExistente } = await supabase
            .from('usuarios_co2')
            .select('usuario')
            .eq('usuario', usuario)
            .maybeSingle();

        if (usuarioExistente) {
            return res.status(400).send(
                "⚠️ El usuario ya existe."
            );
        }

        // Registrar usuario
        const { error: errorInsert } = await supabase
            .from('usuarios_co2')
            .insert([{
                usuario,
                contrasena,
                email,
                celular,
                id_sensor135
            }]);

        if (errorInsert) throw errorInsert;

        res.send("✅ Usuario registrado correctamente");

    } catch (err) {
        console.error(err);
        res.status(500).send(
            "Error al registrar usuario."
        );
    }
});


// =========================================
// LOGIN USUARIOS CO2
// =========================================

app.post("/login", async (req, res) => {

    const { usuario, contrasena } = req.body;

    try {

        const { data, error } = await supabase
            .from('usuarios_co2')
            .select('*')
            .eq('usuario', usuario)
            .eq('contrasena', contrasena)
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
            "Error al iniciar sesión."
        );
    }
});
