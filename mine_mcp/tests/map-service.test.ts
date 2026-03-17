import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { PointRepository } from "../src/repository/point-repository.js";
import { MapService, calculateDistance, normalizeType } from "../src/services/map-service.js";

describe("MapService", () => {
  let tempDir: string;
  let repository: PointRepository;
  let service: MapService;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "mine-mcp-service-"));
    repository = new PointRepository(path.join(tempDir, "points.json"));
    service = new MapService(repository);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("normalizes aliases for supported point types", () => {
    expect(normalizeType("casa")).toBe("house");
    expect(normalizeType("vila")).toBe("village");
    expect(normalizeType("casa de bruxa")).toBe("witch_hut");
    expect(normalizeType("qualquer coisa")).toBe("custom");
  });

  it("registers and updates a named point without duplicating it", async () => {
    const first = await service.registerPoint({
      name: "Casa",
      type: "house",
      x: 0,
      z: 0,
      tags: ["home"]
    });

    const second = await service.registerPoint({
      name: "Casa",
      type: "casa",
      x: 20,
      z: 10,
      tags: ["spawn"]
    });

    const points = await service.listPoints();

    expect(points).toHaveLength(1);
    expect(second.id).toBe(first.id);
    expect(points[0]).toMatchObject({
      name: "Casa",
      type: "house",
      x: 20,
      z: 10,
      tags: ["spawn"]
    });
  });

  it("calculates distance to a named point", async () => {
    await service.registerPoint({
      name: "Casa",
      type: "house",
      x: 30,
      z: 40
    });

    const result = await service.getDistanceToPoint({ x: 0, z: 0 }, "Casa");

    expect(result.point.name).toBe("Casa");
    expect(result.distance).toBe(50);
  });

  it("finds the nearest village from the current position", async () => {
    await service.registerPoint({
      name: "Vila Norte",
      type: "village",
      x: 100,
      z: 0
    });
    await service.registerPoint({
      name: "Vila Sul",
      type: "vila",
      x: 25,
      z: 0
    });

    const result = await service.getNearestPoint({ x: 0, z: 0 }, "vila");

    expect(result.point.name).toBe("Vila Sul");
    expect(result.distance).toBe(25);
  });

  it("finds the nearest witch hut using Portuguese alias", async () => {
    await service.registerPoint({
      name: "Casa de Bruxa Leste",
      type: "witch_hut",
      x: 60,
      z: 80
    });
    await service.registerPoint({
      name: "Casa de Bruxa Oeste",
      type: "casa de bruxa",
      x: -10,
      z: -10
    });

    const result = await service.getNearestPoint({ x: 0, z: 0 }, "casa de bruxa");

    expect(result.point.name).toBe("Casa de Bruxa Oeste");
    expect(result.distance).toBeCloseTo(Math.sqrt(200));
  });

  it("calculates Euclidean distance in X/Z", () => {
    expect(calculateDistance({ x: -5, z: 1 }, { x: 7, z: 10 })).toBe(15);
  });
});
