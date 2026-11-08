# Max's Lab

A learning playground for a smart 7-year-old, built for the iPad. Max answers adaptive quiz missions to earn pearls, then spends them on games: Word Search, Hangman, three little business stands (lemonade, ice cream, pizza fractions), a satellite world map with places that matter to the family, and a passport of stamps, badges and heroes.

It is plain HTML, CSS and JavaScript. There is no build step and nothing to install.

## Put it online (GitHub Pages)

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, then **main** and **/ (root)**, and save.
3. After a minute the site is at `https://<your-user>.github.io/<repo-name>/`.
4. On the iPad, open that address in Safari, tap **Share → Add to Home Screen**. It then opens full screen and keeps working offline.

## For grown-ups

Tap the small gear on the home screen (or press and hold it for 3 seconds if no PIN is set) to open the **Grown-up corner**:

- this week's play time, accuracy and subject levels
- daily play limit, bedtime wind-down and bigger text
- optional free Esri map key for sharper satellite pictures
- family notes for each family place (stored only on the device)
- your own questions that mix into Max's missions
- backup and restore, and an optional PIN

Everything Max does is stored on his device only. Nothing is sent anywhere.

## Pearls and pace

Design target: about **12 pearls per minute** of real play. The tables below are the numbers in `js/core/economy.js`.

| Activity | Pearls |
|---|---|
| Quiz question, first try (easy / at level / boss) | 3 / 5 / 10 |
| Quiz second try | half (none on 2-choice questions) |
| Mission finished / perfect / first mission of the day | +5 / +5 / +15 |
| World map question, first try / second try | 6 / 3 (half if the facts were peeked) |
| New place stamp | +6 |
| Find-it right / bonus for 4+ right | 3 / +5 |
| Hero question stamp | 6 |
| Word Search: choose size (8, 10, 12) and difficulty (Easy: across/down, Medium: + diagonals, Tricky: backwards too) | per word 3 / 4 / 6; finish bonus 8-16 (Easy), 10-20 (Medium), 14-28 (Tricky) by size |
| Home Jobs (real chores, a grown-up types the chore code) | 33 jobs worth 3 to 40 pearls (about 3 pearls per minute of effort), once a day each, many with a weekly limit (Monday to Sunday); not limited by the daily cap |
| Hangman win (levels 1-3) | 10 / 15 / 20, +5 flawless; a loss still gives 3 |
| Baseball questions | none (they power the swing) |

**Wrong picks cost pearls, gently:** at most 2 per miss on 3-4 choice questions (up to 4 on true/false), never more than a quarter of what Max holds at that moment (minimum 1), and at most 10 lost per day in total. Pearls never drop below 0. A short buzzer plays; a gentle note plays for word-search and find-it misses. This was Rob's choice; child-development educators generally advise against point loss for this age.

**Daily taper:** full rate until 400 pearls earned in a day, half rate to 600, then nothing more. It counts earned pearls, so spending never re-opens it.

| Unlock | Cost | Minutes at 12/min |
|---|---|---|
| Lemonade stand (includes season 1) | 100 | ~8 |
| Snack Shack | 300 | ~25 |
| Ice cream stand | 500 | ~42 |
| Pizza stand | 700 | ~58 (two days because of the daily ceiling) |
| New season: lemonade / snack / ice cream | 75 / 110 / 130 | ~6 / 9 / 11 |
| Baseball, 3 innings / 6 innings | 150 / 270 | ~12 / ~22 |

Stands run 10-day seasons (the Snack Shack runs 15) with upgrade trees. Upgrades and cash carry over between seasons; only starting the next season costs pearls. Snack Shack ball fields (each doubles the crowd) cost $90, $220, $500, $1,100 and $2,400, so a careful player has field 2 by about inning 5 and field 3 by about inning 10. Max's Ballpark is a quiz-powered baseball game (3 or 6 innings against Dino Rexes, Space Rockets or Sea Pirates). Bot simulations (`tools/tests/*-sim.mjs`) show a 70%-accuracy player wins about 75% / 63% / 54% of 3-inning games against the three teams.

