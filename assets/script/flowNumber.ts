import { _decorator, Animation, AnimationState, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('flowNumber')
export class flowNumber extends Component {
    @property(Animation)
    flowAnim:Animation = null;

    @property(Label)
    numLabel:Label = null;

    private _num:number = 0;

    protected onLoad(): void {
        this.flowAnim.on(Animation.EventType.FINISHED,this.onFinished,this); 
    }

    init(num:number){
        this._num = num;
    }

    start() {
        let numstr:string = this._num.toString();
        if (this._num < 0 ) {
            numstr = ':'+Math.abs(this._num)
        }
        this.numLabel.string = numstr;
    }

    onFinished(type: Animation.EventType, state: AnimationState) {
          this.node.destroy();
    }

    protected onDestroy(): void {
        this.flowAnim.off(Animation.EventType.FINISHED,this.onFinished,this); 
    }
}

