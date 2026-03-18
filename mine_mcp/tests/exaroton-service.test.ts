import { jest } from "@jest/globals";
import { ExarotonService, statusCodeToName } from "../src/services/exaroton-service.js";

describe("ExarotonService", () => {
  it("maps documented exaroton status codes", () => {
    expect(statusCodeToName(1)).toBe("ONLINE");
    expect(statusCodeToName(10)).toBe("PREPARING");
    expect(statusCodeToName(99)).toBe("UNKNOWN_99");
  });

  it("lists servers using the REST API", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        error: null,
        data: [
          {
            id: "srv-1",
            name: "Coroa do Inverno",
            address: "example.exaroton.me",
            motd: "hello",
            status: 1,
            host: "node-1",
            port: 25565,
            players: { max: 20, count: 2, list: ["rod", "ally"] },
            software: { id: "sw-1", name: "Paper", version: "1.21.4" },
            shared: false
          }
        ]
      })
    });

    const service = new ExarotonService("token", undefined, fetchMock as unknown as typeof fetch);
    const servers = await service.listServers();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.exaroton.com/v1/servers/",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token"
        })
      })
    );
    expect(servers).toHaveLength(1);
    expect(servers[0].name).toBe("Coroa do Inverno");
  });

  it("builds a server overview with status name and configured RAM", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          error: null,
          data: {
            id: "srv-1",
            name: "Coroa do Inverno",
            address: "example.exaroton.me",
            motd: "hello",
            status: 6,
            host: "node-1",
            port: 25565,
            players: { max: 20, count: 0, list: [] },
            software: { id: "sw-1", name: "Paper", version: "1.21.4" },
            shared: false
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          error: null,
          data: 8
        })
      });

    const service = new ExarotonService("token", "srv-1", fetchMock as unknown as typeof fetch);
    const server = await service.getServer();

    expect(server.statusName).toBe("LOADING");
    expect(server.configuredRamGb).toBe(8);
  });

  it("throws when the API token is missing", async () => {
    const service = new ExarotonService(undefined, "srv-1", jest.fn() as unknown as typeof fetch);

    await expect(service.getServer()).rejects.toThrow("Missing EXAROTON_API_TOKEN.");
  });
});
