# 📜 Guía y Prompt Maestro: Generación de Recetas JSON para Barista Timer

Este documento está diseñado como una especificación e instrucción integral para cualquier Modelo de Lenguaje (LLM) —como Gemini, Claude, ChatGPT, etc.— para la creación de recetas de café y té compatibles al 100% con la aplicación **Barista Timer**.

---

## 🎯 Instrucción / Meta-Prompt para el LLM

> **Copia y pega el siguiente bloque a cualquier LLM cuando quieras que cree una receta:**
>
> ```markdown
> Actúa como un Barista Campeón Mundial y Experto en Extracción de Café y Té, además de Ingeniero de Datos JSON para la aplicación "Barista Timer".
> 
> Tu tarea es diseñar una receta completa, profesional y técnicamente precisa en formato JSON estricto, adaptada específicamente al método, molienda y física de extracción solicitados.
> 
> REGLAS CRÍTICAS DE DISEÑO:
> 1. NO copies una estructura fija de vertidos si el método no lo requiere. Adapta los pasos a la física real del método (inmersión, percolación, presión o decantación).
> 2. DISTINGUE AGUA POR PASO DE AGUA ACUMULADA: En cada paso, 'water_g' representa EXCLUSIVAMENTE el agua vertida en ESE paso específico. Si es una pausa de drenaje, infusión o agitación, 'water_g' DEBE ser 0.
> 3. USA PASOS MANUALES (duration_s = 0): Para acciones que requieren atención física sin tiempo predecible (purgar filtro, ensamblar, romper costra, desespumar, servir), usa 'duration_s': 0. La app esperará a que el usuario presione "Siguiente".
> 4. USA PAUSAS DE DRENAJE / REPOSO (water_g = 0, duration_s > 0): Si el agua está percolando o infusionando sin agregar más líquido, usa water_g = 0 y define los segundos de espera.
> 5. Sigue al pie de la letra el esquema JSON y valida que los 'step_number' sean correlativos empezando en 1.
> ```

---

## 📋 Esquema JSON Oficial (`recipes/<id>.json`)

Toda receta debe ser un objeto JSON válido con los siguientes campos obligatorios y opcionales:

```json
{
  "id": "string (kebab-case único, ej: v60-4-6-tetsu-kasuya)",
  "name": "string (Nombre descriptivo con autor o variante)",
  "method": "string (V60, Aeropress, Prensa Francesa, Chemex, Moka, Origami, Switch, Kalita, Matcha, Sencha, etc.)",
  "author": "string (Autor de la técnica o 'Barista Timer')",
  "description": "string (1-2 oraciones explicando notas sensoriales, objetivo o perfil en taza)",
  "category": "string (Opcional: 'coffee' o 'tea'. Si no se especifica, se deduce del método)",
  "coffee_g": 18,
  "grind_size": "string (ej: 'Medio-Fina', 'Media', 'Gruesa', '18 clics Comandante')",
  "water_temp_c": 92,
  "steps": [
    {
      "step_number": 1,
      "title": "string (Título corto, máx 3-4 palabras)",
      "water_g": 50,
      "duration_s": 45,
      "instruction": "string (Instrucción clara y directa para el barista en pantalla y narración de voz)"
    }
  ]
}
```

### Definición de Campos

| Campo | Tipo | Requerido | Descripción / Reglas |
| :--- | :--- | :---: | :--- |
| `id` | `string` | **Sí** | Minúsculas, números y guiones (`kebab-case`). Coincide con el nombre del archivo `.json`. |
| `name` | `string` | **Sí** | Título visible para el usuario. Específico y representativo. |
| `method` | `string` | **Sí** | Nombre del método. Afecta el icono automático (`V60`, `Aeropress`, `Chemex`, `Prensa Francesa`, `Moka`, `Origami`, `Switch`, etc.). |
| `author` | `string` | No (Recomendado) | Nombre del barista, creador o entidad. |
| `description` | `string` | No (Recomendado) | Contexto, características de la taza y técnica. |
| `category` | `string` | No | `"coffee"` o `"tea"`. Ajusta textos en la app (ej: "Café" vs "Té / Insumo"). |
| `coffee_g` | `number` | **Sí** | Gramos de café molido o té seco. Número flotante o entero > 0. |
| `grind_size` | `string` | **Sí** | Calibre de molienda sugerido. |
| `water_temp_c`| `number` | **Sí** | Temperatura recomendada del agua en grados Celsius (°C). |
| `steps` | `array` | **Sí** | Lista ordenada de objetos de pasos (mínimo 1 paso). |

