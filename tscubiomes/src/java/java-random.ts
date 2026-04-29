import { mask48 } from "../core/numeric.js";

const MULTIPLIER = 0x5deece66dn;
const ADDEND = 0xbn;
const MASK = (1n << 48n) - 1n;

export class JavaRandom {
  #seed: bigint;

  public constructor(seed: bigint | number | string) {
    this.#seed = 0n;
    this.setSeed(seed);
  }

  public get internalSeed(): bigint {
    return this.#seed;
  }

  public setSeed(seed: bigint | number | string): void {
    this.#seed = mask48(BigInt(seed) ^ MULTIPLIER);
  }

  public next(bits: number): number {
    if (!Number.isInteger(bits) || bits < 1 || bits > 32) {
      throw new RangeError("bits must be an integer between 1 and 32.");
    }

    this.#seed = (this.#seed * MULTIPLIER + ADDEND) & MASK;
    return Number(this.#seed >> (48n - BigInt(bits)));
  }

  public nextInt(bound?: number): number {
    if (bound === undefined) {
      return this.nextSignedInt();
    }

    if (!Number.isInteger(bound) || bound <= 0) {
      throw new RangeError("bound must be a positive integer.");
    }

    if ((bound & -bound) === bound) {
      return Number((BigInt(bound) * BigInt(this.next(31))) >> 31n);
    }

    let bits: number;
    let value: number;
    do {
      bits = this.next(31);
      value = bits % bound;
    } while (bits - value + (bound - 1) < 0);

    return value;
  }

  public nextLong(): bigint {
    const high = BigInt.asIntN(32, BigInt(this.next(32)));
    const low = BigInt.asIntN(32, BigInt(this.next(32)));
    return BigInt.asIntN(64, (high << 32n) + low);
  }

  public nextFloat(): number {
    return this.next(24) / (1 << 24);
  }

  public nextDouble(): number {
    return (this.next(26) * 2 ** 27 + this.next(27)) / 2 ** 53;
  }

  public skipNextN(count: number): void {
    if (!Number.isInteger(count) || count < 0) {
      throw new RangeError("count must be a non-negative integer.");
    }

    for (let i = 0; i < count; i++) {
      this.next(32);
    }
  }

  private nextSignedInt(): number {
    return Number(BigInt.asIntN(32, BigInt(this.next(32))));
  }
}
