import {
  getBedrockStructureCandidate,
  scanBedrockStructureAttempts,
} from "../bedrock/structures.js";
import { isSlimeChunk } from "../structures/slime.js";
import { isViableStructurePos } from "../structures/viability.js";
import {
  BiomeAtRequest,
  BiomeAtResult,
  StructureCandidateEngineRequest,
  WorldgenEngine,
} from "./worldgen-engine.js";

export class BedrockEngine implements WorldgenEngine {
  public readonly edition = "bedrock" as const;

  public getStructureCandidate(request: StructureCandidateEngineRequest) {
    return getBedrockStructureCandidate({
      edition: "bedrock",
      version: request.version,
      seed: request.seed,
      structureType: request.structureType,
      regionX: request.regionX,
      regionZ: request.regionZ,
      ...(request.seedPolicy === undefined ? {} : { seedPolicy: request.seedPolicy }),
    });
  }

  public scanStructureAttempts(request: Parameters<WorldgenEngine["scanStructureAttempts"]>[0]) {
    return scanBedrockStructureAttempts({
      ...request,
      edition: "bedrock",
    });
  }

  public isSlimeChunk(request: Parameters<WorldgenEngine["isSlimeChunk"]>[0]): boolean {
    return isSlimeChunk({
      ...request,
      edition: "bedrock",
    });
  }

  public isViableStructurePos(
    request: Parameters<WorldgenEngine["isViableStructurePos"]>[0],
  ) {
    return isViableStructurePos({
      ...request,
      edition: "bedrock",
    });
  }

  public getBiomeAt(request: BiomeAtRequest): BiomeAtResult {
    return {
      edition: "bedrock",
      version: request.version,
      dimension: request.dimension,
      x: request.x,
      ...(request.y === undefined ? {} : { y: request.y }),
      z: request.z,
      status: "unsupported",
      reason:
        "Bedrock getBiomeAt is not implemented yet. Use biome hints/fixtures with isViableStructurePos.",
    };
  }
}

export const bedrockEngine = new BedrockEngine();
