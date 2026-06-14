// =========================================================================
// 1. IMPORTACIONES CORREGIDAS (Cada módulo a su respectiva librería oficial)
// =========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import {
    getAuth,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ==========================================
// 2. TUS CREDENCIALES EXACTAS DE PROYECTO
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyAlfqbQYd0MrHP2AGkm4gGDxtQE1GOXq9U",
    authDomain: "lili-perfumes.firebaseapp.com",
    projectId: "lili-perfumes",
    storageBucket: "lili-perfumes.firebasestorage.app",
    messagingSenderId: "777721122748",
    appId: "1:777721122748:web:290706f8a79176f6d425b9"
};

// Inicializamos Firebase y Servicios
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// CAPTURA DE ELEMENTOS DE LA INTERFAZ PRINCIPAL
const tablaCuerpo = document.getElementById('tabla-cuerpo');
const formularioCrear = document.getElementById('formulario-producto');
const inputBuscar = document.getElementById('buscar-producto');
const btnCerrarSesion = document.getElementById('btn-logout');
const contenedorPaginacion = document.getElementById('paginacion-controles') || crearContenedorPaginacion();

// CAPTURA DE ELEMENTOS DE LA VENTANA FLOTANTE (MODAL)
const modalEditar = document.getElementById('modal-editar');
const formularioModal = document.getElementById('formulario-producto-modal');
const btnCerrarX = document.getElementById('btn-cerrar-modal');
const btnCancelarModal = document.getElementById('btn-cancelar-modal');
const modalImgPreview = document.getElementById('modal-img-preview');
const inputModalUrl = document.getElementById('modal-url-prod');

// VARIABLES GLOBALES DE ESTADO
let productosLocales = [];
let textoBusqueda = "";
let paginaActual = 1;
const productosPorPagina = 10;

// =========================================================================
// 🔒 EVENTO UNIFICADO DE CERRAR SESIÓN
// =========================================================================
if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', async (e) => {
        e.preventDefault();
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            try {
                await signOut(auth);
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = 'login.html';
            } catch (error) {
                console.error("Error al cerrar sesión:", error);
                alert("No se pudo cerrar la sesión correctamente.");
            }
        }
    });
}

// ==========================================
// 3. ESCUCHAR INVENTARIO EN TIEMPO REAL (Corregido para traer los campos nuevos)
// ==========================================
function cargarInventario() {
    onSnapshot(collection(db, "productos"), (snapshot) => {
        productosLocales = [];
        snapshot.forEach((docSnap) => {
            const producto = docSnap.data();
            productosLocales.push({
                id: docSnap.id,
                nombre: producto.nombre || 'Sin nombre',
                marca: producto.marca || 'Sin marca',
                precio: producto.precio || 0,
                imagen: producto.imagen || '',
                genero: producto.genero || '',      // ✨ Traemos el Género
                aroma: producto.aroma || '',        // ✨ Traemos el Aroma
                fijacion: producto.fijacion || '',  // ✨ Traemos la Fijación
                notas: producto.notas || ''         // ✨ Traemos las Notas
            });
        });
        renderizarTabla();
    }, (error) => {
        console.error("Error en Snapshot de Firestore:", error);
    });
}

