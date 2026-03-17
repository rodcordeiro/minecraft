import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { RecipeRepository } from "../src/repository/recipe-repository.js";
import { Recipe } from "../src/types.js";

describe("RecipeRepository", () => {
  let tempDir: string;
  let dataFile: string;
  let repository: RecipeRepository;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "mine-mcp-recipes-"));
    dataFile = path.join(tempDir, "recipes.json");
    repository = new RecipeRepository(dataFile);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("creates the recipe store lazily when listing", async () => {
    const recipes = await repository.list();

    expect(recipes).toEqual([]);
    const raw = await fs.readFile(dataFile, "utf-8");
    expect(JSON.parse(raw)).toEqual({ recipes: [] });
  });

  it("saves and retrieves recipes by name", async () => {
    const recipe: Recipe = {
      id: "ironfarm-1",
      name: "IronFarm",
      type: "farm",
      summary: "Farm de ferro.",
      resources: ["20 camas"],
      process: ["Monte a area dos villagers."],
      tags: ["ferro"],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    };

    await repository.save(recipe);

    await expect(repository.findByName("ironfarm")).resolves.toEqual(recipe);
  });
});
