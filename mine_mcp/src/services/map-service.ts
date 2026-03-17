import { randomUUID } from "node:crypto";
import { PointRepository } from "../repository/point-repository.js";
import { Coordinates, DistanceResult, MapPoint, PointType } from "../types.js";

const typeAliases: Record<string, PointType> = {
  base: "base",
  casa: "house",
  house: "house",
  village: "village",
  vila: "village",
  "witch hut": "witch_hut",
  "witch_hut": "witch_hut",
  "casa de bruxa": "witch_hut",
  farm: "farm",
  fortress: "fortress",
  fortaleza: "fortress",
  stronghold: "stronghold",
  portal: "stronghold",
  outpost: "outpost",
  posto: "outpost",
  custom: "custom"
};

export interface RegisterPointInput extends Coordinates {
  name: string;
  type: string;
  description?: string;
  tags?: string[];
}

export class MapService {
  constructor(private readonly repository: PointRepository) {}

  async registerPoint(input: RegisterPointInput): Promise<MapPoint> {
    const now = new Date().toISOString();
    const existing = await this.repository.findByName(input.name);
    const point: MapPoint = {
      id: existing?.id ?? randomUUID(),
      name: input.name.trim(),
      type: normalizeType(input.type),
      x: input.x,
      z: input.z,
      description: input.description?.trim() || undefined,
      tags: normalizeTags(input.tags),
      dimension: "overworld",
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };

    return this.repository.save(point);
  }

  async listPoints(type?: string): Promise<MapPoint[]> {
    const points = await this.repository.list();
    if (!type) {
      return points;
    }

    const normalizedType = normalizeType(type);
    return points.filter((point) => point.type === normalizedType);
  }

  async getDistanceToPoint(origin: Coordinates, pointName: string): Promise<DistanceResult> {
    const point = await this.repository.findByName(pointName);
    if (!point) {
      throw new Error(`Point "${pointName}" was not found.`);
    }

    return {
      point,
      distance: calculateDistance(origin, point)
    };
  }

  async getNearestPoint(origin: Coordinates, type: string): Promise<DistanceResult> {
    const normalizedType = normalizeType(type);
    const points = await this.repository.list();
    const candidates = points.filter((point) => point.type === normalizedType);
    if (candidates.length === 0) {
      throw new Error(`No points registered for type "${normalizedType}".`);
    }

    return candidates
      .map((point) => ({
        point,
        distance: calculateDistance(origin, point)
      }))
      .sort((left, right) => left.distance - right.distance)[0];
  }
}

export function calculateDistance(origin: Coordinates, target: Coordinates): number {
  return Math.hypot(target.x - origin.x, target.z - origin.z);
}

export function normalizeType(value: string): PointType {
  const normalized = value.trim().toLocaleLowerCase("pt-BR");
  return typeAliases[normalized] ?? "custom";
}

function normalizeTags(tags?: string[]): string[] {
  if (!tags) {
    return [];
  }

  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
}
