import { _decorator, Component, Node } from 'cc';
import { card } from './card';
const { ccclass, property } = _decorator;

@ccclass('cardsPanel')
export class cardsPanel extends Component {
    @property(Node)
    content:Node = null;

    @property(Node)
    bgNode:Node = null;
    
    // private cardsArray:card[]=[];

    protected onEnable(): void {
        this.bgNode.on(Node.EventType.TOUCH_START, this.onTouchBegin, this)
    }

    protected onDisable(): void {
        this.bgNode.off(Node.EventType.TOUCH_START, this.onTouchBegin, this)
    }

    onTouchBegin(){
        this.node.active = false;
    }

    addOneCard(card:card){
        this.content.addChild(card.node);
    }

    removeAllCards(){
        this.content.removeAllChildren();
    }

    start() {
        
    }

    addToContentByArray(cards:card[]){
        this.content.removeAllChildren();
        cards.forEach((_card)=>{
            this.content.addChild(_card.node);
        })
    } 
    
}

