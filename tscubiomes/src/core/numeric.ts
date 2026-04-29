import { InvalidSeedError, UnsafeNumberSeedError } from "./errors.js";

export const UINT32_MASK = 0xffff_ffffn;
export const INT32_SIGN_BIT = 0x8000_0000n;
export const UINT64_MASK = 0xffff_ffff_ffff_ffffn;
export const INT64_SIGN_BIT = 0x8000_0000_0000_0000n;
export const JAVA_RANDOM_MASK_48 = (1n << 48n) - 1n;

export type IntegerSeed = string | bigint | number;

export function parseIntegerSeed(seed: IntegerSeed): bigint {
  if (typeof seed === "bigint") {
    return seed;
  }

  if (typeof seed === "number") {
    if (!Number.isSafeInteger(seed)) {
      throw new UnsafeNumberSeedError(seed);
    }

    return BigInt(seed);
  }

  const normalized = seed.trim();
  if (!/^-?\d+$/.test(normalized)) {
    throw new InvalidSeedError(seed);
  }

  return BigInt(normalized);
}

export function toUint32(value: number | bigint): number {
  return Number(BigInt.asUintN(32, BigInt(value)));
}

export function toInt32(value: number | bigint): number {
  return Number(BigInt.asIntN(32, BigInt(value)));
}

export function toUint64(value: number | bigint): bigint {
  return BigInt.asUintN(64, BigInt(value));
}

export function toInt64(value: number | bigint): bigint {
  return BigInt.asIntN(64, BigInt(value));
}

export function mask48(value: number | bigint): bigint {
  return BigInt(value) & JAVA_RANDOM_MASK_48;
}

export function addUint32(left: number | bigint, right: number | bigint): number {
  return toUint32(BigInt(left) + BigInt(right));
}

export function multiplyUint32(left: number | bigint, right: number | bigint): number {
  return toUint32(BigInt(left) * BigInt(right));
}

export function floorDiv(dividend: number, divisor: number): number {
  if (!Number.isInteger(dividend) || !Number.isInteger(divisor)) {
    throw new RangeError("floorDiv expects integer operands.");
  }

  if (divisor === 0) {
    throw new RangeError("Cannot divide by zero.");
  }

  return Math.floor(dividend / divisor);
}

export function floorMod(dividend: number, divisor: number): number {
  return dividend - floorDiv(dividend, divisor) * divisor;
}
