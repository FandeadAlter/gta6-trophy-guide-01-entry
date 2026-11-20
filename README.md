# gta6-trophy-guide-01-entry

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/FandeadAlter/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/FandeadAlter/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An entry for make.fun's bounty "Build the best GTA 6 trophy guide". It is an offline field manual for the 55 PlayStation trophies of Grand Theft Auto VI: a checklist with saved progress, a roadmap to the platinum, missable flags, and a guide for every trophy in its own words, each citing its sources.

## The guide

**Leonida Field Manual** — a paper field manual, not a neon poster. The viral GTA VI look is a pink-and-purple sunset; this one is the opposite: warm paper, dark ink, muted olive and rust, set like a typed manual. The look is its own, and it uses no Rockstar artwork or logo.

- **Checklist of all 55 trophies** with the official name, description and grade as PlayStation publishes them (1 platinum, 2 gold, 6 silver, 46 bronze). Tick one off and it stays ticked — progress is saved in the browser (localStorage) and can be exported to a file and imported back.
- **A guide for every trophy**, written for this entry in its own words: what to do, how to approach it, and when it can be missed. Each guide names its sources beside it — the official PlayStation trophy list as published by [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and PSNProfiles — so a reader sees where each fact comes from. No guide text is copied from another guide.
- **Roadmap to the platinum** in six stages, built from the official descriptions: story in order, contacts and strangers, the hidden moments, activities and skills, explore and collect, then heists, combat and 100% completion.
- **Missable flags** on the four trophies that can be passed without earning them: the unique animal hunt for Bret, the partnership moment, the story choices, and the strange one-off event. Each flag says why it is missable in its guide.
- **Filters** by kind (story, activities, collectibles, exploration, combat and heists, money, completion), by grade, by earned state, by missable only, and by search.
- **A spoiler setting** that hides the names and descriptions of the 28 hidden story trophies until they are earned. Earned hidden trophies reveal themselves; the rest stay masked as "Hidden trophy" while the setting is on.
- **Deep links**: `?trophy=17` opens a trophy's guide, `?view=roadmap` opens the roadmap, `?kind=missable` filters, `?spoiler=on` hides story spoilers, `?earned=2,3,4` checks trophies off.

## Run it

Serve `app/` with any static server, then open `index.html` in desktop Chrome with the network off. Everything it loads is a file under `app/`; it fetches nothing over the network.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`.

## Files

- `app/index.html` — the manual's page
- `app/style.css` — the paper field-manual look
- `app/app.js` — checklist, roadmap, spoiler setting, export and import
- `app/data/trophies.json` — the 55 official trophies, the six roadmap stages, and a cited guide for each
- `screenshots/` — four renders of the app in a browser (checklist with a guide open, the roadmap, the missable filter, the spoiler setting)

---

<sub>Entered on [make.fun](https://make.fun/?ref=me6ajgxn&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
