const GEMINI_API_KEY_PAWANALYTICS = 'AIzaSyAEH-2vaXSgOB2TILG4zr1Dlo5QHktkBLk';
const MODEL_NAME = 'gemini-2.0-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY_PAWANALYTICS}`;

/**
 * Analiza la salud de un perro a partir de una imagen usando Gemini AI
 * @param {string} imageBase64 - Imagen en formato Base64 (con prefijo data:image/...)
 * @returns {Promise<string>} Texto con análisis de salud
 */
export async function analyzeImageHealth(imageBase64) {
    try {
        // Prompt para análisis de salud
        const prompt = `Analiza esta imagen de un perro y determina:

1. Raza aproximada
2. Peso estimado en kg
3. Condición corporal: 'flaco', 'saludable' o 'sobrepeso'
4. Estado del pelaje

Responde en formato natural, como si hablaras con el dueño. Sé amigable y profesional.`;

        // Preparar el payload para la API
        const base64Data = imageBase64.split(',')[1]; // Remover el prefijo
        const mimeType = imageBase64.match(/data:([^;]+);/)?.[1] || 'image/jpeg';

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

        return text;
    } catch (error) {
        console.error('Error en analyzeImageHealth:', error);
        
        // Manejo de errores específicos
        if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
            throw new Error('Límite de solicitudes excedido. Por favor, intenta más tarde.');
        } else if (error.message?.includes('413') || error.message?.includes('size') || error.message?.includes('INVALID_ARGUMENT')) {
            throw new Error('La imagen es demasiado grande. Por favor, intenta con otro video.');
        } else if (error.message?.includes('400') || error.message?.includes('BAD_REQUEST')) {
            throw new Error('Formato de imagen no soportado.');
        }
        
        throw new Error('Error al analizar la salud del perro: ' + error.message);
    }
}
