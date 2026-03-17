export type PointType =
  | "base"
  | "house"
  | "village"
  | "witch_hut"
  | "farm"
  | "fortress"
  | "stronghold"
  | "outpost"
  | "custom";

export interface Coordinates {
  x: number;
  z: number;
}

export interface MapPoint extends Coordinates {
  id: string;
  name: string;
  type: PointType;
  description?: string;
  tags: string[];
  dimension: "overworld";
  createdAt: string;
  updatedAt: string;
}

export interface PointStore {
  points: MapPoint[];
}

export interface DistanceResult {
  point: MapPoint;
  distance: number;
}

export type RecipeType = "block" | "build" | "farm" | "potion" | "custom";

export interface Recipe {
  id: string;
  name: string;
  type: RecipeType;
  summary: string;
  resources: string[];
  process: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RecipeStore {
  recipes: Recipe[];
}
