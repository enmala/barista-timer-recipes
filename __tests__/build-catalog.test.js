import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { validateRecipe, buildCatalog } from '../scripts/build-catalog.js';

describe('validateRecipe', () => {
  it('debe validar exitosamente una receta correcta', () => {
    const validRecipe = {
      id: 'test-recipe',
      name: 'Test Recipe',
      method: 'V60',
      coffee_g: 15,
      grind_size: 'Media',
      water_temp_c: 90,
      steps: [
        {
          step_number: 1,
          title: 'Preinfusión',
          water_g: 50,
          duration_s: 30,
          instruction: 'Verter 50g de agua',
        },
      ],
    };

    const errors = validateRecipe(validRecipe, 'test-recipe.json');
    expect(errors).toHaveLength(0);
  });

  it('debe detectar campos faltantes o inválidos', () => {
    const invalidRecipe = {
      id: 123, // debe ser string
      name: '',
      method: 'V60',
      coffee_g: -5, // debe ser > 0
      grind_size: 'Media',
      water_temp_c: 'invalid', // debe ser number
      steps: [], // debe tener al menos un paso
    };

    const errors = validateRecipe(invalidRecipe, 'invalid-recipe.json');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("'id'"))).toBe(true);
    expect(errors.some((e) => e.includes("'coffee_g'"))).toBe(true);
    expect(errors.some((e) => e.includes("'water_temp_c'"))).toBe(true);
    expect(errors.some((e) => e.includes("'steps'"))).toBe(true);
  });
});

describe('buildCatalog', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'recipes-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('debe empaquetar recetas de un directorio temporal correctamente', () => {
    const r1 = {
      id: 'recipe-b',
      name: 'Recipe B',
      method: 'Chemex',
      coffee_g: 20,
      grind_size: 'Gruesa',
      water_temp_c: 94,
      steps: [
        { step_number: 1, title: 'Vertido', water_g: 300, duration_s: 180, instruction: 'Verter todo' },
      ],
    };

    const r2 = {
      id: 'recipe-a',
      name: 'Recipe A',
      method: 'Aeropress',
      coffee_g: 15,
      grind_size: 'Fina',
      water_temp_c: 88,
      steps: [
        { step_number: 1, title: 'Mezcla', water_g: 200, duration_s: 60, instruction: 'Agitar y presionar' },
      ],
    };

    fs.writeFileSync(path.join(tempDir, 'recipe-b.json'), JSON.stringify(r1));
    fs.writeFileSync(path.join(tempDir, 'recipe-a.json'), JSON.stringify(r2));

    const result = buildCatalog(tempDir);
    expect(result).toHaveLength(2);
    // Debe estar ordenado alfabéticamente por id
    expect(result[0].id).toBe('recipe-a');
    expect(result[1].id).toBe('recipe-b');
  });

  it('debe lanzar error cuando existen IDs duplicados', () => {
    const r1 = {
      id: 'duplicate-id',
      name: 'Recipe 1',
      method: 'V60',
      coffee_g: 15,
      grind_size: 'Media',
      water_temp_c: 90,
      steps: [{ step_number: 1, title: 'Vertido', water_g: 100, duration_s: 30, instruction: 'Instrucción' }],
    };

    const r2 = { ...r1, name: 'Recipe 2' };

    fs.writeFileSync(path.join(tempDir, 'r1.json'), JSON.stringify(r1));
    fs.writeFileSync(path.join(tempDir, 'r2.json'), JSON.stringify(r2));

    expect(() => buildCatalog(tempDir)).toThrow(/ID duplicado detectado/);
  });
});
