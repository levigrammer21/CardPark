# Cardpark 2.3.0 — league bots

Extract the ZIP and upload the files inside its single folder directly into your existing repository root, replacing older copies. Keep files not included. Close all Cardpark windows and reopen; confirm **v2.3.0**.

## Firebase rules changed — required

In project `dice-baseball-f6a50`, open **Firestore Database → Rules**, paste the included `firestore.rules`, and **Publish**. Uploading this file to GitHub does not publish Firebase rules. Preserve unrelated application rules if this project serves other apps.

The rules now support commissioner-managed bot rosters, a human participant's client playing the opponent bot's turns, and league-member simulations of bot-versus-bot games with their saved turn history. Existing normal player-turn checks, join codes, profile backups, room cancellation, and personal archive rules remain in place.

## Build a mixed league

1. Create a league or open an existing league that has not started.
2. Invite the people you want. The commissioner can use **Add bot** for one slot or **Fill with bots** for all remaining slots.
3. An eight-team league can contain three people and five bots, one person and seven bots, or any other mix within the 3–12 total-team limit.
4. Remove individual bots before starting if you want to free slots for more people. Only the commissioner can add/remove bots, and rosters lock when the season starts.
5. Choose games per team and start. Odd total team counts still require an even number of games per team for equal schedules.

Bots have their own four-card rosters, colors, club names, and league identities. They do not need Firebase Auth accounts and do not occupy human membership slots outside the total team cap.

## Playing and advancing

Human-versus-bot fixtures open like other league games. Your device automatically rolls and animates the bot's turns, with every roll saved individually. The bot can use its one bunt and one clutch reroll, following the same limits and dice probabilities as you. Human-versus-human fixtures retain the original asynchronous flow.

Bot-versus-bot fixtures simulate automatically while a league member has the league screen open. Each completed game saves its score, full effective turn history, recap/box-score data, and league result atomically. Open completed fixtures to review them. Bot wins can advance through every playoff round to a champion. Simulations resume when the league is opened again; they do not require a paid backend worker and do not run on a server while everybody is away. A failed simulation shows **Retry bot games**.

Two members opening the league at once cannot count the same result twice. Bot-versus-bot games do not enter a human's personal career stats. Your own human-versus-bot games count for your team normally.

## Validation

Checks passed for a complete eight-team league with three humans and five bots, including additions/removal, slot capacity, ownership restrictions, live bot-controlled turns, bot-only simulations, saved replay fidelity, all regular-season/playoff results, and a final champion. Another 45 complete bot games across 3/6/9 innings passed replay-continuity and bunt/clutch-budget checks. Existing account persistence/migration, live events, room cleanup, UI, league schedule/playoff, and recap/career checks passed.

Actual installed-app/browser layout testing, two-account Firebase sessions, and a Firestore rules emulator were unavailable in this environment. This remains a casual client-simulated game for friends; no new anti-cheat service was added.
