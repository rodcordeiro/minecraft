import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  BedrockRandom,
  JavaRandom,
  BiomeId,
  Dimension,
  MCVersion,
  StructureType,
  blockToRegion,
  calculateBedrockAreaSeed,
  biomeExists,
  floorDiv,
  floorMod,
  getBiome,
  getBiomeId,
  bedrockEngine,
  getBedrockStructureCandidate,
  getBedrockStructureConfig,
  getBedrockStructureSupport,
  getDimension,
  getViableBiomesForStructure,
  isOceanic,
  isOverworld,
  javaStringHashCode,
  mask48,
  parseBedrockSeed,
  parseIntegerSeed,
  requireLegacyBedrockSeed,
  scanBedrockStructureAttempts,
  isSlimeChunk,
  isSnowy,
  isViableFeatureBiome,
  isViableStructurePos,
  suggestUnmappedVillages,
  toInt32,
  toUint32,
  toUint64,
} from "../dist/index.js";

const tests = [];
const seedFixture = JSON.parse(
  readFileSync(new URL("../fixtures/seed-5547459079057001195.json", import.meta.url), "utf8"),
);

function test(name, fn) {
  tests.push({ name, fn });
}

test("parseIntegerSeed preserves large Bedrock seeds", () => {
  assert.equal(parseIntegerSeed("5547459079057001195"), 5547459079057001195n);
});

test("public constants expose stable MVP enums", () => {
  assert.equal(MCVersion.MC_1_18, "MC_1_18");
  assert.equal(MCVersion.MC_1_21, "MC_1_21");
  assert.equal(Dimension.Overworld, "overworld");
  assert.equal(StructureType.Village, "Village");
  assert.equal(StructureType.Swamp_Hut, "Swamp_Hut");
  assert.equal(BiomeId.SnowyPlains, "snowy_plains");
});

test("uint32 and int32 conversions wrap deterministically", () => {
  assert.equal(toUint32(-1), 0xffff_ffff);
  assert.equal(toInt32(0xffff_ffff), -1);
});

test("uint64 and 48-bit masks are deterministic", () => {
  assert.equal(toUint64(-1n), 0xffff_ffff_ffff_ffffn);
  assert.equal(mask48(0xffff_ffff_ffff_ffffn), 0xffff_ffffffffn);
});

test("floor division matches region math for negative coordinates", () => {
  assert.equal(floorDiv(-1, 32), -1);
  assert.equal(floorDiv(-33, 32), -2);
  assert.equal(floorMod(-1, 32), 31);
});

test("Bedrock seed parsing keeps 64-bit seeds unless legacy mode is explicit", () => {
  const parsed = parseBedrockSeed("5547459079057001195");
  assert.equal(parsed.policy, "preserve-64");
  assert.equal(parsed.value, 5547459079057001195n);

  const legacy = parseBedrockSeed("5547459079057001195", "legacy-32");
  assert.equal(legacy.policy, "legacy-32");
  assert.equal(legacy.uint32, 87378667);
});

test("legacy Bedrock seed requirement rejects ambiguous 64-bit seeds", () => {
  assert.throws(() => requireLegacyBedrockSeed("5547459079057001195"), {
    name: "AmbiguousBedrockSeedError",
  });
  assert.equal(requireLegacyBedrockSeed("-1"), 0xffff_ffff);
});

test("BedrockRandom matches MT19937 reference sequence for seed 5489", () => {
  const random = new BedrockRandom(5489);
  assert.deepEqual(random.nextUInt32Array(5), [
    3499211612,
    581869302,
    3890346734,
    3586334585,
    545404204,
  ]);
});

test("BedrockRandom uses unsigned modulo for bounded nextInt", () => {
  const random = new BedrockRandom(5489);
  assert.equal(random.nextInt(100), 12);
});

test("JavaRandom matches known java.util.Random sequence for seed 1", () => {
  const random = new JavaRandom(1);
  assert.equal(random.nextInt(), -1155869325);
  assert.equal(random.nextInt(100), 88);
  assert.equal(random.nextFloat(), 0.41008079051971436);
});

test("JavaRandom skipNextN advances state without exposing mutation", () => {
  const skipped = new JavaRandom(1234);
  skipped.skipNextN(3);

  const manual = new JavaRandom(1234);
  manual.nextInt();
  manual.nextInt();
  manual.nextInt();

  assert.equal(skipped.nextInt(), manual.nextInt());
});

test("javaStringHashCode mirrors Java string hashing", () => {
  assert.equal(javaStringHashCode("Minecraft"), -1595926131);
  assert.equal(javaStringHashCode("Coroa do Inverno"), 274079570);
});

test("Bedrock structure configs expose only experimental MVP structures", () => {
  const village = getBedrockStructureConfig("Village");
  assert.equal(village.spacing, 27);
  assert.equal(village.spawnRange, 17);
  assert.equal(village.salt, 10387312);
  assert.equal(village.randomValues, 4);
  assert.equal(village.support, "experimental");

  const hut = getBedrockStructureConfig("Swamp_Hut");
  assert.equal(hut.spacing, 32);
  assert.equal(hut.spawnRange, 24);
  assert.equal(hut.salt, 14357617);
  assert.equal(hut.randomValues, 2);
  assert.equal(hut.support, "experimental");

  assert.equal(getBedrockStructureSupport("Stronghold"), "blocked");
  assert.throws(() => getBedrockStructureConfig("Stronghold"), {
    name: "UnsupportedStructureError",
  });
});

