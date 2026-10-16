# Cardpark 2.2.0 — updated files

Extract the ZIP and upload the files inside its one folder directly to your existing repository root, replacing older copies. Keep files not included. Close all Cardpark windows and reopen; confirm **v2.2.0** in the header.

## Firebase rules changed — publish these

In Firebase project `dice-baseball-f6a50`, open **Firestore Database → Rules**, paste the included `firestore.rules`, and **Publish**. Uploading the file to GitHub does not publish Firebase rules. Preserve unrelated app rules if this Firebase project hosts other applications.

The new rule lets a waiting room's owner cancel it only while it still has one player. Cancellation must also remove the public listing in the same transaction. Started matches, final scores, league fixtures, profile records, and stats backups retain their existing protections. No additional service or billing setup is needed.

## Home

Home is now a compact club dashboard: your team name, your four actual cards/photos, team record, online play, solo, pass & play, leagues, stats, and game history. It no longer has the oversized title, opposing-team decorative card, or finished-game resume tile. Unfinished games still have Resume controls.

## Games no longer pile up

- Leaving an empty waiting room through its Back button or navigating Home cancels it and removes its open seat.
- Previously abandoned empty rooms are cleaned up when you next restore your account or open the Clubhouse. Creating a new room also closes older empty rooms, and repeated create taps share one request.
- If an opponent joins first, cancellation leaves the started game intact.
- **In progress** shows only started, unfinished online games. Finished games are under **Game history**, accessible from Home and the Clubhouse. Their recaps and stats remain saved.
- If the OS kills the app before a cancellation can reach Firebase, cleanup occurs on the next account restore/Clubhouse visit. Failed cancellation requests report their error; the new rules must be published for cleanup to work.

## Fielding rotation

All four cards rotate through pitcher (P), catcher (C), infield (IF), and outfield (OF) each inning. Each new defensive inning moves everyone to the next position; extra innings continue the cycle. Small position tags identify the assignments. Fielding animations follow the assigned player, and live views/replays calculate identical assignments from the inning. The stadium and field dimensions are unchanged.

## Current and historical stats

The default stats table always contains exactly your current four cards, in lineup order, including zero-stat cards. Former cards appear only after selecting **Historical stats**. Names plus jersey numbers identify a card's history; changing either moves its previous identity into historical stats, while changing only its photo does not. The team career record/averages still include all confirmed games.

## Existing account data

The account restoration and Firebase lineup/photo/stat backups from v2.1.2 remain in place. If older data still exists only in your Google/Chrome browser, open this updated version there once while signed into your existing account, then use the same account in the installed app. Do not clear site data during migration.

## Validation

Checks passed for owner-only/idempotent room cancellation, old-room cleanup, duplicate creation, preserving joined matches, active-only lists, separate game history, exactly four current stats rows, historical separation, zero-stat cards, four-position rotation, replay consistency, and the rotating fielder's actual animation path. Existing auth/account migration, live event, clutch, league scheduling, playoff, recap, and career checks also passed.

Actual browser/device layout testing, two-account Firebase sessions, and a Firestore rules emulator were unavailable in this environment.
