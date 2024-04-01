import { _decorator, Component, EventTouch, Label, Node, Rect, tween, UITransform, Vec2, Vec3 } from 'cc';
import { deckObj } from './deckData';
const { ccclass, property } = _decorator;

@ccclass('card')
export class card extends Component {
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

    init(id:number,deckObj:deckObj){
        this.cardID = id;
        this.cardName = deckObj.cardName;
        this.cardTag = deckObj.baseEffect[0].tag;
        this.cardNum = deckObj.baseEffect[0].num; 
        this.cardDesc = deckObj.descr;
    }

    start() {
        this.nameLabel.string = this.cardName;
        this.tagLabel.string = this.cardTag;
        this.numLabel.string = this.cardNum.toString();

        let _rect:Node|null = this.node.parent.parent.getChildByName('moveContrlRect')
        if (_rect) {
            this.bondRect = _rect.getComponent(UITransform).getBoundingBoxToWorld()
        }
        
        
    }

    setStartPosition(){
        this._startPosition = this.node.getPosition()
    }

    onTouchBegin(event:EventTouch){
        

    }

    onTouchMove(event:EventTouch){
        const location = event.getUILocation(); 
        let isContain:boolean = this.bondRect.contains(location);
        if (isContain) {
            this.node.setWorldPosition(location.x, location.y, 0);
        }
    }

    onTouchEnd(event:EventTouch){
        this.backToStartPosition();
    }

    backToStartPosition(){
        tween(this.node)
        .to(0.2,{position:this._startPosition},{ easing: 'quartIn'})
        .call(()=>{

        })
        .start()
    }

    update(deltaTime: number) {
        
    }
}

