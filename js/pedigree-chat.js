/**
 * Genera un mensaje nutricional inteligente basado en análisis de comportamiento y salud
 * @param {Object} behaviorData - Datos del análisis de comportamiento
 * @param {Object} healthData - Datos del análisis de salud
 * @param {string} dogName - Nombre del perro (opcional)
 * @returns {Object} Objeto con mensaje completo y datos calculados
 */
export function generateSmartNutritionalChat(behaviorData, healthData, dogName = 'tu perrito') {
    const result = {
        message: '',
        portions: null,
        productRecommendation: '',
        dogBreed: null,
        dogWeight: null,
        condition: null
    };

    // Extraer datos de salud
    const breed = extractBreed(healthData);
    const weight = extractWeight(healthData);
    const condition = extractCondition(healthData);
    const coat = extractCoat(healthData);

    // Extraer datos de comportamiento
    const emotion = extractEmotion(behaviorData);
    const hasAnxiety = emotion && (emotion.includes('ansioso') || emotion.includes('hiperactivo') || emotion.includes('nervioso'));

    // Guardar datos para cálculos
    result.dogBreed = breed;
    result.dogWeight = weight;
    result.condition = condition;

    // 1. SALUDO PERSONALIZADO
    const breedText = breed ? breed : 'perro';
    result.message += `¡Hola! Analicé el video de tu ${breedText}.\n\n`;

    // 2. ANÁLISIS DE COMPORTAMIENTO
    if (hasAnxiety) {
        result.message += `Vi que ${dogName} está un poco ${emotion}. Necesita un empujón de nutrición.\n\n`;
    } else if (emotion) {
        result.message += `Observé que ${dogName} está ${emotion}.\n\n`;
    }

    // 3. ANÁLISIS DE SALUD
    if (condition === 'flaco') {
        result.message += 'Noté que está un poco flaquito para su tamaño.\n\n';
    } else if (condition === 'sobrepeso') {
        result.message += 'Está un poco gordito, pero nada que no se arregle con buena nutrición.\n\n';
    } else if (condition === 'saludable') {
        result.message += '¡Está en su peso ideal! Mantengamos esa condición.\n\n';
    }

    // 4. RECOMENDACIÓN DE PRODUCTO
    let benefit = '';
    if (condition === 'sobrepeso') {
        benefit = 'controlar porciones sin sacrificar sabor';
    } else if (condition === 'flaco') {
        benefit = 'ganar masa muscular y energía';
    } else {
        benefit = 'mantener su condición óptima';
    }

    result.productRecommendation = `Te recomiendo el sistema Pedigree® Adulto con Mix Feeding (Croquetas + Sobres) para ${benefit}.`;

    result.message += result.productRecommendation + '\n\n';

    // 5. CÁLCULO DE PORCIONES
    if (weight) {
        const portions = calculatePortions(weight, condition);
        result.portions = portions;

        result.message += `Para un ${breedText} de ${weight}kg, recomiendo:\n\n`;
        result.message += `📦 ${portions.wetPouches} sobres Pedigree húmedo\n`;
        result.message += `📦 ${portions.dryKibble}g de croquetas Pedigree\n\n`;
        result.message += 'Repartidos en 2 comidas al día.';
    }

    return result;
}

/**
 * Calcula las porciones recomendadas según peso y condición
 * @param {number} weight - Peso del perro en kg
 * @param {string} condition - Condición: 'flaco', 'saludable', 'sobrepeso'
 * @returns {Object} Objeto con porciones calculadas
 */
function calculatePortions(weight, condition) {
    // Fórmula: Calorías diarias = (peso * 30) + 70
    let baseCalories = (weight * 30) + 70;

    // Multiplicador según condición
    let multiplier = 1.2; // saludable por defecto
    if (condition === 'flaco') {
        multiplier = 1.4;
    } else if (condition === 'sobrepeso') {
        multiplier = 1.0;
    }

    const totalCalories = baseCalories * multiplier;

    // 30% sobres húmedos (85 kcal/sobre)
    const wetCalories = totalCalories * 0.3;
    const wetPouches = Math.round(wetCalories / 85);

    // 70% croquetas (350 kcal/100g)
    const dryCalories = totalCalories * 0.7;
    const dryKibble = Math.round((dryCalories / 350) * 100);

    return {
        totalCalories: Math.round(totalCalories),
        wetPouches: Math.max(1, wetPouches), // Mínimo 1 sobre
        dryKibble: Math.max(50, dryKibble), // Mínimo 50g
        wetCalories: Math.round(wetCalories),
        dryCalories: Math.round(dryCalories)
    };
}

