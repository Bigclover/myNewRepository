import { Animation, AnimationState, _decorator} from 'cc';
import { creature } from './creature';
import { ListenerManager } from '../event/ListenerManager';
import { mainSecene } from './mainSecene';

const { ccclass, property } = _decorator;

@ccclass('monster')
export class monster extends creature {

    private _monsterID:number = 0;
    private _monsterType:number = 0;
    private _monsterAtkNum:number =15;
    private _monsterDefNum:number =15;
    private _mianSecene:mainSecene = null;

    protected onEnable(): void {
        ListenerManager.on('hitMonster',this.monsterBeenHit,this);
    }

    protected onDisable(): void {
        ListenerManager.off('hitMonster',this.monsterBeenHit,this);
    }

    init(id:number,type:number,main:mainSecene){
        this._monsterID = id;
        this._monsterType = type;
        this._mianSecene = main;
    }

    start() {
        super.start();
        this.fightAnim.on(Animation.EventType.FINISHED,this.onFightAnimFinished,this);
    }

    monsterAtkFun(){
        this.fightAnim.play('atkback');
        console.log('monster ID:'+this._monsterID+"Atk num ="+this._monsterAtkNum);
        ListenerManager.dispatch('hitHero',this._monsterAtkNum);
    }

    monsterBeenHit(monID:number,hitNum:number){
        if (monID!=null && hitNum!=null) {
            if (this._monsterID == monID) {
                this.dealWithDamage(hitNum);
            }
        }
    }

    onFightAnimFinished(type: Animation.EventType, state: AnimationState) {
        if (state.name == 'atkback') {
            this._mianSecene.whenMonsterAtkFinished();
        }   
    }   

    update(deltaTime: number) {
        super.update(deltaTime);
    }
}

