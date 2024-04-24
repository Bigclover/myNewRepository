import { _decorator, Component, EventTouch, instantiate, Label, Layout, Node, Prefab, Rect, Sprite, tween, UITransform, Vec3 } from 'cc';
import { cardType, deckObj, effectObj} from './gameConfing';
import { deckConteroler } from './deckConteroler';
import { skillType } from './gameConfing';
import AssetsManger from '../assetsManager/AssetsManger';
import { Skill } from './Skill';
const { ccclass, property } = _decorator;

@ccclass('card')
export class card extends Component {
    // @property(Sprite)
    // bgSprite:Sprite = null;

    @property(Sprite)
    imgSprite:Sprite = null;

    @property(Label)
    nameLabel:Label = null;

    @property(Node)
    skillPanel:Node = null;

    @property({type:Prefab})
    skillPrefab:Prefab = null;

    @property(Label)
    descLabel:Label = null;

    private cardType:cardType;
    cardID:number = 0;
    cardName:string = '';
    cardSkills:effectObj[]=[];
    isOneoff:boolean = false;
    cardDesc:string = '';
    private bondRect:Rect = null;
    private _startPosition:Vec3=null;
    private releaseRect:Rect = null;
    private _deckControler:deckConteroler = null;
    private _startSibling:number = 0;
    private _isCanTouch:boolean = false;
    private _skillRange:number = 0;
    private _isStable:boolean = false;
    private _consumption:number = 0;

    public setTouchable(isCanTouch:boolean): void {
        if (isCanTouch) {
            this.node.on(Node.EventType.TOUCH_START, this.onTouchBegin, this);
            this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        } else {
            this.node.off(Node.EventType.TOUCH_START, this.onTouchBegin, this);
            this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        }
        this._isCanTouch = isCanTouch;
    }

    init(id:number,_deckObj:deckObj,mc:deckConteroler){
        this.cardType = _deckObj.cardType;
        this.cardID = id;
        this.cardName = _deckObj.cardName;
        this.isOneoff = _deckObj.isOneoff;
        this._isStable = _deckObj.isStable;
        this._consumption = _deckObj.consumption;
        this.cardSkills = [..._deckObj.baseEffect];
        this.cardDesc = _deckObj.descr;
        this._deckControler = mc;
    }

    protected onLoad(): void {

    }

    start() {
        this.nameLabel.string = this.cardName //+"ID:"+this.cardID;
        if (this._isStable) {
            this.nameLabel.string = this.cardName+'(固定)';
        }
        this.cardSkills.forEach((skill)=>{
            let _skill = instantiate(this.skillPrefab);
            _skill.getComponent(Skill).init(skill.kType,skill.effNum);
            this.skillPanel.addChild(_skill);
            if (skill.kType == skillType.ATTACK) {
                this._skillRange = skill.range;
                this.nameLabel.string = this.cardName+'(R:'+this._skillRange+')';

                if (this.cardType == cardType.DISTANCE_ATK) {
                    this.descLabel.string = this.cardDesc+skill.initNum;
                }
            }
        })

        if (this.isOneoff) {//如果是一次性卡牌 加入shader效果
            AssetsManger.instance.loadMaterial("SpriteAblation","shader").then((mData)=>{
                this.imgSprite.customMaterial = mData;
                this.nameLabel.customMaterial = mData;
                this.skillPanel.children.forEach((child)=>{
                    let _skill = child.getComponent(Skill)
                    _skill.setMaterialFun(mData);
                })
            })
        }

        //可移动区
        let _rect:Node = this.node.parent.parent.getChildByName('moveContrlRect')
        if (_rect) {
            this.bondRect = _rect.getComponent(UITransform).getBoundingBoxToWorld()
        }
        //卡牌释放区
        let _rect1:Node = this.node.parent.parent.getChildByName('releaseRect')
        if (_rect1) {
            this.releaseRect = _rect1.getComponent(UITransform).getBoundingBoxToWorld()
        }
    }

    getCardType():cardType{
        return this.cardType;
    }

    getCardConsumption():number{
        return this._consumption;
    }

    getCardStableTag():boolean{
        return this._isStable;
    }

    removeFromBattle(){
        return new Promise<void>((resolve)=>{
            let interval = 0.01;// 以秒为单位的时间间隔
            let repeat = 100-1;// 重复次数
            let delay = 0.1;// 开始延时
            let _value = 0;
            let sch;
            this.schedule(sch = ()=> {
                _value += 0.01;
                let val =  _value * 1.0;
                if (_value >= 0.99) {
                    this.unschedule(sch);
                    this.node.removeFromParent();
                    this.node.destroy();
                    resolve();
                    return;
                }
                this.imgSprite.getRenderMaterial(0)!.setProperty('noiseThreshold',val);
            }, interval, repeat, delay);
        })
        
    }

