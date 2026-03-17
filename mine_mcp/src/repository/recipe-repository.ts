import fs from "node:fs/promises";
import path from "node:path";
import { Recipe, RecipeStore } from "../types.js";

const emptyStore: RecipeStore = { recipes: [] };

export class RecipeRepository {
  constructor(private readonly dataFile: string) {}

  /** Returns all stored recipes, creating the file lazily if needed. */
  async list(): Promise<Recipe[]> {
    const store = await this.readStore();
    return [...store.recipes];
  }

  /** Saves a recipe and replaces any existing entry that shares the same id. */
  async save(recipe: Recipe): Promise<Recipe> {
    const store = await this.readStore();
    const nextRecipes = [...store.recipes.filter((item) => item.id !== recipe.id), recipe];
    nextRecipes.sort((left, right) => left.name.localeCompare(right.name));
    await this.writeStore({ recipes: nextRecipes });
    return recipe;
  }

  /** Finds a recipe by name using a case-insensitive comparison. */
  async findByName(name: string): Promise<Recipe | undefined> {
    const normalizedName = normalizeText(name);
    const store = await this.readStore();
    return store.recipes.find((recipe) => normalizeText(recipe.name) === normalizedName);
  }

  /** Reads the recipe store from disk and ensures a valid shape. */
  private async readStore(): Promise<RecipeStore> {
    try {
      const raw = await fs.readFile(this.dataFile, "utf-8");
      const parsed = JSON.parse(raw) as RecipeStore;
      return {
        recipes: Array.isArray(parsed.recipes) ? parsed.recipes : []
      };
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code === "ENOENT") {
        await this.writeStore(emptyStore);
        return emptyStore;
      }

      throw error;
    }
  }

  /** Persists the recipe store in a stable JSON format. */
  private async writeStore(store: RecipeStore): Promise<void> {
    await fs.mkdir(path.dirname(this.dataFile), { recursive: true });
    await fs.writeFile(this.dataFile, JSON.stringify(store, null, 2) + "\n", "utf-8");
  }
}

/** Normalizes user-facing text fields for lookups. */
function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase("pt-BR");
}
