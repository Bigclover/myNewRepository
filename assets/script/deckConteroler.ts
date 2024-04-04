import { _decorator, Component, instantiate, Label, Layout, Node, Prefab } from 'cc';
import { card } from './card';
import  deckData, { deckObj }  from './deckData';
import { ListenerManager } from '../event/ListenerManager';
import { hero } from './hero';

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

    @property(Label)
    leftNumLabel:Label = null;

    private _allCardsArray:card[]=[];
    private _handCardsArray:card[]=[];
    private _discardArray:card[]=[];
    private _mHero:hero = null;

    initSelf(_hero:hero){
        this._mHero = _hero;
    }

    start() {
        this.setDeckByDeckData();
        this.leftNumLabel.string = this._allCardsArray.length.toString();
        this.drawCardsFromAll(this._mHero.drawCardsAbility);
    }

    endTurnButton(){
        this._mHero.heroEndTurn();
    }

    drawCardsFromAll(drawNum:number){
        let interval = 0.4;// 以秒为单位的时间间隔
        let repeat = drawNum-1;// 重复次数
        let delay = 0.5;// 开始延时
        let callback = this.schedule(function() {
            this.getTopOneCardToHand();
        }, interval, repeat, delay);
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
        if (this._allCardsArray.length<=0) {
            console.log ('pile of the cards is empty');
            return;
        }
        let topCard:card = this._allCardsArray.pop();
        this.leftNumLabel.string = this._allCardsArray.length.toString();
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
                let atkNum:number = card.cardNum;
                this.sendHitMessageToMonster(atkNum);
                break;
            case 1:
                let defNum:number = card.cardNum;
                this._mHero.addDefFun(defNum);
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

