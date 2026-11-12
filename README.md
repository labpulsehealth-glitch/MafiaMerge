# MafiaMerge — The Empire of Ashes

A phone-friendly, browser-based third-person 3D game starter. The project currently includes:
- A Babylon.js 3D city scene with a third-person follow camera and touch joystick.
- Separate Dessert House and Armory merge boards.
- A visible 5×5 board grid with strong cell borders.
- 200 maximum player energy, energy costs per merge, and a gift vault.
- Starter story chapter, order rewards, cash and local save data.

## Run it
1. Upload the contents of this folder to a GitHub repository named `MafiaMerge`.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Choose branch `main` and folder `/ (root)`, then Save.
5. Wait for GitHub Pages to publish. Open the Pages URL on your phone.

The Babylon.js library and fonts load from CDNs, so the first launch needs an internet connection.

## Phone controls
- Drag the round joystick to move.
- Hold SPRINT to move faster.
- Use the business cards to open the merge boards.
- Tap one item, then tap an adjacent matching item to merge.

## Energy and gifts
- Maximum energy is 200.
- Dessert merges cost 5 energy; armory merges cost 8.
- Refreshing a board costs 10 energy.
- Three starter gifts are available in the Gift Vault. More gift events can be added in `scripts/game.js`.

## Important prototype notes
This is a playable foundation, not a finished commercial game. The city geometry and character are deliberately simple placeholders. Replace them with licensed or original realistic 3D models, animations, sound, and environment art as production progresses. The current item icons are temporary UI placeholders; they are not the final visual direction. Game progress is saved in the browser on the same device. GitHub Pages does not provide accounts, cloud saves, multiplayer, or secure server-side economies.

All armory objects are fictional collectible game inventory. This project does not provide real-world weapon construction or use instructions.
