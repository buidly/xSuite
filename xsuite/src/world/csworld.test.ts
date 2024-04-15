import { beforeEach, expect, test, beforeAll, afterAll, assert } from "vitest";
import { assertAccount, assertVs } from "../assert";
import { e } from "../data";
import { Tx } from "../proxy";
import { DummySigner } from "./signer";
import {
  generateContractU8AAddress,
  generateWalletU8AAddress,
  isContractAddress,
} from "./utils";
import { CSWorld, CSContract, CSWallet } from ".";

let world: CSWorld;
let wallet: CSWallet;
let otherWallet: CSWallet;
let contract: CSContract;
const fftId = "FFT-abcdef";
const sftId = "SFT-abcdef";
const worldCode = "file:contracts/world/output/world.wasm";
const zeroBechAddress =
  "erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu";
const zeroHexAddress =
  "0000000000000000000000000000000000000000000000000000000000000000";
const zeroBytesAddress = new Uint8Array(32);
const emptyAccount = {
  nonce: 0,
  balance: 0,
  code: "",
  codeHash: "",
  codeMetadata: "",
  owner: "",
  kvs: {},
};
const explorerUrl = "http://explorer.local";

beforeAll(async () => {
  world = await CSWorld.start({
    explorerUrl,
    // verbose: true,
    // debug: true,
    waitFor: 120_000,
  });
  wallet = await world.createWallet({
    balance: 10n ** 18n,
    kvs: [e.kvs.Esdts([{ id: fftId, amount: 10n ** 18n }])],
  }); // wallet in shard 0
  otherWallet = await world.createWallet();

  // pass an epoch so system smart contracts are enabled
  await world.generateBlocksUntilEpochReached(1);

  contract = await wallet.createContract({
    balance: 10n ** 18n,
    code: worldCode,
    codeMetadata: ["payable"],
    kvs: {
      esdts: [{ id: fftId, amount: 10n ** 18n }],
      mappers: [{ key: "n", value: e.U64(2) }],
    },
  });

  // const result = await wallet.deployContract({
  //   code: worldCode,
  //   codeMetadata: ['payable'],
  //   codeArgs: [e.U64(1)],
  //   gasLimit: 10_000_000,
  // });
  // contract = result.contract;
}, 120_000);

afterAll(() => {
  world.terminate();
}, 60_000);

beforeEach(async () => {
  await wallet.setAccount({
    balance: 10n ** 18n,
    kvs: [e.kvs.Esdts([{ id: fftId, amount: 10n ** 18n }])],
  });
  await otherWallet.setAccount({
    balance: 0,
    kvs: [],
  });
  await contract.setAccount({
    balance: 10n ** 18n,
    codeMetadata: ["payable"],
    kvs: [
      e.kvs.Esdts([{ id: fftId, amount: 10n ** 18n }]),
      [e.Str("n"), e.U64(2)],
    ],
  });
});

test("CSWorld.proxy.getAccountNonce on empty bech address", async () => {
  expect(await world.proxy.getAccountNonce(zeroBechAddress)).toEqual(0);
});

test("CSWorld.proxy.getAccountNonce on empty hex address", async () => {
  expect(await world.proxy.getAccountNonce(zeroHexAddress)).toEqual(0);
});

test("CSWorld.proxy.getAccountNonce on empty bytes address", async () => {
  expect(await world.proxy.getAccountNonce(zeroBytesAddress)).toEqual(0);
});

test("CSWorld.proxy.getAccountBalance on empty bech address", async () => {
  expect(await world.proxy.getAccountBalance(zeroBechAddress)).toEqual(0n);
});

test("CSWorld.proxy.getAccountBalance on empty hex address", async () => {
  expect(await world.proxy.getAccountBalance(zeroHexAddress)).toEqual(0n);
});

test("CSWorld.proxy.getAccountBalance on empty bytes address", async () => {
  expect(await world.proxy.getAccountBalance(zeroBytesAddress)).toEqual(0n);
});

test("CSWorld.proxy.getAccountWithKvs on empty bech address", async () => {
  assertAccount(
    await world.proxy.getAccountWithKvs(zeroBechAddress),
    emptyAccount,
  );
});

test("CSWorld.proxy.getAccountWithKvs on empty hex address", async () => {
  assertAccount(
    await world.proxy.getAccountWithKvs(zeroHexAddress),
    emptyAccount,
  );
});