## Weekly check-in and the Grown-up corner

The Grown-up corner now has *Time in the lab* (minutes per day and per program, last 7 days; per-program time counts from the update that added it), *What to work on* (suggestions from recent accuracy, the latest check-in, idle subjects and time balance) and *Weekly check-in and progress*. The check-in is 24 fresh questions (4 per subject at levels 2-5, one try, no hints, no pearls lost, 15 pearls for finishing), offered on the home screen once a week. **It cannot produce national percentiles**: the questions are not normed against a national sample. For real percentiles, enter your school's results (MAP Growth, i-Ready and so on) under *School test results* and compare them with the weekly trend.

## Snack Shack expansion

Ball fields double the crowd: 2nd field $300, 3rd $600, 4th $1,200, 5th $2,400, ballpark complex $4,800. Each also adds serving capacity and storage, and starting stock for new menu items scales with the crowd. The Candy counter (season 1), cone machine and slush machine (frozen slush and frozen lemonade) add menu items.

## Recorded announcer clips

See `audio/announcer/README.md` to drop in natural recordings for the winner announcement.

## Home Jobs code

The chore check uses the code **1234** by default (Rob's choice, for easy approval while he is nearby). Change it in the Grown-up corner under *PIN and about*. The grown-up passcode, if set, also works. A grown-up can add, remove or re-price jobs from the Home Jobs screen.

## Safari and the Home Screen icon do not share progress

On an iPad, Safari and an app added to the Home Screen each keep their own saved data. A Home Screen icon added today starts at zero. Pick one place for Max to play. To move progress, open the Grown-up corner in the copy that has it, tap **Copy this copy's transfer code**, then paste it under **Paste a transfer code here** in the other copy. The same section shows the build number, and has +100 / +300 / +800 pearl buttons for testing or rewards. Updates load on the next open when online (code is fetched fresh, with the saved copy only as the offline fallback).

## Time warnings

When the daily limit, a grown-up's extra time or bedtime is close, a pop-up appears at **10, 5 and 2 minutes left**. Max has to tap "OK, I understand" to close each one. Each warning shows once, never again after a reload, and a fresh set starts when a grown-up grants extra time. At zero the lab closes as before.

## Grown-up passcode and limits

No passcode is stored in the repository. Set your own (4-6 digits) in the Grown-up corner. With no passcode set, the daily limit cannot be bypassed. With one set, a grown-up can grant 15 extra minutes. The Grown-up corner also has a voice chooser for read-aloud, since quality depends on the voices installed on the device.

## Tests

Start a static server in the repo (`python3 -m http.server 8767`) and run the scripts in `tools/tests/` with node (Playwright installed globally), for example `node tools/tests/baseball-ui.mjs es ipad-port night`. Rebuild generated data with `python3 tools/build_data.py` and `python3 tools/build_placeqs.py`; validate banks with `python3 tools/validate.py` and `python3 tools/validate_placeqs.py`.

## Maps

Google Maps' terms don't allow it on children's sites, so the map uses free satellite sources and falls back to a built-in outline map when offline. See **Photo and map credits** in the Grown-up corner for every attribution.

## Files

- `index.html`, `css/`, `js/` — the app
- `data/` — questions, word packs, places and people (generated or curated)
- `img/places/` — place photos, with credits on the credits screen
- `sw.js` — offline support

## Adding or editing questions

The questions live as plain JSON in `tools/content/`. After editing:

```
python3 tools/validate.py tools/content/en-logic.json   # checks one bank
python3 tools/build_data.py                               # rebuilds data/questions.*.js and data/packs.js
```

`tools/SCHEMA.md` describes the format. Grown-ups can also add questions with no code in the Grown-up corner.