---

## ⚙️ Cómo Funciona el Motor de la Aplicación

Para diseñar recetas creativas y ricas, es fundamental entender cómo interpreta los valores el motor de Barista Timer:

### 1. Cálculo de Agua Acumulada
El temporizador calcula automáticamente el total de agua vertida hasta el momento sumando los `water_g` de los pasos transcurridos:
$$\text{Agua Acumulada} = \sum_{k=1}^{\text{paso actual}} \text{steps}[k].\text{water\_g}$$

> ⚠️ **ERROR COMÚN:** NUNCA coloques el agua acumulada en `water_g`.
> - ❌ *Incorrecto:* Paso 1: 50g, Paso 2: 120g (queriendo decir que la báscula marque 120g). Resultado: la app sumará 50 + 120 = 170g.
> - ✅ *Correcto:* Paso 1: 50g, Paso 2: 70g. Resultado en báscula: 50 + 70 = 120g acumulados.
> - ✅ *Pausas y reposos:* Si un paso es solo esperar que filtre o infusionar, `water_g` **DEBE ser 0**.

### 2. Comportamiento del Cronómetro vs. Pasos Manuales
- **`duration_s > 0` (Cuenta regresiva activa):** El cronómetro avanza segundo a segundo, muestra el círculo de progreso y emite un pitido/vibración al terminar, saltando automáticamente al siguiente paso.
- **`duration_s == 0` (Paso manual):** El temporizador entra en estado estático ("Manual") y la síntesis de voz indica: *"Paso manual. Presiona siguiente al completar"*. La aplicación se queda en espera activa hasta que el usuario toca el botón de avance.

---

## 🧩 La Matriz de Pasos: Los 4 Cuadrantes de Extracción

Usa libremente combinaciones de `water_g` y `duration_s` según el tipo de acción:

```
                      duration_s > 0 (Temporizado)      duration_s == 0 (Paso Manual)
                   ┌─────────────────────────────────┬─────────────────────────────────┐
  water_g > 0      │  CUADRANTE 1: VERTIDO CON TIEMPO│ CUADRANTE 2: VERTIDO MANUAL     │
  (Agrega agua)    │  • Preinfusión / Bloom vertido  │ • Llenar caldera de Moka        │
                   │  • Vertidos intermedios (pulsos)│ • Llenar tetera sin apuro       │
                   │  • Vertido continuo controlado  │ • Añadir bypass de agua final   │
                   ├─────────────────────────────────┼─────────────────────────────────┤
  water_g == 0     │  CUADRANTE 3: PAUSA / DRENAJE   │ CUADRANTE 4: ACCIÓN FÍSICA      │
  (Sin verter)     │  • Espera de preinfusión        │ • Enjuagar filtro y precalentar │
                   │  • Pausa de percolación/drenaje │ • Purgar agua / Tarar balanza   │
                   │  • Infusión estática (inmersión)│ • Romper costra / Desespumar    │
                   │  • Decantación de sedimentos    │ • Agitar (swirl) / Remover con cuchara
                   │  • Prensado lento de Aeropress  │ • Ensamblar / Servir taza final │
                   └─────────────────────────────────┴─────────────────────────────────┘
```

---

## 🔬 Arquetipos por Método de Preparación

Cuando el LLM diseñe recetas para métodos específicos, debe incluir los pasos característicos de cada técnica:

### 1. Filtrado / Pour-Over (V60, Chemex, Origami, Kalita Wave)
- **Fase de preparación (Opcional pero recomendada):** `water_g: 0, duration_s: 0` para purgar filtro de papel con agua caliente y descartar agua.
- **Bloom / Preinfusión:** Vertido de 2 a 3 veces el peso del café (ej: 40-50g) en 10-15s, seguido de una **pausa de bloom** de 30-45s (`water_g: 0, duration_s: 30-45`).
- **Pulsos intermedios:** Vertidos circulares suaves seguidos de pausas de drenaje (`water_g: 0, duration_s: 15-25`) para permitir que la cama baje.
- **Drenaje final:** Último paso sin agua (`water_g: 0, duration_s: 30-60`) para permitir el goteo completo hasta secar la cama.

