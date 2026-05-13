# Sistema de Gestión de Biblioteca Pública

## Integrantes

**Desarrollado por**: 
- Maria Estefany Piedrahita Monsalve
- Mateo Jimenez Duque

## Descripción

Este proyecto es un sistema web completo para la gestión de una biblioteca pública. Permite administrar libros, usuarios y préstamos de manera eficiente y organizada. La aplicación cuenta con una interfaz de usuario intuitiva desarrollada en HTML, CSS y JavaScript, y un backend robusto construido con Node.js y Express que se conecta a una base de datos Turso (LibSQL) para el almacenamiento persistente de datos.

## Objetivo

Facilitar la administración de bibliotecas públicas mediante una plataforma digital que centralice la información de libros disponibles, usuarios registrados y el seguimiento de préstamos. El sistema busca optimizar los procesos bibliotecarios tradicionales, proporcionando herramientas para registrar, consultar y gestionar recursos de manera segura y accesible.

## Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica de las páginas web
- **CSS3**: Estilos responsivos y diseño moderno con variables CSS personalizadas
- **JavaScript (ES6+)**: Lógica del lado cliente, manipulación del DOM y comunicación con el backend mediante Fetch API

### Backend
- **Node.js**: Entorno de ejecución para JavaScript en el servidor
- **Express.js**: Framework web minimalista para crear APIs RESTful
- **Turso (LibSQL)**: Base de datos distribuida basada en SQLite para almacenamiento de datos

### Herramientas de Desarrollo
- **Git**: Control de versiones
- **GitHub**: Repositorio remoto y colaboración
- **VS Code**: Entorno de desarrollo integrado

## Estructura de Carpetas

```
biblioteca/
├── README.md                 # Documentación del proyecto
├── Sprints.md               # Plan de desarrollo por sprints
├── backend/                 # Código del servidor
│   ├── .env                # Variables de entorno (credenciales de BD)
│   ├── package.json        # Dependencias y scripts de Node.js
│   ├── package-lock.json   # Bloqueo de versiones de dependencias
│   ├── server.js           # Servidor Express principal
│   └── node_modules/       # Dependencias instaladas
├── css/                    # Hojas de estilo
│   ├── styles.css          # Estilos de la página principal
│   ├── Encabezado.css      # Estilos del header común
│   ├── libros.css          # Estilos del módulo de libros
│   ├── usuarios.css        # Estilos del módulo de usuarios
│   └── prestamos.css       # Estilos del módulo de préstamos
├── html/                   # Páginas HTML
│   ├── index.html          # Página principal
│   ├── encabezado.html     # Header común (cargado dinámicamente)
│   ├── libros.html         # Gestión de libros
│   ├── usuarios.html       # Gestión de usuarios
│   └── prestamos.html      # Gestión de préstamos
├── img/                    # Imágenes y recursos gráficos
│   └── logo.png           # Logo de la biblioteca
└── js/                     # Scripts JavaScript
    ├── script.js           # Lógica de la página principal
    ├── header.js           # Carga dinámica del header
    ├── libros.js           # Lógica del módulo de libros
    ├── usuarios.js         # Lógica del módulo de usuarios
    └── prestamos.js        # Lógica del módulo de préstamos
```

## Explicación del Frontend

### Arquitectura General
El frontend sigue una arquitectura modular con separación clara de responsabilidades:
- **HTML**: Define la estructura semántica de cada página
- **CSS**: Proporciona estilos responsivos y una experiencia visual coherente
- **JavaScript**: Maneja la lógica de negocio, interacciones del usuario y comunicación con el backend

### Header Común
- Utiliza `header.js` para cargar dinámicamente `encabezado.html` en todas las páginas
- Implementa navegación activa basada en la URL actual
- Diseño responsivo con logo y menú de navegación

### Comunicación con Backend
- Emplea la Fetch API para realizar peticiones HTTP al servidor
- Manejo asíncrono de respuestas con async/await
- Gestión de errores y feedback al usuario mediante notificaciones toast

### Interfaz de Usuario
- Diseño moderno con paleta de colores consistente
- Componentes reutilizables (tablas, modales, formularios)
- Funcionalidades de búsqueda y filtrado en tiempo real
- Estadísticas visuales en los dashboards de cada módulo

## Explicación del Backend

