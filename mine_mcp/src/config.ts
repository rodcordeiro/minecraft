import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, "..");

export const paths = {
  projectRoot,
  dataFile: path.join(projectRoot, "data", "points.json"),
  recipesFile: path.join(projectRoot, "data", "recipes.json"),
  worldDir: path.resolve(projectRoot, "..", "world"),
  outputDir: path.resolve(projectRoot, "..", "output")
};
