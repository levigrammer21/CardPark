# Cardpark 1.1

Four cards. Two dice. A little friendly rivalry.

## Updating from 1.0

1. Extract the ZIP. Open the single `Cardpark-v1.1.0` folder and replace the files in your repository root with its contents.
2. **Republish the included `firestore.rules` in Firebase.** Version 1.1 adds private live-roll and presence collections. Uploading the rules file to GitHub does not publish those rules.
3. Open the game online to let the new cache install, then fully close all Cardpark browser tabs and installed-app windows. Reopen the game. Do this on both devices. Do not clear site data, especially if you have an unfinished turn.

Existing accounts, games, card photos, and completed replays are compatible. No Realtime Database, Cloud Functions, Firebase Storage, or notification setup is needed.

## Live when you are together, async when you are not

Open the **same match** on both devices. The batting player taps Roll; the other player's field automatically shows those exact dice, ball plays, and hopping cards as each roll arrives. The badge shows **BOTH IN THE PARK** when the opponent is active in this match. There is no separate live-mode switch.

**Catch up** skips queued animations to the latest received field state. It does not skip either person's turn. The game hands control over after three outs and the completed turn has saved. If you leave or your opponent is away, play as before; completed turns remain available for replay or skipping later. There are no push notifications.

Live animations follow the same events over Firestore with ordinary network delay; they are not frame-synchronized video. Presence is a lightweight heartbeat while the match is open (25 seconds, expires after 75 seconds). After an abrupt loss of connection, the online badge can take up to that timeout to clear. Actual turns never depend on the badge.

Your device still saves every roll immediately. Successfully published live rolls can also recover your draft on another device. Unsynced rolls still require the original device. Use only one of your own devices to bat at a time.

## Turn up the ballpark

Tap **🔊** in the header for sound settings: game sounds on/off, volume, crowd atmosphere on/off, and a test button. This release includes dice clatter, dice landing, a pitch swish, bat crack, glove catches, footsteps, out/strikeout cues, walk notes, scoring/HR fanfares, crowd cheers, a turn-ready cue, and a winning flourish. All sounds are generated locally and work offline.

Tap the screen once after opening the game to unlock audio on mobile browsers. The app now unlocks its audio engine directly from taps and keyboard presses, including before automatic computer, live, or replay animations. Raise your phone/tablet **media volume** too. The crowd and game sounds pause when the app is hidden. Preferences save on this device.

## Publish from your phone

You do not need a computer, terminal, npm install, build step, Firebase Storage, or a paid backend for this version.

1. Extract the ZIP to create one `Cardpark-v1.1.0` folder. Open that folder; all game files are directly inside it, with no additional subfolders.
2. In your GitHub repository, open **Add file → Upload files** and upload the contents of the `Cardpark-v1.1.0` folder directly into the repository root. Do not upload the containing folder itself. On a narrow phone screen, your browser's **Desktop site** option may make GitHub's upload screen easier to use.
3. Open the repository's **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, choose your main branch, choose **/(root)**, and save.
4. Open your Firebase project **dice-baseball-f6a50**. Under **Authentication → Settings → Authorized domains**, add your GitHub Pages hostname, such as `yourusername.github.io`. Enter only the hostname, without `https://` or the repository path. Email/password and Google providers should both be enabled, as you indicated.
5. Open **Firestore Database → Rules**. Paste the contents of the supplied `firestore.rules`, then tap **Publish**. These rules cover `cardparkMatches` and `cardparkUsers`. If you have unrelated apps in this same Firebase project, preserve their existing rules alongside these collection blocks.
6. Open your GitHub Pages URL in Chrome or Safari. Run the quick check below, then send a friend your game invite.

Your Firebase web configuration is already in `firebase-config.js`. No private service-account credential belongs in this repository. The supplied public web configuration is intended to ship with the app.

## Quick first-game check

- Choose **Solo ballgame**, select 3 innings, and roll a few times. Leave to Home, then tap **Resume**.
- Choose **Customize lineup**. Tap a card, select a phone photo, adjust the crop, and save the lineup.
- Choose **Friends, any time** and sign in. Create a 3-inning ballgame and copy its invite.
- Have a friend sign in with a different account, customize their lineup, and join using the eight-character code. One account cannot fill both seats.
- The creator is away and bats first. While both devices have the match open, roll once and verify the other device shows it live with sound. Then roll until three outs. The turn sends automatically. After a live turn finishes, the other player can roll immediately after their live queue completes (or Catch up). To check async replay, have the opponent leave before a turn, finish it, then have them return and choose **Watch turn** or **Skip to mine**.
- Check both teams' uploaded card photos are visible and that the opponent can replay the same rolls.

## Offline play and installation

The first visit needs internet so the app can save its local files. Once that has completed, offline solo and pass & play work without Firebase or an account.

- Android Chrome: use the browser menu's **Install app** or **Add to Home screen**, when offered.
- iPhone/iPad Safari: use **Share → Add to Home Screen**.
- Test offline by opening the game once online, waiting a few seconds, closing it, then reopening with airplane mode enabled.

Offline games, the local lineup, sound preferences, and incomplete online turns use this browser's device storage. Clearing site data/private browsing removes these local saves. Complete online turns are stored in Firestore and are available when you sign in on another device.

## How a turn works

**Offline solo:** you bat as away; the computer rolls for home. After each half-inning, tap the handoff button to continue. The computer has exactly the same odds.

**Pass & play:** both teams use one device. After three outs, pass the phone and tap **Start half-inning**.

