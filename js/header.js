fetch("encabezado.html")
  .then(respuesta => respuesta.text())
  .then(data => {
    document.getElementById("header-placeholder").innerHTML = data;

    const paginaActual = window.location.pathname.split("/").pop();
    const enlaces = document.querySelectorAll(".nav-link");

    enlaces.forEach(enlace => {
      enlace.classList.remove("active");

      if (enlace.getAttribute("href") === paginaActual) {
        enlace.classList.add("active");
      }
    });
  })
  .catch(error => {
    console.error("Error cargando el encabezado:", error);
  });