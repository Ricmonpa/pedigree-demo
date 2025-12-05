const GEMINI_API_KEY_BLABLAPET = 'AIzaSyCpQESy8sGmOM53xv9DmbHdNj0X3J7DZvc';
const MODEL_NAME = 'gemini-2.0-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY_BLABLAPET}`;

/**
 * Analiza el comportamiento de un perro en un video usando Gemini AI
 * @param {File|Blob} videoFile - Archivo de video del perro
 * @returns {Promise<Array>} Array de subtítulos con timestamps
 */
export async function analyzeVideoBehavior(videoFile) {
    try {
        // Convertir video a base64
        const videoBase64 = await fileToBase64(videoFile);
        
        // Prompt para análisis de comportamiento
        const prompt = `Eres BlaBlaPet, un traductor emocional de perros. Analiza este video y genera subtítulos que expresen lo que el perro está "pensando" o "diciendo" emocionalmente.

INSTRUCCIONES:
1. Divide el video en segmentos de 3-7 segundos
2. Para cada segmento, genera un subtítulo emocional en primera persona (como si el perro hablara)
3. Sé expresivo, divertido y emotivo
4. Usa exclamaciones y emociones intensas

EJEMPLOS DE SUBTÍTULOS EMOCIONALES:
- "¡Oh, qué es eso! ¡Huele delicioso!"
- "¡Dame, dame, dame! ¡Lo quiero ya!"
- "Mmm... esto está increíble..."
- "¡Mira eso! ¿Es para mí?"
- "¡Soy el perro más feliz del mundo!"

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

        // Preparar el payload para la API
        const base64Data = videoBase64.split(',')[1]; // Remover el prefijo
        const mimeType = videoFile.type || 'video/mp4';

        const payload = {
            contents: [{
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            data: base64Data,
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

        // Parsear la respuesta JSON
        let subtitles = [];
        try {
            // Limpiar el texto para extraer solo el JSON
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                subtitles = parsed.subtitles || [];
            } else {
                throw new Error('No se encontró JSON en la respuesta');
            }
        } catch (parseError) {
            console.error('Error al parsear respuesta de Gemini:', parseError);
            console.log('Respuesta recibida:', text);
            // Fallback: crear un subtítulo genérico
            subtitles = [{
                timestamp: "00:00 - 00:10",
                traduccion_emocional: "¡Oh, qué es eso! ¡Lo quiero!"
            }];
        }

        return subtitles;
    } catch (error) {
        console.error('Error en analyzeVideoBehavior:', error);
        
        // Manejo de errores específicos
        if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
            throw new Error('Límite de solicitudes excedido. Por favor, intenta más tarde.');
        } else if (error.message?.includes('413') || error.message?.includes('size') || error.message?.includes('INVALID_ARGUMENT')) {
            throw new Error('El video es demasiado grande. Por favor, sube un video más corto.');
        } else if (error.message?.includes('400') || error.message?.includes('BAD_REQUEST')) {
            throw new Error('Formato de video no soportado. Por favor, usa MP4, MOV o AVI.');
        }
        
        throw new Error('Error al analizar el comportamiento del perro: ' + error.message);
    }
}

/**
 * Convierte un archivo a Base64
 * @param {File|Blob} file - Archivo a convertir
 * @returns {Promise<string>} String Base64 con prefijo data URL
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
