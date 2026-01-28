import { MerchantRPG } from './game/MerchantRPG';

function bindUI(gameInstance: MerchantRPG) {
    document.addEventListener('click', (event) => {
        const target = (event.target as HTMLElement | null)?.closest('[data-action]') as HTMLElement | null;
        if (!target) return;

        const action = target.dataset.action;

        switch (action) {
            case 'switchTab':
                gameInstance.switchTab(target.dataset.tab ?? 'heroes', target);
                break;
            case 'openQuestModal':
                gameInstance.openQuestModal(Number(target.dataset.questId));
                break;
            case 'openPartyPositionModal':
                gameInstance.openPartyPositionModal(Number(target.dataset.position));
                break;
            case 'equipItem':
                gameInstance.equipItem(Number(target.dataset.itemId), Number(target.dataset.heroId));
                break;
            case 'unequipItem':
                gameInstance.unequipItem(target.dataset.slot ?? '', Number(target.dataset.heroId));
                break;
            case 'craftItem':
                gameInstance.craftItem(Number(target.dataset.recipeId));
                break;
            case 'refineMaterial':
                gameInstance.refineMaterial(Number(target.dataset.recipeId));
                break;
            case 'sellItem':
                gameInstance.sellItem(Number(target.dataset.itemId));
                break;
            case 'buyShopItem':
                gameInstance.buyShopItem(Number(target.dataset.shopItemId));
                break;
            case 'startAdventureForm':
                gameInstance.startAdventureFromForm(Number(target.dataset.adventureId));
                break;
            case 'tickAdventure':
                gameInstance.tickAdventure();
                break;
            case 'hireHero':
            case 'save':
            case 'reset':
            case 'closeQuestModal':
            case 'startQuest':
            case 'closePartyModal':
            case 'savePartyPosition':
                gameInstance[action]();
                break;
            default:
                break;
        }
    });

    document.addEventListener('change', (event) => {
        const target = (event.target as HTMLElement | null)?.closest('[data-action]') as HTMLElement | null;
        if (target) {
            const action = target.dataset.action;

            switch (action) {
                case 'selectEquipmentHero': {
                    const select = target as HTMLSelectElement;
                    gameInstance.selectEquipmentHero(Number(select.value));
                    break;
                }
                case 'filterAdventureLog': {
                    const input = target as HTMLInputElement;
                    gameInstance.setAdventureLogFilter(input.dataset.filter ?? 'status', input.checked);
                    break;
                }
                default:
                    break;
            }
        }

        const adventureInput = (event.target as HTMLElement | null)?.closest('[data-adventure-id]') as HTMLElement | null;
        if (!adventureInput) return;

        const adventureId = Number(adventureInput.dataset.adventureId);
        if (Number.isNaN(adventureId)) return;

        if (adventureInput instanceof HTMLInputElement && adventureInput.dataset.adventureHero) {
            gameInstance.updateAdventureDraftHero(adventureId, Number(adventureInput.dataset.adventureHero), adventureInput.checked);
        } else if (adventureInput instanceof HTMLInputElement && adventureInput.dataset.adventureResource) {
            gameInstance.updateAdventureDraftResource(adventureId, adventureInput.dataset.adventureResource, Number(adventureInput.value));
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    const game = new MerchantRPG();
    bindUI(game);
});
