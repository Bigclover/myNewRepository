import { _decorator, Animation, AnimationState, Component, instantiate, Label, Node, Prefab, ProgressBar, tween } from 'cc';
import { flowNumber } from './flowNumber';
import { AudioMgr } from '../tool/AudioMgr';


const { ccclass, property } = _decorator;

// const barLenght:number = 346;
const hpAnimSpeed:number = 40;//血条变化速度
@ccclass('creature')
export class creature extends Component {
    @property({type:ProgressBar})
    HpBar:ProgressBar = null;

    @property(Label)
    hpLabel:Label = null;

    @property(Node)
    defNode:Node= null;

    @property(Node)
    effAtkNode:Node= null;

    @property(Animation)
    fightAnim:Animation = null;

    @property(Node)
    missNode:Node = null;

    @property(Prefab)
    flowNum:Prefab= null;

    // protected whoAmI:string = '';
    protected crMaxHp:number=0;
    protected crCurHp:number=0;
    protected _crCurDef:number=0;
    protected _hpChangeArr:number[]=[];
    protected _hpIsChanging:boolean = false;
    protected crSpeed:number = 0;
    protected crStrength:number = 0; //影响卡片or技能 攻击力
    protected stand:number =0;
  

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
        this._crCurDef -= damageNum;
        if (this._crCurDef < 0) {
            this.changeHpFun(this._crCurDef);
        }
        this.refreshDefUI();
        this.playBeenHittedAnim();
    }

    getEffectAtk(){
        return this.crStrength;
    }

    addEffectAtk(eff:number){
        this.crStrength += eff;
        this.refreshEffeAtkUI();
    }

    addDefFun(defNum:number){
        AudioMgr.inst.playEffect('audio','shield');
        this.fightAnim.play('shield');
        this._crCurDef += defNum;
        this.refreshDefUI();
    }

    addHpFun(hpNum:number){
        if (hpNum > 0) {
            AudioMgr.inst.playEffect('audio','addhp');
            this.changeHpFun(hpNum);
        }
    }

    doAtkFun(){
        AudioMgr.inst.playEffect('audio','atk');
    }

    moveFun(){
        AudioMgr.inst.playEffect('audio','move');
    }

    addflowNum(num:number){
        let _flowNum = instantiate(this.flowNum);
        _flowNum.getComponent(flowNumber).init(num);
        this.node.addChild(_flowNum);
    }

    refreshDefUI(){
        if (this._crCurDef>0) {
            this.defNode.active = true;
            let _label = this.defNode.getChildByName('num').getComponent(Label);
            _label.string = this._crCurDef.toString();
        }else{
            this._crCurDef = 0;
            this.defNode.active = false;
        }
    }

    refreshEffeAtkUI(){
        if (this.crStrength>0) {
            this.effAtkNode.active = true;
            let _label = this.effAtkNode.getChildByName('num').getComponent(Label);
            _label.string = this.crStrength.toString();
        }else{
            this.crStrength = 0;
            this.effAtkNode.active = false;
        }
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

