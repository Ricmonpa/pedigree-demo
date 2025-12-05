import { processVideo } from './pedigree-integration.js';
import { generateSmartNutritionalChat } from './pedigree-chat.js';

// Elementos del DOM
const btnUpload = document.getElementById('btnUpload');
const videoInput = document.getElementById('videoInput');
const videoContainer = document.getElementById('videoContainer');
const videoPlaceholder = document.getElementById('videoPlaceholder');
const dogVideo = document.getElementById('dogVideo');
const videoLogo = document.querySelector('.video-logo');
const subtitlesOverlay = document.getElementById('subtitlesOverlay');
const currentSubtitleText = document.getElementById('currentSubtitle');
const chatSection = document.getElementById('chatSection');
const chatContainer = document.getElementById('chatContainer');
const chatMessage = document.getElementById('chatMessage');
const chatAvatar = document.getElementById('chatAvatar');
const productsSection = document.getElementById('productsSection');
const portionsInfo = document.getElementById('portionsInfo');
const btnProduct = document.getElementById('btnProduct');
const btnNutritional = document.getElementById('btnNutritional');
const btnShare = document.getElementById('btnShare');
const btnAnother = document.getElementById('btnAnother');
const loadingOverlay = document.getElementById('loadingOverlay');
const progressBar = document.getElementById('progressBar');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const errorTip = document.getElementById('errorTip');

// Estado de subtítulos
let currentSubtitles = [];
let subtitleIndex = 0;
let currentAnalysisData = null; // Guardar datos del análisis para compartir

// Event Listeners
btnUpload.addEventListener('click', () => {
    videoInput.click();
});

videoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleVideoUpload(file);
    }
});

// Event listener para actualizar subtítulos según el tiempo del video
dogVideo.addEventListener('timeupdate', updateSubtitles);

// Función para validar el video
function validateVideo(file) {
    // Validar formato
    const validFormats = ['video/mp4', 'video/quicktime', 'video/webm'];
    const validExtensions = ['.mp4', '.mov', '.webm'];
    
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const isValidFormat = validFormats.includes(file.type) || validExtensions.includes(fileExtension);
    
    if (!isValidFormat) {
        throw new Error('Formato no soportado. Por favor, sube un video en formato MP4, MOV o WebM.');
    }
    
    // Validar tamaño (máximo 20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
        throw new Error('El video es demasiado grande. Por favor, sube un video menor a 20MB.');
    }
    
    return true;
}

// Función para obtener duración del video
function getVideoDuration(videoElement) {
    return new Promise((resolve) => {
        if (videoElement.readyState >= 2) {
            resolve(videoElement.duration);
        } else {
            videoElement.addEventListener('loadedmetadata', () => {
                resolve(videoElement.duration);
            }, { once: true });
        }
    });
}

// Función para manejar la subida del video
async function handleVideoUpload(file) {
    try {
        // Ocultar mensajes de error previos
        hideError();
        
        // Validar video
        validateVideo(file);
        
        // Resetear estado
        currentSubtitles = [];
        subtitleIndex = 0;
        currentAnalysisData = null;
        
        // Ocultar overlay de subtítulos
        if (subtitlesOverlay) {
            subtitlesOverlay.classList.add('hidden');
        }
        
        // Mostrar el video
        const videoURL = URL.createObjectURL(file);
        dogVideo.src = videoURL;
        dogVideo.style.display = 'block';
        videoPlaceholder.style.display = 'none';
        
        // Mostrar logo Pedigree en el video
        if (videoLogo) {
            videoLogo.classList.add('visible');
        }
        
        // Esperar a que el video esté listo y validar duración
        dogVideo.addEventListener('loadedmetadata', async () => {
            const duration = await getVideoDuration(dogVideo);
            
            if (duration < 3) {
                showError(
                    'El video es muy corto',
                    'Por favor, sube un video de al menos 3 segundos para un mejor análisis.'
                );
                return;
            }
            
            if (duration > 60) {
                showError(
                    'El video es muy largo',
                    'Por favor, sube un video de máximo 60 segundos. Puedes recortar el video antes de subirlo.'
                );
                return;
            }
            
            analyzeVideo(file);
        }, { once: true });
        
    } catch (error) {
        showError('Error al validar el video', error.message);
    }
}

// Función para mostrar loading state
function showLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        // Iniciar animación de barra de progreso
        startProgressBar();
    }
    if (chatSection) {
        chatSection.style.display = 'block';
    }
    if (chatMessage) {
        chatMessage.textContent = 'Preparando análisis...';
    }
    if (btnUpload) {
        btnUpload.disabled = true;
    }
}

// Función para ocultar loading state
function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
    if (progressBar) {
        progressBar.style.width = '0%';
    }
}

// Función para animar barra de progreso
function startProgressBar() {
    if (!progressBar) return;
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15; // Incremento aleatorio para parecer más real
        if (progress > 90) progress = 90; // Máximo 90% hasta que termine
        progressBar.style.width = progress + '%';
        
        if (progress >= 90) {
            clearInterval(interval);
        }
    }, 500);
    
    // Guardar intervalo para poder limpiarlo
    progressBar._interval = interval;
}

