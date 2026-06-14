const formulario = document.getElementById("formulario-login");
const errorTxt = document.getElementById("error-txt");

formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correo").value;
    const contrasena = document.getElementById("contrasena").value;

    try {
        errorTxt.style.display = "none";

        // Preguntamos a Firebase si este usuario existe en Authentication
        await window.signInWithEmailAndPassword(window.auth, correo, contrasena);
        
        // ✨ SOLUCIÓN: Guardamos la llave para que el "Guardián" de admin.html nos deje pasar
        sessionStorage.setItem('userLogged', 'true');

        // Si todo está bien, saltamos al panel de administración corregido
        window.location.href = "admin.html";

    } catch (error) {
        console.error("Error al loguear:", error.code);
        errorTxt.style.display = "block"; // Muestra el texto rojo si fallas
    }
});