/**
 * Extrae la raza del texto de análisis de salud
 */
function extractBreed(healthData) {
    if (!healthData) return null;
    
    const text = healthData.toLowerCase();
    const breeds = [
        'golden retriever', 'labrador', 'pastor alemán', 'bulldog', 'beagle',
        'poodle', 'chihuahua', 'yorkshire', 'boxer', 'dachshund', 'husky',
        'border collie', 'rottweiler', 'doberman', 'shih tzu', 'pug'
    ];

    for (const breed of breeds) {
        if (text.includes(breed)) {
            return breed.charAt(0).toUpperCase() + breed.slice(1);
        }
    }

    // Intentar extraer cualquier raza mencionada
    const breedMatch = text.match(/(?:raza|breed)[\s:]+([a-záéíóúñ\s]+)/i);
    if (breedMatch) {
        return breedMatch[1].trim();
    }

    return null;
}

/**
 * Extrae el peso del texto de análisis de salud
 */
function extractWeight(healthData) {
    if (!healthData) return null;

    const text = healthData;
    // Buscar patrones como "35kg", "35 kg", "35 kilogramos", "peso: 35"
    const weightMatch = text.match(/(?:peso|weight)[\s:]*(\d+(?:\.\d+)?)\s*(?:kg|kilogramos|kilos)?/i) ||
                       text.match(/(\d+(?:\.\d+)?)\s*kg/i);

    if (weightMatch) {
        const weight = parseFloat(weightMatch[1]);
        if (weight > 0 && weight < 100) { // Validación razonable
            return Math.round(weight);
        }
    }

    return null;
}

/**
 * Extrae la condición corporal del texto de análisis de salud
 */
function extractCondition(healthData) {
    if (!healthData) return 'saludable';

    const text = healthData.toLowerCase();

    if (text.includes('flaco') || text.includes('delgado') || text.includes('bajo peso') || text.includes('underweight')) {
        return 'flaco';
    } else if (text.includes('sobrepeso') || text.includes('gordo') || text.includes('obeso') || text.includes('overweight')) {
        return 'sobrepeso';
    } else if (text.includes('saludable') || text.includes('ideal') || text.includes('normal') || text.includes('healthy')) {
        return 'saludable';
    }

    return 'saludable'; // Por defecto
}

/**
 * Extrae el estado del pelaje del texto de análisis de salud
 */
function extractCoat(healthData) {
    if (!healthData) return null;

    const text = healthData.toLowerCase();
    if (text.includes('pelaje') || text.includes('coat') || text.includes('pelo')) {
        if (text.includes('saludable') || text.includes('brillante') || text.includes('healthy')) {
            return 'saludable';
        } else if (text.includes('opaco') || text.includes('seco') || text.includes('dull')) {
            return 'opaco';
        }
    }

    return null;
}

/**
 * Extrae la emoción principal del análisis de comportamiento
 */
function extractEmotion(behaviorData) {
    if (!behaviorData) return null;

    // Manejar tanto array directo como objeto con subtitles
    const subtitles = Array.isArray(behaviorData) ? behaviorData : (behaviorData.subtitles || []);
    if (!subtitles || subtitles.length === 0) return null;
    const emotions = {
        'ansioso': ['ansioso', 'anxious', 'nervioso', 'nervous'],
        'hiperactivo': ['hiperactivo', 'hiperactive', 'energético', 'energetic'],
        'feliz': ['feliz', 'happy', 'contento', 'content', 'alegre'],
        'excitado': ['excitado', 'excited', 'emocionado'],
        'tranquilo': ['tranquilo', 'calm', 'relajado', 'relaxed']
    };

    // Analizar todos los subtítulos para encontrar la emoción predominante
    const allText = subtitles.map(s => s.traduccion_emocional?.toLowerCase() || '').join(' ');

    for (const [emotion, keywords] of Object.entries(emotions)) {
        if (keywords.some(keyword => allText.includes(keyword))) {
            return emotion;
        }
    }

    return 'excitado'; // Por defecto si no se detecta nada específico
}

