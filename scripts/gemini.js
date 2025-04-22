export async function getGeminiResponse(mensaje) {
  const API_KEY = "AIzaSyCf45-R56xzps4fwSqBnpc8u0Edv4vpFYU"; // reemplazalo con tu clave real

  const response = 
    {
      curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=GEMINI_API_KEY" \
      -H 'Content-Type: application/json' \
      -X POST \
      -d '{
        "contents": [{
          "parts":[{"text": "Explain how AI works"}]
          }]
     }'

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar respuesta.";
}
