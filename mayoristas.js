const wholesaleForm = document.querySelector("#wholesale-form");
const wholesaleStatus = document.querySelector("#wholesale-status");
const wholesaleEndpoint = "";

wholesaleForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!wholesaleForm.checkValidity()) {
    wholesaleForm.reportValidity();
    return;
  }

  const formData = Object.fromEntries(new FormData(wholesaleForm).entries());
  const submitButton = wholesaleForm.querySelector("button[type='submit']");

  if (!wholesaleEndpoint) {
    wholesaleStatus.textContent = "Solicitud validada. Falta conectar el endpoint de leads para enviarla al equipo de Lilis.";
    return;
  }

  submitButton.disabled = true;
  wholesaleStatus.textContent = "Enviando solicitud...";

  try {
    const response = await fetch(wholesaleEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error("Lead request failed");
    }

    wholesaleForm.reset();
    wholesaleStatus.textContent = "Gracias. El equipo de Lilis se pondrá en contacto contigo.";
  } catch {
    wholesaleStatus.textContent = "No se pudo enviar la solicitud. Intenta de nuevo más tarde.";
  } finally {
    submitButton.disabled = false;
  }
});
