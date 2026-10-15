# Cardpark 2.0 — update instructions

This ZIP contains only changed and new files. It extracts into one enclosing folder. Open that folder and upload **its contents** directly into your existing repository root, overwriting the older copies. Keep your existing images, manifest, audio.js, and firebase-config.js. No project subfolders are required.

## Firebase rules changed — required

In Firebase project `dice-baseball-f6a50`, open **Firestore Database → Rules**, paste the included `firestore.rules`, and **Publish**. Uploading that file to GitHub does not deploy the rules.

Version 2 adds the public open-game board, protected join-code records, individual authoritative game events, and league records. Existing Firebase Authentication and Firestore setup stay in use. No notifications, billing upgrade, Firebase Storage, or additional service is needed.

After uploading, open the game online, then **fully close every Cardpark tab and installed-app window and reopen** so the new service worker/cache takes over. Both players need version 2. Do not clear site data if you have an unfinished local game or unsent request.

If this Firebase project also hosts unrelated apps, preserve their existing collection rules alongside Cardpark's rules.

## Individual live rolls

Every online tap to roll now makes an atomic save of that individual roll and a permanent animation event. Your opponent listens to those individual events and sees the dice, ball, and cards without waiting for your whole half-inning. This replaces the old optional preview-stream architecture.

A failed online roll retains the exact dice and request ID locally. **Retry saved roll** submits that same request; it cannot score twice. If an animation is catching up, **Catch up** jumps to the latest saved field state. Live viewing does not depend on the presence badge or both players staying connected.

At three outs, use **Keep play & end inning**. This confirms the result and hands the game over. That confirmation is necessary because either team can still use its Clutch Batter on the third-out roll. A provisional final similarly uses **Keep play & finish game**. Computer teams confirm automatically.

When you return to a finished opponent turn, you can still watch or skip its replay. Replays use the original effective rolls, not fresh random rolls. A clutch replacement is labeled, with the replaced dice preserved in the game story.

Existing version 1 completed matches and replays remain readable. In-progress version 1 matches upgrade when a participant opens them. A valid version 1 local half-inning draft is imported when its owner reopens it on the same device. Version 1 waiting rooms opened by their hosts become discoverable open seats.

## Find games inside the app

Open **Clubhouse → Find a game**. Every newly created non-league ballgame appears there until someone joins.

- Leave the optional join code empty: any signed-in player can take the second seat.
- Set a join code: the ballgame is still visible, but joining requires that code.
- The app also retains the eight-character game ID for direct lookup; texting a link is optional.

Join codes are case-sensitive and trimmed at their ends. The public board does not contain the code or its hash. Its hash is in a separate protected record checked by Firestore rules. No backend function is required.

## Clutch Batter and a little skill

Each team gets **one Clutch Batter per game**. After seeing one of your batting results, tap **Reroll last play** before rolling again or confirming the half-inning. This reverses that entire result—runs, outs, runners, and stats—and rerolls both dice for the same batter. You must keep the replacement, even if it is worse.

It also works on a third out or provisional walk-off. It cannot reroll your opponent's play, be used twice, or be applied after the turn is confirmed. Computer opponents use the same limited power.

The **Scout the odds** panel shows reach-base and out-result chances, plus expected runs for the current base situation. A sacrifice fly is an out result that can still score. The strategic choice is whether to spend the finite reroll now or save it for a bigger moment. The official dice chart and equal card abilities stay intact.

## Recaps and stats

Confirming the final score creates a game story: headline, score, factual narrative, lead changes, comeback context, biggest inning, player of the game, key moments, and complete play-by-play. Use **Game recap**, **Full box score**, or **Copy recap**. These are generated locally from real game events, with no external AI service.

Box scores include AB, H, R, RBI, HR, BB, K, AVG, and OPS. The engine also tracks total bases, doubles, triples, and sacrifice flies. Clutch replacements remove the original stats rather than counting a second at-bat.

**Clubhouse → Stats** shows your online career and card totals from confirmed final matches. **Home → My stats** shows your saved offline career as the away team. Cards are grouped by player name and number. Offline archives keep the most recent 35 completed games without duplicating image data. Online records remain linked to your account. Statistics that older versions did not track can show a dash rather than an invented OPS/slugging value.

## Leagues and playoffs

Open **Clubhouse → Leagues → Create a league**. Choose a name, maximum 3–12 teams, innings, 1–30 games per team, and a preferred 2-, 4-, or 8-team playoff. Other accounts join from the league list with their current four-card lineup.

The commissioner starts the season after at least three teams join. Starting locks the member rosters and generates an equal number of regular-season games for every team. With an odd number of teams, games per team must be even; this is required to give everyone exactly the same number. Schedules may contain rematches, especially when the number of games exceeds the number of opponents.

Open your scheduled fixture to create/resume its ballgame. Either scheduled player can open it. Away bats first. Fixtures are asynchronous and can be played in any order. A confirmed final automatically updates the league table in the same transaction as the game result.

After every regular-season game finishes, playoff seeds generate automatically. Rankings use win percentage, wins, head-to-head percentage among teams tied on those values, run differential, runs scored, then club name/account ID for a stable final tie. The actual bracket is the largest supported 2/4/8 size that fits both your setting and your membership: three teams get two playoff places, for example.

The playoffs are single elimination. Higher seeds are home. Round winners advance automatically when their whole round completes, through to a named league champion. All regular-season and playoff results remain accessible from the league page.

## The rebuilt field

The new native vector ballpark adds a curved padded wall, warning track, two seating decks with fans and aisles, lights, scoreboard, foul poles, dugouts, chalk lines, on-deck circles, textured clay, aligned basepaths, a mound, and mowed grass. The existing hopping photo cards, pitch, ball, and fielding animations use matching base coordinates.

## Verification and practical limits

The rules engine passed the existing 214,195 assertions, 864 exhaustive board cases, and 600 complete simulated games. Additional checks cover clutch reversals and once-per-game enforcement, including third outs and provisional walk-offs; all 225 supported team-count/game-count schedule combinations and complete playoff progression; factual recaps; stats; protected/open joins; per-roll event delivery before inning end; idempotent retries; turn ownership; league results; and Firestore-compatible payloads.

The actual app event queue was exercised with individual rolls, a clutch reversal, and an inning commit arriving while animations were still running. Screen-render smoke checks and generated-audio scheduling checks passed. The standalone SVG field was rendered and visually inspected.

A real two-account Firebase session, a Firestore rules emulator run, and browser/device layout testing were not available in the build environment. After publishing the rules, check one live roll on two accounts before completing an inning, then try a protected seat and a three-team league.

This remains a casual browser-trusted game for friends. Firestore rules protect participation, join codes, turn ownership, immutable events, and clutch-use limits. They do not independently simulate every dice/baseball or league-scheduling calculation. Keep one of your own devices in control of a turn at a time.