// Función para mostrar error amigable
function showError(title, tip = '') {
    hideLoading();
    if (errorMessage) {
        errorMessage.style.display = 'block';
    }
    if (errorText) {
        errorText.textContent = title || 'Ups, tuve problemas analizando el video. ¿Puedes intentar con otro?';
    }
    if (errorTip) {
        errorTip.textContent = tip || 'Tip: Videos con buena luz funcionan mejor';
    }
    if (btnUpload) {
        btnUpload.disabled = false;
    }
}

// Función para ocultar error
function hideError() {
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
}

// Función para analizar el video
async function analyzeVideo(videoFile) {
    try {
        // Mostrar loading state
        showLoading();
        hideError();
        
        // Procesar video con ambos análisis
        const results = await processVideo(videoFile, dogVideo);
        
        // Completar barra de progreso
        if (progressBar) {
            progressBar.style.width = '100%';
        }
        
        // Ocultar loading después de un breve delay
        setTimeout(() => {
            hideLoading();
        }, 500);
        
        // Actualizar subtítulos si hay análisis de comportamiento
        if (results.behavior) {
            const subtitles = Array.isArray(results.behavior) ? results.behavior : results.behavior.subtitles;
            if (subtitles && subtitles.length > 0) {
                currentSubtitles = subtitles;
                console.log('🎬 Subtítulos cargados:', currentSubtitles);
                
                // Mostrar el primer subtítulo
                updateSubtitles();
                
                // Reproducir video automáticamente para mostrar subtítulos
                dogVideo.play().catch(e => console.log('Autoplay bloqueado:', e));
            }
        }
        
        // Generar mensaje nutricional inteligente
        const chatData = generateSmartNutritionalChat(
            results.behavior,
            results.health,
            'tu perrito' // Se puede pedir al usuario más adelante
        );
        
        // Guardar datos del análisis para compartir
        currentAnalysisData = {
            breed: chatData.dogBreed || 'perro',
            weight: chatData.dogWeight,
            portions: chatData.portions
        };
        
        // Actualizar avatar del perro con el frame extraído
        if (results.frameBase64 && chatAvatar) {
            chatAvatar.src = results.frameBase64;
            chatAvatar.style.display = 'block';
        }
        
        // Mostrar mensaje del chat
        chatMessage.innerHTML = formatChatMessage(chatData.message);
        
        // Mostrar información de porciones si está disponible
        if (chatData.portions && portionsInfo) {
            portionsInfo.innerHTML = `
                <div class="portions-detail">
                    <div class="portion-item">
                        <span class="portion-icon">📦</span>
                        <div class="portion-text">
                            <strong>${chatData.portions.wetPouches} sobres</strong> Pedigree húmedo
                            <small>${chatData.portions.wetCalories} kcal</small>
                        </div>
                    </div>
                    <div class="portion-item">
                        <span class="portion-icon">📦</span>
                        <div class="portion-text">
                            <strong>${chatData.portions.dryKibble}g</strong> croquetas Pedigree
                            <small>${chatData.portions.dryCalories} kcal</small>
                        </div>
                    </div>
                    <div class="portion-total">
                        Total: ${chatData.portions.totalCalories} kcal/día
                    </div>
                </div>
            `;
            portionsInfo.style.display = 'block';
        }
        
        // Mostrar sección de productos
        if (productsSection) {
            productsSection.style.display = 'flex';
        }
        
        // Mostrar botones adicionales
        if (btnShare) {
            btnShare.style.display = 'flex';
        }
        if (btnAnother) {
            btnAnother.style.display = 'flex';
        }
        
        // Mostrar errores si los hay (pero no críticos)
        if (results.errors && results.errors.length > 0) {
            console.warn('Algunos análisis tuvieron problemas:', results.errors);
        }
        
    } catch (error) {
        console.error('Error al analizar el video:', error);
        showError(
            'Ups, tuve problemas analizando el video. ¿Puedes intentar con otro?',
            'Tip: Videos con buena luz funcionan mejor'
        );
    } finally {
        if (btnUpload) {
            btnUpload.disabled = false;
        }
    }
}

// Variable para trackear el subtítulo actual
let lastSubtitleText = '';

