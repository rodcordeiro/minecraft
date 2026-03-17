import { randomUUID } from "node:crypto";
import { RecipeRepository } from "../repository/recipe-repository.js";
import { Recipe, RecipeType } from "../types.js";

const recipeTypeAliases: Record<string, RecipeType> = {
  bloco: "block",
  block: "block",
  construcao: "build",
  construção: "build",
  build: "build",
  farm: "farm",
  pocao: "potion",
  poção: "potion",
  potion: "potion",
  custom: "custom"
};

export interface RegisterRecipeInput {
  name: string;
  type: string;
  summary: string;
  resources: string[];
  process: string[];
  tags?: string[];
}

export class RecipeService {
  constructor(private readonly repository: RecipeRepository) {}

  /** Registers or updates a recipe identified by name. */
  async registerRecipe(input: RegisterRecipeInput): Promise<Recipe> {
    const now = new Date().toISOString();
    const existing = await this.repository.findByName(input.name);
    const recipe: Recipe = {
      id: existing?.id ?? randomUUID(),
      name: input.name.trim(),
      type: normalizeRecipeType(input.type),
      summary: input.summary.trim(),
      resources: normalizeEntries(input.resources),
      process: normalizeEntries(input.process),
      tags: normalizeTags(input.tags),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };

    return this.repository.save(recipe);
  }

  /** Lists recipes, optionally filtering by normalized recipe type. */
  async listRecipes(type?: string): Promise<Recipe[]> {
    const recipes = await this.repository.list();
    if (!type) {
      return recipes;
    }

    const normalizedType = normalizeRecipeType(type);
    return recipes.filter((recipe) => recipe.type === normalizedType);
  }

  /** Returns a single recipe by name and fails when it does not exist. */
  async getRecipeByName(name: string): Promise<Recipe> {
    const recipe = await this.repository.findByName(name);
    if (!recipe) {
      throw new Error(`Recipe "${name}" was not found.`);
    }

    return recipe;
  }
}

/** Normalizes supported recipe aliases to the internal enum. */
export function normalizeRecipeType(value: string): RecipeType {
  const normalized = value.trim().toLocaleLowerCase("pt-BR");
  return recipeTypeAliases[normalized] ?? "custom";
}

/** Trims list entries and removes duplicates while preserving order. */
function normalizeEntries(entries: string[]): string[] {
  return [...new Set(entries.map((entry) => entry.trim()).filter(Boolean))];
}

/** Trims recipe tags and removes duplicates while preserving order. */
function normalizeTags(tags?: string[]): string[] {
  if (!tags) {
    return [];
  }

  return normalizeEntries(tags);
}
