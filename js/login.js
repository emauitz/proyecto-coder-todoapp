export function iniciarSesion(userEmail, userPassword) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    try {
        if (userEmail && userPassword) {
            const usuario = usuarios.find(user => user.email === userEmail && user.password === userPassword);
            if (!usuario) {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Credenciales incorrectas. Por favor, intenta de nuevo.",
                });
                throw new Error("Usuario no encontrado.");
            }
            localStorage.setItem("login_success", JSON.stringify({ email: usuario.email, username: usuario.username }));
            window.location.href = 'index.html';  // Redirigir a la página principal
        } else {
            throw new Error("Faltan datos de inicio de sesión.");
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
        });
    }
}


// Obtener referencia al formulario de login y agregar un evento de submit
document.querySelector('.log-in').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevenir el envío del formulario por defecto

    // Obtener valores de los campos del formulario
    let userEmail = document.getElementById('email-login').value;
    let userPassword = document.getElementById('password-login').value;

    // Llamar a la función para iniciar sesión con los valores del formulario
    iniciarSesion(userEmail, userPassword);
});

export function crearUsuario(username, email, password, repPassword) {
    if (!username || !email || !password || !repPassword) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No se completaron todos los campos!",
        });
        return;
    }
    if (password !== repPassword || password.length < 6) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Las contraseñas deben coincidir y tener al menos 6 caracteres!",
        });
        return;
    }
    const usuario = { username, email, password };
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const siUsuarioRegistrados = usuarios.find(user => user.email === email);
    if (siUsuarioRegistrados) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "El email ya está registrado!",
        });
        return;
    }
    usuarios.push(usuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    // Simular envío de correo electrónico (se puede modificar para enviar realmente el correo)
    enviarCorreoConfirmacion(email, usuario);
    Swal.fire({
        icon: "success",
        title: "Éxito!",
        text: "Tu usuario fue creado correctamente!",
    });
    document.getElementById('email-login').focus();
}


document.getElementById('signup-Button').addEventListener('click', function (event) {
    event.preventDefault();

    let username = document.getElementById('username').value;
    let email = document.getElementById('email-signup').value;
    let password = document.getElementById('password-signup').value;
    let repPassword = document.getElementById('rePassword-signup').value;

    crearUsuario(username, email, password, repPassword);
});
