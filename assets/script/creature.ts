import { _decorator, Animation, AnimationState, Component, instantiate, Label, Layout, Node, Prefab, ProgressBar, tween } from 'cc';
import { flowNumber } from './flowNumber';
import { AudioMgr } from '../tool/AudioMgr';
import { cardType, effectObj, skillType } from './gameConfing';
import { stateEffect } from './stateEffect';


const { ccclass, property } = _decorator;

// const barLenght:number = 346;
const hpAnimSpeed:number = 40;//血条变化速度
@ccclass('creature')
export class creature extends Component {
    @property({type:ProgressBar})
    HpBar:ProgressBar = null;

    @property(Label)
    hpLabel:Label = null;

    @property(Animation)
    fightAnim:Animation = null;

    @property(Node)
    missNode:Node = null;

    @property(Prefab)
    flowNum:Prefab= null;

    @property(Layout)
    effLayout:Layout = null;

    @property({type:Prefab})
    statePrefab:Prefab = null;

    // protected whoAmI:string = '';
    protected crMaxHp:number=0;
    protected crCurHp:number=0;
    protected _crCurDef:number=0;
    protected _hpChangeArr:number[]=[];
    protected _hpIsChanging:boolean = false;
    protected crSpeed:number = 0;
    protected crStrength:number = 0; //影响近战攻击力
    protected stand:number =0;
    protected isStunned:boolean = false;
    protected stunnedTurns:number = 0;
    protected beenStunnedRound:number = 0;
    protected stateEffectArray:stateEffect[]=[];

    start() {
        this.hpLabel.string = this.crCurHp.toString();
    }

    getSpeed():number{
        return this.crSpeed;
    }

    getStand():number{
        return this.stand;
    }

    setStand(num:number){
        this.stand = num;
    }

    beenStunnedFun(skill:effectObj){
        this.isStunned = true;
        this.stunnedTurns = skill.effNum;
        this.setStateEffectTag(skill.kType,this.stunnedTurns);
    }

    breakStunFun(curRound:number){
        let passRound = curRound - this.beenStunnedRound;
        if (passRound > this.stunnedTurns) {
            this.isStunned = false;
            this.stunnedTurns = 0;
            this.setStateEffectTag(skillType.STUN,this.stunnedTurns);
        }
    }

    playBeenHittedAnim(){
        this.scheduleOnce(()=>{
            this.fightAnim.play('hitted');
        },0.2)
    }

    dealWithDamage(damageNum:number){
        this._crCurDef -= damageNum;
        if (this._crCurDef < 0) {
            this.changeHpFun(this._crCurDef);
            this._crCurDef = 0; 
        }
        this.setStateEffectTag(skillType.DEFEND,this._crCurDef);
        this.playBeenHittedAnim();
    }

    // getEffectAtk(){
    //     return this.crStrength;
    // }

    addEffectAtk(skill:effectObj){
        this.crStrength += skill.effNum;
        if (this.crStrength > 0) {
            this.setStateEffectTag(skill.kType,this.crStrength);
        }
    }

    addDefFun(skill:effectObj){
        AudioMgr.inst.playEffect('audio','shield');
        this.fightAnim.play('shield');
        this._crCurDef += skill.effNum;
        this.setStateEffectTag(skill.kType,this._crCurDef);
    }

    addHpFun(hpNum:number){
        if (hpNum > 0) {
            AudioMgr.inst.playEffect('audio','addhp');
            this.changeHpFun(hpNum);
        }
    }

    doAtkFun(_cardType:cardType){
        if (_cardType == cardType.CLOSE_ATK) {
            AudioMgr.inst.playEffect('audio','atk');
        }else if (_cardType == cardType.DISTANCE_ATK) {
            AudioMgr.inst.playEffect('audio','shoot');
        }
    }

    moveFun(){
        AudioMgr.inst.playEffect('audio','move');
    }

    addflowNum(num:number){
        let _flowNum = instantiate(this.flowNum);
        _flowNum.getComponent(flowNumber).init(num);
        this.node.addChild(_flowNum);
    }

    setStateEffectTag(_ktype:skillType,num:number){
            let typeArr:skillType[]=[];
            this.stateEffectArray.forEach((_state)=>{
                typeArr.push(_state.getStateType());
            })
            let _index = typeArr.indexOf(_ktype);
            if (_index !== -1) {
                this.stateEffectArray[_index].updateStateNum(num);
                if (num <= 0) {
                   this.removeItemFormArray<stateEffect>(this.stateEffectArray[_index],this.stateEffectArray); 
                }
            } else {
                if (num > 0) {
                    this.addStateEffectTag(_ktype,num);
                }
            }
    }

    addStateEffectTag(_ktype:skillType,effNum:number){
        let _state = instantiate(this.statePrefab);
        let _stateEffect = _state.getComponent(stateEffect);
        _stateEffect.init(_ktype,effNum);
        this.effLayout.node.addChild(_state);
        this.stateEffectArray.push(_stateEffect);
    }
    
    changeHpFun(changeNum:number):void{
        this._hpChangeArr.push(changeNum);
    }

    setCreatureHp(change:number){
        this.addflowNum(change);
        this._hpIsChanging = true;
        this.crCurHp += change;
        let curRate:number = 0;
        if (this.crCurHp >0 && this.crCurHp < this.crMaxHp) {
            curRate = this.crCurHp/this.crMaxHp;
        }else if (this.crCurHp <= 0) {
            curRate = 0;
            this.crCurHp = 0;
        }else if (this.crCurHp >= this.crMaxHp) {
            curRate = 1;
            this.crCurHp = this.crMaxHp;
        }
        this.hpLabel.string = this.crCurHp.toString();

        let cTime:number = (Math.abs(change) / hpAnimSpeed);
        tween(this.HpBar)
        .to(cTime,{progress:curRate})
        .call(()=>{
            this._hpIsChanging = false;
        })
        .start()
    }

    update(deltaTime: number) {
        if (!this._hpIsChanging && this._hpChangeArr.length > 0) {
            let changeNum:number = this._hpChangeArr.shift();
            this.setCreatureHp(changeNum);
        }
    }

    missAnim(){
        this.missNode.active = true;
        tween(this.missNode)
        .delay(0.5)
        .call(()=>{
            this.missNode.active = false;
        })
        .start()
    }

    removeItemFormArray<T>(item:T,arr:T[]){
        let index = arr.indexOf(item);
        if (index > -1) {
            arr.splice(index,1);
        }
    }
}

