const API_LIBROS_MAS_LEIDOS = "/libros-mas-leidos";

document.addEventListener("DOMContentLoaded", () => {
  cargarLibrosMasLeidos();
});

async function cargarLibrosMasLeidos() {
  const chartContainer = document.getElementById("popularBooksChart");

  if (!chartContainer) return;

  try {
    const respuesta = await fetch(API_LIBROS_MAS_LEIDOS);

    if (!respuesta.ok) {
      throw new Error("Error al consultar libros más leídos");
    }

    const libros = await respuesta.json();

    renderLibrosMasLeidos(libros);
  } catch (error) {
    console.error("Error al cargar libros más leídos:", error);

    chartContainer.innerHTML = `
      <div class="chart-empty">
        No se pudieron cargar los libros más leídos.
      </div>
    `;
  }
}

function renderLibrosMasLeidos(libros) {
  const chartContainer = document.getElementById("popularBooksChart");

  if (!libros || libros.length === 0) {
    chartContainer.innerHTML = `
      <div class="chart-empty">
        Aún no hay préstamos registrados para generar el ranking.
      </div>
    `;
    return;
  }

  const maxPrestamos = Math.max(
    ...libros.map(libro => Number(libro.total_prestamos))
  );

  chartContainer.innerHTML = libros.map((libro, index) => {
    const total = Number(libro.total_prestamos);
    const porcentaje = maxPrestamos > 0 ? (total / maxPrestamos) * 100 : 0;

    return `
      <div class="popular-book-item">
        <div class="popular-book-info">
          <span class="popular-position">${index + 1}</span>

          <div>
            <h3>${libro.titulo || "Sin título"}</h3>
            <p>${libro.autor || "Sin autor"}</p>
          </div>
        </div>

        <div class="popular-book-bar-wrap">
          <div class="popular-book-bar" style="width: ${porcentaje}%"></div>
        </div>

        <span class="popular-book-count">
          ${total} préstamo${total !== 1 ? "s" : ""}
        </span>
      </div>
    `;
  }).join("");
}
/* ============================
   COMENTARIOS EN PÁGINA PRINCIPAL
   ============================ */

document.addEventListener("DOMContentLoaded", () => {
  const commentForm = document.getElementById("commentForm");
  const commentsList = document.getElementById("commentsList");

  let comentarios = JSON.parse(localStorage.getItem("comentariosBiblioteca")) || [];

  mostrarComentarios();

  if (commentForm) {
    commentForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const nombre = document.getElementById("commentName").value.trim();
      const texto = document.getElementById("commentText").value.trim();

      if (!nombre || !texto) {
        alert("Por favor escribe tu nombre y comentario.");
        return;
      }

      const nuevoComentario = {
        nombre,
        texto,
        fecha: new Date().toLocaleDateString("es-CO")
      };

      comentarios.unshift(nuevoComentario);

      localStorage.setItem("comentariosBiblioteca", JSON.stringify(comentarios));

      commentForm.reset();
      mostrarComentarios();
    });
  }

  function mostrarComentarios() {
    if (!commentsList) return;

    if (comentarios.length === 0) {
      commentsList.innerHTML = `
        <p class="comment-empty">Aún no hay comentarios registrados.</p>
      `;
      return;
    }

    commentsList.innerHTML = comentarios.map(comentario => `
      <div class="comment-item">
        <h4>${comentario.nombre}</h4>
        <p>${comentario.texto}</p>
        <span class="comment-date">${comentario.fecha}</span>
      </div>
    `).join("");
  }
});