const API_URL = "/libros";

const bookForm = document.getElementById("bookForm");
const booksBody = document.getElementById("booksBody");

const inputTitulo = document.getElementById("titulo");
const inputAutor = document.getElementById("autor");
const inputCategoria = document.getElementById("categoria");
const inputAnio = document.getElementById("anio");
const inputEstado = document.getElementById("estado");
const searchInput = document.querySelector(".search-input");

let librosGuardados = [];
let libroEditandoId = null;
let ejemplarEditandoId = null;

document.addEventListener("DOMContentLoaded", () => {
  cargarLibros();

  if (searchInput) {
    searchInput.addEventListener("input", buscarLibros);
  }
});

/* MOSTRAR LIBROS REGISTRADOS */
async function cargarLibros() {
  try {
    const respuesta = await fetch(API_URL);

    if (!respuesta.ok) {
      throw new Error("Error al consultar libros");
    }

    const libros = await respuesta.json();

    librosGuardados = libros;
    mostrarLibros(librosGuardados);

  } catch (error) {
    console.error("Error al cargar libros:", error);

    booksBody.innerHTML = `
      <tr>
        <td colspan="6">Error al cargar los libros.</td>
      </tr>
    `;
  }
}

/* PINTAR LIBROS EN LA TABLA */
function mostrarLibros(libros) {
  try {
    booksBody.innerHTML = "";

    if (!libros || libros.length === 0) {
      booksBody.innerHTML = `
        <tr>
          <td colspan="6">No se encontraron libros.</td>
        </tr>
      `;
      return;
    }

    libros.forEach((libro, index) => {
      const fila = document.createElement("tr");

      const estadoClase = libro.estado === "disponible" ? "available" : "borrowed";
      const estadoTexto = libro.estado === "disponible" ? "Disponible" : "Prestado";

      fila.innerHTML = `
        <td>${index + 1}</td>

        <td>
          <strong>${libro.titulo || "Sin título"}</strong>
          <span>${libro.autor || "Sin autor"}</span>
        </td>

        <td>${libro.categoria || "Sin categoría"}</td>

        <td>
          <span class="status ${estadoClase}">${estadoTexto}</span>
        </td>

        <td>${libro.anio_publicacion || "—"}</td>

        <td>
          <div class="action-buttons">
            <button class="btn-edit" type="button">Editar</button>
            <button class="btn-delete" type="button">Eliminar</button>
          </div>
        </td>
      `;

      const btnEditar = fila.querySelector(".btn-edit");
      const btnEliminar = fila.querySelector(".btn-delete");

      btnEditar.addEventListener("click", () => prepararEdicion(libro));
      btnEliminar.addEventListener("click", () => eliminarLibro(libro.libro_id));

      booksBody.appendChild(fila);
    });
  } catch (error) {
    console.error("Error al mostrar libros:", error);

    booksBody.innerHTML = `
      <tr>
        <td colspan="6">Error al cargar los libros.</td>
      </tr>
    `;
  }
}

/* BUSCAR LIBROS */
function buscarLibros() {
  const texto = searchInput.value.toLowerCase().trim();

  if (texto === "") {
    mostrarLibros(librosGuardados);
    return;
  }

  const librosFiltrados = librosGuardados.filter((libro) => {
    const titulo = String(libro.titulo || "").toLowerCase();
    const autor = String(libro.autor || "").toLowerCase();
    const categoria = String(libro.categoria || "").toLowerCase();
    const estado = String(libro.estado || "").toLowerCase();
    const anio = String(libro.anio_publicacion || "").toLowerCase();

    return (
      titulo.includes(texto) ||
      autor.includes(texto) ||
      categoria.includes(texto) ||
      estado.includes(texto) ||
      anio.includes(texto)
    );
  });

  mostrarLibros(librosFiltrados);
}

/* REGISTRAR O ACTUALIZAR LIBRO */
bookForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const libro = {
    titulo: inputTitulo.value.trim(),
    autor: inputAutor.value.trim(),
    categoria_id: inputCategoria.value,
    anio_publicacion: inputAnio.value,
    estado: inputEstado.value,
    ejemplar_id: ejemplarEditandoId,
  };

  if (!libro.titulo || !libro.autor || !libro.categoria_id || !libro.anio_publicacion || !libro.estado) {
    alert("Por favor complete todos los campos.");
    return;
  }

  try {
    if (libroEditandoId === null) {
      const respuesta = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(libro),
      });

      if (!respuesta.ok) {
        throw new Error("Error al registrar libro");
      }

      alert("Libro registrado correctamente.");
    } else {
      const respuesta = await fetch(`${API_URL}/${libroEditandoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(libro),
      });

      if (!respuesta.ok) {
        throw new Error("Error al actualizar libro");
      }

      alert("Libro actualizado correctamente.");

      libroEditandoId = null;
      ejemplarEditandoId = null;
      document.querySelector(".btn-save").textContent = "Guardar libro";
    }

    bookForm.reset();
    await cargarLibros();

    if (searchInput) {
      searchInput.value = "";
    }

  } catch (error) {
    console.error("Error al guardar libro:", error);
    alert("Ocurrió un error al guardar el libro.");
  }
});

/* PREPARAR EDICIÓN VISUAL */
function prepararEdicion(libro) {
  libroEditandoId = libro.libro_id;
  ejemplarEditandoId = libro.ejemplar_id;

  inputTitulo.value = libro.titulo || "";
  inputAutor.value = libro.autor || "";
  inputCategoria.value = obtenerCategoriaId(libro.categoria);
  inputAnio.value = libro.anio_publicacion || "";
  inputEstado.value = libro.estado || "";

  document.querySelector(".btn-save").textContent = "Actualizar libro";

  window.scrollTo({
    top: bookForm.offsetTop - 120,
    behavior: "smooth",
  });
}

/* ELIMINAR LIBRO */
async function eliminarLibro(id) {
  const confirmar = confirm("¿Está seguro de eliminar este libro?");

  if (!confirmar) return;

  try {
    const respuesta = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!respuesta.ok) {
      throw new Error("Error al eliminar libro");
    }

    alert("Libro eliminado correctamente.");
    await cargarLibros();

    if (searchInput) {
      searchInput.value = "";
    }

  } catch (error) {
    console.error("Error al eliminar libro:", error);
    alert("Ocurrió un error al eliminar el libro.");
  }
}

/* RELACIONAR CATEGORÍAS CON SUS ID */
function obtenerCategoriaId(nombreCategoria) {
  const categorias = {
    Literatura: "1",
    Ciencia: "2",
    Historia: "3",
    Tecnología: "4",
    Educación: "5",
  };

  return categorias[nombreCategoria] || "";
}