import { _decorator, Component, instantiate, Label, Layout, Node, Prefab } from 'cc';
import { card } from './card';
import  deckData from './deckData';
import { hero } from './hero';
import { CardType, deckObj } from './gameConfing';
import { cardsPanel } from './cardsPanel';

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

    @property({type:Prefab})
    discardPanelPrefab:Prefab = null;

    private _allCardsArray:card[]=[];
    private _handCardsArray:card[]=[];
    private _discardArray:card[]=[];
    private _shuffleArray:card[]=[];
    private _mHero:hero = null;
    private dpp:Node = null;

    initSelf(_hero:hero){
        this._mHero = _hero;
    }

    start() {
        this.setDeckByDeckData();
        this.addDppFun();
    }

    addDppFun(){
        this.dpp = instantiate(this.discardPanelPrefab);
        this.dpp.active = false;
        this.dpp.setPosition(this.dpp.position.x,this.dpp.position.y + 150);
        this.node.addChild(this.dpp)
    }

    endTurnButton(){
        this.checkRemianHandCards(this._mHero.remainCardsAbility);
    }

    checkRemianHandCards(_num:number){
        let _len:number = this._handCardsArray.length
        if(_len > _num){
            let surplus = _len - _num;
            for (let i = 0; i < surplus; i++) {
                let _card:card = this.randomArray<card>(this._handCardsArray);
                this.receiveCard(_card,false);
            }
            this.scheduleOnce(()=>{
                this._mHero.heroEndTurn();
            },0.8)
        }else{
            this._mHero.heroEndTurn();
        }
    }

    drawCardsFromAll(drawNum:number){
        if (this._allCardsArray.length < drawNum) {
            this.discardPileBacktoAll();
        }
        let interval = 0.4;// 以秒为单位的时间间隔
        let repeat = drawNum-1;// 重复次数
        let delay = 0.5;// 开始延时
        this.schedule(function() {
            this.getTopOneCardToHand();
        }, interval, repeat, delay);
    }

    discardPileBacktoAll(){
        this._discardArray.forEach((_card)=>{
            _card.reSetSelf()
            _card.node.removeFromParent();
        })
        this._shuffleArray = [...this._discardArray];
        this._discardArray = [];
        this.showDiscardNum();
        this.shuffleCards();
    }

    setDeckByDeckData(){
        let dobArry:deckObj[]= deckData.instance.getDeckData();
        for (let i = 0; i < dobArry.length; i++) {
             this.addToShuffleArray(i,dobArry[i]);
        }

        this.shuffleCards();
     }

    addToShuffleArray(id:number,_dob:deckObj){
        let cardIns = instantiate(this.cardPrefab);
        let cardCom:card = cardIns.getComponent(card);
        cardCom.init(id,_dob,this);
        this._shuffleArray.push(cardCom);
    }

    adjustAllCardsByHero(_type:CardType,effectNum:number){
        if (this._allCardsArray.length > 0) {
            this._allCardsArray.forEach(_crad => {
                _crad.adjustCardByHero(_type,effectNum);
            });
        }
        if (this._handCardsArray.length > 0) {
            this._handCardsArray.forEach(_crad => {
                _crad.adjustCardByHero(_type,effectNum);
            });
        }
        if (this._discardArray.length > 0) {
            this._discardArray.forEach(_crad => {
                _crad.adjustCardByHero(_type,effectNum);
            });
        }
    }

    async getTopOneCardToHand(){
        if (this._allCardsArray.length<=0) {
            console.log ('pile of the cards is empty');
            return;
        }
        let topCard:card = this._allCardsArray.pop();
        this.leftNumLabel.string = this._allCardsArray.length.toString();
        // await topCard.showFaceAnim();
        await topCard.moveToHandAnim();

        topCard.node.parent = this.cardLayout.node;
        this._handCardsArray.push(topCard);
        topCard.setTouchable(true);

        this.refreshCardsArrangement();
    }

     refreshCardsArrangement(){
        this.cardLayout.enabled = true;
        this.cardLayout.updateLayout();
        this._handCardsArray.forEach((cardCom)=>{
             cardCom.setStartPosition();
        })
     }

    async receiveCard(card:card,isEnforce:boolean = true){
        this.removeItemFormArray<card>(card,this._handCardsArray);
        if (isEnforce) {
            this.enforceCardByType(card);
            if (card.isOneoff) {
                //删除一次性效果卡牌不进入discard，是否可以实现烧牌效果
                await card.removeFromBattle();
                this.refreshCardsArrangement();
                return;
            }
        } else {
            await card.moveUpAnim()
        }
        await card.moveToDiscardPile();
        card.node.removeFromParent();
        card.reSetSelf();
        this._discardArray.push(card);
        this.dpp.getComponent(cardsPanel).addOneCard(card);
        this.showDiscardNum();

        this.refreshCardsArrangement();
    }

    showDiscardNum(){
        //弃牌显示
        let counterLabel:Label = this.discardNode.getChildByName('counter').getComponent(Label);
        counterLabel.string = this._discardArray.length.toString();
    }

    showDiscardPanel(){
        this.dpp.active = true;
    }

    enforceCardByType(card:card){
        switch (card.cardType) {
            case CardType.ATTACK:
                this._mHero.doHeroAtk(card.effeNum);
                break;
            case CardType.DEFEND:
                this._mHero.addDefFun(card.cardNum);
                break;
            case CardType.REVIVE:
                this._mHero.addHpFun(card.cardNum);
                break;
            case CardType.DRAWCARD:
                this._mHero.drawCardsByCard(card.cardNum);
                break;
            case CardType.EFFECT_ATK:
                this._mHero.addEffectAtk(card.cardNum);
                break;    
            default:
                
                break;
        }
    }

    update(deltaTime: number) {
        
    }

    shuffleCards(){
        let length:number = this._shuffleArray.length;
        for (let i = 0; i < length; i++) {
            let randomCard:card = this.randomArray<card>(this._shuffleArray);
            this.removeItemFormArray<card>(randomCard,this._shuffleArray);
            this._allCardsArray.push(randomCard);
            this.allDeckNode.addChild(randomCard.node);   
        }
        this.leftNumLabel.string = this._allCardsArray.length.toString();   
    }

    removeItemFormArray<T>(item:T,arr:T[]){
        let index = arr.indexOf(item);
        if (index > -1) {
            arr.splice(index,1);
        }
    }

    /**
     在一个数组中随机获取一个元素
     @param arr 数组
     @returns {any} 随机出来的结果
     */
     public randomArray<T>(arr: T[]): T {
        var index: number = Math.floor(Math.random() * arr.length);
        return arr[index];
    }

}