test("CSWorld.proxy.getAccountWithKvs on empty bytes address", async () => {
  assertAccount(
    await world.proxy.getAccountWithKvs(zeroBytesAddress),
    emptyAccount,
  );
});

test("CSWorld.new with defined chainId", () => {
  expect(() => CSWorld.new({ chainId: "D" })).toThrow(
    "chainId is not undefined.",
  );
});

test("CSWorld.newDevnet", () => {
  expect(() => CSWorld.newDevnet()).toThrow("newDevnet is not implemented.");
});

test("CSWorld.newTestnet", () => {
  expect(() => CSWorld.newTestnet()).toThrow("newTestnet is not implemented.");
});

test("CSWorld.newMainnet", () => {
  expect(() => CSWorld.newMainnet()).toThrow("newMainnet is not implemented.");
});

test("CSWorld.newWallet", async () => {
  const wallet = world.newWallet(new DummySigner(new Uint8Array(32)));
  expect(wallet.toTopBytes()).toEqual(new Uint8Array(32));
});

test("CSWorld.newContract", async () => {
  const wallet = world.newWallet(new DummySigner(new Uint8Array(32)));
  expect(wallet.toTopBytes()).toEqual(new Uint8Array(32));
});

test("CSWorld.createWallet - empty wallet", async () => {
  const wallet = await world.createWallet();
  expect(wallet.explorerUrl).toEqual(`${explorerUrl}/accounts/${wallet}`);
  expect(isContractAddress(wallet)).toEqual(false);
  assertAccount(await wallet.getAccountWithKvs(), {});
});

test("CSWorld.createWallet - with balance", async () => {
  const wallet = await world.createWallet({ balance: 10n });
  assertAccount(await wallet.getAccountWithKvs(), { balance: 10n });
});

test("CSWorld.createWallet - with address & balance", async () => {
  const address = generateWalletU8AAddress();
  const wallet = await world.createWallet({ address, balance: 10n });
  assertAccount(await wallet.getAccountWithKvs(), { address, balance: 10n });
});

test("CSWorld.createContract - empty contract", async () => {
  const contract = await world.createContract();
  expect(contract.explorerUrl).toEqual(`${explorerUrl}/accounts/${contract}`);
  expect(isContractAddress(contract)).toEqual(true);
  assertAccount(await contract.getAccountWithKvs(), { code: "00" });
});

test("CSWorld.createContract - with balance", async () => {
  const contract = await world.createContract({ balance: 10n });
  assertAccount(await contract.getAccountWithKvs(), { balance: 10n });
});

test("CSWorld.createContract - with file:", async () => {
  const contract = await world.createContract({ code: worldCode });
  assertAccount(await contract.getAccountWithKvs(), { code: worldCode });
});

test("CSWorld.createContract - with address & file:", async () => {
  const address = generateContractU8AAddress();
  const contract = await world.createContract({ address, code: worldCode });
  assertAccount(await contract.getAccountWithKvs(), {
    address,
    code: worldCode,
  });
});

test("CSWorld.getAccountNonce", async () => {
  await wallet.setAccount({ nonce: 10 });
  expect(await world.getAccountNonce(wallet)).toEqual(10);
});

test("CSWorld.getAccountBalance", async () => {
  await wallet.setAccount({ balance: "1234" });
  expect(await world.getAccountBalance(wallet)).toEqual(1234n);
});

test("CSWorld.getAccount", async () => {
  await wallet.setAccount({ nonce: 10, balance: 1234 });
  assertAccount(await world.getAccount(wallet), { nonce: 10, balance: 1234 });
});

test("CSWorld.getAccountKvs", async () => {
  await wallet.setAccount({ kvs: [e.kvs.Mapper("n").Value(e.U(12))] });
  expect(await world.getAccountKvs(wallet)).toEqual(
    e.kvs([[e.Str("n"), e.U(12)]]),
  );
});

test("CSWorld.getAccountWithKvs", async () => {
  await wallet.setAccount({
    nonce: 10,
    balance: 1234,
    kvs: [e.kvs.Mapper("n").Value(e.U(12))],
  });
  assertAccount(await world.getAccountWithKvs(wallet), {
    nonce: 10,
    balance: 1234,
    kvs: [e.kvs.Mapper("n").Value(e.U(12))],
  });
});

