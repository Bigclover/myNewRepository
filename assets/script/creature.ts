import { _decorator, Animation, AnimationState, Component, instantiate, Label, Node, Prefab, ProgressBar, tween } from 'cc';
import { flowNumber } from './flowNumber';


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
  

    start() {
        this.hpLabel.string = this.crCurHp.toString();
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
        this.fightAnim.play('shield');
        this._crCurDef += defNum;
        this.refreshDefUI();
    }

    addHpFun(hpNum:number){
        if (hpNum > 0) {
            this.changeHpFun(hpNum);
        }
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

 
}

