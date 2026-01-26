# Architecture Refactoring Plan

## Current State
- **game.js**: 1400+ lines, monolithic
- **Tests**: Split but testing monolithic code
- **No separation of concerns**
- **Hard to test individual features**

## Proposed Structure

```
src/
├── core/
│   ├── Game.js              # Main game coordinator (thin orchestration layer)
│   └── StateManager.js      # Save/load, state persistence
│
├── systems/
│   ├── HeroSystem.js        # Hero hiring, leveling, management
│   ├── QuestSystem.js       # Quest logic, completion, rewards
│   ├── LootSystem.js        # Loot generation, rarity, drops
│   ├── PartySystem.js       # Party formation, positioning
│   └── TacticsSystem.js     # Tactics unlocking, assignment
│
├── data/
│   ├── heroTemplates.js     # Hero class definitions
│   ├── questTemplates.js    # Quest/map data
│   ├── tacticsLibrary.js    # All tactics by class
│   └── lootTables.js        # Loot configuration
│
├── ui/
│   ├── renderers/
│   │   ├── HeroRenderer.js      # Heroes tab rendering
│   │   ├── PartyRenderer.js     # Party grid rendering
│   │   ├── QuestRenderer.js     # Quests tab rendering
│   │   └── MaterialsRenderer.js # Materials tab rendering
│   └── modals/
│       ├── QuestModal.js        # Quest selection modal
│       └── PartyModal.js        # Party position modal
│
└── utils/
    ├── formatters.js        # Time, number formatting
    └── constants.js         # Game constants
```

## Design Principles

### 1. **Single Responsibility**
Each module has ONE clear purpose:
- `HeroSystem` → Only hero logic
- `LootSystem` → Only loot logic
- `HeroRenderer` → Only hero UI

### 2. **Dependency Injection**
Systems receive dependencies, don't create them:
```javascript
class HeroSystem {
    constructor(stateManager, tacticsSystem) {
        this.state = stateManager;
        this.tactics = tacticsSystem;
    }
}
```

### 3. **Testability**
- Each system can be tested in isolation
- Mock dependencies easily
- No DOM required for logic tests

### 4. **Composition over Inheritance**
Game class composes systems:
```javascript
class Game {
    constructor() {
        this.state = new StateManager();
        this.heroes = new HeroSystem(this.state);
        this.quests = new QuestSystem(this.state, this.heroes);
    }
}
```

### 5. **Immutable Data Structures**
Data templates are frozen, state mutations explicit

## Migration Strategy

### Phase 1: Setup & Data (No Breaking Changes)
1. Create folder structure
2. Extract data (templates, tables) → `src/data/`
3. Extract utils → `src/utils/`
4. Update imports, verify tests pass

### Phase 2: Extract Systems (Incremental)
5. Extract `StateManager` (save/load logic)
6. Extract `LootSystem` (has tests, good starting point)
7. Extract `TacticsSystem` (has tests)
8. Extract `PartySystem` (has tests)
9. Extract `HeroSystem`
10. Extract `QuestSystem`

### Phase 3: Extract UI (Visual Verification)
11. Extract renderers to `src/ui/renderers/`
12. Extract modals to `src/ui/modals/`
13. Verify UI works in browser

### Phase 4: Refactor Main Game
14. Slim down `Game.js` to coordinator
15. Wire systems together
16. Ensure backward compatibility

### Phase 5: Build & Polish
17. Add build configuration (esbuild or rollup)
18. Update tests to use new imports
19. Add module documentation
20. Performance audit

## Example: LootSystem Extraction

### Before (in game.js)
```javascript
class MerchantRPG {
    constructor() {
        this.lootRarities = { ... };
        // 1000+ other lines
    }

    generateLoot(level) { ... }
    generateQuestLoot(questId) { ... }
}
```

### After
```javascript
// src/systems/LootSystem.js
export class LootSystem {
    constructor(lootTables) {
        this.tables = lootTables;
        this.nextItemId = 1;
    }

    generateLoot(level, options = {}) { ... }
    generateQuestLoot(questId) { ... }
}

// src/data/lootTables.js
export const lootRarities = { ... };
export const lootTables = { ... };

// src/core/Game.js
import { LootSystem } from '../systems/LootSystem.js';
import { lootTables } from '../data/lootTables.js';

class Game {
    constructor() {
        this.loot = new LootSystem(lootTables);
    }
}
```

## Testing Strategy

### Unit Tests (Isolated)
```javascript
// tests/unit/LootSystem.test.js
import { LootSystem } from '../../src/systems/LootSystem.js';

describe('LootSystem', () => {
    it('generates loot with correct rarity', () => {
        const loot = new LootSystem(mockTables);
        const item = loot.generateLoot(5);
        expect(item.rarity).toBeDefined();
    });
});
```

### Integration Tests
```javascript
// tests/integration/game.test.js
import { Game } from '../../src/core/Game.js';

describe('Game Integration', () => {
    it('completes quest and generates loot', () => {
        const game = new Game();
        // Test full flow
    });
});
```

## Benefits

1. **Maintainability**: Find code in seconds, not minutes
2. **Testability**: Test each system in isolation
3. **Reusability**: Use systems in different contexts
4. **Scalability**: Add features without touching unrelated code
5. **Collaboration**: Multiple devs can work on different systems
6. **Performance**: Tree-shake unused code in production

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing tests | Incremental refactor, tests pass each step |
| Browser compatibility | Use esbuild to bundle for ES5 if needed |
| Increased complexity | Clear documentation, consistent patterns |
| Import hell | Barrel exports (index.js files) |

## Success Criteria

- ✅ All 77 tests pass
- ✅ Game works identically in browser
- ✅ Each file < 300 lines
- ✅ Each module has single responsibility
- ✅ No circular dependencies
- ✅ Clear folder organization
