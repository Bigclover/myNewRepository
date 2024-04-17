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

    init(type:skillType,num:number){
        this.skillType = type;
        this.skillNum = num;
    }

    setSkillNum(num:number){
        this.skillNum = num;
        this.numLabel.string = this.skillNum.toString();
    }

    setMaterialFun(mData:Material){
        this.numLabel.customMaterial = mData;
        this.typeSprite.customMaterial = mData;
    }
    
    start() {
        this.numLabel.string = this.skillNum.toString();
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
            default:
                _patch = 'atk';
                break;
        }
        _patch = `img/cardType/${_patch}/spriteFrame`;
        return _patch;
    }

    update(deltaTime: number) {
        
    }
}

