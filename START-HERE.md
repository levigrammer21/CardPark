# Cardpark 2.3.1 — powers scale with innings

Extract the ZIP and upload the files inside its single folder directly to your existing repository root, replacing older copies. Keep files not included. Close all Cardpark windows and reopen; confirm **v2.3.1**. Both players should update.

## Firebase rules changed — required

In project `dice-baseball-f6a50`, open **Firestore Database → Rules**, paste the included `firestore.rules`, and **Publish**. Uploading the file to GitHub does not publish Firebase rules. Preserve unrelated app rules if this project hosts other applications.

Clutch usage now saves a count instead of a one-use flag. The rules accept earlier boolean records and new numeric counts, and allow each clutch action to increment its team's counter. All previous league bot, profile, archive, and waiting-room rules remain included.

## Allowance per team

| Scheduled innings | Bunts | Clutch at-bats |
| --- | --- | --- |
| 3 | 1 | 1 |
| 6 | 2 | 2 |
| 9 | 3 | 3 |

The full allowance is available at the start. Uses can be saved or spent when needed; there is no reset every third inning. Extra innings retain the scheduled-game allowance.

The buttons show remaining uses. The same limits apply to solo opponents, online league bots, and bot-versus-bot simulations. Each team has its own counters, preserved through innings, saves, retries, and replays.

Each at-bat can receive only one clutch reroll, whose result must be kept. You can clutch different at-bats in the same half-inning if you have uses left. A clutch replacement of a bunt keeps the bunt approach and costs one clutch, without spending another bunt.

Older saved boolean usage flags count as one use if true, zero if false. Existing six- and nine-inning games therefore receive the additional allowance without losing their previous usage.

## Validation

Checks passed for all three allowances, multiple distinct clutch uses within one half-inning, exhausted budgets, independent teams, cross-inning persistence, bunt replacement accounting, legacy saves, online saved counters, replays, and bot budgets. Existing live events, league season/playoff simulations, account migration, and UI checks also passed. Actual browser/device sessions and a Firestore rules emulator were unavailable in this environment.
