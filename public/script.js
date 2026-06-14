// ==========================================
// MOSTRAR / OCULTAR CONTRASEÑA
// ==========================================

function togglePassword() {

    const passwordInput =
        document.getElementById(
            "contrasena"
        );

    const eyeIcon =
        document.getElementById(
            "eyeIcon"
        );

    if (
        passwordInput.type ===
        "password"
    ) {

        passwordInput.type =
            "text";

        eyeIcon.classList.replace(
            "fa-eye",
            "fa-eye-slash"
        );

    } else {

        passwordInput.type =
            "password";

        eyeIcon.classList.replace(
            "fa-eye-slash",
            "fa-eye"
        );
    }
}

// ==========================================
// LOGIN
// ==========================================

async function login() {

    const btn =
        document.getElementById(
            "btnLogin"
        );

    const usuario =
        document.getElementById(
            "usuario"
        ).value.trim();

    const contrasena =
        document.getElementById(
            "contrasena"
        ).value.trim();

    if (
        !usuario ||
        !contrasena
    ) {

        alert(
            "Por favor ingresa usuario y contraseña."
        );

        return;
    }

    try {

        btn.innerText =
            "Verificando...";

        btn.disabled =
            true;

        const response =
            await fetch(
                "/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                        "application/json"
                    },

                    body: JSON.stringify({
                        usuario,
                        contrasena
                    })
                }
            );

        if (response.ok) {

            const data =
                await response.json();

            if (
                data &&
                data.id_sensor135
            ) {

                localStorage.setItem(
                    "id_sensor135",
                    data.id_sensor135
                );

                localStorage.setItem(
                    "usuario",
                    data.usuario
                );

                window.location =
                    "dashboard.html";

            } else {

                alert(
                    "No existe un sensor asociado a esta cuenta."
                );
            }

        } else {

            const mensaje =
                await response.text();

            alert(
                mensaje ||
                "Usuario o contraseña incorrectos."
            );
        }

    } catch (error) {

        console.error(error);

        alert(
            "No se pudo conectar con el servidor."
        );

    } finally {

        btn.innerText =
            "Ingresar";

        btn.disabled =
            false;
    }
}
