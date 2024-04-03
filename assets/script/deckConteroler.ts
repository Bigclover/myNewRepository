import { _decorator, Component, instantiate, Label, Layout, Node, Prefab } from 'cc';
import { card } from './card';
import  deckData, { deckObj }  from './deckData';
import { ListenerManager } from '../event/ListenerManager';

const { ccclass, property } = _decorator;

@ccclass('deckConteroler')
export class deckConteroler extends Component {
    @property({type:Prefab})
    cardPrefab:Prefab = null;

    @property(Node)
    allDeckNode:Node= null;

    @property(Layout)
    cardLayout:Layout = null;

    @property(Node)
    discardNode:Node= null;

    private _allCardsArray:card[]=[];
    private _handCardsArray:card[]=[];
    private _discardArray:card[]=[];

    start() {
        this.setDeckByDeckData();

        this.schedule(()=>{
            this.getTopOneCardToHand();
        },0.4,3,1)
    }

    setDeckByDeckData(){
        let dobArry:deckObj[]= deckData.instance.getDeckData();
        for (let i = 0; i < dobArry.length; i++) {
             this.addToAllCardsArray(i,dobArry[i]);
        }
     }

     addToAllCardsArray(id:number,_dob:deckObj){
        let cardIns = instantiate(this.cardPrefab);
        let cardCom:card = cardIns.getComponent(card);
        cardCom.init(id,_dob,this);
        this._allCardsArray.push(cardCom);
        this.allDeckNode.addChild(cardIns);
    }

    async getTopOneCardToHand(){
        let topCard:card = this._allCardsArray.pop();
        await topCard.showFaceAnim();
        await topCard.moveToHandAnim();

        topCard.node.removeFromParent();
        this.cardLayout.node.addChild(topCard.node);
        this._handCardsArray.push(topCard);

        this.refreshCardsArrangement();
    }

     refreshCardsArrangement(){
        this.cardLayout.enabled = true;
        this.cardLayout.updateLayout();
        this._handCardsArray.forEach((cardCom)=>{
             cardCom.setStartPosition();
        })
     }

    async receiveCard(card:card){
        this.enforceCardByType(card);
        await card.moveToDiscardPile();
        card.node.removeFromParent()
        this._discardArray.push(card);
        //弃牌显示
        let counterLabel:Label = this.discardNode.getChildByName('counter').getComponent(Label);
        counterLabel.string = this._discardArray.length.toString();

        this.refreshCardsArrangement();
    }

    enforceCardByType(card:card){
        switch (card.cardType) {
            case 0:
                let atkNum:number = -card.cardNum;
                this.sendHitMessageToMonster(atkNum);
                break;
            case 1:
                let defNum:number = card.cardNum;
                
                break;
            case 2:
                
                break;
            default:
                
                break;
        }
    }

    sendHitMessageToMonster(atkNum:number){
        //hitMonster,monsterID,atkNum
        ListenerManager.dispatch('hitMonster',0,atkNum);
    }

    update(deltaTime: number) {
        
    }
}

