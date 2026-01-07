import { analyzeVideoBehavior } from './blablapet-adapter-v2.js';
import { analyzeImageHealth } from './pawanalytics-adapter-v2.js';

/**
 * Extrae un frame del video en un tiempo específico
 * @param {HTMLVideoElement} videoElement - Elemento de video
 * @param {number} timeInSeconds - Tiempo en segundos para extraer el frame
 * @returns {Promise<string>} Imagen en formato Base64
 */
function extractFrameFromVideo(videoElement, timeInSeconds = 2) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Configurar dimensiones del canvas
        canvas.width = videoElement.videoWidth || 640;
        canvas.height = videoElement.videoHeight || 480;
        
        // Función para capturar el frame
        const captureFrame = () => {
            try {
                // Dibujar el frame actual en el canvas
                ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                
                // Convertir a Base64
                const imageBase64 = canvas.toDataURL('image/jpeg', 0.9);
                resolve(imageBase64);
            } catch (error) {
                reject(new Error('Error al extraer frame del video: ' + error.message));
            }
        };
        
        // Si el video ya está cargado y en el tiempo correcto
        if (videoElement.readyState >= 2) {
            const currentTime = videoElement.currentTime;
            const targetTime = timeInSeconds;
            
            if (Math.abs(currentTime - targetTime) < 0.1) {
                captureFrame();
            } else {
                // Ir al tiempo específico
                videoElement.currentTime = targetTime;
                videoElement.addEventListener('seeked', captureFrame, { once: true });
            }
        } else {
            // Esperar a que el video esté listo
            videoElement.addEventListener('loadeddata', () => {
                videoElement.currentTime = timeInSeconds;
                videoElement.addEventListener('seeked', captureFrame, { once: true });
            }, { once: true });
            
            // Timeout de seguridad
            setTimeout(() => {
                if (videoElement.readyState >= 2) {
                    captureFrame();
                } else {
                    reject(new Error('El video no se pudo cargar correctamente'));
                }
            }, 5000);
        }
    });
}

/**
 * Procesa un video completo: analiza comportamiento y salud
 * @param {File|Blob} videoFile - Archivo de video del perro
 * @param {HTMLVideoElement} videoElement - Elemento de video en el DOM
 * @returns {Promise<Object>} Objeto con resultados de ambos análisis
 */
export async function processVideo(videoFile, videoElement) {
    try {
        // Validar tamaño del video (máximo 20MB para evitar problemas)
        const maxSize = 20 * 1024 * 1024; // 20MB
        if (videoFile.size > maxSize) {
            throw new Error('El video es demasiado grande. Por favor, sube un video menor a 20MB.');
        }
        
        // Validar formato
        const validFormats = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
        if (!validFormats.includes(videoFile.type)) {
            console.warn('Formato de video no estándar:', videoFile.type);
        }
        
        // Extraer frame del video en segundo 2
        console.log('Extrayendo frame del video...');
        const frameBase64 = await extractFrameFromVideo(videoElement, 2);
        
        // Ejecutar ambos análisis en paralelo
        console.log('Iniciando análisis en paralelo...');
        const [behaviorAnalysis, healthAnalysis] = await Promise.allSettled([
            analyzeVideoBehavior(videoFile),
            analyzeImageHealth(frameBase64)
        ]);
        
        // Procesar resultados
        const results = {
            behavior: null,
            health: null,
            frameBase64: frameBase64, // Frame extraído para usar como avatar
            errors: []
        };
        
        if (behaviorAnalysis.status === 'fulfilled') {
            results.behavior = {
                subtitles: behaviorAnalysis.value,
                raw: behaviorAnalysis.value
            };
        } else {
            results.errors.push({
                type: 'behavior',
                message: behaviorAnalysis.reason?.message || 'Error desconocido en análisis de comportamiento'
            });
            console.error('Error en análisis de comportamiento:', behaviorAnalysis.reason);
        }
        
        if (healthAnalysis.status === 'fulfilled') {
            results.health = healthAnalysis.value;
        } else {
            results.errors.push({
                type: 'health',
                message: healthAnalysis.reason?.message || 'Error desconocido en análisis de salud'
            });
            console.error('Error en análisis de salud:', healthAnalysis.reason);
        }
        
        // Si ambos análisis fallaron, lanzar error
        if (results.errors.length === 2) {
            throw new Error('No se pudo completar ningún análisis. Por favor, intenta con otro video.');
        }
        
        return results;
    } catch (error) {
        console.error('Error en processVideo:', error);
        throw error;
    }
}

/**
 * Genera el mensaje del chat nutricional basado en los análisis
 * @deprecated Usar generateSmartNutritionalChat de pedigree-chat.js en su lugar
 * @param {Object} results - Resultados de processVideo
 * @returns {string} Mensaje formateado para el chat
 */
export function generateNutritionalMessage(results) {
    let message = 'Hola! Analicé el video de tu perrito.\n\n';
    
    if (results.health) {
        message += results.health + '\n\n';
    } else if (results.errors.find(e => e.type === 'health')) {
        message += 'No pude analizar completamente la salud de tu perro, pero ';
    }
    
    if (results.behavior && results.behavior.length > 0) {
        message += 'Basándome en su comportamiento, ';
    }
    
    message += 'te recomiendo el sistema Pedigree® Adulto con Mix Feeding (Croquetas + Sobres para masa muscular y sabor).';
    
    return message;
}

