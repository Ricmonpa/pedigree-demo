// API keys ahora están protegidas en el backend

/**
 * Analiza la salud de un perro a partir de una imagen usando Gemini AI
 * @param {string} imageBase64 - Imagen en formato Base64 (con prefijo data:image/...)
 * @returns {Promise<string>} Texto con análisis de salud
 */
export async function analyzeImageHealth(imageBase64) {
    try {
        console.log('📊 Analizando salud del perro...');
        
        // Limpiar base64
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        
        // Llamar a NUESTRA API (keys protegidas)
        const response = await fetch('/api/analyze-video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                videoData: cleanBase64,
                mimeType: 'image/jpeg',
                analysisType: 'health'
            })
        });

        if (!response.ok) {
            throw new Error(`Error en API: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error);
        }

        return result.data;
    } catch (error) {
        console.error('❌ Error en análisis de salud:', error);
        
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