### 2. Inmersión Total (Prensa Francesa / Cafetera de Émbolo)
- **Vertido completo:** Todo el volumen de agua de una sola vez (`duration_s: 30`).
- **Infusión inicial:** Reposo prolongado sin tocar (`water_g: 0, duration_s: 210-300`).
- **Ruptura de costra:** Paso manual (`water_g: 0, duration_s: 0`) para remover suavemente la costra superficial con cuchara.
- **Desespumado:** Paso manual (`water_g: 0, duration_s: 0`) para retirar espuma y restos amargos con dos cucharas.
- **Decantación de sedimentos:** Reposo profundo (`water_g: 0, duration_s: 300`) para que las partículas finas bajen al fondo.
- **Filtrado y servicio:** Paso manual (`water_g: 0, duration_s: 0`) para bajar el émbolo solo hasta la superficie y servir.

### 3. Híbridos / Presión (Aeropress - Tradicional o Invertida)
- **Preparación:** Montaje y precalentamiento (`water_g: 0, duration_s: 0`).
- **Infusión:** Vertido de agua + turbulencia/revolver con paleta (`water_g: 0, duration_s: 10-15`).
- **Colocar émbolo / sello de vacío:** Evitar que gotee (`water_g: 0, duration_s: 0`).
- **Prensado (Plunge):** Acción con tiempo controlado (`water_g: 0, duration_s: 25-35`) para un prensado constante hasta escuchar el siseo.

### 4. Cafetera Italiana / Moka Pot
- **Carga de agua:** Llenar base con agua caliente hasta válvula (`water_g: 200-250, duration_s: 0`).
- **Colocar canasta y café:** Paso manual (`water_g: 0, duration_s: 0`).
- **Fuego medio-bajo:** Espera de calentamiento (`water_g: 0, duration_s: 180-240`).
- **Flujo de café:** Reducir fuego y observar subida suave (`water_g: 0, duration_s: 45-60`).
- **Detener extracción:** Retirar y enfriar la base con agua fría (`water_g: 0, duration_s: 10-15`).

### 5. Té e Infusiones (Matcha, Sencha, Gongfu, Cold Brew)
- Ajustar temperatura más baja (70°C - 80°C para tés verdes).
- Batido de Matcha con batidor Chasen (`duration_s: 15-20`).
- Múltiples infusiones cortas para tés de especialidad en estilo oriental.

---

## 📐 Ratios de Extracción y Fórmulas de Referencia

| Método | Ratio Típico | Café (ejemplo) | Agua Total | Notas de Molienda |
| :--- | :---: | :---: | :---: | :--- |
| **V60 / Origami** | 1:15 a 1:16.6 | 15g | 225g - 250g | Medio-Fina (sal marina fina) |
| **Chemex** | 1:15 a 1:16 | 30g | 450g - 480g | Media / Medio-Gruesa (filtro grueso) |
| **Aeropress** | 1:11 a 1:14 | 15g | 180g - 220g | Fina a Medio-Fina |
| **Prensa Francesa** | 1:15 a 1:16.6 | 30g | 450g - 500g | Gruesa (para evitar sobreextracción) |
| **Moka** | 1:10 a 1:13 | 18g | 200g - 230g | Fina (sin llegar a espresso) |
| **Matcha Usucha** | 1:35 a 1:40 | 2g | 70g - 80g | Polvo fino tamizado (75°C - 80°C) |

$$\text{Agua Total} = \text{coffee\_g} \times \text{ratio}$$
$$\sum \text{steps.water\_g} = \text{Agua Total}$$

---

## 🧪 Ejemplos Contrastantes de Referencia

### Ejemplo A: Filtrado con Pulsos y Pausas de Drenaje (V60 4:6)

```json
{
  "id": "v60-tetsu-kasuya-4-6",
  "name": "V60 Método 4:6 (Tetsu Kasuya)",
  "method": "V60",
  "author": "Tetsu Kasuya",
  "description": "Controla acidez y dulzura con los dos primeros vertidos, y la fuerza con los tres vertidos finales.",
  "coffee_g": 20,
  "grind_size": "Gruesa",
  "water_temp_c": 92,
  "steps": [
    {
      "step_number": 1,
      "title": "Preparación y purgado",
      "water_g": 0,
      "duration_s": 0,
      "instruction": "Enjuaga el filtro de papel con agua caliente, descarta el agua y coloca los 20g de café nivelado."
    },
    {
      "step_number": 2,
      "title": "Primer vertido (Bloom)",
      "water_g": 50,
      "duration_s": 15,
      "instruction": "Vierte 50g en círculos concéntricos mojando todo el café."
    },
    {
      "step_number": 3,
      "title": "Pausa de absorción",
      "water_g": 0,
      "duration_s": 30,
      "instruction": "Espera a que el agua filtre casi por completo antes del segundo vertido."
    },
    {
      "step_number": 4,
      "title": "Segundo vertido",
      "water_g": 70,
      "duration_s": 15,
      "instruction": "Vierte 70g más de agua lentamente hacia el centro (acumulado 120g)."
    },
    {
      "step_number": 5,
      "title": "Pausa de balance",
      "water_g": 0,
      "duration_s": 30,
      "instruction": "Deja drenar la cama de café antes de iniciar la sección de fuerza."
    },
    {
      "step_number": 6,
      "title": "Tercer vertido",
      "water_g": 60,
      "duration_s": 15,
      "instruction": "Vierte 60g de agua en vertido suave (acumulado 180g)."
    },
    {
      "step_number": 7,
      "title": "Cuarto vertido",
      "water_g": 60,
      "duration_s": 15,
      "instruction": "Vierte 60g adicionales (acumulado 240g)."
    },
    {
      "step_number": 8,
      "title": "Quinto vertido final",
      "water_g": 60,
      "duration_s": 15,
      "instruction": "Vierte los últimos 60g de agua alcanzando los 300g totales."
    },
    {
      "step_number": 9,
      "title": "Drenaje final",
      "water_g": 0,
      "duration_s": 45,
      "instruction": "Permite que todo el líquido filtre por completo a través de la cama."
    }
  ]
}
```

