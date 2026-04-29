import { AmbiguousBedrockSeedError } from "../core/errors.js";
import { IntegerSeed, parseIntegerSeed, toUint32 } from "../core/numeric.js";

export type BedrockSeedPolicy = "preserve-64" | "legacy-32";

export interface ParsedBedrockSeed {
  readonly original: string;
  readonly value: bigint;
  readonly policy: BedrockSeedPolicy;
  readonly uint32?: number;
}

export function parseBedrockSeed(
  seed: IntegerSeed,
  policy: BedrockSeedPolicy = "preserve-64",
): ParsedBedrockSeed {
  const value = parseIntegerSeed(seed);
  const original = typeof seed === "string" ? seed : seed.toString();

  if (policy === "legacy-32") {
    return {
      original,
      value: BigInt(toUint32(value)),
      policy,
      uint32: toUint32(value),
    };
  }

  return {
    original,
    value,
    policy,
  };
}

export function requireLegacyBedrockSeed(seed: IntegerSeed): number {
  const value = parseIntegerSeed(seed);

  if (value < -0x8000_0000n || value > 0xffff_ffffn) {
    throw new AmbiguousBedrockSeedError(value);
  }

  return toUint32(value);
}

export function javaStringHashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = toUint32(31n * BigInt(hash) + BigInt(value.charCodeAt(i)));
  }

  return Number(BigInt.asIntN(32, BigInt(hash)));
}
