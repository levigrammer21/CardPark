# Cardpark 2.1.1 — updated files

Extract this ZIP and upload the files inside its single folder directly to your existing repository root, overwriting older copies. Keep files not included. No build step is needed.

**Firebase rules are unchanged.**

After uploading, open the game online once, fully close all Cardpark windows, and reopen. Confirm **v2.1.1** in the header. Both players should update.

## Bunt is a special

Each team gets **one bunt per game**, regardless of the innings setting. Tap **Bunt**, then confirm to roll. Its button shows **USED** afterward. Reloading, ending an inning, or using Clutch cannot restore it. The opponent has a separate allowance. Clutch can reroll a bunt, preserving its approach and its spent allowance.

Bunt odds are unchanged: even total safe at first, odd total out. Existing runners advance one base unless the batter makes the third out; no run scores on that third out. Safe bunts count as singles, qualifying sacrifice bunts as SH.

Previously saved play records remain replayable, including earlier versions' multiple-bunt records. Old records without the new usage flag begin tracking the allowance from their saved state onward.

## Controls stay on screen

On phones and tablets up to 1000 CSS pixels wide, the compact play bar stays at the bottom of the viewport. Roll, Bunt, Clutch, speed, odds, box score, replays, and sound are together. Inning confirmation and catch-up/replay controls appear in that same bar when needed. The large animated dice reveal still appears during rolls.

The stadium keeps its previous width and aspect ratio. No field artwork or card animation geometry changed. Extra page space below the content lets you bring the bottom of the field above the pinned controls when needed. Match-heading duplication was removed on smaller screens.

## Checks

Bunt limits were checked for both teams, across innings, through saves/replays, after clutch reversals, and through mocked online transactions/retries. The full engine, leagues, recaps, app event queue, and UI control tests passed. The field asset is byte-for-byte unchanged. Actual browser/device layout and two-account Firebase tests were unavailable in this environment.
