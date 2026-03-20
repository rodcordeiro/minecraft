import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, "..");
const workspaceRoot = path.resolve(projectRoot, "..");

export const paths = {
  projectRoot,
  workspaceRoot,
  dataFile: path.join(projectRoot, "data", "points.json"),
  recipesFile: path.join(projectRoot, "data", "recipes.json"),
  worldDir: path.join(workspaceRoot, "world"),
  outputDir: path.join(workspaceRoot, "output"),
  downloadsDir: path.join(workspaceRoot, "downloads")
};