test("CSWorld.setAccount", async () => {
  await world.setAccount({
    address: contract,
    balance: 1234,
    code: worldCode,
    codeMetadata: ["upgradeable"],
    kvs: [e.kvs.Mapper("n").Value(e.U64(10))],
    owner: wallet,
  });
  assertAccount(await contract.getAccountWithKvs(), {
    balance: 1234,
    code: worldCode,
    codeMetadata: ["upgradeable"],
    kvs: [e.kvs.Mapper("n").Value(e.U64(10))],
    owner: wallet,
  });
});

test("CSWorld.query - basic", async () => {
  const { returnData } = await world.query({
    callee: contract,
    funcName: "multiply_by_n",
    funcArgs: [e.U64(10)],
  });
  assertVs(returnData, [e.U64(20n)]);
});

test("CSWorld.query - sender", async () => {
  const { returnData } = await world.query({
    callee: contract,
    funcName: "get_caller",
    sender: wallet,
  });
  assertVs(returnData, [wallet]);
});

test("CSWorld.query - value", async () => {
  const { returnData } = await world.query({
    callee: contract,
    funcName: "get_value",
    value: 10,
  });
  assertVs(returnData, [e.U(10)]);
});

test("CSWorld.query - try to change the state", async () => {
  await world.query({
    callee: contract,
    funcName: "set_n",
    funcArgs: [e.U64(100)],
  });
  assertAccount(await contract.getAccountWithKvs(), {
    kvs: [
      e.kvs.Esdts([{ id: fftId, amount: 10n ** 18n }]),
      e.kvs.Mapper("n").Value(e.U64(2)),
    ],
  });
});

test("CSWorld.executeTx", async () => {
  const { tx } = await world.executeTx({
    sender: wallet,
    receiver: otherWallet,
    value: 10n ** 17n,
    gasLimit: 10_000_000,
  });
  expect(tx.hash).toBeTruthy();
  expect(tx.explorerUrl).toEqual(`${explorerUrl}/transactions/${tx.hash}`);
  assertAccount(await wallet.getAccountWithKvs(), {
    balance: 9n * 10n ** 17n - 50_000n * 10n ** 9n,
  });
  assertAccount(await otherWallet.getAccountWithKvs(), {
    balance: 10n ** 17n,
  });
});

test(
  "CSWorld.sendTx",
  async () => {
    const txHash = await world.sendTx(
      Tx.getParamsToCallContract({
        sender: wallet,
        callee: contract,
        funcName: "fund",
        value: 10n ** 17n,
        gasLimit: 10_000_000,
      }),
    );

    // Transaction was not yet included in a block
    try {
      await world.proxy.getTx(txHash, { withResults: true });

      assert(false);
    } catch (e) {
      assert(true);
    }

    // After generating 1 block, transaction is pending
    await world.generateBlock();
    let result = await world.proxy.getTx(txHash, { withResults: true });

    expect(result.status === "pending");

    // After generating 2 blocks, transaction is successful
    await world.generateBlocks(1);
    result = await world.proxy.getTx(txHash, { withResults: true });

    expect(result.status === "success");

    assertAccount(await wallet.getAccountWithKvs(), {
      balance: 9n * 10n ** 17n - 6_864_545n * 10n ** 7n,
    });
    assertAccount(await contract.getAccountWithKvs(), {
      balance: 10n ** 18n + 10n ** 17n,
    });
  },
  { timeout: 15_000, retry: 3 },
);

test(
  "CSWorld.transfer",
  async () => {
    await world.transfer({
      sender: wallet,
      receiver: otherWallet,
      value: 10n ** 17n,
      gasLimit: 10_000_000,
    });
    await world.transfer({
      sender: wallet,
      receiver: otherWallet,
      esdts: [{ id: fftId, amount: 10n ** 17n }],
      gasLimit: 10_000_000,
    });
    assertAccount(await wallet.getAccountWithKvs(), {
      balance: 9n * 10n ** 17n - 388_095n * 10n ** 9n,
      hasKvs: [e.kvs.Esdts([{ id: fftId, amount: 9n * 10n ** 17n }])],
    });
    assertAccount(await otherWallet.getAccountWithKvs(), {
      balance: 10n ** 17n,
      hasKvs: [e.kvs.Esdts([{ id: fftId, amount: 10n ** 17n }])],
    });
  },
  { timeout: 15_000, retry: 3 },
);

