# ☕ Barista Timer - Catálogo Público de Recetas

Este repositorio contiene el catálogo oficial y público de recetas de extracción de café y té para la aplicación **Barista Timer**.

El catálogo está diseñado para que la comunidad pueda contribuir con nuevas recetas de preparación (V60, Aeropress, Chemex, Prensa Francesa, Moka, Origami, Matcha, etc.) de forma modular y estandarizada.

---

## 📁 Estructura del Repositorio

```
barista-timer-recipes/
├── recipes/                    # Archivos JSON individuales de cada receta
│   ├── v60-tetsu-kasuya.json
│   ├── aeropress-standard.json
│   ├── moka-estandar.json
│   └── prensa-francesa-hoffmann.json
├── scripts/
│   └── build-catalog.js        # Script de empaquetado y validación de recetas
├── .github/
│   └── workflows/
│       └── catalog.yml         # CI/CD para validación en PRs y compilación en main
├── catalog.json                # Archivo compilado consumido por la aplicación
├── package.json
└── README.md
```

---

## 📋 Esquema de Datos de una Receta (`recipes/*.json`)

Cada receta individual debe guardarse como un archivo `.json` independiente dentro de la carpeta `recipes/`. El nombre del archivo debe coincidir con el `id` de la receta (ej: `v60-tetsu-kasuya.json`).

### Formato JSON:

```json
{
  "id": "v60-tetsu-kasuya",
  "name": "Método 4:6 (Tetsu Kasuya)",
  "method": "V60",
  "author": "Tetsu Kasuya",
  "description": "Receta ganadora del World Brewers Cup 2016 dividida en 5 vertidos.",
  "coffee_g": 20,
  "grind_size": "Gruesa (Coarse)",
  "water_temp_c": 92,
  "steps": [
    {
      "step_number": 1,
      "title": "Preparación y purgado",
      "water_g": 0,
      "duration_s": 0,
      "instruction": "Coloca el filtro de papel en el V60, enjuaga con agua caliente para purgar sabores a papel y precalentar el cono, descarta el agua y agrega los 20g de café molido."
    },
    {
      "step_number": 2,
      "title": "Preinfusión",
      "water_g": 50,
      "duration_s": 45,
      "instruction": "Vierte 50g de agua lentamente."
    }
  ]
}
```

### Campos Requeridos:
- **`id`** (`string`): Identificador único en minúsculas y separado por guiones (kebab-case).
- **`name`** (`string`): Nombre representativo de la receta.
- **`method`** (`string`): Método de extracción (ej: `V60`, `Aeropress`, `Moka`, `Chemex`, `Prensa Francesa`, `Origami`, `Matcha`, etc.).
- **`coffee_g`** (`number`): Cantidad de café o insumo en gramos.
- **`grind_size`** (`string`): Nivel de molienda sugerido (ej: `Fina`, `Medio-Fina`, `Media`, `Gruesa`).
- **`water_temp_c`** (`number`): Temperatura del agua en grados Celsius (°C).
- **`steps`** (`array`): Lista ordenada de pasos. Cada paso debe contener:
  - `step_number` (`number`): Índice correlativo iniciando en 1.
  - `title` (`string`): Título corto del paso.
  - `water_g` (`number`): Gramos de agua vertidos en este paso específico (o `0` si no aplica).
  - `duration_s` (`number`): Duración en segundos de la etapa (o `0` si es una acción instantánea).
  - `instruction` (`string`): Indicaciones breves para el usuario.

---

## 🛠️ Desarrollo Local

### Requisitos Prácticos
- Node.js (v18 o superior)
- npm

### 1. Instalación de dependencias
```bash
npm install
```

### 2. Ejecutar Pruebas Automatizadas
```bash
npm test
```

### 3. Empaquetar el Catálogo Localmente
Para consolidar todas las recetas de `recipes/` en `catalog.json`:
```bash
npm run build
```

---

## 🤖 Automatización y CI/CD

El repositorio utiliza **GitHub Actions** (`.github/workflows/catalog.yml`) para automatizar el catálogo:

1. **Pull Requests:** Al abrir un PR, el flujo de trabajo verifica que los archivos JSON sean válidos y cumplan la estructura requerida.
2. **Push a `main`:** Al fusionar cambios en la rama principal `main`, GitHub Actions ejecuta el empaquetado y actualiza `catalog.json` automáticamente de ser necesario.

El archivo `catalog.json` resultante es servido públicamente a la PWA **Barista Timer** vía GitHub Raw CDN:
`https://raw.githubusercontent.com/enmala/barista-timer-recipes/main/catalog.json`
