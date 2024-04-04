import { Prefab, _decorator, instantiate} from 'cc';
import { creature } from './creature';
import { ListenerManager } from '../event/ListenerManager';
import { deckConteroler } from './deckConteroler';

const { ccclass, property } = _decorator;

@ccclass('hero')
export class hero extends creature {
    @property({type:Prefab})
    deckContrPre:Prefab = null;

    //hero单次抽牌数量
    public drawCardsAbility:number = 4;

    protected onEnable(): void {
        ListenerManager.on('hitHero',this.heroBeenHit,this);
    }

    protected onDisable(): void {
        ListenerManager.off('hitHero',this.heroBeenHit,this);
    }

    start() {
        super.start();
        this.creatorDeckControler();
    }

    heroEndTurn(){
        //结束出牌 通知主战斗场景 进入monster turn
        
    }

    creatorDeckControler(){
        let _deckControler = instantiate(this.deckContrPre);
        _deckControler.getComponent(deckConteroler).initSelf(this);
        this.node.parent.addChild(_deckControler);
    }

    heroBeenHit(atkNum:number){
        this.dealWithDamage(atkNum);
    }

    update(deltaTime: number) {
        // super.update(deltaTime);

    }
}