test("CSWorld.deployContract & upgradeContract", async () => {
  const { contract } = await world.deployContract({
    sender: wallet,
    code: worldCode,
    codeMetadata: ["readable", "payable", "payableBySc", "upgradeable"],
    codeArgs: [e.U64(1)],
    gasLimit: 10_000_000,
  });
  expect(contract.explorerUrl).toEqual(`${explorerUrl}/accounts/${contract}`);
  assertAccount(await contract.getAccountWithKvs(), {
    code: worldCode,
    hasKvs: [[e.Str("n"), e.U64(1)]],
  });
  await world.upgradeContract({
    sender: wallet,
    callee: contract,
    code: worldCode,
    codeMetadata: "0000",
    codeArgs: [e.U64(2)],
    gasLimit: 10_000_000,
  });
  assertAccount(await contract.getAccountWithKvs(), {
    code: worldCode,
    hasKvs: [[e.Str("n"), e.U64(2)]],
  });
});

test("CSWorld.callContract", async () => {
  await world.callContract({
    sender: wallet,
    callee: contract,
    funcName: "fund",
    value: 10n ** 17n,
    gasLimit: 10_000_000,
  });
  assertAccount(await wallet.getAccountWithKvs(), {
    balance: 9n * 10n ** 17n - 6_864_545n * 10n ** 7n,
  });
  assertAccount(await contract.getAccountWithKvs(), {
    balance: 10n ** 18n + 10n ** 17n,
  });
});

test("CSWorld.getInitialWallets", async () => {
  const initialWallets = await world.getInitialWallets();
  const initialAddressWithStake = initialWallets.stakeWallets[0].address.bech32;
  assert(initialAddressWithStake);

  const initialAddressWithBalance =
    initialWallets.balanceWallets[0].address.bech32;
  const initialAddressWithBalanceWallet = world.newWallet(
    new DummySigner(initialAddressWithBalance),
  );
  assertAccount(await initialAddressWithBalanceWallet.getAccountWithKvs(), {
    balance: 6663333333333333333333333n,
  });
});

test("CSWallet.query", async () => {
  const { returnData } = await wallet.query({
    callee: contract,
    funcName: "get_caller",
  });
  assertVs(returnData, [wallet]);
});

test.todo("CSWallet.query - esdts", async () => {
  const { returnData } = await wallet.query({
    callee: contract,
    funcName: "get_esdts",
    esdts: [
      { id: fftId, amount: 10 },
      { id: sftId, nonce: 1, amount: 20 },
    ],
  } as any);
  // remove the "as any"
  assertVs(returnData, [
    e.Tuple(e.Str(fftId), e.U64(0), e.U(10)),
    e.Tuple(e.Str(sftId), e.U64(1), e.U(20)),
  ]);
});

