import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { paths } from "./config.js";
import { PointRepository } from "./repository/point-repository.js";
import { RecipeRepository } from "./repository/recipe-repository.js";
import { MapService } from "./services/map-service.js";
import { RecipeService } from "./services/recipe-service.js";

const pointRepository = new PointRepository(paths.dataFile);
const recipeRepository = new RecipeRepository(paths.recipesFile);
const mapService = new MapService(pointRepository);
const recipeService = new RecipeService(recipeRepository);

const server = new McpServer({
  name: "mine_mcp",
  version: "0.1.0"
});

server.registerResource(
  "workspace-context",
  "mine-mcp://workspace/context",
  {
    title: "Minecraft workspace context",
    description: "Directories and files used by the MCP server.",
    mimeType: "application/json"
  },
  async () => ({
    contents: [
      {
        uri: "mine-mcp://workspace/context",
        mimeType: "application/json",
        text: JSON.stringify(
          {
            worldDir: paths.worldDir,
            outputDir: paths.outputDir,
            dataFile: paths.dataFile,
            recipesFile: paths.recipesFile
          },
          null,
          2
        )
      }
    ]
  })
);

server.tool(
  "register_recipe",
  "Register or update a Minecraft recipe, build guide, farm setup or potion reference.",
  {
    name: z.string().min(1),
    type: z.string().min(1),
    summary: z.string().min(1),
    resources: z.array(z.string().min(1)).min(1),
    process: z.array(z.string().min(1)).min(1),
    tags: z.array(z.string().min(1)).optional()
  },
  async ({ name, type, summary, resources, process, tags }) => {
    const recipe = await recipeService.registerRecipe({
      name,
      type,
      summary,
      resources,
      process,
      tags
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(recipe, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "list_recipes",
  "List stored Minecraft recipes, optionally filtered by category.",
  {
    type: z.string().optional()
  },
  async ({ type }) => {
    const recipes = await recipeService.listRecipes(type);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(recipes, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "get_recipe",
  "Return a stored Minecraft recipe or build guide by name.",
  {
    name: z.string().min(1)
  },
  async ({ name }) => {
    const recipe = await recipeService.getRecipeByName(name);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(recipe, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "register_point",
  "Register or update a named map point in the overworld JSON store.",
  {
    name: z.string().min(1),
    type: z.string().min(1),
    x: z.number(),
    z: z.number(),
    description: z.string().optional(),
    tags: z.array(z.string().min(1)).optional()
  },
  async ({ name, type, x, z: zCoord, description, tags }) => {
    const point = await mapService.registerPoint({
      name,
      type,
      x,
      z: zCoord,
      description,
      tags
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(point, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "list_points",
  "List registered map points, optionally filtered by type.",
  {
    type: z.string().optional()
  },
  async ({ type }) => {
    const points = await mapService.listPoints(type);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(points, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "distance_to_point",
  "Calculate the Euclidean distance between a current X/Z position and a named point.",
  {
    currentX: z.number(),
    currentZ: z.number(),
    pointName: z.string().min(1)
  },
  async ({ currentX, currentZ, pointName }) => {
    const result = await mapService.getDistanceToPoint(
      { x: currentX, z: currentZ },
      pointName
    );

    return {
      content: [
        {
          type: "text",
          text: `${result.point.name} is ${result.distance.toFixed(2)} blocks away from (${currentX}, ${currentZ}).`
        }
      ]
    };
  }
);

server.tool(
  "nearest_point_by_type",
  "Find the nearest registered point of a given type from a current X/Z position.",
  {
    currentX: z.number(),
    currentZ: z.number(),
    type: z.string().min(1)
  },
  async ({ currentX, currentZ, type }) => {
    const result = await mapService.getNearestPoint(
      { x: currentX, z: currentZ },
      type
    );

    return {
      content: [
        {
          type: "text",
          text: `${result.point.name} (${result.point.type}) is the nearest match at ${result.distance.toFixed(2)} blocks, coordinates (${result.point.x}, ${result.point.z}).`
        }
      ]
    };
  }
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("mine_mcp failed to start", error);
  process.exit(1);
});
