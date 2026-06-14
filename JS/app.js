// 1. SELECTORES DE ELEMENTOS HTML
const contenedor = document.getElementById("contenedor_producto");
const buscador = document.getElementById("buscador");
const filtroMarca = document.getElementById("FiltroMarca"); // Selector original de marcas
const filtroGenero = document.getElementById("FiltroGenero"); // ✨ Nuevo selector
const filtroAroma = document.getElementById("FiltroAroma");   // ✨ Nuevo selector

// Selectores del nuevo Modal de Detalle
const modalDetalle = document.getElementById("modal-detalle-cliente");
const btnCerrarDetalle = document.getElementById("btn-cerrar-detalle");

// 2. VARIABLE GLOBAL
let perfumes = []; 

// 3. FUNCIÓN PARA CREAR LAS TARJETAS PÚBLICAS
function crearTarjeta(perfume) {
    const tarjeta = document.createElement("div");
    tarjeta.classList.add("tarjeta");
    tarjeta.style.cursor = "pointer"; // Hace notar al cliente que es clicable
    
    tarjeta.innerHTML = `
        <img src="${perfume.imagen}" onerror="this.src='img/logo_lily-removebg.png'">
        <div class="info-tarjeta">
            <h3>${perfume.nombre}</h3>
            <p>Marca: ${perfume.marca}</p>
            <p class="precio">Precio: $${Number(perfume.precio).toLocaleString('es-CL')}</p>
        </div>`;

    // ✨ EVENTO: Al hacer clic en la tarjeta, abre el modal de detalle
    tarjeta.addEventListener("click", () => {
        abrirModalDetalle(perfume);
    });

    return tarjeta;
}

// 4. FUNCIÓN PARA ASIGNAR LOS DATOS AL MODAL Y MOSTRARLO
function abrirModalDetalle(perfume) {
    document.getElementById("detalle-img").src = perfume.imagen || 'img/logo_lily-removebg.png';
    document.getElementById("detalle-marca").textContent = perfume.marca;
    document.getElementById("detalle-nombre").textContent = perfume.nombre;
    
    // Asignamos las nuevas categorías (con valores por defecto por si hay productos antiguos sin estos datos)
    document.getElementById("badge-genero").textContent = perfume.genero || "Unisex 🌟";
    document.getElementById("badge-aroma").textContent = perfume.aroma || "Fragancia Única";
    document.getElementById("detalle-fijacion").textContent = perfume.fijacion || "Alta (6 a 8 horas)";
    document.getElementById("detalle-notas").textContent = perfume.notas || "Notas exclusivas seleccionadas por Lily Perfumes.";
    
    // Formato de precio elegante en pesos chilenos
    document.getElementById("detalle-precio").textContent = `$${Number(perfume.precio).toLocaleString('es-CL')}`;

    modalDetalle.style.display = "flex";
}

// CERRAR EL MODAL
btnCerrarDetalle.addEventListener("click", () => { modalDetalle.style.display = "none"; });
window.addEventListener("click", (e) => { if (e.target === modalDetalle) modalDetalle.style.display = "none"; });

// 5. FUNCIÓN MAESTRA DE FILTRADO UNIFICADO
function filtrarCatalogo() {
    const texto = buscador.value.toLowerCase();
    const marcaSeleccionada = filtroMarca.value.toLowerCase();
    const generoSeleccionado = filtroGenero.value;
    const aromaSeleccionado = filtroAroma.value;

    const resultados = perfumes.filter(perfume => {
        // 1. Filtro por texto (Nombre o Marca)
        const coincideTexto = perfume.nombre.toLowerCase().includes(texto) || perfume.marca.toLowerCase().includes(texto);
        
        // 2. Filtro por Marca
        const coincideMarca = marcaSeleccionada === "todos" || perfume.marca.toLowerCase() === marcaSeleccionada;
        
        // 3. Filtro por Género (Soporta productos nuevos y antiguos)
        const campoGenero = perfume.genero || "todos";
        const coincideGenero = generoSeleccionado === "todos" || campoGenero === generoSeleccionado;
        
        // 4. Filtro por Aroma / Familia Olfativa
        const campoAroma = perfume.aroma || "todos";
        const coincideAroma = aromaSeleccionado === "todos" || campoAroma === aromaSeleccionado;

        return coincideTexto && coincideMarca && coincideGenero && coincideAroma;
    });

    mostrarPerfumes(resultados);
}

// ESCUCHADORES DE EVENTOS EN TIEMPO REAL
buscador.addEventListener("input", filtrarCatalogo);
filtroMarca.addEventListener("change", filtrarCatalogo);
filtroGenero.addEventListener("change", filtrarCatalogo);
filtroAroma.addEventListener("change", filtrarCatalogo);

// 6. FUNCIÓN PARA MOSTRAR LOS PERFUMES EN LA PANTALLA
function mostrarPerfumes(listaPerfumes) {
    contenedor.innerHTML = "";
    if (listaPerfumes.length === 0) {
        contenedor.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#7c7365; padding: 40px; font-family:'Poppins',sans-serif;">No encontramos fragancias con esos filtros. ¡Prueba otra combinación!</p>`;
        return;
    }
    listaPerfumes.forEach(perfume => {
        const tarjeta = crearTarjeta(perfume);
        contenedor.appendChild(tarjeta);
    });
}

// 7. CARGAR SELECTOR DE MARCAS DINÁMICAMENTE
function actualizarSelectorMarcas() {
    // Extraemos marcas únicas de los productos existentes
    const marcasUnicas = [...new Set(perfumes.map(p => p.marca))];
    
    // Reiniciamos el select dejando solo la opción por defecto
    filtroMarca.innerHTML = '<option value="todos">Todas las marcas</option>';
    
    marcasUnicas.forEach(marca => {
        if(marca) {
            const option = document.createElement("option");
            option.value = marca.toLowerCase();
            option.textContent = marca;
            filtroMarca.appendChild(option);
        }
    });
}

// 8. CONEXIÓN EN VIVO A FIREBASE FIRESTORE
async function cargarBaseDeDatos() {
    try {
        const db = window.db;
        const collection = window.collection;
        const getDocs = window.getDocs;

        const querySnapshot = await getDocs(collection(db, "productos"));
        perfumes = [];

        querySnapshot.forEach((doc) => {
            perfumes.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Actualizamos las marcas que existen en la base de datos
        actualizarSelectorMarcas();
        // Pintamos el catálogo
        mostrarPerfumes(perfumes);

    } catch (error) {
        console.error("Error al conectar con la base de datos de Firebase:", error);
    }
}

// 9. INICIALIZACIÓN SEGURA
window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        cargarBaseDeDatos();
    }, 100);
});