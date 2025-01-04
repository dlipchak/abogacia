function initCommentForm() {
  const alert = document.querySelector("#respond .alert-success");
  if (alert) alert.classList.add("d-none");

  const form = document.getElementById("commentform");
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }
}

function handleSubmit(e) {
  e.preventDefault();

  const form = e.target;
  form.classList.add("was-validated");

  if (form.checkValidity()) {
    const commentForm = {
      articleId: form.querySelector('input[name="ArticleId"]').value,
      parentCommentId: form.querySelector('input[name="ParentCommentId"]')
        .value,
      name: form.querySelector('input[name="Name"]').value,
      email: form.querySelector('input[name="Email"]').value,
      comment: form.querySelector('textarea[name="Comment"]').value,
    };

    sendCommentForm(commentForm, form);
  }
}

function clearForm(form) {
  if (form) {
    form.reset();
    form.classList.remove("was-validated");
  }
}

function showSuccessMessage() {
  const alert = document.querySelector("#respond .alert-success");
  if (alert) {
    alert.classList.remove("d-none");
    setTimeout(() => {
      alert.classList.add("d-none");
    }, 3000);
  }
}

async function sendCommentForm(commentForm, form) {
  try {
    const response = await fetch("/api/comments/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commentForm),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    clearForm(form);
    showSuccessMessage();
  } catch (error) {
    console.error("Error sending comment:", error);

    const alert = document.querySelector("#respond .alert-success");
    if (alert) {
      alert.classList.remove("alert-success");
      alert.classList.add("alert-danger");
      alert.innerHTML =
        "Hubo un error al enviar el comentario. Por favor, intente nuevamente más tarde.";
      alert.classList.remove("d-none");
    }
  }
}

document.addEventListener("DOMContentLoaded", initCommentForm);