test("Bedrock structure candidates use floor region math and chunk center +8", () => {
  assert.equal(blockToRegion(-296, 27), -1);
  assert.equal(blockToRegion(344, 27), 0);
  assert.equal(blockToRegion(7432, 32), 14);
  assert.equal(calculateBedrockAreaSeed(87378667, -1, 0, 10387312), 1822020947);

  const attempt = getBedrockStructureCandidate({
    edition: "bedrock",
    version: "BEDROCK_VERSION_TO_BE_CONFIRMED",
    seed: "5547459079057001195",
    seedPolicy: "legacy-32",
    structureType: "Village",
    regionX: -1,
    regionZ: 0,
  });

  assert.deepEqual(attempt.region, { x: -1, z: 0 });
  assert.deepEqual(attempt.chunk, { x: -26, z: 10 });
  assert.deepEqual(attempt.block, { x: -408, z: 168 });
  assert.equal(attempt.biomeStatus, "biome_unknown");
});

test("Bedrock structure candidates reject ambiguous 64-bit seeds without policy", () => {
  assert.throws(
    () =>
      getBedrockStructureCandidate({
        edition: "bedrock",
        version: "BEDROCK_VERSION_TO_BE_CONFIRMED",
        seed: "5547459079057001195",
        structureType: "Village",
        regionX: 0,
        regionZ: 0,
      }),
    { name: "AmbiguousBedrockSeedError" },
  );
});

test("Bedrock structure scan returns attempts inside the requested block box", () => {
  const attempts = scanBedrockStructureAttempts({
    edition: "bedrock",
    version: "BEDROCK_VERSION_TO_BE_CONFIRMED",
    seed: "5547459079057001195",
    seedPolicy: "legacy-32",
    structureType: "Swamp_Hut",
    minX: 7350,
    minZ: -2920,
    maxX: 7520,
    maxZ: -2760,
  });

  assert.equal(attempts.length, 1);
  assert.deepEqual(attempts[0].block, { x: 7432, z: -2840 });
});

test("slime chunk checks are edition-specific", () => {
  assert.equal(isSlimeChunk({ edition: "java", seed: "123", chunkX: 0, chunkZ: 0 }), false);
  assert.equal(isSlimeChunk({ edition: "java", seed: "123", chunkX: -20, chunkZ: -15 }), true);
  assert.equal(isSlimeChunk({ edition: "bedrock", seed: "123", chunkX: -20, chunkZ: -19 }), true);
  assert.equal(isSlimeChunk({ edition: "bedrock", seed: "999", chunkX: -20, chunkZ: -19 }), true);
  assert.equal(
    isSlimeChunk({
      edition: "bedrock",
      seed: "999",
      chunkX: -320,
      chunkZ: -304,
      coordinateUnit: "block",
    }),
    true,
  );
  assert.throws(
    () =>
      isSlimeChunk({
        edition: "bedrock",
        seed: "999",
        chunkX: -320,
        chunkZ: -304,
        coordinateUnit: "block",
        strict: true,
      }),
    RangeError,
  );
});

test("biome registry supports product biome hints and aliases", () => {
  assert.equal(biomeExists("snowy_plains"), true);
  assert.equal(biomeExists("minecraft:snowy-taiga"), true);
  assert.equal(biomeExists("swampland"), true);
  assert.equal(biomeExists("unknown_biome"), false);

  assert.equal(getBiomeId("icePlains"), "snowy_plains");
  assert.equal(getBiomeId("coldTaiga"), "snowy_taiga");
  assert.equal(getDimension("swamp"), "overworld");
  assert.equal(isOverworld("snowy_plains"), true);
  assert.equal(isSnowy("snowy_taiga"), true);
  assert.equal(isOceanic("deep_cold_ocean"), true);
  assert.equal(getBiome(12)?.id, "snowy_plains");
});

test("feature biome viability covers Village and Swamp_Hut subset", () => {
  assert.deepEqual(getViableBiomesForStructure("Swamp_Hut"), ["swamp"]);
  assert.equal(
    isViableFeatureBiome({
      edition: "bedrock",
      version: "BEDROCK_VERSION_TO_BE_CONFIRMED",
      structureType: "Village",
      biome: "snowy_plains",
    }),
    true,
  );
  assert.equal(
    isViableFeatureBiome({
      edition: "bedrock",
      version: "BEDROCK_VERSION_TO_BE_CONFIRMED",
      structureType: "Village",
      biome: "snowy_taiga",
    }),
    true,
  );
  assert.equal(
    isViableFeatureBiome({
      edition: "bedrock",
      version: "BEDROCK_VERSION_TO_BE_CONFIRMED",
      structureType: "Swamp_Hut",
      biome: "swamp",
    }),
    true,
  );
  assert.equal(
    isViableFeatureBiome({
      edition: "bedrock",
      version: "BEDROCK_VERSION_TO_BE_CONFIRMED",
      structureType: "Swamp_Hut",
      biome: "mangrove_swamp",
    }),
    false,
  );
});

