export class TscubiomesError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class UnsafeNumberSeedError extends TscubiomesError {
  public constructor(seed: number) {
    super(`Seed number ${seed} is outside JavaScript safe integer range.`);
  }
}

export class InvalidSeedError extends TscubiomesError {
  public constructor(seed: string) {
    super(`Seed '${seed}' is not a valid integer seed.`);
  }
}

export class AmbiguousBedrockSeedError extends TscubiomesError {
  public constructor(seed: string | bigint) {
    super(
      `Bedrock seed '${seed.toString()}' requires an explicit seed policy before conversion.`,
    );
  }
}

export class UnsupportedEditionFeatureError extends TscubiomesError {
  public constructor(feature: string, edition: string) {
    super(`Feature '${feature}' is not supported for edition '${edition}'.`);
  }
}

export class UnsupportedStructureError extends TscubiomesError {
  public constructor(structureType: string, reason: string) {
    super(`Structure '${structureType}' is not supported: ${reason}.`);
  }
}
