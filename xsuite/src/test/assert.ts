import assert from "node:assert";
import { hexToHexString, Esdt, Pairs, s, Hex, pairsToRawPairs } from "../data";
import { Proxy } from "../proxy";

export const assertAccount = (
  actualAccount: ActualAccount,
  { code, nonce, balance, containsEsdts, containsStorage }: ExpectedAccount
) => {
  if (code !== undefined) {
    assert.strictEqual(actualAccount.code, code);
  }
  if (nonce !== undefined) {
    assert.strictEqual(actualAccount.nonce, nonce);
  }
  if (balance !== undefined) {
    assert.strictEqual(actualAccount.balance, balance);
  }
  const rawPairs = pairsToRawPairs([
    containsEsdts ? s.Esdts(containsEsdts) : [],
    ...(containsStorage ?? []),
  ]);
  if (Object.keys(rawPairs).length > 0) {
    for (const k in rawPairs) {
      assert.strictEqual(actualAccount.pairs?.[k] ?? "", rawPairs[k]);
    }
  }
};

export const assertTxReturnData = (
  actualData: string[],
  expectedData: Hex[]
) => {
  assert.deepStrictEqual(
    actualData,
    expectedData.map((v) => hexToHexString(v))
  );
};

type ActualAccount = Partial<
  Awaited<ReturnType<typeof Proxy.getAccountWithPairs>>
>;

type ExpectedAccount = {
  code?: string;
  nonce?: number;
  balance?: bigint;
  containsEsdts?: Esdt[];
  containsStorage?: Pairs;
};
