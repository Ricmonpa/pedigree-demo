const fetch = require('node-fetch');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoData, mimeType, analysisType } = req.body;

    // Validar tamaño del payload (Vercel límite: ~4MB)
    const payloadSize = JSON.stringify(req.body).length;
    const maxSize = 4 * 1024 * 1024; // 4MB
    
    if (payloadSize > maxSize) {
      return res.status(413).json({ 
        success: false, 
        error: 'El archivo es demasiado grande. Por favor, usa un video más corto o de menor calidad.' 
      });
    }

    // Usar API key desde variable de entorno (SEGURA)
    const apiKey = analysisType === 'behavior' 
      ? process.env.GEMINI_API_KEY_BLABLAPET
      : process.env.GEMINI_API_KEY_PAWANALYTICS;

    if (!apiKey) {
      throw new Error('API key no configurada en variables de entorno');
    }

    const MODEL_NAME = 'gemini-2.0-flash';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

    let prompt;
    if (analysisType === 'behavior') {
      prompt = `Eres BlaBlaPet, un traductor emocional de perros. Analiza este video y genera subtítulos que expresen lo que el perro está "pensando" o "diciendo" emocionalmente.

INSTRUCCIONES:
1. Divide el video en segmentos de 3-7 segundos
2. Para cada segmento, genera un subtítulo emocional en primera persona (como si el perro hablara)
3. Sé expresivo, divertido y emotivo
4. Usa exclamaciones y emociones intensas

FORMATO JSON (responde SOLO con esto):
{
  "subtitles": [
    {
      "timestamp": "00:00 - 00:05",
      "traduccion_emocional": "¡Oh, qué es eso! ¡Huele delicioso, lo quiero ya!"
    },
    {
      "timestamp": "00:05 - 00:10",
      "traduccion_emocional": "¡Dame eso! ¡Por favor, por favor!"
    },
    {
      "timestamp": "00:10 - 00:15",
      "traduccion_emocional": "¡Sí! ¡Es para mí! ¡Qué felicidad!"
    }
  ]
}

IMPORTANTE: Genera al menos 3-5 subtítulos que cubran todo el video. Responde SOLO con el JSON.`;
    } else {
      prompt = `Analiza esta imagen de un perro y determina:

1. Raza aproximada
2. Peso estimado en kg
3. Condición corporal: 'flaco', 'saludable' o 'sobrepeso'
4. Estado del pelaje

Responde en formato natural, como si hablaras con el dueño. Sé amigable y profesional.`;
    }

    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: videoData,
              mimeType: mimeType
            }
          }
        ]
      }]
    };

    // Realizar la solicitud a la API REST
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return res.status(200).json({
      success: true,
      data: text
    });

  } catch (error) {
    console.error('Error en análisis:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      analysisType: req.body?.analysisType
    });
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  }
};