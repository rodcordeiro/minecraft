import { UnsupportedEditionFeatureError, UnsupportedStructureError } from "../core/errors.js";
import { BiomeInput, getBiomeId } from "../biomes/registry.js";
import { MinecraftEdition, MinecraftVersion, StructureType } from "../types.js";
import { StructureAttempt } from "../bedrock/structures.js";

export type BiomeViabilityStatus =
  | "attempt_found"
  | "biome_viable"
  | "biome_not_viable"
  | "biome_unknown"
  | "not_found";

export type BiomeSource = "manual" | "fixture" | "engine";

export interface FeatureBiomeRequest {
  readonly edition: MinecraftEdition;
  readonly version: MinecraftVersion;
  readonly structureType: StructureType;
  readonly biome: BiomeInput;
}

export interface StructureViabilityRequest {
  readonly edition: MinecraftEdition;
  readonly version: MinecraftVersion;
  readonly structureType: StructureType;
  readonly attempt?: StructureAttempt | null;
  readonly biome?: BiomeInput;
  readonly biomeSource?: BiomeSource;
}

export interface StructureViabilityResult {
  readonly edition: MinecraftEdition;
  readonly version: MinecraftVersion;
  readonly structureType: StructureType;
  readonly status: BiomeViabilityStatus;
  readonly biome?: string;
  readonly biomeSource?: BiomeSource;
  readonly attempt?: StructureAttempt;
}

const VILLAGE_BIOMES = new Set<string>([
  "plains",
  "sunflower_plains",
  "savanna",
  "desert",
  "taiga",
  "taiga_hills",
  "snowy_plains",
  "snowy_taiga",
  "snowy_taiga_hills",
]);

const SWAMP_HUT_BIOMES = new Set<string>(["swamp"]);

export function getViableBiomesForStructure(structureType: StructureType): readonly string[] {
  switch (structureType) {
    case "Village":
      return [...VILLAGE_BIOMES];
    case "Swamp_Hut":
      return [...SWAMP_HUT_BIOMES];
    default:
      throw new UnsupportedStructureError(
        structureType,
        "biome viability is implemented only for Village and Swamp_Hut",
      );
  }
}

export function isViableFeatureBiome(request: FeatureBiomeRequest): boolean {
  if (request.edition !== "bedrock") {
    throw new UnsupportedEditionFeatureError("isViableFeatureBiome", request.edition);
  }

  const biomeId = getBiomeId(request.biome);
  if (!biomeId) {
    return false;
  }

  return getViableBiomesForStructure(request.structureType).includes(biomeId);
}

export function isViableStructurePos(
  request: StructureViabilityRequest,
): StructureViabilityResult {
  if (request.edition !== "bedrock") {
    throw new UnsupportedEditionFeatureError("isViableStructurePos", request.edition);
  }

  if (!request.attempt) {
    return {
      edition: request.edition,
      version: request.version,
      structureType: request.structureType,
      status: "not_found",
    };
  }

  if (!request.biome) {
    return {
      edition: request.edition,
      version: request.version,
      structureType: request.structureType,
      status: "biome_unknown",
      attempt: request.attempt,
    };
  }

  const biomeId = getBiomeId(request.biome);
  if (!biomeId) {
    return {
      edition: request.edition,
      version: request.version,
      structureType: request.structureType,
      status: "biome_unknown",
      biomeSource: request.biomeSource ?? "manual",
      attempt: request.attempt,
    };
  }

  const viable = biomeId
    ? isViableFeatureBiome({
        edition: request.edition,
        version: request.version,
        structureType: request.structureType,
        biome: biomeId,
      })
    : false;

  return {
    edition: request.edition,
    version: request.version,
    structureType: request.structureType,
    status: viable ? "biome_viable" : "biome_not_viable",
    biome: biomeId,
    biomeSource: request.biomeSource ?? "manual",
    attempt: request.attempt,
  };
}
