fetch('/html/encabezado.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('header-placeholder').innerHTML = html;

    const links = document.querySelectorAll('.nav-link');
    
    links.forEach(link => {
      link.classList.remove('active'); // limpia cualquier active primero
      
      const linkHref = link.getAttribute('href');
      
      if (window.location.pathname.includes(linkHref.replace('/html/', ''))) {
        link.classList.add('active');
      }
    });
  });