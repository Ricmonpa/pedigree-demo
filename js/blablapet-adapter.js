// API keys ahora están protegidas en el backend

/**
 * Analiza el comportamiento de un perro en un video usando Gemini AI
 * @param {File|Blob} videoFile - Archivo de video del perro
 * @returns {Promise<Array>} Array de subtítulos con timestamps
 */
export async function analyzeVideoBehavior(videoFile) {
    try {
        console.log('🎬 Analizando comportamiento del video...');
        
        // Convertir video a base64
        const videoBase64 = await fileToBase64(videoFile);
        const videoData = videoBase64.split(',')[1];
        
        // Llamar a NUESTRA API (keys protegidas en backend)
        const response = await fetch('/api/analyze-video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                videoData: videoData,
                mimeType: videoFile.type,
                analysisType: 'behavior'
            })
        });

        if (!response.ok) {
            throw new Error(`Error en API: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error);
        }

        // Parsear respuesta JSON de Gemini
        let subtitles = [];
        try {
            const jsonMatch = result.data.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                subtitles = parsed.subtitles || [];
            } else {
                throw new Error('No se encontró JSON en la respuesta');
            }
        } catch (parseError) {
            console.error('Error al parsear respuesta de Gemini:', parseError);
            console.log('Respuesta recibida:', result.data);
            // Fallback: crear un subtítulo genérico
            subtitles = [{
                timestamp: "00:00 - 00:10",
                traduccion_emocional: "¡Oh, qué es eso! ¡Lo quiero!"
            }];
        }

        return subtitles;
    } catch (error) {
        console.error('❌ Error en análisis de comportamiento:', error);
        
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
