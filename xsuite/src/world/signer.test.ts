import path from "node:path";
import { afterEach, beforeEach, expect, test } from "@jest/globals";
import tmp from "tmp-promise";
import { input, stdoutInt } from "../_stdio";
import { KeystoreSigner } from "./signer";

let walletPath: string;

beforeEach(async () => {
  const dir = await tmp.dir({ unsafeCleanup: true });
  walletPath = path.resolve(dir.path, "wallet.json");
});

afterEach(async () => {
  await tmp.setGracefulCleanup();
});

test("KeystoreSigner non-interactive", async () => {
  KeystoreSigner.createFile(walletPath, "1234");
  const signer = KeystoreSigner.fromFile(walletPath, "1234");
  const signature = await signer.sign(Buffer.from(""));
  expect(signature.byteLength).toBeGreaterThan(0);
});

test("KeystoreSigner interactive", async () => {
  stdoutInt.start();
  input.injected.push("1234", "1234");
  await KeystoreSigner.createFileInteractive(walletPath);
  input.injected.push("1234");
  const signer = await KeystoreSigner.fromFileInteractive(walletPath);
  const signature = await signer.sign(Buffer.from(""));
  stdoutInt.stop();
  expect(stdoutInt.data.split("\n")).toEqual([
    `Creating keystore wallet at "${walletPath}"...`,
    "Enter password: ",
    "Re-enter password: ",
    `Loading keystore wallet at "${walletPath}"...`,
    "Enter password: ",
    "",
  ]);
  expect(signature.byteLength).toBeGreaterThan(0);
});