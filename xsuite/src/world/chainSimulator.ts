import { spawn } from 'node:child_process';

export const startChainSimulator = (
  port: number = 8085,
  debug: boolean = false,
  waitFor: number = 30_000,
  configFolder?: string
): Promise<[string, () => void]> => {
  let chainSimulator: any;
  try {
    chainSimulator = require('@xsuite/chainsimulator');
  } catch (e) {
    throw new Error(
      'Trying to use @xsuite/chainsimulator without the required package installed. Run `npm install @xsuite/chainsimulator` to fix this',
    );
  }

  const chainSimulatorBinPath = chainSimulator.getChainSimulatorBinPath();
  const chainSimulatorConfigFolder = configFolder || chainSimulator.getChainSimulatorDefaultConfigFolder();

  return new Promise((resolve, reject) => {
    const server = spawn(
      `${chainSimulatorBinPath}`,
      [
        '--server-port', port.toString(),
        '--config', `${chainSimulatorConfigFolder}/config.toml`,
        '--node-configs', `${chainSimulatorConfigFolder}/node/config`,
        '--proxy-configs', `${chainSimulatorConfigFolder}/proxy/config`,
      ],
    );

    const timeout = setTimeout(() => reject(new Error('Chain Simulator failed starting.')), waitFor);

    if (debug) {
      console.log('Starting chain simulator...');
    }

    server.stdout.on('data', (data) => {
      if (debug) {
        console.log(data.toString());
      }

      const activeRegex = /shard 4294967295 regular nodes/;
      const match = data.toString().match(activeRegex);
      if (match) {
        clearTimeout(timeout);

        setTimeout(() => resolve([`http://localhost:${port}`, () => {
          server.kill();
        }]), 250);
      }
    });

    server.stderr.on('data', (data: Buffer) => {
      throw new Error(data.toString());
    });

    server.on('error', (error) => {
      throw error;
    });
  });
};