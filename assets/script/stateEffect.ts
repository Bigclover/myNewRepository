import { _decorator, Component, Label, Node, resources, Sprite, SpriteFrame } from 'cc';
import { gameConfing, skillType, stateObj } from './gameConfing';
import { creature } from './creature';
const { ccclass, property } = _decorator;

@ccclass('stateEffect')
export class stateEffect extends Component {
    @property(Sprite)
    imgSprite:Sprite = null;

    @property(Label)
    numLabel:Label = null;

    private stateType:skillType;
    private stateNum:number = 0;
    private isEffective:boolean = false;
    private persistTurns:number = 0;
    private beginRound:number = 0;
    private creature:creature = null;


    init(stateData:stateObj,_creature:creature){
        this.stateType = stateData.sType;
        this.stateNum = stateData.stateNum;
        this.isEffective = stateData.isEffective;
        this.persistTurns = stateData.persistTurns;
        this.beginRound = stateData.beginRound;

        this.creature = _creature;
    }

    start() {
        this.setNumLabel();
        let typePatch:string = gameConfing.instance.getImgPatchByType(this.stateType);
        resources.load(typePatch, SpriteFrame, (err, spriteFrame) => {
            this.imgSprite.spriteFrame = spriteFrame;
        });
    }

    checkEffectState(_round:number):boolean{
        let passRound = _round - this.beginRound;
        if (passRound > this.persistTurns) {
            this.isEffective = false;
            this.cancelStateEffect();
        }else{
            if (this.getStateType() == skillType.STUN 
                ||this.getStateType() == skillType.TANGLE) {
                this.turnsTypeCheckRound(passRound);
            }
        }
        return this.isEffective;
    }

    turnsTypeCheckRound(pass:number){ 
        this.stateNum = this.persistTurns - pass;
        console.log('this.stateNum=',this.stateNum)
        this.setNumLabel();
    }

    dealWithChange(_change:number):number{
        this.stateNum += _change;
        if (this.stateNum <= 0) {
            this.cancelStateEffect();
        } else {
            this.setNumLabel();
        }
        return this.stateNum;
    }

    getStateNum():number{
        return this.stateNum;
    }

    getStateType():skillType{
        return this.stateType;
    }

    setNumLabel(){
        this.numLabel.string = this.stateNum.toString();
    }

    // updateStateNum(num:number){
    //     this.stateNum = num;
    //     if (this.stateNum <= 0) {
    //         this.cancelStateEffect();
    //     } else {
    //         this.setNumLabel();
    //     }
    // }

    cancelStateEffect(){
        console.log('cancel state Type:'+this.stateType+"num:"+this.stateNum);
        this.creature.removeStateFromStateEffectArray(this);
        this.node.removeFromParent();
        this.node.destroy();
    }

    update(deltaTime: number) {
        
    }
}

