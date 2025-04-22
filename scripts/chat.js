import { getGeminiResponse } from './gemini.js';

document.addEventListener("DOMContentLoaded", () => {
  const enviarBtn = document.getElementById("enviar");
  const mensajeInput = document.getElementById("mensaje");
  const chatLog = document.getElementById("chat-log");

  enviarBtn.addEventListener("click", async () => {
    const mensaje = mensajeInput.value.trim();
    if (!mensaje) return;

    chatLog.innerHTML += `<p><strong>Tú:</strong> ${mensaje}</p>`;
    mensajeInput.value = "Pensando...";

    const respuesta = await getGeminiResponse(mensaje);

    chatLog.innerHTML += `<p><strong>Gemini:</strong> ${respuesta}</p>`;
    mensajeInput.value = "";
    chatLog.scrollTop = chatLog.scrollHeight;
  });
});
