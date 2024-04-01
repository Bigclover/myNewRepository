import { _decorator, Component, Label, Node, ProgressBar, tween } from 'cc';


const { ccclass, property } = _decorator;

const barLenght:number = 346;
@ccclass('creature')
export class creature extends Component {
    @property({type:ProgressBar})
    HpBar:ProgressBar = null;
    @property(Label)
    hpLabel:Label = null;

    protected crMaxHp:number=200;
    protected crCurHp:number=200;
    protected _crCurDef:number=0;
    protected _hpChangeArr:number[]=[];
    protected _hpIsChanging:boolean = false;

    

    start() {
        this.hpLabel.string = this.crCurHp.toString();
    }
    
    beenHit(hitNum:number):void{
        // console.log('hit num = ',hitNum)
        this._hpChangeArr.push(hitNum);
    }

    setCreatureHp(change:number){
        this._hpIsChanging = true;
        this.crCurHp += change;
        let curRate:number = 0;
        if (this.crCurHp >0 || this.crCurHp < this.crMaxHp) {
            curRate = this.crCurHp/this.crMaxHp;
        }else if (this.crCurHp <= 0) {
            curRate = 0;
            this.crCurHp = 0;
        }else if (this.crCurHp >= this.crMaxHp) {
            curRate = 1;
            this.crCurHp = this.crMaxHp;
        }
        this.hpLabel.string = this.crCurHp.toString();

        let speed:number = 150;
        let cTime:number = (Math.abs(change) / speed);
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