    adjustCardByHero(_type:skillType,effectNum:number,mute:boolean){
        this.cardSkills.forEach((skill)=>{
            if (skill.kType == _type) {
                skill.effNum = skill.initNum + effectNum;
                if (this.cardType == cardType.DISTANCE_ATK && mute) {
                    skill.effNum = 0;
                }
                this.adjustSkillDisplay(_type,skill.effNum);
            }
        })
    }

    adjustSkillDisplay(_type:skillType,num:number){
        this.skillPanel.children.forEach((child)=>{
            let _skill = child.getComponent(Skill)
            if (_skill.skillType == _type) {
                _skill.setSkillNum(num);
            }
        })
    }

    // setCardFace(isShow:boolean){
    //     this.nameLabel.node.active = isShow;
    //     this.typeSprite.node.active = isShow;
    //     this.numLabel.node.active = isShow;
    //     this.imgSprite.node.active = isShow;
    //     this.bgSprite.node.active = !isShow;
    // }

    reSetSelf(){
        this.node.setPosition(0,0,0);
        this.node.setScale(new Vec3(1,1,1));
        this.setTouchable(false);
    }

    sendSelfToConteroler(){
        this._deckControler.receiveCard(this);
    }

    setStartPosition(){
        this._startPosition = this.node.getPosition()
        this._startSibling = this.node.getSiblingIndex();
    }

    onTouchBegin(event:EventTouch){
        if (!this._isCanTouch) {
            return;
        }
        let _sIndex:number = this.node.parent.children.length;
        this.node.parent.getComponent(Layout).enabled = false;
        this.node.setSiblingIndex(_sIndex);
        this.node.setScale(new Vec3(1.3,1.3,1));
    }

    onTouchMove(event:EventTouch){
        if (!this._isCanTouch) {
            return;
        }
        const location = event.getUILocation(); 
        let isContain:boolean = this.bondRect.contains(location);
        if (isContain) {
            this.node.setWorldPosition(location.x, location.y, 0);
        }
    }

    onTouchEnd(event:EventTouch){
        if (!this._isCanTouch) {
            return;
        }
        this._isCanTouch = false;
        const endlocation = event.getUILocation(); 
        let isContain:boolean = this.releaseRect.contains(endlocation);
        if (isContain) {
            this.sendSelfToConteroler();
        }else{
            this.backToStartPosition();
        }
    }

    backToStartPosition(){
        tween(this.node)
        .parallel(
            tween().to(0.2,{position:this._startPosition},{ easing: 'quartIn'}),
            tween().to(0.2,{scale:new Vec3(1,1,1)},{ easing: 'quartIn'})
        )
        .call(()=>{
            this.node.setSiblingIndex(this._startSibling);
            this._isCanTouch = true;
        })
        .start()
    }

    // showFaceAnim(){
    //     return new Promise<void>((resolve)=>{
    //         tween(this.node)
    //         .to(0.2,{scale:new Vec3(0,1,1)})
    //         .call(()=>{
    //             this.setCardFace(true);
    //         })
    //         .to(0.2,{scale:new Vec3(1,1,1)})
    //         .call(()=>{
    //             resolve();
    //         })
    //         .start();
    //     })
    // }

    moveToHandAnim(){
        return new Promise<void>((resolve)=>{
            tween(this.node)
            .by(0.25,{position:new Vec3(450,0,0)},{ easing: 'quartIn'})
            .call(()=>{
                resolve();
            })
            .start();
        })
    }

    async surplusCardLeave(){
        await this.moveUpAnim();
        await this.moveToDiscardPile();
    }

    moveToDiscardPile(){
        return new Promise<void>((resolve)=>{
            //不同2dUI 坐标系之间的转换
            let enPosi:Vec3 = this._deckControler.discardNode.worldPosition;
            let locPosi:Vec3 = this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(enPosi);
            tween(this.node)
            .parallel(
                tween().to(0.5,{position:locPosi},{ easing: 'quartIn'}),
                tween().to(0.5,{scale:new Vec3(0.2,0.2,1)},{ easing: 'quartIn'})
            )
            .call(()=>{
                resolve();
            })
            .start();
        })
    }

    moveUpAnim(){
        return new Promise<void>((resolve)=>{
            tween(this.node)
            .by(0.25,{position:new Vec3(0,50,0)})
            .call(()=>{
                resolve();
            })
            .start();
        })
    }

    update(deltaTime: number) {
        
    }

    protected onDestroy(): void {
        
    }
}

