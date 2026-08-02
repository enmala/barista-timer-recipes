import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const RECIPES_DIR = path.join(ROOT_DIR, 'recipes');
const CATALOG_PATH = path.join(ROOT_DIR, 'catalog.json');

export function validateRecipe(recipe, filename = 'receta') {
  const errors = [];

  if (!recipe || typeof recipe !== 'object' || Array.isArray(recipe)) {
    return [`[${filename}] El contenido debe ser un objeto JSON válido.`];
  }

  if (!recipe.id || typeof recipe.id !== 'string') {
    errors.push(`[${filename}] El campo 'id' es requerido y debe ser un string.`);
  }

  if (!recipe.name || typeof recipe.name !== 'string') {
    errors.push(`[${filename}] El campo 'name' es requerido y debe ser un string.`);
  }

  if (!recipe.method || typeof recipe.method !== 'string') {
    errors.push(`[${filename}] El campo 'method' es requerido y debe ser un string.`);
  }

  if (typeof recipe.coffee_g !== 'number' || isNaN(recipe.coffee_g) || recipe.coffee_g <= 0) {
    errors.push(`[${filename}] El campo 'coffee_g' es requerido y debe ser un número mayor a 0.`);
  }

  if (!recipe.grind_size || typeof recipe.grind_size !== 'string') {
    errors.push(`[${filename}] El campo 'grind_size' es requerido y debe ser un string.`);
  }

  if (typeof recipe.water_temp_c !== 'number' || isNaN(recipe.water_temp_c) || recipe.water_temp_c <= 0) {
    errors.push(`[${filename}] El campo 'water_temp_c' es requerido y debe ser un número mayor a 0.`);
  }

  if (!Array.isArray(recipe.steps) || recipe.steps.length === 0) {
    errors.push(`[${filename}] El campo 'steps' debe ser un arreglo no vacío de pasos.`);
  } else {
    recipe.steps.forEach((step, idx) => {
      const stepIdx = idx + 1;
      if (!step || typeof step !== 'object') {
        errors.push(`[${filename}] El paso #${stepIdx} debe ser un objeto.`);
        return;
      }
      if (typeof step.step_number !== 'number') {
        errors.push(`[${filename}] El paso #${stepIdx} requiere 'step_number' como número.`);
      }
      if (!step.title || typeof step.title !== 'string') {
        errors.push(`[${filename}] El paso #${stepIdx} requiere 'title' como string.`);
      }
      if (typeof step.water_g !== 'number' || isNaN(step.water_g)) {
        errors.push(`[${filename}] El paso #${stepIdx} requiere 'water_g' como número.`);
      }
      if (typeof step.duration_s !== 'number' || isNaN(step.duration_s)) {
        errors.push(`[${filename}] El paso #${stepIdx} requiere 'duration_s' como número.`);
      }
      if (!step.instruction || typeof step.instruction !== 'string') {
        errors.push(`[${filename}] El paso #${stepIdx} requiere 'instruction' como string.`);
      }
    });
  }

  return errors;
}

export function buildCatalog(recipesDirectory = RECIPES_DIR) {
  if (!fs.existsSync(recipesDirectory)) {
    throw new Error(`El directorio de recetas '${recipesDirectory}' no existe.`);
  }

  const files = fs.readdirSync(recipesDirectory).filter((file) => file.endsWith('.json'));
  if (files.length === 0) {
    throw new Error(`No se encontraron archivos JSON de recetas en '${recipesDirectory}'.`);
  }

  const recipes = [];
  const allErrors = [];
  const seenIds = new Set();

  for (const file of files) {
    const filePath = path.join(recipesDirectory, file);
    let recipe;
    try {
      const rawContent = fs.readFileSync(filePath, 'utf-8');
      recipe = JSON.parse(rawContent);
    } catch (err) {
      allErrors.push(`[${file}] Error de sintaxis JSON: ${err.message}`);
      continue;
    }

    const errors = validateRecipe(recipe, file);
    if (errors.length > 0) {
      allErrors.push(...errors);
    } else {
      if (seenIds.has(recipe.id)) {
        allErrors.push(`[${file}] ID duplicado detectado: '${recipe.id}'.`);
      } else {
        seenIds.add(recipe.id);
        recipes.push(recipe);
      }
    }
  }

  if (allErrors.length > 0) {
    throw new Error(`Se encontraron errores al validar las recetas:\n- ${allErrors.join('\n- ')}`);
  }

  recipes.sort((a, b) => a.id.localeCompare(b.id));
  return recipes;
}

function runCLI() {
  try {
    console.log('🔄 Procesando y validando recetas...');
    const catalogData = buildCatalog(RECIPES_DIR);
    fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalogData, null, 2) + '\n', 'utf-8');
    console.log(`✅ Catálogo generado exitosamente con ${catalogData.length} recetas en: catalog.json`);
  } catch (err) {
    console.error(`❌ Falló la generación del catálogo:`);
    console.error(err.message);
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  runCLI();
}
