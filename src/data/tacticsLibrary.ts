/**
 * Tactics Library
 * Class-specific tactics with effects for battle calculations
 * Tactics unlock as heroes level up
 */

export const tacticsLibrary = {
    fighter: [
        {
            id: 'fighter_shield_wall',
            name: 'Shield Wall',
            description: 'Hold the front line. Draw enemy aggression and protect allies behind you.',
            category: 'defensive',
            unlockLevel: 1,
            effects: {
                defenseModifier: 1.3,
                damageModifier: 0.9,
                aggroMultiplier: 2.0,
                rowPreference: 'front'
            }
        },
        {
            id: 'fighter_berserker',
            name: 'Berserker Rage',
            description: 'Charge into battle with reckless abandon. Maximum damage, minimum defense.',
            category: 'offensive',
            unlockLevel: 1,
            effects: {
                damageModifier: 1.4,
                defenseModifier: 0.7,
                initiative: 10,
                rowPreference: 'front'
            }
        },
        {
            id: 'fighter_tactical',
            name: 'Tactical Strike',
            description: 'Balance offense and defense. Adapt to battlefield conditions.',
            category: 'offensive',
            unlockLevel: 10,
            effects: {
                damageModifier: 1.2,
                defenseModifier: 1.1,
                criticalChance: 0.15,
                rowPreference: 'front'
            }
        }
    ],
    wizard: [
        {
            id: 'wizard_arcane_barrage',
            name: 'Arcane Barrage',
            description: 'Rain destruction from afar with powerful spells. Stay safe in the back.',
            category: 'offensive',
            unlockLevel: 1,
            effects: {
                damageModifier: 1.5,
                range: 'long',
                rowPreference: 'back'
            }
        },
        {
            id: 'wizard_crowd_control',
            name: 'Crowd Control',
            description: 'Focus on disabling multiple enemies rather than raw damage.',
            category: 'support',
            unlockLevel: 1,
            effects: {
                damageModifier: 0.8,
                aoeMultiplier: 1.5,
                rowPreference: 'back'
            }
        },
        {
            id: 'wizard_glass_cannon',
            name: 'Glass Cannon',
            description: 'Channel all power into devastating single-target spells.',
            category: 'offensive',
            unlockLevel: 15,
            effects: {
                damageModifier: 2.0,
                defenseModifier: 0.5,
                criticalChance: 0.25,
                rowPreference: 'back'
            }
        }
    ],
    rogue: [
        {
            id: 'rogue_shadow_strike',
            name: 'Shadow Strike',
            description: 'Sneak behind enemies for devastating surprise attacks from the shadows.',
            category: 'offensive',
            unlockLevel: 1,
            effects: {
                damageModifier: 1.6,
                criticalChance: 0.3,
                initiative: 15,
                targetPreference: 'back',
                rowPreference: 'front'
            }
        },
        {
            id: 'rogue_opportunist',
            name: 'Opportunist',
            description: 'Stay out of direct combat. Strike when enemies are vulnerable.',
            category: 'offensive',
            unlockLevel: 1,
            effects: {
                damageModifier: 1.3,
                criticalChance: 0.35,
                initiative: 8,
                rowPreference: 'back'
            }
        },
        {
            id: 'rogue_hit_and_run',
            name: 'Hit and Run',
            description: 'Quick strikes followed by tactical retreat. Minimize damage taken.',
            category: 'offensive',
            unlockLevel: 10,
            effects: {
                damageModifier: 1.2,
                defenseModifier: 1.3,
                initiative: 12,
                rowPreference: 'front'
            }
        }
    ],
    cleric: [
        {
            id: 'cleric_battle_healer',
            name: 'Battle Healer',
            description: 'Support allies from the front lines with healing and buffs.',
            category: 'support',
            unlockLevel: 1,
            effects: {
                healingMultiplier: 1.5,
                defenseModifier: 1.2,
                rowPreference: 'front'
            }
        },
        {
            id: 'cleric_divine_protection',
            name: 'Divine Protection',
            description: 'Stay back and provide maximum healing and shielding to the party.',
            category: 'support',
            unlockLevel: 1,
            effects: {
                healingMultiplier: 2.0,
                shieldMultiplier: 1.5,
                rowPreference: 'back'
            }
        }
    ],
    ranger: [
        {
            id: 'ranger_sniper',
            name: 'Sniper',
            description: 'Pick off enemies from maximum range with precise arrows.',
            category: 'offensive',
            unlockLevel: 1,
            effects: {
                damageModifier: 1.4,
                criticalChance: 0.25,
                range: 'long',
                rowPreference: 'back'
            }
        },
        {
            id: 'ranger_hunter',
            name: 'Hunter',
            description: 'Track and engage enemies at medium range. Balanced approach.',
            category: 'offensive',
            unlockLevel: 1,
            effects: {
                damageModifier: 1.3,
                defenseModifier: 1.1,
                initiative: 7,
                rowPreference: 'front'
            }
        }
    ],
    barbarian: [
        {
            id: 'barbarian_rampage',
            name: 'Rampage',
            description: 'Charge forward with unstoppable fury. Maximum aggression.',
            category: 'offensive',
            unlockLevel: 1,
            effects: {
                damageModifier: 1.7,
                defenseModifier: 0.8,
                aggroMultiplier: 1.5,
                rowPreference: 'front'
            }
        },
        {
            id: 'barbarian_tank',
            name: 'Immovable Object',
            description: 'Soak up damage while dishing it back. Pure survivability.',
            category: 'defensive',
            unlockLevel: 1,
            effects: {
                defenseModifier: 1.5,
                damageModifier: 1.1,
                aggroMultiplier: 2.5,
                rowPreference: 'front'
            }
        }
    ],
    paladin: [
        {
            id: 'paladin_holy_avenger',
            name: 'Holy Avenger',
            description: 'Front-line fighter with divine power. Smite evil and protect good.',
            category: 'offensive',
            unlockLevel: 1,
            effects: {
                damageModifier: 1.3,
                defenseModifier: 1.2,
                healingMultiplier: 1.2,
                rowPreference: 'front'
            }
        }
    ],
    warlock: [
        {
            id: 'warlock_eldritch_blast',
            name: 'Eldritch Blast',
            description: 'Channel dark pact magic into devastating ranged attacks.',
            category: 'offensive',
            unlockLevel: 1,
            effects: {
                damageModifier: 1.6,
                range: 'long',
                rowPreference: 'back'
            }
        }
    ],
    monk: [
        {
            id: 'monk_way_of_fist',
            name: 'Way of the Open Hand',
            description: 'Fast, fluid strikes. High mobility and consistent damage.',
            category: 'offensive',
            unlockLevel: 1,
            effects: {
                damageModifier: 1.3,
                initiative: 20,
                defenseModifier: 1.2,
                rowPreference: 'front'
            }
        }
    ],
    bard: [
        {
            id: 'bard_inspiration',
            name: 'Inspiration',
            description: 'Boost allies with songs and stories. Pure support role.',
            category: 'support',
            unlockLevel: 1,
            effects: {
                damageModifier: 0.7,
                allyBuffMultiplier: 1.5,
                healingMultiplier: 1.3,
                rowPreference: 'back'
            }
        }
    ]
};

// Freeze to prevent mutations
Object.freeze(tacticsLibrary);
