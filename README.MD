# Sistema de Gestión de Biblioteca Pública

## Nombre del proyecto

Sistema de Gestión de Biblioteca Pública

## Descripción general del sistema

Este proyecto es una aplicación web para la administración de una biblioteca pública. Está compuesta por un frontend en HTML, CSS y JavaScript y un backend en Node.js y Express, con persistencia de datos en Turso (LibSQL). La solución facilita el control de libros, usuarios y préstamos, y ofrece visualizaciones adicionales como el ranking de libros más leídos y una sección de comentarios para usuarios.

## Objetivo del proyecto

El objetivo principal es ofrecer una herramienta digital académica y operativa que permita gestionar las operaciones bibliotecarias básicas en un solo lugar, simplificando:

- el registro y edición de libros
- la administración de usuarios
- el control de préstamos y devoluciones
- la visualización de métricas de uso

## Tecnologías utilizadas

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- @libsql/client
- dotenv
- cors

### Base de datos
- Turso / LibSQL

### Despliegue
- Vercel

## Estructura de carpetas del proyecto

```
Final-Biblioteca/
├── README.MD
├── Sprints.md
├── index.html
├── package.json
├── vercel.json
├── backend/
│   ├── package.json
│   └── server.js
├── css/
│   ├── Encabezado.css
│   ├── libros.css
│   ├── prestamos.css
│   ├── styles.css
│   └── usuarios.css
├── html/
│   ├── encabezado.html
│   ├── index.html
│   ├── libros.html
│   ├── prestamos.html
│   └── usuarios.html
├── img/
└── js/
    ├── header.js
    ├── libros.js
    ├── prestamos.js
    ├── script.js
    └── usuarios.js
```

## Explicación de cada carpeta y archivo principal

### Archivos de raíz
- `README.MD`: Documentación del proyecto.
- `Sprints.md`: Documento del plan de desarrollo por sprints.
- `index.html`: Página principal del frontend que actúa como landing.
- `package.json`: Archivo de configuración de npm para ejecución del proyecto.
- `vercel.json`: Configuración de despliegue en Vercel.

### Carpeta `backend/`
- `backend/server.js`: Servidor Express que define las rutas API y la conexión con Turso.
- `backend/package.json`: Dependencias del backend usadas por Node.js.

### Carpeta `css/`
- `css/Encabezado.css`: Estilos del encabezado compartido.
- `css/styles.css`: Estilos generales de la interfaz.
- `css/libros.css`: Estilos del módulo de libros.
- `css/usuarios.css`: Estilos del módulo de usuarios.
- `css/prestamos.css`: Estilos del módulo de préstamos.

### Carpeta `html/`
- `html/index.html`: Página de inicio del sistema dentro del sitio estático.
- `html/libros.html`: Página de gestión de libros.
- `html/usuarios.html`: Página de gestión de usuarios.
- `html/prestamos.html`: Página de control de préstamos.
- `html/encabezado.html`: Fragmento HTML del encabezado compartido por las páginas.

### Carpeta `js/`
- `js/header.js`: Carga dinámica del encabezado en todas las páginas.
- `js/libros.js`: Lógica de frontend para el módulo de libros.
- `js/usuarios.js`: Lógica de frontend para el módulo de usuarios.
- `js/prestamos.js`: Lógica de frontend para el módulo de préstamos.
- `js/script.js`: Funcionalidades de la página principal, gráficos de libros más leídos y comentarios.

## Módulos del sistema

### Página principal

La página principal ofrece:

- una introducción al sistema
- acceso rápido a los módulos principales
- un gráfico de los libros más leídos
- un formulario de comentarios para usuarios

### Gestión de libros

La sección de libros permite:

- listar los libros registrados
- crear nuevos libros
- editar libros existentes
- eliminar libros
- ver el estado de ejemplares (disponible/prestado)

El frontend usa `js/libros.js` y consume la API `/libros`.

### Gestión de usuarios

La sección de usuarios permite:

- listar usuarios registrados
- registrar nuevos usuarios
- activar o desactivar usuarios
- buscar usuarios por nombre o correo

El frontend usa `js/usuarios.js` y consume las rutas `/usuarios` y `/usuarios-activos`.

### Control de préstamos

El módulo de préstamos permite:

- registrar nuevos préstamos
- seleccionar usuarios activos y libros disponibles
- controlar fechas de préstamo y devolución estimada
- marcar devoluciones y liberar ejemplares
- filtrar préstamos por estado

El frontend usa `js/prestamos.js` y consume las rutas `/prestamos`, `/usuarios-activos` y `/ejemplares-disponibles`.

### Libros más leídos

Este módulo se presenta como un ranking en la página principal. Está construido con datos obtenidos de la ruta `/libros-mas-leidos` y muestra:

- título y autor del libro
- cantidad de préstamos
- barra de progreso proporcional al libro más prestado

### Comentarios

La sección de comentarios en la página principal permite a los usuarios:

- enviar un nombre
- escribir un comentario
- ver opiniones recientes

Los comentarios se almacenan en `localStorage` del navegador. 

> Pendiente por implementar: persistencia de comentarios en backend.

## Funcionamiento del frontend

El frontend está construido con páginas HTML estáticas y JavaScript que interactúa con la API del backend. Las principales características son:

