import { UnsupportedEditionFeatureError, UnsupportedStructureError } from "../core/errors.js";
import { addUint32, floorDiv, floorMod, IntegerSeed } from "../core/numeric.js";
import {
  BlockPosition,
  ChunkPosition,
  MinecraftEdition,
  MinecraftVersion,
  StructureSupportStatus,
  StructureType,
} from "../types.js";
import { BedrockRandom } from "./bedrock-random.js";
import { BedrockSeedPolicy, parseBedrockSeed, requireLegacyBedrockSeed } from "./seed.js";

export interface BedrockStructureConfig {
  readonly edition: "bedrock";
  readonly structureType: StructureType;
  readonly spacing: number;
  readonly spawnRange: number;
  readonly salt: number;
  readonly randomValues: 2 | 4;
  readonly support: StructureSupportStatus;
  readonly requiresBiomeCheck: boolean;
}

export interface StructureCandidateRequest {
  readonly edition: MinecraftEdition;
  readonly version: MinecraftVersion;
  readonly seed: IntegerSeed;
  readonly structureType: StructureType;
  readonly regionX: number;
  readonly regionZ: number;
  readonly seedPolicy?: BedrockSeedPolicy;
}

export interface StructureScanRequest {
  readonly edition: MinecraftEdition;
  readonly version: MinecraftVersion;
  readonly seed: IntegerSeed;
  readonly structureType: StructureType;
  readonly minX: number;
  readonly minZ: number;
  readonly maxX: number;
  readonly maxZ: number;
  readonly seedPolicy?: BedrockSeedPolicy;
}

export interface StructureAttempt {
  readonly edition: "bedrock";
  readonly version: MinecraftVersion;
  readonly structureType: StructureType;
  readonly status: "attempt";
  readonly biomeStatus: "biome_unknown";
  readonly region: ChunkPosition;
  readonly chunk: ChunkPosition;
  readonly block: BlockPosition;
  readonly config: BedrockStructureConfig;
}

const BEDROCK_STRUCTURE_CONFIGS: ReadonlyMap<StructureType, BedrockStructureConfig> = new Map([
  [
    "Village",
    {
      edition: "bedrock",
      structureType: "Village",
      spacing: 27,
      spawnRange: 17,
      salt: 10387312,
      randomValues: 4,
      support: "experimental",
      requiresBiomeCheck: true,
    },
  ],
  [
    "Swamp_Hut",
    {
      edition: "bedrock",
      structureType: "Swamp_Hut",
      spacing: 32,
      spawnRange: 24,
      salt: 14357617,
      randomValues: 2,
      support: "experimental",
      requiresBiomeCheck: true,
    },
  ],
  [
    "Desert_Temple",
    {
      edition: "bedrock",
      structureType: "Desert_Temple",
      spacing: 32,
      spawnRange: 24,
      salt: 14357617,
      randomValues: 2,
      support: "blocked",
      requiresBiomeCheck: true,
    },
  ],
  [
    "Jungle_Temple",
    {
      edition: "bedrock",
      structureType: "Jungle_Temple",
      spacing: 32,
      spawnRange: 24,
      salt: 14357617,
      randomValues: 2,
      support: "blocked",
      requiresBiomeCheck: true,
    },
  ],
  [
    "Igloo",
    {
      edition: "bedrock",
      structureType: "Igloo",
      spacing: 32,
      spawnRange: 24,
      salt: 14357617,
      randomValues: 2,
      support: "blocked",
      requiresBiomeCheck: true,
    },
  ],
  [
    "Ocean_Monument",
    {
      edition: "bedrock",
      structureType: "Ocean_Monument",
      spacing: 32,
      spawnRange: 27,
      salt: 10387313,
      randomValues: 4,
      support: "blocked",
      requiresBiomeCheck: true,
    },
  ],
  [
    "Woodland_Mansion",
    {
      edition: "bedrock",
      structureType: "Woodland_Mansion",
      spacing: 80,
      spawnRange: 60,
      salt: 10387319,
      randomValues: 4,
      support: "blocked",
      requiresBiomeCheck: true,
    },
  ],
  [
    "Buried_Treasure",
    {
      edition: "bedrock",
      structureType: "Buried_Treasure",
      spacing: 4,
      spawnRange: 2,
      salt: 16842397,
      randomValues: 4,
      support: "blocked",
      requiresBiomeCheck: true,
    },
  ],
]);

const BLOCKED_STRUCTURES = new Set<StructureType>([
  "Stronghold",
  "Mineshaft",
  "Ocean_Ruin",
  "Shipwreck",
  "Ruined_Portal",
  "Nether_Fortress",
  "Bastion",
  "End_City",
]);

export function getBedrockStructureSupport(
  structureType: StructureType,
): StructureSupportStatus {
  const config = BEDROCK_STRUCTURE_CONFIGS.get(structureType);
  if (config) {
    return config.support;
  }

  if (BLOCKED_STRUCTURES.has(structureType)) {
    return "blocked";
  }

  return "blocked";
}

export function getBedrockStructureConfig(
  structureType: StructureType,
): BedrockStructureConfig {
  const config = BEDROCK_STRUCTURE_CONFIGS.get(structureType);

  if (!config) {
    throw new UnsupportedStructureError(
      structureType,
      "no Bedrock candidate algorithm has been validated",
    );
  }

  if (config.support === "blocked") {
    throw new UnsupportedStructureError(
      structureType,
      "Bedrock support is blocked until external fixtures are available",
    );
  }

  return config;
}

