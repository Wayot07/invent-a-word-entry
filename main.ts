// u-deranalabs-invent-a-word-we-need-17a020e0: "corridance".
//
// Coins one new English word and defines it in a single clear line.
// The entry is a fixed string: corridor + dance, naming the awkward
// side-to-side dance two people do in a hallway when each keeps dodging
// the same way. Checked in-session against web sources: "corridance"
// has no prior use as a word (nearby hits are only "concordance").
// Rejected in-session as already existing: tabnesia (Chrome extension
// and word lists), chairdrobe (Reader's Digest / Wiktionary slang),
// wordnesia (Smithsonian / Slate, 2014), miswave (How to Talk Teen),
// destinesia (Macmillan exam materials).
//
// Writes the entry to /output/entry.txt (MAKEFUN_OUTPUT_DIR stands in
// for /output outside the grader container). Node 22, standard library
// only. No network access, no randomness, no clock reads: identical
// input bytes always yield identical output bytes, so repeated runs
// agree byte for byte.
//
// The gate: /output/entry.txt must be UTF-8 text of 1 to 140 characters,
// not only white space. This program validates the entry against that
// gate before writing and fails fast on any violation, then reads the
// file back and checks it byte for byte.
//
// Local check:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "corridance \u2014 the awkward side-to-side dance two people do in a hallway when each keeps dodging the same way.";

const MIN_CHARS = 1;
const MAX_CHARS = 140;

function abort(reason: string): never {
  process.stderr.write("main.ts: " + reason + "\n");
  process.exit(1);
}

// The gate counts characters, not bytes: count Unicode code points.
const charCount = [...ENTRY].length;
if (charCount < MIN_CHARS || charCount > MAX_CHARS) {
  abort(
    "entry is " +
      charCount +
      " characters, outside the 1 to 140 gate: " +
      JSON.stringify(ENTRY),
  );
}
if (ENTRY.trim().length === 0) {
  abort("entry is only white space");
}
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  abort("entry must be a single line, no line breaks");
}
if (ENTRY !== ENTRY.trim()) {
  abort("entry has leading or trailing white space");
}
const word = ENTRY.split(" ")[0];
if (!/^[a-z]+$/.test(word)) {
  abort("entry must start with the coined word in lower case: " + word);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const destPath = join(outDir, "entry.txt");

try {
  mkdirSync(outDir, { recursive: true });
} catch (err) {
  abort("cannot create " + outDir + ": " + (err as Error).message);
}

try {
  writeFileSync(destPath, ENTRY, "utf8");
} catch (err) {
  abort("cannot write " + destPath + ": " + (err as Error).message);
}

let written: string;
try {
  written = readFileSync(destPath, "utf8");
} catch (err) {
  abort("cannot read back " + destPath + ": " + (err as Error).message);
}
if (written !== ENTRY) {
  abort("read-back mismatch: file does not equal the entry");
}
if (written.endsWith("\n")) {
  abort("entry.txt ends with a newline");
}

const bytes = Buffer.byteLength(written, "utf8");
const hash = createHash("sha256").update(written, "utf8").digest("hex");

process.stdout.write(
  "wrote " +
    destPath +
    " (" +
    charCount +
    " chars, " +
    bytes +
    " bytes, sha256 " +
    hash +
    ")\n",
);
