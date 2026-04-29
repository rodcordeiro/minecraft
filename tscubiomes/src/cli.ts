#!/usr/bin/env node
import { bedrockEngine } from "./engine/bedrock-engine.js";
import { loadKnownPointsFromFixture, suggestUnmappedVillages } from "./villages/suggestions.js";
import { MinecraftVersion, StructureType } from "./types.js";

const args = process.argv.slice(2);
const command = args[0];

try {
  const result = run(command, args.slice(1));
  console.log(JSON.stringify(wrapResult(result), null, 2));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(JSON.stringify({ status: "error", message }, null, 2));
  process.exitCode = 1;
}

function run(commandName: string | undefined, commandArgs: string[]) {
  switch (commandName) {
    case "structure-pos":
      return bedrockEngine.getStructureCandidate({
        edition: "bedrock",
        version: readOption(commandArgs, "--version", "BEDROCK_VERSION_TO_BE_CONFIRMED") as MinecraftVersion,
        seed: requiredOption(commandArgs, "--seed"),
        seedPolicy: readOption(commandArgs, "--seed-policy", "legacy-32") as "legacy-32",
        structureType: requiredOption(commandArgs, "--structure") as StructureType,
        regionX: requiredNumber(commandArgs, "--region-x"),
        regionZ: requiredNumber(commandArgs, "--region-z"),
      });

    case "scan-structures":
      return bedrockEngine.scanStructureAttempts({
        edition: "bedrock",
        version: readOption(commandArgs, "--version", "BEDROCK_VERSION_TO_BE_CONFIRMED") as MinecraftVersion,
        seed: requiredOption(commandArgs, "--seed"),
        seedPolicy: readOption(commandArgs, "--seed-policy", "legacy-32") as "legacy-32",
        structureType: requiredOption(commandArgs, "--structure") as StructureType,
        minX: requiredNumber(commandArgs, "--min-x"),
        minZ: requiredNumber(commandArgs, "--min-z"),
        maxX: requiredNumber(commandArgs, "--max-x"),
        maxZ: requiredNumber(commandArgs, "--max-z"),
      });

    case "slime-chunk":
      return {
        isSlimeChunk: bedrockEngine.isSlimeChunk({
          edition: "bedrock",
          seed: readOption(commandArgs, "--seed", "0") ?? "0",
          chunkX: requiredNumber(commandArgs, "--chunk-x"),
          chunkZ: requiredNumber(commandArgs, "--chunk-z"),
        }),
      };

    case "biome-at":
      return bedrockEngine.getBiomeAt({
        edition: "bedrock",
        version: readOption(commandArgs, "--version", "BEDROCK_VERSION_TO_BE_CONFIRMED") as MinecraftVersion,
        seed: requiredOption(commandArgs, "--seed"),
        dimension: "overworld",
        x: requiredNumber(commandArgs, "--x"),
        y: readNumber(commandArgs, "--y", 64),
        z: requiredNumber(commandArgs, "--z"),
      });

    case "suggest-villages": {
      const fixture = readOption(commandArgs, "--fixture");
      return suggestUnmappedVillages({
        seed: requiredOption(commandArgs, "--seed"),
        version: readOption(commandArgs, "--version", "BEDROCK_VERSION_TO_BE_CONFIRMED") as MinecraftVersion,
        seedPolicy: readOption(commandArgs, "--seed-policy", "legacy-32") as "legacy-32",
        centerX: readNumber(commandArgs, "--center-x", 0),
        centerZ: readNumber(commandArgs, "--center-z", 0),
        radius: readNumber(commandArgs, "--radius", 2000),
        limit: readNumber(commandArgs, "--limit", 2),
        excludeDistance: readNumber(commandArgs, "--exclude-distance", 256),
        knownPoints: fixture ? loadKnownPointsFromFixture(fixture) : [],
      });
    }

    default:
      return {
        status: "error",
        message:
          "Unknown command. Use structure-pos, scan-structures, slime-chunk, biome-at or suggest-villages.",
      };
  }
}

function readOption(argsList: string[], name: string, fallback?: string): string | undefined {
  const index = argsList.indexOf(name);
  if (index === -1) {
    return fallback;
  }

  return argsList[index + 1] ?? fallback;
}

function requiredOption(argsList: string[], name: string): string {
  const value = readOption(argsList, name);
  if (value === undefined) {
    throw new Error(`Missing required option ${name}`);
  }

  return value;
}

function requiredNumber(argsList: string[], name: string): number {
  const value = Number(requiredOption(argsList, name));
  if (!Number.isFinite(value)) {
    throw new Error(`Option ${name} must be a finite number`);
  }

  return value;
}

function readNumber(argsList: string[], name: string, fallback: number): number {
  const value = Number(readOption(argsList, name, fallback.toString()));
  if (!Number.isFinite(value)) {
    throw new Error(`Option ${name} must be a finite number`);
  }

  return value;
}

function wrapResult(result: unknown) {
  if (
    result &&
    typeof result === "object" &&
    "status" in result &&
    (result as { readonly status?: unknown }).status === "unsupported"
  ) {
    return result;
  }

  if (
    result &&
    typeof result === "object" &&
    "status" in result &&
    (result as { readonly status?: unknown }).status === "error"
  ) {
    return result;
  }

  return {
    status: "ok",
    data: result,
  };
}