export function getStructureConfig(request: {
  readonly edition: MinecraftEdition;
  readonly version: MinecraftVersion;
  readonly structureType: StructureType;
}): BedrockStructureConfig {
  if (request.edition !== "bedrock") {
    throw new UnsupportedEditionFeatureError("getStructureConfig", request.edition);
  }

  return getBedrockStructureConfig(request.structureType);
}

export function getBedrockStructureCandidate(
  request: StructureCandidateRequest,
): StructureAttempt {
  if (request.edition !== "bedrock") {
    throw new UnsupportedEditionFeatureError("getBedrockStructureCandidate", request.edition);
  }

  assertIntegerCoordinate(request.regionX, "regionX");
  assertIntegerCoordinate(request.regionZ, "regionZ");

  const seed = resolveStructureSeed(request.seed, request.seedPolicy);
  const config = getBedrockStructureConfig(request.structureType);
  const areaSeed = calculateBedrockAreaSeed(
    seed,
    request.regionX,
    request.regionZ,
    config.salt,
  );
  const random = new BedrockRandom(areaSeed);
  const offsets = getCandidateOffsets(random, config);
  const chunk = {
    x: request.regionX * config.spacing + offsets.x,
    z: request.regionZ * config.spacing + offsets.z,
  };

  return {
    edition: "bedrock",
    version: request.version,
    structureType: request.structureType,
    status: "attempt",
    biomeStatus: "biome_unknown",
    region: {
      x: request.regionX,
      z: request.regionZ,
    },
    chunk,
    block: {
      x: chunk.x * 16 + 8,
      z: chunk.z * 16 + 8,
    },
    config,
  };
}

export function scanBedrockStructureAttempts(
  request: StructureScanRequest,
): StructureAttempt[] {
  if (request.edition !== "bedrock") {
    throw new UnsupportedEditionFeatureError("scanBedrockStructureAttempts", request.edition);
  }

  const minX = Math.min(request.minX, request.maxX);
  const maxX = Math.max(request.minX, request.maxX);
  const minZ = Math.min(request.minZ, request.maxZ);
  const maxZ = Math.max(request.minZ, request.maxZ);
  const config = getBedrockStructureConfig(request.structureType);
  const minRegionX = blockToRegion(minX, config.spacing);
  const maxRegionX = blockToRegion(maxX, config.spacing);
  const minRegionZ = blockToRegion(minZ, config.spacing);
  const maxRegionZ = blockToRegion(maxZ, config.spacing);
  const attempts: StructureAttempt[] = [];

  for (let regionX = minRegionX; regionX <= maxRegionX; regionX++) {
    for (let regionZ = minRegionZ; regionZ <= maxRegionZ; regionZ++) {
      const attempt = getBedrockStructureCandidate({
        edition: "bedrock",
        version: request.version,
        seed: request.seed,
        structureType: request.structureType,
        regionX,
        regionZ,
        ...(request.seedPolicy === undefined ? {} : { seedPolicy: request.seedPolicy }),
      });

      if (
        attempt.block.x >= minX &&
        attempt.block.x <= maxX &&
        attempt.block.z >= minZ &&
        attempt.block.z <= maxZ
      ) {
        attempts.push(attempt);
      }
    }
  }

  return attempts;
}

export const scanStructureAttempts = scanBedrockStructureAttempts;
export const getStructurePos = getBedrockStructureCandidate;

export function blockToChunk(blockCoordinate: number): number {
  assertIntegerCoordinate(blockCoordinate, "blockCoordinate");
  return floorDiv(blockCoordinate, 16);
}

export function chunkToRegion(chunkCoordinate: number, spacing: number): number {
  assertIntegerCoordinate(chunkCoordinate, "chunkCoordinate");
  assertIntegerCoordinate(spacing, "spacing");
  return floorDiv(chunkCoordinate, spacing);
}

export function blockToRegion(blockCoordinate: number, spacing: number): number {
  return chunkToRegion(blockToChunk(blockCoordinate), spacing);
}

export function calculateBedrockAreaSeed(
  worldSeed: number,
  regionX: number,
  regionZ: number,
  salt: number,
): number {
  return addUint32(
    addUint32(salt, worldSeed),
    -245998635n * BigInt(regionZ) - 1724254968n * BigInt(regionX),
  );
}

function getCandidateOffsets(
  random: BedrockRandom,
  config: BedrockStructureConfig,
): ChunkPosition {
  const first = random.nextInt(config.spawnRange);
  const second = random.nextInt(config.spawnRange);

  if (config.randomValues === 2) {
    return {
      x: first,
      z: second,
    };
  }

  return {
    x: floorDiv(first + second, 2),
    z: floorDiv(random.nextInt(config.spawnRange) + random.nextInt(config.spawnRange), 2),
  };
}

function assertIntegerCoordinate(value: number, label: string): void {
  if (!Number.isInteger(value)) {
    throw new RangeError(`${label} must be an integer.`);
  }
}

function resolveStructureSeed(seed: IntegerSeed, policy?: BedrockSeedPolicy): number {
  if (policy === "legacy-32") {
    const parsed = parseBedrockSeed(seed, policy);
    return parsed.uint32 ?? 0;
  }

  return requireLegacyBedrockSeed(seed);
}
