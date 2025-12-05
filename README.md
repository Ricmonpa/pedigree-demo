# Pedigree - Landing Page con Análisis de IA

Landing page que integra dos sistemas de análisis de IA para proporcionar recomendaciones nutricionales personalizadas para perros.

## Estructura del Proyecto

```
Pedigree Demo/
├── index.html                    # Página principal
├── package.json                  # Dependencias y scripts
├── css/
│   └── styles.css                # Estilos principales
├── js/
│   ├── main.js                   # Lógica principal y UI
│   ├── blablapet-adapter.js      # Análisis de comportamiento (videos)
│   ├── pawanalytics-adapter.js   # Análisis de salud (imágenes)
│   └── pedigree-integration.js   # Orquestador de análisis
├── assets/
│   ├── pedigree-logo.png         # Logo oficial de Pedigree (reemplazar con imagen real)
│   └── pedigree-logo.svg          # Logo placeholder (fallback)
└── README.md                     # Este archivo
```

## Características

- **BlaBlaPet**: Análisis de comportamiento de perros mediante videos usando Gemini AI
  - Genera subtítulos emocionales con timestamps
  - Modelo: `gemini-1.5-flash-8b`
  
- **Pawanalytics**: Análisis de salud de perros mediante imágenes usando Gemini AI
  - Determina raza, peso, condición corporal y estado del pelaje
  - Modelo: `gemini-1.5-flash-8b`
  
- **Chat Nutricional**: Recomendaciones personalizadas basadas en ambos análisis
- **Subtítulos Dinámicos**: Se muestran automáticamente según el tiempo del video

## Colores Pedigree

- Amarillo: `#FFCB05`
- Azul: `#00497E`

## Instalación

1. Instalar dependencias:
```bash
npm install
```

## Ejecución

**IMPORTANTE**: Este proyecto usa módulos ES6, por lo que requiere un servidor HTTP. No funciona abriendo directamente el archivo HTML.

### Opción 1: Usar el script npm (recomendado)
```bash
npm run dev
```
Esto iniciará un servidor en `http://localhost:8080` y abrirá el navegador automáticamente.

### Opción 2: Servidor manual
```bash
npm start
```
Luego abre `http://localhost:8080` en tu navegador.

### Opción 3: Otros servidores
Puedes usar cualquier servidor HTTP local:
- Python: `python -m http.server 8080`
- PHP: `php -S localhost:8080`
- VS Code Live Server extension

## API Keys

Las API keys de Gemini están configuradas en:
- `js/blablapet-adapter.js`: `GEMINI_API_KEY_BLABLAPET`
- `js/pawanalytics-adapter.js`: `GEMINI_API_KEY_PAWANALYTICS`

## Configuración del Logo

**IMPORTANTE**: Para usar el logo oficial de Pedigree:

1. Descarga el logo oficial de Pedigree
2. Guárdalo como `assets/pedigree-logo.png`
3. El sistema usará automáticamente el logo SVG como fallback si la imagen no está disponible

## Uso

1. Abre la aplicación en el navegador
2. Haz clic en "Subir Video"
3. Selecciona un video de tu perro:
   - **Formatos soportados**: MP4, MOV, WebM
   - **Tamaño máximo**: 20MB
   - **Duración**: Entre 3 y 60 segundos
4. Espera a que se complete el análisis (10-15 segundos)
5. Revisa los subtítulos emocionales que aparecen durante la reproducción
6. Lee las recomendaciones nutricionales personalizadas en el chat
7. Comparte el análisis o analiza otro perrito

## Características Implementadas

✅ **Validaciones Mejoradas**:
- Validación de formato (solo MP4, MOV, WebM)
- Validación de tamaño (máximo 20MB)
- Validación de duración (3-60 segundos)

✅ **Loading States**:
- Spinner animado durante el análisis
- Barra de progreso visual (0% a 90%)
- Mensajes informativos

✅ **Manejo de Errores**:
- Mensajes amigables y claros
- Tips útiles para el usuario
- Manejo graceful de errores de API

✅ **Funcionalidades Adicionales**:
- Botón "Compartir Análisis" (Web Share API + fallback)
- Botón "Analizar Otro Perrito" para resetear
- Avatar del perro extraído del video

## Limitaciones

- Tamaño máximo de video: 20MB
- Formatos soportados: MP4, MOV, WebM
- Duración: Entre 3 y 60 segundos
- Los análisis pueden tardar 10-15 segundos dependiendo del tamaño del video y la carga de la API

## Manejo de Errores

El sistema maneja automáticamente:
- Límites de tasa de la API (429) - Muestra mensaje amigable
- Archivos demasiado grandes (413) - Sugiere reducir tamaño
- Formatos no soportados (400) - Lista formatos válidos
- Errores de red - Muestra mensaje con tip
- Videos muy cortos/largos - Valida duración antes de analizar

Si un análisis falla, el sistema intentará continuar con el otro análisis disponible y mostrará un mensaje apropiado.

## Pruebas

Consulta el archivo `test.md` para:
- Checklist completo de funcionalidades
- Casos de prueba recomendados
- Guía de debugging
- Métricas de éxito

