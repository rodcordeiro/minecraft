declare const process: {
  readonly argv: string[];
  exitCode?: number;
};

declare module "node:fs" {
  export function readFileSync(path: string | URL, encoding: "utf8"): string;
}
