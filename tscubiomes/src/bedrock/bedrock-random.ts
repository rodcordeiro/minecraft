import { toUint32 } from "../core/numeric.js";

const N = 624;
const M = 397;
const MATRIX_A = 0x9908_b0df;
const UPPER_MASK = 0x8000_0000;
const LOWER_MASK = 0x7fff_ffff;
const TWO_POW_M32 = 1 / 2 ** 32;

export class BedrockRandom {
  #seed: number;
  #mt: number[];
  #mti: number;

  public constructor(seed: number | bigint) {
    this.#seed = 0;
    this.#mt = new Array<number>(N).fill(0);
    this.#mti = N + 1;
    this.setSeed(seed);
  }

  public get seed(): number {
    return this.#seed;
  }

  public setSeed(seed: number | bigint): void {
    this.#seed = toUint32(seed);
    this.#mt[0] = this.#seed;

    for (let i = 1; i < N; i++) {
      const previous = this.#mt[i - 1] ?? 0;
      this.#mt[i] = toUint32(
        1812433253n * BigInt(toUint32(previous ^ (previous >>> 30))) + BigInt(i),
      );
    }

    this.#mti = N;
  }

  public nextUInt32(): number {
    if (this.#mti >= N) {
      this.twist();
    }

    let y = this.#mt[this.#mti] ?? 0;
    this.#mti += 1;

    y ^= y >>> 11;
    y = toUint32(y ^ ((y << 7) & 0x9d2c_5680));
    y = toUint32(y ^ ((y << 15) & 0xefc6_0000));
    y ^= y >>> 18;

    return toUint32(y);
  }

  public nextInt(bound?: number): number {
    if (bound === undefined) {
      return this.nextUInt32() >>> 1;
    }

    if (!Number.isInteger(bound) || bound <= 0) {
      return 0;
    }

    return this.nextUInt32() % bound;
  }

  public nextFloat(): number {
    return this.nextUInt32() * TWO_POW_M32;
  }

  public nextDouble(): number {
    return this.nextFloat();
  }

  public nextUInt32Array(count: number): number[] {
    if (!Number.isInteger(count) || count < 0) {
      throw new RangeError("count must be a non-negative integer.");
    }

    return Array.from({ length: count }, () => this.nextUInt32());
  }

  private twist(): void {
    for (let i = 0; i < N; i++) {
      const current = this.#mt[i] ?? 0;
      const next = this.#mt[(i + 1) % N] ?? 0;
      const y = toUint32((current & UPPER_MASK) | (next & LOWER_MASK));
      const mag = (y & 1) === 0 ? 0 : MATRIX_A;
      this.#mt[i] = toUint32((this.#mt[(i + M) % N] ?? 0) ^ (y >>> 1) ^ mag);
    }

    this.#mti = 0;
  }
}
