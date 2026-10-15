# Cardpark 2.1.2 — account persistence fix

Extract this ZIP and upload the files inside its single folder to your existing repository root, overwriting older copies. Keep files not included. Confirm **v2.1.2** after closing all Cardpark windows and reopening.

## Firebase rules changed — required

Open Firebase project `dice-baseball-f6a50` → **Firestore Database → Rules**. Replace the Cardpark rules with the included `firestore.rules` and click **Publish**. Uploading that file to GitHub does not publish it to Firebase. If this project serves unrelated apps, preserve their separate collection rules.

This adds private per-account backups of completed solo/local game stats under `cardparkUsers/{uid}/archives/{gameId}`. Only that signed-in user can read or write their backups. Existing match/league rules remain unchanged. No billing upgrade, notifications, Cloud Functions, or Storage setup is needed.

## Recover your existing browser data

1. Publish the rules and upload the updated files.
2. Open the updated game once in the Google/Chrome browser where your profiles and stats are still present. Sign into your existing account if necessary. Leave it open online so its account sync completes. Account → **Sync account** can retry; a sync error is shown there if a request fails.
3. Open the installed app and sign into **the same account** if its separate browser storage has never held that sign-in. The lineup, photos, and completed stats now load from Firebase automatically. Refreshing the app restores its saved session at startup.

Data previously stored only in a browser must be uploaded from that browser once. The app cannot directly read a different browser's private local storage. Do not clear either one's site data during migration. Do not create a new account to recover the old account's records.

## What changed

Firebase starts on app launch and restores authentication before offering sign-in or editing the lineup. Authentication uses durable IndexedDB persistence, with a localStorage fallback. The header shows “Restoring…” while checking, rather than presenting a false signed-out state.

Saved lineup names, numbers, icons, and uploaded photos load automatically from the account. Editing a lineup saves it to the account for solo/local games too. Failed saves remain queued locally and retry on account sync/reconnection. A default install cannot overwrite a customized cloud lineup. A pre-existing device lineup is also retained as a recovery copy; Account offers **Recover previous lineup** if it differs from the restored one.

**My stats** and the Clubhouse Stats tab now show the account career: online games plus backed-up completed solo/local games. Online games remain in their original Firestore records. Existing browser-only final games are migrated by ID without duplicate counting. Confirmed final games only; solo/local records use the away team you control. New signed-in offline stats retain their history rather than trimming it to the old 35-game limit.

Guest play still works locally. Unfinished offline games remain on the device where they were started. Keeping a login locally is necessary for authentication; your account profiles and synced stats are stored in Firestore.

## Verification

Checks cover automatic startup auth restoration, durable auth initialization, profile/photo restoration into empty app storage, browser-only migration, combined stats, duplicate-safe backups, queued failed-save recovery, account isolation, recovery from an older default-profile overwrite, and refresh reads using a Firebase mock. The existing live event, bunt, gameplay, and league checks pass.

Real installed-app/browser sessions and a Firestore rules emulator were not available in this environment. The included rules must be published before the new archive backup requests can succeed.
