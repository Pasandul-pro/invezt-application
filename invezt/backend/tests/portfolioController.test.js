import test from "node:test";
import assert from "node:assert/strict";

import { __testables } from "../src/controllers/portfolioController.js";
import realTimeStockService from "../src/services/realTimeStockService.js";

const {
  normalizeHistoryEntry,
  buildHistoryEntry,
  mergeHistoryEntries,
  shouldTrackHistory,
} = __testables;

test("normalizeHistoryEntry rounds numeric fields and applies defaults", () => {
  const normalized = normalizeHistoryEntry({
    recordedAt: new Date("2026-03-14T00:00:00.000Z"),
    totalValue: 123.456,
    totalInvestment: 100.123,
    totalGainLoss: 23.333,
    totalGainLossPercent: 23.333,
  });

  assert.deepEqual(normalized, {
    recordedAt: new Date("2026-03-14T00:00:00.000Z"),
    totalValue: 123.46,
    totalInvestment: 100.12,
    totalGainLoss: 23.33,
    totalGainLossPercent: 23.33,
    priceSource: "cse",
    priceStale: false,
  });
});

test("buildHistoryEntry calculates gain/loss metrics", () => {
  const entry = buildHistoryEntry(
    new Date("2026-03-14T00:10:00.000Z"),
    125,
    100,
    "stockprice-backfill",
    false,
  );

  assert.equal(entry.totalValue, 125);
  assert.equal(entry.totalInvestment, 100);
  assert.equal(entry.totalGainLoss, 25);
  assert.equal(entry.totalGainLossPercent, 25);
  assert.equal(entry.priceSource, "stockprice-backfill");
  assert.equal(entry.priceStale, false);
});

test("mergeHistoryEntries sorts entries and keeps the latest duplicate timestamp", () => {
  const merged = mergeHistoryEntries([
    {
      recordedAt: new Date("2026-03-14T00:20:00.000Z"),
      totalValue: 210,
      totalInvestment: 100,
      totalGainLoss: 110,
      totalGainLossPercent: 110,
      priceSource: "stale-cache",
      priceStale: true,
    },
    {
      recordedAt: new Date("2026-03-14T00:10:00.000Z"),
      totalValue: 150,
      totalInvestment: 100,
      totalGainLoss: 50,
      totalGainLossPercent: 50,
      priceSource: "cse",
      priceStale: false,
    },
    {
      recordedAt: new Date("2026-03-14T00:20:00.000Z"),
      totalValue: 220,
      totalInvestment: 100,
      totalGainLoss: 120,
      totalGainLossPercent: 120,
      priceSource: "cse",
      priceStale: false,
    },
  ]);

  assert.equal(merged.length, 2);
  assert.equal(
    new Date(merged[0].recordedAt).toISOString(),
    "2026-03-14T00:10:00.000Z",
  );
  assert.equal(
    new Date(merged[1].recordedAt).toISOString(),
    "2026-03-14T00:20:00.000Z",
  );
  assert.equal(merged[1].totalValue, 220);
  assert.equal(merged[1].priceSource, "cse");
});

test("shouldTrackHistory only accepts usable quote snapshots", () => {
  assert.equal(
    shouldTrackHistory({
      pricesUpdatedAt: new Date("2026-03-14T00:00:00.000Z"),
      priceSource: "cse",
    }),
    true,
  );

  assert.equal(
    shouldTrackHistory({
      pricesUpdatedAt: null,
      priceSource: "cse",
    }),
    false,
  );

  assert.equal(
    shouldTrackHistory({
      pricesUpdatedAt: new Date("2026-03-14T00:00:00.000Z"),
      priceSource: "empty",
    }),
    false,
  );

  assert.equal(
    shouldTrackHistory({
      pricesUpdatedAt: new Date("2026-03-14T00:00:00.000Z"),
      priceSource: "unavailable",
    }),
    false,
  );
});

test("normalizeSymbol maps legacy CMB ticker aliases to COMB", () => {
  assert.equal(realTimeStockService.normalizeSymbol("CMB"), "COMB.N0000");
  assert.equal(realTimeStockService.normalizeSymbol("CMB.N0000"), "COMB.N0000");
  assert.equal(realTimeStockService.normalizeSymbol("comb"), "COMB.N0000");
});
