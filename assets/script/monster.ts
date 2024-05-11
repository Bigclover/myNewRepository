import { Label, Layout, Node, Prefab, Tween, Vec3, _decorator, instantiate, tween} from 'cc';
import { creature } from './creature';
import { ListenerManager } from '../event/ListenerManager';
import { mainSecene } from './mainSecene';
import { cardType, effectObj, monInfo, skillType } from './gameConfing';
import { monsterInfoUi } from './monsterInfoUi';
import { Skill } from './Skill';

const { ccclass, property } = _decorator;


@ccclass('monster')
export class monster extends creature {
    @property(Label)
    distanceLabel:Label = null;

    @property(Node)
    checkNode:Node = null;

    @property(Node)
    touchNode:Node = null;

    @property(Prefab)
    infoPre:Prefab = null;

    @property(Layout)
    useSkillLayout:Layout = null;

    @property({type:Prefab})
    skillPrefab:Prefab = null;

    private _monsterID:number = 0;
    private _mianSecene:mainSecene = null;
    private _monsterName:string = '';
    private _skillsArray:effectObj[]=[];
    private _previousDistance:number = 0;
    private _mMoveAbility:number = 0;
    private _curPosition:Vec3;
    private _mInfo:monInfo = null;
    private _infoNode:Node = null;
    // private _touchTime: number = 0;
    // private _longTapTime: number = 300;
    private _useSkill:effectObj=null;

    protected onEnable(): void {
        ListenerManager.on('hitMonster',this.monsterBeenHit,this);

        this.touchNode.on(Node.EventType.TOUCH_START, this.onTouchBegin, this);
        this.touchNode.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.touchNode.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    protected onDisable(): void {
        ListenerManager.off('hitMonster',this.monsterBeenHit,this);

        this.touchNode.off(Node.EventType.TOUCH_START, this.onTouchBegin, this);
        this.touchNode.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.touchNode.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
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
        this._mInfo = monsterInfo;
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
            if (self.distanceLabel) {
                self.distanceLabel.string = Math.ceil(start+ (end - start)*ratio).toString();
            }
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
        super.creatureRoundStart(this._mianSecene.getMonsterRound())

        //伤害性检测在这之前 
        if (this.crCurHp <= 0) {
            return;
        }

        let stateStun = this.getStateEffByType(skillType.STUN);
        if (stateStun) {
           let isStunned = stateStun.checkEffectState(this._mianSecene.getMonsterRound());
           if (!isStunned) {
                this.scheduleOnce(()=>{
                    this.monsterAI();
                },0.25)
            }
        }else{
            this.scheduleOnce(()=>{
                this.monsterAI();
            },0.25)
        }
    }

    createInfoUi(){
        this._infoNode = instantiate(this.infoPre)
        this._infoNode.getComponent(monsterInfoUi).init(this._mInfo);
        this.node.addChild(this._infoNode);
    }

    onTouchBegin(){
        this.createInfoUi();
        // this._touchTime = Date.now();
    }

    onTouchEnd(){
        this._infoNode.destroy();
        this._infoNode = null;
        // if (Date.now() > (this._touchTime + this._longTapTime)) {
        //     //长按
        // } else {
        // }
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
                this.scheduleOnce(()=>{ resolve() },0.25);
            }else if (range/2 > dis) {
                this.doMonsterMove(-this._mMoveAbility);
                this.scheduleOnce(()=>{ resolve() },0.25);
            }else{
                resolve();
            }
        })
    }

    showComingSkill(){
        this.useSkillLayout.node.removeAllChildren();
        this._useSkill = null;

        this._useSkill = this.choseSkill();
        let _skill = instantiate(this.skillPrefab);
        _skill.getComponent(Skill).init(this._useSkill,true);
        this.useSkillLayout.node.addChild(_skill);
    }

    choseSkill():effectObj{
        let _index:number = 0;
        if (this.crCurHp >= this.crMaxHp*0.6) {//只使用攻击或防御
            _index = Math.floor(Math.random() * (this._skillsArray.length-1));
        }else{
            _index = Math.floor(Math.random() * this._skillsArray.length);
        }
        console.log("skill index = ",_index);
        return this._skillsArray[_index];
    }

    async monsterAI(){
        // let skill:effectObj = this.choseSkill();
        // console.log('ID:'+this._monsterID +'speed:'+this.crSpeed+'do:'+skill.kType+"num:"+skill.effNum);
        switch (this._useSkill.kType) {
            case skillType.ATTACK:
                if (!this.isTangled) {
                    await this.moveAI(this._useSkill.range);
                }
                let type:cardType;
                if (this._useSkill.range > 3) {
                    type = cardType.DISTANCE_ATK;
                } else {
                    type = cardType.CLOSE_ATK;
                }
                this.monsterAtkFun(type,this._useSkill);
                // animTime = this.fightAnim.getState('atkback').duration
                break;
            case skillType.DEFEND:
                this.setEffect(this._useSkill);
                // animTime = this.fightAnim.getState('shield').duration
                break;
            case skillType.REVIVE:
                this.addHpFun(this._useSkill.initNum);
                break;
            case skillType.POISON:
                this.monsterAtkFun(type,this._useSkill);
                break;
            default:
                break;
        }

        this.useSkillLayout.node.removeAllChildren();
        this._useSkill = null;
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
                if (skill.kType == skillType.ATTACK) {
                    let dis = this.getDistanceFormHero();
                    if (skill.range >= dis) {
                        this.dealWithDamage(skill.effNum);
                    } else {
                        //攻击范围外 处理未击中效果
                        this.missAnim();
                    }
                }else if (skill.kType == skillType.POISONEXECUTE) {
                    this.effectExecutedBySkill(skill);
                }else{
                    this.setEffect(skill,true);
                }
            }
        }
    }

    setEffect(skill:effectObj,formHero:boolean = false){
        let begin:number;
        if (formHero) {
            begin = this._mianSecene.getMonsterRound()+1;
        } else {
            begin = this._mianSecene.getMonsterRound();
        }
        super.addEffectToCreature(skill,begin);

        if (skill.kType == skillType.POISON) {
            this._mianSecene.updatePoisonExecuteNum(this.getMonsterID());
        }
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

    protected onDestroy(): void {
        Tween.stopAll();
        this.unscheduleAllCallbacks();
    }
}

