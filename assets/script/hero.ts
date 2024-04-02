import { _decorator, Component, instantiate, Layout, Node, Prefab } from 'cc';
import { card } from './card';
import  deckData, { deckObj }  from './deckData';
import { creature } from './creature';
import { ListenerManager } from '../event/ListenerManager';

const { ccclass, property } = _decorator;

@ccclass('hero')
export class hero extends creature {
    @property({type:Prefab})
    cardPrefab:Prefab = null;

    @property(Node)
    allDeckNode:Node= null;

    @property(Layout)
    cardLayout:Layout = null;

    private _allCardsArray:card[]=[];
    private _handCardsArray:card[]=[];
    private _discardArray:card[]=[];

    start() {
        super.start();
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

    receiveCard(card:card){
        card.node.removeFromParent()
        this._discardArray.push(card);
        this.sendHitMessageToMonster(card.cardNum)

        this.refreshCardsArrangement();
    }

    sendHitMessageToMonster(cardNum:number){
        console.log('sendHitMessageToMonster=',-cardNum);
        ListenerManager.dispatch('hitMonster',0,-cardNum);
    }

    update(deltaTime: number) {
        // super.update(deltaTime);

    }
}

