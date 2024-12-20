document.addEventListener("DOMContentLoaded", function() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const placeholder = document.getElementById("map-placeholder");
        const container = document.getElementById("map-container");

        const iframe = document.createElement("iframe");
        iframe.className = "embed-responsive-item";
        iframe.width = "600";
        iframe.height = "450";
        iframe.title = "Ubicación de Estudio Lopez Giacomelli";
        iframe.src =
          "https://www.google.com/maps/embed/v1/place?key=AIzaSyCBnbJSzvWXNxYB6hL9shNllVt5qMP-3ZU&q=Estudio+Lopez+Giacomelli,+Ciudad+de+Buenos+Aires&language=es";
        iframe.style = "position: relative; z-index: 1;";
        iframe.allowFullscreen = true;

        iframe.onload = () => (placeholder.style.display = "none");

        container.appendChild(iframe);
        observer.disconnect();
      }
    });
  });

  observer.observe(document.getElementById("map-container"));
});
