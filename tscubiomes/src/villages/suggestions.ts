import { readFileSync } from "node:fs";
import { StructureAttempt, scanBedrockStructureAttempts } from "../bedrock/structures.js";
import { IntegerSeed } from "../core/numeric.js";
import { MinecraftVersion } from "../types.js";

export interface KnownPoint {
  readonly name: string;
  readonly type: string;
  readonly block: {
    readonly x: number;
    readonly z: number;
  };
}

export interface VillageSuggestionRequest {
  readonly seed: IntegerSeed;
  readonly version: MinecraftVersion;
  readonly seedPolicy?: "preserve-64" | "legacy-32";
  readonly centerX?: number;
  readonly centerZ?: number;
  readonly radius: number;
  readonly limit: number;
  readonly excludeDistance?: number;
  readonly knownPoints?: readonly KnownPoint[];
}

export interface VillageSuggestion {
  readonly attempt: StructureAttempt;
  readonly seedPolicy: "legacy-32";
  readonly reason: "legacy-32 structure attempt; biome not checked";
  readonly distanceFromCenter: number;
  readonly nearestKnownDistance?: number;
}

export function suggestUnmappedVillages(
  request: VillageSuggestionRequest,
): VillageSuggestion[] {
  const centerX = request.centerX ?? 0;
  const centerZ = request.centerZ ?? 0;
  const excludeDistance = request.excludeDistance ?? 128;
  const knownVillages = (request.knownPoints ?? []).filter((point) => point.type === "village");
  const attempts = scanBedrockStructureAttempts({
    edition: "bedrock",
    version: request.version,
    seed: request.seed,
    structureType: "Village",
    minX: centerX - request.radius,
    minZ: centerZ - request.radius,
    maxX: centerX + request.radius,
    maxZ: centerZ + request.radius,
    ...(request.seedPolicy === undefined ? {} : { seedPolicy: request.seedPolicy }),
  });

  return attempts
    .map((attempt) => {
      const nearestKnownDistance = nearestDistance(
        attempt.block.x,
        attempt.block.z,
        knownVillages,
      );

      return {
        attempt,
        seedPolicy: "legacy-32" as const,
        reason: "legacy-32 structure attempt; biome not checked" as const,
        distanceFromCenter: distance(attempt.block.x, attempt.block.z, centerX, centerZ),
        ...(nearestKnownDistance === undefined ? {} : { nearestKnownDistance }),
      };
    })
    .filter(
      (candidate) =>
        candidate.nearestKnownDistance === undefined ||
        candidate.nearestKnownDistance > excludeDistance,
    )
    .sort((left, right) => left.distanceFromCenter - right.distanceFromCenter)
    .slice(0, request.limit);
}

export function loadKnownPointsFromFixture(path: string): KnownPoint[] {
  const parsed = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(parsed.points)) {
    return [];
  }

  return (parsed.points as unknown[])
    .filter((point: unknown): point is KnownPoint => isKnownPoint(point))
    .map((point) => ({
      name: point.name,
      type: point.type,
      block: {
        x: point.block.x,
        z: point.block.z,
      },
    }));
}

function nearestDistance(
  x: number,
  z: number,
  knownPoints: readonly KnownPoint[],
): number | undefined {
  if (knownPoints.length === 0) {
    return undefined;
  }

  return Math.min(
    ...knownPoints.map((point) => distance(x, z, point.block.x, point.block.z)),
  );
}

function distance(x1: number, z1: number, x2: number, z2: number): number {
  return Math.hypot(x1 - x2, z1 - z2);
}

function isKnownPoint(value: unknown): value is KnownPoint {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybePoint = value as {
    readonly name?: unknown;
    readonly type?: unknown;
    readonly block?: { readonly x?: unknown; readonly z?: unknown };
  };

  return (
    typeof maybePoint.name === "string" &&
    typeof maybePoint.type === "string" &&
    typeof maybePoint.block?.x === "number" &&
    typeof maybePoint.block.z === "number"
  );
}
