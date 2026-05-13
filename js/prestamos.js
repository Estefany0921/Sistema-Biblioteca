const API_PRESTAMOS = "https://biblioteca-backend.onrender.com/prestamos";
const API_USUARIOS_ACTIVOS = "https://biblioteca-backend.onrender.com/usuarios-activos";
const API_EJEMPLARES_DISPONIBLES = "https://biblioteca-backend.onrender.com/ejemplares-disponibles";

let allPrestamos = [];

document.addEventListener("DOMContentLoaded", () => {
  cargarPrestamos();
  cargarUsuariosActivos();
  cargarEjemplaresDisponibles();
});


/* UTILIDADES */

function fmtFecha(f) {
  if (!f) return "—";

  return new Date(f).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function esVencida(fecha, estado) {
  if (estado === "devuelto") return false;
  return fecha && new Date(fecha) < new Date();
}

function iniciales(nombre) {
  if (!nombre) return "?";

  return nombre
    .split(" ")
    .slice(0, 2)
    .map(p => p[0])
    .join("")
    .toUpperCase();
}

function badgeClass(estado) {
  return {
    activo: "b-activo",
    devuelto: "b-devuelto",
    vencido: "b-vencido",
    renovado: "b-renovado"
  }[estado] || "b-activo";
}

function badgeLabel(estado) {
  return {
    activo: "En curso",
    devuelto: "Devuelto",
    vencido: "Vencido",
    renovado: "Renovado"
  }[estado] || estado;
}


/* CARGAR DATOS DESDE TURSO */

async function cargarPrestamos() {
  try {
    const respuesta = await fetch(API_PRESTAMOS);
    allPrestamos = await respuesta.json();

    renderTable(allPrestamos);
    updateStats(allPrestamos);
  } catch (error) {
    console.error("Error al cargar préstamos:", error);
    showToast("No se pudo cargar la lista de préstamos.", "error");
  }
}

async function cargarUsuariosActivos() {
  try {
    const respuesta = await fetch(API_USUARIOS_ACTIVOS);
    const usuarios = await respuesta.json();

    const selectUsuario = document.getElementById("in-usuario");

    selectUsuario.innerHTML = `
      <option value="">Seleccione un usuario</option>
    `;

    usuarios.forEach(usuario => {
      selectUsuario.innerHTML += `
        <option value="${usuario.id}">
          ${usuario.nombre} - ${usuario.documento || "Sin documento"}
        </option>
      `;
    });
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
    showToast("No se pudieron cargar los usuarios.", "error");
  }
}

async function cargarEjemplaresDisponibles() {
  try {
    const respuesta = await fetch(API_EJEMPLARES_DISPONIBLES);
    const ejemplares = await respuesta.json();

    const selectEjemplar = document.getElementById("in-ejemplar");

    selectEjemplar.innerHTML = `
      <option value="">Seleccione un libro disponible</option>
    `;

    ejemplares.forEach(ejemplar => {
      selectEjemplar.innerHTML += `
        <option value="${ejemplar.ejemplar_id}">
          ${ejemplar.titulo} - ${ejemplar.autor || "Sin autor"} (${ejemplar.codigo})
        </option>
      `;
    });
  } catch (error) {
    console.error("Error al cargar ejemplares:", error);
    showToast("No se pudieron cargar los libros disponibles.", "error");
  }
}


/* MOSTRAR TABLA */

function renderTable(list) {
  document.getElementById("toolbar-count").textContent =
    `${list.length} registro${list.length !== 1 ? "s" : ""}`;

  const tbody = document.getElementById("prestamos-tbody");

  if (!list.length) {
    tbody.innerHTML = emptyHTML(
      "Sin resultados",
      "No hay préstamos registrados o no coinciden con el filtro."
    );
    return;
  }

  tbody.innerHTML = list.map((p, idx) => {
    const vencida = esVencida(p.fecha_devolucion_estimada, p.estado);
    const emoji = ["📗", "📘", "📕", "📙", "📒"][idx % 5];
    const devClase = vencida ? "fecha-vencida" : "td-small";

    const mostrarDevolver =
      p.estado === "activo" ||
      p.estado === "vencido" ||
      p.estado === "renovado";

    return `
      <tr>
        <td>
          <div class="libro-cell">
            <div class="libro-icon">${emoji}</div>
            <div>
              <div class="l-title">${p.libro || "Sin título"}</div>
              <div class="l-author">${p.autor || "Sin autor"}</div>
            </div>
          </div>
        </td>

        <td class="td-muted">
          <span class="avatar-sm">${iniciales(p.usuario)}</span>
          ${p.usuario || "Sin usuario"}
        </td>

        <td class="td-small">${fmtFecha(p.fecha_prestamo)}</td>

        <td class="${devClase}">
          ${fmtFecha(p.fecha_devolucion_estimada)}${vencida ? " ⚠" : ""}
        </td>

        <td>
          <span class="badge ${badgeClass(p.estado)}">
            <span class="bdot"></span>
            ${badgeLabel(p.estado)}
          </span>
        </td>

        <td>
          ${
            mostrarDevolver
              ? `<button class="btn-action devolver" onclick="marcarDevuelto(${p.id}, ${p.ejemplar_id})">
                  Devolver
                </button>`
              : `<span style="font-size:12px;color:var(--text-3)">—</span>`
          }
        </td>
      </tr>
    `;
  }).join("");
}

function emptyHTML(title, desc) {
  return `
    <tr>
      <td colspan="6">
        <div class="empty-state">
          <div class="empty-title">${title}</div>
          <div class="empty-desc">${desc}</div>
        </div>
      </td>
    </tr>
  `;
}


/* ESTADÍSTICAS */

function updateStats(list) {
  document.getElementById("stat-total").textContent = list.length;

  document.getElementById("stat-activo").textContent =
    list.filter(p => p.estado === "activo" || p.estado === "renovado").length;

  document.getElementById("stat-devuelto").textContent =
    list.filter(p => p.estado === "devuelto").length;

  document.getElementById("stat-vencido").textContent =
    list.filter(p => p.estado === "vencido").length;
}


/* FILTROS */

function filterTable() {
  const q = document.getElementById("search-box").value.toLowerCase().trim();
  const estado = document.getElementById("filter-estado").value;

  let filtered = allPrestamos;

  if (estado) {
    filtered = filtered.filter(p => p.estado === estado);
  }

  if (q) {
    filtered = filtered.filter(p =>
      (p.libro || "").toLowerCase().includes(q) ||
      (p.autor || "").toLowerCase().includes(q) ||
      (p.usuario || "").toLowerCase().includes(q)
    );
  }

  renderTable(filtered);
}


/* DEVOLVER PRÉSTAMO */

async function marcarDevuelto(id, ejemplarId) {
  const confirmar = confirm("¿Deseas marcar este préstamo como devuelto?");

  if (!confirmar) return;

  try {
    const respuesta = await fetch(`${API_PRESTAMOS}/${id}/devolver`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ejemplar_id: ejemplarId
      })
    });

    if (!respuesta.ok) {
      throw new Error("Error al marcar como devuelto");
    }

    showToast("Préstamo marcado como devuelto.", "success");

    cargarPrestamos();
    cargarEjemplaresDisponibles();
  } catch (error) {
    console.error("Error al devolver préstamo:", error);
    showToast("No se pudo marcar como devuelto.", "error");
  }
}


