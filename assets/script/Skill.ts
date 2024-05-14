import { _decorator, Component, Label, Material, Node, resources, Sprite, SpriteFrame } from 'cc';
import { effectObj, gameConfing, skillType } from './gameConfing';
const { ccclass, property } = _decorator;

@ccclass('Skill')
export class Skill extends Component {
    @property(Label)
    numLabel:Label = null;

    @property(Sprite)
    typeSprite:Sprite = null;

    @property(Label)
    rangeLabel:Label = null;

    private skill:effectObj = null;
    private _isShowRange:boolean = false;

    init(_skill:effectObj,range:boolean=false){
        this.skill = _skill;
        this._isShowRange = range;
    }

    getSkill():effectObj{
        return this.skill;
    }

    setSkillNum(num:number){
        this.skill.effNum = num;
        let numStr:string =''
        if (this.skill.effNum >= 0) {
            numStr = this.skill.effNum.toString();
        } else {
            numStr = ':'+this.skill.effNum.toString();
        }
        this.numLabel.string = numStr;
    }

    setMaterialFun(mData:Material){
        this.numLabel.customMaterial = mData;
        this.typeSprite.customMaterial = mData;
    }
    
    start() {
        let numStr:string =''
        if (this.skill.effNum >= 0) {
            numStr = this.skill.effNum.toString();
        }else if (this.skill.effNum === -1) {
            numStr = this.skill.turns.toString();
        }else {
            numStr = ':'+this.skill.effNum.toString();
        }
        if (this._isShowRange && this.skill.kType == skillType.ATTACK) {
            this.rangeLabel.node.active = true;
            this.rangeLabel.string = "("+this.skill.range+")";
        }
        this.numLabel.string = numStr;
        let typePatch:string = gameConfing.instance.getImgPatchByType(this.skill.kType);
        resources.load(typePatch, SpriteFrame, (err, spriteFrame) => {
            this.typeSprite.spriteFrame = spriteFrame;
            // this.typeSprite.spriteFrame.addRef();
        });
    }

    update(deltaTime: number) {
        
    }
}

