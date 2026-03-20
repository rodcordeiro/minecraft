import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

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

export interface ExarotonFileInfo {
  path: string;
  name: string;
  isTextFile: boolean;
  isConfigFile: boolean;
  isDirectory: boolean;
  isLog: boolean;
  isReadable: boolean;
  isWritable: boolean;
  size: number;
  children?: ExarotonFileInfo[];
}

export interface ExarotonDownloadedFile {
  remotePath: string;
  localPath: string;
  size: number;
}

export interface ExarotonDownloadSummary {
  remotePath: string;
  localPath: string;
  filesDownloaded: number;
  directoriesCreated: number;
  bytesDownloaded: number;
  files: ExarotonDownloadedFile[];
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

  /** Returns file or directory metadata from the exaroton file API. */
  async getFileInfo(filePath: string, serverId?: string): Promise<ExarotonFileInfo> {
    const resolvedServerId = this.resolveServerId(serverId);
    const normalizedFilePath = normalizeRemotePath(filePath);
    return this.request<ExarotonFileInfo>(
      `/servers/${resolvedServerId}/files/info/${encodeApiPath(normalizedFilePath)}/`
    );
  }

  /** Reads a remote text file and returns its UTF-8 contents. */
  async getTextFile(filePath: string, serverId?: string): Promise<string> {
    const buffer = await this.getFileData(filePath, serverId);
    return buffer.toString("utf8");
  }

  /** Downloads a remote file into a local destination inside the workspace. */
  async downloadFile(filePath: string, localPath: string, serverId?: string): Promise<ExarotonDownloadedFile> {
    const normalizedFilePath = normalizeRemotePath(filePath);
    const fileInfo = await this.getFileInfo(normalizedFilePath, serverId);

    if (fileInfo.isDirectory) {
      throw new Error(`Remote path "${normalizedFilePath}" is a directory. Use downloadDirectory instead.`);
    }

    const data = await this.getFileData(normalizedFilePath, serverId);
    const resolvedLocalPath = path.resolve(localPath);

    await mkdir(path.dirname(resolvedLocalPath), { recursive: true });
    await writeFile(resolvedLocalPath, data);

    return {
      remotePath: normalizedFilePath,
      localPath: resolvedLocalPath,
      size: data.byteLength
    };
  }

  /** Downloads a remote directory recursively into a local destination inside the workspace. */
  async downloadDirectory(
    remoteDirPath: string,
    localDirPath: string,
    serverId?: string
  ): Promise<ExarotonDownloadSummary> {
    const normalizedRemoteDirPath = normalizeRemotePath(remoteDirPath);
    const resolvedLocalDirPath = path.resolve(localDirPath);
    const rootInfo = await this.getFileInfo(normalizedRemoteDirPath, serverId);

    if (!rootInfo.isDirectory) {
      throw new Error(`Remote path "${normalizedRemoteDirPath}" is not a directory.`);
    }

    const summary: ExarotonDownloadSummary = {
      remotePath: normalizedRemoteDirPath,
      localPath: resolvedLocalDirPath,
      filesDownloaded: 0,
      directoriesCreated: 0,
      bytesDownloaded: 0,
      files: []
    };

    await this.downloadDirectoryRecursive(rootInfo, resolvedLocalDirPath, summary, serverId);

    return summary;
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

  /** Downloads raw file bytes from the exaroton file API. */
  private async getFileData(filePath: string, serverId?: string): Promise<Buffer> {
    const resolvedServerId = this.resolveServerId(serverId);
    const normalizedFilePath = normalizeRemotePath(filePath);
    const token = this.token?.trim();

    if (!token) {
      throw new Error("Missing EXAROTON_API_TOKEN.");
    }

    const response = await this.fetchImpl(
      `${EXAROTON_API_BASE_URL}/servers/${resolvedServerId}/files/data/${encodeApiPath(normalizedFilePath)}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/octet-stream"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`exaroton request failed with HTTP ${response.status}.`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /** Walks a remote directory tree and persists every readable file locally. */
  private async downloadDirectoryRecursive(
    directory: ExarotonFileInfo,
    localDirPath: string,
    summary: ExarotonDownloadSummary,
    serverId?: string
  ): Promise<void> {
    await mkdir(localDirPath, { recursive: true });
    summary.directoriesCreated += 1;

    const children = directory.children ?? [];
    for (const child of children) {
      const childLocalPath = path.join(localDirPath, child.name);

      if (child.isDirectory) {
        await this.downloadDirectoryRecursive(child, childLocalPath, summary, serverId);
        continue;
      }

      const downloadedFile = await this.downloadFile(child.path, childLocalPath, serverId);
      summary.filesDownloaded += 1;
      summary.bytesDownloaded += downloadedFile.size;
      summary.files.push(downloadedFile);
    }
  }
}

/** Encodes slash-separated exaroton file paths without losing the directory structure. */
function encodeApiPath(filePath: string): string {
  return filePath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

/** Normalizes user input into a safe exaroton file path relative to the server root. */
function normalizeRemotePath(filePath: string): string {
  const normalizedPath = filePath.replaceAll("\\", "/").trim().replace(/^\/+|\/+$/g, "");

  if (!normalizedPath) {
    throw new Error("Missing remote file path.");
  }

  if (normalizedPath.split("/").some((segment) => segment === "..")) {
    throw new Error(`Remote path "${filePath}" cannot contain '..'.`);
  }

  return normalizedPath;
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