/* MODAL */

function openModal() {
  const hoy = new Date();
  const dev = new Date();

  dev.setDate(dev.getDate() + 14);

  document.getElementById("in-fecha-prestamo").value =
    hoy.toISOString().slice(0, 10);

  document.getElementById("in-fecha-devolucion").value =
    dev.toISOString().slice(0, 10);

  document.getElementById("modal-overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
  document.body.style.overflow = "";
  clearForm();
}

function handleOverlayClick(e) {
  if (e.target.id === "modal-overlay") closeModal();
}

function clearForm() {
  document.getElementById("in-ejemplar").value = "";
  document.getElementById("in-usuario").value = "";
  document.getElementById("in-fecha-prestamo").value = "";
  document.getElementById("in-fecha-devolucion").value = "";
  document.getElementById("in-estado").value = "activo";

  const observaciones = document.getElementById("in-observaciones");
  if (observaciones) observaciones.value = "";
}


/* GUARDAR PRÉSTAMO */

async function savePrestamo() {
  const ejemplar_id = document.getElementById("in-ejemplar").value;
  const usuario_id = document.getElementById("in-usuario").value;
  const fecha_prestamo = document.getElementById("in-fecha-prestamo").value;
  const fecha_devolucion_estimada = document.getElementById("in-fecha-devolucion").value;
  const estado = document.getElementById("in-estado").value;
  const observaciones =
    document.getElementById("in-observaciones")?.value.trim() || "";

  if (!ejemplar_id || !usuario_id || !fecha_prestamo || !fecha_devolucion_estimada) {
    showToast("Completa los campos obligatorios.", "error");
    return;
  }

  const prestamo = {
    usuario_id,
    ejemplar_id,
    fecha_prestamo,
    fecha_devolucion_estimada,
    estado,
    observaciones
  };

  try {
    const respuesta = await fetch(API_PRESTAMOS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(prestamo)
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      showToast(data.error || "Error al guardar préstamo.", "error");
      return;
    }

    showToast("Préstamo registrado correctamente.", "success");
    closeModal();

    cargarPrestamos();
    cargarEjemplaresDisponibles();
  } catch (error) {
    console.error("Error al guardar préstamo:", error);
    showToast("No se pudo conectar con el backend.", "error");
  }
}


/* TOAST */

function showToast(msg, type = "success") {
  const t = document.getElementById("toast");

  t.textContent = msg;
  t.className = `toast ${type} show`;

  setTimeout(() => {
    t.className = "toast";
  }, 3200);
}