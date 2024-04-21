import { _decorator, Component, Label, Node, resources, Sprite, SpriteFrame } from 'cc';
import { effectObj, skillType } from './gameConfing';
const { ccclass, property } = _decorator;

@ccclass('stateEffect')
export class stateEffect extends Component {
    @property(Sprite)
    imgSprite:Sprite = null;

    @property(Label)
    numLabel:Label = null;

    private stateType:skillType;
    private stateNum:number = 0;

    init(_ktype:skillType,effNum:number){
        this.stateType = _ktype;
        this.stateNum = effNum;
    }

    start() {
        this.setNumLabel();
        let typePatch:string = this.getImgPatchByType(this.stateType);
        resources.load(typePatch, SpriteFrame, (err, spriteFrame) => {
            this.imgSprite.spriteFrame = spriteFrame;
        });
    }

    getStateType():skillType{
        return this.stateType;
    }

    setNumLabel(){
        let numStr:string =''
        if (this.stateNum >= 0) {
            numStr = this.stateNum.toString();
        } else {
            numStr = ':'+this.stateNum.toString();
        }
        this.numLabel.string = numStr;
    }

    updateStateNum(num:number){
        this.stateNum = num;
        if (this.stateNum <= 0) {
            this.cancelStateEffect();
        } else {
            this.setNumLabel();
        }
    }

    cancelStateEffect(){
        this.node.removeFromParent();
        this.node.destroy();
    }

    getImgPatchByType(type:number):string{
        let _patch:string = '';
        switch (type) {
            case skillType.ATTACK:
                _patch = 'atk';
                break;
            case skillType.DEFEND:
                _patch = 'def';
                break;
            case skillType.REVIVE:
                _patch = 'life';
                break;
            case skillType.DRAWCARD:
                _patch = 'draw';
                break;
            case skillType.EFFECT_ATK:
                _patch = 'efAtk';
                break;
            case skillType.MOVE:
                _patch = 'move';
                break;
            case skillType.STUN:
                _patch = 'stun';
                break;
            case skillType.LOAD:
                _patch = 'load';
                break;      
            default:
                _patch = 'atk';
                break;
        }
        _patch = `img/skillType/${_patch}/spriteFrame`;
        return _patch;
    }

    update(deltaTime: number) {
        
    }
}