### Arquitectura del Servidor
El backend está construido con Express.js y sigue el patrón de API RESTful:
- **Rutas modulares**: Endpoints organizados por entidad (libros, usuarios, préstamos)
- **Middleware**: CORS habilitado, parsing de JSON, archivos estáticos servidos
- **Manejo de errores**: Respuestas estructuradas con códigos HTTP apropiados

### Conexión a Base de Datos
- Utiliza el cliente oficial de Turso (@libsql/client)
- Configuración mediante variables de entorno para credenciales
- Consultas SQL parametrizadas para prevenir inyección SQL
- Manejo de transacciones para operaciones complejas

### Seguridad
- Credenciales sensibles almacenadas en archivo .env (no versionado)
- Validación de datos de entrada en endpoints
- Manejo seguro de errores sin exponer información interna

## Tablas de la Base de Datos

### Categorías
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | Identificador único (autoincremental) |
| nombre | TEXT | Nombre de la categoría (Literatura, Ciencia, etc.) |

### Libros
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | Identificador único (autoincremental) |
| titulo | TEXT | Título del libro |
| autor | TEXT | Autor del libro |
| categoria_id | INTEGER | ID de la categoría (FK a categorias.id) |
| anio_publicacion | INTEGER | Año de publicación |

### Ejemplares
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | Identificador único (autoincremental) |
| libro_id | INTEGER | ID del libro (FK a libros.id) |
| codigo | TEXT | Código único del ejemplar (LIB-001, etc.) |
| estado | TEXT | Estado actual (disponible, prestado) |
| ubicacion | TEXT | Ubicación física en la biblioteca |

### Usuarios
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | Identificador único (autoincremental) |
| nombre | TEXT | Nombre completo del usuario |
| documento | TEXT | Número de documento de identidad |
| email | TEXT | Correo electrónico |
| telefono | TEXT | Número de teléfono |
| direccion | TEXT | Dirección de residencia |
| estado | TEXT | Estado del usuario (activo, inactivo) |

### Préstamos
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | Identificador único (autoincremental) |
| usuario_id | INTEGER | ID del usuario (FK a usuarios.id) |
| ejemplar_id | INTEGER | ID del ejemplar (FK a ejemplares.id) |
| fecha_prestamo | DATE | Fecha en que se realizó el préstamo |
| fecha_devolucion_estimada | DATE | Fecha estimada de devolución |
| fecha_devolucion_real | DATE | Fecha real de devolución (NULL si no devuelto) |
| estado | TEXT | Estado del préstamo (activo, devuelto, vencido) |
| observaciones | TEXT | Notas adicionales sobre el préstamo |

## Funcionalidades por Módulo

### Módulo de Libros
- **Visualizar catálogo**: Lista completa de libros con información detallada
- **Registrar libro**: Formulario para agregar nuevos títulos con validación
- **Editar libro**: Modificación de información existente
- **Eliminar libro**: Remoción de libros con eliminación en cascada de préstamos relacionados
- **Estados de ejemplares**: Seguimiento de disponibilidad (disponible/prestado)

### Módulo de Usuarios
- **Listado de usuarios**: Tabla con información completa y filtros de búsqueda
- **Registro de usuarios**: Formulario para nuevos usuarios con campos obligatorios
- **Estados de usuarios**: Activación/desactivación de cuentas
- **Estadísticas**: Conteo de usuarios activos e inactivos
- **Búsqueda**: Filtrado por nombre, email o documento

### Módulo de Préstamos
- **Registro de préstamos**: Asociación de usuario y libro disponible con fechas
- **Seguimiento de préstamos**: Visualización de estado y fechas de devolución
- **Marcado de devoluciones**: Actualización automática del estado del ejemplar
- **Detección de vencimientos**: Identificación visual de préstamos atrasados
- **Estadísticas**: Conteo por estado (activo, devuelto, vencido)
- **Filtros**: Búsqueda por libro, autor, usuario o estado

## Rutas del Backend

### Libros
- `GET /libros` - Obtener todos los libros con información de ejemplares
- `POST /libros` - Registrar nuevo libro y crear ejemplar automáticamente
- `PUT /libros/:id` - Actualizar información de libro y estado del ejemplar
- `DELETE /libros/:id` - Eliminar libro y todos sus ejemplares/préstamos relacionados

### Usuarios
- `GET /usuarios` - Obtener todos los usuarios ordenados por ID descendente
- `GET /usuarios-activos` - Obtener solo usuarios con estado 'activo'
- `POST /usuarios` - Registrar nuevo usuario
- `DELETE /usuarios/:id` - Eliminar usuario
- `PUT /usuarios/:id/inactivar` - Cambiar estado a 'inactivo'
- `PUT /usuarios/:id/activar` - Cambiar estado a 'activo'