// Función para actualizar subtítulos según el tiempo del video
function updateSubtitles() {
    if (currentSubtitles.length === 0) {
        if (subtitlesOverlay) subtitlesOverlay.classList.add('hidden');
        return;
    }
    
    const currentTime = dogVideo.currentTime;
    
    // Buscar el subtítulo correspondiente al tiempo actual
    const activeSubtitle = currentSubtitles.find(sub => {
        const times = parseTimestamp(sub.timestamp);
        if (!times) return false;
        const [start, end] = times;
        return currentTime >= start && currentTime <= end;
    });
    
    // Debug
    console.log(`⏱️ Tiempo: ${currentTime.toFixed(1)}s, Subtítulo:`, activeSubtitle?.traduccion_emocional || 'ninguno');
    
    if (activeSubtitle && activeSubtitle.traduccion_emocional) {
        const newText = activeSubtitle.traduccion_emocional;
        
        // Solo actualizar si cambió el subtítulo
        if (newText !== lastSubtitleText) {
            lastSubtitleText = newText;
            
            // Actualizar el texto del subtítulo
            if (currentSubtitleText) {
                currentSubtitleText.textContent = newText;
            }
            
            // Mostrar el overlay con animación
            if (subtitlesOverlay) {
                subtitlesOverlay.classList.remove('hidden');
                
                // Animar el cambio
                const bubble = subtitlesOverlay.querySelector('.subtitle-bubble');
                if (bubble) {
                    bubble.classList.add('changing');
                    setTimeout(() => bubble.classList.remove('changing'), 300);
                }
            }
        }
    } else {
        // Ocultar subtítulo si no hay uno activo
        if (subtitlesOverlay && !subtitlesOverlay.classList.contains('hidden')) {
            subtitlesOverlay.classList.add('hidden');
            lastSubtitleText = '';
        }
    }
}

// Función para parsear timestamps como "00:07 - 00:15"
function parseTimestamp(timestamp) {
    try {
        const parts = timestamp.split(' - ');
        if (parts.length !== 2) return null;
        
        const start = parseTimeString(parts[0].trim());
        const end = parseTimeString(parts[1].trim());
        
        return [start, end];
    } catch (e) {
        console.error('Error parseando timestamp:', timestamp, e);
        return null;
    }
}

// Función para convertir "00:07" a segundos
function parseTimeString(timeStr) {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
}

// Función para formatear el mensaje del chat con saltos de línea
function formatChatMessage(message) {
    return message.split('\n').map(line => {
        if (line.trim() === '') return '<br>';
        return `<p>${line}</p>`;
    }).join('');
}

// Event listener para el botón de producto
if (btnProduct) {
    btnProduct.addEventListener('click', () => {
        alert('Redirigiendo a la página de productos Pedigree...');
        // Aquí se puede agregar la lógica para redirigir a la página de productos
    });
}

// Event listener para el botón de información nutricional
if (btnNutritional) {
    btnNutritional.addEventListener('click', () => {
        alert('Información nutricional detallada de Pedigree...');
        // Aquí se puede agregar la lógica para mostrar información nutricional
    });
}

// Event listener para el botón de compartir
if (btnShare) {
    btnShare.addEventListener('click', () => {
        shareAnalysis();
    });
}

// Event listener para el botón de analizar otro
if (btnAnother) {
    btnAnother.addEventListener('click', () => {
        resetAnalysis();
    });
}

// Función para compartir análisis
function shareAnalysis() {
    if (!currentAnalysisData || !currentAnalysisData.portions) {
        alert('No hay análisis para compartir. Por favor, analiza un video primero.');
        return;
    }
    
    const breed = currentAnalysisData.breed || 'perro';
    const weight = currentAnalysisData.weight ? `${currentAnalysisData.weight}kg` : '';
    const portions = currentAnalysisData.portions;
    
    const shareText = `Mi ${breed}${weight ? ` de ${weight}` : ''} necesita ${portions.wetPouches} sobres + ${portions.dryKibble}g de croquetas Pedigree al día 🐕`;
    
    // Intentar usar Web Share API si está disponible
    if (navigator.share) {
        navigator.share({
            title: 'Análisis Nutricional Pedigree',
            text: shareText,
            url: window.location.href
        }).catch(err => {
            console.log('Error al compartir:', err);
            copyToClipboard(shareText);
        });
    } else {
        // Fallback: copiar al portapapeles
        copyToClipboard(shareText);
    }
}

// Función para copiar al portapapeles
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            alert('¡Análisis copiado al portapapeles!');
        }).catch(err => {
            console.error('Error al copiar:', err);
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

// Fallback para copiar al portapapeles
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        alert('¡Análisis copiado al portapapeles!');
    } catch (err) {
        console.error('Error al copiar:', err);
        alert('No se pudo copiar automáticamente. Aquí está el texto:\n\n' + text);
    }
    document.body.removeChild(textArea);
}

// Función para resetear análisis y permitir subir otro video
function resetAnalysis() {
    // Resetear estado
    currentSubtitles = [];
    currentAnalysisData = null;
    
    // Ocultar elementos
    if (subtitlesOverlay) subtitlesOverlay.classList.add('hidden');
    if (chatSection) chatSection.style.display = 'none';
    lastSubtitleText = '';
    if (portionsInfo) portionsInfo.style.display = 'none';
    if (productsSection) productsSection.style.display = 'none';
    if (btnShare) btnShare.style.display = 'none';
    if (btnAnother) btnAnother.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
    
    // Resetear video
    if (dogVideo) {
        dogVideo.src = '';
        dogVideo.style.display = 'none';
    }
    if (videoPlaceholder) videoPlaceholder.style.display = 'flex';
    if (videoLogo) videoLogo.classList.remove('visible');
    
    // Resetear input
    if (videoInput) videoInput.value = '';
    
    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

