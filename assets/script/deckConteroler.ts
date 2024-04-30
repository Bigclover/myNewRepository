import { _decorator, Component, instantiate, Label, Layout, Node, Prefab } from 'cc';
import { card } from './card';
import  deckData from './deckData';
import { hero } from './hero';
import { skillType, deckObj, effectObj, cardType } from './gameConfing';
import { cardsPanel } from './cardsPanel';
import { AudioMgr } from '../tool/AudioMgr';

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

    @property(Node)
    butNode:Node = null;

    @property(Node)
    blockNode:Node = null;

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

    async endTurnButton(){
        this.blockNode.active = true;
        this.butNode.active = false;
        await this.checkRemianHandCards(this._mHero.remainCardsAbility);
        this._mHero.heroEndTurn();
    }

    showTurnButton(){
        this.blockNode.active = false;
        this.butNode.active = true;
    }

    checkRemianHandCards(_num:number){
        return new Promise<void>((resolve)=>{
            let _len:number = this._handCardsArray.length
            if(_len > _num){
                let surplus = _len - _num;
                for (let i = 0; i < surplus; i++) {
                    let _card:card = this.randomArray<card>(this._handCardsArray);
                    this.receiveCard(_card,false);
                }
                this.scheduleOnce(()=>{
                    resolve();
                },0.75)
            }else{
                resolve();
            }
        })
    }

    async drawStableCard(){
        for await (const _card of this._allCardsArray) {
            if (_card.getCardStableTag()) {
                this.removeItemFormArray<card>(_card,this._allCardsArray);
                this.leftNumLabel.string = this._allCardsArray.length.toString();
                AudioMgr.inst.playEffect('audio','card');
                await _card.moveToHandAnim();
                _card.node.parent = this.cardLayout.node;
                this._handCardsArray.push(_card);
                _card.setTouchable(true);
                this.refreshCardsArrangement();
            }
        }
    }

    drawCardsFromAll(drawNum:number){
        return new Promise<void>((resolve)=>{
            if (this._allCardsArray.length < drawNum) {
                this.discardPileBacktoAll();
            }
            let count:number = 0;
            let interval = 0.5;// 以秒为单位的时间间隔
            let repeat = drawNum-1;// 重复次数
            let delay = 0.5;// 开始延时
            this.schedule(()=>{
                count++;
                this.getTopOneCardToHand();
                if (count == drawNum) {
                    resolve();
                }
            }, interval, repeat, delay);
        })
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

    adjustAllCardsByHero(_cardType:cardType,_type:skillType,effectNum:number,muteDistanceCard:boolean=false){
        if (this._allCardsArray.length > 0) {
            this._allCardsArray.forEach(_crad => {
                if (_crad.getCardType() == _cardType) {
                    _crad.adjustCardByHero(_type,effectNum,muteDistanceCard);
                }
            });
        }
        if (this._handCardsArray.length > 0) {
            this._handCardsArray.forEach(_crad => {
                if (_crad.getCardType() == _cardType) {
                    _crad.adjustCardByHero(_type,effectNum,muteDistanceCard);
                }
            });
        }
        if (this._discardArray.length > 0) {
            this._discardArray.forEach(_crad => {
                if (_crad.getCardType() == _cardType) {
                    _crad.adjustCardByHero(_type,effectNum,muteDistanceCard);
                }
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
        AudioMgr.inst.playEffect('audio','card');
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
        if (!card.isOneoff) {
            this._discardArray.push(card);
        }
        if (isEnforce) {
            card.cardSkills.forEach((_skill)=>{
                this.enforceCardBySkill(card,_skill);
            })
            if (card.isOneoff) {
                //删除一次性效果卡牌不进入discard
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
        AudioMgr.inst.playEffect('audio','discardBtn');
        this.dpp.active = true;
    }

    enforceCardBySkill(_card:card,skill:effectObj){
        switch (skill.kType) {
            case skillType.ATTACK:
                this._mHero.doHeroAtk(_card,skill);
                break;
            case skillType.DEFEND:
                this._mHero.addEffectToCreature(skill);
                break;
            case skillType.REVIVE:
                this._mHero.addHpFun(skill.effNum);
                break;
            case skillType.DRAWCARD:
                this._mHero.drawCardsByCard(skill.effNum);
                break;
            case skillType.EFFECT_ATK:
                this._mHero.addEffectToCreature(skill);
                break;  
            case skillType.MOVE:
                this._mHero.doHeroMove(skill.effNum);
                break;
            case skillType.STUN:
                this._mHero.addEffectToMonster(skill);
                break;
            case skillType.LOAD:
                this._mHero.addEffectToCreature(skill);
                break;
            case skillType.TANGLE:
                this._mHero.addEffectToMonster(skill);
                break; 
            case skillType.POISON:
                this._mHero.addEffectToMonster(skill);
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

