import test from "node:test";
import assert from "node:assert/strict";
import { computeSubScores } from "../compute/sub-scores.ts";
import { computeStalkerScore } from "../compute/stalker-score.ts";
import { SAMPLE_GAMES } from "./fixtures/sample-games.ts";

test("computeSubScores returns 0-100 values", () => {
  const scores = computeSubScores(SAMPLE_GAMES);
  for (const key of ["atk", "def", "time", "mind", "overall"] as const) {
    assert.ok(scores[key] >= 0 && scores[key] <= 100, key);
  }
});

test("computeStalkerScore returns four signals", () => {
  const stalker = computeStalkerScore(SAMPLE_GAMES);
  assert.ok(stalker.score >= 0 && stalker.score <= 100);
  assert.ok(["Low", "Medium", "High"].includes(stalker.label));
  assert.equal(typeof stalker.signals.timeTrouble, "number");
  assert.equal(typeof stalker.signals.tiltsEasily, "number");
});

test("empty games return neutral defaults", () => {
  const scores = computeSubScores([]);
  assert.equal(scores.overall, 50);
});
