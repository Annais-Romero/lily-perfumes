# Lily Perfumes

**Catálogo digital de perfumes con panel de administración**, desarrollado como proyecto personal para practicar desarrollo web, gestión de datos e integración con servicios de Firebase.

El proyecto permite explorar fragancias desde una interfaz adaptable a distintos tamaños de pantalla y administrar productos mediante un panel con operaciones de creación, consulta, edición y eliminación (CRUD).

> **Estado del proyecto:** código disponible para consulta y aprendizaje. La ejecución completa depende de que el proyecto Firebase asociado siga activo y esté configurado correctamente. No se incluye una demo pública verificada en este momento.

## Funcionalidades

### Catálogo público

- Visualización de perfumes con imagen, nombre, marca y precio en pesos chilenos.
- Búsqueda por nombre o marca.
- Filtros combinables por marca, género y familia olfativa.
- Vista de detalles con información sobre fijación y notas aromáticas.
- Acceso directo a un canal de contacto mediante WhatsApp.
- Interfaz adaptable para dispositivos móviles y escritorio.

### Panel de administración

- Inicio de sesión mediante **Firebase Authentication** (correo y contraseña).
- Visualización del inventario almacenado en **Cloud Firestore**.
- Registro de nuevos productos.
- Edición de los datos de productos existentes mediante un formulario modal.
- Eliminación de productos con confirmación previa.
- Búsqueda por nombre o marca y paginación del inventario.
- Sincronización del listado administrativo con los cambios en Firestore mediante `onSnapshot`.

## Tecnologías utilizadas

| Área | Tecnología |
| --- | --- |
| Estructura | HTML5 |
| Estilos y diseño responsive | CSS3 |
| Lógica e interactividad | JavaScript (vanilla) |
| Base de datos | Firebase Cloud Firestore |
| Autenticación | Firebase Authentication |
| Iconografía del administrador | Font Awesome (CDN) |

La aplicación utiliza el SDK modular de Firebase desde CDN. **No requiere instalar dependencias con npm** para ejecutar esta versión.

## Estructura del proyecto

```text
lily-perfumes-main/
├── index.html           # Catálogo público
├── login.html           # Acceso al panel administrativo
├── admin.html           # Gestión de productos
├── CSS/
│   ├── style.css        # Estilos del catálogo
│   ├── login.css        # Estilos del inicio de sesión
│   └── admin.css        # Estilos del administrador
├── JS/
│   ├── app.js           # Catálogo, búsqueda, filtros y detalles
│   ├── login.js         # Inicio de sesión
│   └── admin.js         # CRUD, búsqueda y paginación
├── img/                 # Recursos gráficos locales
└── productos.json       # Archivo de datos incluido como referencia
```

**Nota:** el catálogo actual obtiene los productos desde Firestore; `productos.json` no se carga automáticamente como alternativa sin conexión.

## Ejecución local

### Requisitos

- Navegador web moderno.
- Python 3 para usar un servidor HTTP local, o una herramienta equivalente como *Live Server* de VS Code.
- Conexión a Internet para cargar Firebase y otros recursos servidos mediante CDN.
- Proyecto Firebase operativo para probar la autenticación y las operaciones con datos.

### Pasos

1. Clona el repositorio o descarga su contenido:

   ```bash
   git clone https://github.com/Annais-Romero/lily-perfumes.git
   cd lily-perfumes
   ```

2. Inicia un servidor HTTP en la carpeta que contiene `index.html`:

   ```bash
   python -m http.server 5500
   ```

   En algunas instalaciones de Windows puede ser necesario usar `py -m http.server 5500`.

3. Abre las siguientes páginas en tu navegador:

   - Catálogo: `http://localhost:5500/index.html`
   - Inicio de sesión: `http://localhost:5500/login.html`
   - Administración: `http://localhost:5500/admin.html` (requiere autenticación y permisos configurados correctamente).

> Si el proyecto Firebase original está inactivo, sus permisos cambiaron o faltan productos en Firestore, el catálogo puede aparecer vacío y las operaciones administrativas pueden fallar. El código no incluye una base de datos local funcional como respaldo.

## Configuración de Firebase

Esta versión utiliza **Firebase Authentication** y **Cloud Firestore**. La configuración web del proyecto se encuentra actualmente en:

- `index.html`
- `login.html`
- `JS/admin.js`

Para utilizar otro proyecto Firebase, actualiza la configuración web en esos archivos, habilita el método de autenticación **correo/contraseña** y crea la colección `productos` en Firestore. Las reglas de seguridad y los permisos deben configurarse desde Firebase para el proyecto correspondiente.

### Estructura de un producto

Los documentos de la colección `productos` utilizan campos como los siguientes:

```json
{
  "nombre": "Fragancia de ejemplo",
  "marca": "Marca de ejemplo",
  "precio": 45000,
  "imagen": "https://ejemplo.com/imagen.jpg",
  "genero": "Unisex",
  "aroma": "Floral",
  "fijacion": "Alta (6-8 horas)",
  "notas": "Rosa, vainilla, almizcle"
}
```

Los valores anteriores son **datos ficticios de referencia**, no un producto real de la colección. El panel también registra una fecha de creación cuando agrega productos.

## Consideraciones de seguridad y estado técnico

Este repositorio es un proyecto de aprendizaje y **no debe considerarse preparado para producción sin una revisión adicional**.

- **Control de acceso:** la redirección de `admin.html` se basa actualmente en un indicador almacenado en el navegador (`sessionStorage` o `localStorage`). Ese indicador **no sustituye** una comprobación robusta de la sesión y los permisos.
- **Reglas de Firestore:** la autorización real de lectura y escritura debe aplicarse con reglas de seguridad del lado de Firebase. La configuración de esas reglas no está incluida en el repositorio, por lo que no se puede verificar aquí quién tiene permiso para modificar productos.
- **Renderizado de datos:** algunas vistas construyen HTML dinámico con valores de Firestore mediante `innerHTML`. Es recomendable utilizar `textContent` y métodos seguros para crear elementos, o sanitizar adecuadamente los datos, para reducir riesgos de inyección de contenido.
- **Configuración y credenciales:** los identificadores de configuración web de Firebase no son equivalentes a contraseñas de administrador. Aun así, conviene revisar las restricciones de la clave, las reglas de seguridad y no publicar claves privadas ni credenciales de usuarios.
- **Dependencia de servicios externos:** la carga de productos y el acceso administrativo requieren que Firebase y los recursos externos estén disponibles.

## Alcance

Lily Perfumes es un **catálogo web**, no una tienda con pago integrado. En esta versión no se incluyen carrito de compras, procesamiento de pagos ni despacho de pedidos.

## Próximas mejoras

- Reforzar la validación de sesión y los permisos administrativos.
- Revisar y endurecer las reglas de seguridad de Firestore.
- Evitar la interpolación directa de datos externos en HTML.
- Centralizar la configuración de Firebase para facilitar el mantenimiento.
- Añadir estados visuales de carga y mensajes de error en el catálogo.
- Incorporar pruebas automatizadas para búsqueda, filtros y operaciones CRUD.
- Documentar capturas de escritorio y móvil.

## Evidencia visual

Las capturas del catálogo, la vista móvil y el panel de gestión se incorporarán en una próxima actualización del README.

## Autora

**Annais Poulet Romero Díaz**  
Ingeniera en Informática  
[GitHub: Annais-Romero](https://github.com/Annais-Romero)

---

*Proyecto personal utilizado para demostrar conocimientos de desarrollo frontend, gestión de datos y construcción de interfaces web.*
