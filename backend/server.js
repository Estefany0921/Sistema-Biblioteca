import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@libsql/client";
import path from "path";
import { fileURLToPath } from "url";

import dotenv from "dotenv";
import { createClient } from "@libsql/client";
import cors from "cors";

app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
});
dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
app.get("/", (req, res) => {
  res.send("Backend de Biblioteca funcionando");
});

/* MOSTRAR LIBROS */
app.get("/libros", async (req, res) => {
  try {
    const resultado = await db.execute(`
      SELECT 
        l.id AS libro_id,
        l.titulo,
        l.autor,
        l.anio_publicacion,
        c.nombre AS categoria,
        e.id AS ejemplar_id,
        e.codigo AS codigo_ejemplar,
        e.estado
      FROM libros l
      LEFT JOIN categorias c ON l.categoria_id = c.id
      LEFT JOIN ejemplares e ON e.id = (
        SELECT MIN(id) 
        FROM ejemplares 
        WHERE libro_id = l.id
      )
      ORDER BY l.id DESC
    `);

    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al consultar libros" });
  }
});

/* REGISTRAR LIBRO */
app.post("/libros", async (req, res) => {
  try {
    const { titulo, autor, categoria_id, anio_publicacion, estado } = req.body;

    if (!titulo || !autor || !categoria_id || !anio_publicacion || !estado) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const libroInsertado = await db.execute({
      sql: `
        INSERT INTO libros 
        (titulo, autor, categoria_id, anio_publicacion)
        VALUES (?, ?, ?, ?)
        RETURNING id
      `,
      args: [titulo, autor, categoria_id, anio_publicacion],
    });

    const libroId = libroInsertado.rows[0].id;
    const codigoEjemplar = `LIB-${String(libroId).padStart(3, "0")}`;

    await db.execute({
      sql: `
        INSERT INTO ejemplares
        (libro_id, codigo, estado, ubicacion)
        VALUES (?, ?, ?, ?)
      `,
      args: [libroId, codigoEjemplar, estado, "Sin ubicación"],
    });

    res.json({ mensaje: "Libro registrado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar libro" });
  }
});

/* EDITAR LIBRO */
app.put("/libros/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, autor, categoria_id, anio_publicacion, estado, ejemplar_id } = req.body;

    if (!titulo || !autor || !categoria_id || !anio_publicacion || !estado) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    await db.execute({
      sql: `
        UPDATE libros
        SET titulo = ?, autor = ?, categoria_id = ?, anio_publicacion = ?
        WHERE id = ?
      `,
      args: [titulo, autor, categoria_id, anio_publicacion, id],
    });

    if (ejemplar_id) {
      await db.execute({
        sql: `
          UPDATE ejemplares
          SET estado = ?
          WHERE id = ?
        `,
        args: [estado, ejemplar_id],
      });
    } else {
      await db.execute({
        sql: `
          UPDATE ejemplares
          SET estado = ?
          WHERE libro_id = ?
        `,
        args: [estado, id],
      });
    }

    res.json({ mensaje: "Libro actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al editar libro" });
  }
});

