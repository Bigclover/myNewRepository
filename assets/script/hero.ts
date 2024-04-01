import { _decorator, Component, instantiate, Layout, Node, Prefab } from 'cc';
import { card } from './card';
import  deckData, { deckObj }  from './deckData';
import { creature } from './creature';

const { ccclass, property } = _decorator;

@ccclass('hero')
export class hero extends creature {
    @property({type:Prefab})
    cardPrefab:Prefab = null;

    @property(Layout)
    cardLayout:Layout = null;

    private _myCardsArray:card[]=[];

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
        this.cardLayout.updateLayout();
        this._myCardsArray.forEach((cardCom)=>{
             cardCom.setStartPosition();
        })
     }
 
     addCardToDeckLayer(id:number,_dob:deckObj){
         let cardIns = instantiate(this.cardPrefab);
         let cardCom:card = cardIns.getComponent(card);
         cardCom.init(id,_dob);
         this.cardLayout.node.addChild(cardIns);
         this._myCardsArray.push(cardCom);
     }

    update(deltaTime: number) {
        // super.update(deltaTime);

    }
}

