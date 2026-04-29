export type MinecraftEdition = "java" | "bedrock";

export const MinecraftEdition = {
  Java: "java",
  Bedrock: "bedrock",
} as const;

export type Dimension = "overworld" | "nether" | "end";

export const Dimension = {
  Overworld: "overworld",
  Nether: "nether",
  End: "end",
} as const;

export type MinecraftVersion =
  | "MC_1_17"
  | "MC_1_18"
  | "MC_1_19"
  | "MC_1_20"
  | "MC_1_21"
  | "BEDROCK_VERSION_TO_BE_CONFIRMED";

export const MCVersion = {
  MC_1_17: "MC_1_17",
  MC_1_18: "MC_1_18",
  MC_1_19: "MC_1_19",
  MC_1_20: "MC_1_20",
  MC_1_21: "MC_1_21",
  BEDROCK_VERSION_TO_BE_CONFIRMED: "BEDROCK_VERSION_TO_BE_CONFIRMED",
} as const;

export type StructureType =
  | "Village"
  | "Swamp_Hut"
  | "Desert_Temple"
  | "Jungle_Temple"
  | "Igloo"
  | "Ocean_Monument"
  | "Woodland_Mansion"
  | "Buried_Treasure"
  | "Stronghold"
  | "Mineshaft"
  | "Ocean_Ruin"
  | "Shipwreck"
  | "Ruined_Portal"
  | "Nether_Fortress"
  | "Bastion"
  | "End_City";

export const StructureType = {
  Village: "Village",
  Swamp_Hut: "Swamp_Hut",
  Desert_Temple: "Desert_Temple",
  Jungle_Temple: "Jungle_Temple",
  Igloo: "Igloo",
  Ocean_Monument: "Ocean_Monument",
  Woodland_Mansion: "Woodland_Mansion",
  Buried_Treasure: "Buried_Treasure",
  Stronghold: "Stronghold",
  Mineshaft: "Mineshaft",
  Ocean_Ruin: "Ocean_Ruin",
  Shipwreck: "Shipwreck",
  Ruined_Portal: "Ruined_Portal",
  Nether_Fortress: "Nether_Fortress",
  Bastion: "Bastion",
  End_City: "End_City",
} as const;

export type StructureSupportStatus = "supported" | "experimental" | "blocked";

export type BiomeId =
  | "plains"
  | "sunflower_plains"
  | "desert"
  | "savanna"
  | "taiga"
  | "taiga_hills"
  | "snowy_plains"
  | "snowy_taiga"
  | "snowy_taiga_hills"
  | "swamp"
  | "mangrove_swamp"
  | "ocean"
  | "deep_ocean"
  | "warm_ocean"
  | "lukewarm_ocean"
  | "cold_ocean"
  | "frozen_ocean"
  | "deep_warm_ocean"
  | "deep_lukewarm_ocean"
  | "deep_cold_ocean"
  | "deep_frozen_ocean"
  | "river"
  | "frozen_river";

export const BiomeId = {
  Plains: "plains",
  SnowyPlains: "snowy_plains",
  SnowyTaiga: "snowy_taiga",
  Swamp: "swamp",
  MangroveSwamp: "mangrove_swamp",
  DeepColdOcean: "deep_cold_ocean",
} as const;

export interface WorldgenRequest {
  readonly edition: MinecraftEdition;
  readonly version: MinecraftVersion;
  readonly seed: string | bigint | number;
  readonly dimension: Dimension;
}

export interface ChunkPosition {
  readonly x: number;
  readonly z: number;
}

export interface BlockPosition {
  readonly x: number;
  readonly z: number;
}
