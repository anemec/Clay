import { MerchantRPG } from './game/MerchantRPG';

function bindUI(gameInstance: MerchantRPG) {
    document.addEventListener('click', (event) => {
        const target = (event.target as HTMLElement | null)?.closest('[data-action]') as HTMLElement | null;
        if (!target) return;

        const action = target.dataset.action;

        switch (action) {
            case 'switchTab':
                gameInstance.switchTab(target.dataset.tab ?? 'heroes');
                break;
            case 'openQuestModal':
                gameInstance.openQuestModal(Number(target.dataset.questId));
                break;
            case 'openPartyPositionModal':
                gameInstance.openPartyPositionModal(Number(target.dataset.position));
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
}

window.addEventListener('DOMContentLoaded', () => {
    const game = new MerchantRPG();
    bindUI(game);
});
