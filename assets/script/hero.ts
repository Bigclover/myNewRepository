import { Prefab, _decorator, director, find, instantiate} from 'cc';
import { creature } from './creature';
import { ListenerManager } from '../event/ListenerManager';
import { deckConteroler } from './deckConteroler';
import { mainSecene } from './mainSecene';

const { ccclass, property } = _decorator;

@ccclass('hero')
export class hero extends creature {
    @property({type:Prefab})
    deckContrPre:Prefab = null;

    private _mianSecene:mainSecene = null;
    //hero单次抽牌数量
    public drawCardsAbility:number = 4;
    private _myDeckCont:deckConteroler = null;

    protected onEnable(): void {
        ListenerManager.on('hitHero',this.heroBeenHit,this);
    }

    protected onDisable(): void {
        ListenerManager.off('hitHero',this.heroBeenHit,this);
    }

    init(main:mainSecene){
        this._mianSecene = main;
    }

    start() {
        super.start();
        this.creatorDeckControler();

        this.scheduleOnce(()=>{
            this.heroDrawCards();
        },2)
    }

    heroDrawCards(){
        this._myDeckCont.drawCardsFromAll(this.drawCardsAbility);
    }

    heroEndTurn(){
        //结束出牌 通知主战斗场景 进入monster turn
        this._mianSecene.doMonsterAtk()
    }

    doHeroAtk(atkNum:number){
        this.fightAnim.play('atk');
        ListenerManager.dispatch('hitMonster',0,atkNum);
    }

    creatorDeckControler(){
        let _deckControler = instantiate(this.deckContrPre);
        let dcCom:deckConteroler = _deckControler.getComponent(deckConteroler);
        dcCom.initSelf(this);
        find("Canvas").addChild(_deckControler);
        this._myDeckCont = dcCom;
    }

    heroBeenHit(atkNum:number){
        this.dealWithDamage(atkNum);
    }

    update(deltaTime: number) {
        super.update(deltaTime);

    }
}

