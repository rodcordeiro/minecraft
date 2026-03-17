import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { PointRepository } from "../src/repository/point-repository.js";
import { MapPoint } from "../src/types.js";

describe("PointRepository", () => {
  let tempDir: string;
  let dataFile: string;
  let repository: PointRepository;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "mine-mcp-repo-"));
    dataFile = path.join(tempDir, "points.json");
    repository = new PointRepository(dataFile);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("creates the store lazily when listing", async () => {
    const points = await repository.list();

    expect(points).toEqual([]);
    const raw = await fs.readFile(dataFile, "utf-8");
    expect(JSON.parse(raw)).toEqual({ points: [] });
  });

  it("saves and retrieves points by name", async () => {
    const point: MapPoint = {
      id: "house-1",
      name: "Casa",
      type: "house",
      x: 10,
      z: -4,
      tags: ["home"],
      dimension: "overworld",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    };

    await repository.save(point);

    await expect(repository.findByName("casa")).resolves.toEqual(point);
  });
});
