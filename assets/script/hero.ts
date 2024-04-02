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

    @property(Layout)
    cardLayout:Layout = null;

    private _allCardsArray:card[]=[];
    private _handCardsArray:card[]=[];
    private _discardArray:card[]=[];

    start() {
        super.start();
        this.scheduleOnce(()=>{
            this.setDeckByDeckData();
        },1)
    }

    setDeckByDeckData(){
        let dobArry:deckObj[]= deckData.instance.getDeckData();
        for (let i = 0; i < dobArry.length; i++) {
             this.addCardToDeckLayer(i,dobArry[i]);
        }
        this.refreshCardsArrangement();
     }

     refreshCardsArrangement(){
        this.cardLayout.enabled = true;
        this.cardLayout.updateLayout();
        this._handCardsArray.forEach((cardCom)=>{
             cardCom.setStartPosition();
        })
     }
 
     addCardToDeckLayer(id:number,_dob:deckObj){
         let cardIns = instantiate(this.cardPrefab);
         let cardCom:card = cardIns.getComponent(card);
         cardCom.init(id,_dob,this);
         this.cardLayout.node.addChild(cardIns);
         this._handCardsArray.push(cardCom);
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

