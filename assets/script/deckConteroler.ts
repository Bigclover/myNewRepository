import { _decorator, Component, instantiate, Label, Layout, Node, Prefab } from 'cc';
import { card } from './card';
import  deckData, { deckObj }  from './deckData';
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
    }

    endTurnButton(){
        this._mHero.heroEndTurn();
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
        // this._allCardsArray = [...this._discardArray];
        // this._discardArray = [];
        let length:number = this._discardArray.length;
        for (let i = 0; i < length; i++) {
            let ind = length - 1 - i;
            this._discardArray[ind].node.parent= this.allDeckNode;
            this._allCardsArray.push(this._discardArray.pop()); 
        }
        this._allCardsArray;
        this._discardArray;
        this.leftNumLabel.string = this._allCardsArray.length.toString();
        this.showDiscardNum();
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

        // topCard.node.removeFromParent();
        // this.cardLayout.node.addChild(topCard.node);
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

    async receiveCard(card:card){
        this.enforceCardByType(card);
        await card.moveToDiscardPile();
        card.node.removeFromParent();
        // card.node.parent = this.discardNode.getChildByName('cacheCards');
        card.reSetSelf();
        
        this._discardArray.push(card);
        this.showDiscardNum();

        this.refreshCardsArrangement();
    }

    showDiscardNum(){
        //弃牌显示
        let counterLabel:Label = this.discardNode.getChildByName('counter').getComponent(Label);
        counterLabel.string = this._discardArray.length.toString();
    }

    enforceCardByType(card:card){
        switch (card.cardType) {
            case 0:
                this._mHero.doHeroAtk(card.cardNum);
                break;
            case 1:
                this._mHero.addDefFun(card.cardNum);
                break;
            case 2:
                
                break;
            default:
                
                break;
        }
    }

    update(deltaTime: number) {
        
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

    deepCopy(obj1) {
		var obj2 = Array.isArray(obj1) ? [] : {};
		if (obj1 && typeof obj1 === "object") {
		  for (var i in obj1) {
			var prop = obj1[i]; // 避免相互引用造成死循环，如obj1.a=obj
			if (prop == obj1) {
			  continue;
			}
			if (obj1.hasOwnProperty(i)) {
			  // 如果子属性为引用数据类型，递归复制
			  if (prop && typeof prop === "object") {
				obj2[i] = (prop.constructor === Array) ? [] : {};
				arguments.callee(prop, obj2[i]); // 递归调用
			  } else {
				// 如果是基本数据类型，只是简单的复制
				obj2[i] = prop;
			  }
			}
		  }
		}
		return obj2;
	  }
}

