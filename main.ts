// Leonida Field Manual — a gta6-trophy-guide-01 entry (Node 22, standard library only).
// The guide is this directory's app/ folder: plain static files a browser opens at
// app/index.html (one ES module, one stylesheet, no build step), offline — it loads
// nothing over the network, and its trophy list and guides are app/data/trophies.json.
// This program hands it in: it copies app/ and screenshots/ from beside this file to
// /output and writes /output/dossier.json, the summary the judge reads (your screenshots,
// the first load's files and bytes, and your source), with the vendored make.fun library.
// vendor/makefun-frontend.ts is the kit's copy, unchanged: the scorer requires
// dossier.json to be byte for byte what its own copy writes.
//
// Serve it locally with any static server rooted at app/, then open the page.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps: only text_max_bytes shapes the bytes; the others refuse an
// entry the scorer would refuse (more than 4 screenshots or one over 256 KiB; more
// than 993 files and directories in app/ or 48 MiB of app files). The program writes
// the same bytes on both of its runs: it copies the same files and buildDossier is
// deterministic over them, so the two runs the grader makes agree byte for byte.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
