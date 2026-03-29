# ARC Raiders Loadout Planner

A static GitHub Pages friendly planner for ARC Raiders loadouts.

## What it does

- Clickable loadout slots with an ARC Raiders-style board
- Augment-aware layout changes for:
  - backpack slots
  - quick-use slots
  - augmented slots such as grenade, healing, trinket, or deployable utility
  - safe pocket slots
  - integrated tools such as binoculars / shield recharger / defibrillator
- Weapon-specific attachment subslots with tighter per-weapon slot typing (for example tech, light mag, medium mag, shotgun mag, and shotgun muzzle)
- Recursive crafting breakdown under the board
  - base materials you must gather
  - crafted intermediary parts needed along the way
  - per-slot dependency tree
- Named loadouts saved locally in the browser
- Mobile-friendly layout with compact cards, sticky section jump pills, and improved landscape handling
- Fallback weapon/item thumbnails so every slot still shows an icon when the live catalog image is missing
- JSON import/export for sharing or backups

## Storage

The app is built for browser-local persistence on GitHub Pages.

- Primary save location: `localStorage`
- Cookie mirror: last active augment and a lightweight state backup when small enough

This keeps saves reliable across sessions without a server.

## Live data behavior

On first load the app tries to fetch the live community ARC Raiders item catalog from:

- `https://arcdata.mahcks.com/v1/items?full=true&offset=0&limit=45`

It then caches the catalog in `localStorage` for 12 hours.

If the live catalog is unavailable, the app falls back to a built-in seed dataset so the planner still works.

## Files

- `index.html` – app shell
- `styles.css` – styling
- `app.js` – planner logic, catalog loader, save/load, crafting recursion
- `assets/` – background references from the supplied screenshots

## Deploy to GitHub Pages

### Simplest route

1. Create a new GitHub repository.
2. Upload every file from this folder to the repository root.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/root` folder.
6. Save.
7. Wait for GitHub Pages to publish the site.

### Local preview

Run any static file server in this folder, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Notes

- This planner uses community-maintained data sources.
- Some live item metadata can lag behind the game, especially newly added or renamed equipment.
- Augment slot definitions are hard-coded in the app so the board layout remains stable even when catalog data is incomplete.
- The built-in recipe overrides intentionally prefer direct crafting recipes over recycle chains for common materials and weapon mods.
- Backpack slots now allow general items, including weapons and shields, though dragging an already-modded weapon from a weapon slot into a backpack slot is still a future enhancement.

## Customizing the item rules

If you want tighter filtering for specific weapons or attachment compatibility, edit these parts in `app.js`:

- `guessAttachmentSlotsForWeapon()`
- `isAttachmentCompatible()`
- `isQuickUseEligible()`
- `isBackpackEligible()`
- `isSafePocketEligible()`
- `isEntryValidForAugmentedKind()`

## Background art

The board uses the supplied ARC Raiders loadout screenshots as a low-opacity visual reference background and overlays interactive slots on top.
