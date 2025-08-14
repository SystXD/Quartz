import { readdirSync } from "fs";
import { join } from "path";
export async function wait(time: number) {
  return new Promise((res, _rej) => setTimeout(res, time));
}

export async function retry<T>(
  task: () => Promise<T>,
  {
    maxRetry,
    retryTimeout,
    onRetry,
  }: {
    maxRetry: number;
    retryTimeout: number;
    onRetry?: (err: unknown, attempt: number) => unknown;
  }
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await task();
    } catch (err) {
      attempt++;
      if (attempt > maxRetry) {
        throw err;
      }
      onRetry?.(err, attempt);
      await wait(retryTimeout);
    }
  }
}

export interface FileInfo {
  fileName: string;
  filePath: string;
}

export function getFiles(dir: string, nested?: boolean): FileInfo[] {
  const filesInfo: FileInfo[] = [];
  const folders = readdirSync(dir, { withFileTypes: true });
  folders.forEach((folder) => {
    const folderPath = join(dir, folder.name);
    const fileName = folder.name;
    if (folder.isDirectory() && nested) {
      filesInfo.push(...getFiles(folderPath, nested));
    } else if (folder.isFile()) {
      filesInfo.push({
        fileName,
        filePath: folderPath,
      });
    }
  });

  return filesInfo;
}
