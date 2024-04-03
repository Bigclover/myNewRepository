import { _decorator} from 'cc';
import { creature } from './creature';
import { ListenerManager } from '../event/ListenerManager';

const { ccclass, property } = _decorator;

@ccclass('monster')
export class monster extends creature {

    private _monsterID:number = 0;

    protected onEnable(): void {
        ListenerManager.on('hitMonster',this.monsterBeenHit,this);
    }

    protected onDisable(): void {
        ListenerManager.off('hitMonster',this.monsterBeenHit,this);
    }

    start() {
        super.start();
        
    }

    monsterBeenHit(monID:number,hitNum:number){
        if (monID!=null && hitNum!=null) {
            if (this._monsterID == monID) {
                this.beenHit(hitNum);
            }
        }
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }
}

