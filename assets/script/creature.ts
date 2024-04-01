import { _decorator, Component, Node, ProgressBar, tween } from 'cc';

const { ccclass, property } = _decorator;

const barLenght:number = 346;
@ccclass('creature')
export class creature extends Component {
    @property({type:ProgressBar})
    HpBar:ProgressBar = null;

    

    private crMaxHp:number=200;
    private crCurHp:number=200;
    private _crCurDef:number=0;
    

    start() {
        
    }
    
    

    setCreatureHp(change:number){
        this.crCurHp += change;
        let curRate:number = 0;
        if (this.crCurHp >=0 || this.crCurHp <= this.crMaxHp) {
            curRate = this.crCurHp/this.crMaxHp;
        }else if (this.crCurHp < 0) {
            curRate = 0;
        }else if (this.crCurHp > this.crMaxHp) {
            curRate = 1;
        }

        let speed:number = 150;
        let cTime:number = (Math.abs(change) / speed);
        tween(this.HpBar)
        .to(cTime,{progress:curRate})
        .call(()=>{
            
        })
        .start()
    }

    update(deltaTime: number) {
        
    }
}

