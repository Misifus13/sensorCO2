function togglePassword() {

    const input =
        document.getElementById(
            "contrasena"
        );

    const icon =
        document.getElementById(
            "eyeIcon"
        );

    if(input.type==="password"){

        input.type="text";

        icon.classList.replace(
            "fa-eye",
            "fa-eye-slash"
        );
    }
    else{

        input.type="password";

        icon.classList.replace(
            "fa-eye-slash",
            "fa-eye"
        );
    }
}

async function registrar(){

    const btn =
        document.getElementById(
            "btnRegistro"
        );

    const usuario =
        document.getElementById(
            "usuario"
        ).value.trim();

    const contrasena =
        document.getElementById(
            "contrasena"
        ).value.trim();

    const celular =
        document.getElementById(
            "celular"
        ).value.trim();

    const email =
        document.getElementById(
            "email"
        ).value.trim();

    const id_sensor135 =
        document.getElementById(
            "id_sensor135"
        )
        .value
        .trim()
        .toUpperCase();

    if(
        !usuario ||
        !contrasena ||
        !celular ||
        !email ||
        !id_sensor135
    ){

        alert(
            "Completa todos los campos."
        );

        return;
    }

    try{

        btn.innerText =
            "Registrando...";

        btn.disabled = true;

        const response =
            await fetch(
                "/registro",
                {
                    method:"POST",

                    headers:{
                        "Content-Type":
                        "application/json"
                    },

                    body:JSON.stringify({

                        usuario,
                        contrasena,
                        celular,
                        email,
                        id_sensor135
                    })
                }
            );

        const mensaje =
            await response.text();

        if(response.ok){

            alert(
                "✅ Cuenta creada correctamente"
            );

            window.location =
                "index.html";
        }
        else{

            alert(mensaje);
        }

    }
    catch(error){

        console.error(error);

        alert(
            "❌ Error de conexión con el servidor"
        );
    }
    finally{

        btn.innerText =
            "Crear cuenta";

        btn.disabled =
            false;
    }
}
