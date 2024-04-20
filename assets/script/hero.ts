import { Prefab, _decorator, director, find, instantiate} from 'cc';
import { creature } from './creature';
import { ListenerManager } from '../event/ListenerManager';
import { deckConteroler } from './deckConteroler';
import { mainSecene } from './mainSecene';
import { effectObj, skillType } from './gameConfing';

const { ccclass, property } = _decorator;

@ccclass('hero')
export class hero extends creature {
    @property({type:Prefab})
    deckContrPre:Prefab = null;

    private _mianSecene:mainSecene = null;
    public drawCardsAbility:number = 3;//hero单次抽牌数量
    public remainCardsAbility:number = 2;//hero留牌数量
    
    private _myDeckCont:deckConteroler = null;

    protected onEnable(): void {
        ListenerManager.on('hitHero',this.heroBeenHit,this);
    }

    protected onDisable(): void {
        ListenerManager.off('hitHero',this.heroBeenHit,this);
    }

    init(main:mainSecene){
        this._mianSecene = main;
        this.crMaxHp=50;
        this.crCurHp = this.crMaxHp;
    }

    start() {
        super.start();
        this.stand = -5;
        this.creatorDeckControler();

        this.scheduleOnce(()=>{
            this.heroDrawCards();
        },1)
    }

    roundStart(round:number){
        //hero round start 清除单轮效果
        if (this._crCurDef > 0) {
            this._crCurDef = 0;
            this.refreshDefUI();
        }
        if (this.crStrength > 0) {
            this.crStrength=0;
            this.refreshEffeAtkUI();
            this._myDeckCont.adjustAllCardsByHero(skillType.ATTACK,this.crStrength);
        }

        this.heroDrawCards();
    }

    addEffectAtk(eff:number){
        super.addEffectAtk(eff);
        this._myDeckCont.adjustAllCardsByHero(skillType.ATTACK,this.crStrength);
    }

    async heroDrawCards(){
        await this._myDeckCont.drawCardsFromAll(this.drawCardsAbility);
        this._myDeckCont.showTurnButton();
    }

    drawCardsByCard(num:number){
        this._myDeckCont.drawCardsFromAll(num);
    }

    heroEndTurn(){
        //结束出牌 通知主战斗场景 进入monster turn
        this._mianSecene.monsterRoundStart();
    }

    doHeroMove(move:number){
        super.moveFun();
        let mId = this._mianSecene.getClosestMonster();
        let mStand = this._mianSecene.getMonsterStand(mId);
        let endStand = this.stand + move;
        if (typeof mStand == 'number') {
            if ( endStand < mStand) { //hero移动不能越过最近的敌人
                this.stand = endStand
            } else {
                this.stand = mStand-1;
            }
        }
        this._mianSecene.heroMoveFinish();
    }

    stunMonster(skill:effectObj){
        let monsterId:number = this._mianSecene.getSelectedMonster();
        ListenerManager.dispatch('hitMonster',monsterId,skill);
    }

    doHeroAtk(skill:effectObj){
        super.doAtkFun();
        this.fightAnim.play('atk');
        let monsterId:number = this._mianSecene.getSelectedMonster();
        ListenerManager.dispatch('hitMonster',monsterId,skill);
    }

    creatorDeckControler(){
        let _deckControler = instantiate(this.deckContrPre);
        let dcCom:deckConteroler = _deckControler.getComponent(deckConteroler);
        dcCom.initSelf(this);
        find("Canvas").addChild(_deckControler);
        this._myDeckCont = dcCom;
    }

    heroBeenHit(mID:number,_skill:effectObj){
        let dis = this.getDistanceFormMonster(mID);
        if (_skill.range >= dis) {
            this.dealWithDamage(_skill.effNum);
        } else {
            //攻击范围外 处理未击中效果
            this.missAnim();
        }
    }

    getDistanceFormMonster(mid:number):number{
        let monsterStand = this._mianSecene.getMonsterStand(mid);
        let distance:number = Math.abs(this.stand - monsterStand);
        return distance;
    }

    update(deltaTime: number) {
        super.update(deltaTime);
        if (!this._hpIsChanging && this._hpChangeArr.length <= 0 && this.crCurHp <=0) {
            this._mianSecene.whenHeroDie();
        }
    }
}