### Ejemplo B: Inmersión Pura con Acciones Manuales (Prensa Francesa Hoffmann)

```json
{
  "id": "prensa-francesa-hoffmann",
  "name": "Prensa Francesa (Técnica Hoffmann)",
  "method": "Prensa Francesa",
  "author": "James Hoffmann",
  "description": "Técnica sin turbulencia para lograr un café limpio, dulce y con gran cuerpo sin sedimentos amargos.",
  "coffee_g": 30,
  "grind_size": "Gruesa",
  "water_temp_c": 95,
  "steps": [
    {
      "step_number": 1,
      "title": "Vertido total",
      "water_g": 500,
      "duration_s": 30,
      "instruction": "Vierte los 500g de agua caliente de manera constante sobre el café procurando mojar todas las partículas."
    },
    {
      "step_number": 2,
      "title": "Infusión estática",
      "water_g": 0,
      "duration_s": 210,
      "instruction": "Coloca la tapa con el émbolo arriba sin empujarlo. Deja infusionar en reposo total durante 3:30."
    },
    {
      "step_number": 3,
      "title": "Romper la costra",
      "water_g": 0,
      "duration_s": 0,
      "instruction": "Con una cuchara, remueve suavemente la superficie del café para que la mayoría de los granos caigan al fondo."
    },
    {
      "step_number": 4,
      "title": "Limpiar espuma",
      "water_g": 0,
      "duration_s": 0,
      "instruction": "Usa dos cucharas para retirar la espuma marrón clara y partículas flotantes que aportan astringencia."
    },
    {
      "step_number": 5,
      "title": "Decantación profunda",
      "water_g": 0,
      "duration_s": 300,
      "instruction": "Deja reposar 5 minutos sin mover la prensa para que los sedimentos finos se asienten por gravedad."
    },
    {
      "step_number": 6,
      "title": "Servir lentamente",
      "water_g": 0,
      "duration_s": 0,
      "instruction": "Coloca el émbolo rozando la superficie sin bajarlo hasta el fondo y sirve suavemente en tu taza."
    }
  ]
}
```

---

## ✅ Checklist de Autocorrección para el LLM

Antes de entregar el JSON generado, verifica cada uno de los siguientes puntos:

- [ ] **Sintaxis JSON válida:** Sin comentarios `//` dentro del código, sin comas finales (*trailing commas*), comillas dobles en todas las claves y textos.
- [ ] **Identificador (`id`):** En minúsculas y separado por guiones (`kebab-case`), único y descriptivo (ej: `chemex-3-vertidos`).
- [ ] **Consistencia matemática de agua:** La suma de todos los `water_g` de los pasos coincide exactamente con el agua total de la receta y con el ratio deseado.
- [ ] **Pausas de drenaje correctas:** En los pasos donde el agua simplemente drena o reposa, `water_g` es exactamente `0`.
- [ ] **Pasos manuales correctos:** En los pasos donde el usuario debe ejecutar una acción física a su propio ritmo (purgar, romper costra, desespumar, ensamblar, servir), `duration_s` es exactamente `0`.
- [ ] **Correlatividad de pasos:** Los valores de `step_number` inician en `1` y suben de 1 en 1 sin saltos.
- [ ] **Claridad de instrucciones:** Los textos de `instruction` son concisos, accionables y suenan naturales cuando son leídos en voz alta por el sintetizador de voz.
