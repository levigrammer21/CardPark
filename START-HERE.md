# Cardpark 1.0

Four cards. Two dice. A little friendly rivalry.

## Publish from your phone

You do not need a computer, terminal, npm install, build step, Firebase Storage, or a paid backend for this version.

1. Extract the ZIP to create one `Cardpark-v1.0.0` folder. Open that folder; all game files are directly inside it, with no additional subfolders.
2. In your GitHub repository, open **Add file → Upload files** and upload the contents of the `Cardpark-v1.0.0` folder directly into the repository root. Do not upload the containing folder itself. On a narrow phone screen, your browser's **Desktop site** option may make GitHub's upload screen easier to use.
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
- The creator is away and bats first. Roll until three outs. The turn sends automatically. On the other device, choose **Watch turn** or **Skip to mine**.
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

**Online:** you play one complete half-inning, then it automatically sends to your opponent. No clock, no need to be online together, and no notifications in this release. The clubhouse labels each match **YOUR TURN**, **THEIR TURN**, or **FINAL**.

Each roll saves locally before its animation begins. If you leave halfway through your online turn, reopen the same game on the same device to continue. A completed turn switches devices only after sending successfully. If sending fails, use **Send turn / retry**; retries cannot submit a turn twice. Returning online also retries a completed pending turn.

The other player sees an optional replay. **Game history** lets either player replay completed half-innings. Replays calculate the original sequence from stored rolls; no new dice are rolled. Use 1×, 2×, or 4× speed, or skip a replay at any time. Reduced-motion preferences are respected.

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

A real two-account Firebase session and visual browser/device testing could not be performed in the build environment. The first-game check above covers the project-specific rules deployment, authorized domains, authentication, and cross-device photo/replay flow.

## Files

Everything is root-level. There are no external fonts or build dependencies. `package.json` only declares the project as JavaScript modules for development; GitHub Pages serves it without a build. `engine.js` is the deterministic rules engine, `field.js` handles card/ball/dice animations, `cloud.js` handles Firebase, and `app.js` handles the screens and local saves. `sw.js` caches the app shell for offline play. The app loads Firebase's pinned SDK only when accounts or online play are requested.
