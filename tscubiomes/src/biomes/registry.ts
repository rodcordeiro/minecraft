import { BiomeId, Dimension, MinecraftVersion } from "../types.js";

export interface BiomeDefinition {
  readonly id: BiomeId;
  readonly numericId: number;
  readonly dimension: Dimension;
  readonly aliases: readonly string[];
  readonly oceanic: boolean;
  readonly snowy: boolean;
}

export type BiomeInput = BiomeId | string | number | BiomeDefinition;

const BIOMES: readonly BiomeDefinition[] = [
  biome("plains", 1),
  biome("desert", 2),
  biome("ocean", 0, { oceanic: true }),
  biome("taiga", 5),
  biome("swamp", 6, { aliases: ["swampland"] }),
  biome("river", 7),
  biome("frozen_ocean", 10, { oceanic: true, snowy: true }),
  biome("frozen_river", 11, { snowy: true }),
  biome("snowy_plains", 12, { aliases: ["ice_plains", "icePlains"], snowy: true }),
  biome("snowy_taiga", 30, { aliases: ["cold_taiga", "coldTaiga"], snowy: true }),
  biome("taiga_hills", 19),
  biome("snowy_taiga_hills", 31, {
    aliases: ["cold_taiga_hills", "coldTaigaHills"],
    snowy: true,
  }),
  biome("deep_ocean", 24, { oceanic: true }),
  biome("savanna", 35),
  biome("sunflower_plains", 129),
  biome("warm_ocean", 44, { oceanic: true }),
  biome("lukewarm_ocean", 45, { oceanic: true }),
  biome("cold_ocean", 46, { oceanic: true }),
  biome("deep_warm_ocean", 47, { oceanic: true }),
  biome("deep_lukewarm_ocean", 48, { oceanic: true }),
  biome("deep_cold_ocean", 49, { oceanic: true }),
  biome("deep_frozen_ocean", 50, { oceanic: true, snowy: true }),
  biome("mangrove_swamp", 191),
];

const BIOME_BY_ID = new Map<BiomeId, BiomeDefinition>();
const BIOME_BY_NUMERIC_ID = new Map<number, BiomeDefinition>();
const BIOME_BY_NAME = new Map<string, BiomeDefinition>();

for (const entry of BIOMES) {
  BIOME_BY_ID.set(entry.id, entry);
  BIOME_BY_NUMERIC_ID.set(entry.numericId, entry);
  BIOME_BY_NAME.set(normalizeBiomeName(entry.id), entry);

  for (const alias of entry.aliases) {
    BIOME_BY_NAME.set(normalizeBiomeName(alias), entry);
  }
}

export function getBiome(input: BiomeInput): BiomeDefinition | undefined {
  if (typeof input === "object") {
    return input;
  }

  if (typeof input === "number") {
    return BIOME_BY_NUMERIC_ID.get(input);
  }

  return BIOME_BY_NAME.get(normalizeBiomeName(input));
}

export function biomeExists(input: BiomeInput, _version?: MinecraftVersion): boolean {
  return getBiome(input) !== undefined;
}

export function getBiomeId(input: BiomeInput): BiomeId | undefined {
  return getBiome(input)?.id;
}

export function getDimension(input: BiomeInput): Dimension | undefined {
  return getBiome(input)?.dimension;
}

export function isOverworld(input: BiomeInput): boolean {
  return getDimension(input) === "overworld";
}

export function isOceanic(input: BiomeInput): boolean {
  return getBiome(input)?.oceanic ?? false;
}

export function isSnowy(input: BiomeInput): boolean {
  return getBiome(input)?.snowy ?? false;
}

export function listBiomes(): readonly BiomeDefinition[] {
  return BIOMES;
}

function biome(
  id: BiomeId,
  numericId: number,
  options: {
    readonly dimension?: Dimension;
    readonly aliases?: readonly string[];
    readonly oceanic?: boolean;
    readonly snowy?: boolean;
  } = {},
): BiomeDefinition {
  return {
    id,
    numericId,
    dimension: options.dimension ?? "overworld",
    aliases: options.aliases ?? [],
    oceanic: options.oceanic ?? false,
    snowy: options.snowy ?? false,
  };
}

function normalizeBiomeName(value: string): string {
  return value.trim().toLowerCase().replace(/^minecraft:/, "").replaceAll("-", "_");
}
