import { Label, Node, Vec3, _decorator, tween} from 'cc';
import { creature } from './creature';
import { ListenerManager } from '../event/ListenerManager';
import { mainSecene } from './mainSecene';
import { cardType, effectObj, monInfo, skillType } from './gameConfing';

const { ccclass, property } = _decorator;


@ccclass('monster')
export class monster extends creature {
    @property(Label)
    distanceLabel:Label = null;

    @property(Node)
    checkNode:Node = null;

    private _monsterID:number = 0;
    private _mianSecene:mainSecene = null;
    private _monsterName:string = '';
    private _skillsArray:effectObj[]=[];
    private _previousDistance:number = 0;
    private _mMoveAbility:number = 0;
    private _curPosition:Vec3;

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
        this.stand = monsterInfo.stand;
        this._mMoveAbility = monsterInfo.move;
    }

    start() {
        super.start();
        this.showDistance();
    }

    setStartPosition(){
        this._curPosition = this.node.getPosition();
        // this._startSibling = this.node.getSiblingIndex();
    }

    getCurPosition():Vec3{
        return this._curPosition;
    }

    showDistance(){
        let distance = this.getDistanceFormHero()
        this.distanceNumAnim(distance);
        this._previousDistance = distance;
    }

    distanceNumAnim(curNum:number){
        var obj = {num:this._previousDistance};
        // this.distanceLabel.string = obj.num.toString();
        let self = this;
        let _time = this.getTimeByChange(curNum);
        tween(obj)
        .to(_time,{num:curNum},{progress(start, end, current, ratio){
            self.distanceLabel.string = Math.ceil(start+ (end - start)*ratio).toString();
            return  start+ (end - start)*ratio;
        }})
        .start();
    }

    getTimeByChange(curNum:number):number{
        let ratio = 20;
        let mTime =Math.abs(this._previousDistance - curNum) / ratio;
        return mTime;
    }

    roundStart(){
        if (this.isStunned) {
            this.breakStunFun(this._mianSecene.getMonsterRound());
        }

        if (this._crCurDef > 0) {
            this._crCurDef = 0;
            // 每回合开始清除 防御 状态显示
            this.setStateEffectTag(skillType.DEFEND,this._crCurDef);
        }

        if (!this.isStunned) {
            this.monsterAI();
        }
        // return new Promise<void>((resolve)=>{
        //     this.scheduleOnce(()=>{
        //         resolve()
        //     },1);
        // })
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

    monsterAtkFun(type:cardType,_skill:effectObj){
        super.doAtkFun(type);
        this.fightAnim.play('atkback');
        ListenerManager.dispatch('hitHero',this._monsterID,_skill);
    }

    moveAI(range:number){
        return new Promise<void>((resolve)=>{
            let dis = this.getDistanceFormHero();
            if (range < dis) {
                this.doMonsterMove(this._mMoveAbility);
                this.scheduleOnce(()=>{ resolve() },0.3);
            }else if (range/2 > dis) {
                this.doMonsterMove(-this._mMoveAbility);
                this.scheduleOnce(()=>{ resolve() },0.3);
            }else{
                resolve();
            }
        })
    }

    async monsterAI(){
        let skill:effectObj = this.randomArray<effectObj>(this._skillsArray);
        console.log('ID:'+this._monsterID +'speed:'+this.crSpeed+'do:'+skill.kType+"num:"+skill.effNum);
        switch (skill.kType) {
            case 0:
                await this.moveAI(skill.range);
                let type:cardType;
                if (skill.range > 3) {
                    type = cardType.DISTANCE_ATK;
                } else {
                    type = cardType.CLOSE_ATK;
                }
                this.monsterAtkFun(type,skill);
                // animTime = this.fightAnim.getState('atkback').duration
                break;
            case 1:
                this.addDefFun(skill);
                // animTime = this.fightAnim.getState('shield').duration
                break;
            case 2:
                this.addHpFun(skill.initNum);
                break;
            default:
                break;
        }
    }

    //多monster时 根据stand 显示上排列
    monsterToPosition(targetPosi:Vec3){
        tween(this.node)
        .to(0.25,{position:targetPosi})
        .call(()=>{
            this.setStartPosition();
        })
        .start()
    }

    doMonsterMove(move:number){
        super.moveFun();
        let hStand = this._mianSecene.getHeroStand();
        let endStand = this.stand - move;
        if (typeof hStand == 'number') {
            if ( endStand > hStand) { //hero移动不能越过最近的敌人
                this.stand = endStand
            } else {
                this.stand = hStand + 1;
            }
        }
        this.showDistance();
        this._mianSecene.monsterMoveFinished();
    }

    monsterBeenHit(monID:number,skill:effectObj){
        if (monID!=null && skill!=null) {
            if (this._monsterID == monID) {
                let dis = this.getDistanceFormHero();
                if (skill.range >= dis) {
                    if (skill.kType == skillType.ATTACK) {
                        this.dealWithDamage(skill.effNum);
                    }else if (skill.kType == skillType.STUN) {
                        this.beenStunnedFun(skill);
                    }
                } else {
                    //攻击范围外 处理未击中效果
                    this.missAnim();
                }
            }
        }
    }

    beenStunnedFun(skill:effectObj){
        super.beenStunnedFun(skill);
        this.beenStunnedRound = this._mianSecene.getMonsterRound();
    }

    getDistanceFormHero():number{
        let heroStand = this._mianSecene.getHeroStand();
        let distance:number = Math.abs(heroStand - this.stand);
        return distance;
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