test("structure viability distinguishes unknown, viable, not viable and not found", () => {
  const attempt = getBedrockStructureCandidate({
    edition: "bedrock",
    version: "BEDROCK_VERSION_TO_BE_CONFIRMED",
    seed: "5547459079057001195",
    seedPolicy: "legacy-32",
    structureType: "Swamp_Hut",
    regionX: 14,
    regionZ: -6,
  });

  assert.equal(
    isViableStructurePos({
      edition: "bedrock",
      version: "BEDROCK_VERSION_TO_BE_CONFIRMED",
      structureType: "Swamp_Hut",
      attempt,
    }).status,
    "biome_unknown",
  );
  assert.equal(
    isViableStructurePos({
      edition: "bedrock",
      version: "BEDROCK_VERSION_TO_BE_CONFIRMED",
      structureType: "Swamp_Hut",
      attempt,
      biome: "swamp",
      biomeSource: "fixture",
    }).status,
    "biome_viable",
  );
  assert.equal(
    isViableStructurePos({
      edition: "bedrock",
      version: "BEDROCK_VERSION_TO_BE_CONFIRMED",
      structureType: "Swamp_Hut",
      attempt,
      biome: "swamp",
      biomeSource: "fixture",
    }).biomeSource,
    "fixture",
  );
  assert.equal(
    isViableStructurePos({
      edition: "bedrock",
      version: "BEDROCK_VERSION_TO_BE_CONFIRMED",
      structureType: "Swamp_Hut",
      attempt,
      biome: "snowy_plains",
    }).status,
    "biome_not_viable",
  );
  assert.equal(
    isViableStructurePos({
      edition: "bedrock",
      version: "BEDROCK_VERSION_TO_BE_CONFIRMED",
      structureType: "Swamp_Hut",
      attempt,
      biome: "unknown_biome",
    }).status,
    "biome_unknown",
  );
  assert.equal(
    isViableStructurePos({
      edition: "bedrock",
      version: "BEDROCK_VERSION_TO_BE_CONFIRMED",
      structureType: "Swamp_Hut",
      attempt: null,
      biome: "swamp",
    }).status,
    "not_found",
  );
});

test("fixture biome hints for real points are representable and classifiable", () => {
  const expected = new Map([
    ["Alvorada Branca", "biome_viable"],
    ["Ermo da Neve", "biome_viable"],
    ["Pinhal de Valkaria", "biome_viable"],
    ["Cabana de bruxa", "biome_viable"],
  ]);

  for (const point of seedFixture.points) {
    const structureType = point.structureType ?? "Village";
    assert.equal(biomeExists(point.expectedBiomeHint), true);
    assert.equal(
      isViableStructurePos({
        edition: "bedrock",
        version: seedFixture.version,
        structureType,
        attempt: {
          edition: "bedrock",
          version: seedFixture.version,
          structureType,
          status: "attempt",
          biomeStatus: "biome_unknown",
          region: { x: 0, z: 0 },
          chunk: { x: 0, z: 0 },
          block: point.block,
          config: getBedrockStructureConfig(structureType),
        },
        biome: point.expectedBiomeHint,
        biomeSource: "fixture",
      }).status,
      expected.get(point.name),
    );
  }
});

test("BedrockEngine exposes unified operations without Java fallback", () => {
  const attempt = bedrockEngine.getStructureCandidate({
    edition: "bedrock",
    version: "BEDROCK_VERSION_TO_BE_CONFIRMED",
    seed: "5547459079057001195",
    seedPolicy: "legacy-32",
    structureType: "Village",
    regionX: 0,
    regionZ: 0,
  });

  assert.deepEqual(attempt.block, { x: 120, z: 56 });
  assert.equal(
    bedrockEngine.getBiomeAt({
      edition: "bedrock",
      version: "BEDROCK_VERSION_TO_BE_CONFIRMED",
      seed: "5547459079057001195",
      dimension: "overworld",
      x: 120,
      z: 56,
    }).status,
    "unsupported",
  );
});

test("unmapped village suggestions exclude known mapped villages", () => {
  const suggestions = suggestUnmappedVillages({
    seed: "5547459079057001195",
    version: "BEDROCK_VERSION_TO_BE_CONFIRMED",
    seedPolicy: "legacy-32",
    radius: 2500,
    limit: 2,
    excludeDistance: 256,
    knownPoints: seedFixture.points,
  });

  assert.equal(suggestions.length, 2);
  assert.deepEqual(
    suggestions.map((suggestion) => suggestion.attempt.block),
    [
      { x: 120, z: 56 },
      { x: 584, z: 136 },
    ],
  );
});

let passed = 0;
for (const { name, fn } of tests) {
  try {
    fn();
    passed += 1;
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

console.log(`${passed}/${tests.length} tests passed`);
