import { _decorator, Animation, AnimationState, Component, instantiate, Label, Layout, Node, Prefab, ProgressBar, tween } from 'cc';
import { flowNumber } from './flowNumber';
import { AudioMgr } from '../tool/AudioMgr';
import { cardType, DebufData, effectObj, gameConfing, skillType, stateObj } from './gameConfing';
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
    protected _hpChangeArr:number[]=[];
    protected _hpIsChanging:boolean = false;
    protected crSpeed:number = 0;
    protected stand:number =0;
    protected isTangled:boolean = false;
    protected stateEffectArray:stateEffect[]=[];
    protected iaidoTag:boolean = false;

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

    playBeenHittedAnim(){
        this.scheduleOnce(()=>{
            this.fightAnim.play('hitted');
        },0.2)
    }

    dealWithDamage(damageNum:number){
        let state = this.getStateEffByType(skillType.DEFEND);
        if (state) {
            let leftNum = state.dealWithChange(-damageNum);
            if (leftNum < 0) {
                this.changeHpFun(leftNum);
            }else if (leftNum == 0) {
                this.setIaidoTag();
            }
        } else {
            this.changeHpFun(-damageNum);
        }

        this.playBeenHittedAnim();
    }

    setIaidoTag(){
        let iaido= this.getStateEffByType(skillType.IAIDO);
        if (iaido) {
            this.iaidoTag = true;
        }
    }

    getStateNumByType(type:skillType):number{
        let state = this.getStateEffByType(type);
        if (state) {
            return state.getStateNum();
        } else {
            return 0;
        }
    }

    getStateEffByType(type:skillType):stateEffect|null{
        let typeArr:skillType[]=[];
        this.stateEffectArray.forEach((_state)=>{
            typeArr.push(_state.getStateType());
        })
        let _index = typeArr.indexOf(type);
        if (_index !== -1) {
            return this.stateEffectArray[_index];
        } else {
            return null;
        }
    }

    addEffectToCreature(eSkill:effectObj,begin:number){
        switch (eSkill.kType) {
            case skillType.DEFEND:
                AudioMgr.inst.playEffect('audio','shield');
                this.fightAnim.play('shield');
                break;
            case skillType.EFFECT_ATK:
                
                break;
            case skillType.LOAD:
                AudioMgr.inst.playEffect('audio','load');
                break;
            default:
                break;
        }

        let _state:stateObj={
            sType:eSkill.kType,
            stateNum:eSkill.effNum,
            isEffective:true,
            turnBase:eSkill.effNum === -1,
            persistTurns:eSkill.turns,
            beginRound:begin,
            descr:eSkill.descr
        }

        let typeArr:skillType[]=[];
        this.stateEffectArray.forEach((_state)=>{
            typeArr.push(_state.getStateType());
        })
        let _index = typeArr.indexOf(eSkill.kType);
        if (_index !== -1) {
            if (eSkill.effNum === -1) {
                this.stateEffectArray[_index].dealWithRoundChange(eSkill.turns);
            } else {
                this.stateEffectArray[_index].dealWithChange(eSkill.effNum);
            }
        } else {
            this.addStateEffectTag(_state);  
        }
    }

    creatureRoundStart(_round:number){
        let poison = this.checkBufState(skillType.POISON);
        if (poison > 0) {
            this.changeHpFun(-poison);
        }
        this.checkBufState(skillType.DAMAGEHEAL);

        let stateDef = this.getStateEffByType(skillType.DEFEND);
        if (stateDef) {
            stateDef.checkEffectState(_round);
        }

        this.checkIsCanMove(_round);
    }
    
    checkBufState(sType:skillType,isDealChange:boolean = true):number{
        let buf= this.getStateEffByType(sType);
        let result:number = 0;
        if (buf) {
            let bufData:DebufData = gameConfing.instance.getDebufData(sType);
            let layer = buf.getStateNum();
            if (layer > 0) {
                result = layer*bufData.damagePerLayer;
            }
            if (isDealChange) {
                buf.dealWithChange(bufData.layerPerRound);
            }
        }
        return result;
    }

    checkIsCanMove(_round:number){
        let stateTangle= this.getStateEffByType(skillType.TANGLE);
        if (stateTangle) {
            this.isTangled = true;
            let isTangled = stateTangle.checkEffectState(_round);
            if (!isTangled) {
                this.isTangled = false;
            }
        }
    }

    addHpFun(hpNum:number){
        if (hpNum > 0) {
            AudioMgr.inst.playEffect('audio','addhp');
            this.changeHpFun(hpNum);
        }
    }

    doAtkFun(_cardType:cardType,skill:effectObj){
        if (_cardType == cardType.CLOSE_ATK) {
            AudioMgr.inst.playEffect('audio','atk');
        }else if (_cardType == cardType.DISTANCE_ATK) {
            AudioMgr.inst.playEffect('audio','shoot');
        }

        if (_cardType == cardType.CLOSE_ATK || _cardType == cardType.DISTANCE_ATK || _cardType == cardType.EXECUTE) {
            let atkHealIndex = this.checkBufState(skillType.DAMAGEHEAL,false);
            if (atkHealIndex>0 && skill.effNum > 0) {
                let heal = Math.ceil(skill.effNum*atkHealIndex);
                // console.log('heal =='+heal+" == "+skill.effNum+"*"+atkHealIndex);
                this.changeHpFun(heal);
            } 
        }
        
    }

    effectExecutedBySkill(_skill:effectObj){
        switch (_skill.kType) {
            case skillType.POISONEXECUTE:
                this.poisonExecuted(_skill.initNum);
                break;
        
            default:
                break;
        }
    }

    poisonExecuted(perDamage:number){
        let poison= this.getStateEffByType(skillType.POISON);
        if (poison) {
            let layer = poison.getStateNum();
            if (layer > 0) {
                let totaldamage:number = layer*perDamage;
                this.dealWithDamage(totaldamage);
            }
            this.termianlEffectState(skillType.POISON);
        }
    }

    termianlEffectState(_type:skillType){
        let _state = this.getStateEffByType(_type);
        if (_state) {
            _state.cancelStateEffect();
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

    addStateEffectTag(stateData:stateObj){
        let _state = instantiate(this.statePrefab);
        let _stateEffect = _state.getComponent(stateEffect);
        _stateEffect.init(stateData,this);
        this.effLayout.node.addChild(_state);
        this.stateEffectArray.push(_stateEffect);
    }

    removeStateFromStateEffectArray(_state:stateEffect){
        gameConfing.instance.removeItemFormArray<stateEffect>(_state,this.stateEffectArray);
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

}

