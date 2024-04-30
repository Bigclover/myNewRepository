import { _decorator, Component, instantiate, Label, Node, Prefab } from 'cc';
import { monInfo } from './gameConfing';
import { Skill } from './Skill';
const { ccclass, property } = _decorator;

@ccclass('monsterInfoUi')
export class monsterInfoUi extends Component {
    @property(Label)
    nameLable:Label = null;

    @property(Label)
    levelLabel:Label = null;

    @property(Label)
    speedLabel:Label = null;

    @property(Label)
    moveLabel:Label = null;

    @property(Node)
    skillLayout:Node = null;

    @property(Prefab)
    skillPre:Prefab = null;

    private monsterInfo:monInfo = null;

    init(_info:monInfo){
        this.monsterInfo = _info;
    }

    start() {
        this.nameLable.string = this.monsterInfo.name;
        this.levelLabel.string = "级别:"+this.monsterInfo.level;
        this.speedLabel.string = "速度:"+this.monsterInfo.speed;
        this.moveLabel.string = "移动力:"+this.monsterInfo.move;
        this.setSkillInfo();
    }

    setSkillInfo(){
        this.monsterInfo.skills.forEach((_skill)=>{
            let skill = instantiate(this.skillPre);
            skill.getComponent(Skill).init(_skill,true);
            this.skillLayout.addChild(skill);
        })
    }

    update(deltaTime: number) {
        
    }
}

