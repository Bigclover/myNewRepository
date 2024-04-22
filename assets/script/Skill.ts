import { _decorator, Component, Label, Material, Node, resources, Sprite, SpriteFrame } from 'cc';
import { skillType } from './gameConfing';
const { ccclass, property } = _decorator;

@ccclass('Skill')
export class Skill extends Component {
    @property(Label)
    numLabel:Label = null;

    @property(Sprite)
    typeSprite:Sprite = null;

    public skillType:skillType=0;
    public skillNum:number = 0;
    private _mute:boolean = false;

    init(type:skillType,num:number,mute:boolean=false){
        this.skillType = type;
        this.skillNum = num;
        this._mute = mute;
    }

    setSkillNum(num:number){
        this.skillNum = num;
        let numStr:string =''
        if (this.skillNum >= 0) {
            numStr = this.skillNum.toString();
        } else {
            numStr = ':'+this.skillNum.toString();
        }
        this.numLabel.string = numStr;
    }

    setMaterialFun(mData:Material){
        this.numLabel.customMaterial = mData;
        this.typeSprite.customMaterial = mData;
    }
    
    start() {
        let numStr:string =''
        if (this.skillNum >= 0) {
            numStr = this.skillNum.toString();
        } else {
            numStr = ':'+this.skillNum.toString();
        }
        this.numLabel.string = numStr;
        let typePatch:string = this.getImgPatchByType(this.skillType);
        resources.load(typePatch, SpriteFrame, (err, spriteFrame) => {
            this.typeSprite.spriteFrame = spriteFrame;
            // this.typeSprite.spriteFrame.addRef();
        });
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

