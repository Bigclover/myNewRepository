import { Animation, AnimationState, Label, Node, _decorator} from 'cc';
import { creature } from './creature';
import { ListenerManager } from '../event/ListenerManager';
import { mainSecene } from './mainSecene';

const { ccclass, property } = _decorator;

interface skillObj{
    type:number,//0:攻击 1:护甲
    num:number
}

interface monInfo{
    name:string,
    level:number,
    maxHp:number,
    speed:number,
    type:number,
    skills:skillObj[]
}

@ccclass('monster')
export class monster extends creature {
    @property(Label)
    info:Label = null;

    @property(Node)
    checkNode:Node = null;

    private _monsterID:number = 0;
    private _mianSecene:mainSecene = null;
    private _monsterName:string = '';
    private _skillsArray:skillObj[]=[];

    protected onEnable(): void {
        ListenerManager.on('hitMonster',this.monsterBeenHit,this);
    }

    protected onDisable(): void {
        ListenerManager.off('hitMonster',this.monsterBeenHit,this);
    }

    init(id:number,monsterInfo:monInfo,main:mainSecene){
        this._monsterID = id;
        this._mianSecene = main;
        this.crMaxHp = monsterInfo.maxHp;
        this.crCurHp = this.crMaxHp;
        this._monsterName = monsterInfo.name;
        this.crSpeed = monsterInfo.speed;
        this._skillsArray =[...monsterInfo.skills];
    }

    start() {
        super.start();
        this.info.string ='ID'+this._monsterID +this._monsterName+'speed:'+this.crSpeed;
        if (this._monsterID == 0) {
            this.setSelectTag(true);
        }
    }

    roundStart(){
        this._crCurDef = 0;
        this.refreshDefUI();
        this.monsterAI();
        return new Promise<void>((resolve)=>{
            this.scheduleOnce(()=>{
                resolve()
            },1);
        })
    }

    beenSelected(){
        this._mianSecene.setSelectedMonster(this._monsterID);
    }

    setSelectTag(isShow:boolean){
        this.checkNode.active = isShow;
    }

    getMonsterID(){
        return this._monsterID;
    }

    monsterAtkFun(atkNum:number){
        this.fightAnim.play('atkback');
        console.log('monster ID:'+this._monsterID+"Atk num ="+atkNum);
        ListenerManager.dispatch('hitHero',atkNum);
    }

    monsterAI(){
        // let animTime:number=0;
        let skill:skillObj = this.randomArray<skillObj>(this._skillsArray);
        switch (skill.type) {
            case 0:
                this.monsterAtkFun(skill.num);
                // animTime = this.fightAnim.getState('atkback').duration
                break;
            case 1:
                this.addDefFun(skill.num);
                // animTime = this.fightAnim.getState('shield').duration
                break;
            case 2:
                this.addHpFun(skill.num);
                break;
            default:
                break;
        }
    }

    monsterBeenHit(monID:number,hitNum:number){
        if (monID!=null && hitNum!=null) {
            if (this._monsterID == monID) {
                this.dealWithDamage(hitNum);
            }
        }
    }

    // onFightAnimFinished(type: Animation.EventType, state: AnimationState) {
    //     super.onFightAnimFinished(type,state);
    //     // if (state.name == 'atkback') {
    //     //     this._mianSecene.whenMonsterAtkFinished();
    //     // }else if (state.name == 'shield') {   
    //     //     this._mianSecene.whenMonsterShieldFinished();
    //     // }    
    // }   

    update(deltaTime: number) {
        super.update(deltaTime);
        if (!this._hpIsChanging && this._hpChangeArr.length <= 0 && this.crCurHp <=0) {
            this._mianSecene.whenMonsterDie(this);
        }
    }

    public randomArray<T>(arr: T[]): T {
        var index: number = Math.floor(Math.random() * arr.length);
        return arr[index];
    }
}