test("CSWallet.callContract failure", async () => {
  await expect(
    world.query({
      callee: contract,
      funcName: "non_existent_function",
    }),
  ).rejects.toMatchObject({
    message: expect.stringMatching(
      /^Query failed: function not found - invalid function \(not found\) - Result:\n\{\n {2}"returnData": null,/,
    ),
    stack: expect.stringMatching(/src\/world\/csworld\.test\.ts:[0-9]+:[0-9]+/),
  });
});

test("CSWorld.query.assertFail - Correct parameters", async () => {
  await world
    .query({
      callee: contract,
      funcName: "require_positive",
      funcArgs: [e.U64(0)],
    })
    .assertFail({ code: "user error", message: "Amount is not positive." });
});

test("CSWallet.getAccountNonce", async () => {
  const oldNonce = await wallet.getAccountNonce();

  await wallet.setAccount({ nonce: 0 });
  expect(await wallet.getAccountNonce()).toEqual(0);

  // Preserve old account nonce since these tests are ran on shared chain simulator
  await wallet.setAccount({
    nonce: oldNonce,
  });
});

test("CSWallet.getAccountBalance", async () => {
  expect(await wallet.getAccountBalance()).toEqual(10n ** 18n);
});

test("CSWallet.getAccountKvs", async () => {
  expect(await wallet.getAccountKvs()).toEqual(
    e.kvs({ esdts: [{ id: fftId, amount: 10n ** 18n }] }),
  );
});

test("CSWallet.getAccount", async () => {
  const oldNonce = await wallet.getAccountNonce();

  await wallet.setAccount({ nonce: 0 });

  assertAccount(await wallet.getAccount(), {
    nonce: 0,
    balance: 10n ** 18n,
    code: "",
    codeHash: "",
    codeMetadata: [],
    owner: "",
  });

  // Preserve old account nonce since these tests are ran on shared chain simulator
  await wallet.setAccount({
    nonce: oldNonce,
  });
});

test("CSWallet.getAccountWithKvs", async () => {
  const oldNonce = await wallet.getAccountNonce();

  await wallet.setAccount({ nonce: 0 });

  assertAccount(await wallet.getAccountWithKvs(), {
    nonce: 0,
    balance: 10n ** 18n,
    code: "",
    codeHash: "",
    codeMetadata: [],
    owner: "",
    hasKvs: [e.kvs.Esdts([{ id: fftId, amount: 10n ** 18n }])],
  });

  // Preserve old account nonce since these tests are ran on shared chain simulator
  await wallet.setAccount({
    nonce: oldNonce,
  });
});

test("CSWorld.createWallet", async () => {
  const wallet = await world.createWallet({ balance: 10n });
  assertAccount(await wallet.getAccountWithKvs(), { balance: 10n });
});

test("CSContract.getAccountNonce", async () => {
  expect(await contract.getAccountNonce()).toEqual(0);
});

test("CSContract.getAccountBalance", async () => {
  expect(await contract.getAccountBalance()).toEqual(10n ** 18n);
});

test("CSContract.getAccountKvs", async () => {
  expect(await contract.getAccountKvs()).toEqual(
    e.kvs({
      esdts: [{ id: fftId, amount: 10n ** 18n }],
      extraKvs: [[e.Str("n"), e.U64(2)]],
    }),
  );
});

test("CSContract.getAccount", async () => {
  assertAccount(await contract.getAccount(), {
    nonce: 0,
    balance: 10n ** 18n,
  });
});

test("CSContract.getAccountWithKvs", async () => {
  assertAccount(await contract.getAccountWithKvs(), {
    nonce: 0,
    balance: 10n ** 18n,
    code: worldCode,
    codeMetadata: ["payable"],
    owner: wallet,
    hasKvs: [e.kvs.Esdts([{ id: fftId, amount: 10n ** 18n }])],
  });
});

test("CSWallet.executeTx", async () => {
  const { tx } = await wallet.executeTx({
    receiver: otherWallet,
    value: 10n ** 17n,
    gasLimit: 10_000_000,
  });
  expect(tx.hash).toBeTruthy();
  expect(tx.explorerUrl).toEqual(`${explorerUrl}/transactions/${tx.hash}`);
  assertAccount(await wallet.getAccountWithKvs(), {
    balance: 9n * 10n ** 17n - 50_000n * 10n ** 9n,
  });
  assertAccount(await otherWallet.getAccountWithKvs(), {
    balance: 10n ** 17n,
  });
});

test(
  "CSWallet.transfer",
  async () => {
    await wallet.transfer({
      receiver: otherWallet,
      value: 10n ** 17n,
      gasLimit: 10_000_000,
    });
    await wallet.transfer({
      receiver: otherWallet,
      esdts: [{ id: fftId, amount: 10n ** 17n }],
      gasLimit: 10_000_000,
    });
    assertAccount(await wallet.getAccountWithKvs(), {
      balance: 9n * 10n ** 17n - 388_095n * 10n ** 9n,
      hasKvs: [e.kvs.Esdts([{ id: fftId, amount: 9n * 10n ** 17n }])],
    });
    assertAccount(await otherWallet.getAccountWithKvs(), {
      balance: 10n ** 17n,
      hasKvs: [e.kvs.Esdts([{ id: fftId, amount: 10n ** 17n }])],
    });
  },
  { timeout: 10_000 },
);

test("CSWallet.deployContract & upgradeContract", async () => {
  const { contract } = await wallet.deployContract({
    code: worldCode,
    codeMetadata: ["readable", "payable", "payableBySc", "upgradeable"],
    codeArgs: [e.U64(1)],
    gasLimit: 10_000_000,
  });
  expect(isContractAddress(contract)).toEqual(true);
  expect(contract.explorerUrl).toEqual(`${explorerUrl}/accounts/${contract}`);
  assertAccount(await contract.getAccountWithKvs(), {
    code: worldCode,
    hasKvs: [[e.Str("n"), e.U64(1)]],
  });
  await wallet.upgradeContract({
    callee: contract,
    code: worldCode,
    codeMetadata: "0000",
    codeArgs: [e.U64(2)],
    gasLimit: 10_000_000,
  });
  assertAccount(await contract.getAccountWithKvs(), {
    code: worldCode,
    hasKvs: [[e.Str("n"), e.U64(2)]],
  });
});

test("CSWallet.deployContract - is contract address", async () => {
  const { contract } = await wallet.deployContract({
    code: worldCode,
    codeMetadata: [],
    codeArgs: [e.U64(1)],
    gasLimit: 10_000_000,
  });
  expect(isContractAddress(contract)).toEqual(true);
});

test("CSWallet.callContract with EGLD", async () => {
  await wallet.callContract({
    callee: contract,
    funcName: "fund",
    value: 10n ** 17n,
    gasLimit: 10_000_000,
  });
  assertAccount(await wallet.getAccountWithKvs(), {
    balance: 9n * 10n ** 17n - 6_864_545n * 10n ** 7n,
  });
  assertAccount(await contract.getAccountWithKvs(), {
    balance: 10n ** 18n + 10n ** 17n,
  });
});

test("CSWallet.callContract with ESDT", async () => {
  await wallet.callContract({
    callee: contract,
    funcName: "fund",
    esdts: [{ id: fftId, amount: 10n ** 17n }],
    gasLimit: 10_000_000,
  });
  assertAccount(await wallet.getAccountWithKvs(), {
    hasKvs: [e.kvs.Esdts([{ id: fftId, amount: 9n * 10n ** 17n }])],
  });
  assertAccount(await contract.getAccountWithKvs(), {
    hasKvs: [e.kvs.Esdts([{ id: fftId, amount: 10n ** 18n + 10n ** 17n }])],
  });
});

test("CSWallet.callContract with return", async () => {
  const { returnData } = await wallet.callContract({
    callee: contract,
    funcName: "multiply_by_n",
    funcArgs: [e.U64(10)],
    gasLimit: 10_000_000,
  });
  assertVs(returnData, [e.U64(20)]);
});

test("CSWorld.callContract - change the state", async () => {
  await wallet.callContract({
    callee: contract,
    funcName: "set_n",
    funcArgs: [e.U64(100)],
    gasLimit: 10_000_000,
  });
  assertAccount(await contract.getAccountWithKvs(), {
    kvs: [
      e.kvs.Esdts([{ id: fftId, amount: 10n ** 18n }]),
      e.kvs.Mapper("n").Value(e.U64(100)),
    ],
  });
});

test("CSWallet.callContract failure", async () => {
  await expect(
    wallet.callContract({
      callee: contract,
      funcName: "non_existent_function",
      gasLimit: 10_000_000,
    }),
  ).rejects.toMatchObject({
    message: expect.stringMatching(
      /^Transaction failed: signalError - invalid function \(not found\) - Result:\n\{\n {2}"explorerUrl": "(.*)",\n {2}"hash": "(.*)",\n {2}"type": "(.*)",/,
    ),
    stack: expect.stringMatching(/src\/world\/csworld\.test\.ts:[0-9]+:[0-9]+/),
  });
});

test("CSWallet.callContract.assertFail - Correct parameters", async () => {
  await wallet
    .callContract({
      callee: contract,
      funcName: "require_positive",
      funcArgs: [e.U64(0)],
      gasLimit: 10_000_000,
    })
    .assertFail({ code: "signalError", message: "Amount is not positive." });
});

test("CSWallet.callContract.assertFail - Wrong code", async () => {
  await expect(
    wallet
      .callContract({
        callee: contract,
        funcName: "require_positive",
        funcArgs: [e.U64(0)],
        gasLimit: 10_000_000,
      })
      .assertFail({ code: 5 }),
  ).rejects.toThrow(
    "Failed with unexpected error code.\nExpected code: 5\nReceived code: signalError",
  );
});

test("CSWallet.callContract.assertFail - Wrong message", async () => {
  await expect(
    wallet
      .callContract({
        callee: contract,
        funcName: "require_positive",
        funcArgs: [e.U64(0)],
        gasLimit: 10_000_000,
      })
      .assertFail({ message: "" }),
  ).rejects.toThrow(
    "Failed with unexpected error message.\nExpected message: \nReceived message: Amount is not positive.",
  );
});

test("CSWallet.callContract.assertFail - Transaction not failing", async () => {
  await expect(
    wallet
      .callContract({
        callee: contract,
        funcName: "require_positive",
        funcArgs: [e.U64(1)],
        gasLimit: 10_000_000,
      })
      .assertFail(),
  ).rejects.toThrow("No failure.");
});
