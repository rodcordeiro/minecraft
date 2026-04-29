import { IntegerSeed, parseIntegerSeed, toInt32 } from "../core/numeric.js";
import { JavaRandom } from "../java/java-random.js";
import { MinecraftEdition } from "../types.js";
import { BedrockRandom } from "../bedrock/bedrock-random.js";
import { blockToChunk } from "../bedrock/structures.js";

export interface SlimeChunkRequest {
  readonly edition: MinecraftEdition;
  readonly seed: IntegerSeed;
  readonly chunkX: number;
  readonly chunkZ: number;
  readonly strict?: boolean;
  readonly coordinateUnit?: "chunk" | "block";
}

export function isSlimeChunk(request: SlimeChunkRequest): boolean {
  assertChunkCoordinate(request.chunkX, "chunkX");
  assertChunkCoordinate(request.chunkZ, "chunkZ");

  if (request.strict && request.coordinateUnit === "block") {
    throw new RangeError("isSlimeChunk strict mode expects chunk coordinates.");
  }

  const chunkX =
    request.coordinateUnit === "block" ? blockToChunk(request.chunkX) : request.chunkX;
  const chunkZ =
    request.coordinateUnit === "block" ? blockToChunk(request.chunkZ) : request.chunkZ;

  if (request.edition === "bedrock") {
    return isBedrockSlimeChunk(chunkX, chunkZ);
  }

  return isJavaSlimeChunk(request.seed, chunkX, chunkZ);
}

export function isJavaSlimeChunk(seed: IntegerSeed, chunkX: number, chunkZ: number): boolean {
  const worldSeed = parseIntegerSeed(seed);
  const randomSeed =
    worldSeed +
    BigInt(toInt32(chunkX * 0x5ac0db)) +
    BigInt(toInt32(chunkX * chunkX * 0x4c1906)) +
    BigInt(toInt32(chunkZ * 0x5f24f)) +
    BigInt(toInt32(chunkZ * chunkZ)) * 0x4307a7n;

  return new JavaRandom(randomSeed ^ 0x3ad8025fn).nextInt(10) === 0;
}

export function isBedrockSlimeChunk(chunkX: number, chunkZ: number): boolean {
  const randomSeed = toInt32(toInt32(chunkX * 522133279) ^ chunkZ);
  return new BedrockRandom(randomSeed).nextInt(10) === 0;
}

function assertChunkCoordinate(value: number, label: string): void {
  if (!Number.isInteger(value)) {
    throw new RangeError(`${label} must be an integer chunk coordinate.`);
  }
}