### Préstamos
- `GET /prestamos` - Obtener todos los préstamos con información relacionada
- `GET /ejemplares-disponibles` - Obtener ejemplares con estado 'disponible'
- `POST /prestamos` - Registrar nuevo préstamo y cambiar estado del ejemplar
- `PUT /prestamos/:id/devolver` - Marcar préstamo como devuelto y liberar ejemplar

## Pasos de Instalación

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm (viene incluido con Node.js)
- Cuenta en Turso para la base de datos

### Instalación del Backend
1. Navegar al directorio del backend:
   ```bash
   cd backend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   - Copiar el archivo `.env` y actualizar las credenciales de Turso
   - Asegurarse de que `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` estén configurados correctamente

## Pasos de Ejecución

### Ejecutar el Servidor
1. Desde el directorio `backend`:
   ```bash
   npm start
   ```

2. El servidor se iniciará en el puerto 3000 (configurable en `.env`)

### Acceder a la Aplicación
- Abrir un navegador web
- Navegar a `http://localhost:3000` (servirá los archivos estáticos del frontend)
- La página principal se cargará automáticamente

### Páginas Disponibles
- `http://localhost:3000/html/index.html` - Página principal
- `http://localhost:3000/html/libros.html` - Gestión de libros
- `http://localhost:3000/html/usuarios.html` - Gestión de usuarios
- `http://localhost:3000/html/prestamos.html` - Gestión de préstamos

## Variables de Entorno

El archivo `backend/.env` debe contener las siguientes variables:

```env
# URL de conexión a la base de datos Turso
TURSO_DATABASE_URL=libsql://[nombre-db].[region].turso.io

# Token de autenticación de Turso
TURSO_AUTH_TOKEN=[token-generado-por-turso]

# Puerto del servidor (opcional, por defecto 3000)
PORT=3000
```

**Nota**: Este archivo contiene credenciales sensibles y no debe ser versionado en el repositorio.

## Buenas Prácticas Implementadas

### Código
- **Separación de responsabilidades**: Frontend y backend claramente diferenciados
- **Modularidad**: Funciones reutilizables y archivos organizados por funcionalidad
- **Nombres descriptivos**: Variables, funciones y archivos con nombres claros
- **Comentarios**: Código documentado con explicaciones de funcionalidades complejas

### Seguridad
- **Validación de entrada**: Datos verificados antes de procesar en el backend
- **Consultas parametrizadas**: Prevención de inyección SQL
- **Credenciales protegidas**: Variables de entorno para información sensible
- **Manejo de errores**: Respuestas controladas sin exposición de información interna

### Interfaz de Usuario
- **Responsive design**: Adaptable a diferentes tamaños de pantalla
- **Accesibilidad**: Uso de etiquetas semánticas y navegación por teclado
- **Feedback visual**: Notificaciones toast y estados visuales claros
- **Experiencia consistente**: Paleta de colores y componentes reutilizables

### Base de Datos
- **Integridad referencial**: Claves foráneas y eliminación en cascada
- **Normalización**: Estructura optimizada para evitar redundancia
- **Índices**: Consultas eficientes con ordenamiento apropiado

## Mejoras Futuras

### Funcionalidades
- **Sistema de autenticación**: Login y roles de usuario (administrador, bibliotecario)
- **Notificaciones**: Alertas por email para préstamos vencidos
- **Códigos QR**: Generación de códigos para identificación rápida de libros
- **API pública**: Endpoints para integración con otras aplicaciones
- **Reportes**: Generación de estadísticas avanzadas y exportación a PDF

### Técnico
- **Framework frontend**: Migración a React o Vue.js para mejor mantenibilidad
- **Base de datos relacional**: Evaluación de PostgreSQL para mayor escalabilidad
- **Testing**: Implementación de pruebas unitarias e integración
- **CI/CD**: Pipeline de despliegue automático
- **Contenedorización**: Docker para facilitar el despliegue

### Interfaz
- **Modo oscuro**: Alternativa visual para diferentes preferencias
- **Internacionalización**: Soporte para múltiples idiomas
- **PWA**: Funcionalidad offline y instalación como aplicación
- **Dashboard avanzado**: Gráficos interactivos y métricas en tiempo real

