const API_USUARIOS = "/usuarios";

let allUsers = [];

/* ============================
   CARGAR USUARIOS DESDE TURSO
   ============================ */

document.addEventListener("DOMContentLoaded", () => {
  cargarUsuarios();

  const searchBox = document.getElementById("search-box");

  if (searchBox) {
    searchBox.addEventListener("input", filterTable);
  }
});

async function cargarUsuarios() {
  try {
    const respuesta = await fetch(API_USUARIOS);

    if (!respuesta.ok) {
      throw new Error("Error al consultar usuarios");
    }

    allUsers = await respuesta.json();

    renderTable(allUsers);
    updateStats(allUsers);
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
    showToast("Error al cargar usuarios.", "error");
  }
}

/* ============================
   RENDER DE TABLA
   ============================ */

function renderTable(users) {
  document.getElementById("toolbar-count").textContent =
    `${users.length} registro${users.length !== 1 ? "s" : ""}`;

  const tbody = document.getElementById("users-tbody");

  if (!users.length) {
    tbody.innerHTML = emptyHTML(
      "Sin resultados",
      "No hay usuarios registrados o no coinciden con la búsqueda."
    );
    return;
  }

  tbody.innerHTML = users.map(u => {
    const partesNombre = (u.nombre || "").split(" ");
    const inicial1 = partesNombre[0]?.[0] || "";
    const inicial2 = partesNombre[1]?.[0] || "";
    const initials = `${inicial1}${inicial2}`.toUpperCase();

    const isActive = u.estado === "activo";

    return `
      <tr>
        <td>
          <div class="user-cell">
            <div class="avatar">${initials || "?"}</div>
            <div>
              <div class="u-name">${u.nombre || "Sin nombre"}</div>
              <div class="u-email">Documento: ${u.documento || "—"}</div>
            </div>
          </div>
        </td>

        <td class="td-muted">${u.email || "—"}</td>
        <td class="td-muted">${u.telefono || "—"}</td>

        <td>
          <span class="badge ${isActive ? "b-active" : "b-inactive"}">
            <span class="bdot"></span>
            ${isActive ? "Activo" : "Inactivo"}
          </span>
        </td>

        <td class="td-small">—</td>

        <td>
          ${
            u.estado === "activo"
              ? `<button class="btn-disable-user" onclick="desactivarUsuario(${u.id})">Desactivar</button>`
              : `<button class="btn-enable-user" onclick="activarUsuario(${u.id})">Activar</button>`
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
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" 
              stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <div class="empty-title">${title}</div>
          <div class="empty-desc">${desc}</div>
        </div>
      </td>
    </tr>
  `;
}

/* ============================
   ESTADÍSTICAS
   ============================ */

function updateStats(users) {
  const active = users.filter(u => u.estado === "activo").length;

  document.getElementById("stat-total").textContent = users.length;
  document.getElementById("stat-active").textContent = active;
  document.getElementById("stat-inactive").textContent = users.length - active;
}

/* ============================
   BUSCADOR POR NOMBRE O CORREO
   ============================ */

function filterTable() {
  const searchBox = document.getElementById("search-box");
  const q = searchBox.value.toLowerCase().trim();

  if (q === "") {
    renderTable(allUsers);
    return;
  }

  const filtered = allUsers.filter(u => {
    const nombre = String(u.nombre || "").toLowerCase();
    const email = String(u.email || "").toLowerCase();

    return (
      nombre.includes(q) ||
      email.includes(q)
    );
  });

  renderTable(filtered);
}

/* ============================
   MODAL
   ============================ */

function openModal() {
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
  [
    "in-nombre",
    "in-apellido",
    "in-documento",
    "in-correo",
    "in-direccion",
    "in-telefono"
  ].forEach(id => {
    const campo = document.getElementById(id);
    if (campo) campo.value = "";
  });

  document.getElementById("in-estado").value = "activo";
}

/* ============================
   GUARDAR USUARIO EN TURSO
   ============================ */

async function saveUser() {
  const nombre = document.getElementById("in-nombre").value.trim();
  const apellido = document.getElementById("in-apellido").value.trim();
  const documento = document.getElementById("in-documento").value.trim();
  const email = document.getElementById("in-correo").value.trim();
  const telefono = document.getElementById("in-telefono").value.trim();
  const estado = document.getElementById("in-estado").value;

  if (!nombre || !apellido || !documento) {
    showToast("Completa nombre, apellido y documento.", "error");
    return;
  }

  const usuario = {
    nombre: `${nombre} ${apellido}`,
    documento: documento,
    email: email,
    telefono: telefono,
    direccion: "",
    estado: estado
  };

  try {
    const respuesta = await fetch(API_USUARIOS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(usuario)
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      console.error(data);
      showToast(data.error || "Error al guardar usuario.", "error");
      return;
    }

    showToast("Usuario registrado correctamente.", "success");
    closeModal();

    await cargarUsuarios();

    const searchBox = document.getElementById("search-box");
    if (searchBox) searchBox.value = "";

  } catch (error) {
    console.error("Error en fetch:", error);
    showToast("No se pudo conectar con el backend.", "error");
  }
}

/* ============================
   ACTIVAR Y DESACTIVAR USUARIO
   ============================ */

async function desactivarUsuario(id) {
  const confirmar = confirm("¿Deseas desactivar este usuario?");

  if (!confirmar) return;

  try {
    const respuesta = await fetch(`${API_USUARIOS}/${id}/desactivar`, {
      method: "PUT"
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      showToast(data.error || "Error al desactivar usuario.", "error");
      return;
    }

    showToast("Usuario desactivado correctamente.", "success");
    await cargarUsuarios();

  } catch (error) {
    console.error("Error al desactivar usuario:", error);
    showToast("No se pudo conectar con el backend.", "error");
  }
}

async function activarUsuario(id) {
  const confirmar = confirm("¿Deseas activar este usuario?");

  if (!confirmar) return;

  try {
    const respuesta = await fetch(`${API_USUARIOS}/${id}/activar`, {
      method: "PUT"
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      showToast(data.error || "Error al activar usuario.", "error");
      return;
    }

    showToast("Usuario activado correctamente.", "success");
    await cargarUsuarios();

  } catch (error) {
    console.error("Error al activar usuario:", error);
    showToast("No se pudo conectar con el backend.", "error");
  }
}

/* ============================
   TOAST
   ============================ */

function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast ${type} show`;

  setTimeout(() => {
    t.className = "toast";
  }, 3200);
}