/* ELIMINAR LIBRO */
app.delete("/libros/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute({
      sql: `
        DELETE FROM prestamos
        WHERE ejemplar_id IN (
          SELECT id FROM ejemplares WHERE libro_id = ?
        )
      `,
      args: [id],
    });

    await db.execute({
      sql: "DELETE FROM ejemplares WHERE libro_id = ?",
      args: [id],
    });

    await db.execute({
      sql: "DELETE FROM libros WHERE id = ?",
      args: [id],
    });

    res.json({ mensaje: "Libro eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar libro" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
/* ============================
   RUTAS DE USUARIOS
   ============================ */

/* MOSTRAR USUARIOS */
app.get("/usuarios", async (req, res) => {
  try {
    const resultado = await db.execute(`
      SELECT id, nombre, documento, email, telefono, direccion, estado
      FROM usuarios
      ORDER BY id DESC
    `);

    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al consultar usuarios:", error);
    res.status(500).json({ error: "Error al consultar usuarios" });
  }
});

/* REGISTRAR USUARIO */
app.post("/usuarios", async (req, res) => {
  try {
    const { nombre, documento, email, telefono, direccion, estado } = req.body;

    if (!nombre || !documento) {
      return res.status(400).json({ error: "Nombre y documento son obligatorios" });
    }

    await db.execute({
      sql: `
        INSERT INTO usuarios
        (nombre, documento, email, telefono, direccion, estado)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [
        nombre,
        documento,
        email || "",
        telefono || "",
        direccion || "",
        estado || "activo"
      ],
    });

    res.json({ mensaje: "Usuario registrado correctamente" });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

/* ELIMINAR USUARIO */
app.delete("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute({
      sql: "DELETE FROM usuarios WHERE id = ?",
      args: [id],
    });

    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});
/* DESACTIVAR USUARIO */
app.put("/usuarios/:id/desactivar", async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute({
      sql: `
        UPDATE usuarios
        SET estado = 'inactivo'
        WHERE id = ?
      `,
      args: [id],
    });

    res.json({ mensaje: "Usuario desactivado correctamente" });
  } catch (error) {
    console.error("Error al desactivar usuario:", error);
    res.status(500).json({ error: "Error al desactivar usuario" });
  }
});
/* ACTIVAR USUARIO */
app.put("/usuarios/:id/activar", async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute({
      sql: `
        UPDATE usuarios
        SET estado = 'activo'
        WHERE id = ?
      `,
      args: [id],
    });

    res.json({ mensaje: "Usuario activado correctamente" });
  } catch (error) {
    console.error("Error al activar usuario:", error);
    res.status(500).json({ error: "Error al activar usuario" });
  }
});
/* ============================
   RUTAS DE PRÉSTAMOS
   ============================ */

/* MOSTRAR PRÉSTAMOS */
app.get("/prestamos", async (req, res) => {
  try {
    const resultado = await db.execute(`
      SELECT 
        p.id,
        p.usuario_id,
        p.ejemplar_id,
        p.fecha_prestamo,
        p.fecha_devolucion_estimada,
        p.fecha_devolucion_real,
        p.estado,
        p.observaciones,
        u.nombre AS usuario,
        l.titulo AS libro,
        l.autor AS autor,
        e.codigo AS codigo_ejemplar
      FROM prestamos p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      INNER JOIN ejemplares e ON p.ejemplar_id = e.id
      INNER JOIN libros l ON e.libro_id = l.id
      ORDER BY p.id DESC
    `);

    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al consultar préstamos:", error);
    res.status(500).json({ error: "Error al consultar préstamos" });
  }
});


/* CARGAR USUARIOS ACTIVOS PARA EL SELECT */
app.get("/usuarios-activos", async (req, res) => {
  try {
    const resultado = await db.execute(`
      SELECT id, nombre, documento
      FROM usuarios
      WHERE estado = 'activo'
      ORDER BY nombre ASC
    `);

    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al consultar usuarios activos:", error);
    res.status(500).json({ error: "Error al consultar usuarios activos" });
  }
});


/* CARGAR EJEMPLARES DISPONIBLES PARA EL SELECT */
app.get("/ejemplares-disponibles", async (req, res) => {
  try {
    const resultado = await db.execute(`
      SELECT 
        e.id AS ejemplar_id,
        e.codigo,
        e.estado,
        l.titulo,
        l.autor
      FROM ejemplares e
      INNER JOIN libros l ON e.libro_id = l.id
      WHERE e.estado = 'disponible'
      ORDER BY l.titulo ASC
    `);

    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al consultar ejemplares disponibles:", error);
    res.status(500).json({ error: "Error al consultar ejemplares disponibles" });
  }
});


/* REGISTRAR PRÉSTAMO */
app.post("/prestamos", async (req, res) => {
  try {
    const {
      usuario_id,
      ejemplar_id,
      fecha_prestamo,
      fecha_devolucion_estimada,
      estado,
      observaciones
    } = req.body;

    if (!usuario_id || !ejemplar_id || !fecha_prestamo || !fecha_devolucion_estimada) {
      return res.status(400).json({ error: "Faltan datos obligatorios del préstamo" });
    }

    await db.execute({
      sql: `
        INSERT INTO prestamos
        (
          usuario_id,
          ejemplar_id,
          fecha_prestamo,
          fecha_devolucion_estimada,
          fecha_devolucion_real,
          estado,
          observaciones
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        usuario_id,
        ejemplar_id,
        fecha_prestamo,
        fecha_devolucion_estimada,
        null,
        estado || "activo",
        observaciones || ""
      ]
    });

    await db.execute({
      sql: `
        UPDATE ejemplares
        SET estado = 'prestado'
        WHERE id = ?
      `,
      args: [ejemplar_id]
    });

    res.json({ mensaje: "Préstamo registrado correctamente" });
  } catch (error) {
    console.error("Error al registrar préstamo:", error);
    res.status(500).json({ error: "Error al registrar préstamo" });
  }
});


/* MARCAR PRÉSTAMO COMO DEVUELTO */
app.put("/prestamos/:id/devolver", async (req, res) => {
  try {
    const { id } = req.params;
    const { ejemplar_id } = req.body;

    const fechaHoy = new Date().toISOString().slice(0, 10);

    await db.execute({
      sql: `
        UPDATE prestamos
        SET estado = 'devuelto',
            fecha_devolucion_real = ?
        WHERE id = ?
      `,
      args: [fechaHoy, id]
    });

    await db.execute({
      sql: `
        UPDATE ejemplares
        SET estado = 'disponible'
        WHERE id = ?
      `,
      args: [ejemplar_id]
    });

    res.json({ mensaje: "Préstamo marcado como devuelto" });
  } catch (error) {
    console.error("Error al devolver préstamo:", error);
    res.status(500).json({ error: "Error al devolver préstamo" });
  }
});