// ==========================================
// 🚀 RENDERIZADO CON FILTRADO Y PAGINACIÓN
// ==========================================
function renderizarTabla() {
    tablaCuerpo.innerHTML = '';

    const productosFiltrados = productosLocales.filter(prod => {
        const termino = textoBusqueda.toLowerCase();
        return prod.nombre.toLowerCase().includes(termino) || prod.marca.toLowerCase().includes(termino);
    });

    if (productosFiltrados.length === 0) {
        tablaCuerpo.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color:#7c7365;">No se encontraron productos.</td></tr>`;
        actualizarControlesPaginacion(0);
        return;
    }

    const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
    if (paginaActual > totalPaginas) paginaActual = totalPaginas || 1;

    const indiceInicio = (paginaActual - 1) * productosPorPagina;
    const indiceFin = indiceInicio + productosPorPagina;
    const productosPagina = productosFiltrados.slice(indiceInicio, indiceFin);

    productosPagina.forEach((producto) => {
        const precioFormateado = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(producto.precio);

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>
                <img src="${producto.imagen}" alt="Perfume" class="img-tabla-preview" onerror="this.src='img/logo_lily-removebg.png'">
            </td>
            <td>${producto.nombre}</td>
            <td>${producto.marca}</td>
            <td>${precioFormateado}</td>
            <td>
                <div class="celda-acciones">
                    <button class="btn-accion editar" title="Editar">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-accion eliminar" title="Eliminar">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        // ✨ Corregido: Pasamos todos los parámetros nuevos a la función del modal
        fila.querySelector('.editar').addEventListener('click', () => {
            abrirModalEdicion(
                producto.id,
                producto.nombre,
                producto.marca,
                producto.precio,
                producto.imagen,
                producto.genero,
                producto.aroma,
                producto.fijacion,
                producto.notas
            );
        });

        fila.querySelector('.eliminar').addEventListener('click', () => {
            eliminarProducto(producto.id);
        });

        tablaCuerpo.appendChild(fila);
    });

    actualizarControlesPaginacion(totalPaginas);
}

// ==========================================
// 🔍 BUSCADOR EN TIEMPO REAL
// ==========================================
if (inputBuscar) {
    inputBuscar.addEventListener('input', (e) => {
        textoBusqueda = e.target.value;
        paginaActual = 1;
        renderizarTabla();
    });
}

// ==========================================
// 📄 CONTROLES DE LA PAGINACIÓN
// ==========================================
function actualizarControlesPaginacion(totalPaginas) {
    contenedorPaginacion.innerHTML = '';
    if (totalPaginas <= 1) return;

    const btnAnt = document.createElement('button');
    btnAnt.className = 'btn-pag';
    btnAnt.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    btnAnt.disabled = paginaActual === 1;
    btnAnt.addEventListener('click', () => { if (paginaActual > 1) { paginaActual--; renderizarTabla(); } });
    contenedorPaginacion.appendChild(btnAnt);

    for (let i = 1; i <= totalPaginas; i++) {
        const btnNum = document.createElement('button');
        btnNum.className = `btn-pag ${paginaActual === i ? 'activa' : ''}`;
        btnNum.textContent = i;
        btnNum.addEventListener('click', () => { paginaActual = i; renderizarTabla(); });
        contenedorPaginacion.appendChild(btnNum);
    }

    const btnSig = document.createElement('button');
    btnSig.className = 'btn-pag';
    btnSig.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    btnSig.disabled = paginaActual === totalPaginas;
    btnSig.addEventListener('click', () => { if (paginaActual < totalPaginas) { paginaActual++; renderizarTabla(); } });
    contenedorPaginacion.appendChild(btnSig);
}

function crearContenedorPaginacion() {
    let div = document.createElement('div');
    div.id = 'paginacion-controles';
    div.style.cssText = 'display:flex; justify-content:center; gap:8px; margin-top:15px;';
    document.querySelector('.tabla-responsiva').after(div);
    return div;
}

// ==========================================
// ✨ GESTIÓN DE LA VENTANA FLOTANTE (MODAL) - VERSIÓN CORREGIDA
// ==========================================

