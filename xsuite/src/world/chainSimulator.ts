import { spawn } from 'node:child_process';

export const startChainSimulator = (
  port: number = 8085,
  debug: boolean = false,
  waitFor: number = 30_000,
  configFolder?: string
): Promise<string> => {
  let chainSimulator: any;
  try {
    chainSimulator = require('@xsuite/chain-simulator');
  } catch (e) {
    throw new Error(
      'Trying to use @xsuite/chain-simulator without the required package installed. Run `npm install @xsuite/chain-simulator` to fix this',
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

    const timeout = setTimeout(() => reject(new Error('Simulnet failed starting.')), waitFor);

    if (debug) {
      console.log('Starting chain simulator...');
    }

    server.stdout.on('data', (data) => {
      if (debug) {
        console.log(data.toString());
      }

      const activeRegex = /shard 4294967295 active nodes/;
      const match = data.toString().match(activeRegex);
      if (match) {
        clearTimeout(timeout);

        setTimeout(() => resolve(`http://localhost:${port}`), 250);
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