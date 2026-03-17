import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { RecipeRepository } from "../src/repository/recipe-repository.js";
import { RecipeService, normalizeRecipeType } from "../src/services/recipe-service.js";

describe("RecipeService", () => {
  let tempDir: string;
  let repository: RecipeRepository;
  let service: RecipeService;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "mine-mcp-recipe-service-"));
    repository = new RecipeRepository(path.join(tempDir, "recipes.json"));
    service = new RecipeService(repository);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("normalizes aliases for supported recipe types", () => {
    expect(normalizeRecipeType("bloco")).toBe("block");
    expect(normalizeRecipeType("construção")).toBe("build");
    expect(normalizeRecipeType("poção")).toBe("potion");
    expect(normalizeRecipeType("qualquer coisa")).toBe("custom");
  });

  it("registers and updates a recipe without duplicating it", async () => {
    const first = await service.registerRecipe({
      name: "IronFarm",
      type: "farm",
      summary: "Versao inicial.",
      resources: ["20 camas"],
      process: ["Passo 1"]
    });

    const second = await service.registerRecipe({
      name: "IronFarm",
      type: "farm",
      summary: "Versao final.",
      resources: ["20 camas", "4 funis"],
      process: ["Passo 1", "Passo 2"],
      tags: ["ferro"]
    });

    const recipes = await service.listRecipes();

    expect(recipes).toHaveLength(1);
    expect(second.id).toBe(first.id);
    expect(recipes[0]).toMatchObject({
      name: "IronFarm",
      summary: "Versao final.",
      resources: ["20 camas", "4 funis"],
      tags: ["ferro"]
    });
  });

  it("returns a recipe by name", async () => {
    await service.registerRecipe({
      name: "Pocao de Cura",
      type: "potion",
      summary: "Recupera vida.",
      resources: ["Frasco"],
      process: ["Prepare o suporte"]
    });

    const recipe = await service.getRecipeByName("pocao de cura");

    expect(recipe.name).toBe("Pocao de Cura");
    expect(recipe.type).toBe("potion");
  });

  it("filters recipes by normalized type", async () => {
    await service.registerRecipe({
      name: "Fornalha",
      type: "block",
      summary: "Bloco utilitario.",
      resources: ["8 pedregulhos"],
      process: ["Monte na bancada"]
    });

    await service.registerRecipe({
      name: "IronFarm",
      type: "farm",
      summary: "Farm de ferro.",
      resources: ["20 camas"],
      process: ["Monte a base"]
    });

    const recipes = await service.listRecipes("bloco");

    expect(recipes).toHaveLength(1);
    expect(recipes[0].name).toBe("Fornalha");
  });
});
