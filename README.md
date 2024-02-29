# Reproduce EGLD bug

- pnpm install
- pnpm run build-xsuite-chainsimulator 
- pnpm run build-xsuite
- cd xsuite && npm run test src/world/csworld.test.ts

It runs only the test `CSWorld.executeTx` from the `csworld.test.ts` file, which does the following:
- starts the chain simulator (check `xsuite/src/world/chainSimulator.ts` file, it runs the binary built and stored in `xsuite-chainsimulator/bin`)
- creates a sender account & generates 1 block
- creates a receiver account & generates 1 block
- sends tx & generates up to 10 blocks to wait until it is no longer pending
- test fails
- if lines `44-48` from `src/world/csworld.test.ts` are uncommented, the test passes with a wallet in same shard


<a href="https://xsuite.dev">
  <p align="center">
    <img src="./Logo.png" height="128">
  </p>
</a>
<h1 align="center">
  <a href="https://xsuite.dev">
    xSuite
  </a>
</h1>

<p align="center">
  <a href="https://arda.run">
    <img src="https://img.shields.io/badge/MADE%20BY%20ARDA-000000.svg?style=for-the-badge">
  </a>
  <a href="https://t.me/xSuite_js">
    <img src="https://img.shields.io/badge/Join%20on%20telegram-blue.svg?style=for-the-badge&logo=Telegram&logoColor=ffffff">
  </a>
</p>

xSuite is the full suite for efficiently developing high-quality MultiversX smart contracts. Init, build, test, deploy contracts in seconds.

xSuite is made by [the Arda team](https://arda.run) and is the result of their deep expertise from building numerous dApps and auditing [35+ contracts](https://arda.run/audits). xSuite is extensively tested with 450+ tests and 100% test coverage of critical parts, to ensure it is always safe and reliable.

A big thank you to [the Buidly team](https://twitter.com/buidly_) who intensively used xSuite in their projects, provided valuable feedback and drafted the first version of the documentation.

<a href="https://twitter.com/buidly_">
  <p align="center">
    <img src="./docs/public/Buidly.png" />
  </p>
</a>

> :warning: xSuite is in beta phase.

## Documentation

Visit [https://xsuite.dev](https://xsuite.dev) to view the full documentation.

## Starter Contracts (audited)

Starter contracts are a great starting point for your new smart contract. They will save you significant time setting up the codebase and writing the initial logic. They are **audited by Arda**. [View starter contracts](https://xsuite.dev/initialize-contract).

## Onboarding and Training

If you want you or your team to receive a personal onboarding and training to xSuite, please contact [Lucas Willems](https://t.me/LucasWillems).

## Who is using xSuite?

xSuite has been used internally by Arda since more than a year, and has been released publicly recently. Many ecosystem teams have started to be onboarded and trained to use xSuite. To get your team onboarded and trained too, please contact [Lucas Willems](https://t.me/LucasWillems).

## Community

The xSuite community can be found on [xSuite Telegram group](https://t.me/xSuite_js), where you can ask questions, share ideas and meet other community members.
