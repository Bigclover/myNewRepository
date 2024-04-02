import { _decorator, Component, EventTouch, Label, Layout, Node, Rect, Sprite, tween, UITransform, Vec2, Vec3 } from 'cc';
import { deckObj } from './deckData';
import { hero } from './hero';
const { ccclass, property } = _decorator;

@ccclass('card')
export class card extends Component {
    @property(Sprite)
    bgSprite:Sprite = null;

    @property(Sprite)
    imgSprite:Sprite = null;

    @property(Label)
    nameLabel:Label = null;

    @property(Label)
    tagLabel:Label = null;

    @property(Label)
    numLabel:Label = null;


    cardID:number = 0;
    cardName:string = '';
    cardTag:string = '';
    cardNum:number = 0; 
    cardDesc:string = '';
    private bondRect:Rect = null;
    private _startPosition:Vec3=null;
    private releaseRect:Rect = null;
    private _heroCom:hero = null;
    private _startSibling:number = 0;
    private _isCanTouch:boolean = true;

    protected onEnable(): void {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchBegin, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    protected onDisable(): void {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchBegin, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    init(id:number,deckObj:deckObj,mc:hero){
        this.cardID = id;
        this.cardName = deckObj.cardName;
        this.cardTag = deckObj.baseEffect[0].tag;
        this.cardNum = deckObj.baseEffect[0].num; 
        this.cardDesc = deckObj.descr;
        this._heroCom = mc;
    }

    protected onLoad(): void {
        this.setCardFace(false);
    }

    start() {
        this.nameLabel.string = this.cardName;
        this.tagLabel.string = this.cardTag;
        this.numLabel.string = this.cardNum.toString();

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

    setCardFace(isShow:boolean){
        this.nameLabel.node.active = isShow;
        this.tagLabel.node.active = isShow;
        this.numLabel.node.active = isShow;
        this.imgSprite.node.active = isShow;
        this.bgSprite.node.active = !isShow;
    }

    sendSelfToHero(){
        this._heroCom.receiveCard(this);
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
        this._isCanTouch = false;
        const endlocation = event.getUILocation(); 
        let isContain:boolean = this.releaseRect.contains(endlocation);
        if (isContain) {
            this.sendSelfToHero();
        }else{
            this.backToStartPosition();
        }
    }

    backToStartPosition(){
        tween(this.node)
        .to(0.2,{position:this._startPosition},{ easing: 'quartIn'})
        .call(()=>{
            this.node.setSiblingIndex(this._startSibling);
            this._isCanTouch = true;
        })
        .start()
    }

    showFaceAnim(){
        return new Promise<void>((resolve)=>{
            tween(this.node)
            .to(0.2,{scale:new Vec3(0,1,1)})
            .call(()=>{
                //当有卡背卡面之分时 这时也要设置卡面sprite显示
                this.setCardFace(true);
            })
            .to(0.2,{scale:new Vec3(1,1,1)})
            .call(()=>{
                resolve();
            })
            .start();
        })
    }

    moveToHandAnim(){
        return new Promise<void>((resolve)=>{
            tween(this.node)
            .by(0.2,{position:new Vec3(450,0,0)})
            .call(()=>{
                resolve();
            })
            .start();
        })
    }

    update(deltaTime: number) {
        
    }
}