**Online:** each roll streams live to anyone currently watching the match. You play one complete half-inning, then the completed turn automatically saves and hands control to your opponent. No clock, no need to be online together, and no notifications in this release. The clubhouse labels each match **YOUR TURN**, **THEIR TURN**, or **FINAL**.

Each roll saves locally before its animation begins. If you leave halfway through your online turn, reopen the same game on the same device to continue. Control switches players only after the completed turn sends successfully. If sending fails, use **Send turn / retry**; retries cannot submit a turn twice. Returning online also retries a completed pending turn.

A returning player sees an optional replay of a completed turn. A player already watching sees each roll live. **Game history** lets either player replay completed half-innings. Replays calculate the original sequence from stored rolls; no new dice are rolled. Use 1×, 2×, or 4× speed, or skip a replay at any time. Reduced-motion preferences are respected.

Keep a match open on only one of your own devices at a time. Simultaneous submissions are rejected if the saved turn has already changed. This casual version trusts the players' browsers for dice and scoring; it is intended for friends, not cheat-proof ranked competition.

## Your cards

Each team has four cards with a name, jersey number, color, and either an icon or custom photo. All of this is cosmetic. Tap a photo to upload and frame it. Images are cropped and compressed locally before they are saved, with image metadata removed by the canvas conversion. Match lineups are snapshots: later lineup edits apply to future games, preserving older replays.

Photos are small Firestore data strings, so no Firebase Storage setup is necessary. Only share invite codes with your intended opponent: a signed-in person with the code can look up the invite, and the first other account to join claims the home seat. Match collection browsing and replay access are restricted to participants. Your private account lineup is readable only by you.

A player currently on base is skipped in the batting order until available again. This avoids showing the same card as both runner and batter when there are only four players.

## The official dice chart

Dice order does not matter. One roll resolves one entire at-bat.

| Roll | Result | Roll | Result | Roll | Result |
|---|---|---|---|---|---|
| 1–1 | Home run | 2–3 | Ground out | 3–6 | Fly out |
| 1–2 | Double | 2–4 | Strikeout | 4–4 | Walk |
| 1–3 | Fly out | 2–5 | Single | 4–5 | Pop out |
| 1–4 | Walk | 2–6 | Strikeout | 4–6 | Strikeout |
| 1–5 | Pop out | 3–3 | Walk | 5–5 | Double |
| 1–6 | Single | 3–4 | Triple | 5–6 | Sacrifice fly |
| 2–2 | Double play | 3–5 | Ground out | 6–6 | Home run |

- Singles, doubles, and triples advance every runner exactly 1, 2, or 3 bases. A home run scores everyone.
- Walks move only forced runners.
- Ordinary outs hold runners.
- A double play retires the batter plus the runner closest to home. Empty bases mean one out. With two outs, only the batter is retired.
- A sacrifice fly retires the batter and advances all runners one base, except when it makes the third out.
- Three outs clears the bases and switches teams. No steals, bunts, extra-base choices, or player abilities.
- Select 3, 6, or 9 innings. Ties continue with regular extra innings. The home team can win on a walk-off and does not need to bat the final bottom half if already ahead. Fixed dice-board advancement applies even on walk-off hits.

## Trouble connecting?

**Firestore says permission denied:** publish the supplied rules in the correct Firebase project. The rules are not deployed by uploading them to GitHub.

**Google reports unauthorized domain:** add your `username.github.io` hostname in Firebase Authentication settings. For a custom domain, add that hostname too.

**Google popup was blocked:** allow popups for the game or use email/password. Google uses popup sign-in to avoid cross-site redirect storage problems on GitHub Pages. Some embedded app browsers block this; open the link in your full Chrome/Safari browser.

**Your friend cannot join:** check all eight characters. Invite codes omit I, O, 0, and 1. A full game cannot accept a third player, and the creator cannot join their own game as the opponent.

**A turn will not send:** keep the game and its draft on the current device, restore your connection, and tap retry. Do not clear site data to fix an unsent turn.

**Someone edited a lineup but an old match looks unchanged:** intentional. Start a new match to use the updated cards.

**Updating files later:** replace the changed root files and increment the cache version in `sw.js` whenever client files change. After an update installs, close every Cardpark tab/app window and reopen. Do not clear site data while you have an unsent turn.

## Release verification

The release passed 864 exhaustive combinations of base occupancy, outs, and ordered dice outcomes; 600 complete simulated games; 214,195 engine assertions; and mocked Firebase integration checks for creating/joining, saving teams, turn ownership, exact replays, Firestore-compatible payloads, and retry idempotency. JavaScript syntax and local asset references were checked.

The new live animation queue passed incremental-update, duplicate, stale-snapshot, catch-up, invalid-event, and final-third-out checks. Mocked cloud tests also cover live publishing, ownership, presence, conflicting drafts, and commits overtaking previews. All 16 synthesized sound cues passed audio-scheduling checks, including gesture unlock, mute, generated samples, ambience, and background silence.

A real two-account Firebase session, audio listening on hardware, and visual browser/device testing could not be performed in the build environment. The first-game check above covers the project-specific rules deployment, authorized domains, authentication, and cross-device photo/replay flow.

## Files

Everything is root-level. There are no external fonts or build dependencies. `package.json` only declares the project as JavaScript modules for development; GitHub Pages serves it without a build. `engine.js` is the deterministic rules engine, `field.js` handles card/ball/dice animations, `audio.js` generates the soundscape, `live.js` queues deterministic live animations, `cloud.js` handles Firebase, and `app.js` handles the screens and local saves. `sw.js` caches the app shell for offline play. The app loads Firebase's pinned SDK only when accounts or online play are requested.
