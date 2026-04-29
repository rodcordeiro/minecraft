import { IntegerSeed } from "../core/numeric.js";
import { StructureAttempt, StructureScanRequest } from "../bedrock/structures.js";
import { SlimeChunkRequest } from "../structures/slime.js";
import {
  StructureViabilityRequest,
  StructureViabilityResult,
} from "../structures/viability.js";
import {
  BiomeId,
  Dimension,
  MinecraftEdition,
  MinecraftVersion,
  StructureType,
} from "../types.js";

export interface BiomeAtRequest {
  readonly edition: MinecraftEdition;
  readonly version: MinecraftVersion;
  readonly seed: IntegerSeed;
  readonly dimension: Dimension;
  readonly x: number;
  readonly y?: number;
  readonly z: number;
}

export interface UnsupportedResult {
  readonly status: "unsupported";
  readonly reason: string;
}

export interface BiomeAtResult extends UnsupportedResult {
  readonly edition: MinecraftEdition;
  readonly version: MinecraftVersion;
  readonly dimension: Dimension;
  readonly x: number;
  readonly y?: number;
  readonly z: number;
  readonly biome?: BiomeId;
}

export interface StructureCandidateEngineRequest {
  readonly edition: MinecraftEdition;
  readonly version: MinecraftVersion;
  readonly seed: IntegerSeed;
  readonly structureType: StructureType;
  readonly regionX: number;
  readonly regionZ: number;
  readonly seedPolicy?: "preserve-64" | "legacy-32";
}

export interface WorldgenEngine {
  readonly edition: MinecraftEdition;

  getStructureCandidate(request: StructureCandidateEngineRequest): StructureAttempt;

  scanStructureAttempts(request: StructureScanRequest): StructureAttempt[];

  isSlimeChunk(request: SlimeChunkRequest): boolean;

  isViableStructurePos(request: StructureViabilityRequest): StructureViabilityResult;

  getBiomeAt(request: BiomeAtRequest): BiomeAtResult;
}
