import { _decorator} from 'cc';
import { creature } from './creature';
import { ListenerManager } from '../event/ListenerManager';

const { ccclass, property } = _decorator;

@ccclass('monster')
export class monster extends creature {

    private _monsterID:number = 0;
    private _monsterType:number = 0;

    protected onEnable(): void {
        ListenerManager.on('hitMonster',this.monsterBeenHit,this);
    }

    protected onDisable(): void {
        ListenerManager.off('hitMonster',this.monsterBeenHit,this);
    }

    init(id:number,type:number){
        this._monsterID = id;
        this._monsterType = type;
    }

    start() {
        super.start();
        
    }

    monsterAtkFun(){
        
    }

    monsterBeenHit(monID:number,hitNum:number){
        if (monID!=null && hitNum!=null) {
            if (this._monsterID == monID) {
                this.dealWithDamage(hitNum);
            }
        }
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }
}

