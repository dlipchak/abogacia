function initContactForm() {
  const alert = document.querySelector(".alert-success");
  if (alert) alert.classList.add("d-none");

  const form = document.getElementById("template-contactform");
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }
}

function handleSubmit(e) {
  e.preventDefault();

  const form = e.target;
  form.classList.add("was-validated");

  if (form.checkValidity()) {
    const spinner = document.querySelector(".form-process");
    if (spinner) spinner.style.display = "block";

    const contactForm = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      subject: document.getElementById("subject").value,
      message: document.getElementById("message").value,
    };

    sendContactForm(contactForm, spinner, form);
  }
}

function getValidationMessage(field) {
  if (field.validity.valueMissing) {
    switch (field.id) {
      case "name":
        return "Por favor, ingrese su nombre";
      case "email":
        return "Por favor, ingrese su email";
      case "subject":
        return "Por favor, ingrese el asunto";
      case "message":
        return "Por favor, ingrese su mensaje";
      default:
        return "Este campo es obligatorio";
    }
  }

  if (field.validity.typeMismatch && field.type === "email") {
    return "Por favor, ingrese un email válido";
  }

  return "";
}

function clearForm(form) {
  if (form) {
    form.reset();
    form.classList.remove("was-validated");
  }
}

function showSuccessMessage() {
  const alert = document.querySelector(".alert-success");
  if (alert) {
    alert.classList.remove("d-none");
    setTimeout(() => {
      alert.classList.add("d-none");
    }, 3000);
  }
}

async function sendContactForm(contactForm, spinner, form) {
  try {
    const response = await fetch("/Contacto/SendEmail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactForm),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (spinner) spinner.style.display = "none";
    clearForm(form);
    showSuccessMessage();
  } catch (error) {
    console.error("Error sending form:", error);
    if (spinner) spinner.style.display = "none";

    const alert = document.querySelector(".alert-success");
    if (alert) {
      alert.classList.remove("alert-success");
      alert.classList.add("alert-danger");
      alert.innerHTML = `
                Hubo un error al enviar el mensaje. 
                <br>
                Por favor, intente contactarnos vía 
                <a href="https://wa.me/541161980179" target="_blank" class="alert-link">
                    WhatsApp <i class="bi-whatsapp"></i>
                </a>
            `;
      alert.classList.remove("d-none");
    }
  }
}

document.addEventListener("DOMContentLoaded", initContactForm);
