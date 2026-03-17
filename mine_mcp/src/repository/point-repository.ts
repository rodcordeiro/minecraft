import fs from "node:fs/promises";
import path from "node:path";
import { MapPoint, PointStore } from "../types.js";

const emptyStore: PointStore = { points: [] };

export class PointRepository {
  constructor(private readonly dataFile: string) {}

  async list(): Promise<MapPoint[]> {
    const store = await this.readStore();
    return [...store.points];
  }

  async save(point: MapPoint): Promise<MapPoint> {
    const store = await this.readStore();
    const nextPoints = [...store.points.filter((item) => item.id !== point.id), point];
    nextPoints.sort((left, right) => left.name.localeCompare(right.name));
    await this.writeStore({ points: nextPoints });
    return point;
  }

  async findByName(name: string): Promise<MapPoint | undefined> {
    const normalizedName = normalizeText(name);
    const store = await this.readStore();
    return store.points.find((point) => normalizeText(point.name) === normalizedName);
  }

  private async readStore(): Promise<PointStore> {
    try {
      const raw = await fs.readFile(this.dataFile, "utf-8");
      const parsed = JSON.parse(raw) as PointStore;
      return {
        points: Array.isArray(parsed.points) ? parsed.points : []
      };
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code === "ENOENT") {
        await this.writeStore(emptyStore);
        return emptyStore;
      }

      throw error;
    }
  }

  private async writeStore(store: PointStore): Promise<void> {
    await fs.mkdir(path.dirname(this.dataFile), { recursive: true });
    await fs.writeFile(this.dataFile, JSON.stringify(store, null, 2) + "\n", "utf-8");
  }
}

function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase("pt-BR");
}
