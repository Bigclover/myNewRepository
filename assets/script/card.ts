import { _decorator, Component, EventTouch, Label, Layout, Node, Rect, resources, Sprite, SpriteFrame, tween, UITransform, Vec2, Vec3 } from 'cc';
import { deckObj } from './deckData';
import { deckConteroler } from './deckConteroler';
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
    numLabel:Label = null;

    @property(Sprite)
    typeSprite:Sprite = null;


    cardID:number = 0;
    cardName:string = '';
    cardType:number = 0;
    cardNum:number = 0; 
    cardDesc:string = '';
    private bondRect:Rect = null;
    private _startPosition:Vec3=null;
    private releaseRect:Rect = null;
    private _deckControler:deckConteroler = null;
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

    init(id:number,deckObj:deckObj,mc:deckConteroler){
        this.cardID = id;
        this.cardName = deckObj.cardName;
        this.cardType = deckObj.baseEffect[0].type;
        this.cardNum = deckObj.baseEffect[0].num; 
        this.cardDesc = deckObj.descr;
        this._deckControler = mc;
    }

    protected onLoad(): void {
        this.setCardFace(false);
    }

    start() {
        this.nameLabel.string = this.cardName;
        this.numLabel.string = this.cardNum.toString();
        let typePatch:string = this.getImgPatchByType(this.cardType);
        resources.load(typePatch, SpriteFrame, (err, spriteFrame) => {
            this.typeSprite.spriteFrame = spriteFrame;
            this.typeSprite.spriteFrame.addRef();
        });
        

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

    getImgPatchByType(type:number):string{
        let _patch:string = '';
        switch (type) {
            case 0:
                _patch = 'atk';
                break;
            case 1:
                _patch = 'def';
                break;
            case 2:
                _patch = 'life';
                break;
            default:
                _patch = 'atk';
                break;
        }
        _patch = `img/cardType/${_patch}/spriteFrame`;
        return _patch;
    }

    setCardFace(isShow:boolean){
        this.nameLabel.node.active = isShow;
        this.typeSprite.node.active = isShow;
        this.numLabel.node.active = isShow;
        this.imgSprite.node.active = isShow;
        this.bgSprite.node.active = !isShow;
    }

    sendSelfToHero(){
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
            .by(0.2,{position:new Vec3(450,0,0)},{ easing: 'quartIn'})
            .call(()=>{
                resolve();
            })
            .start();
        })
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

    update(deltaTime: number) {
        
    }

    protected onDestroy(): void {
        this.typeSprite.spriteFrame.decRef();
        this.typeSprite.spriteFrame=null;
    }
}

