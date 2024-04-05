import { _decorator, Animation, Component, Label, Node, ProgressBar, tween } from 'cc';


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

    @property(Animation)
    fightAnim:Animation = null;

    // protected whoAmI:string = '';
    protected crMaxHp:number=50;
    protected crCurHp:number=50;
    protected _crCurDef:number=0;
    protected _hpChangeArr:number[]=[];
    protected _hpIsChanging:boolean = false;

    start() {
        this.hpLabel.string = this.crCurHp.toString();
        this.addDefFun(10);
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

    addDefFun(defNum:number){
        this._crCurDef += defNum;
        this.refreshDefUI();
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
    
    changeHpFun(changeNum:number):void{
        this._hpChangeArr.push(changeNum);
    }

    setCreatureHp(change:number){
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

