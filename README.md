# Merchant RPG - MVP

A browser-based idle RPG game inspired by [Merchant RPG](https://merchantrpg.fandom.com/wiki/Merchant_Wiki). Hire heroes, send them on quests, collect materials, and watch your heroes grow!

## Features

### MVP (Current Version)
- **Heroes**: Hire warriors, rogues, and mages with unique stats
- **Quests**: Send heroes on 6 different quests with increasing difficulty
- **Offline Progress**: Quests continue even when you close the page!
- **Leveling**: Heroes gain EXP and level up with stat increases
- **Materials**: Collect materials from completed quests
- **Mobile-First**: Optimized for mobile devices with responsive design
- **Auto-Save**: Game automatically saves to browser localStorage

## How to Play

1. **Hire a Hero**: Start with 1000 gold - use the Heroes tab to hire your first hero
2. **Send on Quest**: Go to the Quests tab and tap a quest to see details
3. **Select Hero**: Choose an available hero (must meet level requirement)
4. **Wait**: Quest will complete in real-time (30s to 3min for testing)
5. **Collect Rewards**: Hero automatically returns with gold, materials, and EXP!
6. **Level Up**: Heroes get stronger as they gain experience
7. **Repeat**: Hire more heroes and send them on harder quests!

## Deployment to GitHub Pages

### Enable GitHub Pages:
1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **Deploy from a branch**
   - Branch: Select `claude/create-merchant-game-011CUYkaZSdKvGqA93qE32tx` and `/root`
   - Click **Save**
4. Wait a few minutes for deployment
5. Your game will be live at: `https://[username].github.io/Clay/`

### Alternative: Merge to Main
To deploy from main branch:
```bash
git checkout main
git merge claude/create-merchant-game-011CUYkaZSdKvGqA93qE32tx
git push origin main
```
Then set GitHub Pages to deploy from `main` branch.

## Technical Details

- **No Dependencies**: Pure vanilla JavaScript
- **Mobile-First**: Responsive CSS with touch-optimized UI
- **LocalStorage**: All game data saved in browser
- **Offline Progress**: Uses timestamps to calculate quest completion
- **Real Game Data**: Uses actual stats from Merchant RPG database

## Game Data Attribution

Game data and assets from [MerchantGameDB](https://github.com/Benzeliden/MerchantGameDB) by Benzeliden.

## Future Enhancements

Potential features for future versions:
- [ ] Crafting system (turn materials into equipment)
- [ ] Equipment system (gear for heroes)
- [ ] More hero classes (Berserker, Cleric, Assassin, etc.)
- [ ] Boss battles
- [ ] Achievement system
- [ ] Prestige/reset mechanics
- [ ] Sound effects and music
- [ ] More quests and regions
- [ ] Hero party system (multiple heroes per quest)

## Browser Compatibility

Works on:
- Chrome/Edge (desktop & mobile)
- Firefox (desktop & mobile)
- Safari (iOS & macOS)

Requires JavaScript and localStorage enabled.

## Development

The game consists of:
- `index.html` - Main page structure
- `game.js` - Game logic and mechanics
- `styles.css` - Mobile-first styling
- `data/` - JSON files with game data
- `images/` - Hero icons and assets

To run locally, just open `index.html` in a web browser!

## License

Game code: Open source
Game assets: From MerchantGameDB repository
