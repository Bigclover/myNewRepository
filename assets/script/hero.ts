import { Label, Node, Prefab, _decorator, find, instantiate} from 'cc';
import { creature } from './creature';
import { ListenerManager } from '../event/ListenerManager';
import { deckConteroler } from './deckConteroler';
import { mainSecene } from './mainSecene';
import { cardType, effectObj, skillType } from './gameConfing';
import { card } from './card';

const { ccclass, property } = _decorator;

@ccclass('hero')
export class hero extends creature {
    @property({type:Prefab})
    deckContrPre:Prefab = null;

    private _mainScene:mainSecene = null;
    public drawCardsAbility:number = 3;//hero单次抽牌数量
    public remainCardsAbility:number = 3;//hero留牌数量
    
    private _myDeckCont:deckConteroler = null;
    private _heroRounds:number = 0;

    protected onEnable(): void {
        ListenerManager.on('hitHero',this.heroBeenHit,this);
    }

    protected onDisable(): void {
        ListenerManager.off('hitHero',this.heroBeenHit,this);
    }

    init(main:mainSecene){
        this._mainScene = main;
        this.crMaxHp=50;
        this.crCurHp = this.crMaxHp;
    }

    start() {
        super.start();
        this.stand = -5;
        this.creatorDeckControler();
    }

    roundStart(round:number){
        this._heroRounds = round;
        super.creatureRoundStart(this._heroRounds );
        //hero round start 清除单轮效果

        let stateAtk = this.getStateEffByType(skillType.EFFECT_ATK);
        if (stateAtk) {
            stateAtk.checkEffectState(this._heroRounds);
            this._myDeckCont.adjustAllCardsByHero(cardType.CLOSE_ATK,skillType.ATTACK,0);
        }
        this.checkIaido(round);

        this.heroDrawCards();
    }

    checkIaido(_round:number){
        let iaido= this.getStateEffByType(skillType.IAIDO);
        if (iaido) {
            iaido.checkEffectState(_round);
        }
    }

    async heroDrawCards(){
        //第一轮抽 固定属性的card
        if (this._heroRounds < 2) {
            await this._myDeckCont.drawStableCard();
        }
        await this._myDeckCont.drawCardsFromAll(this.drawCardsAbility);
        this.scheduleOnce(()=>{
            this._myDeckCont.showTurnButton();
        },0.3);
    }

    drawCardsByCard(num:number){
        this._myDeckCont.drawCardsFromAll(num);
    }

    heroEndTurn(){
        //结束出牌 通知主战斗场景 进入monster turn
        this._mainScene.monsterRoundStart();
    }

    doHeroMove(move:number){
        super.moveFun();
        let mId = this._mainScene.getClosestMonster();
        let mStand = this._mainScene.getMonsterStand(mId);
        let endStand = this.stand + move;
        if (typeof mStand === 'number') {
            if ( endStand < mStand) { //hero移动不能越过最近的敌人
                this.stand = endStand
            } else {
                this.stand = mStand-1;
            }
        }
        this._mainScene.heroMoveFinish();
    }

    updatePoisonCardNum(layer:number){
        if (layer > 0) {
            this._myDeckCont.adjustAllCardsByHero(cardType.EXECUTE,skillType.POISONEXECUTE,layer);
        }else{
            this._myDeckCont.adjustAllCardsByHero(cardType.EXECUTE,skillType.POISONEXECUTE,0,true);
        }
    }

    addEffectToCreature(skill:effectObj,begin:number=this._heroRounds){
        super.addEffectToCreature(skill,begin);
        switch (skill.kType) {
            case skillType.DEFEND:
                break;
            case skillType.EFFECT_ATK:
                let strength = this.getStateNumByType(skillType.EFFECT_ATK);
                // console.log('addEffectToCreature:skillType.EFFECT_ATK:'+strength);
                this._myDeckCont.adjustAllCardsByHero(cardType.CLOSE_ATK,skillType.ATTACK,strength);
                break;
            case skillType.LOAD:
                let loadNum = this.getStateNumByType(skillType.LOAD);
                if (loadNum > 0) {
                    this._myDeckCont.adjustAllCardsByHero(cardType.DISTANCE_ATK,skillType.ATTACK,0);
                }
                break;
            default:
                break;
        }
    }

    addEffectToMonster(skill:effectObj){
        let monsterId:number = this._mainScene.getSelectedMonster();
        ListenerManager.dispatch('hitMonster',monsterId,skill);
    }

    doHeroAtk(_card:card,skill:effectObj){
        super.doAtkFun(_card.getCardType(),skill);
        this.fightAnim.play('atk');
        let monsterId:number = this._mainScene.getSelectedMonster();
        ListenerManager.dispatch('hitMonster',monsterId,skill);

        if (_card.getCardType() == cardType.DISTANCE_ATK) {
            let state = this.getStateEffByType(skillType.LOAD);
            if (state) {
                let consup = _card.getCardConsumption();
                let leftNum = state.dealWithChange(-consup);
                if (leftNum <= 0) {
                    this._myDeckCont.adjustAllCardsByHero(cardType.DISTANCE_ATK,skillType.ATTACK,0,true);
                }
            }
        }
    }

    creatorDeckControler(){
        let _deckControler = instantiate(this.deckContrPre);
        let dcCom:deckConteroler = _deckControler.getComponent(deckConteroler);
        dcCom.initSelf(this);
        find("Canvas").addChild(_deckControler);
        this._myDeckCont = dcCom;
    }

    heroBeenHit(mID:number,_skill:effectObj){
        if (_skill.kType == skillType.ATTACK) {
            let dis = this.getDistanceFormMonster(mID);
            if (_skill.range >= dis) {
                this.dealWithDamage(_skill.effNum);
                this.checkIaidoState();
            } else {
                //攻击范围外 处理未击中效果
                this.missAnim();
            }
        }else{
            this.setEffect(_skill,true);
        } 
    }

    checkIaidoState(){
        if (this.iaidoTag) {
            this.iaidoTag = false;
            let iaido = this.getStateEffByType(skillType.IAIDO);
            if (iaido) {
                iaido.cancelStateEffect();
            }
            this._myDeckCont.usingIaidoCard();
            this._mainScene.useSlowMontion(true);
            this.scheduleOnce(()=>{
                this._mainScene.useSlowMontion(false);
            },0.8)
        }
    }

    setEffect(skill:effectObj,formMonster:boolean = false){
        let begin:number;
        if (formMonster) {
            begin = this._heroRounds+1;
        } else {
            begin = this._heroRounds;
        }
        this.addEffectToCreature(skill,begin);
    }

    getDistanceFormMonster(mid:number):number{
        let monsterStand = this._mainScene.getMonsterStand(mid);
        let distance:number = Math.abs(this.stand - monsterStand);
        return distance;
    }

    update(deltaTime: number) {
        super.update(deltaTime);
        if (!this._hpIsChanging && this._hpChangeArr.length <= 0 && this.crCurHp <=0) {
            this._mainScene.whenHeroDie();
        }
    }
}

