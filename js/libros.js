const API_URL = "http://localhost:3000/libros";

const bookForm = document.getElementById("bookForm");
const booksBody = document.getElementById("booksBody");

const inputTitulo = document.getElementById("titulo");
const inputAutor = document.getElementById("autor");
const inputCategoria = document.getElementById("categoria");
const inputAnio = document.getElementById("anio");
const inputEstado = document.getElementById("estado");

let libroEditandoId = null;
let ejemplarEditandoId = null;

document.addEventListener("DOMContentLoaded", () => {
  cargarLibros();
});

/* MOSTRAR LIBROS REGISTRADOS */
async function cargarLibros() {
  try {
    const respuesta = await fetch(API_URL);
    const libros = await respuesta.json();

    booksBody.innerHTML = "";

    if (libros.length === 0) {
      booksBody.innerHTML = `
        <tr>
          <td colspan="6">No hay libros registrados.</td>
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
          <strong>${libro.titulo}</strong>
          <span>${libro.autor}</span>
        </td>

        <td>${libro.categoria || "Sin categoría"}</td>

        <td>
          <span class="status ${estadoClase}">${estadoTexto}</span>
        </td>

        <td>${libro.anio_publicacion}</td>

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
    console.error(error);
    booksBody.innerHTML = `
      <tr>
        <td colspan="6">Error al cargar los libros.</td>
      </tr>
    `;
  }
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
      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(libro),
      });

      alert("Libro registrado correctamente.");
    } else {
      await fetch(`${API_URL}/${libroEditandoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(libro),
      });

      alert("Libro actualizado correctamente.");

      libroEditandoId = null;
      ejemplarEditandoId = null;
      document.querySelector(".btn-save").textContent = "Guardar libro";
    }

    bookForm.reset();
    cargarLibros();
  } catch (error) {
    console.error(error);
    alert("Ocurrió un error al guardar el libro.");
  }
});

/* PREPARAR EDICIÓN VISUAL */
function prepararEdicion(libro) {
  libroEditandoId = libro.libro_id;
  ejemplarEditandoId = libro.ejemplar_id;

  inputTitulo.value = libro.titulo;
  inputAutor.value = libro.autor;
  inputCategoria.value = obtenerCategoriaId(libro.categoria);
  inputAnio.value = libro.anio_publicacion;
  inputEstado.value = libro.estado;

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
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    alert("Libro eliminado correctamente.");
    cargarLibros();
  } catch (error) {
    console.error(error);
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