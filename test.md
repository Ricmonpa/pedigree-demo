# Checklist de Pruebas - Pedigree Demo

## ✅ Funcionalidades a Probar

### 1. Subida de Video
- [ ] Subir video MP4 válido
- [ ] Subir video MOV válido
- [ ] Subir video WebM válido
- [ ] Intentar subir formato no soportado (debe mostrar error)
- [ ] Intentar subir video > 20MB (debe mostrar error)
- [ ] Intentar subir video < 3 segundos (debe mostrar error)
- [ ] Intentar subir video > 60 segundos (debe mostrar error)

### 2. Análisis de Video
- [ ] El loading overlay aparece al iniciar análisis
- [ ] El spinner se muestra correctamente
- [ ] La barra de progreso anima de 0% a 90%
- [ ] El mensaje de carga es claro
- [ ] El análisis completa correctamente
- [ ] El loading desaparece al terminar

### 3. Subtítulos Emocionales
- [ ] Los subtítulos aparecen durante la reproducción del video
- [ ] Los subtítulos se sincronizan con el tiempo del video
- [ ] Los subtítulos desaparecen cuando no hay uno activo
- [ ] El formato de los subtítulos es legible

### 4. Chat Nutricional
- [ ] El avatar del perro se muestra (frame extraído)
- [ ] El mensaje del chat es personalizado según análisis
- [ ] Se menciona la raza detectada
- [ ] Se menciona el peso estimado
- [ ] Se menciona la condición corporal
- [ ] La recomendación es apropiada según condición

### 5. Información de Porciones
- [ ] Las porciones se calculan correctamente
- [ ] Se muestran sobres húmedos
- [ ] Se muestran gramos de croquetas
- [ ] Se muestra el total de calorías
- [ ] Los cálculos son razonables según peso y condición

### 6. Sección de Productos
- [ ] Se muestran los iconos de productos
- [ ] El hover effect funciona
- [ ] Los productos son visibles después del análisis

### 7. Botones de Acción
- [ ] Botón "Ver Producto y Precio" funciona
- [ ] Botón "Info Nutricional" funciona
- [ ] Botón "Compartir Análisis" aparece después del análisis
- [ ] Botón "Analizar Otro Perrito" aparece después del análisis
- [ ] Botón "Compartir" genera texto correcto
- [ ] Botón "Compartir" copia al portapapeles o usa Web Share API
- [ ] Botón "Analizar Otro" resetea correctamente la interfaz

### 8. Manejo de Errores
- [ ] Error de formato muestra mensaje amigable
- [ ] Error de tamaño muestra mensaje amigable
- [ ] Error de duración muestra mensaje amigable
- [ ] Error de API muestra mensaje amigable con tip
- [ ] Los mensajes de error tienen el icono ⚠️
- [ ] Los tips son útiles y claros

### 9. Responsive Design
- [ ] La interfaz se ve bien en móvil
- [ ] Los botones se apilan correctamente en móvil
- [ ] El video se adapta al tamaño de pantalla
- [ ] El chat es legible en móvil
- [ ] El loading overlay funciona en móvil

### 10. Validaciones
- [ ] Validación de formato funciona
- [ ] Validación de tamaño funciona
- [ ] Validación de duración funciona
- [ ] Los mensajes de validación son claros

## 🎬 Videos de Prueba

### Casos de Prueba Recomendados

#### 1. Perro Flaco
- **Descripción**: Video de un perro con bajo peso
- **Duración**: 5-10 segundos
- **Características**: Perro visible, buena iluminación, se ve delgado
- **Resultado esperado**: 
  - Condición: "flaco"
  - Recomendación: "ganar masa muscular y energía"
  - Multiplicador de calorías: 1.4

#### 2. Perro con Sobrepeso
- **Descripción**: Video de un perro con sobrepeso
- **Duración**: 5-10 segundos
- **Características**: Perro visible, buena iluminación, se ve gordo
- **Resultado esperado**:
  - Condición: "sobrepeso"
  - Recomendación: "controlar porciones sin sacrificar sabor"
  - Multiplicador de calorías: 1.0

#### 3. Perro Saludable
- **Descripción**: Video de un perro en peso ideal
- **Duración**: 5-10 segundos
- **Características**: Perro visible, buena iluminación, condición normal
- **Resultado esperado**:
  - Condición: "saludable"
  - Recomendación: "mantener su condición óptima"
  - Multiplicador de calorías: 1.2

#### 4. Perro Ansioso/Hiperactivo
- **Descripción**: Video de un perro muy activo
- **Duración**: 5-10 segundos
- **Características**: Perro moviéndose mucho, ladrando, excitado
- **Resultado esperado**:
  - Emoción detectada: "ansioso" o "hiperactivo"
  - Mensaje menciona necesidad de nutrición

### URLs de Ejemplo (para descargar con yt-dlp)

```bash
# Instalar yt-dlp si no lo tienes
# pip install yt-dlp

# Descargar videos de prueba (reemplaza con URLs reales)
# yt-dlp -f "best[ext=mp4]" <URL_VIDEO> -o "test-videos/perro-flaco.mp4"
# yt-dlp -f "best[ext=mp4]" <URL_VIDEO> -o "test-videos/perro-gordo.mp4"
# yt-dlp -f "best[ext=mp4]" <URL_VIDEO> -o "test-videos/perro-saludable.mp4"
```

**Nota**: Busca videos de perros en YouTube y descarga algunos para pruebas. Asegúrate de que:
- El perro sea claramente visible
- La iluminación sea buena
- El video tenga al menos 3 segundos de duración
- El formato sea compatible (MP4, MOV, WebM)

## 🐛 Casos Edge a Probar

1. **Video sin perro visible**: ¿Qué pasa si el video no muestra un perro?
2. **Video con múltiples perros**: ¿Se analiza el perro principal?
3. **Video con poca luz**: ¿El análisis funciona?
4. **Video muy corto**: ¿Se valida correctamente?
5. **Video muy largo**: ¿Se valida correctamente?
6. **Error de API**: ¿Se maneja gracefully?
7. **Sin conexión a internet**: ¿Se muestra error apropiado?
8. **Análisis parcial**: ¿Funciona si solo uno de los análisis falla?

## 📊 Métricas de Éxito

- ✅ Tiempo de análisis: < 30 segundos
- ✅ Precisión de detección de raza: > 70%
- ✅ Precisión de estimación de peso: ±5kg
- ✅ Tasa de éxito de análisis: > 80%
- ✅ Experiencia de usuario: Sin errores críticos

## 🔍 Debugging

Si algo no funciona:

1. Abre la consola del navegador (F12)
2. Revisa los errores en la consola
3. Verifica que las API keys estén correctas
4. Verifica que el servidor esté corriendo
5. Verifica que el video sea válido
6. Revisa los logs de la API de Gemini

## 📝 Notas de Prueba

Fecha de prueba: ___________
Probado por: ___________
Navegador: ___________
Versión: ___________

### Resultados:
- ✅ Funciona correctamente
- ⚠️ Funciona con problemas menores
- ❌ No funciona

---

**Última actualización**: [Fecha]
**Versión**: 1.0.0

