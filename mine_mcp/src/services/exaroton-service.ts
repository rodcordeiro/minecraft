const EXAROTON_API_BASE_URL = "https://api.exaroton.com/v1";

export interface ExarotonAccount {
  name: string;
  email: string;
  verified: boolean;
  credits: number;
}

export interface ExarotonServerPlayers {
  max: number;
  count: number;
  list: string[];
}

export interface ExarotonServerSoftware {
  id: string;
  name: string;
  version: string;
}

export interface ExarotonServer {
  id: string;
  name: string;
  address: string | null;
  motd: string | null;
  status: number;
  host: string | null;
  port: number | null;
  players: ExarotonServerPlayers;
  software: ExarotonServerSoftware | null;
  shared: boolean;
}

interface ExarotonApiResponse<T> {
  success: boolean;
  error: string | null;
  data: T | null;
}

export interface ExarotonServerOverview extends ExarotonServer {
  statusName: string;
  configuredRamGb?: number;
}

export class ExarotonService {
  constructor(
    private readonly token = process.env.EXAROTON_API_TOKEN,
    private readonly defaultServerId = process.env.EXAROTON_SERVER_ID,
    private readonly fetchImpl: typeof fetch = fetch
  ) {}

  async getAccount(): Promise<ExarotonAccount> {
    return this.request<ExarotonAccount>("/account/");
  }

  async listServers(): Promise<ExarotonServer[]> {
    return this.request<ExarotonServer[]>("/servers/");
  }

  async getServer(serverId?: string): Promise<ExarotonServerOverview> {
    const resolvedServerId = this.resolveServerId(serverId);
    const server = await this.request<ExarotonServer>(`/servers/${resolvedServerId}/`);
    const configuredRamGb = await this.getServerRam(resolvedServerId).catch(() => undefined);

    return {
      ...server,
      statusName: statusCodeToName(server.status),
      configuredRamGb
    };
  }

  async getServerRam(serverId?: string): Promise<number> {
    const resolvedServerId = this.resolveServerId(serverId);
    return this.request<number>(`/servers/${resolvedServerId}/ram/`);
  }

  private resolveServerId(serverId?: string): string {
    const resolvedServerId = serverId?.trim() || this.defaultServerId?.trim();
    if (!resolvedServerId) {
      throw new Error("Missing exaroton server id. Pass serverId or set EXAROTON_SERVER_ID.");
    }

    return resolvedServerId;
  }

  private async request<T>(pathname: string): Promise<T> {
    const token = this.token?.trim();
    if (!token) {
      throw new Error("Missing EXAROTON_API_TOKEN.");
    }

    const response = await this.fetchImpl(`${EXAROTON_API_BASE_URL}${pathname}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`exaroton request failed with HTTP ${response.status}.`);
    }

    const payload = (await response.json()) as ExarotonApiResponse<T>;
    if (!payload.success || payload.data === null) {
      throw new Error(payload.error || "exaroton request failed.");
    }

    return payload.data;
  }
}

export function statusCodeToName(status: number): string {
  switch (status) {
    case 0:
      return "OFFLINE";
    case 1:
      return "ONLINE";
    case 2:
      return "STARTING";
    case 3:
      return "STOPPING";
    case 4:
      return "RESTARTING";
    case 5:
      return "SAVING";
    case 6:
      return "LOADING";
    case 7:
      return "CRASHED";
    case 8:
      return "PENDING";
    case 9:
      return "TRANSFERRING";
    case 10:
      return "PREPARING";
    default:
      return `UNKNOWN_${status}`;
  }
}
