import { ChildProcess } from "node:child_process";
import { getSproxyBinPath } from "@xsuite/simulnet";
import { spawnChildProcess } from "./childProcesses";

export const startSproxyBin = async (): Promise<{
  server: ChildProcess;
  proxyUrl: string;
}> => {
  const server = spawnChildProcess(getSproxyBinPath());

  server.stderr.on("data", (data: Buffer) => {
    throw new Error(data.toString());
  });

  server.on("error", (error) => {
    throw error;
  });

  const proxyUrl = await new Promise<string>((resolve, reject) => {
    server.stdout.on("data", (data: Buffer) => {
      const addressRegex = /Server running on (http:\/\/[\w\d.:]+)/;
      const match = data.toString().match(addressRegex);
      if (match === null) {
        reject(new Error("Simulnet failed starting."));
      } else {
        resolve(match[1]);
      }
    });
  });

  return { server, proxyUrl };
};
