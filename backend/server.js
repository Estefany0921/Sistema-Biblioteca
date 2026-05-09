import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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