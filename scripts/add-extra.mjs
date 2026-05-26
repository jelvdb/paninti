#!/usr/bin/env node
// Append-only seeder for an extra sticker.
//
// Usage:
//   node scripts/add-extra.mjs "Raúl Jiménez - Mexico"
//   node scripts/add-extra.mjs                          (uses DEFAULT_LABEL below)
//
// Reads stickers-state.json from the project root, appends a single entry
// to state.extras (or increments count if the same label already exists),
// and writes the file back. All other state fields are left untouched.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_LABEL = "Raúl Jiménez - Mexico";

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), "..");
const STATE_FILE = path.join(projectRoot, "stickers-state.json");

const label = (process.argv[2] ?? DEFAULT_LABEL).trim();
if (!label) {
  console.error("Refusing to add an empty label.");
  process.exit(1);
}

const emptyState = { collected: {}, duplicates: {}, photos: [], extras: [] };
const state = fs.existsSync(STATE_FILE)
  ? { ...emptyState, ...JSON.parse(fs.readFileSync(STATE_FILE, "utf-8")) }
  : emptyState;

const existing = state.extras.find((e) => e.label === label);
if (existing) {
  existing.count += 1;
  console.log(`"${label}" already in extras — count is now ${existing.count}`);
} else {
  const id = `extra-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  state.extras.push({ id, label, count: 1 });
  console.log(`Added new extra: ${label} (id: ${id})`);
}

fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
console.log(`State written to ${path.relative(projectRoot, STATE_FILE)}`);
