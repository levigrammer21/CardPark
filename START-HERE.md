# Cardpark 2.1.0 — updated files

Extract the ZIP. Upload every file **inside the extracted folder** directly into your existing repository root, overwriting older copies. Keep existing files not included in this update. No build or project subfolders are needed.

## Firebase

**Firestore rules are unchanged from version 2.0.** There is no Firebase setup change for this update. If updating from version 1 instead, first install version 2.0 and publish its rules.

## Load the new version

After uploading, open the game online once, then fully close every Cardpark tab and installed-app window and reopen. The header must show **v2.1.0**. Both players must use this version for bunt games. Do not clear site data if you have unfinished local games or unsent rolls.

## Bunt

Select **Bunt**, then tap **Roll bunt**. Both dice still roll. An even total makes the batter safe at first; an odd total retires the batter. Exactly 18 of 36 ordered dice results are safe, so the chance is 50/50.

Every existing runner advances exactly one base on either result, except a batter-out bunt with two outs: the third out ends the inning, runners do not advance, and no run scores. A safe bunt counts as a single. A batter-out bunt with runners aboard and fewer than two outs counts as a sacrifice bunt (SH), excluded from at-bats. Other bunt outs count as at-bats.

Swing is selected again after each play. Clutch Batter rerolls the original batting approach; it cannot turn a bunt into a swing. The computer can bunt situationally. Online live events, retries, saved games, replays, recaps, box scores, and career totals preserve the selected approach. Old rolls without an approach still use the standard swing chart.

## Interface

The new dark green, ivory, and gold interface includes a shield/baseball/crossed-bats crest, matching app icons, and a runtime version badge. The existing stadium and card artwork remain in place.

Swing/Bunt, Roll, Clutch, inning confirmation, retries, odds, sound, speed, box scores, and replays are grouped below the field. Large animated dice appear over the field during each roll; if the field is offscreen, the reveal floats in the viewport. Reduced-motion preferences are respected.

## Verification

The existing engine suite passed 214,195 assertions and 600 full simulated games. This update also passed 864 exhaustive bunt board/dice cases, clutch reversals including provisional walkoffs and third outs, sacrifice stats, replay and career fidelity, mocked online event delivery and retry tests, actual app control/save and live queue checks, dice overlay cleanup checks, and all 17 sound-cue checks. Existing league scheduling and playoff checks passed.

The logo was rasterized and visually inspected. Real mobile browser layouts, two-account Firebase sessions, and the Firestore emulator were not available in this environment.