function abrirModalEdicion(id, nombre, marca, precio, imagen, genero, aroma, fijacion, notas) {
    // 🔍 Captura dinámica en tiempo real (Evita el error 'null')
    const imgPreview = document.getElementById('modal-img-preview');
    const inputUrl = document.getElementById('modal-url-prod');

    // Rellenamos los campos básicos
    document.getElementById('modal-nombre-prod').value = nombre;
    document.getElementById('modal-marca-prod').value = marca;
    document.getElementById('modal-precio-prod').value = precio;

    // Asignamos la URL al input si existe
    if (inputUrl) {
        inputUrl.value = imagen;
    }

    // Asignamos la imagen de vista previa de forma segura
    if (imgPreview) {
        imgPreview.src = imagen || 'img/logo_lily-removebg.png';
    } else {
        console.warn("Advertencia: No se encontró el elemento #modal-img-preview en el HTML.");
    }

    // Rellenamos los campos nuevos de forma segura
    document.getElementById('modal-genero-prod').value = genero || "";
    document.getElementById('modal-aroma-prod').value = aroma || "";
    document.getElementById('modal-fijacion-prod').value = fijacion || "Alta (6-8 hours)";
    document.getElementById('modal-notas-prod').value = notas || "";

    // Guardamos el ID del producto que estamos editando dentro del formulario
    formularioModal.dataset.idEditar = id;

    // Mostramos el modal en pantalla cambiando el estilo CSS
    modalEditar.style.display = 'flex';
}

// 2. Función para limpiar y ocultar el modal
function cerrarModal() {
    modalEditar.style.display = 'none';
    formularioModal.reset();
    delete formularioModal.dataset.idEditar;
}

// Escuchadores para cerrar la ventana
btnCerrarX.addEventListener('click', cerrarModal);
btnCancelarModal.addEventListener('click', cerrarModal);

// Actualizar la vista previa de la imagen en tiempo real dentro del modal
inputModalUrl.addEventListener('input', (e) => {
    modalImgPreview.src = e.target.value || 'img/logo_lily-removebg.png';
});

// 3. MÉTODO DE ACTUALIZACIÓN: Cuando el administrador presiona "Actualizar Cambios"
formularioModal.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Rescatamos el ID que guardamos al abrir el modal
    const idEditar = formularioModal.dataset.idEditar;

    // Capturamos los valores actuales de los inputs
    const nombre = document.getElementById('modal-nombre-prod').value;
    const marca = document.getElementById('modal-marca-prod').value;
    const precio = parseFloat(document.getElementById('modal-precio-prod').value);
    const imagen = inputModalUrl.value;

    const genero = document.getElementById('modal-genero-prod').value;
    const aroma = document.getElementById('modal-aroma-prod').value;
    const fijacion = document.getElementById('modal-fijacion-prod').value;
    const notas = document.getElementById('modal-notas-prod').value;

    try {
        // Apuntamos al documento exacto en Firebase Firestore usando su ID
        const productoRef = doc(db, "productos", idEditar);

        // Ejecutamos la edición real en la nube con updateDoc
        await updateDoc(productoRef, {
            nombre,
            marca,
            precio,
            imagen,
            genero,
            aroma,
            fijacion,
            notas
        });

        alert('¡Producto actualizado correctamente!');
        cerrarModal();
    } catch (error) {
        console.error("Error al actualizar en Firestore:", error);
        alert('No se pudieron guardar los cambios de edición.');
    }
});

// ==========================================
// ➕ CREAR NUEVO PRODUCTO (PANEL PRINCIPAL)
// ==========================================
formularioCrear.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre-prod').value;
    const marca = document.getElementById('marca-prod').value;
    const precio = parseFloat(document.getElementById('precio-prod').value);
    const imagen = document.getElementById('url-prod').value;
    const genero = document.getElementById('genero-prod').value;
    const aroma = document.getElementById('aroma-prod').value;
    const fijacion = document.getElementById('fijacion-prod').value;
    const notas = document.getElementById('notas-prod').value;

    try {
        await addDoc(collection(db, "productos"), {
            nombre,
            marca,
            precio,
            imagen,
            genero,
            aroma,
            fijacion,
            notas,
            fechaCreacion: new Date()
        });
        alert('¡Producto guardado con éxito!');
        formularioCrear.reset();
    } catch (error) {
        console.error("Error al crear:", error);
        alert('Hubo un problema al registrar el producto.');
    }
});



// ==========================================
// 🗑️ ELIMINAR PRODUCTO
// ==========================================
async function eliminarProducto(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        try {
            await deleteDoc(doc(db, "productos", id));
            alert('Producto eliminado de la base de datos.');
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
}

// Arrancamos el panel de inventario
cargarInventario();