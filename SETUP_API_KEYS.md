# Configuración de API Keys

## Problema Actual
Las API keys de Google Gemini han sido reportadas como filtradas y necesitas reemplazarlas.

## Solución

### 1. Obtener nuevas API Keys de Google Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Ve a "Get API Key" en el menú lateral
4. Crea un nuevo proyecto si no tienes uno
5. Genera una nueva API key
6. Copia la API key generada

### 2. Configurar las API Keys

1. Abre el archivo `js/config.js`
2. Reemplaza `TU_API_KEY_PAWANALYTICS_AQUI` con tu nueva API key
3. Reemplaza `TU_API_KEY_BLABLAPET_AQUI` con la misma API key (o genera otra si prefieres)

### 3. Ejemplo de configuración

```javascript
const CONFIG = {
    GEMINI_API_KEY_PAWANALYTICS: 'AIzaSyC1234567890abcdefghijklmnop',
    GEMINI_API_KEY_BLABLAPET: 'AIzaSyC1234567890abcdefghijklmnop',
    MODEL_NAME: 'gemini-2.0-flash',
    API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models'
};
```

### 4. Verificar que funciona

1. Guarda los cambios
2. Recarga tu aplicación
3. Intenta analizar un video de nuevo

## Importante
- Nunca subas el archivo `config.js` a repositorios públicos
- El archivo ya está en `.gitignore` para proteger tus keys
- Si las keys se filtran de nuevo, repite este proceso

## Límites de la API Gratuita
- Google Gemini tiene límites en la versión gratuita
- Si recibes errores 429, espera unos minutos antes de intentar de nuevo
- Para uso intensivo, considera actualizar a un plan de pago