- carga dinámica del encabezado mediante `js/header.js`
- consumo de la API con Fetch API y async/await
- renderizado de tablas y listas según los datos recibidos
- formularios de creación y edición
- búsqueda y filtrado dinámico en libros, usuarios y préstamos
- visualización de métricas en el dashboard principal
- almacenamiento local de comentarios en `localStorage`

## Funcionamiento del backend

El backend se ejecuta en Node.js con Express y funciona como middleware entre el frontend y Turso. Su comportamiento principal incluye:

- habilitar CORS para permitir solicitudes desde el frontend
- parsear cuerpos JSON en las solicitudes
- conectar con Turso mediante `@libsql/client`
- definir rutas REST para libros, usuarios y préstamos
- actualizar estados de ejemplares durante préstamos y devoluciones
- manejar errores con respuestas HTTP adecuadas

El servidor se define en `backend/server.js` y, al desplegarse en Vercel, se utiliza como función serverless.

## Explicación de las rutas API

### `/libros`
- `GET /libros`: obtiene todos los libros con datos del ejemplar vinculado, categoría y estado.
- `POST /libros`: crea un libro nuevo y un ejemplar asociado con código único.
- `PUT /libros/:id`: actualiza los datos del libro y el estado del ejemplar.
- `DELETE /libros/:id`: elimina el libro, sus ejemplares y los préstamos relacionados.

### `/usuarios`
- `GET /usuarios`: obtiene todos los usuarios registrados.
- `POST /usuarios`: registra un nuevo usuario.
- `DELETE /usuarios/:id`: elimina un usuario.
- `PUT /usuarios/:id/desactivar`: cambia el estado de un usuario a `inactivo`.
- `PUT /usuarios/:id/activar`: cambia el estado de un usuario a `activo`.

### `/prestamos`
- `GET /prestamos`: obtiene todos los préstamos con nombre de usuario, libro y estado.
- `POST /prestamos`: registra un nuevo préstamo y actualiza el ejemplar a `prestado`.
- `PUT /prestamos/:id/devolver`: marca el préstamo como `devuelto`, registra la fecha real de devolución y actualiza el ejemplar a `disponible`.

### `/usuarios-activos`
- `GET /usuarios-activos`: obtiene los usuarios cuyo estado es `activo`. Esta ruta es usada para seleccionar usuarios válidos al crear un préstamo.

### `/ejemplares-disponibles`
- `GET /ejemplares-disponibles`: obtiene los ejemplares con estado `disponible`. Se utiliza para seleccionar los libros que pueden prestarse.

### `/libros-mas-leidos`
- `GET /libros-mas-leidos`: obtiene los libros con mayor número de préstamos para generar el ranking de la página principal.

## Explicación de la conexión con Turso

La conexión con Turso se realiza en `backend/server.js` con el cliente `@libsql/client`. El servidor utiliza las variables de entorno para establecer la URL y el token de autenticación. Las consultas SQL se ejecutan sobre la base de datos Turso y permiten:

- recuperar libros, usuarios y préstamos
- insertar nuevos registros
- actualizar estados de ejemplares y préstamos
- eliminar datos relacionados

## Variables de entorno necesarias

El proyecto requiere las siguientes variables de entorno:

```env
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
PORT=3000
```

- `TURSO_DATABASE_URL`: URL de conexión a la base de datos Turso.
- `TURSO_AUTH_TOKEN`: token de autenticación para Turso.
- `PORT`: puerto opcional para ejecutar el servidor local.

## Pasos para instalar el proyecto localmente

1. Clonar el repositorio en su equipo.
2. Abrir una terminal en el directorio `Final-Biblioteca`.
3. Ejecutar:

```bash
npm install
```

4. Crear un archivo `.env` con las variables de entorno necesarias.
5. Ejecutar el proyecto:

```bash
npm start
```

6. Abrir el navegador en:

```text
http://localhost:3000
```

## Pasos para ejecutar el backend

1. Abrir terminal en el directorio `Final-Biblioteca`.
2. Instalar dependencias si no se ha hecho aún:

```bash
npm install
```

3. Ejecutar el servidor:

```bash
npm start
```

4. Verificar que el backend responde en la ruta raíz:

```bash
curl http://localhost:3000/
```

## Pasos para desplegar en Vercel

1. Crear una cuenta en Vercel si no está registrada.
2. Conectar el repositorio de GitHub a Vercel.
3. Asegurarse de que `vercel.json` esté presente en la raíz del proyecto.
4. Configurar las variables de entorno en el panel de Vercel:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `PORT` (opcional)
5. Desplegar el proyecto desde Vercel.

> Nota: la configuración de `vercel.json` asocia las rutas del frontend y el backend con `backend/server.js`.

## Recomendaciones importantes

- No subir el archivo `.env` al repositorio.
- No subir la carpeta `node_modules`.
- No incluir credenciales ni tokens en el código fuente.
- Revisar que las variables en Vercel coincidan con las usadas localmente.
- Comprobar que la ruta `/libros-mas-leidos` funciona antes de usar el gráfico de la página principal.

## Posibles mejoras futuras

- Implementar autenticación y permisos de usuario.
- Persistir la sección de comentarios en el backend en lugar de `localStorage`.
- Añadir pruebas automáticas para frontend y backend.
- Mejorar la validación de datos en el frontend y el backend.
- Agregar un flujo de registro y login para el personal de la biblioteca.
- Generar reportes descargables y estadísticas avanzadas.

## Créditos

- Maria Estefany Piedrahita Monsalve
- Mateo Jimenez Duque

